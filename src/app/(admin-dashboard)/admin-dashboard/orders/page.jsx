"use client";

import React, { useState, useEffect } from "react";
import {
  Banknote,
  CheckCircle2,
  Users,
  Wrench,
  AlertCircle,
  Eye,
} from "lucide-react";
import Link from "next/link";
import "./adorder.css";
import { adminService } from "../../../../../services/admin/admin";
import AdminTable from "@/components/AdminTable";

const AdminOrders = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [repairs, setRepairs] = useState([]);
  const [repairStats, setRepairStats] = useState({});

  useEffect(() => {
    const fetchRepairs = async () => {
      try {
        setLoading(true);
        setError(null);
        const [repairsRes, statsRes] = await Promise.allSettled([
          adminService.getAllRepairs(),
          adminService.getRepairStats(),
        ]);

        const res = repairsRes.status === "fulfilled" ? repairsRes.value : null;
        if (!res) throw repairsRes.reason;

        const baseStats = res.stats || res.data?.stats || {};
        const engStats =
          statsRes.status === "fulfilled"
            ? statsRes.value?.data || statsRes.value?.stats || statsRes.value || {}
            : {};
        setRepairStats({ ...baseStats, ...engStats });

        const data = res.data?.repairs || res.repairs || [];
        setRepairs(data);
      } catch (err) {
        console.error("Failed to load repairs:", err);
        setError(err.message || "Failed to load orders. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchRepairs();
  }, []);

  const totalRevenue = repairStats?.totalRevenue || 0;
  const stats = [
    {
      id: 1,
      title: "Total Revenue",
      value: `₦${totalRevenue.toLocaleString()}`,
      icon: <Banknote size={24} />,
    },
    {
      id: 2,
      title: "Completed Repairs",
      value: repairStats?.completedRepairs ?? 0,
      icon: <CheckCircle2 size={24} />,
    },
    {
      id: 3,
      title: "Total Customers",
      value: repairStats?.totalCustomers ?? "0",
      icon: <Users size={24} />,
    },
    {
      id: 4,
      title: "Pending Repairs",
      value: repairStats?.pendingRepairs ?? repairs.filter((r) => r.status === "pending").length,
      icon: <Wrench size={24} />,
    },
  ];

  const columns = [
    {
      header: "Order ID",
      accessor: "_id",
      sortable: true,
      render: (r) => (
        <span style={{ fontWeight: "700", color: "#0f172a" }}>
          #{r._id ? r._id.slice(-8) : "N/A"}
        </span>
      ),
    },
    {
      header: "Customer",
      accessor: "user.fname",
      sortable: true,
      render: (r) => {
        const user = r.user || r.customer || {};
        const name = `${user.fname || ""} ${user.lname || ""}`.trim() || user.name || "Customer";
        return (
          <div>
            <div style={{ fontWeight: "600", color: "#1e293b" }}>{name}</div>
            {user.email && <div style={{ fontSize: "12px", color: "#64748b" }}>{user.email}</div>}
          </div>
        );
      },
    },
    {
      header: "Device",
      accessor: "device.brand",
      sortable: true,
      render: (r) => (
        <span style={{ fontWeight: "500", color: "#334155" }}>
          {r.device?.brand ? r.device.brand.toUpperCase() : ""}{" "}
          {r.device?.model || "Device Details N/A"}
        </span>
      ),
    },
    {
      header: "Issue",
      accessor: "issueCategory",
      render: (r) => (
        <span style={{ textTransform: "capitalize" }}>
          {r.issueCategory ? r.issueCategory.replace(/_/g, " ") : "General Repair"}
        </span>
      ),
    },
    {
      header: "Engineer",
      accessor: "engineer.fname",
      render: (r) => {
        const eng = r.engineer;
        if (!eng) return <span style={{ color: "#94a3b8" }}>Unassigned</span>;
        const name = eng.name || `${eng.fname || ""} ${eng.lname || ""}`.trim();
        return <span style={{ fontWeight: "500", color: "#0f172a" }}>{name || "Assigned"}</span>;
      },
    },
    {
      header: "Status",
      accessor: "status",
      sortable: true,
      render: (r) => (
        <span className={`status-${r.status || "pending"}`} style={{ textTransform: "capitalize" }}>
          {r.status ? r.status.replace(/_/g, " ") : "Pending"}
        </span>
      ),
    },
    {
      header: "Payment",
      accessor: "paymentStatus",
      sortable: true,
      render: (r) => (
        <span className={`payment-${r.paymentStatus || "pending"}`} style={{ textTransform: "capitalize" }}>
          {r.paymentStatus || "pending"}
        </span>
      ),
    },
    {
      header: "Cost",
      accessor: "estimatedCost.totalCost",
      sortable: true,
      render: (r) => (
        <span style={{ fontWeight: "600" }}>
          ₦{(r.estimatedCost?.totalCost || 0).toLocaleString()}
        </span>
      ),
    },
    {
      header: "Date",
      accessor: "createdAt",
      sortable: true,
      render: (r) => (
        <span style={{ color: "#64748b", fontSize: "13px" }}>
          {r.createdAt ? new Date(r.createdAt).toLocaleDateString() : "—"}
        </span>
      ),
    },
    {
      header: "Action",
      align: "center",
      render: (r) => (
        <Link
          href={`/admin-dashboard/orders/${r._id || r.id}`}
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
            transition: "all 0.15s",
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
        { value: "pending", label: "Pending" },
        { value: "assigned", label: "Assigned" },
        { value: "in_progress", label: "In Progress" },
        { value: "completed", label: "Completed" },
        { value: "cancelled", label: "Cancelled" },
      ],
    },
    {
      key: "paymentStatus",
      label: "All Payments",
      options: [
        { value: "paid", label: "Paid" },
        { value: "pending", label: "Pending" },
        { value: "failed", label: "Failed" },
      ],
    },
  ];

  if (loading && repairs.length === 0) {
    return (
      <div className="resolve-wrap">
        <p>Loading orders...</p>
        <div className="respinner"></div>
      </div>
    );
  }

  if (error && repairs.length === 0) {
    return (
      <div className="resolve-wrap error">
        <AlertCircle size={32} color="#ef4444" />
        <p>{error}</p>
        <button onClick={() => window.location.reload()}>Retry</button>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      <div className="dashboard-header">
        <h1>All Orders</h1>
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

      {/* Responsive Orders Table */}
      <AdminTable
        title={`All Repair Orders (${repairs.length})`}
        subtitle="Search, filter, and inspect gadget repair orders across the platform"
        columns={columns}
        data={repairs}
        filters={tableFilters}
        searchPlaceholder="Search order ID, customer, device, issue..."
        initialPageSize={10}
        emptyMessage="No repair orders matching your filter criteria."
      />
    </div>
  );
};

export default AdminOrders;
