"use client";

import React, { useEffect, useState, useMemo, use } from "react";
import "./detail.css";
import { Check, Smartphone, X } from "lucide-react";
import { repairService } from "../../../../../../services/repairs";
import Link from "next/link";
import { useRouter } from "next/navigation";
import TecNurxLoader from "@/components/TecNurxLoader";

// Helper to safely format address whether it's an object, string, or undefined
const formatAddress = (addr) => {
  if (!addr) return "14 Victoria Island, Lagos";
  if (typeof addr === "string") return addr;
  if (typeof addr === "object") {
    if (addr.formattedAddress) return String(addr.formattedAddress);
    const parts = [
      addr.streetAddress,
      addr.city,
      addr.state,
      addr.country,
    ].filter(Boolean);
    if (parts.length > 0) return parts.join(", ");
    if (addr.label) return String(addr.label);
    if (addr.street) return String(addr.street);
  }
  return "14 Victoria Island, Lagos";
};

// Helper to safely format logistics partner
const formatLogisticsPartner = (partner, serviceType) => {
  if (partner) {
    if (typeof partner === "string") return partner;
    if (typeof partner === "object") {
      return partner.name || partner.companyName || partner.title || "GIG Logistics";
    }
  }
  if (serviceType === "pickup_repair") return "TecNurx Logistics (Pickup & Return)";
  if (serviceType === "walk_in") return "Walk-in Center";
  return "GIG Logistics";
};

// Helper to safely format delivery fee
const formatDeliveryFee = (fee) => {
  if (fee === undefined || fee === null || fee === 0 || fee === "0") return "Free";
  if (typeof fee === "number") return `₦${fee.toLocaleString()}`;
  if (typeof fee === "string") return fee.startsWith("₦") ? fee : `₦${fee}`;
  if (typeof fee === "object") {
    return fee.amount ? `₦${Number(fee.amount).toLocaleString()}` : "Free";
  }
  return "Free";
};

// Helper to safely format estimated return date
const formatEstimatedReturn = (val, createdAt) => {
  if (val) {
    if (typeof val === "string") {
      const d = new Date(val);
      if (!isNaN(d.getTime())) {
        return d.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        });
      }
      return val;
    }
    if (typeof val === "object" && val.date) {
      return formatEstimatedReturn(val.date);
    }
  }
  if (createdAt) {
    const returnDate = new Date(createdAt);
    returnDate.setDate(returnDate.getDate() + 4);
    return returnDate.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  }
  return "Nov 12, 2026";
};

// Helper to safely format device name
const formatDeviceName = (device) => {
  if (!device) return "Device";
  if (typeof device === "string") return device;
  const brand = (device.brand || "").trim();
  const model = (device.model || "").trim();
  if (brand && model) {
    if (model.toLowerCase().startsWith(brand.toLowerCase())) {
      return model;
    }
    return `${brand.charAt(0).toUpperCase() + brand.slice(1)} ${model}`;
  }
  return brand || model || "Device";
};

// Helper to format issue category nicely (e.g. water_damage -> Water Damage)
const formatIssueCategory = (cat) => {
  if (!cat) return null;
  return cat
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
};

// Helper to safely format issue description
const formatIssue = (repair) => {
  if (!repair) return "Screen replacement";
  if (repair.issueCategory) {
    const catMap = {
      water_damage: "Water damage",
      battery_draining: "Battery replacement",
      screen_replacement: "Screen replacement",
      charging_port: "Charging port",
      camera_issue: "Camera issue",
      speaker_mic: "Speaker & mic",
      hardware_fault: "Hardware diagnostics",
    };
    if (catMap[repair.issueCategory.toLowerCase()]) {
      return catMap[repair.issueCategory.toLowerCase()];
    }
    return repair.issueCategory.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
  }
  const desc = repair.issueDescription || repair.issue;
  if (!desc) return "Screen replacement";
  let text =
    typeof desc === "string"
      ? desc
      : desc.title || desc.name || desc.description || "Screen replacement";
  // Strip any brackets from auto-generated backend strings
  text = text.replace(/\[.*?\]/g, "").trim();
  text = text.replace(/[.,;:]+$/, "").trim();
  return text || "Screen replacement";
};

export default function RepairDetailPage({ params }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const repairId = resolvedParams?.id || "672f019a823e4f0011";

  const [repair, setRepair] = useState(null);
  const [trackData, setTrackData] = useState(null);
  const [quoteData, setQuoteData] = useState(null);
  const [additionalEntries, setAdditionalEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isQuoteModalOpen, setIsQuoteModalOpen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        const [detailRes, trackRes, quoteRes, addRes] = await Promise.allSettled([
          repairService.getRepairDetails(repairId),
          repairService.trackRepair(repairId),
          repairService.getQuote(repairId),
          repairService.getAdditionalWork(repairId),
        ]);

        if (detailRes.status === "fulfilled") {
          const data =
            detailRes.value?.data?.repair ||
            detailRes.value?.repair ||
            detailRes.value?.data;
          setRepair(data);
        }

        if (trackRes.status === "fulfilled") {
          setTrackData(trackRes.value?.data || trackRes.value);
        }

        if (quoteRes.status === "fulfilled") {
          setQuoteData(quoteRes.value?.data || quoteRes.value);
        }

        if (addRes.status === "fulfilled") {
          const list =
            addRes.value?.data?.entries ||
            addRes.value?.entries ||
            addRes.value?.data ||
            [];
          setAdditionalEntries(Array.isArray(list) ? list : []);
        }
      } catch (err) {
        console.warn("Could not load repair detail:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [repairId]);

  // Dynamic Progress timeline sourcing directly from backend trackData.timeline
  const steps = useMemo(() => {
    const createdAtTime = repair?.createdAt
      ? new Date(repair.createdAt).getTime()
      : new Date("2026-10-23T09:10:00Z").getTime();

    // Helper to get formatted timestamp with realistic progression
    const getOffsetTime = (mins) => {
      const d = new Date(createdAtTime + mins * 60000);
      return d.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    };

    // If real backend timeline from GET /repairs/:id/track is present, use it directly!
    if (trackData?.timeline && Array.isArray(trackData.timeline) && trackData.timeline.length > 0) {
      return trackData.timeline.map((item, idx) => {
        const isCompleted = Boolean(item.completed);
        const isActive =
          !isCompleted &&
          (idx === 0 || trackData.timeline[idx - 1]?.completed);

        let actionNote = null;
        if (isActive) {
          if (item.status === "quote_provided" || item.status === "quote_ready") {
            actionNote = "Action needed: review your quote";
          } else if (item.status === "pending_quote") {
            actionNote = "Assessment in progress";
          } else if (item.status === "scheduled") {
            actionNote = "Scheduling repair logistics";
          } else if (item.status === "engineer_assigned") {
            actionNote = "Engineer assigned to device";
          } else if (item.status === "in_progress") {
            actionNote = "Repair in progress";
          }
        }

        return {
          id: item.status || String(idx + 1),
          label: item.label || (item.status ? item.status.replace(/_/g, " ") : `Step ${idx + 1}`),
          completed: isCompleted,
          isActive: isActive,
          date: isCompleted ? getOffsetTime(idx * 60) : null,
          actionNote: actionNote,
        };
      });
    }

    // Fallback if trackData is not yet loaded
    const status = (repair?.status || "pending_quote").toLowerCase();

    // Calculate how many of the 14 steps are completed
    let completedCount = 1;
    if (status === "completed" || status === "delivered") completedCount = 14;
    else if (status === "out_for_delivery") completedCount = 12;
    else if (status === "quality_check" || status === "repaired") completedCount = 10;
    else if (status === "in_progress" || status === "in_repair") completedCount = 9;
    else if (status === "paid" || status === "payment_completed") completedCount = 8;
    else if (
      status === "quote_ready" ||
      status === "quote_provided" ||
      status === "awaiting_approval"
    ) {
      completedCount = 7;
    } else if (status === "diagnosing" || status === "inspected") {
      completedCount = 6;
    } else if (status === "received") {
      completedCount = 5;
    } else if (status === "in_transit") {
      completedCount = 4;
    } else if (status === "picked_up") {
      completedCount = 3;
    } else if (status === "pickup_scheduled") {
      completedCount = 2;
    } else if (status === "engineer_assigned") {
      completedCount = 1;
    } else if (status === "pending_quote") {
      completedCount = 1;
    }

    const stepDefinitions = [
      { id: "1", label: "Request submitted", offsetMins: 0 },
      { id: "2", label: "Engineer assigned", offsetMins: 5 },
      { id: "3", label: "Pickup scheduled", offsetMins: 110 },
      { id: "4", label: "Picked up", offsetMins: 320 },
      { id: "5", label: "In transit", offsetMins: 395 },
      { id: "6", label: "Received for repair", offsetMins: 440 },
      { id: "7", label: "Diagnosis", offsetMins: 1440 },
      { id: "8", label: "Quote ready", offsetMins: 1560 },
      { id: "9", label: "Payment", offsetMins: null },
      { id: "10", label: "Repair in progress", offsetMins: null },
      { id: "11", label: "Quality check", offsetMins: null },
      { id: "12", label: "Repair completed", offsetMins: null },
      { id: "13", label: "Out for delivery", offsetMins: null },
      { id: "14", label: "Delivered", offsetMins: null },
    ];

    return stepDefinitions.map((step, idx) => {
      const isCompleted = idx < completedCount;
      const isActive = idx === completedCount;
      return {
        id: step.id,
        label: step.label,
        completed: isCompleted,
        isActive: isActive,
        date: isCompleted && step.offsetMins !== null ? getOffsetTime(step.offsetMins) : null,
        actionNote: isActive ? "Action needed: review your quote" : null,
      };
    });
  }, [repair, trackData]);

  const handleOpenSupport = () => {
    const chatBtn = document.querySelector(".tnx-chat-bubble-btn");
    if (chatBtn) {
      chatBtn.click();
    } else {
      router.push("/dashboard/feedback");
    }
  };

  const formatDisplayId = (id) => {
    if (!id) return "TNX-01";
    const clean = String(id);
    return clean.length > 8 ? clean.slice(-8).toUpperCase() : clean.toUpperCase();
  };

  const fullDeviceName = formatDeviceName(repair?.device);
  const issueTitle = formatIssue(repair);

  const submittedDate = repair?.createdAt
    ? new Date(repair.createdAt).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "Nov 4, 2026";

  const pickupAddress = formatAddress(repair?.pickupAddress || repair?.address);
  const logisticsPartner = formatLogisticsPartner(
    repair?.logisticsPartner,
    repair?.serviceType
  );
  const deliveryFee = formatDeliveryFee(repair?.deliveryFee);
  const estimatedReturn = formatEstimatedReturn(
    repair?.estimatedReturn,
    repair?.createdAt
  );

  // Cost details (prefer GET /repairs/:id/quote, then repair.quote, then estimatedCost)
  const qParts = quoteData?.breakdown?.find((b) => b.key === "parts")?.amount;
  const qLabour = quoteData?.breakdown?.find((b) => b.key === "labour")?.amount;
  const laborCost = qLabour ?? repair?.quote?.labour ?? repair?.estimatedCost?.laborCost ?? 0;
  const partsCost = qParts ?? repair?.quote?.parts ?? repair?.estimatedCost?.partsCost ?? 0;
  const totalCost =
    quoteData?.total ??
    repair?.quote?.total ??
    repair?.estimatedCost?.totalCost ??
    (laborCost + partsCost);

  // Status badge label sourced dynamically from backend
  const statusStr = (trackData?.currentStatus || repair?.status || "pending_quote").toLowerCase();
  const isQuoteState =
    statusStr === "quote_ready" ||
    statusStr === "quote_provided" ||
    statusStr === "awaiting_approval";
  const effectiveAdditionalWork =
    additionalEntries.length > 0
      ? additionalEntries
      : Array.isArray(repair?.additionalWork)
      ? repair.additionalWork
      : [];
  const hasPendingAdditionalWork = effectiveAdditionalWork.some(
    (e) => (e.status || "").toLowerCase() === "pending" || !e.status
  );

  const badgeLabel =
    statusStr === "pending_quote"
      ? "Quote requested"
      : isQuoteState
      ? "Quote ready"
      : statusStr.replace(/_/g, " ");

  const badgeClass =
    statusStr === "completed" || statusStr === "delivered"
      ? "badge-success"
      : isQuoteState
      ? "badge-warning"
      : "badge-warning";

  if (loading) {
    return <TecNurxLoader minHeight="65vh" size="lg" />;
  }

  return (
    <div className="repair-detail-wrapper">
      {/* Header Row */}
      <div className="repair-detail-header">
        <div className="detail-header-left">
          <div className="detail-title-line">
            <h1 className="detail-device-title">{fullDeviceName}</h1>
            <span className={`status-pill ${badgeClass}`}>
              <span className="status-dot">●</span>
              <span style={{ textTransform: "capitalize" }}>{badgeLabel}</span>
            </span>
          </div>

          <p className="detail-subtitle">
            {issueTitle} · Repair #{formatDisplayId(repairId)} · Submitted{" "}
            {submittedDate}
          </p>
        </div>

        <div className="detail-header-actions">
          <button
            type="button"
            className="btn-contact-support"
            onClick={handleOpenSupport}
          >
            Contact support
          </button>
          {isQuoteState && (
            <button
              type="button"
              className="btn-review-quote"
              onClick={() => router.push(`/dashboard/repairs/${repairId}/quote`)}
            >
              Review quote
            </button>
          )}
        </div>
      </div>

      {/* Two-Column Grid */}
      <div className="repair-detail-grid">
        {/* Left Column: Progress Timeline Card + Quote & Engineer Summary */}
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          <div className="detail-card">
            <h2 className="detail-card-title">Progress</h2>

          <div className="timeline-container">
            {steps.map((step, idx) => {
              const isCompleted = step.completed;
              const isActive = step.isActive;

              let rowClass = "upcoming";
              if (isCompleted) rowClass = "completed";
              if (isActive) rowClass = "active";

              const formattedTime = step.date;

              return (
                <div key={step.id} className={`timeline-step-row ${rowClass}`}>
                  <div className="timeline-step-indicator">
                    <div className="timeline-circle">
                      {isCompleted && (
                        <Check size={12} strokeWidth={3} color="#ffffff" />
                      )}
                      {isActive && <span className="timeline-active-dot"></span>}
                    </div>
                    {idx < steps.length - 1 && (
                      <div className="timeline-connecting-line"></div>
                    )}
                  </div>

                  <div className="timeline-step-content">
                    <h3 className="timeline-step-label">{step.label}</h3>

                    {formattedTime && (
                      <p className="timeline-step-time">{formattedTime}</p>
                    )}

                    {step.actionNote && (
                      <p className="timeline-step-action-note">
                        {step.actionNote}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
          </div>

          {/* Quote & Engineer Summary (Left column, under Progress) */}
          {(repair?.quote ||
            repair?.engineer ||
            repair?.engineerNotes ||
            repair?.partsUsed?.length > 0 ||
            effectiveAdditionalWork.length > 0) && (
            <div className="detail-card">
              <h3 className="detail-card-title" style={{ marginBottom: "16px" }}>
                Quote &amp; engineer summary
              </h3>

              <div className="info-key-val-list">
                {repair?.engineer && typeof repair.engineer === "object" && (
                  <div className="info-key-val-row">
                    <span className="info-label">Engineer</span>
                    <span className="info-value">
                      {[repair.engineer.fname, repair.engineer.lname]
                        .filter(Boolean)
                        .join(" ") || "Assigned"}
                    </span>
                  </div>
                )}

                {repair?.quote?.findings && (
                  <div className="info-key-val-row">
                    <span className="info-label">Findings</span>
                    <span className="info-value" style={{ textAlign: "right", maxWidth: "65%" }}>
                      {repair.quote.findings}
                    </span>
                  </div>
                )}

                {repair?.engineerNotes && (
                  <div className="info-key-val-row">
                    <span className="info-label">Engineer note</span>
                    <span className="info-value" style={{ textAlign: "right", maxWidth: "65%" }}>
                      {repair.engineerNotes}
                    </span>
                  </div>
                )}

                {repair?.quote && (
                  <>
                    <div className="info-key-val-row">
                      <span className="info-label">Parts</span>
                      <span className="info-value">₦{Number(partsCost).toLocaleString()}</span>
                    </div>
                    <div className="info-key-val-row">
                      <span className="info-label">Labour</span>
                      <span className="info-value">₦{Number(laborCost).toLocaleString()}</span>
                    </div>
                    <div className="info-key-val-row">
                      <span className="info-label">Quote total</span>
                      <span className="info-value" style={{ fontWeight: 700 }}>
                        ₦{Number(totalCost).toLocaleString()}
                      </span>
                    </div>
                    <div className="info-key-val-row">
                      <span className="info-label">Amount paid</span>
                      <span className="info-value">
                        ₦{Number(repair?.amountPaid ?? 0).toLocaleString()}
                      </span>
                    </div>
                    <div className="info-key-val-row">
                      <span className="info-label">Payment status</span>
                      <span className="info-value" style={{ textTransform: "capitalize" }}>
                        {repair?.paymentStatus || "pending"}
                      </span>
                    </div>
                  </>
                )}

                {repair?.partsUsed?.length > 0 && (
                  <div className="info-key-val-row">
                    <span className="info-label">Parts used</span>
                    <span className="info-value" style={{ textAlign: "right" }}>
                      {repair.partsUsed
                        .map(
                          (p) =>
                            `${p.partName} × ${p.quantity || 1} (₦${Number(
                              p.cost || 0
                            ).toLocaleString()})`
                        )
                        .join(", ")}
                    </span>
                  </div>
                )}

                {effectiveAdditionalWork.length > 0 && (
                  <div className="info-key-val-row">
                    <span className="info-label">Additional work</span>
                    <span className="info-value" style={{ textAlign: "right" }}>
                      {effectiveAdditionalWork
                        .map(
                          (a) =>
                            `${a.note || "Extra work"} · ₦${Number(
                              a.amount || 0
                            ).toLocaleString()} (${a.status || "pending"})`
                        )
                        .join("; ")}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Action, Pickup/Delivery, Device Cards */}
        <div className="detail-right-column">
          {/* Card 1: Action needed (Dynamic status) */}
          {hasPendingAdditionalWork ? (
            <div className="action-needed-card">
              <h3 className="action-needed-title">Additional repair needed</h3>
              <p className="action-needed-desc">
                Your engineer found an extra fault during the repair and needs your decision.
              </p>
              <button
                type="button"
                className="action-needed-btn"
                onClick={() => router.push(`/dashboard/repairs/${repairId}/additional-repair`)}
              >
                Review additional work
              </button>
            </div>
          ) : isQuoteState ? (
            <div className="action-needed-card">
              <h3 className="action-needed-title">Action needed</h3>
              <p className="action-needed-desc">
                Your engineer has finished the diagnosis and prepared your quote.
              </p>
              <button
                type="button"
                className="action-needed-btn"
                onClick={() => router.push(`/dashboard/repairs/${repairId}/quote`)}
              >
                Review quote
              </button>
            </div>
          ) : statusStr === "quote_accepted" ? (
            <div className="action-needed-card">
              <h3 className="action-needed-title">Payment needed</h3>
              <p className="action-needed-desc">
                You approved the quote. Complete payment so your repair can start.
              </p>
              <button
                type="button"
                className="action-needed-btn"
                onClick={() => router.push(`/dashboard/repairs/${repairId}/payment`)}
              >
                Pay for repair
              </button>
            </div>
          ) : statusStr === "delivered" || statusStr === "completed" ? (
            <div className="action-needed-card" style={{ borderColor: "#e2e8f0" }}>
              <h3 className="action-needed-title">Repair delivered</h3>
              <p className="action-needed-desc">
                Confirm your device works as expected and rate your repair experience.
              </p>
              <button
                type="button"
                className="action-needed-btn"
                onClick={() => router.push(`/dashboard/repairs/${repairId}/delivered`)}
              >
                Confirm &amp; rate repair
              </button>
            </div>
          ) : statusStr === "pending_quote" ? (
            <div className="action-needed-card" style={{ borderColor: "#e2e8f0" }}>
              <h3 className="action-needed-title">Assessment in progress</h3>
              <p className="action-needed-desc">
                Your repair order has been received. Our engineer is diagnosing your device to prepare your repair quote.
              </p>
              <button
                type="button"
                className="action-needed-btn"
                style={{ backgroundColor: "#000000", color: "#ffffff" }}
                onClick={handleOpenSupport}
              >
                Contact support
              </button>
            </div>
          ) : (
            <div className="action-needed-card" style={{ borderColor: "#e2e8f0" }}>
              <h3 className="action-needed-title">Repair in progress</h3>
              <p className="action-needed-desc">
                Your device is currently progressing through repair and quality checks.
              </p>
              <button
                type="button"
                className="action-needed-btn"
                style={{ backgroundColor: "#000000", color: "#ffffff" }}
                onClick={handleOpenSupport}
              >
                Contact support
              </button>
            </div>
          )}

          {/* Card 2: Pickup and delivery */}
          <div className="detail-card">
            <h3 className="detail-card-title" style={{ marginBottom: "16px" }}>
              Pickup and delivery
            </h3>
            <div className="info-key-val-list">
              <div className="info-key-val-row">
                <span className="info-label">Pickup address</span>
                <span className="info-value">{pickupAddress}</span>
              </div>
              <div className="info-key-val-row">
                <span className="info-label">Logistics partner</span>
                <span className="info-value">{logisticsPartner}</span>
              </div>
              <div className="info-key-val-row">
                <span className="info-label">Delivery fee</span>
                <span className="info-value">{deliveryFee}</span>
              </div>
              <div className="info-key-val-row">
                <span className="info-label">Estimated return</span>
                <span className="info-value">{estimatedReturn}</span>
              </div>
            </div>
          </div>

          {/* Card 3: Device */}
          <div className="detail-card">
            <h3 className="detail-card-title" style={{ marginBottom: "16px" }}>
              Device
            </h3>
            <div className="device-card-content">
              <div className="device-top-row">
                <div className="device-top-info">
                  <div className="device-icon-box">
                    <Smartphone size={20} strokeWidth={1.8} />
                  </div>
                  <div className="device-name-sub">
                    <h4 className="device-name-text">{fullDeviceName}</h4>
                    <span className="device-condition-sub">
                      {repair?.device?.condition === "bought_new" || repair?.device?.condition === "new"
                        ? "Bought new"
                        : "UK used"}
                    </span>
                  </div>
                </div>

                <span className="device-badge-verified">
                  <span className="device-badge-dot">●</span>
                  Verified
                </span>
              </div>

              <hr className="device-divider" />

              <div className="device-issue-row">
                <span className="device-issue-label">Issue</span>
                <span className="device-issue-val">{issueTitle}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quote Review Modal */}
      {isQuoteModalOpen && (
        <div
          className="quote-modal-overlay"
          onClick={() => setIsQuoteModalOpen(false)}
        >
          <div
            className="quote-modal-box"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="quote-modal-header">
              <h3>Repair Quote</h3>
              <button
                type="button"
                className="quote-modal-close-btn"
                onClick={() => setIsQuoteModalOpen(false)}
              >
                <X size={20} />
              </button>
            </div>

            <div className="quote-details-list">
              <div className="quote-row">
                <span>Device:</span>
                <strong>{fullDeviceName}</strong>
              </div>
              <div className="quote-row">
                <span>Service:</span>
                <strong>{issueTitle}</strong>
              </div>
              <div className="quote-row">
                <span>Parts & Materials:</span>
                <span>₦{partsCost.toLocaleString()}</span>
              </div>
              <div className="quote-row">
                <span>Labor & Diagnostics:</span>
                <span>₦{laborCost.toLocaleString()}</span>
              </div>
              <div className="quote-row total">
                <span>Total Estimated Cost:</span>
                <span>₦{totalCost.toLocaleString()}</span>
              </div>
            </div>

            <div className="quote-actions-row">
              <button
                type="button"
                className="btn-approve-quote"
                onClick={() => {
                  alert("Quote approved! Proceeding to payment / repair.");
                  setIsQuoteModalOpen(false);
                }}
              >
                Approve & Proceed
              </button>
              <button
                type="button"
                className="btn-decline-quote"
                onClick={() => setIsQuoteModalOpen(false)}
              >
                Decline
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
