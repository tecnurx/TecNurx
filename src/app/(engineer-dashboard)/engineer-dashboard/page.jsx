"use client";

import React, { useState, useEffect } from "react";
import "./engineer.css";
import { engService } from "../../../../services/eng/eng";
import {
  DollarSign,
  CheckCircle2,
  Clock,
  Wrench,
  AlertCircle,
  Calendar,
  Smartphone,
  User,
  Wallet,
} from "lucide-react";
import { engineerAuthService } from "../../../../services/eng/engineerAuth";

const EngineerDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [repairs, setRepairs] = useState([]);
  const [currentUser, setCurrentUser] = useState({});

  // Fetch  data
  useEffect(() => {
    const fetchRepairs = async () => {
      try {
        setLoading(true);
        setError(null);

        // Get current user
        const user = engineerAuthService.getCurrentUser();
        setCurrentUser(user);
        console.log(currentUser)

        //fetch repairs
        const res = await engService.getEngineerRepairs();

        // Adjust based on your actual response structure
        const data = res.data?.repairs || res.repairs || [];
        setRepairs(data);
      } catch (err) {
        console.error("Failed to load repairs:", err);
        setError(err.message || "Failed to load your repairs.");
      } finally {
        setLoading(false);
      }
    };

    fetchRepairs();
  }, []);

  // Dynamic stats from real data
  const totalEarnings = repairs.reduce(
    (sum, r) => sum + (r.estimatedCost?.totalCost || 0),
    0,
  );
  const completedRepairs = repairs.filter(
    (r) => r.status === "completed" || r.status === "delivered",
  ).length;
  const pendingRepairs = repairs.filter(
    (r) => r.status === "engineer_assigned" || r.status === "pending",
  ).length;

  const stats = [
    {
      id: 1,
      title: "Total Earnings",
      value: `₦${totalEarnings.toLocaleString()}`,
      icon: <DollarSign size={24} />,
    },
    {
      id: 2,
      title: "Completed Repairs",
      value: completedRepairs.toString(),
      icon: <CheckCircle2 size={24} />,
    },
    {
      id: 3,
      title: "Pending Repairs",
      value: pendingRepairs.toString(),
      icon: <Clock size={24} />,
    },
    {
      id: 4,
      title: "Assigned Repairs",
      value: repairs.length.toString(),
      icon: <Wrench size={24} />,
    },
  ];

  if (loading) {
    return (
      <div className="resolve-wrap">
        <p>Loading...</p>
        <div className="respinner"></div>
      </div>
    );
  }

  return (
    <div className="dashboard-overview">
      <div className="engdashboard-header">
        <h1>Welcome, {currentUser?.fname}!</h1>
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

      {/* Wallet Balance Card */}
      <div className="balance-card">
        <h2>Wallet Balance</h2>
        <div className="balance-amount">₦300,000</div>{" "}
        {/* Fetch this in real app */}
        <button className="btn-primary">Withdraw</button>
        <div className="search-bar">
          <input type="text" placeholder="Search by order number" />
          <button className="btn-search">Search</button>
        </div>
      </div>

      {/* Main Sections */}
      <div className="sections-grid">
        {/* My Repairs */}
        <div className="engcardd">
          <h3>My Repairs ({repairs.length})</h3>
          <div className="table-container">
            {repairs.length === 0 ? (
              <p className="empty-state">No repairs assigned yet.</p>
            ) : (
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Order No.</th>
                    <th>Date Assigned</th>
                    <th>Fault Fixed</th>
                    <th>Repair Status</th>
                    <th>Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {repairs.map((repair) => (
                    <tr key={repair._id}>
                      <td>#{repair._id.slice(-8)}</td>
                      <td>
                        {new Date(
                          repair.assignedAt || repair.createdAt,
                        ).toLocaleDateString()}
                      </td>
                      <td>
                        {repair.device.brand.toUpperCase()}{" "}
                        {repair.device.model} -{" "}
                        {repair.issueCategory.replace(/_/g, " ")}
                      </td>
                      <td className={`status-${repair.status}`}>
                        {repair.status.replace(/_/g, " ")}
                      </td>
                      <td>
                        ₦
                        {(
                          repair.estimatedCost?.totalCost || 0
                        ).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* My Payments (placeholder - expand later) */}
        <div className="engcardd">
          <h3>My Payments</h3>
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Order No.</th>
                  <th>Fault Fixed</th>
                  <th>Payment Status</th>
                  <th>Amount</th>
                </tr>
              </thead>
              <tbody>
                {repairs.map((repair) => (
                  <tr key={repair._id}>
                    <td>#{repair._id.slice(-8)}</td>
                    <td>
                      {repair.device.brand} {repair.device.model} -{" "}
                      {repair.issueCategory.replace(/_/g, " ")}
                    </td>
                    <td className={`payment-${repair.paymentStatus}`}>
                      {repair.paymentStatus}
                    </td>
                    <td>
                      ₦{(repair.estimatedCost?.totalCost || 0).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* My Transactions - Full Width */}
        <div className="engcardd transactions-card">
          <h3>My Transactions</h3>
          <div className="transaction-list">
            <div className="transaction-item">
              <span className="date">05-05-2025</span>
              <div className="details">
                <span className="icon withdrawal">Withdrawal</span>
                <span className="ref">Ref: xxxxxxxxxxxx</span>
              </div>
              <span className="amount withdrawal">-₦25,000</span>
            </div>
            <div className="transaction-item">
              <span className="date">05-05-2025</span>
              <div className="details">
                <span className="icon topup">Wallet Top Up</span>
                <span className="ref">Ref: xxxxxxxxxxxx</span>
              </div>
              <span className="amount topup">+₦120,000</span>
            </div>
            <div className="transaction-item">
              <span className="date">06-05-2025</span>
              <div className="details">
                <span className="icon withdrawal">Withdrawal</span>
                <span className="ref">Ref: xxxxxxxxxxxx</span>
              </div>
              <span className="amount withdrawal">-₦100,000</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EngineerDashboard;
