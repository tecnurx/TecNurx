"use client";

import React, { useState, useEffect, use } from "react";
import {
  ArrowLeft,
  Download,
  CreditCard,
  Calendar,
  User,
  FileText,
  CheckCircle2,
  Clock,
  Printer,
  AlertCircle,
} from "lucide-react";
import Link from "next/link";
import styles from "./payment.module.css";
import { engService } from "../../../../../../services/eng/eng";
import "../.././engineer.css";

export default function PaymentDetailsPage({ params }) {
  const { paymentId } = use(params);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [paymentDetails, setPaymentDetails] = useState(null);

  useEffect(() => {
    const fetchPaymentDetails = async () => {
      try {
        setLoading(true);
        const response = await engService.getEngineerPaymentsbyId(paymentId);
        // Handle variations in API response structure
        setPaymentDetails(
          response.data?.payment ||
            response.data ||
            response.payment ||
            response,
        );
      } catch (err) {
        console.error("Failed to load payment details:", err);
        setError(
          err.response?.data?.message ||
            err.message ||
            "Failed to load payment details.",
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
    return (
      <div
        className="resolve-wrap"
        style={{
          height: "50vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
        }}
      >
        <p>Loading payment details...</p>
        <div className="respinner"></div>
      </div>
    );
  }

  if (error || !paymentDetails) {
    return (
      <div className={styles.repairerror}>
        <AlertCircle size={64} />
        <h2>{error || "Payment not found"}</h2>
        <button onClick={() => router.back()} className="btn-back">
          Go Back
        </button>
      </div>
    );
  }

  // Map dynamic backend data to UI format securely
  const repair = paymentDetails.repairId || {};
  const deviceName = repair.device
    ? `${repair.device.brand} ${repair.device.model}`
    : "Unknown Device";
  const issue = repair.issueCategory
    ? repair.issueCategory.replace(/_/g, " ")
    : "Repair Service";
  const totalCost =
    repair.estimatedCost?.totalCost || paymentDetails.amount || 0;
  const isCompleted =
    paymentDetails.status === "completed" ||
    paymentDetails.status === "success" ||
    paymentDetails.status === "paid";

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.titleGroup}>
          <Link
            href="/engineer-dashboard/payments"
            className={styles.subtitle}
            style={{
              marginBottom: "16px",
              display: "inline-flex",
              color: "#3b82f6",
              fontWeight: 500,
            }}
          >
            <ArrowLeft size={16} /> Back to Payments
          </Link>
          <h1>
            Payment #
            {paymentDetails.transactionId || paymentDetails._id || paymentId}
          </h1>
          <div className={styles.subtitle}>
            <Calendar size={16} />{" "}
            {paymentDetails.dateInitiated || paymentDetails.createdAt
              ? new Date(
                  paymentDetails.dateInitiated || paymentDetails.createdAt,
                ).toLocaleString()
              : "N/A"}
            <span style={{ margin: "0 8px" }}>•</span>
            <span
              className={`${styles.badge} ${isCompleted ? styles.badgeSuccess : styles.badgePending}`}
            >
              {isCompleted ? <CheckCircle2 size={14} /> : <Clock size={14} />}
              {paymentDetails.status || "Pending"}
            </span>
          </div>
        </div>
        <div style={{ display: "flex", gap: "12px" }}>
          <button className={styles.actionButton}>
            <Printer size={16} /> Print
          </button>
          <button
            className={styles.actionButton}
            style={{
              background: "#111827",
              color: "white",
              borderColor: "#111827",
            }}
          >
            <Download size={16} /> Receipt
          </button>
        </div>
      </div>

      <div className={styles.grid}>
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <div className={`${styles.cardIcon} ${styles.iconYellow}`}>
              <CreditCard size={24} />
            </div>
          </div>
          <div className={styles.cardLabel}>Amount</div>
          <div className={styles.cardValue}>
            ₦{Number(totalCost).toLocaleString()}
          </div>
        </div>
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <div className={`${styles.cardIcon} ${styles.iconBlue}`}>
              <User size={24} />
            </div>
          </div>
          <div className={styles.cardLabel}>Device</div>
          <div className={styles.cardValue} style={{ fontSize: "20px" }}>
            {deviceName}
          </div>
          <div
            style={{
              fontSize: "14px",
              color: "#6b7280",
              marginTop: "4px",
              textTransform: "capitalize",
            }}
          >
            {issue}
          </div>
        </div>
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <div className={`${styles.cardIcon} ${styles.iconPurple}`}>
              <FileText size={24} />
            </div>
          </div>
          <div className={styles.cardLabel}>Payment Method</div>
          <div className={styles.cardValue} style={{ fontSize: "20px" }}>
            {paymentDetails.paymentMethod || "Online Transfer"}
          </div>
          <div style={{ fontSize: "14px", color: "#6b7280", marginTop: "4px" }}>
            Processed successfully
          </div>
        </div>
      </div>

      <div className={styles.detailsGrid}>
        <div className={styles.panel}>
          <h2 className={styles.sectionTitle}>
            <FileText size={20} /> Invoice Breakdown
          </h2>
          <div style={{ overflowX: "auto" }}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Description</th>
                  <th style={{ textAlign: "right" }}>Total</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>
                    <div className={styles.itemName}>{issue}</div>
                    <div className={styles.itemDesc}>{deviceName} Repair</div>
                  </td>
                  <td style={{ textAlign: "right", fontWeight: 500 }}>
                    ₦{Number(totalCost).toLocaleString()}
                  </td>
                </tr>
                <tr className={styles.totalRow}>
                  <td style={{ textAlign: "right", paddingTop: "24px" }}>
                    Total Amount
                  </td>
                  <td style={{ textAlign: "right", paddingTop: "24px" }}>
                    ₦{Number(totalCost).toLocaleString()}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div className={styles.panel}>
          <h2 className={styles.sectionTitle}>
            <Clock size={20} /> Transaction History
          </h2>
          <div className={styles.timeline}>
            <div className={`${styles.timelineItem} ${styles.active}`}>
              <div className={styles.timelineIcon}>
                <CheckCircle2 size={20} />
              </div>
              <div className={styles.timelineContent}>
                <div className={styles.timelineTitle}>Payment Logged</div>
                <div className={styles.timelineDesc}>
                  Status: {paymentDetails.status}
                </div>
                <div className={styles.timelineTime}>
                  {paymentDetails.dateInitiated || paymentDetails.createdAt
                    ? new Date(
                        paymentDetails.dateInitiated ||
                          paymentDetails.createdAt,
                      ).toLocaleString()
                    : "N/A"}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
