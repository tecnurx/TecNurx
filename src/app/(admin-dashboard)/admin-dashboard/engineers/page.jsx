"use client";

import React, { useState, useEffect } from "react";
import {
  UserCog,
  Award,
  AlertCircle,
  Building2,
  Smartphone,
} from "lucide-react";
import "./admineng.css";
import { adminService } from "../../../../../services/admin/admin";

const AdminEngineers = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [engineers, setEngineers] = useState([]);

  useEffect(() => {
    const fetchEngineers = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await adminService.getAllEngineers();
        
        // Adjust according to your actual response shape
        const data = res.data?.servicePartners || res.servicePartners || [];
        setEngineers(data);
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
      value: engineers.length.toString(),
      icon: <UserCog size={24} />,
    },
    {
      id: 2,
      title: "Service Centers",
      value: engineers.filter((e) => e.serviceCenter).length.toString(),
      icon: <Building2 size={24} />,
    },
    {
      id: 3,
      title: "Avg Experience",
      value: engineers.length
        ? (engineers.reduce((sum, e) => sum + e.experienceYears, 0) / engineers.length).toFixed(1) + " yrs"
        : "0 yrs",
      icon: <Award size={24} />,
    },
    {
      id: 4,
      title: "Phone Repairs",
      value: engineers.filter((e) => e.gadgetTypes.includes("Phones")).length.toString(),
      icon: <Smartphone size={24} />,
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
                  <th>Experience</th>
                  <th>Gadgets</th>
                  <th>Service Center?</th>
                  <th>Location</th>
                </tr>
              </thead>
              <tbody>
                {engineers.map((eng) => (
                  <tr key={eng._id}>
                    <td>{eng.fullName}</td>
                    <td>{eng.phoneNumber}</td>
                    <td>{eng.email}</td>
                    <td>{eng.experienceYears} yrs</td>
                    <td>{eng.gadgetTypes.join(", ")}</td>
                    <td>{eng.serviceCenter ? "Yes" : "No"}</td>
                    <td>{eng.address}</td>
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