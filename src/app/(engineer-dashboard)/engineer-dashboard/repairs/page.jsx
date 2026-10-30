"use client";

import React, { useState, useEffect } from "react";
import "../engineer.css";
import { engService } from "../../../../../services/eng/eng";
import Link from "next/link";
import DataTable from "@/components/DataTable";
import { Eye, Wrench, CheckCircle2, Banknote } from "lucide-react";

const RepairsPage = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [repairs, setRepairs] = useState([]);

  useEffect(() => {
    const fetchRepairs = async () => {
      try {
        setLoading(true);
        setError(null);

        const res = await engService.getEngineerRepairs();
        const data = res.data?.repairs || res.repairs || [];
        setRepairs(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Failed to load repairs:", err);
        setError(err.message || "Failed to load your repairs.");
      } finally {
        setLoading(false);
      }
    };

    fetchRepairs();
  }, []);

  const columns = [
    {
      header: "Order No.",
      accessor: "_id",
      sortable: true,
      render: (r) => (
        <span style={{ fontWeight: "700", color: "#0f172a" }}>
          #{r._id ? r._id.slice(-8) : "N/A"}
        </span>
      ),
    },
    {
      header: "Date Assigned",
      accessor: "assignedAt",
      sortable: true,
      render: (r) => {
        const rawDate = r.assignedAt || r.createdAt;
        return (
          <span style={{ color: "#64748b", fontSize: "13px" }}>
            {rawDate ? new Date(rawDate).toLocaleDateString() : "—"}
          </span>
        );
      },
    },
    {
      header: "Device & Fault",
      accessor: "issueCategory",
      render: (r) => {
        const brand = r.device?.brand?.toUpperCase() || "";
        const model = r.device?.model || "";
        const issue = r.issueCategory ? r.issueCategory.replace(/_/g, " ") : "General Repair";
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
      header: "Status",
      accessor: "status",
      sortable: true,
      render: (r) => {
        const status = (r.status || "pending").toLowerCase();
        const isCompleted = status === "completed" || status === "fixed";
        const isInProgress = status.includes("progress") || status === "diagnosing" || status === "repairing";
        const isCancelled = status === "cancelled" || status === "rejected";

        return (
          <span
            style={{
              padding: "4px 10px",
              borderRadius: "14px",
              fontSize: "12px",
              fontWeight: "600",
              textTransform: "capitalize",
              background: isCompleted ? "#dcfce7" : isInProgress ? "#e0f2fe" : isCancelled ? "#fee2e2" : "#fef3c7",
              color: isCompleted ? "#15803d" : isInProgress ? "#0369a1" : isCancelled ? "#b91c1c" : "#b45309",
            }}
          >
            {r.status ? r.status.replace(/_/g, " ") : "Pending"}
          </span>
        );
      },
    },
    {
      header: "Estimated Amount",
      accessor: "estimatedCost.totalCost",
      sortable: true,
      render: (r) => (
        <span style={{ fontWeight: "700", color: "#0f172a" }}>
          ₦{(r.estimatedCost?.totalCost || 0).toLocaleString()}
        </span>
      ),
    },
    {
      header: "Action",
      align: "center",
      render: (r) => (
        <Link
          href={`/engineer-dashboard/repairs/${r._id}`}
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

  const totalAssigned = repairs.length;
  const completedRepairs = repairs.filter(
    (r) => (r.status || "").toLowerCase() === "completed"
  ).length;
  const totalEstimatedValue = repairs.reduce(
    (sum, r) => sum + (r.estimatedCost?.totalCost || 0),
    0
  );

  const repairStats = [
    {
      id: 1,
      title: "Total Assigned",
      value: totalAssigned,
      icon: <Wrench size={24} />,
    },
    {
      id: 2,
      title: "Completed Repairs",
      value: completedRepairs,
      icon: <CheckCircle2 size={24} />,
    },
    {
      id: 3,
      title: "Total Value",
      value: `₦${totalEstimatedValue.toLocaleString()}`,
      icon: <Banknote size={24} />,
    },
  ];

  return (
    <div className="dashboard-overview">
      <div className="engdashboard-header">
        <h1>Engineer Repairs</h1>
      </div>

      {/* Stat Cards Grid */}
      <div className="dashboard-cards cards-3">
        {repairStats.map((item) => (
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
        title="My Assigned Repairs"
        subtitle={`Total of ${repairs.length} repair orders assigned to your queue`}
        data={repairs}
        columns={columns}
        loading={loading}
        searchPlaceholder="Search order ID, device, or issue..."
        searchKeys={["_id", "status", "issueCategory", "device.brand", "device.model"]}
        initialPageSize={10}
        pageSizeOptions={[10, 20, 50]}
        emptyMessage="No assigned repairs found."
      />
    </div>
  );
};

export default RepairsPage;
