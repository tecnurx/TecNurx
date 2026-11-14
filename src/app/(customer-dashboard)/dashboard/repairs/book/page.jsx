"use client";

import React, { useState, useEffect, useMemo, Suspense } from "react";
import "./book.css";
import { useRouter, useSearchParams } from "next/navigation";
import { repairService } from "../../../../../../services/repairs";
import { deviceService } from "../../../../../../services/devices";
import { addressService } from "../../../../../../services/address";
import { authService } from "../../../../../../services/auth";
import Link from "next/link";
import { toast } from "@/components/CustomToast";

// High-level common issue chips matching Image 2
const ISSUE_CATEGORIES = [
  { id: "screen", label: "Screen", category: "cracked_screen" },
  { id: "battery", label: "Battery", category: "battery_draining" },
  { id: "charging", label: "Charging port", category: "charging_port_damaged" },
  { id: "back_glass", label: "Back glass", category: "back_glass_broken" },
  { id: "camera", label: "Camera", category: "rear_camera_fault" },
  { id: "water", label: "Water damage", category: "water_damage" },
  { id: "not_sure", label: "Not sure", category: "diagnostic_assessment" },
];

// Helper to format device name safely
const formatDeviceName = (device) => {
  if (!device) return "Device";
  if (typeof device === "string") return device;
  const brand = (device.brand || "").trim();
  const model = (device.model || "").trim();
  if (brand && model) {
    if (model.toLowerCase().startsWith(brand.toLowerCase())) return model;
    return `${brand} ${model}`;
  }
  return brand || model || "Device";
};

// Helper to format device condition
const formatDeviceCondition = (condition) => {
  if (!condition) return "Condition not specified";
  const c = condition.toLowerCase();
  if (c === "excellent") return "Excellent";
  if (c === "good") return "Good condition";
  if (c === "fair") return "Fair condition";
  if (c === "poor") return "Poor condition";
  if (c === "not_working") return "Not working";
  if (c === "uk_used" || c === "uk used") return "UK used";
  if (c === "bought_new" || c === "new") return "Bought new";
  if (c === "used_in_nigeria" || c === "local") return "Used in Nigeria";
  return condition;
};

// Helper to format status pill
const getStatusPill = (status) => {
  const s = (status || "").toLowerCase();
  if (s === "verified") {
    return { label: "Verified", className: "pill-verified" };
  }
  if (s.includes("review") || s.includes("further")) {
    return { label: "Further Review Required", className: "pill-review" };
  }
  return { label: "Pending Verification", className: "pill-pending" };
};

// Helper to format address
const formatAddressDisplay = (addr) => {
  if (!addr) return "70 Allen Ave, Allen, Ikeja 101233, Lagos, Nigeria";
  if (typeof addr === "string") return addr;
  if (addr.formattedAddress) return addr.formattedAddress;
  const parts = [addr.streetAddress, addr.city, addr.state, addr.country].filter(Boolean);
  return parts.length > 0 ? parts.join(", ") : "70 Allen Ave, Allen, Ikeja 101233, Lagos, Nigeria";
};

function BookRepairContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Data states
  const [devices, setDevices] = useState([]);
  const [addresses, setAddresses] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);

  // Step 1: Device Selection
  const [selectedDevice, setSelectedDevice] = useState(null);

  // Step 2: Problem Selection
  const [selectedIssue, setSelectedIssue] = useState(ISSUE_CATEGORIES[0]);
  const [partQuality, setPartQuality] = useState("original"); // "original" | "aftermarket"

  // Step 3: Pickup Details
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [selectedDayIndex, setSelectedDayIndex] = useState(1); // default tomorrow
  const [selectedTimeSlot, setSelectedTimeSlot] = useState("Afternoon (12pm - 4pm)");
  const [contactName, setContactName] = useState("");
  const [contactPhone, setContactPhone] = useState("");

  // Step 4: Review Agreement Checkbox
  const [isAgreed, setIsAgreed] = useState(true);

  // Fetch initial data
  useEffect(() => {
    const initData = async () => {
      try {
        setLoading(true);
        const [devRes, addrRes, userRes] = await Promise.allSettled([
          deviceService.getAllUserDevices(),
          addressService.getUserAddresses(),
          authService.getCurrentUser(),
        ]);

        let devList = [];
        if (devRes.status === "fulfilled") {
          devList = devRes.value?.data?.devices || devRes.value?.devices || [];
          setDevices(devList);
          if (devList.length > 0) setSelectedDevice(devList[0]);
        }

        let addrList = [];
        if (addrRes.status === "fulfilled") {
          addrList = addrRes.value?.data?.addresses || addrRes.value?.addresses || [];
          setAddresses(addrList);
          if (addrList.length > 0) setSelectedAddress(addrList[0]);
        }

        if (userRes.status === "fulfilled" && userRes.value) {
          const u = userRes.value;
          setCurrentUser(u);
          const fullName = [u.firstName || u.fname, u.lastName || u.lname].filter(Boolean).join(" ");
          setContactName(fullName || "Tobi O.");
          setContactPhone(u.phone || u.phoneNumber || "08012345678");
        }
      } catch (err) {
        console.warn("Could not load initial book repair data:", err);
      } finally {
        setLoading(false);
      }
    };

    initData();
  }, []);

  // Generate 5 selectable days starting from tomorrow
  const pickupDays = useMemo(() => {
    const days = [];
    const base = new Date();
    for (let i = 1; i <= 5; i++) {
      const d = new Date(base);
      d.setDate(base.getDate() + i);
      const dayNum = d.getDate();
      const dayName = d.toLocaleDateString("en-US", { weekday: "short" });
      days.push({ index: i, dayNum, dayName, fullDate: d });
    }
    return days;
  }, []);

  // Dynamic estimate ranges based on problem and quality
  const estimateRange = useMemo(() => {
    if (selectedIssue.id === "not_sure") {
      return { low: "Free", high: "Inspection", display: "₦0 (Free Diagnosis)" };
    }
    if (partQuality === "aftermarket") {
      return { low: 15000, high: 25000, display: "₦15,000 – ₦25,000" };
    }
    return { low: 35000, high: 50000, display: "₦35,000 – ₦50,000" };
  }, [selectedIssue, partQuality]);

  // Dynamic estimated return date (4 days after selected pickup)
  const estimatedReturnDate = useMemo(() => {
    const selectedPickup = pickupDays.find((d) => d.index === selectedDayIndex);
    if (selectedPickup?.fullDate) {
      const ret = new Date(selectedPickup.fullDate);
      ret.setDate(ret.getDate() + 4);
      return ret.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
    }
    return "Nov 21, 2026";
  }, [pickupDays, selectedDayIndex]);

  // Selected Day Label string
  const selectedDayText = useMemo(() => {
    const selectedPickup = pickupDays.find((d) => d.index === selectedDayIndex);
    if (selectedPickup) {
      return selectedDayIndex === 1
        ? `Tomorrow, ${selectedPickup.dayName} ${selectedPickup.dayNum}`
        : `${selectedPickup.dayName} ${selectedPickup.dayNum}`;
    }
    return "Tomorrow";
  }, [pickupDays, selectedDayIndex]);

  // Handle final submission
  const handleSubmitBooking = async () => {
    if (!selectedDevice) {
      toast.error("Please select a device to repair");
      setStep(1);
      return;
    }
    if (!selectedAddress) {
      toast.error("Please select a pickup address");
      setStep(3);
      return;
    }
    if (!isAgreed) {
      toast.error("Please agree to the pickup confirmation");
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = new FormData();
      payload.append("deviceId", selectedDevice._id || selectedDevice.id);
      payload.append("issueCategory", selectedIssue.category);
      payload.append(
        "issueDescription",
        `${selectedIssue.label}. Requested part quality: ${partQuality.toUpperCase()}. Contact: ${contactName} (${contactPhone}).`
      );
      payload.append("serviceType", "pickup_repair");
      payload.append("pickupAddressId", selectedAddress._id || selectedAddress.id);
      payload.append(
        "preferredTimeSlot",
        selectedTimeSlot.toLowerCase().includes("morning")
          ? "morning"
          : selectedTimeSlot.toLowerCase().includes("evening")
          ? "evening"
          : "afternoon"
      );

      const res = await repairService.bookRepair(payload);
      const newRepair = res?.data?.repair || res?.repair || res?.data;
      const createdId = newRepair?._id || newRepair?.id || "3EA19933";

      toast.success("Repair booked successfully!");

      // Navigate to the Pickup Scheduled screen (Image 6)
      router.push(`/dashboard/repairs/${createdId}/pickup`);
    } catch (err) {
      console.error("Booking error:", err);
      toast.error(err.response?.data?.message || err.message || "Failed to book repair.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="book-repair-page">
      {/* Page Header */}
      <div className="book-header">
        <h1 className="book-title">Book a repair</h1>
        <p className="book-step-sub">
          {step === 1 && "Step 1 of 4: choose the device to repair."}
          {step === 2 && "Step 2 of 4: tell us what is wrong."}
          {step === 3 && "Step 3 of 4: arrange the pickup."}
          {step === 4 && "Step 4 of 4: check everything, then submit."}
        </p>
      </div>

      {/* 4-Step Stepper Progress Bar */}
      <div className="book-stepper-row">
        {[
          { num: 1, label: "1 Device" },
          { num: 2, label: "2 Problem" },
          { num: 3, label: "3 Pickup" },
          { num: 4, label: "4 Review" },
        ].map((s) => {
          let barClass = "";
          let labelClass = "";
          if (step > s.num) {
            barClass = "completed";
            labelClass = "completed";
          } else if (step === s.num) {
            barClass = "active";
            labelClass = "active";
          }
          return (
            <div key={s.num} className="book-stepper-item">
              <div className={`stepper-bar ${barClass}`} />
              <span className={`stepper-label ${labelClass}`}>{s.label}</span>
            </div>
          );
        })}
      </div>

      {/* 2-Column Grid */}
      <div className="book-grid">
        {/* Left Column: Form Steps */}
        <div className="book-card">
          {/* STEP 1: CHOOSE DEVICE (Image 1) */}
          {step === 1 && (
            <div>
              <h2 className="book-card-title">Which device needs fixing?</h2>

              <div className="selection-list">
                {devices.length > 0 ? (
                  devices.map((dev) => {
                    const isSelected = (selectedDevice?._id || selectedDevice?.id) === (dev._id || dev.id);
                    const pillInfo = getStatusPill(dev.verificationStatus || dev.status);
                    return (
                      <div
                        key={dev._id || dev.id}
                        className={`selection-card ${isSelected ? "selected" : ""}`}
                        onClick={() => setSelectedDevice(dev)}
                      >
                        <div className="custom-radio">
                          {isSelected && <div className="radio-inner-dot" />}
                        </div>
                        <div className="selection-card-content">
                          <h3 className="selection-item-name">{formatDeviceName(dev)}</h3>
                          <div className="selection-pill-row">
                            <span className={`status-badge-pill ${pillInfo.className === "pill-verified" ? "success" : pillInfo.className === "pill-review" ? "warning" : "pending"}`}>
                              <span className="dot">●</span>
                              {pillInfo.label}
                            </span>
                          </div>
                          <p className="selection-item-sub">{formatDeviceCondition(dev.condition)}</p>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="selection-empty-notice" style={{ padding: "20px 0", color: "#64748b" }}>
                    <p style={{ margin: 0, fontSize: "14px" }}>
                      No devices registered yet. Add a device below to start your repair.
                    </p>
                  </div>
                )}

                {/* Add new device card */}
                <div
                  className="add-new-btn-card"
                  onClick={() => router.push("/dashboard/devices/add")}
                >
                  <div className="add-plus-circle">+</div>
                  <div className="add-card-text">
                    <h4>Add a new device</h4>
                    <p>Register it, then book the repair.</p>
                  </div>
                </div>
              </div>

              <div className="form-actions-row">
                <button
                  type="button"
                  className="btn-form-back"
                  onClick={() => router.push("/dashboard/repairs")}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn-form-continue"
                  onClick={() => setStep(2)}
                >
                  Continue
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: PROBLEM SELECTION (Image 2) */}
          {step === 2 && (
            <div>
              {/* Selected Device Badge */}
              <div className="device-header-pill">
                <span className="dot">●</span>
                <span>Phone · Apple · {formatDeviceName(selectedDevice)}</span>
              </div>

              {/* Problem Chips */}
              <h3 className="problem-section-title">What is wrong?</h3>
              <div className="category-pills-row">
                {ISSUE_CATEGORIES.map((cat) => {
                  const isCatSelected = selectedIssue.id === cat.id;
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      className={`category-chip ${isCatSelected ? "selected" : ""}`}
                      onClick={() => setSelectedIssue(cat)}
                    >
                      {cat.label}
                    </button>
                  );
                })}
              </div>

              {/* Part Quality Radio Options */}
              <h3 className="problem-section-title">Part quality</h3>
              <div className="selection-list">
                <div
                  className={`selection-card ${partQuality === "aftermarket" ? "selected" : ""}`}
                  onClick={() => setPartQuality("aftermarket")}
                >
                  <div className="custom-radio">
                    {partQuality === "aftermarket" && <div className="radio-inner-dot" />}
                  </div>
                  <div className="selection-card-content">
                    <h4 className="selection-item-name">Aftermarket</h4>
                    <p className="quality-price-tag">₦15,000 – ₦25,000</p>
                    <p className="selection-item-sub">1-2 days turnaround · 30 days warranty</p>
                  </div>
                </div>

                <div
                  className={`selection-card ${partQuality === "original" ? "selected" : ""}`}
                  onClick={() => setPartQuality("original")}
                >
                  <div className="custom-radio">
                    {partQuality === "original" && <div className="radio-inner-dot" />}
                  </div>
                  <div className="selection-card-content">
                    <h4 className="selection-item-name">Original quality</h4>
                    <p className="quality-price-tag">₦35,000 – ₦50,000</p>
                    <p className="selection-item-sub">Same-day turnaround · 90 days warranty</p>
                  </div>
                </div>
              </div>

              <div className="form-actions-row">
                <button
                  type="button"
                  className="btn-form-back"
                  onClick={() => setStep(1)}
                >
                  Back
                </button>
                <button
                  type="button"
                  className="btn-form-continue"
                  onClick={() => setStep(3)}
                >
                  Continue
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: ARRANGE PICKUP (Images 3 & 4) */}
          {step === 3 && (
            <div>
              <h2 className="book-card-title">Pickup address</h2>

              {/* Address Radio Selection */}
              <div className="selection-list">
                {addresses.length > 0 ? (
                  addresses.map((addr) => {
                    const isAddrSelected = (selectedAddress?._id || selectedAddress?.id) === (addr._id || addr.id);
                    return (
                      <div
                        key={addr._id || addr.id}
                        className={`selection-card ${isAddrSelected ? "selected" : ""}`}
                        onClick={() => setSelectedAddress(addr)}
                      >
                        <div className="custom-radio">
                          {isAddrSelected && <div className="radio-inner-dot" />}
                        </div>
                        <div className="selection-card-content">
                          <h4 className="selection-item-name">{addr.streetAddress || "70 Allen avenue"}</h4>
                          <div className="selection-pill-row">
                            <span className="status-badge-pill success">
                              <span className="dot">●</span>
                              Pickup available
                            </span>
                          </div>
                          <p className="selection-item-sub">{addr.city || "Ikeja"}, {addr.state || "Lagos"}</p>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div
                    className="selection-card selected"
                    onClick={() => setSelectedAddress({ formattedAddress: "70 Allen Ave, Allen, Ikeja 101233, Lagos, Nigeria" })}
                  >
                    <div className="custom-radio">
                      <div className="radio-inner-dot" />
                    </div>
                    <div className="selection-card-content">
                      <h4 className="selection-item-name">70 Allen Ave</h4>
                      <div className="selection-pill-row">
                        <span className="status-badge-pill success">
                          <span className="dot">●</span>
                          Pickup available
                        </span>
                      </div>
                      <p className="selection-item-sub">Ikeja, Lagos</p>
                    </div>
                  </div>
                )}

                <div
                  className="add-new-btn-card"
                  onClick={() => {
                    const newStreet = prompt("Enter pickup street address:", "70 Allen avenue");
                    if (newStreet) {
                      const newObj = {
                        _id: `temp_${Date.now()}`,
                        streetAddress: newStreet,
                        city: "Ikeja",
                        state: "Lagos",
                        formattedAddress: `${newStreet}, Ikeja, Lagos, Nigeria`,
                      };
                      setAddresses((prev) => [newObj, ...prev]);
                      setSelectedAddress(newObj);
                    }
                  }}
                >
                  <div className="add-plus-circle">+</div>
                  <div className="add-card-text">
                    <h4>Add a new address</h4>
                    <p>We will check that we can collect from there.</p>
                  </div>
                </div>
              </div>

              {/* Pickup Day Picker */}
              <h3 className="problem-section-title">Pickup day</h3>
              <div className="day-cards-row">
                {pickupDays.map((d) => {
                  const isDaySelected = selectedDayIndex === d.index;
                  return (
                    <div
                      key={d.index}
                      className={`day-picker-card ${isDaySelected ? "selected" : ""}`}
                      onClick={() => setSelectedDayIndex(d.index)}
                    >
                      <div className="day-number">{d.dayNum}</div>
                      <div className="day-name-sub">{d.dayName}</div>
                    </div>
                  );
                })}
              </div>

              {/* Time Window Picker */}
              <h3 className="problem-section-title">Time window</h3>
              <div className="time-window-row">
                {[
                  "Morning (9am - 12pm)",
                  "Afternoon (12pm - 4pm)",
                  "Evening (4pm - 7pm)",
                ].map((slot) => {
                  const isSlotSelected = selectedTimeSlot === slot;
                  return (
                    <button
                      key={slot}
                      type="button"
                      className={`time-slot-chip ${isSlotSelected ? "selected" : ""}`}
                      onClick={() => setSelectedTimeSlot(slot)}
                    >
                      {slot}
                    </button>
                  );
                })}
              </div>

              {/* Contact Inputs */}
              <h3 className="problem-section-title">Contact on the day</h3>
              <div className="input-group-row">
                <input
                  type="text"
                  className="contact-text-input"
                  placeholder="Full name"
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
                />
                <input
                  type="text"
                  className="contact-text-input"
                  placeholder="Phone number"
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value)}
                />
              </div>

              <div className="form-actions-row">
                <button
                  type="button"
                  className="btn-form-back"
                  onClick={() => setStep(2)}
                >
                  Back
                </button>
                <button
                  type="button"
                  className="btn-form-continue"
                  onClick={() => setStep(4)}
                >
                  Continue
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: REVIEW & SUBMIT (Image 5) */}
          {step === 4 && (
            <div>
              <h2 className="book-card-title">Your request</h2>

              <div className="review-table">
                <div className="review-row">
                  <span className="review-label">Device</span>
                  <span className="review-val">
                    {formatDeviceName(selectedDevice)} · {formatDeviceCondition(selectedDevice?.condition)}
                  </span>
                </div>

                <div className="review-row">
                  <span className="review-label">Problem</span>
                  <span className="review-val">{selectedIssue.label}</span>
                </div>

                <div className="review-row">
                  <span className="review-label">Part quality</span>
                  <span className="review-val">
                    {partQuality === "original" ? "Original quality" : "Aftermarket"}
                  </span>
                </div>

                <div className="review-row">
                  <span className="review-label">Pickup</span>
                  <span className="review-val">
                    {selectedDayText}, {selectedTimeSlot}
                  </span>
                </div>

                <div className="review-row">
                  <span className="review-label">Address</span>
                  <span className="review-val">{formatAddressDisplay(selectedAddress)}</span>
                </div>

                <div className="review-row">
                  <span className="review-label">Contact</span>
                  <span className="review-val">
                    {contactName} · {contactPhone}
                  </span>
                </div>
              </div>

              {/* Agreement Checkbox */}
              <label className="agreement-checkbox-row">
                <input
                  type="checkbox"
                  checked={isAgreed}
                  onChange={(e) => setIsAgreed(e.target.checked)}
                />
                <span>I confirm I own this device and agree to the pickup</span>
              </label>

              <div className="form-actions-row">
                <button
                  type="button"
                  className="btn-form-back"
                  onClick={() => setStep(3)}
                  disabled={isSubmitting}
                >
                  Back
                </button>
                <button
                  type="button"
                  className="btn-form-continue"
                  onClick={handleSubmitBooking}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Submitting..." : "Submit repair request"}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Contextual Cards per Step */}
        <div className="book-side-col">
          {/* Right Card for Step 1: How It Works */}
          {step === 1 && (
            <div className="side-card">
              <h3 className="side-card-title">How it works</h3>
              <div className="how-it-works-list">
                <div className="how-step-item">
                  <div className="how-step-num">1</div>
                  <div className="how-step-text">
                    <h4>Choose your device</h4>
                    <p>Pick one you have registered.</p>
                  </div>
                </div>

                <div className="how-step-item">
                  <div className="how-step-num">2</div>
                  <div className="how-step-text">
                    <h4>Describe the problem</h4>
                    <p>See an estimate before you commit.</p>
                  </div>
                </div>

                <div className="how-step-item">
                  <div className="how-step-num">3</div>
                  <div className="how-step-text">
                    <h4>Book a pickup</h4>
                    <p>Pick an address and a time.</p>
                  </div>
                </div>

                <div className="how-step-item">
                  <div className="how-step-num">4</div>
                  <div className="how-step-text">
                    <h4>Review and submit</h4>
                    <p>An engineer takes it from there.</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Right Card for Step 2: Your Estimate */}
          {step === 2 && (
            <div className="side-card">
              <h3 className="side-card-title">Your estimate</h3>
              <div className="estimate-price-banner">{estimateRange.display}</div>
              <p className="estimate-sub-note">
                {partQuality === "original" ? "Original quality" : "Aftermarket"} screen. The final quote is sent after your engineer diagnoses the device.
              </p>
              <div className="estimate-info-box">
                <span className="icon">✓</span>
                <span>Not sure what is wrong? Choose Not sure and book a diagnosis instead.</span>
              </div>
            </div>
          )}

          {/* Right Card for Step 3: Pickup Summary */}
          {step === 3 && (
            <div className="side-card">
              <h3 className="side-card-title">Pickup summary</h3>
              <div className="review-table">
                <div className="review-row">
                  <span className="review-label">Pickup fee</span>
                  <span className="review-val">Free</span>
                </div>
                <div className="review-row">
                  <span className="review-label">Estimated return</span>
                  <span className="review-val">{estimatedReturnDate}</span>
                </div>
              </div>
              <div className="estimate-info-box">
                <span className="icon">✓</span>
                <span>Pickup areas and fees depend on our logistics partner’s coverage.</span>
              </div>
            </div>
          )}

          {/* Right Cards for Step 4: Estimate & What Happens Next */}
          {step === 4 && (
            <>
              <div className="side-card">
                <h3 className="side-card-title">Estimate</h3>
                <div className="estimate-price-banner">{estimateRange.display}</div>
                <p className="estimate-sub-note">Final quote after diagnosis.</p>
              </div>

              <div className="side-card">
                <h3 className="side-card-title">What happens next</h3>
                <div className="how-it-works-list">
                  <div className="how-step-item">
                    <div className="how-step-num">1</div>
                    <div className="how-step-text">
                      <h4>Pickup</h4>
                      <p>Your device is collected.</p>
                    </div>
                  </div>

                  <div className="how-step-item">
                    <div className="how-step-num">2</div>
                    <div className="how-step-text">
                      <h4>Diagnosis</h4>
                      <p>An engineer sends you a quote.</p>
                    </div>
                  </div>

                  <div className="how-step-item">
                    <div className="how-step-num">3</div>
                    <div className="how-step-text">
                      <h4>You decide</h4>
                      <p>Approve and pay to start the repair.</p>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function BookRepairPage() {
  return (
    <Suspense fallback={<div style={{ padding: "40px", textAlign: "center" }}>Loading booking form...</div>}>
      <BookRepairContent />
    </Suspense>
  );
}
