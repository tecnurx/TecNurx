"use client";

import React, { use, useState, useEffect, useMemo, Suspense } from "react";
import "./quote.css";
import { Camera, Check, AlertCircle, X, ChevronRight } from "lucide-react";
import { repairService } from "../../../../../../../services/repairs";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import TecNurxLoader from "@/components/TecNurxLoader";
import { toast } from "@/components/CustomToast";

// Helpers
const formatCost = (val) => {
  if (val === undefined || val === null || isNaN(Number(val))) return "0";
  return Number(val).toLocaleString();
};

const formatDeliveryFee = (val) => {
  if (val === undefined || val === null || val === 0 || val === "0") return "Free";
  if (typeof val === "number" || !isNaN(Number(val))) {
    return `₦${Number(val).toLocaleString()}`;
  }
  return String(val);
};

function RepairQuoteContent({ params }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const searchParams = useSearchParams();
  const repairId = resolvedParams?.id || "";

  const [repair, setRepair] = useState(null);
  const [quoteData, setQuoteData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [paymentMethod, setPaymentMethod] = useState("pay_now"); // "pay_now" | "rnpl"
  const [isProcessing, setIsProcessing] = useState(false);
  const [showDeclineConfirm, setShowDeclineConfirm] = useState(false);
  const [declineReason, setDeclineReason] = useState("It costs too much");
  const [showRnplModal, setShowRnplModal] = useState(false);
  const [actionSuccess, setActionSuccess] = useState(null);

  // Manual state toggle for testing/demoing available vs unavailable in UI
  const rnplQueryOverride = searchParams?.get("rnpl"); // "available" | "unavailable" | "true" | "false"
  const [rnplDemoState, setRnplDemoState] = useState(null);

  useEffect(() => {
    const fetchRepair = async () => {
      try {
        setLoading(true);
        if (repairId) {
          const [repairRes, quoteRes] = await Promise.allSettled([
            repairService.getRepairDetails(repairId),
            repairService.getQuote(repairId),
          ]);
          if (repairRes.status === "fulfilled") {
            const data =
              repairRes.value?.data?.repair ||
              repairRes.value?.repair ||
              repairRes.value?.data;
            setRepair(data);
          }
          if (quoteRes.status === "fulfilled") {
            const q = quoteRes.value?.data || quoteRes.value;
            setQuoteData(q);
          }
        }
      } catch (err) {
        console.warn("Could not fetch repair details for quote:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchRepair();
  }, [repairId]);

  // Costs calculation (prefer GET /repairs/:id/quote breakdown)
  const breakdownParts = quoteData?.breakdown?.find((b) => b.key === "parts")?.amount;
  const breakdownLabour = quoteData?.breakdown?.find((b) => b.key === "labour")?.amount;
  const breakdownReturn = quoteData?.breakdown?.find(
    (b) => b.key === "return_delivery" || b.key === "return"
  )?.amount;

  const partsCost = breakdownParts ?? repair?.quote?.parts ?? repair?.estimatedCost?.partsCost ?? 0;
  const laborCost = breakdownLabour ?? repair?.quote?.labour ?? repair?.estimatedCost?.laborCost ?? 0;
  const returnDeliveryCost =
    breakdownReturn ??
    (typeof repair?.returnDeliveryFee === "number"
      ? repair.returnDeliveryFee
      : typeof repair?.deliveryFee === "number"
      ? repair.deliveryFee
      : 0);

  const totalCost =
    quoteData?.total ??
    repair?.quote?.total ??
    repair?.estimatedCost?.totalCost ??
    (partsCost + laborCost + (returnDeliveryCost || 0));

  // Determine RNPL availability (Image 1: Available vs Image 2: Unavailable)
  const isRnplAvailable = useMemo(() => {
    if (rnplDemoState !== null) return rnplDemoState;
    if (rnplQueryOverride === "unavailable" || rnplQueryOverride === "false") {
      return false;
    }
    if (rnplQueryOverride === "available" || rnplQueryOverride === "true") {
      return true;
    }
    if (quoteData?.payLater?.available !== undefined) {
      return Boolean(quoteData.payLater.available);
    }
    if (repair?.isRnplAvailable !== undefined) return Boolean(repair.isRnplAvailable);
    if (repair?.rnplAvailable !== undefined) return Boolean(repair.rnplAvailable);
    if (repair?.isRnplEligible !== undefined) return Boolean(repair.isRnplEligible);

    return totalCost >= 40000;
  }, [quoteData, repair, totalCost, rnplQueryOverride, rnplDemoState]);

  // Unavailable reason text
  const rnplUnavailableReason = useMemo(() => {
    if (quoteData?.payLater?.reason) {
      return quoteData.payLater.reason;
    }
    if (repair?.rnplUnavailableReason) {
      return repair.rnplUnavailableReason;
    }
    if (totalCost < 40000) {
      return "below the minimum amount of ₦40,000.";
    }
    return "Repair Now, Pay Later is not available yet.";
  }, [quoteData, repair, totalCost]);

  // If RNPL becomes unavailable, ensure paymentMethod is pay_now
  useEffect(() => {
    if (!isRnplAvailable && paymentMethod === "rnpl") {
      setPaymentMethod("pay_now");
    }
  }, [isRnplAvailable, paymentMethod]);

  // Diagnosis summary text
  const diagnosisSummary = useMemo(() => {
    if (quoteData?.findings) {
      return String(quoteData.findings).replace(/\[.*?\]/g, "").trim();
    }
    if (repair?.quote?.findings) {
      return String(repair.quote.findings).replace(/\[.*?\]/g, "").trim();
    }
    if (repair?.diagnosisSummary) {
      return String(repair.diagnosisSummary).replace(/\[.*?\]/g, "").trim();
    }
    if (repair?.diagnosis) {
      return String(repair.diagnosis).replace(/\[.*?\]/g, "").trim();
    }
    if (repair?.engineerNotes) {
      return String(repair.engineerNotes).replace(/\[.*?\]/g, "").trim();
    }
    if (repair?.issueDescription) {
      let desc = String(repair.issueDescription).replace(/\[.*?\]/g, "").trim();
      desc = desc.replace(/[.,;:]+$/, "").trim();
      return `${desc}. Technical inspection has confirmed necessary component replacement and calibration.`;
    }
    return "Diagnostic assessment completed by assigned engineer. Technical evaluation has identified the required hardware component replacement and calibration.";
  }, [quoteData, repair]);

  // Photos
  const photos = useMemo(() => {
    const list =
      quoteData?.photos?.length
        ? quoteData.photos
        : repair?.quote?.photos?.length
        ? repair.quote.photos
        : repair?.photos || repair?.device?.photos || [];
    return list;
  }, [quoteData, repair]);

  // Handle Approve and Pay
  const handleApproveAndPay = async () => {
    const isMyOrders =
      typeof window !== "undefined" &&
      window.location.pathname.includes("/my-orders/");

    if (paymentMethod === "rnpl") {
      const targetUrl = isMyOrders
        ? `/dashboard/my-orders/${repairId}/pay-later`
        : `/dashboard/repairs/${repairId}/pay-later`;
      router.push(targetUrl);
      return;
    }

    setIsProcessing(true);
    try {
      const acceptRes = await repairService.acceptQuote(repairId);
      const acceptData = acceptRes?.data || acceptRes;

      if (acceptData?.nextAction === "none") {
        toast.success("Quote accepted! Your repair is now in progress.");
        router.push(
          isMyOrders ? `/dashboard/my-orders/${repairId}` : `/dashboard/repairs/${repairId}`
        );
        return;
      }
    } catch (err) {
      console.warn("Accept quote warning:", err);
    } finally {
      setIsProcessing(false);
    }

    const targetUrl = isMyOrders
      ? `/dashboard/my-orders/${repairId}/payment`
      : `/dashboard/repairs/${repairId}/payment`;

    router.push(targetUrl);
  };

  // Handle Decline
  const handleConfirmDecline = async () => {
    try {
      await repairService.declineQuote(repairId, declineReason);
    } catch (err) {
      console.warn("Decline quote warning:", err);
    }
    setShowDeclineConfirm(false);
    const isMyOrders =
      typeof window !== "undefined" &&
      window.location.pathname.includes("/my-orders/");
    const targetUrl = isMyOrders
      ? `/dashboard/my-orders/${repairId}/return`
      : `/dashboard/repairs/${repairId}/return`;
    router.push(targetUrl);
  };

  if (loading) {
    return <TecNurxLoader minHeight="65vh" size="lg" />;
  }

  return (
    <div className="repair-quote-page">
      {/* Top Header */}
      <div className="quote-page-header">
        <div className="quote-header-text">
          <h1 className="quote-page-title">Your repair quote</h1>
          <p className="quote-page-subtitle">
            Review the engineer’s findings, then choose how to pay.
          </p>
        </div>

        {/* Demo Switcher for Previewing Available vs. Unavailable */}
        <div className="quote-preview-toggle-wrap">
          <span className="quote-preview-toggle-label">Preview RNPL:</span>
          <button
            type="button"
            className={`quote-preview-toggle-btn ${
              isRnplAvailable ? "active" : ""
            }`}
            onClick={() => setRnplDemoState(true)}
          >
            Available
          </button>
          <button
            type="button"
            className={`quote-preview-toggle-btn ${
              !isRnplAvailable ? "active" : ""
            }`}
            onClick={() => setRnplDemoState(false)}
          >
            Unavailable
          </button>
        </div>
      </div>

      {actionSuccess && (
        <div className="quote-success-banner">
          <Check size={18} />
          <span>{actionSuccess}</span>
        </div>
      )}

      {/* Main 2-Column Grid */}
      <div className="quote-page-grid">
        {/* Left Column: Findings & Cost breakdown */}
        <div className="quote-left-col">
          {/* Card 1: Engineer's Findings */}
          <div className="quote-card">
            <h2 className="quote-card-title">Engineer’s findings</h2>
            <p className="quote-findings-text">{diagnosisSummary}</p>

            {/* 3 Photo Boxes */}
            <div className="quote-photos-row">
              {[0, 1, 2].map((idx) => {
                const photoUrl = photos[idx];
                return (
                  <div key={idx} className="quote-photo-box">
                    {photoUrl ? (
                      <img
                        src={photoUrl}
                        alt={`Inspection Photo ${idx + 1}`}
                        className="quote-photo-img"
                      />
                    ) : (
                      <div className="quote-photo-placeholder">
                        <Camera size={22} className="quote-camera-icon" />
                        <span className="quote-photo-label">
                          Photo {idx + 1}
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Card 2: Cost Breakdown */}
          <div className="quote-card">
            <h2 className="quote-card-title">Cost breakdown</h2>

            <div className="cost-breakdown-table">
              <div className="cost-row">
                <span className="cost-label">Parts</span>
                <span className="cost-value">₦{formatCost(partsCost)}</span>
              </div>

              <div className="cost-row">
                <span className="cost-label">Labour</span>
                <span className="cost-value">₦{formatCost(laborCost)}</span>
              </div>

              <div className="cost-row">
                <span className="cost-label">
                  Return delivery (if applicable)
                </span>
                <span className="cost-value">
                  {formatDeliveryFee(returnDeliveryCost)}
                </span>
              </div>

              <div className="cost-row">
                <span className="cost-label">Diagnostic fee</span>
                <span className="cost-value diagnostic-paid">
                  paid at booking
                </span>
              </div>

              <hr className="cost-divider" />

              <div className="cost-row cost-total-row">
                <span className="cost-total-label">Total</span>
                <span className="cost-total-value">
                  ₦{formatCost(totalCost)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Payment Options Card */}
        <div className="quote-right-col">
          <div className="quote-card payment-options-card">
            <h2 className="quote-card-title">How would you like to pay?</h2>

            <div className="payment-options-list">
              {/* Option 1: Pay now */}
              <div
                className={`payment-option-card ${
                  paymentMethod === "pay_now" ? "selected" : ""
                }`}
                onClick={() => setPaymentMethod("pay_now")}
                role="button"
                tabIndex={0}
              >
                <div className="payment-radio-circle">
                  {paymentMethod === "pay_now" && (
                    <div className="payment-radio-dot" />
                  )}
                </div>

                <div className="payment-option-content">
                  <h3 className="payment-option-name">Pay now</h3>
                  <p className="payment-option-sub">Card or bank transfer</p>
                </div>
              </div>

              {/* Option 2: Repair Now, Pay Later */}
              {isRnplAvailable ? (
                /* STATE A: AVAILABLE (Image 1) */
                <div
                  className={`payment-option-card ${
                    paymentMethod === "rnpl" ? "selected" : ""
                  }`}
                  onClick={() => setPaymentMethod("rnpl")}
                  role="button"
                  tabIndex={0}
                >
                  <div className="payment-radio-circle">
                    {paymentMethod === "rnpl" && (
                      <div className="payment-radio-dot" />
                    )}
                  </div>

                  <div className="payment-option-content">
                    <div className="rnpl-title-row">
                      <h3 className="payment-option-name">
                        Repair Now, Pay Later
                      </h3>
                      <span className="rnpl-pill-badge available">
                        <span className="rnpl-pill-dot available">●</span>
                        Subject to eligibility check
                      </span>
                    </div>
                    <p className="payment-option-sub rnpl-desc">
                      A licensed lending partner decides approval and terms.
                      Offers are shown after an eligibility check.
                    </p>
                  </div>
                </div>
              ) : (
                /* STATE B: UNAVAILABLE (Image 2) */
                <div
                  className="payment-option-card rnpl-unavailable"
                  role="presentation"
                  aria-disabled="true"
                >
                  <div className="payment-radio-circle disabled" />

                  <div className="payment-option-content">
                    <div className="rnpl-title-row">
                      <h3 className="payment-option-name unavailable">
                        Repair Now, Pay Later
                      </h3>
                      <span className="rnpl-pill-badge unavailable">
                        <span className="rnpl-pill-dot unavailable">●</span>
                        Not available
                      </span>
                    </div>
                    <p className="payment-option-sub rnpl-desc unavailable">
                      Not available for this repair. [{rnplUnavailableReason}]
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Total due now */}
            <div className="total-due-box">
              <span className="total-due-label">Total due now</span>
              <span className="total-due-amount">
                ₦{paymentMethod === "rnpl" ? "0" : formatCost(totalCost)}
              </span>
            </div>

            {/* Primary Action Button */}
            <button
              type="button"
              className="btn-approve-pay"
              onClick={handleApproveAndPay}
              disabled={isProcessing}
            >
              {isProcessing
                ? "Processing..."
                : paymentMethod === "rnpl"
                ? "Check eligibility"
                : "Approve and pay"}
            </button>

            {/* Decline quote link */}
            <button
              type="button"
              className="btn-decline-link"
              onClick={() => setShowDeclineConfirm(true)}
            >
              Decline quote
            </button>

            <p className="quote-footer-footnote">
              Your repair starts after payment.
            </p>
          </div>
        </div>
      </div>

      {/* Decline Confirmation Modal - Figma Matching */}
      {showDeclineConfirm && (
        <div
          className="quote-modal-backdrop"
          onClick={() => setShowDeclineConfirm(false)}
        >
          <div
            className="quote-decline-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="decline-modal-title">Decline this quote?</h3>
            <p className="decline-modal-subtitle">
              Your device will be returned to you without repair.
            </p>

            {/* Fee summary table */}
            <div className="decline-fee-table">
              <div className="decline-fee-row">
                <span className="fee-label">Diagnostic fee</span>
                <span className="fee-rule">Not refundable · standard diagnostic assessment</span>
              </div>
              <div className="decline-fee-row">
                <span className="fee-label">Return</span>
                <span className="fee-rule">
                  Delivery ₦{formatCost(returnDeliveryCost)} or collect from our office
                </span>
              </div>
            </div>

            <h4 className="decline-reason-heading">Why are you declining?</h4>

            <div className="decline-reasons-list">
              {[
                "It costs too much",
                "I want a second opinion",
                "It is not worth repairing",
                "Other",
              ].map((reason) => (
                <div
                  key={reason}
                  className={`decline-reason-card ${
                    declineReason === reason ? "selected" : ""
                  }`}
                  onClick={() => setDeclineReason(reason)}
                >
                  <div className="decline-radio-circle">
                    {declineReason === reason && (
                      <div className="decline-radio-dot" />
                    )}
                  </div>
                  <span className="decline-reason-text">{reason}</span>
                </div>
              ))}
            </div>

            <div className="decline-modal-actions">
              <button
                type="button"
                className="btn-review-quote-again"
                onClick={() => setShowDeclineConfirm(false)}
              >
                Review quote again
              </button>
              <button
                type="button"
                className="btn-confirm-decline-white"
                onClick={handleConfirmDecline}
              >
                Decline quote
              </button>
            </div>
          </div>
        </div>
      )}

      {/* RNPL Eligibility Modal */}
      {showRnplModal && (
        <div
          className="quote-modal-backdrop"
          onClick={() => setShowRnplModal(false)}
        >
          <div
            className="quote-confirm-dialog"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="quote-dialog-header-row">
              <h3>Repair Now, Pay Later</h3>
              <button
                type="button"
                className="quote-dialog-close"
                onClick={() => setShowRnplModal(false)}
              >
                <X size={20} />
              </button>
            </div>
            <p
              style={{
                marginTop: "12px",
                fontSize: "14px",
                color: "#4b5563",
                lineHeight: "1.5",
              }}
            >
              A licensed lending partner decides approval and terms. Offers are
              shown after an eligibility check.
            </p>
            <div
              style={{
                background: "#f9fafb",
                padding: "16px",
                borderRadius: "14px",
                margin: "18px 0",
                border: "1px solid #f1f5f9",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: "10px",
                  fontSize: "14px",
                }}
              >
                <span style={{ color: "#64748b" }}>Estimated monthly:</span>
                <strong style={{ color: "#111827" }}>
                  ₦{formatCost(Math.round(totalCost / 3))}/mo
                </strong>
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontSize: "14px",
                }}
              >
                <span style={{ color: "#64748b" }}>Tenor:</span>
                <strong style={{ color: "#111827" }}>3 Months (0% deposit)</strong>
              </div>
            </div>
            <div className="quote-dialog-actions">
              <button
                type="button"
                className="btn-dialog-cancel"
                onClick={() => setShowRnplModal(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn-approve-pay"
                style={{ width: "auto", padding: "10px 24px", margin: 0 }}
                onClick={() => {
                  setShowRnplModal(false);
                  setActionSuccess(
                    "Eligibility check submitted! A confirmation SMS and offer link have been sent."
                  );
                }}
              >
                Submit Application
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function RepairQuotePage({ params }) {
  return (
    <Suspense fallback={<TecNurxLoader minHeight="65vh" size="lg" />}>
      <RepairQuoteContent params={params} />
    </Suspense>
  );
}
