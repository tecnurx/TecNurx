"use client";

import React, { useState, useEffect } from "react";
import {
  Smartphone,
  Laptop,
  Wrench,
  DollarSign,
  Package,
  AlertCircle,
  Cpu,
  Tag,
  PlusIcon,
} from "lucide-react";
import "./adgad.css";
import { adminService } from "../../../../../services/admin/admin";
import Link from "next/link";

const AdminGadgets = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [offerings, setOfferings] = useState([]);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await adminService.getAllServices();

        // Adjust according to actual response shape
        const data = res.data?.serviceOfferings || res.serviceOfferings || [];
        setOfferings(data);
      } catch (err) {
        console.error("Failed to load service offerings:", err);
        setError(err.message || "Failed to load gadget services.");
      } finally {
        setLoading(false);
      }
    };

    fetchServices();
  }, []);

  // Calculate stats from real data
  const totalServices = offerings.reduce(
    (sum, o) => sum + o.services.length,
    0,
  );
  const activeServices = offerings.reduce(
    (sum, o) => sum + o.activeServicesCount,
    0,
  );
  const uniqueDevices = new Set(offerings.map((o) => `${o.brand}-${o.model}`))
    .size;
  const totalBrands = new Set(offerings.map((o) => o.brand)).size;

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

  if (loading) {
    return (
      <div className="resolve-wrap">
        <p>Loading service catalog...</p>
        <div className="respinner"></div>
      </div>
    );
  }

  if (error) {
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
      <div className="dashboard-header gadget-header">
        <h1>Gadget Service Catalog</h1>
        <Link href={'/admin-dashboard/gadgets/service-offering'}>Create Service  <PlusIcon size={24} /></Link>
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

      {/* Service Offerings Table */}
      <div className="adcard">
        <h2>Supported Devices & Services ({offerings.length})</h2>

        {offerings.length === 0 ? (
          <div className="empty-state">
            <p>No gadget service offerings found in the system.</p>
          </div>
        ) : (
          <div className="adtable-container">
            <table className="addata-table gadgets-table">
              <thead>
                <tr>
                  <th>Device</th>
                  <th>Brand</th>
                  <th>Model</th>
                  <th>Variant</th>
                  <th>Year</th>
                  <th>Services</th>
                  <th>Active</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {offerings.map((offering) => (
                  <tr key={offering._id}>
                    <td>
                      <div className="device-cell">
                        {offering.deviceType === "phone" ? (
                          <Smartphone size={18} />
                        ) : (
                          <Laptop size={18} />
                        )}
                        {offering.deviceType}
                      </div>
                    </td>
                    <td>{offering.brand}</td>
                    <td>{offering.model}</td>
                    <td>{offering.variant || "—"}</td>
                    <td>{offering.releaseYear || "—"}</td>
                    <td>{offering.services.length}</td>
                    <td>{offering.activeServicesCount}</td>
                    <td>
                      <span
                        className={`status-badge ${offering.isActive ? "active" : "inactive"}`}
                      >
                        {offering.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminGadgets;
