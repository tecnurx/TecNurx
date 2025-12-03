// DashboardInsurance.jsx
"use client";
import React, { useState } from "react";
import "./dashinsure.css";
import {
  Shield,
  FileText,
  History,
  Upload,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
} from "lucide-react";

const DashboardInsurance = () => {
  const [activeTab, setActiveTab] = useState("active");
  const [selectedDevice, setSelectedDevice] = useState("");
  const [issue, setIssue] = useState("");
  const [files, setFiles] = useState([]);

  // Sample data
  const activePlans = [
    {
      id: "POL-2025-001",
      device: "iPhone 15 Pro",
      coverage: "Accidental Damage + Liquid",
      expires: "Oct 12, 2026",
      premium: "$89/year",
    },
    {
      id: "POL-2025-008",
      device: 'MacBook Pro 14"',
      coverage: "Full Protection + Theft",
      expires: "Jan 20, 2027",
      premium: "$149/year",
    },
  ];

  const claimHistory = [
    {
      id: "CLM-1001",
      date: "Jul 5, 2025",
      device: "iPhone 13",
      issue: "Screen cracked",
      status: "approved",
      payout: "$179",
    },
    {
      id: "CLM-0994",
      date: "Mar 18, 2025",
      device: "Galaxy S23",
      issue: "Battery swelling",
      status: "rejected",
      payout: "—",
      reason: "Wear & tear",
    },
    {
      id: "CLM-1012",
      date: "Nov 10, 2025",
      device: "MacBook Pro",
      issue: "Keyboard failure",
      status: "pending",
      payout: "Pending",
    },
  ];

  const devicesForClaim = [
    "iPhone 15 Pro",
    'MacBook Pro 14"',
    "Galaxy Watch 6",
    "iPad Air (5th Gen)",
  ];

  const handleFileChange = (e) => {
    setFiles(e.target.files);
  };

  return (
    <div className="insurance-page">
      <div className="insurance-header">
        <h1>Insurance</h1>
        <p>Manage your device protection plans and claims</p>
      </div>

      {/* Tabs */}
      <div className="insurance-tabs">
        <button
          className={activeTab === "active" ? "tab active" : "tab"}
          onClick={() => setActiveTab("active")}
        >
          <Shield size={18} />
          Active Plans
        </button>
        <button
          className={activeTab === "claim" ? "tab active" : "tab"}
          onClick={() => setActiveTab("claim")}
        >
          <FileText size={18} />
          Claim Insurance
        </button>
        <button
          className={activeTab === "history" ? "tab active" : "tab"}
          onClick={() => setActiveTab("history")}
        >
          <History size={18} />
          Claim History
        </button>
      </div>

      {/* Tab Content */}
      <div className="insurance-content">
        {/* 1. Active Plans */}
        {activeTab === "active" && (
          <div className="active-plans">
            {activePlans.map((plan) => (
              <div key={plan.id} className="plan-card">
                <div className="plan-info">
                  <div className="plan-id">{plan.id}</div>
                  <h3>{plan.device}</h3>
                  <p className="coverage">{plan.coverage}</p>
                  <div className="plan-meta">
                    <span>
                      Expires: <strong>{plan.expires}</strong>
                    </span>
                    <span>• {plan.premium}</span>
                  </div>
                </div>
                <div className="plan-actions">
                  <button className="renew-btn">Renew Plan</button>
                  <a href="#" className="view-policy">
                    View Policy →
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 2. Claim Insurance */}
        {activeTab === "claim" && (
          <div className="claim-form-container">
            <form className="claim-form">
              <h2>File a New Claim</h2>
              <p>Fill in the details below to start your insurance claim.</p>

              <div className="form-group">
                <label>Device</label>
                <select
                  value={selectedDevice}
                  onChange={(e) => setSelectedDevice(e.target.value)}
                  required
                >
                  <option value="">Select a device</option>
                  {devicesForClaim.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Describe the Issue</label>
                <textarea
                  value={issue}
                  onChange={(e) => setIssue(e.target.value)}
                  placeholder="E.g., Dropped phone, screen cracked. Water damage from rain..."
                  rows="5"
                  required
                />
              </div>

              <div className="form-group">
                <label>Upload Proof (Photos/Video)</label>
                <div className="file-upload">
                  <input
                    type="file"
                    multiple
                    accept="image/*,video/*"
                    onChange={handleFileChange}
                  />
                  <div className="upload-area">
                    <Upload size={32} />
                    <p>Click to upload or drag & drop</p>
                    <span>Max 5 files, 50MB each</span>
                  </div>
                </div>
                {files.length > 0 && (
                  <div className="uploaded-files">
                    {Array.from(files).map((file, i) => (
                      <div key={i}>{file.name}</div>
                    ))}
                  </div>
                )}
              </div>

              <button type="submit" className="submit-claim-btn">
                Submit Claim
              </button>
            </form>
          </div>
        )}

        {/* 3. Claim History */}
        {activeTab === "history" && (
          <div className="claim-history">
            {claimHistory.map((claim) => (
              <div key={claim.id} className="claim-item">
                <div className="claim-main">
                  <div className="claim-id-date">
                    <strong>{claim.id}</strong> • {claim.date}
                  </div>
                  <div className="claim-device-issue">
                    <h4>{claim.device}</h4>
                    <p>{claim.issue}</p>
                  </div>
                </div>
                <div className="claim-status">
                  <div className={`status-badgee ${claim.status}`}>
                    {claim.status === "approved" && <CheckCircle size={16} />}
                    {claim.status === "rejected" && <XCircle size={16} />}
                    {claim.status === "pending" && <Clock size={16} />}
                    {claim.status.charAt(0).toUpperCase() +
                      claim.status.slice(1)}
                  </div>
                  <div className="payout">
                    {claim.payout !== "Pending"
                      ? `$${claim.payout}`
                      : claim.payout}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardInsurance;
