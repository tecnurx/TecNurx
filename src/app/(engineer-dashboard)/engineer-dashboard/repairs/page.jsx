"use client";

import React, { useState, useEffect } from "react";
import "../engineer.css";
import { engService } from "../../../../../services/eng/eng";
import Link from "next/link";

const RepairsPage = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [repairs, setRepairs] = useState([]);

  useEffect(() => {
    const fetchRepairs = async () => {
      try {
        setLoading(true);
        setError(null);

        //fetch repairs
        const res = await engService.getEngineerRepairs();

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
        <h1>Engineer Repairs</h1>
      </div>

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
                  <th>Action</th>
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
                      {repair.device.brand.toUpperCase()} {repair.device.model}{" "}
                      - {repair.issueCategory.replace(/_/g, " ")}
                    </td>
                    <td>{repair.status.replace(/_/g, " ")}</td>
                    <td>
                      ₦{(repair.estimatedCost?.totalCost || 0).toLocaleString()}
                    </td>
                    <td>
                      <Link
                        href={`/engineer-dashboard/repairs/${repair._id}`}
                        className="view-repair"
                      >
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default RepairsPage;
