"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import {
  ArrowLeft,
  Clock,
  Smartphone,
  User,
  MapPin,
  Loader2,
  AlertCircle,
  Plus,
  Save,
  X,
  Wrench,
  FileText,
  Send,
} from "lucide-react";
import "./repair.css";
import "../../engineer.css";
import { toast } from "@/components/CustomToast";
import TecNurxLoader from "@/components/TecNurxLoader";
import ImageLightbox from "@/components/ImageLightbox";
import { formatMoneyInput, sanitizeMoneyInput } from "@/lib/formatMoneyInput";
import { engService } from "../../../../../../services/eng/eng";

const RepairDetailsPage = () => {
  const params = useParams();
  const router = useRouter();
  const repairId = params.repairId;

  const [repair, setRepair] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lightboxIndex, setLightboxIndex] = useState(null);

  // Engineer action states
  const [statusLoading, setStatusLoading] = useState(false);
  const [notes, setNotes] = useState("");
  const [noteSaving, setNoteSaving] = useState(false);
  const [parts, setParts] = useState([{ partName: "", quantity: 1, cost: "" }]);

  // Engineer Quote & Additional Work states
  const [quoteForm, setQuoteForm] = useState({
    parts: "",
    labour: "",
    findings: "",
  });
  const [quoteSending, setQuoteSending] = useState(false);
  const [extraWorkForm, setExtraWorkForm] = useState({
    note: "",
    parts: "",
    labour: "",
    photos: [],
  });
  const [extraWorkSending, setExtraWorkSending] = useState(false);

  const engineerStatuses = [
    "in_progress",
    "awaiting_parts",
    "completed",
    "cancelled",
  ];

  useEffect(() => {
    const fetchRepair = async () => {
      try {
        setLoading(true);
        const response = await engService.getRepairbyId(repairId);
        const repairData =
          response.data?.repair || response.repair || response.data;
        setRepair(repairData);

        if (repairData?.engineerNotes) {
          setNotes(repairData.engineerNotes || "");
        }

        if (repairData?.quote) {
          setQuoteForm({
            parts: repairData.quote.parts ?? "",
            labour: repairData.quote.labour ?? "",
            findings: repairData.quote.findings || "",
          });
        }

        if (repairData?.partsUsed?.length > 0) {
          setParts(
            repairData.partsUsed.map((p) => ({
              _id: p._id,
              partName: p.partName || "",
              quantity: p.quantity || 1,
              cost: p.cost || 0,
            }))
          );
        }
      } catch (err) {
        setError("Failed to load repair details");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchRepair();
  }, [repairId]);

  const handleSendQuote = async () => {
    if (!quoteForm.findings.trim()) {
      toast.error("Please enter your diagnostic findings.");
      return;
    }
    try {
      setQuoteSending(true);
      await engService.sendQuote(repairId, {
        parts: Number(quoteForm.parts || 0),
        labour: Number(quoteForm.labour || 0),
        findings: quoteForm.findings.trim(),
      });
      setRepair((prev) => (prev ? { ...prev, status: "quote_provided" } : prev));
      toast.success("Quote sent to customer!");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to send quote");
    } finally {
      setQuoteSending(false);
    }
  };

  const handleExtraWorkPhotosChange = (e) => {
    const selected = Array.from(e.target.files || []);
    if (!selected.length) return;

    const validTypes = ["image/jpeg", "image/png"];
    const maxBytes = 5 * 1024 * 1024;
    const nextPhotos = [...extraWorkForm.photos];

    for (const file of selected) {
      if (nextPhotos.length >= 4) {
        toast.error("You can attach up to 4 photos.");
        break;
      }
      if (!validTypes.includes(file.type)) {
        toast.error(`${file.name}: only JPEG or PNG images are allowed.`);
        continue;
      }
      if (file.size > maxBytes) {
        toast.error(`${file.name}: file must be 5MB or smaller.`);
        continue;
      }
      nextPhotos.push(file);
    }

    setExtraWorkForm((prev) => ({ ...prev, photos: nextPhotos }));
    e.target.value = "";
  };

  const handleRemoveExtraWorkPhoto = (index) => {
    setExtraWorkForm((prev) => ({
      ...prev,
      photos: prev.photos.filter((_, i) => i !== index),
    }));
  };

  const handleRaiseAdditionalWork = async () => {
    const partsNum = Number(extraWorkForm.parts || 0);
    const labourNum = Number(extraWorkForm.labour || 0);

    if (!extraWorkForm.note.trim()) {
      toast.error("Please describe the additional fault found.");
      return;
    }
    if (partsNum + labourNum <= 0) {
      toast.error("Parts + labour must be greater than ₦0.");
      return;
    }
    try {
      setExtraWorkSending(true);
      await engService.raiseAdditionalWork(repairId, {
        note: extraWorkForm.note.trim(),
        parts: partsNum,
        labour: labourNum,
        photos: extraWorkForm.photos,
      });
      setRepair((prev) =>
        prev ? { ...prev, status: "awaiting_customer_approval" } : prev
      );
      toast.success("Additional work request sent to customer!");
      setExtraWorkForm({ note: "", parts: "", labour: "", photos: [] });
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to raise additional work");
    } finally {
      setExtraWorkSending(false);
    }
  };

  const handleStatusChange = async (newStatus) => {
    if (repair?.status === newStatus) {
      toast.info("Repair is already in this status");
      return;
    }

    if (!confirm(`Change status to "${newStatus.replace(/_/g, " ")}"?`)) {
      return;
    }

    try {
      setStatusLoading(true);
      const updatedRepair = await engService.updateRepairStatus(repairId, newStatus);
      setRepair((prev) => ({ ...prev, ...updatedRepair, status: newStatus }));
      toast.success(`Status updated to ${newStatus.replace(/_/g, " ")}`);
    } catch (err) {
      console.error("Status update failed:", err);
      const errorMessage =
        err.response?.data?.message ||
        err.message ||
        "Failed to update repair status";
      toast.error(errorMessage);
    } finally {
      setStatusLoading(false);
    }
  };

  const handleSaveNote = async () => {
    if (!notes.trim()) return toast.error("Please enter a note");

    try {
      setNoteSaving(true);
      const updated = await engService.addorUpdateRepairNote(repairId, notes);
      setRepair((prev) => ({ ...prev, ...updated }));
      toast.success("Note saved successfully");
    } catch (err) {
      toast.error("Failed to save note");
      console.error(err);
    } finally {
      setNoteSaving(false);
    }
  };

  const handleAddPart = () => {
    setParts([...parts, { partName: "", quantity: 1, cost: "" }]);
  };

  const handlePartChange = (index, field, value) => {
    const newParts = [...parts];
    newParts[index][field] = value;
    setParts(newParts);
  };

  const handleRemovePart = (index) => {
    setParts(parts.filter((_, i) => i !== index));
  };

  const handleSaveParts = async () => {
    const validParts = parts.filter(
      (p) => p.partName.trim() && p.quantity > 0 && p.cost !== ""
    );

    if (validParts.length === 0) {
      return toast.error("Add at least one valid part");
    }

    try {
      const response = await engService.addPartsUsedInRepair(repairId, validParts);
      setRepair((prev) => ({ ...prev, ...response }));
      toast.success("Parts added successfully");
    } catch (err) {
      toast.error("Failed to add parts");
      console.error(err);
    }
  };

  if (loading) {
    return <TecNurxLoader minHeight="65vh" size="lg" />;
  }

  if (error || !repair) {
    return (
      <div className="eng-detail-error">
        <AlertCircle size={48} color="#ef4444" style={{ margin: "0 auto 12px" }} />
        <h2 style={{ margin: "0 0 8px", color: "#111827" }}>
          {error || "Repair not found"}
        </h2>
        <p style={{ color: "#64748b", marginBottom: "20px" }}>
          We could not load this repair record.
        </p>
        <button type="button" onClick={() => router.back()} className="eng-back-btn">
          <ArrowLeft size={16} /> Go Back
        </button>
      </div>
    );
  }

  const shortId = repair._id ? String(repair._id).slice(-8).toUpperCase() : "N/A";
  const deviceName = `${repair.device?.brand || ""} ${repair.device?.model || "Device"}`.trim();
  const quoteTotal = Number(quoteForm.parts || 0) + Number(quoteForm.labour || 0);
  const customerInitials = `${repair.user?.fname?.[0] || ""}${
    repair.user?.lname?.[0] || ""
  }`.toUpperCase() || "CU";

  return (
    <div className="eng-detail-page">
      {/* Topbar Back + Engineer Tag */}
      <div className="eng-detail-topbar">
        <button type="button" onClick={() => router.back()} className="eng-back-btn">
          <ArrowLeft size={16} />
          <span>Back to Repairs</span>
        </button>

        <span className="eng-workspace-tag">
          <Wrench size={14} />
          <span>Engineer Job Sheet</span>
        </span>
      </div>

      {/* Header */}
      <div className="eng-detail-header">
        <div>
          <div className="eng-detail-title-row">
            <h1 className="eng-detail-title">{deviceName}</h1>
          </div>
          <p className="eng-detail-subtitle" style={{ textTransform: "capitalize" }}>
            {repair.issueCategory?.replace(/_/g, " ") || "Repair Service"} · Repair #
            {shortId}
          </p>
        </div>
      </div>

      {/* Pitch-Black Status & Engineer Controls Banner */}
      <div className="eng-detail-hero">
        <div className="eng-detail-hero-left">
          <span className="eng-detail-hero-label">Current Job Status</span>
          <h2 className="eng-detail-hero-status">
            {repair.status?.replace(/_/g, " ") || "Pending"}
          </h2>
          <div className="eng-detail-hero-date">
            <Clock size={14} />
            <span>
              Assigned:{" "}
              {repair.assignedAt
                ? new Date(repair.assignedAt).toLocaleString()
                : new Date(repair.createdAt).toLocaleString()}
            </span>
          </div>
        </div>

        <div className="eng-status-controls">
          <span className="eng-status-controls-label">Update Job Status</span>
          <div className="eng-status-btn-group">
            {engineerStatuses.map((status) => (
              <button
                key={status}
                type="button"
                onClick={() => handleStatusChange(status)}
                disabled={statusLoading || repair.status === status}
                className={`eng-status-action-btn ${
                  repair.status === status ? "active" : ""
                }`}
              >
                {statusLoading ? (
                  <Loader2 size={14} className="notif-spinner" />
                ) : (
                  status.replace(/_/g, " ")
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 2-Column Detail Grid */}
      <div className="eng-detail-grid">
        {/* Left Column: Device & Issue, Send Quote, Parts Used */}
        <div className="eng-detail-col">
          {/* Device & Issue */}
          <div className="eng-detail-card">
            <h2 className="eng-detail-card-title">
              <Smartphone size={19} />
              <span>Device &amp; fault details</span>
            </h2>

            <div className="eng-kv-list">
              <div className="eng-kv-row">
                <span className="eng-kv-label">Device</span>
                <span className="eng-kv-value">{deviceName}</span>
              </div>
              <div className="eng-kv-row">
                <span className="eng-kv-label">Type</span>
                <span className="eng-kv-value" style={{ textTransform: "capitalize" }}>
                  {repair.device?.deviceType || "—"}
                </span>
              </div>
              <div className="eng-kv-row">
                <span className="eng-kv-label">Issue category</span>
                <span className="eng-kv-value" style={{ textTransform: "capitalize" }}>
                  {repair.issueCategory?.replace(/_/g, " ") || "—"}
                </span>
              </div>
              <div className="eng-kv-row">
                <span className="eng-kv-label">
                  {repair.actualCost?.totalCost > 0
                    ? "Actual cost"
                    : repair.quote?.total > 0
                    ? "Quoted total"
                    : repair.bookingCharge?.total > 0
                    ? "Booking charge"
                    : "Estimated cost"}
                </span>
                <span className="eng-kv-value">
                  ₦{Number(
                    (repair.actualCost?.totalCost > 0 ? repair.actualCost.totalCost : null) ??
                      (repair.quote?.total > 0 ? repair.quote.total : null) ??
                      (repair.bookingCharge?.total > 0 ? repair.bookingCharge.total : null) ??
                      repair.estimatedCost?.totalCost ??
                      0
                  ).toLocaleString()}
                </span>
              </div>
            </div>

            {repair.issueDescription && (
              <div className="eng-desc-box">{repair.issueDescription}</div>
            )}

            {repair.photos?.length > 0 && (
              <div className="eng-photo-grid">
                {repair.photos.map((photo, idx) => (
                  <div
                    key={idx}
                    className="eng-photo-item"
                    onClick={() => setLightboxIndex(idx)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") setLightboxIndex(idx);
                    }}
                    title="Click to enlarge"
                  >
                    <Image
                      src={photo}
                      alt={`Issue photo ${idx + 1}`}
                      width={400}
                      height={400}
                      className="eng-photo-img"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Send Quote to Customer */}
          <div className="eng-detail-card">
            <h2 className="eng-detail-card-title">
              <FileText size={19} />
              <span>Send quote to customer</span>
            </h2>

            <div className="eng-form-grid-2">
              <div className="eng-field" style={{ marginBottom: 0 }}>
                <label>Parts cost (₦)</label>
                <input
                  type="text"
                  inputMode="numeric"
                  className="eng-input"
                  value={formatMoneyInput(quoteForm.parts)}
                  onChange={(e) =>
                    setQuoteForm((prev) => ({
                      ...prev,
                      parts: sanitizeMoneyInput(e.target.value),
                    }))
                  }
                  placeholder="0"
                />
              </div>

              <div className="eng-field" style={{ marginBottom: 0 }}>
                <label>Labour cost (₦)</label>
                <input
                  type="text"
                  inputMode="numeric"
                  className="eng-input"
                  value={formatMoneyInput(quoteForm.labour)}
                  onChange={(e) =>
                    setQuoteForm((prev) => ({
                      ...prev,
                      labour: sanitizeMoneyInput(e.target.value),
                    }))
                  }
                  placeholder="0"
                />
              </div>
            </div>

            <div className="eng-quote-total-bar">
              <span style={{ color: "#64748b", fontWeight: 500 }}>Quote Total</span>
              <strong style={{ color: "#111827", fontSize: "16px" }}>
                ₦{quoteTotal.toLocaleString()}
              </strong>
            </div>

            <div className="eng-field">
              <label>Diagnostic findings</label>
              <textarea
                rows={3}
                className="eng-textarea"
                value={quoteForm.findings}
                onChange={(e) =>
                  setQuoteForm((prev) => ({ ...prev, findings: e.target.value }))
                }
                placeholder="Describe diagnostic findings for the customer..."
              />
            </div>

            <button
              type="button"
              onClick={handleSendQuote}
              disabled={quoteSending}
              className="eng-btn-primary"
            >
              {quoteSending ? (
                <>
                  <Loader2 size={15} className="notif-spinner" />
                  <span>Sending...</span>
                </>
              ) : (
                <>
                  <Send size={15} />
                  <span>Send Quote</span>
                </>
              )}
            </button>
          </div>

          {/* Parts Used */}
          <div className="eng-detail-card">
            <h2 className="eng-detail-card-title">
              <Wrench size={19} />
              <span>Parts used</span>
            </h2>

            {parts.length === 0 ? (
              <p style={{ color: "#64748b", fontSize: "14px", marginBottom: "16px" }}>
                No parts recorded yet.
              </p>
            ) : (
              parts.map((part, index) => (
                <div key={index} className="eng-part-row">
                  <input
                    type="text"
                    placeholder="Part name (e.g. LCD Screen)"
                    value={part.partName}
                    onChange={(e) =>
                      handlePartChange(index, "partName", e.target.value)
                    }
                    className="eng-input"
                  />
                  <input
                    type="number"
                    placeholder="Qty"
                    min="1"
                    value={part.quantity}
                    onChange={(e) =>
                      handlePartChange(index, "quantity", e.target.value)
                    }
                    className="eng-input"
                  />
                  <input
                    type="text"
                    inputMode="numeric"
                    placeholder="₦ Cost"
                    value={formatMoneyInput(part.cost)}
                    onChange={(e) =>
                      handlePartChange(index, "cost", sanitizeMoneyInput(e.target.value))
                    }
                    className="eng-input"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemovePart(index)}
                    className="eng-icon-remove"
                    title="Remove part"
                  >
                    <X size={16} />
                  </button>
                </div>
              ))
            )}

            <div className="eng-btn-row" style={{ marginTop: "14px" }}>
              <button type="button" onClick={handleAddPart} className="eng-btn-outline">
                <Plus size={15} />
                <span>Add Part</span>
              </button>

              <button type="button" onClick={handleSaveParts} className="eng-btn-primary">
                <Save size={15} />
                <span>Save Parts</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Customer Info, Repair Notes, Additional Work */}
        <div className="eng-detail-col">
          {/* Customer Information */}
          <div className="eng-detail-card">
            <h2 className="eng-detail-card-title">
              <User size={19} />
              <span>Customer information</span>
            </h2>

            <div className="eng-customer-head">
              {repair.user?.photo ? (
                <Image
                  src={repair.user.photo}
                  alt={`${repair.user.fname} ${repair.user.lname}`}
                  width={52}
                  height={52}
                  className="eng-customer-avatar"
                />
              ) : (
                <div className="eng-customer-initials">{customerInitials}</div>
              )}
              <div>
                <h3 style={{ margin: "0 0 2px", fontSize: "16px", color: "#111827" }}>
                  {repair.user?.fname} {repair.user?.lname}
                </h3>
                <p style={{ margin: 0, fontSize: "13px", color: "#64748b" }}>
                  {repair.user?.email}
                </p>
              </div>
            </div>

            <div className="eng-kv-list">
              <div className="eng-kv-row">
                <span className="eng-kv-label">Phone</span>
                <span className="eng-kv-value">
                  {repair.user?.phoneNumber || "—"}
                </span>
              </div>
              <div className="eng-kv-row">
                <span className="eng-kv-label">Service type</span>
                <span className="eng-kv-value" style={{ textTransform: "capitalize" }}>
                  {repair.serviceType?.replace(/_/g, " ") || "—"}
                </span>
              </div>
            </div>

            {repair.pickupAddress && (
              <div className="eng-address-box">
                <MapPin size={17} style={{ flexShrink: 0, marginTop: "2px" }} />
                <div>
                  <strong style={{ display: "block", color: "#111827" }}>
                    {repair.pickupAddress.label || "Pickup Address"}
                  </strong>
                  <span>
                    {repair.pickupAddress.formattedAddress ||
                      [
                        repair.pickupAddress.streetAddress,
                        repair.pickupAddress.city,
                        repair.pickupAddress.state,
                      ]
                        .filter(Boolean)
                        .join(", ")}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Repair Notes */}
          <div className="eng-detail-card">
            <h2 className="eng-detail-card-title">
              <FileText size={19} />
              <span>Repair notes</span>
            </h2>

            <div className="eng-field">
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Enter repair notes, findings, resolution steps..."
                rows={4}
                className="eng-textarea"
              />
            </div>

            <button
              type="button"
              onClick={handleSaveNote}
              disabled={noteSaving || !notes.trim()}
              className="eng-btn-primary"
            >
              {noteSaving ? (
                <>
                  <Loader2 size={15} className="notif-spinner" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Save size={15} />
                  <span>Save Note</span>
                </>
              )}
            </button>
          </div>

          {/* Request Additional Work */}
          <div className="eng-detail-card">
            <h2 className="eng-detail-card-title">
              <AlertCircle size={19} />
              <span>Request additional work</span>
            </h2>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
              <div className="eng-field">
                <label>Parts cost (₦)</label>
                <input
                  type="text"
                  inputMode="numeric"
                  className="eng-input"
                  value={formatMoneyInput(extraWorkForm.parts)}
                  onChange={(e) =>
                    setExtraWorkForm((prev) => ({
                      ...prev,
                      parts: sanitizeMoneyInput(e.target.value),
                    }))
                  }
                  placeholder="0"
                />
              </div>

              <div className="eng-field">
                <label>Labour cost (₦)</label>
                <input
                  type="text"
                  inputMode="numeric"
                  className="eng-input"
                  value={formatMoneyInput(extraWorkForm.labour)}
                  onChange={(e) =>
                    setExtraWorkForm((prev) => ({
                      ...prev,
                      labour: sanitizeMoneyInput(e.target.value),
                    }))
                  }
                  placeholder="0"
                />
              </div>
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                fontSize: "13px",
                color: "#475569",
                marginBottom: "12px",
                padding: "8px 12px",
                backgroundColor: "#f8fafc",
                borderRadius: "8px",
              }}
            >
              <span>Total additional cost</span>
              <strong style={{ color: "#0f172a" }}>
                ₦
                {(
                  Number(extraWorkForm.parts || 0) +
                  Number(extraWorkForm.labour || 0)
                ).toLocaleString()}
              </strong>
            </div>

            <div className="eng-field">
              <label>Extra fault discovered</label>
              <textarea
                rows={3}
                className="eng-textarea"
                value={extraWorkForm.note}
                onChange={(e) =>
                  setExtraWorkForm((prev) => ({ ...prev, note: e.target.value }))
                }
                placeholder="Explain the extra fault discovered mid-repair..."
              />
            </div>

            <div className="eng-field">
              <label>Photos (optional, up to 4 · JPEG/PNG, max 5MB each)</label>
              <input
                type="file"
                accept="image/jpeg,image/png"
                multiple
                onChange={handleExtraWorkPhotosChange}
                disabled={extraWorkForm.photos.length >= 4}
                className="eng-input"
                style={{ padding: "8px" }}
              />
              {extraWorkForm.photos.length > 0 && (
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "6px",
                    marginTop: "8px",
                  }}
                >
                  {extraWorkForm.photos.map((file, idx) => (
                    <div
                      key={`${file.name}-${idx}`}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: "8px",
                        fontSize: "12px",
                        padding: "6px 10px",
                        backgroundColor: "#f8fafc",
                        borderRadius: "6px",
                        border: "1px solid #e2e8f0",
                      }}
                    >
                      <span
                        style={{
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {file.name}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleRemoveExtraWorkPhoto(idx)}
                        style={{
                          background: "none",
                          border: "none",
                          cursor: "pointer",
                          color: "#64748b",
                          display: "inline-flex",
                          alignItems: "center",
                        }}
                        title="Remove photo"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={handleRaiseAdditionalWork}
              disabled={extraWorkSending}
              className="eng-btn-yellow"
              style={{ width: "100%" }}
            >
              {extraWorkSending ? (
                <>
                  <Loader2 size={15} className="notif-spinner" />
                  <span>Sending...</span>
                </>
              ) : (
                <span>Send Additional Work Request</span>
              )}
            </button>
          </div>
        </div>
      </div>

      <ImageLightbox
        images={repair.photos || []}
        currentIndex={lightboxIndex}
        onClose={() => setLightboxIndex(null)}
        onChangeIndex={setLightboxIndex}
      />
    </div>
  );
};

export default RepairDetailsPage;
