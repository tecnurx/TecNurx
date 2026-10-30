"use client";

import React, { useState, useEffect } from "react";
import "../engineer.css";
import { engService } from "../../../../../services/eng/eng";
import Link from "next/link";
import DataTable from "@/components/DataTable";
import { Eye, Banknote, CheckCircle2, Clock, ArrowLeftRight } from "lucide-react";

const PaymentPage = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [payments, setPayments] = useState([]);

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        setLoading(true);
        setError(null);

        const paymentResponse = await engService.getEngineerPayments();
        const data =
          paymentResponse.data?.payments ||
          paymentResponse.payments ||
          (Array.isArray(paymentResponse.data) ? paymentResponse.data : []);
        setPayments(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Failed to load payments:", err);
        setError(err.message || "Failed to load your payments.");
      } finally {
        setLoading(false);
      }
    };

    fetchPayments();
  }, []);

  const columns = [
    {
      header: "Order / Txn ID",
      accessor: "transactionId",
      sortable: true,
      render: (p) => (
        <span style={{ fontWeight: "700", color: "#0f172a" }}>
          #{p.transactionId || (p._id ? p._id.slice(-8) : "N/A")}
        </span>
      ),
    },
    {
      header: "Fault Fixed",
      accessor: "repairId.issueCategory",
      render: (p) => {
        const brand = p.repairId?.device?.brand || "";
        const model = p.repairId?.device?.model || "";
        const issue = p.repairId?.issueCategory
          ? p.repairId.issueCategory.replace(/_/g, " ")
          : "Repair Service";
        return (
          <div>
            <div style={{ fontWeight: "600", color: "#0f172a" }}>
              {brand} {model}
            </div>
            <div style={{ fontSize: "12px", color: "#64748b", textTransform: "capitalize" }}>
              {issue}
            </div>
          </div>
        );
      },
    },
    {
      header: "Date Initiated",
      accessor: "dateInitiated",
      sortable: true,
      render: (p) => {
        const rawDate = p.dateInitiated || p.createdAt;
        return (
          <span style={{ color: "#64748b", fontSize: "13px" }}>
            {rawDate ? new Date(rawDate).toLocaleString() : "—"}
          </span>
        );
      },
    },
    {
      header: "Payment Status",
      accessor: "status",
      sortable: true,
      render: (p) => {
        const status = (p.status || "pending").toLowerCase();
        const isSuccess = status === "paid" || status === "completed" || status === "success";
        const isFailed = status === "failed" || status === "cancelled";

        return (
          <span
            style={{
              padding: "4px 10px",
              borderRadius: "14px",
              fontSize: "12px",
              fontWeight: "600",
              textTransform: "capitalize",
              background: isSuccess ? "#dcfce7" : isFailed ? "#fee2e2" : "#fef3c7",
              color: isSuccess ? "#15803d" : isFailed ? "#b91c1c" : "#b45309",
            }}
          >
            {p.status || "Pending"}
          </span>
        );
      },
    },
    {
      header: "Amount",
      accessor: "amount",
      sortable: true,
      render: (p) => {
        const amt =
          p.amount !== undefined
            ? p.amount
            : p.repairId?.estimatedCost?.totalCost || 0;
        return (
          <span style={{ fontWeight: "700", color: "#0f172a" }}>
            ₦{Number(amt).toLocaleString()}
          </span>
        );
      },
    },
    {
      header: "Action",
      align: "center",
      render: (p) => (
        <Link
          href={`/engineer-dashboard/payments/${p._id}`}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "5px",
            padding: "5px 12px",
            background: "#0f172a",
            color: "#ffffff",
            borderRadius: "6px",
            fontSize: "12px",
            fontWeight: "600",
            textDecoration: "none",
            transition: "opacity 0.2s ease",
          }}
        >
          <Eye size={13} />
          <span>View</span>
        </Link>
      ),
    },
  ];

  const completedEarnings = payments
    .filter((p) => {
      const s = (p.status || "").toLowerCase();
      return s === "completed" || s === "paid" || s === "success";
    })
    .reduce((sum, p) => {
      const amt =
        p.amount !== undefined
          ? p.amount
          : p.repairId?.estimatedCost?.totalCost || 0;
      return sum + Number(amt || 0);
    }, 0);

  const completedCount = payments.filter((p) => {
    const s = (p.status || "").toLowerCase();
    return s === "completed" || s === "paid" || s === "success";
  }).length;

  const pendingCount = payments.filter((p) => {
    const s = (p.status || "").toLowerCase();
    return s === "pending";
  }).length;

  const paymentStats = [
    {
      id: 1,
      title: "Total Earnings",
      value: `₦${completedEarnings.toLocaleString()}`,
      icon: <Banknote size={24} />,
    },
    {
      id: 2,
      title: "Completed Payments",
      value: completedCount,
      icon: <CheckCircle2 size={24} />,
    },
    {
      id: 3,
      title: "Pending Payments",
      value: pendingCount,
      icon: <Clock size={24} />,
    },
    {
      id: 4,
      title: "Total Transactions",
      value: payments.length,
      icon: <ArrowLeftRight size={24} />,
    },
  ];

  return (
    <div className="dashboard-overview">
      <div className="engdashboard-header">
        <h1>Engineer Payments</h1>
      </div>

      {/* Stat Cards Grid */}
      <div className="dashboard-cards">
        {paymentStats.map((item) => (
          <div key={item.id} className="stat-card">
            <div>
              <span>{item.title}</span>
              <h3>{item.value}</h3>
            </div>
            {item.icon}
          </div>
        ))}
      </div>

      {error && (
        <div
          style={{
            padding: "12px 16px",
            marginBottom: "16px",
            background: "#fef2f2",
            border: "1px solid #fecaca",
            color: "#991b1b",
            borderRadius: "8px",
            fontSize: "14px",
          }}
        >
          {error}
        </div>
      )}

      <DataTable
        title="My Payments"
        subtitle={`Total of ${payments.length} payment records in your payout history`}
        data={payments}
        columns={columns}
        loading={loading}
        searchPlaceholder="Search order ID, brand, or issue..."
        searchKeys={[
          "transactionId",
          "_id",
          "status",
          "repairId.issueCategory",
          "repairId.device.brand",
          "repairId.device.model",
        ]}
        initialPageSize={10}
        pageSizeOptions={[10, 20, 50]}
        emptyMessage="No payment transactions found."
      />
    </div>
  );
};

export default PaymentPage;
