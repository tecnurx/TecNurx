"use client";

import React, { useState, useEffect } from "react";
import {
  Banknote,
  CheckCircle2,
  Users,
  Wrench,
  AlertCircle,
  Calendar,
  MapPin,
  Smartphone,
  User,
} from "lucide-react";
import "./adorder.css";
import { adminService } from "../../../../../services/admin/admin";

const AdminOrders = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [repairs, setRepairs] = useState([]);

  useEffect(() => {
    const fetchRepairs = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await adminService.getAllRepairs();
        const repairStat = await adminService.getRepairStats()
        console.log(repairStat);

        // Adjust path based on your actual response structure
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

  // Dynamic stats based on real data
  const totalRevenue = repairs
    .filter((r) => r.paymentStatus === "paid" || r.paymentStatus === "completed")
    .reduce((sum, r) => sum + (r.estimatedCost?.totalCost || 0), 0);

  const stats = [
    {
      id: 1,
      title: "Total Revenue",
      value: `₦${totalRevenue.toLocaleString()}`,
      icon: <Banknote size={24} />,           // Best for money/revenue
    },
    {
      id: 2,
      title: "Completed Repairs",
      value: repairs.filter((r) => r.status === "completed" || r.status === "delivered").length.toString(),
      icon: <CheckCircle2 size={24} />,         // Clear "done" / completed icon
    },
    {
      id: 3,
      title: "Total Customers",
      value: new Set(repairs.map((r) => r.user?._id)).size.toString() || "0",
      icon: <Users size={24} />,                // Multiple people = customers
    },
    {
      id: 4,
      title: "Assigned Engineers",
      value: new Set(repairs.map((r) => r.engineer?._id)).size.toString() || "0",
      icon: <Wrench size={24} />,               // Technician/repair tool feel
    },
  ];

  if (loading) {
    return (
      <div className="resolve-wrap">
        <p>Loading orders...</p>
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
      <div className="dashboard-header">
        <h1>Repair Orders</h1>
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

      {/* Orders Table */}
      <div className="adcard">
        <h3>All Repair Orders ({repairs.length})</h3>

        {repairs.length === 0 ? (
          <div className="empty-state">
            <p>No repair orders found.</p>
          </div>
        ) : (
          <div className="adtable-container">
            <table className="addata-table orders-table">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Customer</th>
                  <th>Device</th>
                  <th>Issue</th>
                  <th>Engineer</th>
                  <th>Status</th>
                  <th>Payment</th>
                  <th>Cost</th>
                  <th>Created</th>
                </tr>
              </thead>
              <tbody>
                {repairs.map((repair) => (
                  <tr key={repair._id}>
                    <td>#{repair._id.slice(-8)}</td>
                    <td>
                      {repair.user?.fname} {repair.user?.lname?.[0] || ""}
                    </td>
                    <td>
                      {repair.device?.brand?.toUpperCase()} {repair.device?.model}
                    </td>
                    <td>{repair.issueCategory.replace(/_/g, " ")}</td>
                    <td>
                      {repair.engineer?.fname} {repair.engineer?.lname?.[0] || ""}
                    </td>
                    <td className={`status-${repair.status}`}>
                      {repair.status.replace(/_/g, " ")}
                    </td>
                    <td className={`payment-${repair.paymentStatus}`}>
                      {repair.paymentStatus}
                    </td>
                    <td>₦{(repair.estimatedCost?.totalCost || 0).toLocaleString()}</td>
                    <td>{new Date(repair.createdAt).toLocaleDateString()}</td>
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

export default AdminOrders;