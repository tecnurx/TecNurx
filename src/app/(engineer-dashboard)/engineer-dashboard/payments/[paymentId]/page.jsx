"use client";

import React, { useState, useEffect, use } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  CreditCard,
  User,
  Smartphone,
  Printer,
  AlertCircle,
  Banknote,
  ArrowRight,
  Wrench,
} from "lucide-react";
import TecNurxLoader from "@/components/TecNurxLoader";
import logo from "@/assets/images/logo.png";
import { engService } from "../../../../../../services/eng/eng";
import "../../engineer.css";
import "./receipt.css";

const formatNaira = (amount) => `₦${Number(amount || 0).toLocaleString()}`;

export default function PaymentDetailsPage({ params }) {
  const { paymentId } = use(params);
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [payment, setPayment] = useState(null);

  useEffect(() => {
    const fetchPaymentDetails = async () => {
      try {
        setLoading(true);
        const response = await engService.getEngineerPaymentsbyId(paymentId);
        const data =
          response.data?.payment ||
          response.payment ||
          response.data ||
          response;
        setPayment(data);
      } catch (err) {
        console.error("Failed to load payment details:", err);
        setError(
          err.response?.data?.message ||
            err.message ||
            "Failed to load payment details."
        );
      } finally {
        setLoading(false);
      }
    };

    if (paymentId) {
      fetchPaymentDetails();
    }
  }, [paymentId]);

  if (loading) {
    return <TecNurxLoader minHeight="65vh" size="lg" />;
  }

  if (error || !payment) {
    return (
      <div className="eng-page">
        <div className="eng-card eng-empty-state">
          <AlertCircle size={44} color="#ef4444" style={{ margin: "0 auto 12px" }} />
          <h3>{error || "Payment not found"}</h3>
          <p>We could not load this payment receipt.</p>
          <button
            type="button"
            onClick={() => router.back()}
            className="eng-btn-outline"
          >
            <ArrowLeft size={15} /> Go Back
          </button>
        </div>
      </div>
    );
  }

  const repair = payment.repairId || {};
  const customer = payment.userId || {};
  const device = repair.device || {};
  const estimatedCost = repair.estimatedCost || {};

  const statusLower = (payment.status || "pending").toLowerCase();
  const isCompleted =
    statusLower === "completed" ||
    statusLower === "success" ||
    statusLower === "paid";
  const isFailed = statusLower === "failed" || statusLower === "cancelled";
  const statusPillClass = isCompleted ? "success" : isFailed ? "danger" : "warning";

  const amount =
    payment.amount ??
    payment.metadata?.paidAmount ??
    estimatedCost.totalCost ??
    0;

  const deviceName =
    device.brand || device.model
      ? `${(device.brand || "").toUpperCase()} ${device.model || ""}`.trim()
      : "Device";

  const issueLabel = repair.issueCategory
    ? repair.issueCategory.replace(/_/g, " ")
    : "Repair Service";

  const purposeLabel = payment.purpose
    ? payment.purpose.replace(/_/g, " ")
    : "Repair Cost";

  const customerInitials =
    `${customer.fname?.[0] || ""}${customer.lname?.[0] || ""}`.toUpperCase() ||
    "CU";

  return (
    <div className="eng-page">
      {/* =================================================================
          SCREEN VIEW
          ================================================================= */}
      <div className="receipt-screen-only">
        {/* Topbar: Back + Engineer Tag */}
        <div
          className="eng-page-header no-print"
          style={{ alignItems: "center", marginBottom: "20px" }}
        >
          <Link href="/engineer-dashboard/payments" className="eng-btn-outline">
            <ArrowLeft size={16} />
            <span>Back to Payments</span>
          </Link>

          <span className="eng-workspace-tag">
            <Banknote size={14} />
            <span>Payout Receipt</span>
          </span>
        </div>

        {/* Pitch-Black Receipt Hero Banner */}
        <div className="eng-hero-banner">
          <div className="eng-hero-left">
            <span className="eng-hero-pill" style={{ textTransform: "capitalize" }}>
              <span>●</span>
              <span>{payment.status || "Pending"}</span>
            </span>
            <h1 className="eng-hero-title" style={{ fontSize: "30px" }}>
              {formatNaira(amount)}
            </h1>
            <p className="eng-hero-sub" style={{ textTransform: "capitalize" }}>
              {purposeLabel} · Txn #{payment.transactionId || payment._id} ·{" "}
              {payment.metadata?.channel
                ? `Paid via ${payment.metadata.channel}`
                : "Online Payment"}
            </p>
          </div>

          <div className="eng-hero-actions no-print">
            <button
              type="button"
              className="eng-btn-yellow"
              onClick={() => window.print()}
            >
              <Printer size={16} />
              <span>Print Receipt</span>
            </button>

            {repair._id && (
              <Link
                href={`/engineer-dashboard/repairs/${repair._id}`}
                className="eng-btn-dark-outline"
              >
                <Wrench size={15} />
                <span>View Repair</span>
              </Link>
            )}
          </div>
        </div>

        {/* 2-Column Grid */}
        <div className="eng-overview-grid">
          {/* Left Column: Transaction Details */}
          <div className="eng-col-left">
            <div className="eng-card">
              <div className="eng-card-head">
                <h2
                  className="eng-card-title"
                  style={{ display: "flex", alignItems: "center", gap: "10px" }}
                >
                  <CreditCard size={19} />
                  <span>Transaction details</span>
                </h2>
                <span className={`eng-status-pill ${statusPillClass}`}>
                  {payment.status || "Pending"}
                </span>
              </div>

              <div className="eng-list">
                <div className="eng-list-row">
                  <span style={{ color: "#64748b", fontSize: "14px" }}>Transaction ID</span>
                  <strong style={{ color: "#111827", fontSize: "14px" }}>
                    {payment.transactionId || "—"}
                  </strong>
                </div>
                <div className="eng-list-row">
                  <span style={{ color: "#64748b", fontSize: "14px" }}>Payment ID</span>
                  <strong style={{ color: "#111827", fontSize: "13.5px" }}>
                    {payment.paymentId || payment._id || "—"}
                  </strong>
                </div>
                {payment.paystackReference && (
                  <div className="eng-list-row">
                    <span style={{ color: "#64748b", fontSize: "14px" }}>Reference</span>
                    <strong style={{ color: "#111827", fontSize: "14px" }}>
                      {payment.paystackReference}
                    </strong>
                  </div>
                )}
                <div className="eng-list-row">
                  <span style={{ color: "#64748b", fontSize: "14px" }}>Channel</span>
                  <strong
                    style={{
                      color: "#111827",
                      fontSize: "14px",
                      textTransform: "capitalize",
                    }}
                  >
                    {payment.metadata?.channel || "—"}
                  </strong>
                </div>
                <div className="eng-list-row">
                  <span style={{ color: "#64748b", fontSize: "14px" }}>Purpose</span>
                  <strong
                    style={{
                      color: "#111827",
                      fontSize: "14px",
                      textTransform: "capitalize",
                    }}
                  >
                    {purposeLabel}
                  </strong>
                </div>
                <div className="eng-list-row">
                  <span style={{ color: "#64748b", fontSize: "14px" }}>Date Initiated</span>
                  <strong style={{ color: "#111827", fontSize: "14px" }}>
                    {payment.dateInitiated
                      ? new Date(payment.dateInitiated).toLocaleString()
                      : "—"}
                  </strong>
                </div>
                <div className="eng-list-row">
                  <span style={{ color: "#64748b", fontSize: "14px" }}>Date Paid</span>
                  <strong style={{ color: "#111827", fontSize: "14px" }}>
                    {payment.datePayed
                      ? new Date(payment.datePayed).toLocaleString()
                      : "—"}
                  </strong>
                </div>
                <div className="eng-list-row">
                  <span style={{ color: "#64748b", fontSize: "14px" }}>Labour Cost</span>
                  <strong style={{ color: "#111827", fontSize: "14px" }}>
                    {formatNaira(estimatedCost.laborCost || 0)}
                  </strong>
                </div>
                <div className="eng-list-row">
                  <span style={{ color: "#64748b", fontSize: "14px" }}>Parts Cost</span>
                  <strong style={{ color: "#111827", fontSize: "14px" }}>
                    {formatNaira(estimatedCost.partsCost || 0)}
                  </strong>
                </div>
                <div className="eng-list-row">
                  <span style={{ color: "#111827", fontSize: "15px", fontWeight: 700 }}>
                    Total Paid
                  </span>
                  <strong style={{ color: "#111827", fontSize: "17px" }}>
                    {formatNaira(amount)}
                  </strong>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Customer Details + Linked Repair underneath */}
          <div className="eng-col-right">
            {/* Customer Details */}
            <div className="eng-card">
              <h2
                className="eng-card-title"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  marginBottom: "18px",
                }}
              >
                <User size={19} />
                <span>Customer details</span>
              </h2>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "14px",
                  paddingBottom: "16px",
                  marginBottom: "16px",
                  borderBottom: "1px solid #f1f5f9",
                }}
              >
                {customer.photo ? (
                  <Image
                    src={customer.photo}
                    alt={`${customer.fname || ""} ${customer.lname || ""}`}
                    width={52}
                    height={52}
                    style={{
                      width: "52px",
                      height: "52px",
                      borderRadius: "50%",
                      objectFit: "cover",
                      border: "1px solid #e5e7eb",
                    }}
                  />
                ) : (
                  <div
                    style={{
                      width: "52px",
                      height: "52px",
                      borderRadius: "50%",
                      background: "#111827",
                      color: "#ffffff",
                      fontWeight: 700,
                      fontSize: "16px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    {customerInitials}
                  </div>
                )}

                <div style={{ minWidth: 0 }}>
                  <h3 style={{ margin: "0 0 2px", fontSize: "16px", color: "#111827" }}>
                    {customer.fname} {customer.lname}
                  </h3>
                  <p
                    style={{
                      margin: 0,
                      fontSize: "13px",
                      color: "#64748b",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {customer.email || payment.email || "—"}
                  </p>
                </div>
              </div>

              <div className="eng-list">
                <div className="eng-list-row">
                  <span style={{ color: "#64748b", fontSize: "14px" }}>Phone</span>
                  <strong style={{ color: "#111827", fontSize: "14px" }}>
                    {customer.phoneNumber || "—"}
                  </strong>
                </div>
                <div className="eng-list-row">
                  <span style={{ color: "#64748b", fontSize: "14px" }}>Receipt Email</span>
                  <strong style={{ color: "#111827", fontSize: "13.5px" }}>
                    {payment.email || customer.email || "—"}
                  </strong>
                </div>
              </div>
            </div>

            {/* Linked Repair (Moved under Customer Details) */}
            <div className="eng-card">
              <div className="eng-card-head">
                <h2
                  className="eng-card-title"
                  style={{ display: "flex", alignItems: "center", gap: "10px" }}
                >
                  <Smartphone size={19} />
                  <span>Linked repair</span>
                </h2>
                {repair._id && (
                  <Link
                    href={`/engineer-dashboard/repairs/${repair._id}`}
                    className="eng-card-link"
                  >
                    Open job sheet
                  </Link>
                )}
              </div>

              <div className="eng-list">
                <div className="eng-list-row">
                  <span style={{ color: "#64748b", fontSize: "14px" }}>Device</span>
                  <strong style={{ color: "#111827", fontSize: "14px" }}>{deviceName}</strong>
                </div>
                <div className="eng-list-row">
                  <span style={{ color: "#64748b", fontSize: "14px" }}>Device Type</span>
                  <strong
                    style={{
                      color: "#111827",
                      fontSize: "14px",
                      textTransform: "capitalize",
                    }}
                  >
                    {device.deviceType || "—"}
                  </strong>
                </div>
                {device.serialNumber && (
                  <div className="eng-list-row">
                    <span style={{ color: "#64748b", fontSize: "14px" }}>Serial Number</span>
                    <strong style={{ color: "#111827", fontSize: "14px" }}>
                      {device.serialNumber}
                    </strong>
                  </div>
                )}
                <div className="eng-list-row">
                  <span style={{ color: "#64748b", fontSize: "14px" }}>Issue Category</span>
                  <strong
                    style={{
                      color: "#111827",
                      fontSize: "14px",
                      textTransform: "capitalize",
                    }}
                  >
                    {issueLabel}
                  </strong>
                </div>
                <div className="eng-list-row">
                  <span style={{ color: "#64748b", fontSize: "14px" }}>Service Type</span>
                  <strong
                    style={{
                      color: "#111827",
                      fontSize: "14px",
                      textTransform: "capitalize",
                    }}
                  >
                    {repair.serviceType ? repair.serviceType.replace(/_/g, " ") : "—"}
                  </strong>
                </div>
                <div className="eng-list-row">
                  <span style={{ color: "#64748b", fontSize: "14px" }}>Repair Status</span>
                  <span className="eng-status-pill pending">
                    {repair.status ? repair.status.replace(/_/g, " ") : "—"}
                  </span>
                </div>
              </div>

              {repair.issueDescription && (
                <div
                  style={{
                    marginTop: "14px",
                    padding: "14px 16px",
                    background: "#f8fafc",
                    border: "1px solid #f1f5f9",
                    borderRadius: "12px",
                    fontSize: "13.5px",
                    color: "#334155",
                  }}
                >
                  {repair.issueDescription}
                </div>
              )}

              {repair._id && (
                <Link
                  href={`/engineer-dashboard/repairs/${repair._id}`}
                  className="eng-btn-primary"
                  style={{ width: "100%", marginTop: "18px", boxSizing: "border-box" }}
                >
                  <span>Go to repair order</span>
                  <ArrowRight size={15} />
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* =================================================================
          DEDICATED PRINT RECEIPT SHEET
          ================================================================= */}
      <div className="receipt-print-only">
        <div className="receipt-sheet-header">
          <div>
            <Image
              src={logo}
              alt="TecNurx"
              width={130}
              height={32}
              priority
              loading="eager"
              style={{ width: "130px", height: "auto", marginBottom: "6px", display: "block" }}
            />
            <p className="receipt-brand-sub">Certified Device Repair &amp; Protection</p>
          </div>
          <div className="receipt-meta-right">
            <h2 className="receipt-doc-title">Payout Receipt</h2>
            <p className="receipt-doc-id">
              Txn: {payment.transactionId || payment._id}
            </p>
            <p className="receipt-doc-id">
              Date:{" "}
              {payment.datePayed
                ? new Date(payment.datePayed).toLocaleString()
                : payment.dateInitiated
                ? new Date(payment.dateInitiated).toLocaleString()
                : "—"}
            </p>
          </div>
        </div>

        <div className="receipt-amount-box">
          <div>
            <span className="receipt-amount-label">Amount Paid</span>
            <span className="receipt-amount-val">{formatNaira(amount)}</span>
          </div>
          <span className="receipt-status-tag">{payment.status || "Pending"}</span>
        </div>

        <div className="receipt-two-col">
          <div>
            <h3 className="receipt-section-title">Customer &amp; Device</h3>
            <div className="receipt-kv">
              <span>Customer</span>
              <strong>
                {customer.fname} {customer.lname}
              </strong>
            </div>
            <div className="receipt-kv">
              <span>Email</span>
              <strong>{customer.email || payment.email || "—"}</strong>
            </div>
            <div className="receipt-kv">
              <span>Phone</span>
              <strong>{customer.phoneNumber || "—"}</strong>
            </div>
            <div className="receipt-kv">
              <span>Device</span>
              <strong>{deviceName}</strong>
            </div>
            {device.serialNumber && (
              <div className="receipt-kv">
                <span>Serial No.</span>
                <strong>{device.serialNumber}</strong>
              </div>
            )}
          </div>

          <div>
            <h3 className="receipt-section-title">Payment Information</h3>
            <div className="receipt-kv">
              <span>Payment ID</span>
              <strong>{payment.paymentId || payment._id || "—"}</strong>
            </div>
            <div className="receipt-kv">
              <span>Reference</span>
              <strong>{payment.paystackReference || "—"}</strong>
            </div>
            <div className="receipt-kv">
              <span>Channel</span>
              <strong style={{ textTransform: "capitalize" }}>
                {payment.metadata?.channel || "—"}
              </strong>
            </div>
            <div className="receipt-kv">
              <span>Purpose</span>
              <strong style={{ textTransform: "capitalize" }}>{purposeLabel}</strong>
            </div>
            <div className="receipt-kv">
              <span>Issue</span>
              <strong style={{ textTransform: "capitalize" }}>{issueLabel}</strong>
            </div>
          </div>
        </div>

        <table className="receipt-table">
          <thead>
            <tr>
              <th>Description</th>
              <th className="num">Amount</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Repair Labour Cost ({deviceName})</td>
              <td className="num">{formatNaira(estimatedCost.laborCost || 0)}</td>
            </tr>
            <tr>
              <td>Replacement Parts Cost</td>
              <td className="num">{formatNaira(estimatedCost.partsCost || 0)}</td>
            </tr>
            <tr className="receipt-total-row">
              <td>Total Paid</td>
              <td className="num">{formatNaira(amount)}</td>
            </tr>
          </tbody>
        </table>

        <div className="receipt-footer">
          This is an official TecNurx Engineer Portal payment receipt. Generated on{" "}
          {new Date().toLocaleDateString()}.
        </div>
      </div>
    </div>
  );
}
