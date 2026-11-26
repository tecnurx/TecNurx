"use client";
import TecNurxLoader from "@/components/TecNurxLoader";

import React, { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  ArrowLeft,
  User,
  Mail,
  Phone,
  Calendar,
  CheckCircle2,
  AlertCircle,
  Briefcase,
  Activity,
  ShieldCheck,
  ShieldAlert,
  Trash2,
} from "lucide-react";
import styles from "./engineer.module.css";
import { adminService } from "../../../../../../services/admin/admin";
import { useStaffPermissions } from "../../../../../../config/adminPermissions";
import axios from "../../../../../../lib/axios";
import { toast } from "@/components/CustomToast";
import ConfirmModal from "@/components/ConfirmModal";

export default function EngineerDetailsPage({ params }) {
  const { engineerId } = use(params);
  const router = useRouter();
  const { can } = useStaffPermissions();
  const canVerify = can("engineers:verify");

  const [engineer, setEngineer] = useState(null);
  const [stats, setStats] = useState(null);
  const [serviceProvider, setServiceProvider] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [isVerifying, setIsVerifying] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      await adminService.deleteEngineerbyId(engineerId);
      toast.success("Engineer deleted successfully.");
      setDeleteModalOpen(false);
      router.push("/admin-dashboard/engineers");
    } catch (err) {
      console.error("Failed to delete engineer:", err);
      toast.error(err.response?.data?.message || "Failed to delete engineer.");
    } finally {
      setIsDeleting(false);
    }
  };

  const fetchEngineer = async () => {
    try {
      setLoading(true);
      const response = await adminService.getEngineerbyId(engineerId);
      setEngineer(response.data?.engineer || response.data);
      setStats(response.data?.stats || null);

      const spId = response.data?.servicePartnerId || response.servicePartnerId;
      if (spId) {
        try {
          const spRes = await adminService.getServicePartnerById(spId);
          setServiceProvider(
            spRes.data?.servicePartner ||
              spRes.data?.serviceProvider ||
              spRes.data ||
              spRes
          );
        } catch (spErr) {
          console.log("Service provider details not found", spErr.message);
        }
      }
    } catch (err) {
      setError("Failed to load engineer details");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (engineerId) {
      fetchEngineer();
    }
  }, [engineerId]);

  const handleVerify = async () => {
    try {
      setIsVerifying(true);
      await adminService.verifyEngineer(engineerId);
      toast.success("Service partner approved successfully!");
      await fetchEngineer();
    } catch (err) {
      console.log("Failed to verify engineer:", err);
      toast.error(
        err.response?.data?.message ||
          "User has to complete the Service Partner form before they can be verified."
      );
    } finally {
      setIsVerifying(false);
    }
  };

  if (loading) {
    return <TecNurxLoader minHeight="65vh" size="lg" />;
  }

  if (error || !engineer) {
    return (
      <div
        className={styles.container}
        style={{ textAlign: "center", padding: "40px" }}
      >
        <AlertCircle
          size={64}
          color="#ef4444"
          style={{ margin: "0 auto 16px" }}
        />
        <h2>{error || "Engineer not found"}</h2>
        <button
          onClick={() => router.back()}
          className={styles.actionPrimary}
          style={{ margin: "24px auto 0" }}
        >
          Go Back
        </button>
      </div>
    );
  }

  const isApproved = serviceProvider?.isApproved || false;
  const fullName = `${engineer.fname || ""} ${engineer.lname || ""}`.trim() || "Engineer";
  const initials = `${engineer.fname?.[0] || ""}${engineer.lname?.[0] || ""}`.toUpperCase() || "EN";

  return (
    <div className="admin-dashboard">
      {/* Topbar */}
      <div className="dashboard-header-row" style={{ alignItems: "center" }}>
        <button
          type="button"
          onClick={() => router.back()}
          className="admin-btn-outline"
        >
          <ArrowLeft size={16} /> Back to Engineers
        </button>

        <span className="admin-workspace-tag">
          <Briefcase size={14} />
          <span>Engineer Profile</span>
        </span>
      </div>

      {/* Pitch-Black Hero Banner */}
      <div className="admin-hero-banner">
        <div className="admin-hero-left">
          <span className="admin-hero-pill">
            <span>●</span>
            <span>{isApproved ? "Approved Partner" : "Pending Approval"}</span>
          </span>
          <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
            {engineer.photo && engineer.photo !== "default.jpg" ? (
              <img
                src={engineer.photo}
                alt={fullName}
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
              <p className="admin-hero-sub">
                {engineer.designation || "Service Engineer"} · Joined{" "}
                {engineer.createdAt
                  ? new Date(engineer.createdAt).toLocaleDateString()
                  : "N/A"}
              </p>
            </div>
          </div>
        </div>

        <div className="admin-hero-actions">
          {!isApproved && canVerify && (
            <button
              type="button"
              className="admin-btn-yellow"
              onClick={handleVerify}
              disabled={isVerifying || isDeleting}
            >
              <ShieldCheck size={16} />
              <span>{isVerifying ? "Verifying..." : "Approve Service Partner"}</span>
            </button>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="dashboard-cards">
          <div className="stat-card">
            <div>
              <span>Total Assigned</span>
              <h3>{stats.totalRepairs || 0}</h3>
            </div>
            <Activity size={20} />
          </div>
          <div className="stat-card">
            <div>
              <span>Completed</span>
              <h3 style={{ color: "#15803d" }}>{stats.completed || 0}</h3>
            </div>
            <ShieldCheck size={20} />
          </div>
          <div className="stat-card">
            <div>
              <span>In Progress</span>
              <h3 style={{ color: "#0369a1" }}>{stats.inProgress || 0}</h3>
            </div>
            <Briefcase size={20} />
          </div>
          <div className="stat-card">
            <div>
              <span>Pending</span>
              <h3 style={{ color: "#b45309" }}>{stats.pending || 0}</h3>
            </div>
            <ShieldAlert size={20} />
          </div>
        </div>
      )}

      {/* 2-Column Details Grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1.45fr 1fr",
          gap: "24px",
          alignItems: "start",
        }}
      >
        {/* Left: Professional Information */}
        {serviceProvider ? (
          <div className="adcard">
            <h2
              style={{
                fontSize: "18px",
                fontWeight: 700,
                color: "#111827",
                margin: "0 0 18px",
              }}
            >
              Professional &amp; Partner Details
            </h2>

            {[
              { label: "Full Name", value: serviceProvider.fullname || fullName },
              { label: "Partner Email", value: serviceProvider.email || engineer.email || "N/A" },
              { label: "Phone Number", value: serviceProvider.phoneNumber || engineer.phoneNumber || "N/A" },
              { label: "Years of Experience", value: serviceProvider.yearsOfExperience || "N/A" },
              { label: "Gadget Type", value: serviceProvider.gadgetType || "N/A" },
              { label: "Home Address", value: serviceProvider.address || "N/A" },
              { label: "Service Center", value: serviceProvider.serviceCenter ? "Yes" : "No" },
              { label: "Previous Employment", value: serviceProvider.previousEmployment ? "Yes" : "No" },
              {
                label: "Tools & Equipment",
                value: Array.isArray(serviceProvider.toolsUsed)
                  ? serviceProvider.toolsUsed.join(", ")
                  : serviceProvider.toolsUsed || "N/A",
              },
            ].map((row) => (
              <div
                key={row.label}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  gap: "16px",
                  padding: "12px 0",
                  borderBottom: "1px solid #f1f5f9",
                  fontSize: "14px",
                }}
              >
                <span style={{ color: "#64748b", flexShrink: 0 }}>{row.label}</span>
                <strong style={{ color: "#111827", textAlign: "right" }}>{row.value}</strong>
              </div>
            ))}

            {serviceProvider.whyPartner && (
              <div
                style={{
                  marginTop: "14px",
                  padding: "14px 16px",
                  background: "#f8fafc",
                  borderRadius: "12px",
                  border: "1px solid #f1f5f9",
                  fontSize: "13.5px",
                  color: "#334155",
                }}
              >
                <strong style={{ display: "block", color: "#111827", marginBottom: "4px" }}>
                  Why Partner with TecNurx?
                </strong>
                {serviceProvider.whyPartner}
              </div>
            )}

            {(serviceProvider.certificate || serviceProvider.resume) && (
              <div style={{ display: "flex", gap: "10px", marginTop: "16px", flexWrap: "wrap" }}>
                {serviceProvider.certificate &&
                  (!Array.isArray(serviceProvider.certificate) ||
                    serviceProvider.certificate.length > 0) && (
                    <a
                      href={
                        Array.isArray(serviceProvider.certificate)
                          ? serviceProvider.certificate[0]
                          : serviceProvider.certificate
                      }
                      target="_blank"
                      rel="noreferrer"
                      className="admin-btn-outline"
                    >
                      View Certificate
                    </a>
                  )}
                {serviceProvider.resume &&
                  (!Array.isArray(serviceProvider.resume) ||
                    serviceProvider.resume.length > 0) && (
                    <a
                      href={
                        Array.isArray(serviceProvider.resume)
                          ? serviceProvider.resume[0]
                          : serviceProvider.resume
                      }
                      target="_blank"
                      rel="noreferrer"
                      className="admin-btn-outline"
                    >
                      View Resume
                    </a>
                  )}
              </div>
            )}
          </div>
        ) : (
          <div className="adcard">
            <h2 style={{ fontSize: "18px", fontWeight: 700, margin: "0 0 10px" }}>
              Partner Application
            </h2>
            <p style={{ margin: 0, color: "#64748b", fontSize: "14px" }}>
              No service partner profile submitted yet.
            </p>
          </div>
        )}

        {/* Right: Account Contact Card */}
        <div className="adcard">
          <h2
            style={{
              fontSize: "18px",
              fontWeight: 700,
              color: "#111827",
              margin: "0 0 18px",
            }}
          >
            Account &amp; Contact
          </h2>

          {[
            { label: "Email Address", value: engineer.email || "N/A" },
            { label: "Phone Number", value: engineer.phoneNumber || "N/A" },
            { label: "Designation", value: engineer.designation || "Engineer" },
            { label: "Cancelled Jobs", value: stats?.cancelled || 0 },
          ].map((row) => (
            <div
              key={row.label}
              style={{
                display: "flex",
                justifyContent: "space-between",
                gap: "12px",
                padding: "12px 0",
                borderBottom: "1px solid #f1f5f9",
                fontSize: "14px",
              }}
            >
              <span style={{ color: "#64748b" }}>{row.label}</span>
              <strong style={{ color: "#111827" }}>{row.value}</strong>
            </div>
          ))}
        </div>
      </div>

      {/* Delete Engineer Confirm Modal */}
      <ConfirmModal
        isOpen={deleteModalOpen}
        title="Delete Engineer"
        message="Are you sure you want to delete this engineer? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        type="danger"
        isLoading={isDeleting}
        onConfirm={handleDelete}
        onCancel={() => setDeleteModalOpen(false)}
      />
    </div>
  );
}
