"use client";

import React, { useState, useEffect, use } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  CreditCard,
  User,
  Wrench,
  Smartphone,
  Printer,
  AlertCircle,
  Banknote,
} from "lucide-react";
import { adminService } from "../../../../../../services/admin/admin";
import TecNurxLoader from "@/components/TecNurxLoader";
import PrintableReceipt from "@/components/PrintableReceipt";

export default function TransactionDetailsPage({ params }) {
  const { transactionId } = use(params);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [paymentDetails, setPaymentDetails] = useState(null);

  useEffect(() => {
    const fetchTransaction = async () => {
      try {
        setLoading(true);
        const res = await adminService.getAdminPaymentbyId(transactionId);
        const paymentData = res?.data?.payment || res?.payment || res?.data || res;
        setPaymentDetails(paymentData);
      } catch (err) {
        console.error("Failed to fetch transaction details:", err);
        setError(err.response?.data?.message || "Failed to load transaction details");
      } finally {
        setLoading(false);
      }
    };

    if (transactionId) {
      fetchTransaction();
    }
  }, [transactionId]);

  if (loading) {
    return <TecNurxLoader minHeight="65vh" size="lg" />;
  }

  if (error || !paymentDetails) {
    return (
      <div className="admin-dashboard">
        <div className="adcard" style={{ textAlign: "center", padding: "48px 24px" }}>
          <AlertCircle size={40} color="#ef4444" style={{ margin: "0 auto 12px" }} />
          <h2 style={{ margin: "0 0 8px", color: "#111827" }}>
            {error || "Transaction not found"}
          </h2>
          <Link
            href="/admin-dashboard/transactions"
            className="admin-btn-outline"
            style={{ marginTop: "12px" }}
          >
            <ArrowLeft size={15} /> Back to Transactions
          </Link>
        </div>
      </div>
    );
  }

  const {
    repairId,
    userId,
    amount,
    status,
    dateInitiated,
    datePayed,
    paystackReference,
    paymentId,
    transactionId: txnRef,
  } = paymentDetails;

  const statusLower = (status || "pending").toLowerCase();
  const isCompleted =
    statusLower === "success" || statusLower === "completed" || statusLower === "paid";
  const isFailed = statusLower === "failed" || statusLower === "cancelled";

  const deviceName = repairId?.device
    ? `${(repairId.device.brand || "").toUpperCase()} ${repairId.device.model || ""}`.trim()
    : "Unknown Device";
  const issue = repairId?.issueCategory
    ? repairId.issueCategory.replace(/_/g, " ")
    : "Repair Service";
  const totalAmount = Number(amount || repairId?.estimatedCost?.totalCost || 0);

  return (
    <div className="admin-dashboard">
      <div className="tnx-screen-only">
        {/* Topbar */}
        <div
          className="dashboard-header-row"
          style={{ alignItems: "center", marginBottom: "20px" }}
        >
          <Link href="/admin-dashboard/transactions" className="admin-btn-outline">
            <ArrowLeft size={16} /> Back to Transactions
          </Link>

          <span className="admin-workspace-tag">
            <Banknote size={14} />
            <span>Transaction Record</span>
          </span>
        </div>

        {/* Pitch-Black Hero Banner */}
        <div className="admin-hero-banner" style={{ marginBottom: "24px" }}>
          <div className="admin-hero-left">
            <span className="admin-hero-pill" style={{ textTransform: "capitalize" }}>
              <span>●</span>
              <span>{status || "Pending"}</span>
            </span>
            <h1 className="admin-hero-title" style={{ fontSize: "30px" }}>
              ₦{totalAmount.toLocaleString()}
            </h1>
            <p className="admin-hero-sub">
              Ref #{paystackReference || txnRef || transactionId} ·{" "}
              {dateInitiated ? new Date(dateInitiated).toLocaleString() : "N/A"}
            </p>
          </div>

          <div className="admin-hero-actions">
            <button
              type="button"
              className="admin-btn-yellow"
              onClick={() => window.print()}
            >
              <Printer size={16} />
              <span>Print Receipt</span>
            </button>
          </div>
        </div>

        {/* 2-Column Details Grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1.45fr 1fr",
            gap: "24px",
            alignItems: "start",
          }}
        >
          {/* Left Column: Payment & Repair Breakdown */}
          <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
            <div className="adcard">
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: "18px",
                }}
              >
                <h2
                  style={{
                    fontSize: "18px",
                    fontWeight: 700,
                    color: "#111827",
                    margin: 0,
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                  }}
                >
                  <CreditCard size={19} />
                  <span>Transaction details</span>
                </h2>
                <span
                  style={{
                    padding: "4px 12px",
                    borderRadius: "9999px",
                    fontSize: "12px",
                    fontWeight: 600,
                    textTransform: "capitalize",
                    background: isCompleted
                      ? "#dcfce7"
                      : isFailed
                      ? "#fee2e2"
                      : "#fef3c7",
                    color: isCompleted
                      ? "#15803d"
                      : isFailed
                      ? "#b91c1c"
                      : "#b45309",
                  }}
                >
                  {status || "Pending"}
                </span>
              </div>

              <div style={{ display: "flex", flexDirection: "column" }}>
                {[
                  { label: "Payment ID", value: paymentId || "N/A" },
                  { label: "Reference", value: paystackReference || txnRef || "N/A" },
                  {
                    label: "Date Initiated",
                    value: dateInitiated ? new Date(dateInitiated).toLocaleString() : "N/A",
                  },
                  {
                    label: "Date Paid",
                    value: datePayed ? new Date(datePayed).toLocaleString() : "—",
                  },
                  {
                    label: "Labour Cost",
                    value: `₦${Number(repairId?.estimatedCost?.laborCost || 0).toLocaleString()}`,
                  },
                  {
                    label: "Parts Cost",
                    value: `₦${Number(repairId?.estimatedCost?.partsCost || 0).toLocaleString()}`,
                  },
                ].map((row) => (
                  <div
                    key={row.label}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      padding: "12px 0",
                      borderBottom: "1px solid #f1f5f9",
                      fontSize: "14px",
                    }}
                  >
                    <span style={{ color: "#64748b" }}>{row.label}</span>
                    <strong style={{ color: "#111827" }}>{row.value}</strong>
                  </div>
                ))}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    paddingTop: "14px",
                    fontSize: "15px",
                    fontWeight: 700,
                    color: "#111827",
                  }}
                >
                  <span>Total Amount</span>
                  <span style={{ fontSize: "17px" }}>₦{totalAmount.toLocaleString()}</span>
                </div>
              </div>
            </div>

            <div className="adcard">
              <h2
                style={{
                  fontSize: "18px",
                  fontWeight: 700,
                  color: "#111827",
                  margin: "0 0 18px",
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                }}
              >
                <Smartphone size={19} />
                <span>Repair &amp; device details</span>
              </h2>

              {[
                { label: "Device", value: deviceName },
                { label: "Serial Number", value: repairId?.device?.serialNumber || "N/A" },
                {
                  label: "Issue Category",
                  value: issue,
                  capitalize: true,
                },
                {
                  label: "Service Type",
                  value: repairId?.serviceType?.replace(/_/g, " ") || "N/A",
                  capitalize: true,
                },
                {
                  label: "Repair Status",
                  value: repairId?.status?.replace(/_/g, " ") || "N/A",
                  capitalize: true,
                },
              ].map((row) => (
                <div
                  key={row.label}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    padding: "12px 0",
                    borderBottom: "1px solid #f1f5f9",
                    fontSize: "14px",
                  }}
                >
                  <span style={{ color: "#64748b" }}>{row.label}</span>
                  <strong
                    style={{
                      color: "#111827",
                      textTransform: row.capitalize ? "capitalize" : "none",
                    }}
                  >
                    {row.value}
                  </strong>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column: Customer & Engineer Info */}
          <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
            <div className="adcard">
              <h2
                style={{
                  fontSize: "18px",
                  fontWeight: 700,
                  color: "#111827",
                  margin: "0 0 16px",
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                }}
              >
                <User size={19} />
                <span>Customer</span>
              </h2>
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <img
                  src={userId?.photo || "/default-avatar.png"}
                  alt="Customer"
                  style={{
                    width: "48px",
                    height: "48px",
                    borderRadius: "50%",
                    objectFit: "cover",
                    border: "1px solid #e5e7eb",
                  }}
                />
                <div>
                  <div style={{ fontWeight: 700, color: "#111827" }}>
                    {userId?.fname} {userId?.lname}
                  </div>
                  <div style={{ fontSize: "13px", color: "#64748b" }}>{userId?.email}</div>
                  {userId?.phoneNumber && (
                    <div style={{ fontSize: "13px", color: "#64748b" }}>
                      {userId.phoneNumber}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="adcard">
              <h2
                style={{
                  fontSize: "18px",
                  fontWeight: 700,
                  color: "#111827",
                  margin: "0 0 16px",
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                }}
              >
                <Wrench size={19} />
                <span>Assigned engineer</span>
              </h2>
              {repairId?.engineer ? (
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <img
                    src={repairId.engineer.photo || "/default-avatar.png"}
                    alt="Engineer"
                    style={{
                      width: "48px",
                      height: "48px",
                      borderRadius: "50%",
                      objectFit: "cover",
                      border: "1px solid #e5e7eb",
                    }}
                  />
                  <div>
                    <div style={{ fontWeight: 700, color: "#111827" }}>
                      {repairId.engineer.fname} {repairId.engineer.lname}
                    </div>
                    <div style={{ fontSize: "13px", color: "#64748b" }}>
                      {repairId.engineer.email}
                    </div>
                    {repairId.engineer.phoneNumber && (
                      <div style={{ fontSize: "13px", color: "#64748b" }}>
                        {repairId.engineer.phoneNumber}
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <p style={{ margin: 0, color: "#64748b", fontSize: "14px" }}>
                  No engineer assigned yet.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      <PrintableReceipt
        title="Admin Transaction Receipt"
        reference={paystackReference || txnRef || transactionId}
        date={dateInitiated ? new Date(dateInitiated).toLocaleString() : "—"}
        status={status || "Pending"}
        totalAmount={totalAmount}
        leftDetails={[
          { label: "Customer", value: `${userId?.fname || ""} ${userId?.lname || ""}`.trim() },
          { label: "Device", value: deviceName },
          { label: "Issue", value: issue },
        ]}
        rightDetails={[
          { label: "Payment ID", value: paymentId || "—" },
          { label: "Reference", value: paystackReference || txnRef || "—" },
          {
            label: "Engineer",
            value: repairId?.engineer
              ? `${repairId.engineer.fname || ""} ${repairId.engineer.lname || ""}`.trim()
              : "Unassigned",
          },
        ]}
        lineItems={[
          { label: `Labour Cost (${deviceName})`, amount: repairId?.estimatedCost?.laborCost || 0 },
          { label: "Replacement Parts Cost", amount: repairId?.estimatedCost?.partsCost || 0 },
        ]}
        footerNote="Official TecNurx Admin Transaction Record."
      />
    </div>
  );
}
