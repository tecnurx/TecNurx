"use client";

import React, { useState, useEffect } from "react";
import {
  Truck,
  Package,
  Navigation,
  CheckCircle2,
  AlertCircle,
  MapPin,
  Eye,
} from "lucide-react";
import Link from "next/link";
import "./adlogic.css";
import { adminService } from "../../../../../services/admin/admin";
import AdminTable from "@/components/AdminTable";

const AdminLogistics = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [logisticsList, setLogisticsList] = useState([]);
  const [statsData, setStatsData] = useState({});

  const fetchLogistics = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await adminService.getLogistics();

      const items =
        res?.data?.shipments ||
        res?.data?.logistics ||
        res?.data?.repairs ||
        res?.shipments ||
        res?.repairs ||
        (Array.isArray(res?.data) ? res.data : []);

      setLogisticsList(items);

      const serverStats = res?.stats || res?.data?.stats;
      if (serverStats) {
        setStatsData(serverStats);
      } else {
        const pending = items.filter(
          (r) =>
            r.status === "pending" ||
            r.status === "assigned" ||
            r.logisticsStatus === "pending"
        ).length;

        const inTransit = items.filter(
          (r) =>
            r.status === "in_progress" ||
            r.status === "picked_up" ||
            r.status === "in_transit"
        ).length;

        const completed = items.filter(
          (r) => r.status === "completed" || r.status === "delivered"
        ).length;

        setStatsData({
          total: items.length,
          pendingPickups: pending,
          inTransit: inTransit,
          completed: completed,
        });
      }
    } catch (err) {
      console.error("Failed to load logistics data:", err);
      setError(
        err.response?.data?.message ||
          err.message ||
          "Failed to load logistics data. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogistics();
  }, []);

  const stats = [
    {
      id: 1,
      title: "Total Logistics Orders",
      value: statsData.total ?? logisticsList.length,
      icon: <Truck size={24} color="#0284c7" />,
    },
    {
      id: 2,
      title: "Pending Pickups",
      value: statsData.pendingPickups ?? 0,
      icon: <Package size={24} color="#f59e0b" />,
    },
    {
      id: 3,
      title: "In Transit / Active",
      value: statsData.inTransit ?? 0,
      icon: <Navigation size={24} color="#6366f1" />,
    },
    {
      id: 4,
      title: "Completed / Delivered",
      value: statsData.completed ?? 0,
      icon: <CheckCircle2 size={24} color="#10b981" />,
    },
  ];

  const columns = [
    {
      header: "Order No.",
      accessor: "_id",
      sortable: true,
      render: (item) => {
        const orderId = item._id || item.id;
        return (
          <span style={{ fontWeight: "700", color: "#0f172a" }}>
            #{orderId ? orderId.slice(-8) : "N/A"}
          </span>
        );
      },
    },
    {
      header: "Device / Service",
      accessor: "device.brand",
      render: (item) => {
        const deviceText =
          item.device?.brand || item.device?.model
            ? `${item.device?.brand || ""} ${item.device?.model || ""}`.trim()
            : item.issueCategory
            ? item.issueCategory.replace(/_/g, " ")
            : "Gadget Repair";

        return <span style={{ fontWeight: "500", color: "#1e293b" }}>{deviceText}</span>;
      },
    },
    {
      header: "Type",
      accessor: "serviceType",
      sortable: true,
      render: (item) => {
        const serviceLoc = item.serviceLocation || item.pickupAddress || {};
        const serviceType = serviceLoc.type || item.serviceType || "Pickup";
        return (
          <span
            style={{
              padding: "4px 8px",
              borderRadius: "12px",
              fontSize: "12px",
              fontWeight: "600",
              background: "#e0f2fe",
              color: "#0369a1",
              textTransform: "capitalize",
            }}
          >
            {serviceType.replace(/_/g, " ")}
          </span>
        );
      },
    },
    {
      header: "Service Location",
      accessor: "serviceLocation.formattedAddress",
      render: (item) => {
        const serviceLoc = item.serviceLocation || item.pickupAddress || {};
        const addressText =
          serviceLoc.formattedAddress ||
          serviceLoc.streetAddress ||
          [serviceLoc.city, serviceLoc.state].filter(Boolean).join(", ") ||
          "N/A";

        return (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "4px",
              color: "#475569",
              fontSize: "13px",
              maxWidth: "240px",
            }}
          >
            <MapPin size={14} style={{ flexShrink: 0, color: "#10b981" }} />
            <span
              style={{
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {addressText}
            </span>
          </div>
        );
      },
    },
    {
      header: "Customer",
      accessor: "customer.fname",
      render: (item) => {
        const customerName =
          item.customer
            ? `${item.customer.fname || ""} ${item.customer.lname || ""}`.trim()
            : item.userId
            ? `${item.userId.fname || ""} ${item.userId.lname || ""}`.trim()
            : "Customer";

        const customerPhone =
          item.customer?.phoneNumber ||
          item.userId?.phoneNumber ||
          item.serviceLocation?.contactPhone ||
          "";

        return (
          <div style={{ fontSize: "13px" }}>
            <p style={{ margin: 0, fontWeight: "500", color: "#1e293b" }}>{customerName}</p>
            {customerPhone && (
              <span style={{ color: "#94a3b8", fontSize: "12px" }}>{customerPhone}</span>
            )}
          </div>
        );
      },
    },
    {
      header: "Courier / Engineer",
      accessor: "engineer.name",
      render: (item) => {
        const engineerName =
          item.engineer?.name ||
          `${item.engineer?.fname || ""} ${item.engineer?.lname || ""}`.trim() ||
          "Unassigned";

        return (
          <span
            style={{
              fontSize: "13px",
              color: engineerName === "Unassigned" ? "#94a3b8" : "#0f172a",
              fontWeight: engineerName === "Unassigned" ? "normal" : "500",
            }}
          >
            {engineerName}
          </span>
        );
      },
    },
    {
      header: "Date",
      accessor: "createdAt",
      sortable: true,
      render: (item) => (
        <span style={{ fontSize: "13px", color: "#64748b" }}>
          {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : "—"}
        </span>
      ),
    },
    {
      header: "Status",
      accessor: "status",
      sortable: true,
      render: (item) => {
        const isCompleted = item.status === "completed" || item.status === "delivered";
        const isInProgress = item.status === "in_progress" || item.status === "in_transit";

        return (
          <span
            style={{
              padding: "4px 10px",
              borderRadius: "12px",
              fontSize: "12px",
              fontWeight: "600",
              textTransform: "capitalize",
              background: isCompleted ? "#dcfce7" : isInProgress ? "#fef3c7" : "#f1f5f9",
              color: isCompleted ? "#15803d" : isInProgress ? "#b45309" : "#475569",
            }}
          >
            {item.status ? item.status.replace(/_/g, " ") : "Pending"}
          </span>
        );
      },
    },
    {
      header: "Action",
      align: "center",
      render: (item) => {
        const orderId = item._id || item.id;
        if (!orderId) return "—";
        return (
          <Link
            href={`/admin-dashboard/orders/${orderId}`}
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
        );
      },
    },
  ];

  const tableFilters = [
    {
      key: "status",
      label: "All Statuses",
      options: [
        { value: "pending", label: "Pending" },
        { value: "in_progress", label: "In Progress / Transit" },
        { value: "completed", label: "Completed" },
      ],
    },
  ];

  if (loading && logisticsList.length === 0) {
    return (
      <div className="resolve-wrap">
        <p>Loading logistics data...</p>
        <div className="respinner"></div>
      </div>
    );
  }

  if (error && logisticsList.length === 0) {
    return (
      <div className="resolve-wrap error">
        <AlertCircle size={32} color="#ef4444" />
        <p>{error}</p>
        <button onClick={fetchLogistics}>Retry</button>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      <div className="dashboard-header">
        <h1>Logistics & Dispatch</h1>
        <p style={{ margin: 0, fontSize: "14px", color: "#64748b", fontStyle: "normal" }}>
          Track gadget pickup requests, dispatches, and delivery status across all repair orders.
        </p>
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

      {/* Responsive Logistics Table */}
      <AdminTable
        title={`Shipments & Deliveries (${logisticsList.length})`}
        subtitle="Manage and track transit, pickup dispatching, and delivery fulfillments"
        columns={columns}
        data={logisticsList}
        filters={tableFilters}
        searchPlaceholder="Search order #, address, device, customer..."
        initialPageSize={10}
        emptyMessage="No logistics or dispatch records found matching your filters."
      />
    </div>
  );
};

export default AdminLogistics;
