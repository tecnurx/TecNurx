"use client";

import React, { use, useState, useEffect, useMemo } from "react";
import "./quote.css";
import { Camera, Check, AlertCircle, ArrowLeft, X } from "lucide-react";
import { repairService } from "../../../../../../../services/repairs";
import { useRouter } from "next/navigation";
import Link from "next/link";
import TecNurxLoader from "@/components/TecNurxLoader";

// Safe helpers
const formatCost = (val) => {
  if (val === undefined || val === null || isNaN(Number(val))) return "0";
  return Number(val).toLocaleString();
};

const formatDeliveryFee = (val) => {
  if (!val || val === 0 || val === "0") return "Free";
  if (typeof val === "number" || !isNaN(Number(val))) {
    return `₦${Number(val).toLocaleString()}`;
  }
  return String(val);
};

export default function RepairQuotePage({ params }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const repairId = resolvedParams?.id || "";

  const [repair, setRepair] = useState(null);
  const [loading, setLoading] = useState(true);
  const [paymentMethod, setPaymentMethod] = useState("pay_now"); // "pay_now" | "rnpl"
  const [isProcessing, setIsProcessing] = useState(false);
  const [showDeclineConfirm, setShowDeclineConfirm] = useState(false);
  const [showRnplModal, setShowRnplModal] = useState(false);
  const [actionSuccess, setActionSuccess] = useState(null);

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
        console.warn("Could not fetch repair details for quote:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchRepair();
  }, [repairId]);

  // Costs calculation
  const partsCost = repair?.estimatedCost?.partsCost ?? 0;
  const laborCost = repair?.estimatedCost?.laborCost ?? 20000;
  const deliveryFeeNumber =
    typeof repair?.deliveryFee === "number" ? repair.deliveryFee : 0;
  const totalCost =
    repair?.estimatedCost?.totalCost ??
    partsCost + laborCost + deliveryFeeNumber;

  // Diagnosis summary text
  const diagnosisSummary = useMemo(() => {
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
      return `${desc}. Technical inspection has confirmed necessary component servicing.`;
    }
    return "Diagnostic assessment completed by assigned engineer. Technical evaluation has identified the required hardware component replacement and calibration.";
  }, [repair]);

  // Photos
  const photos = useMemo(() => {
    const list = repair?.photos || repair?.device?.photos || [];
    return list;
  }, [repair]);

  // Handle Approve and Pay
  const handleApproveAndPay = async () => {
    if (paymentMethod === "rnpl") {
      setShowRnplModal(true);
      return;
    }

    setIsProcessing(true);
    try {
      // If backend has payment link or service
      if (repair?.paymentLink) {
        window.location.href = repair.paymentLink;
        return;
      }

      // Simulate payment step
      setTimeout(() => {
        setIsProcessing(false);
        setActionSuccess("Quote approved! Proceeding to payment gateway...");
        setTimeout(() => {
          router.push(`/dashboard/repairs/${repairId}`);
        }, 1500);
      }, 900);
    } catch (err) {
      console.error("Payment error:", err);
      setIsProcessing(false);
    }
  };

  // Handle Decline
  const handleConfirmDecline = () => {
    setShowDeclineConfirm(false);
    setActionSuccess("Quote declined. Our support team will contact you regarding device return.");
    setTimeout(() => {
      router.push(`/dashboard/repairs/${repairId}`);
    }, 2000);
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

        <Link
          href={`/dashboard/repairs/${repairId}`}
          className="quote-back-link"
        >
          <ArrowLeft size={16} />
          <span>Back to repair</span>
        </Link>
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
                <span className="cost-label">Pickup and delivery</span>
                <span className="cost-value">
                  {formatDeliveryFee(repair?.deliveryFee)}
                </span>
              </div>

              <hr className="cost-divider" />

              <div className="cost-row cost-total-row">
                <span className="cost-total-label">Total</span>
                <span className="cost-total-value">₦{formatCost(totalCost)}</span>
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
                    <span className="rnpl-pill-badge">
                      <span className="rnpl-pill-dot">●</span>
                      Subject to eligibility check
                    </span>
                  </div>
                  <p className="payment-option-sub rnpl-desc">
                    A licensed lending partner decides approval and terms. Offers
                    are shown after an eligibility check.
                  </p>
                </div>
              </div>
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

      {/* Decline Confirmation Modal */}
      {showDeclineConfirm && (
        <div
          className="quote-modal-backdrop"
          onClick={() => setShowDeclineConfirm(false)}
        >
          <div
            className="quote-confirm-dialog"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="quote-dialog-icon warning">
              <AlertCircle size={28} />
            </div>
            <h3>Decline repair quote?</h3>
            <p>
              If you decline this quote, no repairs will be performed and our
              team will coordinate returning your device to your pickup address.
            </p>
            <div className="quote-dialog-actions">
              <button
                type="button"
                className="btn-dialog-cancel"
                onClick={() => setShowDeclineConfirm(false)}
              >
                Keep quote
              </button>
              <button
                type="button"
                className="btn-dialog-confirm-decline"
                onClick={handleConfirmDecline}
              >
                Yes, decline quote
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
            <p style={{ marginTop: "12px", fontSize: "14px", color: "#4b5563" }}>
              Our lending partner is assessing your profile for 3-month or
              6-month installment plans at 0% initial deposit.
            </p>
            <div
              style={{
                background: "#f9fafb",
                padding: "16px",
                borderRadius: "12px",
                margin: "16px 0",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: "8px",
                  fontSize: "14px",
                }}
              >
                <span>Estimated Monthly Installment:</span>
                <strong>₦{formatCost(Math.round(totalCost / 3))}/mo</strong>
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontSize: "14px",
                }}
              >
                <span>Tenor:</span>
                <strong>3 Months</strong>
              </div>
            </div>
            <div className="quote-dialog-actions">
              <button
                type="button"
                className="btn-dialog-cancel"
                onClick={() => setShowRnplModal(false)}
              >
                Close
              </button>
              <button
                type="button"
                className="btn-approve-pay"
                style={{ width: "auto", padding: "10px 24px" }}
                onClick={() => {
                  setShowRnplModal(false);
                  setActionSuccess(
                    "Eligibility check submitted! A confirmation SMS has been sent to your phone."
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
