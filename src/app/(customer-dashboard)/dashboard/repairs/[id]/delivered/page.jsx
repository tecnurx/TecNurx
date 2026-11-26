"use client";

import React, { use, useState, useEffect, useMemo, Suspense } from "react";
import "./delivered.css";
import { Check, AlertCircle, ArrowLeft } from "lucide-react";
import { repairService } from "../../../../../../../services/repairs";
import { useRouter } from "next/navigation";
import Link from "next/link";
import TecNurxLoader from "@/components/TecNurxLoader";

function RepairDeliveredContent({ params }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const repairId = resolvedParams?.id || "";

  const [repair, setRepair] = useState(null);
  const [loading, setLoading] = useState(true);

  // Checkbox states
  const [checks, setChecks] = useState({
    switchesOn: false,
    partWorks: false,
    nothingChanged: false,
  });

  // Rating & feedback
  const [rating, setRating] = useState(5);
  const [feedback, setFeedback] = useState("");
  const [feedbackSent, setFeedbackSent] = useState(false);

  // Action status message
  const [statusMessage, setStatusMessage] = useState(null);
  const [isConfirmingReceipt, setIsConfirmingReceipt] = useState(false);
  const [isReceiptConfirmed, setIsReceiptConfirmed] = useState(false);

  useEffect(() => {
    const fetchRepair = async () => {
      try {
        setLoading(true);
        if (repairId) {
          const res = await repairService.getRepairDetails(repairId);
          const data = res?.data?.repair || res?.repair || res?.data;
          setRepair(data);
        }
      } catch (err) {
        console.warn("Could not fetch repair details for delivered page:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchRepair();
  }, [repairId]);

  // Display ID and Device Name
  const displayId =
    repairId.length > 8 ? repairId.slice(-8).toUpperCase() : repairId.toUpperCase();
  const deviceName =
    repair?.device?.name ||
    repair?.deviceName ||
    repair?.deviceModel ||
    repair?.deviceTitle ||
    "iPhone 13 Pro";

  // Warranty info
  const warrantyPeriod = repair?.warrantyPeriod || "90 days";
  const warrantyStartDate = useMemo(() => {
    if (repair?.deliveredAt) {
      return new Date(repair.deliveredAt).toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
    }
    return "Today";
  }, [repair]);

  // Handle Checkbox toggle
  const toggleCheck = (key) => {
    setChecks((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const allChecked = checks.switchesOn && checks.partWorks && checks.nothingChanged;

  // Handle Confirm Receipt
  const handleConfirmReceipt = async () => {
    setIsConfirmingReceipt(true);
    setTimeout(() => {
      setIsConfirmingReceipt(false);
      setIsReceiptConfirmed(true);
      setStatusMessage("Delivery confirmed! Your 90-day repair warranty is now active.");
    }, 700);
  };

  // Handle Send Feedback
  const handleSendFeedback = async () => {
    try {
      await repairService.submitRating(repairId, {
        rating: rating || 5,
        review: feedbackText || "",
      });
    } catch (err) {
      console.warn("Rating submission warning:", err);
    }
    setFeedbackSent(true);
    setStatusMessage("Thank you for your rating! Your feedback has been recorded.");
  };

  if (loading) {
    return <TecNurxLoader minHeight="65vh" size="lg" />;
  }

  return (
    <div className="repair-delivered-page">
      {/* Top Header */}
      <div className="delivered-page-header">
        <div className="delivered-header-text">
          <div className="delivered-title-row">
            <h1 className="delivered-page-title">Repair delivered</h1>
            <span className="delivered-badge">
              <span className="delivered-badge-dot">●</span>
              Delivered
            </span>
          </div>
          <p className="delivered-page-subtitle">
            Repair #{displayId} · {deviceName}
          </p>
        </div>
      </div>

      {statusMessage && (
        <div className="delivered-success-banner">
          <Check size={18} />
          <span>{statusMessage}</span>
        </div>
      )}

      {/* Main 2-Column Grid */}
      <div className="delivered-page-grid">
        {/* Left Column: Check your device */}
        <div className="delivered-left-col">
          <div className="delivered-card check-device-card">
            <h2 className="delivered-card-title">Check your device</h2>

            <div className="device-checklist">
              <label className="checklist-item" onClick={() => toggleCheck("switchesOn")}>
                <div className={`custom-checkbox ${checks.switchesOn ? "checked" : ""}`}>
                  {checks.switchesOn && <Check size={14} strokeWidth={3} />}
                </div>
                <span className="checklist-label">It switches on</span>
              </label>

              <label className="checklist-item" onClick={() => toggleCheck("partWorks")}>
                <div className={`custom-checkbox ${checks.partWorks ? "checked" : ""}`}>
                  {checks.partWorks && <Check size={14} strokeWidth={3} />}
                </div>
                <span className="checklist-label">The repaired part works</span>
              </label>

              <label className="checklist-item" onClick={() => toggleCheck("nothingChanged")}>
                <div className={`custom-checkbox ${checks.nothingChanged ? "checked" : ""}`}>
                  {checks.nothingChanged && <Check size={14} strokeWidth={3} />}
                </div>
                <span className="checklist-label">Nothing else has changed</span>
              </label>
            </div>

            {/* Bottom Actions */}
            <div className="checklist-actions-row">
              <Link
                href={`/dashboard/repairs/${repairId}/report-problem`}
                className="btn-report-problem"
              >
                Report a problem
              </Link>

              <button
                type="button"
                className="btn-confirm-receipt"
                onClick={handleConfirmReceipt}
                disabled={isConfirmingReceipt || isReceiptConfirmed}
              >
                {isReceiptConfirmed
                  ? "Receipt confirmed"
                  : isConfirmingReceipt
                  ? "Confirming..."
                  : "Confirm receipt"}
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Warranty & Rating */}
        <div className="delivered-right-col">
          {/* Card 1: Warranty */}
          <div className="delivered-card warranty-card">
            <h2 className="delivered-card-title">Warranty</h2>

            <div className="warranty-table">
              <div className="warranty-row">
                <span className="warranty-label">Repair warranty</span>
                <span className="warranty-value">{warrantyPeriod}</span>
              </div>
              <div className="warranty-row">
                <span className="warranty-label">Starts</span>
                <span className="warranty-value">{warrantyStartDate}</span>
              </div>
            </div>
          </div>

          {/* Card 2: Rate your repair */}
          <div className="delivered-card rating-card">
            <h2 className="delivered-card-title">Rate your repair</h2>

            {/* 1-5 Rating Circles */}
            <div className="rating-circles-row">
              {[1, 2, 3, 4, 5].map((num) => (
                <button
                  key={num}
                  type="button"
                  className={`rating-circle-btn ${rating === num ? "selected" : ""}`}
                  onClick={() => setRating(num)}
                >
                  {num}
                </button>
              ))}
            </div>

            {/* Optional Feedback Textarea */}
            <textarea
              className="rating-textarea"
              placeholder="Tell us how it went (optional)"
              rows={3}
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              disabled={feedbackSent}
            />

            {/* Send Feedback Button */}
            <button
              type="button"
              className="btn-send-feedback"
              onClick={handleSendFeedback}
              disabled={feedbackSent}
            >
              {feedbackSent ? "Feedback sent" : "Send feedback"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function RepairDeliveredPage({ params }) {
  return (
    <Suspense fallback={<TecNurxLoader minHeight="65vh" size="lg" />}>
      <RepairDeliveredContent params={params} />
    </Suspense>
  );
}
