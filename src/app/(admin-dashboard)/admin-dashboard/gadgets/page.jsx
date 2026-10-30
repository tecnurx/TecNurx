"use client";

import React, { useState, useEffect } from "react";
import {
  Smartphone,
  Laptop,
  Wrench,
  Package,
  AlertCircle,
  Tag,
  PlusIcon,
  Edit,
} from "lucide-react";
import "./adgad.css";
import { adminService } from "../../../../../services/admin/admin";
import { useStaffPermissions } from "../../../../../config/adminPermissions";
import Link from "next/link";
import AdminTable from "@/components/AdminTable";

const AdminGadgets = () => {
  const { can } = useStaffPermissions();
  const canManageCatalog = can("catalog:manage") || can("services:manage");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [offerings, setOfferings] = useState([]);

  const fetchServices = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await adminService.getAllServices();

      const data =
        res.data?.serviceOfferings ||
        res.serviceOfferings ||
        res.data?.offerings ||
        res.offerings ||
        (Array.isArray(res.data) ? res.data : null) ||
        (Array.isArray(res) ? res : []);
      setOfferings(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to load service offerings:", err);
      setError(err.message || "Failed to load gadget services.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  const totalServices = offerings.reduce(
    (sum, o) => sum + (o.services?.length || 0),
    0
  );
  const activeServices = offerings.reduce(
    (sum, o) =>
      sum +
      (o.activeServicesCount ??
        o.services?.filter((s) => s.isAvailable)?.length ??
        0),
    0
  );
  const uniqueDevices = new Set(
    offerings.map((o) => `${o.brand || ""}-${o.model || ""}`)
  ).size;
  const totalBrands = new Set(offerings.map((o) => o.brand).filter(Boolean)).size;

  const stats = [
    {
      id: 1,
      title: "Total Services",
      value: totalServices.toString(),
      icon: <Wrench size={24} />,
    },
    {
      id: 2,
      title: "Active Services",
      value: activeServices.toString(),
      icon: <Tag size={24} />,
    },
    {
      id: 3,
      title: "Supported Devices",
      value: uniqueDevices.toString(),
      icon: <Smartphone size={24} />,
    },
    {
      id: 4,
      title: "Brands Covered",
      value: totalBrands.toString(),
      icon: <Package size={24} />,
    },
  ];

  const columns = [
    {
      header: "Device",
      accessor: "deviceType",
      sortable: true,
      render: (o) => (
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          {o.deviceType === "phone" ? <Smartphone size={17} color="#2563eb" /> : <Laptop size={17} color="#0891b2" />}
          <span style={{ textTransform: "capitalize", fontWeight: "500" }}>{o.deviceType || "Device"}</span>
        </div>
      ),
    },
    {
      header: "Brand",
      accessor: "brand",
      sortable: true,
      render: (o) => <span style={{ fontWeight: "600", color: "#0f172a" }}>{o.brand}</span>,
    },
    {
      header: "Model",
      accessor: "model",
      sortable: true,
      render: (o) => <span>{o.model}</span>,
    },
    {
      header: "Variant",
      accessor: "variant",
      render: (o) => <span style={{ color: "#64748b" }}>{o.variant || "—"}</span>,
    },
    {
      header: "Year",
      accessor: "releaseYear",
      sortable: true,
      render: (o) => o.releaseYear || "—",
    },
    {
      header: "Services",
      accessor: "services.length",
      sortable: true,
      render: (o) => o.services?.length || 0,
    },
    {
      header: "Active",
      accessor: "activeServicesCount",
      sortable: true,
      render: (o) => o.activeServicesCount ?? (o.services?.filter((s) => s.isAvailable)?.length || 0),
    },
    {
      header: "Status",
      accessor: "isActive",
      sortable: true,
      render: (o) => {
        const active = o.isActive !== false;
        return (
          <span
            style={{
              padding: "4px 10px",
              borderRadius: "12px",
              fontSize: "12px",
              fontWeight: "600",
              background: active ? "#dcfce7" : "#f1f5f9",
              color: active ? "#15803d" : "#64748b",
            }}
          >
            {active ? "Active" : "Inactive"}
          </span>
        );
      },
    },
    {
      header: "Action",
      align: "center",
      render: (o) => (
        <Link
          href={`/admin-dashboard/gadgets/${o._id || o.id}`}
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
          <Edit size={13} /> Edit
        </Link>
      ),
    },
  ];

  const tableFilters = [
    {
      key: "deviceType",
      label: "All Devices",
      options: [
        { value: "phone", label: "Phones" },
        { value: "laptop", label: "Laptops" },
        { value: "tablet", label: "Tablets" },
      ],
    },
    {
      key: "isActive",
      label: "All Status",
      filterFn: (o, val) => (val === "active" ? o.isActive !== false : o.isActive === false),
      options: [
        { value: "active", label: "Active" },
        { value: "inactive", label: "Inactive" },
      ],
    },
  ];

  if (loading && offerings.length === 0) {
    return (
      <div className="resolve-wrap">
        <p>Loading service catalog...</p>
        <div className="respinner"></div>
      </div>
    );
  }

  if (error && offerings.length === 0) {
    return (
      <div className="resolve-wrap error">
        <AlertCircle size={32} color="#ef4444" />
        <p>{error}</p>
        <button onClick={fetchServices}>Retry</button>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      <div className="dashboard-header gadget-header">
        <div>
          <h1>Gadget Service Catalog</h1>
          <p style={{ margin: "4px 0 0", fontSize: "14px", color: "#64748b" }}>
            Manage supported device brands, repair models, and pricing catalog.
          </p>
        </div>

        {canManageCatalog && (
          <Link href={"/admin-dashboard/gadgets/service-offering"} className="create-service-btn">
            Create Service <PlusIcon size={20} />
          </Link>
        )}
      </div>

      {/* Stats */}
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

      {/* Responsive Catalog Table */}
      <AdminTable
        title={`Supported Devices & Services (${offerings.length})`}
        subtitle="Catalog models with individual repair services, parts, and warranty configuration"
        data={offerings}
        columns={columns}
        filters={tableFilters}
        searchPlaceholder="Search brand, model, variant..."
        initialPageSize={10}
        emptyMessage="No gadget service offerings found matching your search."
      />
    </div>
  );
};

export default AdminGadgets;
