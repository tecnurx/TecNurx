"use client";

import React, { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, Printer, RefreshCw, ExternalLink } from "lucide-react";
import "../payment.css";
import { toast } from "@/components/CustomToast";
import TecNurxLoader from "@/components/TecNurxLoader";
import PrintableReceipt from "@/components/PrintableReceipt";
import { repairService } from "../../../../../../services/repairs";

const formatPurposeLabel = (purpose) => {
  switch ((purpose || "").toLowerCase()) {
    case "booking_charge":
      return "Booking fee";
    case "repair_cost":
      return "Repair payment";
    case "additional_work":
      return "Additional work";
    default:
      return purpose ? purpose.replace(/_/g, " ") : "Payment";
  }
};

const formatStatusMeta = (status) => {
  const s = (status || "").toLowerCase();
  if (s === "paid" || s === "success" || s === "completed" || s === "settled") {
    return { label: "Paid", className: "status-pill-paid" };
  }
  if (s === "pending" || s === "initiated") {
    return { label: "Pending", className: "status-pill-pending" };
  }
  if (s === "failed" || s === "cancelled" || s === "expired" || s === "abandoned") {
    return {
      label: s.charAt(0).toUpperCase() + s.slice(1),
      className: "status-pill-failed",
    };
  }
  return {
    label: status ? status.charAt(0).toUpperCase() + status.slice(1) : "Unknown",
    className: "status-pill-pending",
  };
};

const formatDateTime = (value) => {
  if (!value) return "—";
  return new Date(value).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
};

export default function PaymentDetailPage() {
  const params = useParams();
  const paymentId = params?.paymentId;

  const [payment, setPayment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [checkingStatus, setCheckingStatus] = useState(false);

  const loadDetail = useCallback(async () => {
    if (!paymentId) return;
    try {
      setLoading(true);
      const res = await repairService.getMyPaymentDetails(paymentId);
      const detail = res?.data?.payment || res?.payment || res?.data || res;
      setPayment(detail || null);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Could not load payment details.");
      setPayment(null);
    } finally {
      setLoading(false);
    }
  }, [paymentId]);

  useEffect(() => {
    loadDetail();
  }, [loadDetail]);

  const handleCheckStatus = async () => {
    if (!payment) return;
    const txId = payment.transactionId || payment.reference || payment.id || payment._id;
    const repairId =
      typeof payment.repair === "object"
        ? payment.repair?._id || payment.repair?.id
        : payment.repair;

    try {
      setCheckingStatus(true);
      let res;
      if (txId) {
        res = await repairService.verifyPayment(txId);
      } else if (repairId) {
        res = await repairService.getPaymentStatus(repairId, payment.purpose);
      }
      const data = res?.data || res;
      const newStatus = (data?.status || data?.payment?.status || "").toLowerCase();
      if (newStatus === "paid" || newStatus === "success" || newStatus === "completed") {
        toast.success("Payment verified and settled!");
      } else {
        toast.info(`Current status: ${newStatus || "pending"}`);
      }
      await loadDetail();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Could not verify payment status.");
    } finally {
      setCheckingStatus(false);
    }
  };

  const handlePrint = () => {
    if (typeof window !== "undefined") {
      window.print();
    }
  };

  if (loading) {
    return <TecNurxLoader minHeight="65vh" size="lg" text="Loading payment receipt..." />;
  }

  if (!payment) {
    return (
      <div className="receipt-page">
        <div className="receipt-topbar receipt-no-print">
          <Link href="/dashboard/payments" className="payment-back-link">
            <ArrowLeft size={16} />
            <span>Back to payments</span>
          </Link>
        </div>
        <div className="receipt-card" style={{ marginTop: "16px" }}>
          <h2 className="payment-card-title">Payment not found</h2>
          <p className="history-item-sub">
            We couldn&apos;t find details for this payment.
          </p>
        </div>
      </div>
    );
  }

  const statusMeta = formatStatusMeta(payment.status);
  const isPending = (payment.status || "").toLowerCase() === "pending";
  const repair = typeof payment.repair === "object" ? payment.repair : null;
  const repairId =
    repair?._id || repair?.id || (typeof payment.repair === "string" ? payment.repair : null);
  const deviceName =
    [repair?.device?.brand, repair?.device?.model].filter(Boolean).join(" ") || "Device";
  const issueLabel = repair?.issueCategory
    ? repair.issueCategory.replace(/_/g, " ").replace(/^./, (c) => c.toUpperCase())
    : "Repair";
  const engineerName = repair?.engineer
    ? [repair.engineer.fname, repair.engineer.lname].filter(Boolean).join(" ")
    : null;
  const shortPaymentId = String(payment.id || payment._id || "")
    .slice(-8)
    .toUpperCase();

  return (
    <div className="receipt-page">
      <div className="tnx-screen-only">
        {/* Top Action Bar (hidden on print) */}
        <div className="receipt-topbar receipt-no-print">
        <Link href="/dashboard/payments" className="payment-back-link">
          <ArrowLeft size={16} />
          <span>Back to payments</span>
        </Link>

        <div className="receipt-topbar-actions">
          <button
            type="button"
            className="btn-receipt-print"
            onClick={handlePrint}
          >
            <Printer size={15} />
            <span>Print receipt</span>
          </button>

          {isPending && payment.paymentLink && (
            <a href={payment.paymentLink} className="btn-draft-pay" style={{ textDecoration: "none" }}>
              Resume payment
            </a>
          )}
        </div>
      </div>

      {/* Main Receipt Card */}
      <div className="receipt-card">
        {/* Brand & Status Header */}
        <div className="receipt-header">
          <div>
            <div className="receipt-brand-eyebrow">TECNURX PAYMENT RECEIPT</div>
            <h1 className="receipt-title">{formatPurposeLabel(payment.purpose)}</h1>
            <p className="receipt-ref">
              {payment.reference ? `Ref: ${payment.reference}` : `Payment #${shortPaymentId}`}
            </p>
          </div>
          <span className={statusMeta.className}>
            <span className="status-dot">●</span>
            <span>{statusMeta.label}</span>
          </span>
        </div>

        {/* Hero Amount Band */}
        <div className="receipt-amount-band">
          <div className="receipt-amount-label">Amount</div>
          <div className="receipt-amount-value">
            ₦{Number(payment.amount ?? 0).toLocaleString()}
          </div>
          <div className="receipt-amount-date">
            {payment.paidAt
              ? `Paid on ${formatDateTime(payment.paidAt)}`
              : `Initiated on ${formatDateTime(payment.initiatedAt || payment.createdAt)}`}
          </div>
        </div>

        {/* Transaction Metadata Grid */}
        <div className="receipt-section">
          <h2 className="receipt-section-title">Transaction details</h2>
          <div className="receipt-meta-grid">
            <div className="receipt-meta-item">
              <span className="receipt-meta-label">Payment ID</span>
              <span className="receipt-meta-val">#{shortPaymentId}</span>
            </div>
            <div className="receipt-meta-item">
              <span className="receipt-meta-label">Reference</span>
              <span className="receipt-meta-val">{payment.reference || "—"}</span>
            </div>
            <div className="receipt-meta-item">
              <span className="receipt-meta-label">Purpose</span>
              <span className="receipt-meta-val">{formatPurposeLabel(payment.purpose)}</span>
            </div>
            <div className="receipt-meta-item">
              <span className="receipt-meta-label">Initiated at</span>
              <span className="receipt-meta-val">
                {formatDateTime(payment.initiatedAt || payment.createdAt)}
              </span>
            </div>
            {payment.paidAt && (
              <div className="receipt-meta-item">
                <span className="receipt-meta-label">Paid at</span>
                <span className="receipt-meta-val">{formatDateTime(payment.paidAt)}</span>
              </div>
            )}
          </div>
        </div>

        {/* Breakdown (if provided) */}
        {Array.isArray(payment.breakdown) && payment.breakdown.length > 0 && (
          <div className="receipt-section">
            <h2 className="receipt-section-title">Payment breakdown</h2>
            <div className="receipt-breakdown-list">
              {payment.breakdown.map((b, idx) => (
                <div key={idx} className="receipt-breakdown-row">
                  <span>{b.label || b.name || "Item"}</span>
                  <strong>₦{Number(b.amount ?? 0).toLocaleString()}</strong>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Linked Repair Section */}
        {(repair || repairId) && (
          <div className="receipt-section">
            <div className="receipt-section-head">
              <h2 className="receipt-section-title" style={{ marginBottom: 0 }}>
                Linked repair
              </h2>
              {repairId && (
                <Link
                  href={`/dashboard/repairs/${repairId}`}
                  className="receipt-repair-link receipt-no-print"
                >
                  <span>View repair</span>
                  <ExternalLink size={13} />
                </Link>
              )}
            </div>

            <div className="receipt-repair-box">
              <div className="receipt-meta-grid">
                <div className="receipt-meta-item">
                  <span className="receipt-meta-label">Device</span>
                  <span className="receipt-meta-val">{deviceName}</span>
                </div>
                <div className="receipt-meta-item">
                  <span className="receipt-meta-label">Issue</span>
                  <span className="receipt-meta-val">{issueLabel}</span>
                </div>
                {repair?.status && (
                  <div className="receipt-meta-item">
                    <span className="receipt-meta-label">Repair status</span>
                    <span className="receipt-meta-val" style={{ textTransform: "capitalize" }}>
                      {repair.status.replace(/_/g, " ")}
                    </span>
                  </div>
                )}
                {engineerName && (
                  <div className="receipt-meta-item">
                    <span className="receipt-meta-label">Engineer</span>
                    <span className="receipt-meta-val">{engineerName}</span>
                  </div>
                )}
              </div>

              {repair?.issueDescription && (
                <div className="receipt-repair-notes">
                  <span className="receipt-meta-label">Description</span>
                  <p>{repair.issueDescription}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Pending Verification Footer */}
        {isPending && (
          <div className="receipt-pending-footer receipt-no-print">
            <button
              type="button"
              className="btn-receipt-verify"
              disabled={checkingStatus}
              onClick={handleCheckStatus}
            >
              <RefreshCw size={14} className={checkingStatus ? "spin" : ""} />
              <span>{checkingStatus ? "Checking status..." : "Check payment status"}</span>
            </button>
            {payment.paymentLink && (
              <a
                href={payment.paymentLink}
                className="btn-draft-pay"
                style={{ textDecoration: "none" }}
              >
                Resume payment
              </a>
            )}
          </div>
        )}
      </div>
      </div>

      <PrintableReceipt
        title={formatPurposeLabel(payment.purpose)}
        reference={payment.reference || `#${shortPaymentId}`}
        date={formatDateTime(payment.paidAt || payment.initiatedAt || payment.createdAt)}
        status={statusMeta.label}
        totalAmount={payment.amount ?? 0}
        leftDetails={[
          ...(repairId
            ? [{ label: "Repair ID", value: `#${String(repairId).slice(-8).toUpperCase()}` }]
            : []),
          ...(repair ? [{ label: "Device", value: deviceName }] : []),
          ...(repair ? [{ label: "Issue", value: issueLabel }] : []),
          ...(engineerName ? [{ label: "Engineer", value: engineerName }] : []),
        ]}
        rightDetails={[
          { label: "Payment ID", value: `#${shortPaymentId}` },
          { label: "Reference", value: payment.reference || "—" },
          { label: "Purpose", value: formatPurposeLabel(payment.purpose) },
          {
            label: payment.paidAt ? "Paid At" : "Initiated At",
            value: formatDateTime(payment.paidAt || payment.initiatedAt || payment.createdAt),
          },
        ]}
        lineItems={
          Array.isArray(payment.breakdown) && payment.breakdown.length > 0
            ? payment.breakdown.map((b) => ({
                label: b.label || b.name || "Item",
                amount: b.amount ?? 0,
              }))
            : [
                {
                  label: `${formatPurposeLabel(payment.purpose)}${repair ? ` (${deviceName})` : ""}`,
                  amount: payment.amount ?? 0,
                },
              ]
        }
      />
    </div>
  );
}
