"use client";

import React, { use, useState, useEffect, useMemo, Suspense } from "react";
import "./additional-repair.css";
import { Camera, Check, AlertCircle, ArrowLeft, X } from "lucide-react";
import { repairService } from "../../../../../../../services/repairs";
import { useRouter } from "next/navigation";
import Link from "next/link";
import TecNurxLoader from "@/components/TecNurxLoader";
import { toast } from "@/components/CustomToast";

// Helpers
const formatCost = (val) => {
  if (val === undefined || val === null || isNaN(Number(val))) return "0";
  return Number(val).toLocaleString();
};

function AdditionalRepairContent({ params }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const repairId = resolvedParams?.id || "";

  const [repair, setRepair] = useState(null);
  const [additionalEntries, setAdditionalEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [decision, setDecision] = useState("approve"); // "approve" | "continue_without" | "stop"
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedMessage, setSubmittedMessage] = useState(null);

  useEffect(() => {
    const fetchRepair = async () => {
      try {
        setLoading(true);
        if (repairId) {
          const [repairRes, addRes] = await Promise.allSettled([
            repairService.getRepairDetails(repairId),
            repairService.getAdditionalWork(repairId),
          ]);
          if (repairRes.status === "fulfilled") {
            const data =
              repairRes.value?.data?.repair ||
              repairRes.value?.repair ||
              repairRes.value?.data;
            setRepair(data);
          }
          if (addRes.status === "fulfilled") {
            const list =
              addRes.value?.data?.entries ||
              addRes.value?.entries ||
              addRes.value?.data ||
              [];
            setAdditionalEntries(Array.isArray(list) ? list : []);
          }
        }
      } catch (err) {
        console.warn("Could not fetch repair details for additional repair:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchRepair();
  }, [repairId]);

  const effectiveEntries =
    additionalEntries.length > 0
      ? additionalEntries
      : Array.isArray(repair?.additionalWork)
      ? repair.additionalWork
      : [];
  const activeEntry =
    effectiveEntries.find((e) => (e.status || "").toLowerCase() === "pending") ||
    effectiveEntries[effectiveEntries.length - 1] ||
    null;
  const entryId = activeEntry?._id || activeEntry?.id;

  // Costs
  const originalQuoteCost =
    repair?.quote?.total ?? repair?.estimatedCost?.totalCost ?? 0;
  const additionalCost =
    activeEntry?.amount ??
    repair?.additionalRepair?.cost ??
    repair?.additionalCost ??
    0;
  const newTotalCost = activeEntry?.newTotal ?? (originalQuoteCost + additionalCost);

  // Engineer's note text
  const engineerNote = useMemo(() => {
    if (activeEntry?.note) {
      return String(activeEntry.note).replace(/\[.*?\]/g, "").trim();
    }
    if (repair?.additionalRepair?.note) {
      return String(repair.additionalRepair.note).replace(/\[.*?\]/g, "").trim();
    }
    if (repair?.additionalRepairNote) {
      return String(repair.additionalRepairNote).replace(/\[.*?\]/g, "").trim();
    }
    return "Additional fault identified by the engineer during repair.";
  }, [activeEntry, repair]);

  // Photos
  const photos = useMemo(() => {
    if (activeEntry?.photos?.length) return activeEntry.photos;
    return repair?.additionalRepair?.photos || repair?.photos || [];
  }, [activeEntry, repair]);

  // Fees for stopping repair (e.g. return logistics fee)
  const returnLogisticsFee =
    typeof repair?.returnFee === "number"
      ? `₦${repair.returnFee.toLocaleString()}`
      : "₦3,000 return logistics fee";

  const handleConfirmDecision = async () => {
    setIsSubmitting(true);
    try {
      const apiDecision =
        decision === "continue_without" ? "skip" : decision; // "approve" | "skip" | "stop"

      if (entryId) {
        await repairService.decideAdditionalWork(repairId, entryId, apiDecision);
      }

      if (decision === "approve") {
        if (entryId) {
          try {
            const payRes = await repairService.initiateAdditionalWorkPayment(
              repairId,
              entryId
            );
            const payData = payRes?.data || payRes;
            if (payData?.paymentLink) {
              window.location.href = payData.paymentLink;
              return;
            }
          } catch (payErr) {
            console.warn("Additional work payment init warning:", payErr);
          }
        }
        const isMyOrders =
          typeof window !== "undefined" &&
          window.location.pathname.includes("/my-orders/");
        const targetUrl = isMyOrders
          ? `/dashboard/my-orders/${repairId}/payment`
          : `/dashboard/repairs/${repairId}/payment`;
        router.push(targetUrl);
        return;
      }

      setIsSubmitting(false);
      const msg =
        decision === "continue_without"
          ? "Decision confirmed. The engineer will proceed with only the original repair."
          : "Repair stopped. Our logistics team will contact you to return your device.";
      setSubmittedMessage(msg);
      setTimeout(() => {
        router.push(`/dashboard/repairs/${repairId}`);
      }, 1500);
    } catch (err) {
      console.error("Failed to submit decision:", err);
      toast.error(err?.response?.data?.message || "Failed to submit decision.");
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return <TecNurxLoader minHeight="65vh" size="lg" />;
  }

  return (
    <div className="additional-repair-page">
      {/* Top Header */}
      <div className="additional-page-header">
        <div className="additional-header-text">
          <div className="additional-title-row">
            <h1 className="additional-page-title">Additional repair needed</h1>
            <span className="additional-action-badge">
              <span className="action-badge-dot">●</span>
              Action needed
            </span>
          </div>
          <p className="additional-page-subtitle">
            Your engineer found another fault while repairing.
          </p>
        </div>
      </div>

      {submittedMessage && (
        <div className="additional-success-banner">
          <Check size={18} />
          <span>{submittedMessage}</span>
        </div>
      )}

      {/* Main 2-Column Grid */}
      <div className="additional-page-grid">
        {/* Left Column: Engineer's note & Cost */}
        <div className="additional-left-col">
          {/* Card 1: Engineer's note */}
          <div className="additional-card">
            <h2 className="additional-card-title">Engineer’s note</h2>
            <p className="additional-note-text">{engineerNote}</p>

            {/* 3 Photo Boxes */}
            <div className="additional-photos-row">
              {[0, 1, 2].map((idx) => {
                const photoUrl = photos[idx];
                return (
                  <div key={idx} className="additional-photo-box">
                    {photoUrl ? (
                      <img
                        src={photoUrl}
                        alt={`Inspection Photo ${idx + 1}`}
                        className="additional-photo-img"
                      />
                    ) : (
                      <div className="additional-photo-placeholder">
                        <Camera size={22} className="additional-camera-icon" />
                        <span className="additional-photo-label">
                          Photo {idx + 1}
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Card 2: Cost */}
          <div className="additional-card">
            <h2 className="additional-card-title">Cost</h2>

            <div className="additional-cost-table">
              <div className="cost-row">
                <span className="cost-label">Original quote</span>
                <span className="cost-value">
                  ₦{formatCost(originalQuoteCost)}
                </span>
              </div>

              <div className="cost-row">
                <span className="cost-label">Additional part and labour</span>
                <span className="cost-value">
                  ₦{formatCost(additionalCost)}
                </span>
              </div>

              <hr className="cost-divider" />

              <div className="cost-row cost-total-row">
                <span className="cost-total-label">New total</span>
                <span className="cost-total-value">
                  ₦{formatCost(newTotalCost)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Your decision */}
        <div className="additional-right-col">
          <div className="additional-card decision-card">
            <h2 className="additional-card-title">Your decision</h2>

            <div className="decision-options-list">
              {/* Option 1: Approve the extra work */}
              <div
                className={`decision-option-card ${
                  decision === "approve" ? "selected" : ""
                }`}
                onClick={() => setDecision("approve")}
                role="button"
                tabIndex={0}
              >
                <div className="decision-radio-circle">
                  {decision === "approve" && (
                    <div className="decision-radio-dot" />
                  )}
                </div>
                <div className="decision-option-content">
                  <h3 className="decision-option-name">
                    Approve the extra work
                  </h3>
                  <p className="decision-option-sub">
                    Pay the difference and we continue.
                  </p>
                </div>
              </div>

              {/* Option 2: Continue without it */}
              <div
                className={`decision-option-card ${
                  decision === "continue_without" ? "selected" : ""
                }`}
                onClick={() => setDecision("continue_without")}
                role="button"
                tabIndex={0}
              >
                <div className="decision-radio-circle">
                  {decision === "continue_without" && (
                    <div className="decision-radio-dot" />
                  )}
                </div>
                <div className="decision-option-content">
                  <h3 className="decision-option-name">
                    Continue without it
                  </h3>
                  <p className="decision-option-sub">
                    We repair only the original issue.
                  </p>
                </div>
              </div>

              {/* Option 3: Stop the repair */}
              <div
                className={`decision-option-card ${
                  decision === "stop" ? "selected" : ""
                }`}
                onClick={() => setDecision("stop")}
                role="button"
                tabIndex={0}
              >
                <div className="decision-radio-circle">
                  {decision === "stop" && (
                    <div className="decision-radio-dot" />
                  )}
                </div>
                <div className="decision-option-content">
                  <h3 className="decision-option-name">Stop the repair</h3>
                  <p className="decision-option-sub">
                    We return your device. Fees may apply: {returnLogisticsFee}.
                  </p>
                </div>
              </div>
            </div>

            {/* Confirm Decision Button */}
            <button
              type="button"
              className="btn-confirm-decision"
              onClick={handleConfirmDecision}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Updating repair..." : "Confirm decision"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AdditionalRepairPage({ params }) {
  return (
    <Suspense fallback={<TecNurxLoader minHeight="65vh" size="lg" />}>
      <AdditionalRepairContent params={params} />
    </Suspense>
  );
}
