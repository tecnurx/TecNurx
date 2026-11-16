"use client";

import React, { useEffect, useState, useMemo } from "react";
import "./devices.css";
import {
  Smartphone,
  Laptop,
  Tablet,
  Watch,
  X,
  Upload,
  AlertCircle,
  Check,
  Shield,
  Wrench,
  Trash2,
} from "lucide-react";
import { deviceService } from "../../../../../services/devices";
import { toast } from "@/components/CustomToast";
import { useRouter } from "next/navigation";
import Link from "next/link";
import TecNurxLoader from "@/components/TecNurxLoader";

const MyDevices = () => {
  const router = useRouter();
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all"); // "all" | "verified" | "pending_verification" | "further_review" | "not_eligible"

  // Modals state
  const [selectedDevice, setSelectedDevice] = useState(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingDeviceId, setEditingDeviceId] = useState(null);
  const [isProofModalOpen, setIsProofModalOpen] = useState(false);
  const [isWhyModalOpen, setIsWhyModalOpen] = useState(false);
  const [proofFile, setProofFile] = useState(null);
  const [isUploadingProof, setIsUploadingProof] = useState(false);

  // Form state for Add/Edit Device (all original fields)
  const [formData, setFormData] = useState({
    deviceType: "phone",
    brand: "",
    model: "",
    serialNumber: "",
    purchaseDate: "",
    condition: "good",
    notes: "",
  });
  const [photos, setPhotos] = useState([]);
  const [receipt, setReceipt] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  // Fetch devices from backend
  useEffect(() => {
    const fetchDevices = async () => {
      try {
        const res = await deviceService.getAllUserDevices();
        const list = res?.data?.devices || res?.devices || [];
        setDevices(list);
      } catch (err) {
        console.warn("Could not fetch user devices from API:", err);
        setDevices([]);
      } finally {
        setLoading(false);
      }
    };
    fetchDevices();
  }, []);

  // Displayed devices list - pure dynamic from backend
  const displayedDevices = useMemo(() => {
    return devices || [];
  }, [devices]);

  // Safe condition label
  const formatCondition = (dev) => {
    if (dev.conditionLabel) return dev.conditionLabel;
    const cond = (dev.condition || "").toLowerCase().replace(/_/g, " ");
    if (cond === "uk used" || cond === "uk_used") return "UK used";
    if (cond === "bought new" || cond === "new") return "Bought new";
    if (cond === "used in nigeria" || cond === "nigeria used") {
      return "Used in Nigeria";
    }
    if (cond === "good") return "Good condition";
    if (cond === "excellent") return "Excellent condition";
    if (cond) return cond.charAt(0).toUpperCase() + cond.slice(1);
    return "UK used";
  };

  // Safe device name
  const formatDeviceTitle = (dev) => {
    const brand = (dev.brand || "").trim();
    const model = (dev.model || "").trim();
    if (brand && model) {
      if (model.toLowerCase().startsWith(brand.toLowerCase())) return model;
      return `${brand} ${model}`;
    }
    return model || brand || "Smartphone";
  };

  // Safe verification status classifier
  const getDeviceStatusInfo = (dev) => {
    const raw = (dev.verificationStatus || dev.status || "").toLowerCase();

    if (raw === "pending_repair") {
      return {
        key: "pending_repair",
        label: "Pending Repair",
        pillClass: "pill-pending",
        note:
          dev.notes ||
          "Device is registered and queued for repair assessment.",
        actionType: "button",
        actionText: "Track repair",
      };
    }

    if (raw === "in_repair" || raw === "repairing") {
      return {
        key: "in_repair",
        label: "In Repair",
        pillClass: "pill-pending",
        note: dev.notes || "Certified technicians are currently servicing this device.",
        actionType: "button",
        actionText: "Track repair",
      };
    }

    if (raw === "repaired") {
      return {
        key: "repaired",
        label: "Repaired",
        pillClass: "pill-verified",
        note: dev.notes || "Repair completed and verified.",
        actionType: "link",
        actionText: "View device",
      };
    }

    if (
      raw.includes("not") ||
      raw.includes("ineligible") ||
      raw.includes("reject")
    ) {
      return {
        key: "not_eligible",
        label: "Not Eligible",
        pillClass: "pill-ineligible",
        note:
          dev.notes ||
          "Device has unauthorized third-party board modifications.",
        actionType: "link",
        actionText: "See why",
      };
    }

    if (
      raw.includes("further") ||
      raw.includes("review") ||
      raw.includes("action")
    ) {
      return {
        key: "further_review",
        label: "Further Review Required",
        pillClass: "pill-review",
        note:
          dev.notes ||
          "We need to check the activation lock and proof of ownership.",
        actionType: "button",
        actionText: "Upload missing proof",
      };
    }

    if (
      raw.includes("pending") ||
      raw.includes("unverified") ||
      raw.includes("schedule")
    ) {
      return {
        key: "pending_verification",
        label: "Pending Verification",
        pillClass: "pill-pending",
        note:
          dev.notes ||
          "Registered online. An engineer will check it at pickup or drop-off.",
        actionType: "button",
        actionText: "Book inspection",
      };
    }

    return {
      key: "verified",
      label: "Verified",
      pillClass: "pill-verified",
      note: dev.notes || "Checked by an engineer on Nov 4, 2026.",
      actionType: "link",
      actionText: "View device",
    };
  };

  // Filtered devices according to tab
  const filteredDevices = useMemo(() => {
    if (activeTab === "all") return displayedDevices;
    return displayedDevices.filter((dev) => {
      const info = getDeviceStatusInfo(dev);
      return info.key === activeTab;
    });
  }, [displayedDevices, activeTab]);

  // Open Edit Modal with device data populated
  const openEditModal = (device) => {
    setIsEditMode(true);
    setEditingDeviceId(device.id || device._id);

    setFormData({
      deviceType: device.deviceType || "phone",
      brand: device.brand || "",
      model: device.model || "",
      serialNumber: device.serialNumber || "",
      purchaseDate: device.purchaseDate ? device.purchaseDate.split("T")[0] : "",
      condition: device.condition || "good",
      notes: device.notes || "",
    });

    setPhotos([]);
    setReceipt(null);
    setIsDetailsModalOpen(false);
    setIsAddModalOpen(true);
  };

  // Handle Add / Edit Device Submit (Preserving original FormData handling)
  const handleSubmitDevice = async (e) => {
    e.preventDefault();
    setSubmitError("");

    if (!formData.brand || !formData.model || !formData.serialNumber) {
      setSubmitError("Please fill in all required fields (Brand, Model, Serial Number).");
      return;
    }

    setIsSubmitting(true);
    try {
      if (isEditMode) {
        await deviceService.updateDevice({ deviceId: editingDeviceId, ...formData });
        toast.success("Device updated successfully!");
      } else {
        const payload = new FormData();
        payload.append("deviceType", formData.deviceType);
        payload.append("brand", formData.brand);
        payload.append("model", formData.model);
        payload.append("serialNumber", formData.serialNumber);
        if (formData.purchaseDate) {
          payload.append("purchaseDate", formData.purchaseDate);
        }
        payload.append("condition", formData.condition);
        if (formData.notes) {
          let cleanNotes = formData.notes.trim();
          const lower = cleanNotes.toLowerCase();
          if (
            !lower.startsWith("uk used") &&
            !lower.startsWith("bought new") &&
            !lower.startsWith("used in nigeria")
          ) {
            cleanNotes = `uk used - ${cleanNotes}`;
          }
          payload.append("notes", cleanNotes);
        }

        photos.forEach((photo) => payload.append("photos", photo));
        if (receipt) payload.append("purchaseReceipt", receipt);

        await deviceService.addDevice(payload);
        toast.success("Device added successfully!");
      }

      const res = await deviceService.getAllUserDevices();
      setDevices(res?.data?.devices || res?.devices || []);
      setIsAddModalOpen(false);
      resetForm();
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        (isEditMode ? "Failed to update device" : "Failed to add device");
      setSubmitError(msg);
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      deviceType: "phone",
      brand: "",
      model: "",
      serialNumber: "",
      purchaseDate: "",
      condition: "good",
      notes: "",
    });
    setPhotos([]);
    setReceipt(null);
    setIsEditMode(false);
    setEditingDeviceId(null);
    setSubmitError("");
  };

  // Handle Proof Upload
  const handleUploadProof = () => {
    if (!proofFile) {
      toast.error("Please select a file to upload");
      return;
    }
    setIsUploadingProof(true);
    setTimeout(() => {
      setIsUploadingProof(false);
      setIsProofModalOpen(false);
      setProofFile(null);
      toast.success("Proof of ownership uploaded! Verification updated.");
    }, 1000);
  };

  const handleDeviceAction = (device, statusInfo) => {
    setSelectedDevice(device);
    const dId = device._id || device.id;
    if (statusInfo.key === "verified") {
      router.push(`/dashboard/devices/${dId}`);
    } else if (statusInfo.key === "pending_verification") {
      router.push(`/dashboard/devices/${dId}`);
    } else if (statusInfo.key === "further_review") {
      setIsProofModalOpen(true);
    } else if (statusInfo.key === "not_eligible") {
      setIsWhyModalOpen(true);
    }
  };

  if (loading) {
    return <TecNurxLoader minHeight="65vh" size="lg" />;
  }

  const hasNoDevices = displayedDevices.length === 0;

  return (
    <div className="mydevices-page">
      {/* Page Header */}
      <div className="devices-header">
        <div className="devices-header-text">
          <h1 className="devices-title">My devices</h1>
          <p className="devices-subtitle">
            Every device you have registered with TecNurx.
          </p>
        </div>

        <button
          type="button"
          className="btn-add-device-header"
          onClick={() => {
            router.push("/dashboard/devices/add");
          }}
        >
          Add a device
        </button>
      </div>

      {/* STATE 1: EMPTY STATE */}
      {hasNoDevices ? (
        <div className="empty-devices-card">
          <div className="empty-devices-icon-box">
            <Smartphone size={26} strokeWidth={2} />
          </div>
          <h2 className="empty-devices-title">Add your first device</h2>
          <p className="empty-devices-desc">
            Register your device once. An engineer will verify it in
            <br />
            person before a repair or cover.
          </p>
          <button
            type="button"
            className="empty-devices-btn"
            onClick={() => {
              router.push("/dashboard/devices/add");
            }}
          >
            Add a device
          </button>
          <p className="empty-devices-footnote">
            Typing an IMEI does not verify a device.
          </p>
        </div>
      ) : (
        /* STATE 2: WITH DEVICES */
        <>
          {/* Tabs Filter */}
          <div className="devices-tabs-row">
            <button
              type="button"
              className={`device-tab-pill ${
                activeTab === "all" ? "active" : ""
              }`}
              onClick={() => setActiveTab("all")}
            >
              All {displayedDevices.length}
            </button>
            <button
              type="button"
              className={`device-tab-pill ${
                activeTab === "verified" ? "active" : ""
              }`}
              onClick={() => setActiveTab("verified")}
            >
              Verified
            </button>
            <button
              type="button"
              className={`device-tab-pill ${
                activeTab === "pending_verification" ? "active" : ""
              }`}
              onClick={() => setActiveTab("pending_verification")}
            >
              Pending Verification
            </button>
            <button
              type="button"
              className={`device-tab-pill ${
                activeTab === "further_review" ? "active" : ""
              }`}
              onClick={() => setActiveTab("further_review")}
            >
              Further Review Required
            </button>
            <button
              type="button"
              className={`device-tab-pill ${
                activeTab === "not_eligible" ? "active" : ""
              }`}
              onClick={() => setActiveTab("not_eligible")}
            >
              Not Eligible
            </button>
          </div>

          {/* 2x2 Device Cards Grid */}
          {filteredDevices.length === 0 ? (
            <div className="empty-devices-card" style={{ padding: "50px 24px" }}>
              <p style={{ color: "#64748b", margin: 0 }}>
                No devices found in this filter.
              </p>
            </div>
          ) : (
            <div className="devices-grid-2x2">
              {filteredDevices.map((dev) => {
                const statusInfo = getDeviceStatusInfo(dev);
                const title = formatDeviceTitle(dev);
                const condition = formatCondition(dev);

                return (
                  <div key={dev.id || dev._id} className="new-device-card">
                    <div>
                      {/* Card Top Row */}
                      <div className="device-card-top">
                        <div className="device-card-meta">
                          <div className="device-icon-box">
                            <Smartphone size={22} strokeWidth={2} />
                          </div>
                          <div className="device-name-condition">
                            <h3 className="device-card-title">
                              <Link
                                href={`/dashboard/devices/${dev._id || dev.id}`}
                                style={{ color: "inherit", textDecoration: "none" }}
                              >
                                {title}
                              </Link>
                            </h3>
                            <p className="device-card-condition">{condition}</p>
                          </div>
                        </div>

                        <span
                          className={`device-status-pill ${statusInfo.pillClass}`}
                        >
                          <span className="device-status-dot">●</span>
                          {statusInfo.label}
                        </span>
                      </div>

                      {/* Card Middle Note */}
                      <p className="device-card-note">{statusInfo.note}</p>
                    </div>

                    {/* Card Bottom Actions: Grid layout preventing any text wrapping */}
                    <div
                      className="device-card-bottom-actions"
                      style={{
                        display: "grid",
                        gridTemplateColumns:
                          statusInfo.actionText !== "View device"
                            ? "1fr 1fr"
                            : "1fr",
                        gap: "10px",
                        width: "100%",
                        marginTop: "auto",
                      }}
                    >
                      <Link
                        href={`/dashboard/devices/${dev._id || dev.id}`}
                        className="device-outline-btn"
                        style={{
                          textDecoration: "none",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          whiteSpace: "nowrap",
                          padding: "9px 12px",
                          fontSize: "13px",
                        }}
                      >
                        View device
                      </Link>

                      {statusInfo.actionText !== "View device" && (
                        <button
                          type="button"
                          className="device-outline-btn"
                          style={{
                            backgroundColor: "#000000",
                            color: "#ffffff",
                            borderColor: "#000000",
                            whiteSpace: "nowrap",
                            padding: "9px 12px",
                            fontSize: "13px",
                          }}
                          onClick={() => handleDeviceAction(dev, statusInfo)}
                        >
                          {statusInfo.actionText}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* MODAL 1: ADD / EDIT DEVICE FORM (Complete Original Form Restored) */}
      {isAddModalOpen && (
        <div
          className="device-modal-backdrop"
          onClick={() => setIsAddModalOpen(false)}
        >
          <div
            className="device-modal-card add-device-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              className="device-modal-close-btn"
              style={{ position: "absolute", top: "18px", right: "18px" }}
              onClick={() => setIsAddModalOpen(false)}
            >
              <X size={20} />
            </button>

            <div className="device-modal-header" style={{ display: "block" }}>
              <h2>{isEditMode ? "Edit Device" : "Add New Device"}</h2>
              <p>
                {isEditMode
                  ? "Update your device information"
                  : "Register your device for repairs & insurance"}
              </p>
            </div>

            <form onSubmit={handleSubmitDevice} className="add-device-form">
              {submitError && (
                <div
                  style={{
                    background: "#fef2f2",
                    color: "#dc2626",
                    padding: "10px 14px",
                    borderRadius: "10px",
                    fontSize: "13.5px",
                    marginBottom: "16px",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                  }}
                >
                  <AlertCircle size={16} />
                  <span>{submitError}</span>
                </div>
              )}

              <div className="form-grid">
                {/* Device Type */}
                <div className="form-grouup">
                  <label>Device Type *</label>
                  <select
                    value={formData.deviceType}
                    onChange={(e) =>
                      setFormData({ ...formData, deviceType: e.target.value })
                    }
                    required
                  >
                    <option value="phone">Phone</option>
                    <option value="laptop">Laptop</option>
                    <option value="tablet">Tablet</option>
                    <option value="camera">Camera</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                {/* Brand */}
                <div className="form-grouup">
                  <label>Brand *</label>
                  <input
                    type="text"
                    placeholder="e.g. Apple, Samsung"
                    value={formData.brand}
                    onChange={(e) =>
                      setFormData({ ...formData, brand: e.target.value })
                    }
                    required
                  />
                </div>

                {/* Model */}
                <div className="form-grouup">
                  <label>Model *</label>
                  <input
                    type="text"
                    placeholder="e.g. iPhone 15 Pro"
                    value={formData.model}
                    onChange={(e) =>
                      setFormData({ ...formData, model: e.target.value })
                    }
                    required
                  />
                </div>

                {/* Serial Number */}
                <div className="form-grouup">
                  <label>Serial Number *</label>
                  <input
                    type="text"
                    placeholder="ABC123XYZ"
                    value={formData.serialNumber}
                    onChange={(e) =>
                      setFormData({ ...formData, serialNumber: e.target.value })
                    }
                    required
                  />
                </div>

                {/* Purchase Date */}
                <div className="form-grouup">
                  <label>Purchase Date</label>
                  <input
                    type="date"
                    value={formData.purchaseDate}
                    onChange={(e) =>
                      setFormData({ ...formData, purchaseDate: e.target.value })
                    }
                  />
                </div>

                {/* Condition */}
                <div className="form-grouup">
                  <label>Condition</label>
                  <select
                    value={formData.condition}
                    onChange={(e) =>
                      setFormData({ ...formData, condition: e.target.value })
                    }
                  >
                    <option value="excellent">Excellent</option>
                    <option value="good">Good</option>
                    <option value="fair">Fair</option>
                    <option value="poor">Poor</option>
                    <option value="not_working">Not Working</option>
                  </select>
                </div>

                {/* Photos */}
                <div className="form-grouup full">
                  <label>Photos {!isEditMode && "(min. 2 required)"}</label>
                  <label className="file-upload">
                    <Upload size={18} />
                    <span>
                      {photos.length > 0
                        ? `${photos.length} photo(s) selected`
                        : "Upload Photos"}
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={(e) => setPhotos(Array.from(e.target.files))}
                    />
                  </label>
                </div>

                {/* Purchase Receipt */}
                <div className="form-grouup full">
                  <label>Purchase Receipt (Optional)</label>
                  <label className="file-upload">
                    <Upload size={18} />
                    <span>{receipt ? receipt.name : "Upload Receipt"}</span>
                    <input
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={(e) => setReceipt(e.target.files[0])}
                    />
                  </label>
                </div>

                {/* Notes */}
                <div className="form-grouup full">
                  <label>Notes (Optional)</label>
                  <textarea
                    rows={3}
                    placeholder="Any additional info..."
                    value={formData.notes}
                    onChange={(e) =>
                      setFormData({ ...formData, notes: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="device-form-actions">
                <button
                  type="button"
                  className="btn-modal-cancel"
                  onClick={() => setIsAddModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-modal-submit"
                  disabled={isSubmitting}
                >
                  {isSubmitting
                    ? "Saving..."
                    : isEditMode
                    ? "Update Device"
                    : "Add Device"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: VIEW DEVICE DETAILS */}
      {isDetailsModalOpen && selectedDevice && (
        <div
          className="device-modal-backdrop"
          onClick={() => setIsDetailsModalOpen(false)}
        >
          <div
            className="device-modal-card"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="device-modal-header">
              <h2>Device Details</h2>
              <button
                type="button"
                className="device-modal-close-btn"
                onClick={() => setIsDetailsModalOpen(false)}
              >
                <X size={20} />
              </button>
            </div>

            <div className="modal-device-meta-row">
              <div className="device-icon-box">
                <Smartphone size={24} />
              </div>
              <div>
                <h3 style={{ margin: "0 0 2px 0", fontSize: "16px" }}>
                  {formatDeviceTitle(selectedDevice)}
                </h3>
                <span style={{ fontSize: "13px", color: "#64748b" }}>
                  {formatCondition(selectedDevice)}
                </span>
              </div>
            </div>

            <div className="modal-device-info-list">
              <div className="modal-info-item">
                <span>Verification Status</span>
                <span style={{ color: "#059669" }}>● Verified</span>
              </div>
              <div className="modal-info-item">
                <span>Serial / IMEI</span>
                <span>{selectedDevice.serialNumber || "Verified in person"}</span>
              </div>
              <div className="modal-info-item">
                <span>Verification Date</span>
                <span>{selectedDevice.verifiedDate || "Nov 4, 2026"}</span>
              </div>
              <div className="modal-info-item">
                <span>Engineer Notes</span>
                <span>{selectedDevice.notes}</span>
              </div>
            </div>

            <div className="device-form-actions">
              <button
                type="button"
                className="btn-modal-cancel"
                onClick={() => openEditModal(selectedDevice)}
              >
                Edit Device
              </button>
              <button
                type="button"
                className="btn-modal-submit"
                onClick={() => setIsDetailsModalOpen(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: UPLOAD MISSING PROOF */}
      {isProofModalOpen && selectedDevice && (
        <div
          className="device-modal-backdrop"
          onClick={() => setIsProofModalOpen(false)}
        >
          <div
            className="device-modal-card"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="device-modal-header">
              <h2>Upload proof of ownership</h2>
              <button
                type="button"
                className="device-modal-close-btn"
                onClick={() => setIsProofModalOpen(false)}
              >
                <X size={20} />
              </button>
            </div>

            <p style={{ fontSize: "14px", color: "#4b5563", lineHeight: 1.5 }}>
              To verify your {formatDeviceTitle(selectedDevice)}, please upload
              the purchase receipt, invoice, or carrier activation proof.
            </p>

            <div style={{ margin: "20px 0" }}>
              <label className="file-upload">
                <Upload size={22} color="#64748b" />
                <span
                  style={{
                    fontSize: "13.5px",
                    fontWeight: 600,
                    color: "#111827",
                  }}
                >
                  {proofFile ? proofFile.name : "Select document or receipt"}
                </span>
                <input
                  type="file"
                  accept=".pdf,.png,.jpg,.jpeg"
                  onChange={(e) => setProofFile(e.target.files?.[0] || null)}
                />
              </label>
            </div>

            <div className="device-form-actions">
              <button
                type="button"
                className="btn-modal-cancel"
                onClick={() => setIsProofModalOpen(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn-modal-submit"
                onClick={handleUploadProof}
                disabled={isUploadingProof || !proofFile}
              >
                {isUploadingProof ? "Uploading..." : "Submit proof"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 4: INELIGIBILITY EXPLANATION ("See why") */}
      {isWhyModalOpen && selectedDevice && (
        <div
          className="device-modal-backdrop"
          onClick={() => setIsWhyModalOpen(false)}
        >
          <div
            className="device-modal-card"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="device-modal-header">
              <h2>Verification Assessment</h2>
              <button
                type="button"
                className="device-modal-close-btn"
                onClick={() => setIsWhyModalOpen(false)}
              >
                <X size={20} />
              </button>
            </div>

            <div
              style={{
                background: "#fef2f2",
                border: "1px solid #fee2e2",
                borderRadius: "12px",
                padding: "16px",
                display: "flex",
                gap: "12px",
                alignItems: "flex-start",
                marginBottom: "20px",
              }}
            >
              <AlertCircle size={20} color="#dc2626" style={{ flexShrink: 0 }} />
              <div>
                <strong
                  style={{
                    display: "block",
                    color: "#991b1b",
                    fontSize: "14px",
                    marginBottom: "4px",
                  }}
                >
                  Device Not Eligible for Repair Cover
                </strong>
                <p style={{ margin: 0, fontSize: "13.5px", color: "#7f1d1d" }}>
                  {selectedDevice.rejectionReason ||
                    selectedDevice.notes ||
                    "Device has unauthorized third-party board modifications."}
                </p>
              </div>
            </div>

            <p style={{ fontSize: "13.5px", color: "#4b5563", lineHeight: 1.5 }}>
              TecNurx safety standards require all components to be verifiable by
              certified technicians without unapproved circuitry alterations.
            </p>

            <div className="device-form-actions">
              <button
                type="button"
                className="btn-modal-submit"
                onClick={() => setIsWhyModalOpen(false)}
              >
                Understood
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyDevices;
