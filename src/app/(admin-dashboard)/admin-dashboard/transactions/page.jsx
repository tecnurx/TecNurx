"use client";

import React, { useState, useEffect } from "react";
import "./adtran.css";
import { adminService } from "../../../../../services/admin/admin";
import { RotateCcw, CreditCard, CircleCheck, Eye } from "lucide-react";
import Link from "next/link";
import AdminTable from "@/components/AdminTable";

const AdminTransactions = () => {
  const [loading, setLoading] = useState(true);
  const [payments, setPayments] = useState([]);
  const [payStats, setPayStats] = useState({});

  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [res, analyticsRes] = await Promise.allSettled([
          adminService.getAllPayments(),
          adminService.getPaymentAnalytics(),
        ]);

        const paymentsData =
          res.status === "fulfilled"
            ? res.value?.data?.payments ||
              res.value?.payments ||
              (Array.isArray(res.value?.data) ? res.value.data : [])
            : [];
        setPayments(paymentsData);

        const baseStats =
          res.status === "fulfilled"
            ? res.value?.stats || res.value?.data?.stats || {}
            : {};
        const analyticsStats =
          analyticsRes.status === "fulfilled"
            ? analyticsRes.value?.data ||
              analyticsRes.value?.stats ||
              analyticsRes.value ||
              {}
            : {};

        setPayStats({ ...baseStats, ...analyticsStats });
      } catch (err) {
        console.error("Failed to load data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const stats = [
    {
      id: 1,
      title: "Total Transaction",
      value: "₦" + (payStats?.totalRevenue || 0).toLocaleString(),
      icon: <CreditCard size={24} />,
    },
    {
      id: 2,
      title: "Completed Payments",
      value: payStats?.completed ?? payments.filter((p) => p.status === "success" || p.status === "completed").length,
      icon: <CircleCheck size={24} />,
    },
    {
      id: 3,
      title: "Pending Payments",
      value: payStats?.pending ?? payments.filter((p) => p.status === "pending").length,
      icon: <RotateCcw size={24} />,
    },
    {
      id: 4,
      title: "Pending Amount",
      value: "₦" + (payStats?.pendingAmount || 0).toLocaleString(),
      icon: <RotateCcw size={24} />,
    },
  ];

  const columns = [
    {
      header: "Order No.",
      accessor: "_id",
      sortable: true,
      render: (t) => (
        <span style={{ fontWeight: "700", color: "#0f172a" }}>
          #{t._id ? t._id.slice(-8) : "N/A"}
        </span>
      ),
    },
    {
      header: "Reference",
      accessor: "paystackReference",
      render: (t) => (
        <code style={{ fontSize: "12px", background: "#f8fafc", padding: "2px 6px", borderRadius: "4px" }}>
          {t.paystackReference || t.reference || t.paymentId || "—"}
        </code>
      ),
    },
    {
      header: "Description / Type",
      accessor: "type",
      render: (t) => (
        <span style={{ textTransform: "capitalize", color: "#334155" }}>
          {t.repairId?.issueCategory
            ? t.repairId.issueCategory.replace(/_/g, " ")
            : t.type || "Repair Payment"}
        </span>
      ),
    },
    {
      header: "Amount",
      accessor: "amount",
      sortable: true,
      render: (t) => (
        <span style={{ fontWeight: "600", color: "#0f172a" }}>
          ₦{Number(t?.amount || 0).toLocaleString()}
        </span>
      ),
    },
    {
      header: "Date",
      accessor: "dateInitiated",
      sortable: true,
      render: (t) => {
        const rawDate = t.dateInitiated || t.createdAt;
        return (
          <span style={{ color: "#64748b", fontSize: "13px" }}>
            {rawDate ? new Date(rawDate).toLocaleDateString() : "—"}
          </span>
        );
      },
    },
    {
      header: "Status",
      accessor: "status",
      sortable: true,
      render: (t) => {
        const status = (t.status || "pending").toLowerCase();
        const isSuccess = status === "success" || status === "completed" || status === "paid";
        const isFailed = status === "failed";

        return (
          <span
            style={{
              padding: "4px 10px",
              borderRadius: "12px",
              fontSize: "12px",
              fontWeight: "600",
              textTransform: "capitalize",
              background: isSuccess ? "#dcfce7" : isFailed ? "#fee2e2" : "#fef3c7",
              color: isSuccess ? "#15803d" : isFailed ? "#b91c1c" : "#b45309",
            }}
          >
            {t.status || "Pending"}
          </span>
        );
      },
    },
    {
      header: "Action",
      align: "center",
      render: (t) => (
        <Link
          href={`/admin-dashboard/transactions/${t._id || t.id}`}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "4px",
            padding: "6px 12px",
            background: "#f1f5f9",
            border: "1px solid #cbd5e1",
            borderRadius: "6px",
            fontSize: "12px",
            fontWeight: "600",
            color: "#0f172a",
            textDecoration: "none",
          }}
        >
          <Eye size={13} /> View
        </Link>
      ),
    },
  ];

  const tableFilters = [
    {
      key: "status",
      label: "All Statuses",
      options: [
        { value: "success", label: "Success" },
        { value: "completed", label: "Completed" },
        { value: "pending", label: "Pending" },
        { value: "failed", label: "Failed" },
      ],
    },
  ];

  if (loading && payments.length === 0) {
    return (
      <div className="resolve-wrap">
        <p>Loading transactions...</p>
        <div className="respinner"></div>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      <div className="dashboard-header">
        <h1>Transactions</h1>
      </div>

      {/* Stats Cards */}
      <div className="dashboard-cards">
        {stats.map((item) => (
          <div key={item.id} className="stat-card">
            <div>
              <span>{item.title}</span>
              <h3>{item.value}</h3>
            </div>
            {item.icon}
          </div>
        ))}
      </div>

      {/* Responsive Transactions Table */}
      <AdminTable
        title={`Transactions History (${payments.length})`}
        subtitle="Filter and track incoming customer payments and transaction records"
        columns={columns}
        data={payments}
        filters={tableFilters}
        searchPlaceholder="Search order ID, reference, status..."
        initialPageSize={10}
        emptyMessage="No transaction records found matching your filters."
      />
    </div>
  );
};

export default AdminTransactions;
