"use client";

import React, { useState, useEffect, useMemo, useRef, Suspense } from "react";
import "./book.css";
import { useRouter, useSearchParams } from "next/navigation";
import { repairService } from "../../../../../../services/repairs";
import { deviceService } from "../../../../../../services/devices";
import { addressService } from "../../../../../../services/address";
import { authService } from "../../../../../../services/auth";
import TecNurxLoader from "@/components/TecNurxLoader";
import PrintableReceipt from "@/components/PrintableReceipt";
import Link from "next/link";
import { toast } from "@/components/CustomToast";
import { Check, X, Plus, AlertTriangle, Search, ChevronDown } from "lucide-react";

// High-level common issue chips matching Image 2
const ISSUE_CATEGORIES = [
  { id: "screen", label: "Screen", category: "cracked_screen", estimateLabel: "screen", fullLabel: "Screen replacement" },
  { id: "battery", label: "Battery", category: "battery_draining", estimateLabel: "battery", fullLabel: "Battery replacement" },
  { id: "charging", label: "Charging port", category: "charging_port_damaged", estimateLabel: "charging port", fullLabel: "Charging port repair" },
  { id: "back_glass", label: "Back glass", category: "back_glass_broken", estimateLabel: "back glass", fullLabel: "Back glass replacement" },
  { id: "camera", label: "Camera", category: "rear_camera_fault", estimateLabel: "camera", fullLabel: "Camera repair" },
  { id: "water", label: "Water damage", category: "water_damage", estimateLabel: "water damage", fullLabel: "Water damage treatment" },
  { id: "not_sure", label: "Not sure", category: "diagnostic_assessment", estimateLabel: "diagnostic inspection", fullLabel: "Diagnostic assessment" },
];

const DIAGNOSTIC_FEE = 5000;
const LOGISTICS_FEE_PICKUP = 5000;
const LOGISTICS_FEE_DROPOFF = 0;

// Format device name safely
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

// Format device condition safely
const formatDeviceCondition = (condition) => {
  if (!condition) return "UK used";
  const c = condition.toLowerCase();
  if (c === "uk_used" || c === "uk used") return "UK used";
  if (c === "bought_new" || c === "new") return "Bought new";
  if (c === "used_in_nigeria" || c === "local") return "Used in Nigeria";
  if (c === "excellent") return "Excellent condition";
  if (c === "good") return "Good condition";
  if (c === "fair") return "Fair condition";
  if (c === "poor") return "Poor condition";
  return condition;
};

// Format device status pill
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

// Format address line 1
const formatAddressLine1 = (addr) => {
  if (!addr) return "No address selected";
  if (typeof addr === "string") return addr;
  return addr.streetAddress || addr.formattedAddress?.split(",")[0] || "Selected address";
};

// Format address subtext (Area, State)
const formatAddressSub = (addr) => {
  if (!addr) return "";
  if (typeof addr === "string") return "";
  const city = addr.city || "";
  const state = addr.state || "";
  return [city, state].filter(Boolean).join(", ");
};

function BookRepairContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Step state: 1 (Device), 2 (Problem), 3 (Handover), 4 (Review), 5 (Confirmed)
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Data states
  const [devices, setDevices] = useState([]);
  const [addresses, setAddresses] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [issueOptions, setIssueOptions] = useState(ISSUE_CATEGORIES);
  const [serviceOfferings, setServiceOfferings] = useState([]);

  // Step 1: Device Selection
  const [selectedDevice, setSelectedDevice] = useState(null);
  const [showAllDevices, setShowAllDevices] = useState(false);

  // Step 2: Problem Selection
  const [selectedIssue, setSelectedIssue] = useState(ISSUE_CATEGORIES[0]);
  const [partQuality, setPartQuality] = useState("original"); // "original" | "aftermarket"
  const [issueDropdownOpen, setIssueDropdownOpen] = useState(false);
  const [issueSearchQuery, setIssueSearchQuery] = useState("");
  const issueDropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (issueDropdownRef.current && !issueDropdownRef.current.contains(e.target)) {
        setIssueDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredIssues = useMemo(() => {
    const q = issueSearchQuery.trim().toLowerCase();
    if (!q) return issueOptions;
    return issueOptions.filter(
      (cat) =>
        (cat.label || "").toLowerCase().includes(q) ||
        (cat.category || "").toLowerCase().includes(q)
    );
  }, [issueOptions, issueSearchQuery]);

  // Step 3: Handover Details
  const [handoverMethod, setHandoverMethod] = useState("pickup"); // "pickup" | "dropoff"
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [selectedDayIndex, setSelectedDayIndex] = useState(2); // default second day as in Figma
  const [selectedTimeSlot, setSelectedTimeSlot] = useState("Afternoon (12pm - 4pm)");
  const [contactName, setContactName] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [returnMethod, setReturnMethod] = useState("delivery"); // "delivery" | "collection"

  // Step 4: Agreement & created draft reuse
  const [isAgreed, setIsAgreed] = useState(false);
  const [createdDraftId, setCreatedDraftId] = useState(null);

  // Step 5: Confirmed Booking Details
  const [confirmedRepair, setConfirmedRepair] = useState(null);

  // Add Address Modal state
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [newStreet, setNewStreet] = useState("");
  const [newCity, setNewCity] = useState("Ikeja");
  const [newState, setNewState] = useState("Lagos");
  const [isSavingAddress, setIsSavingAddress] = useState(false);

  // Fetch initial data
  useEffect(() => {
    const initData = async () => {
      try {
        setLoading(true);

        // Check if pre-confirmed via query param
        const confirmedId = searchParams?.get("confirmedId");
        if (confirmedId) {
          try {
            const repRes = await repairService.getRepairDetails(confirmedId);
            const repData = repRes?.data?.repair || repRes?.repair || repRes?.data;
            if (repData) {
              setConfirmedRepair(repData);
              setStep(5);
              setLoading(false);
              return;
            }
          } catch {
            // fallback to default flow
          }
        }

        const [devRes, addrRes, userRes, issuesRes] = await Promise.allSettled([
          deviceService.getAllUserDevices(),
          addressService.getUserAddresses(),
          authService.getCurrentUser(),
          repairService.getIssues(),
        ]);

        if (issuesRes.status === "fulfilled") {
          const rawIssues =
            issuesRes.value?.data?.issueTypes ||
            issuesRes.value?.issueTypes ||
            issuesRes.value?.data?.issues ||
            issuesRes.value?.issues ||
            issuesRes.value?.data ||
            [];
          if (Array.isArray(rawIssues) && rawIssues.length > 0) {
            const activeIssues = rawIssues
              .filter((it) => typeof it === "string" || it.isActive !== false)
              .sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0));
            const mapped = activeIssues.map((it) => {
              if (typeof it === "string") {
                return {
                  id: it,
                  label: it.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
                  category: it,
                  estimateLabel: it.replace(/_/g, " "),
                  fullLabel: it.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
                };
              }
              const key = it.code || it.issueType || it.category || it.key || it.id || "other";
              const name = it.name || it.issueName || it.label || key.replace(/_/g, " ");
              return {
                id: key,
                label: name,
                category: key,
                estimateLabel: name.toLowerCase(),
                fullLabel: name,
              };
            });
            setIssueOptions(mapped);
            setSelectedIssue(mapped[0]);
          }
        }

        let devList = [];
        if (devRes.status === "fulfilled") {
          devList = devRes.value?.data?.devices || devRes.value?.devices || [];
          setDevices(devList);
          const queryDevId = searchParams?.get("deviceId");
          if (queryDevId) {
            const matched = devList.find((d) => (d._id || d.id) === queryDevId);
            if (matched) setSelectedDevice(matched);
            else if (devList.length > 0) setSelectedDevice(devList[0]);
          } else if (devList.length > 0) {
            setSelectedDevice(devList[0]);
          }
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
  }, [searchParams]);

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

  // Selected Day String
  const selectedDayText = useMemo(() => {
    const selectedPickup = pickupDays.find((d) => d.index === selectedDayIndex);
    if (selectedPickup) {
      return `${selectedPickup.dayName} ${selectedPickup.dayNum}`;
    }
    return "Tomorrow";
  }, [pickupDays, selectedDayIndex]);

  // Fetch live service offerings when selectedDevice changes
  useEffect(() => {
    if (!selectedDevice) return;
    let cancelled = false;
    const fetchOfferings = async () => {
      try {
        const res = await repairService.getServiceOfferings({
          deviceType: selectedDevice.deviceType || selectedDevice.type,
          brand: selectedDevice.brand,
          isActive: true,
          limit: 20,
        });
        const list =
          res?.data?.serviceOfferings ||
          res?.serviceOfferings ||
          [];
        if (!cancelled && Array.isArray(list)) {
          setServiceOfferings(list);
        }
      } catch (err) {
        console.warn("Could not fetch service offerings:", err);
      }
    };
    fetchOfferings();
    return () => {
      cancelled = true;
    };
  }, [selectedDevice]);

  // Dynamic estimate ranges (uses live serviceOfferings pricing when available)
  const estimateRange = useMemo(() => {
    if (selectedIssue.id === "not_sure" || selectedIssue.category === "diagnostic_assessment") {
      return { low: "Free", high: "Inspection", display: "₦0 (Free Diagnosis)" };
    }

    if (serviceOfferings.length > 0 && selectedDevice) {
      const devModel = (selectedDevice.model || "").toLowerCase();
      const matchedOffering =
        serviceOfferings.find(
          (o) => devModel && (o.model || "").toLowerCase() === devModel
        ) || serviceOfferings[0];

      const matchedService = matchedOffering?.services?.find(
        (s) =>
          s.isAvailable !== false &&
          (s.issueType === selectedIssue.category ||
            (s.issueName || "").toLowerCase() === (selectedIssue.label || "").toLowerCase())
      );

      if (matchedService?.pricing) {
        const price =
          matchedService.pricing.discountedPrice > 0
            ? matchedService.pricing.discountedPrice
            : matchedService.pricing.basePrice;
        if (price > 0) {
          const formatted = `₦${Number(price).toLocaleString()}`;
          return { low: formatted, high: formatted, display: formatted };
        }
      }
    }

    if (partQuality === "aftermarket") {
      return { low: "15,000", high: "25,000", display: "₦15,000 – ₦25,000" };
    }
    return { low: "35,000", high: "50,000", display: "₦35,000 – ₦50,000" };
  }, [selectedIssue, partQuality, serviceOfferings, selectedDevice]);

  // Fee preview from backend
  const [previewCharge, setPreviewCharge] = useState(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [addressServiceability, setAddressServiceability] = useState({});

  useEffect(() => {
    if (step < 3) return;
    const needsAddress = handoverMethod === "pickup" || returnMethod === "delivery";
    const addrId = selectedAddress?._id || selectedAddress?.id;
    if (needsAddress && !addrId) return;

    let cancelled = false;
    const fetchPreview = async () => {
      try {
        setPreviewLoading(true);
        const res = await repairService.previewBookingCharges({
          paymentOption: "pay_after_quote",
          handoverType: handoverMethod === "pickup" ? "pickup" : "office_dropoff",
          returnMethod,
          addressId: needsAddress ? addrId : undefined,
          deviceId: selectedDevice?._id || selectedDevice?.id,
          issueCategory: selectedIssue?.category,
        });
        if (!cancelled) {
          const data = res?.data || res;
          setPreviewCharge(data);
          if (handoverMethod === "pickup" && addrId && typeof data?.serviceable === "boolean") {
            setAddressServiceability((prev) => ({
              ...prev,
              [addrId]: {
                serviceable: data.serviceable,
                zoneLabel: data.zoneLabel || null,
              },
            }));
          }
        }
      } catch (err) {
        console.warn("Could not preview booking charges:", err);
      } finally {
        if (!cancelled) setPreviewLoading(false);
      }
    };

    fetchPreview();
    return () => {
      cancelled = true;
    };
  }, [step, handoverMethod, returnMethod, selectedAddress, selectedDevice, selectedIssue]);

  // Fee calculations
  const logisticsFee =
    previewCharge?.serviceable === true
      ? Number(previewCharge.deliveryFee || 0) + Number(previewCharge.returnFee || 0)
      : handoverMethod === "pickup"
      ? LOGISTICS_FEE_PICKUP
      : LOGISTICS_FEE_DROPOFF;
  const effectiveDiagnosticFee =
    previewCharge?.serviceable === true
      ? Number(previewCharge.diagnosticFee ?? DIAGNOSTIC_FEE)
      : DIAGNOSTIC_FEE;
  const totalDueAtBooking =
    previewCharge?.serviceable === true
      ? Number(previewCharge.total ?? effectiveDiagnosticFee + logisticsFee)
      : effectiveDiagnosticFee + logisticsFee;

  // Save new address handler
  const handleSaveAddress = async (e) => {
    e.preventDefault();
    if (!newStreet.trim()) {
      toast.error("Please enter a street address.");
      return;
    }
    setIsSavingAddress(true);
    try {
      const payload = {
        streetAddress: newStreet.trim(),
        city: newCity.trim() || "Ikeja",
        state: newState.trim() || "Lagos",
        country: "Nigeria",
        formattedAddress: `${newStreet.trim()}, ${newCity.trim()}, ${newState.trim()}, Nigeria`,
      };
      let created = null;
      try {
        const res = await addressService.createAddress(payload);
        created = res?.data?.address || res?.address || res?.data;
      } catch {
        // Fallback for local preview if backend unavailable
        created = {
          _id: `addr_${Date.now()}`,
          ...payload,
        };
      }
      if (created) {
        setAddresses((prev) => [created, ...prev]);
        setSelectedAddress(created);
        toast.success("Address added and selected!");
        setShowAddressModal(false);
        setNewStreet("");
      }
    } catch (err) {
      toast.error(err.message || "Failed to add address");
    } finally {
      setIsSavingAddress(false);
    }
  };

  // Submit booking & continue to confirmation screen
  const handleSubmitBooking = async () => {
    if (!selectedDevice) {
      toast.error("Please select a device to repair.");
      setStep(1);
      return;
    }
    if (handoverMethod === "pickup" && !selectedAddress) {
      toast.error("Please select a pickup address.");
      setStep(3);
      return;
    }
    if (!isAgreed) {
      toast.error("Please confirm device ownership and agree to the handover.");
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = new FormData();
      payload.append("deviceId", selectedDevice._id || selectedDevice.id);
      payload.append("issueCategory", selectedIssue.category);
      payload.append("paymentOption", "pay_after_quote");
      payload.append("partQuality", partQuality);
      const slotEnum = selectedTimeSlot.toLowerCase().includes("morning")
        ? "morning"
        : selectedTimeSlot.toLowerCase().includes("evening")
        ? "evening"
        : "afternoon";

      payload.append(
        "handoverType",
        handoverMethod === "pickup" ? "pickup" : "office_dropoff"
      );
      payload.append("returnMethod", returnMethod);
      payload.append("timeWindow", slotEnum);
      payload.append("contactName", contactName);
      payload.append("contactPhone", contactPhone);
      payload.append(
        "issueDescription",
        `${selectedIssue.fullLabel}. Part quality: ${partQuality.toUpperCase()}. Handover: ${handoverMethod.toUpperCase()}. Return: ${returnMethod.toUpperCase()}. Contact: ${contactName} (${contactPhone}).`
      );
      payload.append(
        "serviceType",
        handoverMethod === "pickup" ? "pickup_repair" : "workshop_repair"
      );
      if (handoverMethod === "pickup" && selectedAddress) {
        payload.append(
          "pickupAddressId",
          selectedAddress._id || selectedAddress.id
        );
      }
      payload.append("preferredTimeSlot", slotEnum);

      let createdId = createdDraftId;
      let bookData = null;

      if (!createdId) {
        const res = await repairService.bookRepair(payload);
        bookData = res?.data || res;
        createdId =
          bookData?.repairId || bookData?.repair?._id || bookData?._id || "3EA19933";
        setCreatedDraftId(createdId);
      }

      if (!bookData || bookData?.nextAction === "booking_payment") {
        try {
          const payRes = await repairService.initiateBookingPayment(createdId);
          const payData = payRes?.data || payRes;
          if (payData?.paymentLink) {
            if (typeof window !== "undefined") {
              sessionStorage.setItem("pending_booking_repair_id", createdId);
              localStorage.setItem("pending_booking_repair_id", createdId);
              if (payData.reference) {
                sessionStorage.setItem("pending_booking_reference", payData.reference);
                localStorage.setItem("pending_booking_reference", payData.reference);
                localStorage.setItem(`draft_ref_${createdId}`, payData.reference);
              }
              window.location.href = payData.paymentLink;
              return;
            }
          }
        } catch (payErr) {
          console.error("Booking payment initiation error:", payErr);
          toast.error(
            payErr?.response?.data?.message ||
              "Draft saved, but payment could not be started. You can resume from Repairs."
          );
          router.push("/dashboard/repairs");
          return;
        }
      }

      const confirmedObj = {
        _id: createdId,
        id: createdId,
        displayId: createdId.length > 8 ? createdId.slice(-8).toUpperCase() : createdId.toUpperCase(),
        device: selectedDevice,
        issueLabel: selectedIssue.fullLabel,
        partQuality,
        handoverMethod,
        returnMethod,
        selectedDayText,
        selectedTimeSlot,
        addressText:
          handoverMethod === "pickup"
            ? formatAddressLine1(selectedAddress)
            : "21 Kodesho Street, Computer Village, Lagos",
        contactName,
        contactPhone,
        diagnosticFee: effectiveDiagnosticFee,
        logisticsFee,
        totalPaid: totalDueAtBooking,
        reference: `TNX-REC-${Math.floor(100000 + Math.random() * 900000)}`,
        paidThrough: "Bank78",
      };

      setConfirmedRepair(confirmedObj);
      toast.success("Booking confirmed!");
      setStep(5);

      // Update URL silently so breadcrumb reflects 'Repairs / Booking confirmed'
      if (typeof window !== "undefined") {
        window.history.pushState(
          null,
          "",
          `/dashboard/repairs/book?confirmed=true&confirmedId=${createdId}`
        );
      }
    } catch (err) {
      console.error("Booking error:", err);
      toast.error(err.response?.data?.message || err.message || "Failed to book repair.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return <TecNurxLoader minHeight="65vh" size="lg" />;
  }

  /* =========================================================================
     SCREEN 5: BOOKING CONFIRMED (Figma Image 5)
     ========================================================================= */
  if (step === 5 && confirmedRepair) {
    const dispId =
      confirmedRepair.displayId ||
      (confirmedRepair._id ? confirmedRepair._id.slice(-8).toUpperCase() : "3EA19933");
    const devName = formatDeviceName(confirmedRepair.device);
    const probName = confirmedRepair.issueLabel || "Screen replacement";

    return (
      <div className="book-repair-page">
        <div className="tnx-screen-only">
          {/* Top Success Banner Card */}
          <div className="confirmed-hero-card">
          <div className="confirmed-check-box">
            <Check size={28} strokeWidth={3.5} color="#000000" />
          </div>
          <h1 className="confirmed-title">Booking confirmed</h1>
          <p className="confirmed-subtitle">
            Repair #{dispId} · {devName} · {probName}
          </p>
          <div className="confirmed-actions-row">
            <button
              type="button"
              className="btn-confirmed-view"
              onClick={() => router.push(`/dashboard/repairs/${confirmedRepair._id || confirmedRepair.id || "3EA19933"}`)}
            >
              View repair
            </button>
            <button
              type="button"
              className="btn-confirmed-receipt"
              onClick={() => window.print()}
            >
              Download receipt
            </button>
          </div>
        </div>

        {/* Bottom 2-Column Cards Grid */}
        <div className="confirmed-bottom-grid">
          {/* Left Card: Payment Receipt */}
          <div className="book-card confirmed-receipt-card">
            <h2 className="book-card-title">Payment receipt</h2>

            <div className="receipt-rows-list">
              <div className="receipt-row">
                <span className="receipt-label">Diagnostic fee</span>
                <span className="receipt-val">
                  ₦{(confirmedRepair.diagnosticFee ?? effectiveDiagnosticFee).toLocaleString()}
                </span>
              </div>
              <div className="receipt-row">
                <span className="receipt-label">Logistics fee (pickup)</span>
                <span className="receipt-val">
                  {confirmedRepair.logisticsFee === 0 ? "₦0 (Drop-off)" : `₦${confirmedRepair.logisticsFee.toLocaleString()}`}
                </span>
              </div>

              <div className="receipt-divider" />

              <div className="receipt-row total">
                <span className="receipt-label-total">Total paid</span>
                <span className="receipt-val-total">₦{confirmedRepair.totalPaid.toLocaleString()}</span>
              </div>

              <div className="receipt-row">
                <span className="receipt-label">Paid through</span>
                <span className="receipt-val">{confirmedRepair.paidThrough || "Bank78"}</span>
              </div>

              <div className="receipt-row">
                <span className="receipt-label">Reference</span>
                <span className="receipt-val">{confirmedRepair.reference || "TNX-REC-94821"}</span>
              </div>
            </div>
          </div>

          {/* Right Card: What Happens Next */}
          <div className="book-card confirmed-next-card">
            <h2 className="book-card-title">What happens next</h2>
            <div className="how-it-works-list">
              <div className="how-step-item">
                <div className="how-step-num">1</div>
                <div className="how-step-text">
                  <h4>Hand over your device</h4>
                  <p>
                    {confirmedRepair.handoverMethod === "pickup"
                      ? `Pickup on ${confirmedRepair.selectedDayText}, ${confirmedRepair.selectedTimeSlot}.`
                      : "Drop off at 21 Kodesho Street, Computer Village, Lagos."}
                  </p>
                </div>
              </div>

              <div className="how-step-item">
                <div className="how-step-num">2</div>
                <div className="how-step-text">
                  <h4>Diagnosis and quote</h4>
                  <p>You get the repair cost to approve.</p>
                </div>
              </div>

              <div className="how-step-item">
                <div className="how-step-num">3</div>
                <div className="how-step-text">
                  <h4>Repair and return</h4>
                  <p>We keep you updated at every step.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        </div>

        <PrintableReceipt
          title="Booking Receipt"
          reference={confirmedRepair.reference || `TNX-REC-${dispId}`}
          date={new Date().toLocaleDateString()}
          status="Confirmed"
          totalAmount={confirmedRepair.totalPaid}
          leftDetails={[
            { label: "Repair ID", value: `#${dispId}` },
            { label: "Device", value: devName },
            { label: "Issue", value: probName },
            {
              label: "Handover",
              value:
                confirmedRepair.handoverMethod === "pickup"
                  ? "Pickup & Return"
                  : "Drop-off",
            },
          ]}
          rightDetails={[
            {
              label: "Reference",
              value: confirmedRepair.reference || `TNX-REC-${dispId}`,
            },
            { label: "Paid Through", value: confirmedRepair.paidThrough || "Bank78" },
            { label: "Contact", value: confirmedRepair.contactName || "—" },
          ]}
          lineItems={[
            {
              label: "Diagnostic Fee",
              amount: confirmedRepair.diagnosticFee ?? effectiveDiagnosticFee,
            },
            {
              label:
                confirmedRepair.logisticsFee === 0
                  ? "Logistics Fee (Drop-off)"
                  : "Logistics Fee (Pickup)",
              amount: confirmedRepair.logisticsFee ?? 0,
            },
          ]}
        />
      </div>
    );
  }

  /* =========================================================================
     MAIN 4-STEP BOOKING FLOW (Figma Images 1, 2, 3, 4)
     ========================================================================= */
  return (
    <div className="book-repair-page">
      {/* Page Header */}
      <div className="book-header">
        <h1 className="book-title">Book a repair</h1>
        <p className="book-step-sub">
          {step === 1 && "Step 1 of 4: choose the device to repair."}
          {step === 2 && "Step 2 of 4: tell us what is wrong."}
          {step === 3 && "Step 3 of 4: choose how to hand over your device."}
          {step === 4 && "Step 4 of 4: check everything, then continue to payment."}
        </p>
      </div>

      {/* 4-Step Stepper Progress Bar (Figma specification) */}
      <div className="book-stepper-row">
        {[
          { num: 1, label: "1 Device" },
          { num: 2, label: "2 Problem" },
          { num: 3, label: "3 Handover" },
          { num: 4, label: "4 Review" },
        ].map((s) => {
          let barClass = "";
          let labelClass = "";
          if (step > s.num) {
            barClass = "completed"; // Solid black
            labelClass = "completed";
          } else if (step === s.num) {
            barClass = "active"; // Brand yellow #ffc400
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
          {/* =================== STEP 1: CHOOSE DEVICE (Image 1) =================== */}
          {step === 1 && (
            <div>
              <h2 className="book-card-title">Which device needs fixing?</h2>

              <div className="selection-list">
                {devices.length > 0 ? (
                  (showAllDevices ? devices : devices.slice(0, 3)).map((dev) => {
                    const isSelected =
                      (selectedDevice?._id || selectedDevice?.id) ===
                      (dev._id || dev.id);
                    const pillInfo = getStatusPill(
                      dev.verificationStatus || dev.status
                    );
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
                          <h3 className="selection-item-name">
                            {formatDeviceName(dev)}
                          </h3>
                          <div className="selection-pill-row">
                            <span className={`status-badge-pill ${pillInfo.className}`}>
                              <span className="dot">●</span>
                              {pillInfo.label}
                            </span>
                          </div>
                          <p className="selection-item-sub">
                            {formatDeviceCondition(dev.condition || dev.notes)}
                          </p>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="selection-empty-notice">
                    <p>No devices registered yet. Click &ldquo;Add a new device&rdquo; below to register your device.</p>
                  </div>
                )}

                {devices.length > 5 && (
                  <button
                    type="button"
                    onClick={() => setShowAllDevices((prev) => !prev)}
                    style={{
                      appearance: "none",
                      background: "#ffffff",
                      border: "1.5px solid #e5e7eb",
                      borderRadius: "14px",
                      padding: "11px 16px",
                      fontSize: "13.5px",
                      fontWeight: 600,
                      color: "#111827",
                      cursor: "pointer",
                      width: "100%",
                      textAlign: "center",
                    }}
                  >
                    {showAllDevices ? "Show fewer devices" : `View all (${devices.length})`}
                  </button>
                )}

                {/* Add a new device card */}
                <div
                  className="add-new-btn-card"
                  onClick={() => router.push("/dashboard/devices/add")}
                >
                  <div className="add-plus-box">
                    <Plus size={18} strokeWidth={2.5} />
                  </div>
                  <div className="add-card-text">
                    <h4>Add a new device</h4>
                    <p>Register it, then book the repair.</p>
                  </div>
                </div>
              </div>

              {/* Bottom Actions */}
              <div className="form-actions-row">
                <button
                  type="button"
                  className="btn-form-cancel"
                  onClick={() => router.push("/dashboard/repairs")}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn-form-continue"
                  disabled={!selectedDevice}
                  onClick={() => setStep(2)}
                >
                  Continue
                </button>
              </div>
            </div>
          )}

          {/* =================== STEP 2: PROBLEM SELECTION (Image 2) =================== */}
          {step === 2 && (
            <div>
              {/* Yellow Device Badge Pill at Top */}
              <div className="device-header-pill">
                <span className="dot">●</span>
                <span>
                  Phone · {selectedDevice?.brand || "Apple"} · {formatDeviceName(selectedDevice)}
                </span>
              </div>

              {/* What is wrong? (Searchable Dropdown) */}
              <h3 className="problem-section-title">What is wrong?</h3>
              <div
                ref={issueDropdownRef}
                style={{ position: "relative", marginBottom: "24px" }}
              >
                <button
                  type="button"
                  onClick={() => setIssueDropdownOpen((prev) => !prev)}
                  style={{
                    width: "100%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: "12px",
                    padding: "14px 16px",
                    borderRadius: "16px",
                    border: issueDropdownOpen
                      ? "1.5px solid #111827"
                      : "1.5px solid #e5e7eb",
                    backgroundColor: "#ffffff",
                    fontSize: "14.5px",
                    fontWeight: 600,
                    color: "#111827",
                    cursor: "pointer",
                    textAlign: "left",
                    fontFamily: "inherit",
                  }}
                >
                  <span>{selectedIssue?.label || "Select an issue"}</span>
                  <ChevronDown
                    size={18}
                    color="#64748b"
                    style={{
                      transform: issueDropdownOpen ? "rotate(180deg)" : "rotate(0deg)",
                      transition: "transform 0.15s ease",
                      flexShrink: 0,
                    }}
                  />
                </button>

                {issueDropdownOpen && (
                  <div
                    style={{
                      position: "absolute",
                      top: "calc(100% + 8px)",
                      left: 0,
                      right: 0,
                      zIndex: 40,
                      backgroundColor: "#ffffff",
                      border: "1px solid #e5e7eb",
                      borderRadius: "18px",
                      boxShadow: "0 12px 28px rgba(0, 0, 0, 0.1)",
                      overflow: "hidden",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                        padding: "12px 14px",
                        borderBottom: "1px solid #f1f5f9",
                        backgroundColor: "#f8fafc",
                      }}
                    >
                      <Search size={16} color="#64748b" />
                      <input
                        type="text"
                        value={issueSearchQuery}
                        onChange={(e) => setIssueSearchQuery(e.target.value)}
                        placeholder="Search issue (e.g. screen, battery, camera)..."
                        autoFocus
                        style={{
                          width: "100%",
                          border: "none",
                          outline: "none",
                          background: "transparent",
                          fontSize: "14px",
                          color: "#111827",
                          fontFamily: "inherit",
                        }}
                      />
                      {issueSearchQuery && (
                        <button
                          type="button"
                          onClick={() => setIssueSearchQuery("")}
                          style={{
                            border: "none",
                            background: "transparent",
                            cursor: "pointer",
                            padding: "2px",
                            color: "#64748b",
                          }}
                        >
                          <X size={14} />
                        </button>
                      )}
                    </div>

                    <div style={{ maxHeight: "260px", overflowY: "auto", padding: "6px" }}>
                      {filteredIssues.length > 0 ? (
                        filteredIssues.map((cat) => {
                          const isCatSelected = selectedIssue?.id === cat.id;
                          return (
                            <button
                              key={cat.id}
                              type="button"
                              onClick={() => {
                                setSelectedIssue(cat);
                                setIssueDropdownOpen(false);
                                setIssueSearchQuery("");
                              }}
                              style={{
                                width: "100%",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                                gap: "10px",
                                padding: "11px 12px",
                                borderRadius: "12px",
                                border: "none",
                                backgroundColor: isCatSelected ? "#fefce8" : "transparent",
                                color: "#111827",
                                fontSize: "14px",
                                fontWeight: isCatSelected ? 700 : 500,
                                cursor: "pointer",
                                textAlign: "left",
                                fontFamily: "inherit",
                              }}
                            >
                              <span>{cat.label}</span>
                              {isCatSelected && <Check size={16} color="#ca8a04" />}
                            </button>
                          );
                        })
                      ) : (
                        <div
                          style={{
                            padding: "18px 12px",
                            textAlign: "center",
                            fontSize: "13.5px",
                            color: "#64748b",
                          }}
                        >
                          No matching issues found
                        </div>
                      )}
                    </div>
                  </div>
                )}
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
                    <p className="selection-item-sub">Same-day turnaround · 90 days warranty</p>
                  </div>
                </div>
              </div>

              {/* Bottom Actions */}
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

          {/* =================== STEP 3: HANDOVER (Image 3) =================== */}
          {step === 3 && (
            <div>
              {/* How will you hand over your device? */}
              <h3 className="problem-section-title">How will you hand over your device?</h3>
              <div className="selection-list">
                <div
                  className={`selection-card ${handoverMethod === "pickup" ? "selected" : ""}`}
                  onClick={() => setHandoverMethod("pickup")}
                >
                  <div className="custom-radio">
                    {handoverMethod === "pickup" && <div className="radio-inner-dot" />}
                  </div>
                  <div className="selection-card-content">
                    <h4 className="selection-item-name">We pick it up</h4>
                    <p className="selection-item-sub">
                      A rider collects it from your address. A logistics fee applies.
                    </p>
                  </div>
                </div>

                <div
                  className={`selection-card ${handoverMethod === "dropoff" ? "selected" : ""}`}
                  onClick={() => setHandoverMethod("dropoff")}
                >
                  <div className="custom-radio">
                    {handoverMethod === "dropoff" && <div className="radio-inner-dot" />}
                  </div>
                  <div className="selection-card-content">
                    <h4 className="selection-item-name">I will bring it to your office</h4>
                    <p className="selection-item-sub">
                      Drop it off at 21 Kodesho Street, Computer Village, Lagos State. No logistics fee.
                    </p>
                  </div>
                </div>
              </div>

              {/* Pickup Address section (Only if pickup chosen) */}
              {handoverMethod === "pickup" && (
                <>
                  <h3 className="problem-section-title">Pickup address</h3>
                  <div className="selection-list">
                    {addresses.length > 0 ? (
                      addresses.map((addr) => {
                        const addrId = addr._id || addr.id;
                        const isAddrSelected =
                          (selectedAddress?._id || selectedAddress?.id) === addrId;
                        const addrStatus = addressServiceability[addrId];
                        return (
                          <div
                            key={addrId}
                            className={`selection-card ${isAddrSelected ? "selected" : ""}`}
                            onClick={() => setSelectedAddress(addr)}
                          >
                            <div className="custom-radio">
                              {isAddrSelected && <div className="radio-inner-dot" />}
                            </div>
                            <div className="selection-card-content">
                              <h4 className="selection-item-name">
                                {formatAddressLine1(addr)}
                              </h4>
                              {(isAddrSelected && previewLoading) || addrStatus ? (
                                <div className="selection-pill-row">
                                  {isAddrSelected && previewLoading ? (
                                    <span className="status-badge-pill pill-pending">
                                      <span className="dot">●</span>
                                      Checking availability...
                                    </span>
                                  ) : addrStatus?.serviceable === true ? (
                                    <span className="status-badge-pill pill-verified">
                                      <span className="dot">●</span>
                                      Pickup available
                                      {addrStatus.zoneLabel
                                        ? ` · ${addrStatus.zoneLabel}`
                                        : ""}
                                    </span>
                                  ) : addrStatus?.serviceable === false ? (
                                    <span
                                      className="status-badge-pill"
                                      style={{
                                        background: "#fef2f2",
                                        color: "#b91c1c",
                                      }}
                                    >
                                      <span
                                        className="dot"
                                        style={{ color: "#ef4444" }}
                                      >
                                        ●
                                      </span>
                                      Pickup unavailable
                                    </span>
                                  ) : null}
                                </div>
                              ) : null}
                              <p className="selection-item-sub">
                                {formatAddressSub(addr)}
                              </p>
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <div className="selection-empty-notice">
                        <p>No pickup address saved yet. Click &ldquo;Add a new address&rdquo; below to add one.</p>
                      </div>
                    )}

                    {/* Add a new address card */}
                    <div
                      className="add-new-btn-card"
                      onClick={() => setShowAddressModal(true)}
                    >
                      <div className="add-plus-box">
                        <Plus size={18} strokeWidth={2.5} />
                      </div>
                      <div className="add-card-text">
                        <h4>Add a new address</h4>
                        <p>We will check that we can collect from there.</p>
                      </div>
                    </div>
                  </div>

                  {/* Unserviceable address warning banner */}
                  {previewCharge?.serviceable === false && (
                    <div
                      style={{
                        marginTop: "14px",
                        padding: "14px 18px",
                        borderRadius: "16px",
                        backgroundColor: "#fef2f2",
                        border: "1px solid #fecaca",
                        display: "flex",
                        alignItems: "flex-start",
                        justifyContent: "space-between",
                        gap: "12px",
                        flexWrap: "wrap",
                      }}
                    >
                      <div style={{ display: "flex", gap: "10px", alignItems: "flex-start", flex: 1 }}>
                        <AlertTriangle size={18} color="#b91c1c" style={{ marginTop: "2px", flexShrink: 0 }} />
                        <div>
                          <div style={{ fontSize: "14px", fontWeight: 700, color: "#991b1b", marginBottom: "2px" }}>
                            Pickup is not available for this address
                          </div>
                          <div style={{ fontSize: "13px", color: "#b91c1c", lineHeight: 1.4 }}>
                            {previewCharge.reason || "This address is outside our pickup coverage area."}
                          </div>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setHandoverMethod("dropoff");
                          setReturnMethod("collection");
                        }}
                        style={{
                          background: "#111827",
                          color: "#ffffff",
                          border: "none",
                          borderRadius: "9999px",
                          padding: "8px 16px",
                          fontSize: "12.5px",
                          fontWeight: 600,
                          cursor: "pointer",
                          whiteSpace: "nowrap",
                        }}
                      >
                        Switch to drop-off
                      </button>
                    </div>
                  )}

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

                  {/* Contact on the Day */}
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
                </>
              )}

              {/* How would you like it back? */}
              <h3 className="problem-section-title" style={{ marginTop: "24px" }}>
                How would you like it back?
              </h3>
              <div className="selection-list">
                <div
                  className={`selection-card ${returnMethod === "delivery" ? "selected" : ""}`}
                  onClick={() => setReturnMethod("delivery")}
                >
                  <div className="custom-radio">
                    {returnMethod === "delivery" && <div className="radio-inner-dot" />}
                  </div>
                  <div className="selection-card-content">
                    <h4 className="selection-item-name">Deliver it to me</h4>
                    <p className="selection-item-sub">
                      A delivery fee may apply: ₦{Number(previewCharge?.returnFee ?? 2500).toLocaleString()}.
                    </p>
                  </div>
                </div>

                <div
                  className={`selection-card ${returnMethod === "collection" ? "selected" : ""}`}
                  onClick={() => setReturnMethod("collection")}
                >
                  <div className="custom-radio">
                    {returnMethod === "collection" && <div className="radio-inner-dot" />}
                  </div>
                  <div className="selection-card-content">
                    <h4 className="selection-item-name">I will collect it</h4>
                    <p className="selection-item-sub">
                      From our office when the repair is done.
                    </p>
                  </div>
                </div>
              </div>

              {/* Bottom Actions */}
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
                  disabled={previewCharge?.serviceable === false}
                  onClick={() => setStep(4)}
                >
                  Continue
                </button>
              </div>
            </div>
          )}

          {/* =================== STEP 4: REVIEW & PAYMENT (Image 4) =================== */}
          {step === 4 && (
            <div>
              <h2 className="book-card-title">Your request</h2>

              <div className="review-table">
                <div className="review-row">
                  <span className="review-label">Device</span>
                  <span className="review-val">
                    {formatDeviceName(selectedDevice)} · {formatDeviceCondition(selectedDevice?.condition || selectedDevice?.notes)}
                  </span>
                </div>

                <div className="review-row">
                  <span className="review-label">Problem</span>
                  <span className="review-val">{selectedIssue.fullLabel}</span>
                </div>

                <div className="review-row">
                  <span className="review-label">Part quality</span>
                  <span className="review-val">
                    {partQuality === "original"
                      ? "Original quality (estimate)"
                      : "Aftermarket (estimate)"}
                  </span>
                </div>

                <div className="review-row">
                  <span className="review-label">Handover</span>
                  <span className="review-val">
                    {handoverMethod === "pickup"
                      ? `We pick it up · ${selectedDayText}, ${selectedTimeSlot}`
                      : "Drop off at 21 Kodesho Street, Computer Village"}
                  </span>
                </div>

                <div className="review-row">
                  <span className="review-label">Address</span>
                  <span className="review-val">
                    {handoverMethod === "pickup"
                      ? formatAddressLine1(selectedAddress)
                      : "21 Kodesho Street, Computer Village, Lagos"}
                  </span>
                </div>

                <div className="review-row">
                  <span className="review-label">Return</span>
                  <span className="review-val">
                    {returnMethod === "delivery" ? "Delivered to you" : "Office collection"}
                  </span>
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
                <span>I confirm I own this device and agree to the handover</span>
              </label>

              {/* Bottom Actions */}
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
                  disabled={!isAgreed || isSubmitting}
                >
                  {isSubmitting ? "Processing payment..." : "Continue to payment"}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Contextual Cards per Step */}
        <div className="book-side-col">
          {/* ================= Right Card: Step 1 ================= */}
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

          {/* ================= Right Card: Step 2 ================= */}
          {step === 2 && (
            <div className="side-card">
              <h3 className="side-card-title">Your estimate</h3>
              <div className="estimate-price-banner">{estimateRange.display}</div>
              <p className="estimate-sub-note">
                {partQuality === "original" ? "Original quality" : "Aftermarket"}{" "}
                {selectedIssue.estimateLabel}. The final quote is sent after your
                engineer diagnoses the device.
              </p>
              <div className="estimate-info-box">
                <span className="icon">✓</span>
                <span>
                  Not sure what is wrong? Choose Not sure and book a diagnosis
                  instead.
                </span>
              </div>
            </div>
          )}

          {/* ================= Right Card: Step 3 ================= */}
          {step === 3 && (
            <div className="side-card">
              <h3 className="side-card-title">Fees at booking</h3>
              <div className="fees-table">
                <div className="fee-row">
                  <span className="fee-label">Diagnostic fee</span>
                  <span className="fee-val">₦{effectiveDiagnosticFee.toLocaleString()}</span>
                </div>
                <div className="fee-row">
                  <span className="fee-label">Logistics fee (pickup)</span>
                  <span className="fee-val">
                    {logisticsFee === 0 ? "₦0 (Free)" : `₦${logisticsFee.toLocaleString()}`}
                  </span>
                </div>

                <div className="fee-divider" />

                <div className="fee-row total">
                  <span className="fee-label-total">Total due at booking</span>
                  <span className="fee-val-total">₦{totalDueAtBooking.toLocaleString()}</span>
                </div>
              </div>

              <div className="estimate-info-box" style={{ marginTop: "20px" }}>
                <span className="icon">✓</span>
                <span>
                  The repair cost is quoted after diagnosis. You approve it
                  before any repair starts.
                </span>
              </div>
            </div>
          )}

          {/* ================= Right Cards: Step 4 ================= */}
          {step === 4 && (
            <>
              {/* Pay Now Card */}
              <div className="side-card">
                <h3 className="side-card-title">Pay now</h3>
                <div className="fees-table">
                  <div className="fee-row">
                    <span className="fee-label">Diagnostic fee</span>
                    <span className="fee-val">₦{effectiveDiagnosticFee.toLocaleString()}</span>
                  </div>
                  <div className="fee-row">
                    <span className="fee-label">Logistics fee (pickup)</span>
                    <span className="fee-val">
                      {logisticsFee === 0 ? "₦0 (Free)" : `₦${logisticsFee.toLocaleString()}`}
                    </span>
                  </div>

                  <div className="fee-divider" />

                  <div className="fee-row total">
                    <span className="fee-label-total">Total due now</span>
                    <span className="fee-val-total">₦{totalDueAtBooking.toLocaleString()}</span>
                  </div>
                </div>

                <div className="estimate-info-box" style={{ marginTop: "20px" }}>
                  <span className="icon">✓</span>
                  <span>
                    Charged for every repair booked. The repair cost is quoted
                    after diagnosis.
                  </span>
                </div>
              </div>

              {/* What Happens Next Card */}
              <div className="side-card">
                <h3 className="side-card-title">What happens next</h3>
                <div className="how-it-works-list">
                  <div className="how-step-item">
                    <div className="how-step-num">1</div>
                    <div className="how-step-text">
                      <h4>Pay the booking fees</h4>
                      <p>You go to our payment partner’s secure page.</p>
                    </div>
                  </div>

                  <div className="how-step-item">
                    <div className="how-step-num">2</div>
                    <div className="how-step-text">
                      <h4>Hand over your device</h4>
                      <p>Pickup or drop-off, as you chose.</p>
                    </div>
                  </div>

                  <div className="how-step-item">
                    <div className="how-step-num">3</div>
                    <div className="how-step-text">
                      <h4>Diagnosis and quote</h4>
                      <p>You approve the repair cost before work starts.</p>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Modal: Add New Address */}
      {showAddressModal && (
        <div className="book-modal-backdrop" onClick={() => setShowAddressModal(false)}>
          <div className="book-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="book-modal-head">
              <h3>Add a new address</h3>
              <button
                type="button"
                className="btn-modal-close"
                onClick={() => setShowAddressModal(false)}
              >
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleSaveAddress}>
              <div className="modal-field">
                <label>Street Address *</label>
                <input
                  type="text"
                  placeholder="e.g. 70 Allen Avenue"
                  value={newStreet}
                  onChange={(e) => setNewStreet(e.target.value)}
                  required
                />
              </div>
              <div className="modal-row-2">
                <div className="modal-field">
                  <label>City / Area</label>
                  <input
                    type="text"
                    value={newCity}
                    onChange={(e) => setNewCity(e.target.value)}
                  />
                </div>
                <div className="modal-field">
                  <label>State</label>
                  <input
                    type="text"
                    value={newState}
                    onChange={(e) => setNewState(e.target.value)}
                  />
                </div>
              </div>
              <div className="modal-actions">
                <button
                  type="button"
                  className="btn-form-cancel"
                  onClick={() => setShowAddressModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-form-continue"
                  disabled={isSavingAddress}
                >
                  {isSavingAddress ? "Saving..." : "Save Address"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default function BookRepairPage() {
  return (
    <Suspense fallback={<TecNurxLoader minHeight="65vh" size="lg" />}>
      <BookRepairContent />
    </Suspense>
  );
}
