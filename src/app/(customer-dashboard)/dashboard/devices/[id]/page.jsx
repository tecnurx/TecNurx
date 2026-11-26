"use client";

import React, { useEffect, useState, use } from "react";
import "./device-detail.css";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Smartphone,
  ShieldCheck,
  ShieldAlert,
  Wrench,
  ArrowRight,
  FileText,
  Calendar,
  CheckCircle2,
  Clock,
  ArrowLeft,
  Edit3,
  X,
} from "lucide-react";
import { deviceService } from "../../../../../../services/devices";
import { toast } from "@/components/CustomToast";
import TecNurxLoader from "@/components/TecNurxLoader";
import ImageLightbox from "@/components/ImageLightbox";

// Helper to format price in Naira
const formatPrice = (amount) => {
  if (amount === undefined || amount === null) return null;
  const num = typeof amount === "number" ? amount : Number(amount);
  if (isNaN(num)) return null;
  return `₦${num.toLocaleString()}`;
};

// Helper to format date
const formatDate = (dateStr) => {
  if (!dateStr) return "N/A";
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch (e) {
    return dateStr;
  }
};

// Helper to format device title
const formatDeviceTitle = (dev) => {
  if (!dev) return "Device";
  const brand = dev.brand || "";
  const model = dev.model || "";
  if (brand && model) return `${brand} ${model}`;
  return model || brand || "Device";
};

// Helper to format condition
const formatCondition = (condition) => {
  if (!condition) return "Good condition";
  const c = condition.toLowerCase();
  if (c === "good") return "Good condition";
  if (c === "excellent") return "Excellent condition";
  if (c === "fair") return "Fair condition";
  if (c === "poor") return "Poor condition";
  if (c === "not_working") return "Not working";
  return condition.charAt(0).toUpperCase() + condition.slice(1);
};

// Strip literal square brackets from text to avoid brackets in UI
const cleanText = (str) => {
  if (!str) return "";
  return str.replace(/\[.*?\]/g, "").trim();
};

// Status badge styling helper
const getStatusBadge = (status) => {
  const s = (status || "").toLowerCase();
  if (s === "verified" || s === "completed" || s === "delivered") {
    return {
      label: s === "verified" ? "Verified" : "Completed",
      className: "status-badge-pill success",
    };
  }
  if (s === "pending_quote" || s === "quote_requested") {
    return {
      label: "Quote requested",
      className: "status-badge-pill warning",
    };
  }
  if (s === "quote_ready" || s === "quote_provided") {
    return {
      label: "Quote ready",
      className: "status-badge-pill warning",
    };
  }
  if (s === "in_progress" || s === "in_repair" || s === "scheduled") {
    return {
      label: "In progress",
      className: "status-badge-pill warning",
    };
  }
  return {
    label: status ? status.replace(/_/g, " ") : "Pending verification",
    className: "status-badge-pill pending",
  };
};

export default function DeviceDetailPage({ params }) {
  const router = useRouter();
  const unwrappedParams = use(params);
  const deviceId = unwrappedParams?.id;

  const [device, setDevice] = useState(null);
  const [repairs, setRepairs] = useState([]);
  const [insurance, setInsurance] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lightboxIndex, setLightboxIndex] = useState(null);

  // Edit Device Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isSubmittingEdit, setIsSubmittingEdit] = useState(false);
  const [editFormData, setEditFormData] = useState({
    brand: "",
    model: "",
    serialNumber: "",
    purchaseDate: "",
    condition: "good",
    notes: "",
  });

  const openEditModal = () => {
    if (!device) return;
    setEditFormData({
      brand: device.brand || "",
      model: device.model || "",
      serialNumber: device.serialNumber || "",
      purchaseDate: device.purchaseDate ? device.purchaseDate.split("T")[0] : "",
      condition: device.condition || "good",
      notes: device.notes || "",
    });
    setIsEditModalOpen(true);
  };

  const handleUpdateDevice = async (e) => {
    e.preventDefault();
    if (!editFormData.brand?.trim() || !editFormData.model?.trim()) {
      toast.error("Please enter brand and model.");
      return;
    }
    setIsSubmittingEdit(true);
    try {
      await deviceService.updateDevice({
        deviceId,
        ...editFormData,
      });
      setDevice((prev) => ({
        ...prev,
        ...editFormData,
      }));
      setIsEditModalOpen(false);
      toast.success("Device updated successfully!");
    } catch (err) {
      console.error("Error updating device:", err);
      toast.error(err.response?.data?.message || "Failed to update device");
    } finally {
      setIsSubmittingEdit(false);
    }
  };

  useEffect(() => {
    if (!deviceId) return;

    let isMounted = true;

    const fetchAllDeviceData = async () => {
      setLoading(true);
      try {
        const [devRes, repairsRes, insRes] = await Promise.allSettled([
          deviceService.getDevicesbyId({ deviceId }),
          deviceService.getDeviceRepairHistory({ deviceId }),
          deviceService.getDeviceInsurance({ deviceId }),
        ]);

        if (!isMounted) return;

        // 1. Process Device
        if (devRes.status === "fulfilled" && devRes.value) {
          const d = devRes.value?.data?.device || devRes.value?.device || devRes.value?.data;
          if (d) setDevice(d);
        } else {
          // Fallback to fetch from all devices if direct endpoint fails
          try {
            const allDevs = await deviceService.getAllUserDevices();
            const list = allDevs?.data?.devices || allDevs?.devices || [];
            const found = list.find(
              (item) => String(item._id || item.id) === String(deviceId)
            );
            if (found && isMounted) setDevice(found);
          } catch (e) {}
        }

        // 2. Process Repairs History
        if (repairsRes.status === "fulfilled" && repairsRes.value) {
          const rList =
            repairsRes.value?.data?.repairs ||
            repairsRes.value?.repairs ||
            [];
          setRepairs(rList);
        }

        // 3. Process Insurance Status
        if (insRes.status === "fulfilled" && insRes.value) {
          const insData =
            insRes.value?.data?.insurance ||
            insRes.value?.insurance ||
            insRes.value?.data;
          setInsurance(insData);
        }
      } catch (err) {
        console.error("Error fetching device details:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchAllDeviceData();

    return () => {
      isMounted = false;
    };
  }, [deviceId]);

  if (loading) {
    return (
      <div className="device-detail-page">
        <TecNurxLoader minHeight="60vh" size="lg" />
      </div>
    );
  }

  if (!device) {
    return (
      <div className="device-detail-page">
        <div className="device-detail-card" style={{ textAlign: "center", padding: "60px 24px" }}>
          <h2 style={{ marginBottom: "8px" }}>Device not found</h2>
          <p style={{ color: "#64748b", marginBottom: "20px" }}>
            The requested device could not be located in your account.
          </p>
          <Link href="/dashboard/devices" className="btn-device-action-primary">
            Back to devices
          </Link>
        </div>
      </div>
    );
  }

  const deviceTitle = formatDeviceTitle(device);
  const conditionLabel = formatCondition(device.condition);
  const statusBadge = getStatusBadge(device.verificationStatus || device.status);
  const isInsured = Boolean(insurance?.isInsured);

  return (
    <div className="device-detail-page">
      {/* Main Header (Breadcrumbs removed since it is on the topbar) */}
      <div className="device-detail-header">
        <div className="device-header-left">
          <div className="device-detail-icon-wrap">
            <Smartphone size={28} />
          </div>
          <div className="device-detail-titles">
            <h1>
              <span>{deviceTitle}</span>
              <span className={statusBadge.className}>
                <span className="dot">●</span>
                {statusBadge.label}
              </span>
            </h1>
            <p className="device-detail-sub">
              {device.deviceType ? device.deviceType.charAt(0).toUpperCase() + device.deviceType.slice(1) : "Gadget"}
              {device.createdAt && ` · Registered on ${formatDate(device.createdAt)}`}
            </p>
          </div>
        </div>

        <div className="device-header-actions">
          <button
            type="button"
            className="btn-device-action-outline"
            onClick={openEditModal}
          >
            <Edit3 size={15} />
            <span>Edit device</span>
          </button>

          <Link
            href={`/dashboard/repairs/book?deviceId=${deviceId}`}
            className="btn-device-action-primary"
          >
            <Wrench size={16} />
            <span>Book a repair</span>
          </Link>

          <Link href="/dashboard/devices" className="btn-device-action-outline">
            <ArrowLeft size={16} />
            <span>All devices</span>
          </Link>
        </div>
      </div>

      {/* 2-Column Grid */}
      <div className="device-detail-grid">
        {/* Left Column: Device Info & Repair History */}
        <div className="device-detail-col-main">
          {/* Card 1: Device Overview & Identifiers */}
          <div className="device-detail-card">
            <div className="device-card-header">
              <h2>Device Overview</h2>
              <button
                type="button"
                onClick={openEditModal}
                style={{
                  background: "none",
                  border: "none",
                  color: "#111827",
                  fontSize: "13px",
                  fontWeight: 600,
                  cursor: "pointer",
                  textDecoration: "underline",
                  padding: 0,
                }}
              >
                Edit details
              </button>
            </div>

            <table className="device-info-table">
              <tbody>
                <tr>
                  <td className="device-info-label">Brand</td>
                  <td className="device-info-value">{device.brand || "N/A"}</td>
                </tr>
                <tr>
                  <td className="device-info-label">Model</td>
                  <td className="device-info-value">{device.model || "N/A"}</td>
                </tr>
                <tr>
                  <td className="device-info-label">Serial Number / IMEI</td>
                  <td className="device-info-value">
                    {device.serialNumber || "N/A"}
                  </td>
                </tr>
                <tr>
                  <td className="device-info-label">Condition</td>
                  <td className="device-info-value">{conditionLabel}</td>
                </tr>
                <tr>
                  <td className="device-info-label">Purchase Date</td>
                  <td className="device-info-value">
                    {formatDate(device.purchaseDate)}
                  </td>
                </tr>
                {device.notes && (
                  <tr>
                    <td className="device-info-label">Acquisition / Notes</td>
                    <td className="device-info-value">
                      {cleanText(device.notes)}
                    </td>
                  </tr>
                )}
                <tr>
                  <td className="device-info-label">Verification</td>
                  <td className="device-info-value">
                    {statusBadge.label}
                  </td>
                </tr>
              </tbody>
            </table>

            {/* Photos if attached */}
            {device.photos && device.photos.length > 0 && (
              <div style={{ marginTop: "20px" }}>
                <h4 style={{ fontSize: "14px", color: "#64748b", margin: "0 0 10px 0" }}>
                  Device Photos
                </h4>
                <div className="device-photos-grid">
                  {device.photos.map((url, idx) => (
                    <div
                      key={idx}
                      className="device-photo-item"
                      onClick={() => setLightboxIndex(idx)}
                      style={{ cursor: "zoom-in" }}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") setLightboxIndex(idx);
                      }}
                      title="Click to enlarge"
                    >
                      <img src={url} alt={`${deviceTitle} photo ${idx + 1}`} />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Card 2: Repair History (Dynamic from /repairs-history) */}
          <div className="device-detail-card">
            <div className="device-card-header">
              <h2>Repair History</h2>
              <Link
                href={`/dashboard/repairs/book?deviceId=${deviceId}`}
                style={{
                  fontSize: "13px",
                  fontWeight: 600,
                  color: "#111827",
                  textDecoration: "underline",
                }}
              >
                + Book repair
              </Link>
            </div>

            {repairs && repairs.length > 0 ? (
              <div className="repairs-history-list">
                {repairs.map((repair) => {
                  const rId = repair._id || repair.id;
                  const issueName = repair.issueCategory
                    ? repair.issueCategory.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
                    : "Diagnostic assessment";
                  const desc = cleanText(repair.issueDescription) || "Assessment requested for device.";
                  const cost = repair.estimatedCost?.totalCost
                    ? formatPrice(repair.estimatedCost.totalCost)
                    : null;
                  const rStatusBadge = getStatusBadge(repair.status);
                  const dateStr = formatDate(repair.createdAt);

                  return (
                    <div key={rId} className="repair-history-item">
                      <div className="repair-history-left">
                        <div className="repair-history-icon">
                          <Wrench size={20} />
                        </div>
                        <div className="repair-history-details">
                          <h4>{issueName}</h4>
                          <p className="repair-history-desc">{desc}</p>
                          <div className="repair-history-meta">
                            <span>{dateStr}</span>
                            <span>•</span>
                            <span>
                              {repair.serviceType === "pickup_repair"
                                ? "Pickup & Return"
                                : "Walk-in Center"}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="repair-history-right">
                        <span className={rStatusBadge.className}>
                          <span className="dot">●</span>
                          {rStatusBadge.label}
                        </span>
                        {cost && <span className="repair-history-cost">{cost}</span>}
                        <Link
                          href={`/dashboard/repairs/${rId}`}
                          className="repair-history-btn"
                        >
                          <span>View order</span>
                          <ArrowRight size={14} />
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="empty-repairs-box">
                <div className="empty-repairs-icon">
                  <Wrench size={22} />
                </div>
                <h3 className="empty-repairs-title">No repairs logged yet</h3>
                <p className="empty-repairs-sub">
                  When you book a repair for this device, you can track diagnostic quotes and repair progress here.
                </p>
                <Link
                  href={`/dashboard/repairs/book?deviceId=${deviceId}`}
                  className="btn-device-action-primary"
                  style={{ display: "inline-flex" }}
                >
                  Book a repair
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Insurance & Protection */}
        <div className="device-detail-col-side">
          <div className="device-detail-card">
            <div className="device-card-header">
              <h2>Protection & Insurance</h2>
            </div>

            {isInsured ? (
              <>
                <div className="insurance-status-box insured">
                  <ShieldCheck size={22} color="#059669" className="insurance-status-icon" />
                  <div className="insurance-status-info">
                    <h3>Active Protection</h3>
                    <p>This device is currently insured under an active TecNurx protection policy.</p>
                  </div>
                </div>

                <div className="insurance-actions-wrap">
                  <Link
                    href="/dashboard/insurance"
                    className="btn-device-action-primary"
                    style={{ textAlign: "center", justifyContent: "center" }}
                  >
                    Make a claim
                  </Link>
                </div>
              </>
            ) : (
              <>
                <div className="insurance-status-box uninsured">
                  <ShieldAlert size={22} color="#d97706" className="insurance-status-icon" />
                  <div className="insurance-status-info">
                    <h3>Not Insured</h3>
                    <p>
                      This device has no active protection plan. Protect it against accidental damage, liquid spills, and screen cracks.
                    </p>
                  </div>
                </div>

                <div className="insurance-actions-wrap">
                  <Link
                    href="/insurance"
                    className="btn-device-action-primary"
                    style={{ textAlign: "center", justifyContent: "center" }}
                  >
                    Get protected
                  </Link>
                </div>
              </>
            )}
          </div>

          {/* Quick Help Card */}
          <div className="device-detail-card">
            <h3 style={{ fontSize: "16px", fontWeight: 700, margin: "0 0 10px 0" }}>
              Need assistance?
            </h3>
            <p style={{ fontSize: "13px", color: "#64748b", margin: "0 0 16px 0", lineHeight: 1.4 }}>
              Have questions about your device verification, repair warranty, or policy coverage? Our certified engineers and support team are available 24/7.
            </p>
            <Link
              href="/dashboard/feedback"
              className="btn-device-action-outline"
              style={{ width: "100%", justifyContent: "center", boxSizing: "border-box" }}
            >
              Contact support
            </Link>
          </div>
        </div>
      </div>

      {/* Edit Device Modal */}
      {isEditModalOpen && (
        <div
          className="device-modal-backdrop"
          onClick={() => setIsEditModalOpen(false)}
        >
          <div
            className="device-modal-card"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="device-modal-header">
              <div>
                <h2>Edit Device</h2>
                <p>Update device specifications and details</p>
              </div>
              <button
                type="button"
                className="device-modal-close-btn"
                onClick={() => setIsEditModalOpen(false)}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleUpdateDevice} className="add-device-form">
              <div className="form-grid">
                <div className="form-grouup">
                  <label>Brand *</label>
                  <input
                    type="text"
                    value={editFormData.brand}
                    onChange={(e) =>
                      setEditFormData({ ...editFormData, brand: e.target.value })
                    }
                    required
                  />
                </div>

                <div className="form-grouup">
                  <label>Model *</label>
                  <input
                    type="text"
                    value={editFormData.model}
                    onChange={(e) =>
                      setEditFormData({ ...editFormData, model: e.target.value })
                    }
                    required
                  />
                </div>

                <div className="form-grouup">
                  <label>Serial / IMEI</label>
                  <input
                    type="text"
                    value={editFormData.serialNumber}
                    onChange={(e) =>
                      setEditFormData({
                        ...editFormData,
                        serialNumber: e.target.value,
                      })
                    }
                  />
                </div>

                <div className="form-grouup">
                  <label>Purchase Date</label>
                  <input
                    type="date"
                    value={editFormData.purchaseDate}
                    onChange={(e) =>
                      setEditFormData({
                        ...editFormData,
                        purchaseDate: e.target.value,
                      })
                    }
                  />
                </div>

                <div className="form-grouup full">
                  <label>Condition</label>
                  <select
                    value={editFormData.condition}
                    onChange={(e) =>
                      setEditFormData({
                        ...editFormData,
                        condition: e.target.value,
                      })
                    }
                  >
                    <option value="excellent">Excellent</option>
                    <option value="good">Good</option>
                    <option value="fair">Fair</option>
                    <option value="poor">Poor</option>
                    <option value="not_working">Not Working</option>
                  </select>
                </div>

                <div className="form-grouup full">
                  <label>Notes / Acquisition Source</label>
                  <textarea
                    rows={2}
                    value={editFormData.notes}
                    onChange={(e) =>
                      setEditFormData({ ...editFormData, notes: e.target.value })
                    }
                    placeholder="e.g. Bought new, UK used"
                  />
                </div>
              </div>

              <div className="device-form-actions">
                <button
                  type="button"
                  className="btn-modal-cancel"
                  onClick={() => setIsEditModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-modal-submit"
                  disabled={isSubmittingEdit}
                >
                  {isSubmittingEdit ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ImageLightbox
        images={device?.photos || []}
        currentIndex={lightboxIndex}
        onClose={() => setLightboxIndex(null)}
        onChangeIndex={setLightboxIndex}
      />
    </div>
  );
}
