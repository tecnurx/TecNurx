"use client";

import React, { useState, useEffect } from "react";
import {
  UserCog,
  Award,
  AlertCircle,
  Building2,
  Smartphone,
  CircleCheck,
  BadgeCheck,
  ShieldAlert,
} from "lucide-react";
import "./admineng.css";
import { adminService } from "../../../../../services/admin/admin";

const AdminEngineers = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [engineers, setEngineers] = useState([]);
  const [engStats, setEngStats] = useState({});

  useEffect(() => {
    const fetchEngineers = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await adminService.getAllEngineers();

        // Adjust according to your actual response shape
        const data = res.data?.engineers;
        setEngineers(data);
        setEngStats(res.stats);
      } catch (err) {
        console.error("Failed to load engineers:", err);
        setError(err.message || "Failed to load engineers. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchEngineers();
  }, []);

  // Derive stats from real data
  const stats = [
    {
      id: 1,
      title: "Total Engineers",
      value: engStats?.total,
      icon: <UserCog size={24} />,
    },
    {
      id: 2,
      title: "Verified Engineers",
      value: engStats?.verified,
      icon: <BadgeCheck size={24} />,
    },
    {
      id: 3,
      title: "Unverified Engineers",
      value: engStats?.unverified,
      icon: <ShieldAlert size={24} />,
    },
  ];

  if (loading) {
    return (
      <div className="resolve-wrap">
        <p>Loading engineers...</p>
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
        <h1>Engineers / Service Partners</h1>
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

      {/* Engineers Table */}
      <div className="adcard">
        <h3>All Engineers ({engineers.length})</h3>

        {engineers.length === 0 ? (
          <div className="empty-state">
            <p>No engineers found in the system.</p>
          </div>
        ) : (
          <div className="adtable-container">
            <table className="addata-table engineers-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Phone</th>
                  <th>Email</th>
                  <th>Created At</th>
                  <th>Verified on</th>
                  <th>Total Repairs</th>
                </tr>
              </thead>
              <tbody>
                {engineers.map((eng) => (
                  <tr key={eng._id}>
                    <td>
                      {eng.fname} {eng.lname}
                    </td>
                    <td>{eng.phoneNumber}</td>
                    <td>{eng.email}</td>
                    <td>{eng.createdAt}</td>
                    <td>{eng.verified}</td>
                    <td>{eng.stats?.totalRepairs}</td>
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

export default AdminEngineers;
