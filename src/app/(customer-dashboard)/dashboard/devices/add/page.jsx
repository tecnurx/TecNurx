"use client";

import React, { useState, useRef } from "react";
import "./add-device.css";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Camera,
  Upload,
  Info,
  X,
  Check,
  FileText,
  Smartphone,
  Laptop,
  Tablet,
  Monitor,
  Package,
} from "lucide-react";
import { deviceService } from "../../../../../../services/devices";
import { toast } from "@/components/CustomToast";

const DEVICE_CATEGORIES = [
  { id: "phone", label: "Phone", icon: Smartphone },
  { id: "tablet", label: "Tablet", icon: Tablet },
  { id: "laptop", label: "Laptop", icon: Laptop },
  { id: "desktop", label: "Desktop", icon: Monitor },
  { id: "camera", label: "Camera", icon: Camera },
  { id: "other", label: "Other", icon: Package },
];

const POPULAR_BRANDS = {
  phone: ["Apple", "Samsung", "Google", "Xiaomi", "Tecno", "Infinix", "OnePlus", "Other"],
  tablet: ["Apple", "Samsung", "Lenovo", "Microsoft", "Other"],
  laptop: ["Apple", "HP", "Dell", "Lenovo", "Asus", "Acer", "Microsoft", "Other"],
  camera: ["Canon", "Sony", "Nikon", "Fujifilm", "Other"],
  desktop: ["Apple", "HP", "Dell", "Custom PC", "Other"],
  other: ["Sony", "Nintendo", "Other"],
};

const CONDITION_OPTIONS = [
  { key: "excellent", label: "Excellent" },
  { key: "good", label: "Good" },
  { key: "fair", label: "Fair" },
  { key: "poor", label: "Poor" },
  { key: "not_working", label: "Not working" },
];

const SOURCE_OPTIONS = [
  {
    key: "Bought new",
    title: "New, with a manufacturer warranty",
    sub: "Bought new from a store or official brand outlet",
  },
  {
    key: "UK used",
    title: "UK used (imported)",
    sub: "Direct foreign pre-owned device, no local warranty",
  },
  {
    key: "Used in Nigeria",
    title: "Used in Nigeria",
    sub: "Second-hand, bought locally within Nigeria",
  },
];

export default function AddDevicePage() {
  const router = useRouter();

  // Stepper State: 1 (Device Type) -> 2 (Identifiers & Details) -> 3 (Review)
  const [step, setStep] = useState(1);

  // Step 1: Device type, brand, and model (no defaults)
  const [deviceType, setDeviceType] = useState("");
  const [brand, setBrand] = useState("");
  const [model, setModel] = useState("");

  // Step 2: Identifiers & Details
  const [imei, setImei] = useState("");
  const [source, setSource] = useState("UK used"); // Sent as "notes"
  const [purchaseDate, setPurchaseDate] = useState(
    () => new Date().toISOString().split("T")[0]
  );
  // Conditions must be strictly: excellent, good, fair, poor, not_working
  const [condition, setCondition] = useState("good");

  // Step 2: Photos (4 slots)
  const [photos, setPhotos] = useState({
    front: null,
    back: null,
    screen_on: null,
    imei_screen: null,
  });

  const [photoPreviews, setPhotoPreviews] = useState({
    front: null,
    back: null,
    screen_on: null,
    imei_screen: null,
  });

  // Proof of ownership file
  const [receiptFile, setReceiptFile] = useState(null);

  // Submission state
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Hidden file input refs
  const photoInputRefs = {
    front: useRef(null),
    back: useRef(null),
    screen_on: useRef(null),
    imei_screen: useRef(null),
  };
  const receiptInputRef = useRef(null);

  // Photo handlers
  const handlePhotoSelect = (slot, file) => {
    if (!file) return;
    setPhotos((prev) => ({ ...prev, [slot]: file }));
    const url = URL.createObjectURL(file);
    setPhotoPreviews((prev) => ({ ...prev, [slot]: url }));
  };

  const handleRemovePhoto = (slot, e) => {
    e.stopPropagation();
    setPhotos((prev) => ({ ...prev, [slot]: null }));
    setPhotoPreviews((prev) => ({ ...prev, [slot]: null }));
  };

  // Receipt handlers
  const handleReceiptSelect = (file) => {
    if (!file) return;
    setReceiptFile(file);
  };

  const handleRemoveReceipt = (e) => {
    e.stopPropagation();
    setReceiptFile(null);
  };

  // Format device badge title
  const deviceTypeTitle = deviceType
    ? deviceType.charAt(0).toUpperCase() + deviceType.slice(1)
    : "";

  // Step 1 Validation -> proceed to Step 2
  const handleStep1Continue = (e) => {
    e.preventDefault();
    if (!deviceType?.trim()) {
      toast.error("Please select a device type.");
      return;
    }
    if (!brand?.trim()) {
      toast.error("Please select or enter the brand.");
      return;
    }
    if (!model?.trim()) {
      toast.error("Please enter the device model.");
      return;
    }
    setStep(2);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Step 2 Validation -> proceed to Step 3
  const handleStep2Continue = (e) => {
    e.preventDefault();
    if (!imei?.trim()) {
      toast.error("Please provide the IMEI or serial number.");
      return;
    }
    if (!purchaseDate?.trim()) {
      toast.error("Please provide the purchase date.");
      return;
    }
    if (!condition?.trim()) {
      toast.error("Please select the device condition.");
      return;
    }
    setStep(3);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Step 3 Submission -> Backend API
  const handleSubmitDevice = async () => {
    setIsSubmitting(true);
    try {
      const payload = new FormData();
      payload.append("deviceType", deviceType.toLowerCase().trim());
      payload.append("brand", brand.trim());
      payload.append("model", model.trim());
      payload.append("serialNumber", imei.trim());
      payload.append("purchaseDate", purchaseDate.trim());

      // Pure condition enum: excellent, good, fair, poor, not_working
      payload.append("condition", condition);

      // Where did you get it is sent strictly as notes
      if (source?.trim()) {
        payload.append("notes", source.trim());
      }

      // Attach photos if provided
      Object.entries(photos).forEach(([slot, file]) => {
        if (file) {
          payload.append("photos", file);
        }
      });

      // Attach receipt as purchaseReceipt matching backend schema
      if (receiptFile) {
        payload.append("purchaseReceipt", receiptFile);
      }

      const res = await deviceService.addDevice(payload);

      // Verify explicit success from backend
      if (
        res?.status === "fail" ||
        res?.status === "error" ||
        (res?.status && res.status !== "success")
      ) {
        toast.error(res?.message || "Failed to register device.");
        return;
      }

      toast.success("Device registered successfully!");
      router.push("/dashboard/devices");
    } catch (err) {
      console.error("API registration error:", err);
      const msg =
        err.response?.data?.message ||
        err.response?.data?.error ||
        err.message ||
        "Failed to register device. Please try again.";
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const photoCount = Object.values(photos).filter(Boolean).length;

  return (
    <div className="add-device-page">
      {/* Top Page Header */}
      <div className="add-device-header">
        <h1 className="add-device-title">Add a device</h1>
        <p className="add-device-subtitle">
          {step === 1 && "Step 1 of 3: specify the device you want to register."}
          {step === 2 && "Step 2 of 3: provide device identifiers and condition."}
          {step === 3 && "Step 3 of 3: review and confirm your device details."}
        </p>
      </div>

      {/* 3-Step Progress Stepper (Photos removed from step bar) */}
      <div className="add-device-stepper">
        <div className="stepper-progress-bars">
          <div
            className={`stepper-segment-bar ${
              step >= 2 ? "completed" : "active"
            }`}
          />
          <div
            className={`stepper-segment-bar ${
              step > 2 ? "completed" : step === 2 ? "active" : "upcoming"
            }`}
          />
          <div
            className={`stepper-segment-bar ${
              step === 3 ? "active" : "upcoming"
            }`}
          />
        </div>

        <div className="stepper-labels-row">
          <span className={`stepper-label-item ${step === 1 ? "active" : ""}`}>
            1 Device type
          </span>
          <span className={`stepper-label-item ${step === 2 ? "active" : ""}`}>
            2 Identifiers
          </span>
          <span className={`stepper-label-item ${step === 3 ? "active" : ""}`}>
            3 Review
          </span>
        </div>
      </div>

      {/* 2-Column Content Grid */}
      <div className="add-device-grid">
        {/* Left Column: Multi-Step Forms */}
        <div className="add-device-form-card">
          {/* ================= STEP 1: DEVICE TYPE, BRAND, MODEL ================= */}
          {step === 1 && (
            <>
              {/* Device Category Selection */}
              <div className="add-device-field">
                <label className="add-device-label">
                  Device category <span style={{ color: "#ef4444" }}>*</span>
                </label>
                <div className="device-category-grid">
                  {DEVICE_CATEGORIES.map(({ id, label, icon: IconComponent }) => (
                    <button
                      key={id}
                      type="button"
                      className={`device-category-card ${
                        deviceType === id ? "selected" : ""
                      }`}
                      onClick={() => {
                        setDeviceType(id);
                        if (!POPULAR_BRANDS[id]?.includes(brand)) {
                          setBrand("");
                        }
                      }}
                    >
                      <IconComponent
                        size={22}
                        className="device-category-icon"
                      />
                      <span className="device-category-title">{label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Brand Selection */}
              <div className="add-device-field">
                <label className="add-device-label">
                  Brand <span style={{ color: "#ef4444" }}>*</span>
                </label>
                {deviceType && POPULAR_BRANDS[deviceType] && (
                  <div
                    style={{
                      display: "flex",
                      flexWrap: "wrap",
                      gap: "8px",
                      marginBottom: "12px",
                    }}
                  >
                    {POPULAR_BRANDS[deviceType].map((b) => (
                      <button
                        key={b}
                        type="button"
                        className={`condition-pill-btn ${
                          brand.toLowerCase() === b.toLowerCase() ? "selected" : ""
                        }`}
                        onClick={() => setBrand(b === "Other" ? "" : b)}
                      >
                        {b}
                      </button>
                    ))}
                  </div>
                )}
                <input
                  type="text"
                  className="add-device-input"
                  placeholder="Select above or type brand name (e.g. Apple, Samsung, HP)"
                  value={brand}
                  onChange={(e) => setBrand(e.target.value)}
                  required
                />
              </div>

              {/* Model Input */}
              <div className="add-device-field">
                <label className="add-device-label">
                  Model <span style={{ color: "#ef4444" }}>*</span>
                </label>
                <input
                  type="text"
                  className="add-device-input"
                  placeholder="e.g. iPhone 15 Pro, Galaxy S24, MacBook Air M2"
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  required
                />
                <p className="add-device-hint">
                  Enter the specific model name or generation of your device.
                </p>
              </div>

              {/* Step 1 Actions */}
              <div className="add-device-actions-row">
                <Link href="/dashboard/devices" className="btn-back-outline">
                  Cancel
                </Link>

                <button
                  type="button"
                  className="btn-continue-primary"
                  onClick={handleStep1Continue}
                >
                  Continue
                </button>
              </div>
            </>
          )}

          {/* ================= STEP 2: IDENTIFIERS & DETAILS ================= */}
          {step === 2 && (
            <>
              {/* Selected Device Badge with Change Button */}
              <div className="device-selected-tag-container">
                <div className="device-selected-pill">
                  <span className="dot">●</span>
                  <span>
                    {deviceTypeTitle} · {brand} · {model}
                  </span>
                </div>
                <button
                  type="button"
                  className="btn-change-device"
                  onClick={() => setStep(1)}
                >
                  Change
                </button>
              </div>

              {/* Field 1: IMEI or serial number */}
              <div className="add-device-field">
                <label className="add-device-label" htmlFor="imei-field">
                  IMEI or serial number <span style={{ color: "#ef4444" }}>*</span>
                </label>
                <input
                  id="imei-field"
                  type="text"
                  className="add-device-input"
                  placeholder="15-digit IMEI or manufacturer serial number"
                  value={imei}
                  onChange={(e) => setImei(e.target.value)}
                  required
                />
                <p className="add-device-hint">
                  Dial *#06# on phones to display IMEI, or check the device back panel.
                </p>
              </div>

              {/* Field 2: Where did you get it? (Sent as notes) */}
              <div className="add-device-field">
                <label className="add-device-label">Where did you get it?</label>
                <div className="source-cards-list">
                  {SOURCE_OPTIONS.map((opt) => (
                    <div
                      key={opt.key}
                      className={`source-option-card ${
                        source === opt.key ? "selected" : ""
                      }`}
                      onClick={() => setSource(opt.key)}
                      role="button"
                      tabIndex={0}
                    >
                      <div className="source-radio-circle">
                        {source === opt.key && (
                          <div className="source-radio-dot" />
                        )}
                      </div>
                      <div className="source-option-content">
                        <h4 className="source-title">{opt.title}</h4>
                        <p className="source-sub">{opt.sub}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Field 3: Purchase Date */}
              <div className="add-device-field">
                <label className="add-device-label" htmlFor="purchase-date-input">
                  Purchase date <span style={{ color: "#ef4444" }}>*</span>
                </label>
                <input
                  id="purchase-date-input"
                  type="date"
                  className="add-device-input"
                  value={purchaseDate}
                  onChange={(e) => setPurchaseDate(e.target.value)}
                  required
                />
              </div>

              {/* Field 4: Condition (excellent, good, fair, poor, not_working) */}
              <div className="add-device-field">
                <label className="add-device-label">
                  Condition <span style={{ color: "#ef4444" }}>*</span>
                </label>
                <div className="condition-pills-row">
                  {CONDITION_OPTIONS.map((opt) => (
                    <button
                      key={opt.key}
                      type="button"
                      className={`condition-pill-btn ${
                        condition === opt.key ? "selected" : ""
                      }`}
                      onClick={() => setCondition(opt.key)}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Field 5: Photos (optional) */}
              <div className="add-device-field">
                <label className="add-device-label">Photos (Optional)</label>
                <div className="photos-upload-grid">
                  {[
                    { slot: "front", label: "Front" },
                    { slot: "back", label: "Back" },
                    { slot: "screen_on", label: "Screen on" },
                    { slot: "imei_screen", label: "IMEI screen" },
                  ].map(({ slot, label }) => {
                    const preview = photoPreviews[slot];
                    return (
                      <div
                        key={slot}
                        className="photo-slot-box"
                        onClick={() => photoInputRefs[slot]?.current?.click()}
                      >
                        <input
                          ref={photoInputRefs[slot]}
                          type="file"
                          accept="image/*"
                          style={{ display: "none" }}
                          onChange={(e) =>
                            handlePhotoSelect(slot, e.target.files?.[0])
                          }
                        />

                        {preview ? (
                          <>
                            <img
                              src={preview}
                              alt={label}
                              className="photo-slot-img"
                            />
                            <button
                              type="button"
                              className="btn-remove-photo"
                              onClick={(e) => handleRemovePhoto(slot, e)}
                              title="Remove photo"
                            >
                              <X size={14} />
                            </button>
                          </>
                        ) : (
                          <>
                            <Camera size={20} className="photo-slot-icon" />
                            <span className="photo-slot-label">{label}</span>
                          </>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Field 6: Proof of ownership */}
              <div className="add-device-field">
                <label className="add-device-label">
                  Proof of ownership (Optional)
                </label>
                <input
                  ref={receiptInputRef}
                  type="file"
                  accept="image/*,.pdf"
                  style={{ display: "none" }}
                  onChange={(e) => handleReceiptSelect(e.target.files?.[0])}
                />

                {receiptFile ? (
                  <div className="receipt-attached-row">
                    <div className="receipt-attached-info">
                      <FileText size={18} color="#059669" />
                      <span>{receiptFile.name}</span>
                    </div>
                    <button
                      type="button"
                      className="btn-remove-photo"
                      onClick={handleRemoveReceipt}
                      title="Remove file"
                      style={{ position: "static", backgroundColor: "#ef4444" }}
                    >
                      <X size={14} />
                    </button>
                  </div>
                ) : (
                  <div
                    className="receipt-upload-box"
                    onClick={() => receiptInputRef.current?.click()}
                  >
                    <Upload size={22} className="receipt-upload-icon" />
                    <h4 className="receipt-upload-title">
                      Upload a receipt or invoice
                    </h4>
                    <p className="receipt-upload-sub">
                      Attach invoice or store proof if available
                    </p>
                  </div>
                )}
              </div>

              {/* Step 2 Actions */}
              <div className="add-device-actions-row">
                <button
                  type="button"
                  className="btn-back-outline"
                  onClick={() => {
                    setStep(1);
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                >
                  Back
                </button>

                <button
                  type="button"
                  className="btn-continue-primary"
                  onClick={handleStep2Continue}
                >
                  Continue
                </button>
              </div>
            </>
          )}

          {/* ================= STEP 3: REVIEW & SUBMIT ================= */}
          {step === 3 && (
            <>
              {/* Selected Device Badge */}
              <div className="device-selected-tag-container">
                <div className="device-selected-pill">
                  <span className="dot">●</span>
                  <span>
                    {deviceTypeTitle} · {brand} · {model}
                  </span>
                </div>
              </div>

              <div className="device-review-card">
                <table className="device-review-table">
                  <tbody>
                    <tr>
                      <td className="device-review-label">Device</td>
                      <td className="device-review-value">
                        {deviceTypeTitle} · {brand} · {model}
                      </td>
                    </tr>
                    <tr>
                      <td className="device-review-label">Serial / IMEI</td>
                      <td className="device-review-value">{imei}</td>
                    </tr>
                    <tr>
                      <td className="device-review-label">Acquired from</td>
                      <td className="device-review-value">{source}</td>
                    </tr>
                    <tr>
                      <td className="device-review-label">Purchase Date</td>
                      <td className="device-review-value">{purchaseDate}</td>
                    </tr>
                    <tr>
                      <td className="device-review-label">Condition</td>
                      <td className="device-review-value">
                        {CONDITION_OPTIONS.find((c) => c.key === condition)
                          ?.label || condition}
                      </td>
                    </tr>
                    <tr>
                      <td className="device-review-label">Photos attached</td>
                      <td className="device-review-value">
                        {photoCount > 0
                          ? `${photoCount} photo(s) selected`
                          : "None"}
                      </td>
                    </tr>
                    <tr>
                      <td className="device-review-label">Proof of purchase</td>
                      <td className="device-review-value">
                        {receiptFile ? receiptFile.name : "None attached"}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Step 3 Actions */}
              <div className="add-device-actions-row">
                <button
                  type="button"
                  className="btn-back-outline"
                  onClick={() => {
                    setStep(2);
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                  disabled={isSubmitting}
                >
                  Back
                </button>

                <button
                  type="button"
                  className="btn-continue-primary"
                  onClick={handleSubmitDevice}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Registering device..." : "Register device"}
                </button>
              </div>
            </>
          )}
        </div>

        {/* Right Column: Aside Cards */}
        <aside className="add-device-aside">
          {/* Aside Card 1: What happens next */}
          <div className="add-device-aside-card">
            <h3 className="aside-card-title">What happens next</h3>

            <div className="aside-timeline-steps">
              <div className="aside-step-item">
                <div className="aside-step-number">1</div>
                <div className="aside-step-info">
                  <h4 className="aside-step-title">You register online</h4>
                  <p className="aside-step-desc">
                    Identifiers, condition and where you got the device.
                  </p>
                </div>
              </div>

              <div className="aside-step-item">
                <div className="aside-step-number">2</div>
                <div className="aside-step-info">
                  <h4 className="aside-step-title">
                    An engineer checks it in person
                  </h4>
                  <p className="aside-step-desc">
                    They confirm identifiers and test the device.
                  </p>
                </div>
              </div>

              <div className="aside-step-item">
                <div className="aside-step-number">3</div>
                <div className="aside-step-info">
                  <h4 className="aside-step-title">Your device is verified</h4>
                  <p className="aside-step-desc">
                    Then it can be booked for repairs or protected.
                  </p>
                </div>
              </div>
            </div>

            <div className="aside-notice-box">
              <Info size={16} className="aside-notice-icon" />
              <p className="aside-notice-text">
                Typing an IMEI registers your device. An engineer confirms and verifies it when serviced.
              </p>
            </div>
          </div>

          {/* Aside Card 2: Statuses you may see */}
          <div className="add-device-aside-card">
            <h3 className="aside-card-title">Statuses you may see</h3>

            <div className="aside-statuses-list">
              <div className="device-status-pill pill-pending">
                <span className="device-status-dot">●</span>
                <span>Pending Verification</span>
              </div>

              <div className="device-status-pill pill-verified">
                <span className="device-status-dot">●</span>
                <span>Verified</span>
              </div>

              <div className="device-status-pill pill-review">
                <span className="device-status-dot">●</span>
                <span>Further Review Required</span>
              </div>

              <div className="device-status-pill pill-ineligible">
                <span className="device-status-dot">●</span>
                <span>Not Eligible</span>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
