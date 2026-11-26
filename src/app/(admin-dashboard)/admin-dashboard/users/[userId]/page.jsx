"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import {
  ArrowLeft,
  User,
  ShieldCheck,
  Clock,
  AlertCircle,
} from "lucide-react";
import "./userid.css";
import { adminService } from "../../../../../../services/admin/admin";
import TecNurxLoader from "@/components/TecNurxLoader";

const UserDetailsPage = () => {
  const { userId } = useParams();
  const router = useRouter();

  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        setLoading(true);
        const response = await adminService.getUserbyId(userId);
        setUserData(response.data);
      } catch (err) {
        setError("Failed to load user details. Please try again.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [userId]);

  if (loading) {
    return <TecNurxLoader minHeight="65vh" size="lg" />;
  }

  if (error || !userData) {
    return (
      <div className="admin-dashboard">
        <div className="adcard" style={{ textAlign: "center", padding: "48px 24px" }}>
          <AlertCircle size={44} color="#ef4444" style={{ margin: "0 auto 12px" }} />
          <h2 style={{ margin: "0 0 12px", color: "#111827" }}>
            {error || "User not found"}
          </h2>
          <button
            type="button"
            onClick={() => router.back()}
            className="admin-btn-outline"
          >
            <ArrowLeft size={15} /> Go Back
          </button>
        </div>
      </div>
    );
  }

  const { user, stats } = userData;
  const fullName = `${user.fname || ""} ${user.lname || ""}`.trim() || "User";
  const initials =
    `${user.fname?.[0] || ""}${user.lname?.[0] || ""}`.toUpperCase() || "US";

  return (
    <div className="admin-dashboard">
      {/* Topbar */}
      <div className="dashboard-header-row" style={{ alignItems: "center" }}>
        <button
          type="button"
          onClick={() => router.back()}
          className="admin-btn-outline"
        >
          <ArrowLeft size={16} /> Back to Users
        </button>

        <span className="admin-workspace-tag">
          <User size={14} />
          <span>User Profile</span>
        </span>
      </div>

      {/* Pitch-Black Hero Banner */}
      <div className="admin-hero-banner">
        <div className="admin-hero-left">
          <span className="admin-hero-pill">
            <span>●</span>
            <span>{user.isVerified ? "Verified Account" : "Unverified"}</span>
          </span>

          <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
            {user.photo && user.photo !== "default.jpg" && !imgError ? (
              <Image
                src={user.photo}
                alt={fullName}
                width={52}
                height={52}
                onError={() => setImgError(true)}
                style={{
                  width: "52px",
                  height: "52px",
                  borderRadius: "50%",
                  objectFit: "cover",
                  border: "2px solid rgba(255,255,255,0.25)",
                }}
              />
            ) : (
              <div
                style={{
                  width: "52px",
                  height: "52px",
                  borderRadius: "50%",
                  background: "#ffb800",
                  color: "#000000",
                  fontWeight: 800,
                  fontSize: "18px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {initials}
              </div>
            )}

            <div>
              <h1 className="admin-hero-title">{fullName}</h1>
              <p className="admin-hero-sub" style={{ textTransform: "capitalize" }}>
                {user.role || "Customer"} · {user.email}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="dashboard-cards">
        <div className="stat-card">
          <div>
            <span>Total Devices</span>
            <h3>{stats?.totalDevices ?? 0}</h3>
          </div>
          <User size={20} />
        </div>
        <div className="stat-card">
          <div>
            <span>Total Repairs</span>
            <h3>{stats?.totalRepairs ?? 0}</h3>
          </div>
          <Clock size={20} />
        </div>
        <div className="stat-card">
          <div>
            <span>Completed</span>
            <h3 style={{ color: "#15803d" }}>{stats?.completedRepairs ?? 0}</h3>
          </div>
          <ShieldCheck size={20} />
        </div>
        <div className="stat-card">
          <div>
            <span>Pending</span>
            <h3 style={{ color: "#b45309" }}>{stats?.pendingRepairs ?? 0}</h3>
          </div>
          <Clock size={20} />
        </div>
      </div>

      {/* Personal & Account Details Card */}
      <div className="adcard">
        <h2
          style={{
            fontSize: "18px",
            fontWeight: 700,
            color: "#111827",
            margin: "0 0 18px",
          }}
        >
          Account &amp; Personal Information
        </h2>

        {[
          { label: "Email Address", value: user.email || "Not provided" },
          { label: "Phone Number", value: user.phoneNumber || "Not provided" },
          {
            label: "Date of Birth",
            value: user.dateOfBirth
              ? new Date(user.dateOfBirth).toLocaleDateString("en-NG", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })
              : "Not provided",
          },
          {
            label: "Gender",
            value: user.gender || "Not specified",
            capitalize: true,
          },
          {
            label: "Verification Status",
            value: user.isVerified ? "Verified" : "Not Verified",
          },
          {
            label: "Joined",
            value: user.createdAt
              ? new Date(user.createdAt).toLocaleDateString()
              : "N/A",
          },
        ].map((row) => (
          <div
            key={row.label}
            style={{
              display: "flex",
              justifyContent: "space-between",
              gap: "16px",
              padding: "13px 0",
              borderBottom: "1px solid #f1f5f9",
              fontSize: "14px",
            }}
          >
            <span style={{ color: "#64748b" }}>{row.label}</span>
            <strong
              style={{
                color: "#111827",
                textTransform: row.capitalize ? "capitalize" : "none",
              }}
            >
              {row.value}
            </strong>
          </div>
        ))}
      </div>
    </div>
  );
};

export default UserDetailsPage;
