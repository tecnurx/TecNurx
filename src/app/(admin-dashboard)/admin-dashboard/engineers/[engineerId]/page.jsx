"use client";

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
import axios from "../../../../../../lib/axios";

export default function EngineerDetailsPage({ params }) {
  const { engineerId } = use(params);
  const router = useRouter();

  const [engineer, setEngineer] = useState(null);
  const [stats, setStats] = useState(null);
  const [serviceProvider, setServiceProvider] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [isVerifying, setIsVerifying] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this engineer? This action cannot be undone.")) return;
    try {
      setIsDeleting(true);
      await adminService.deleteEngineerbyId(engineerId);
      router.push("/admin-dashboard/engineers");
    } catch (err) {
      console.error("Failed to delete engineer:", err);
      alert(err.response?.data?.message || "Failed to delete engineer.");
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
          const spRes = await axios.get(`/service-providers/${spId}`);
          setServiceProvider(spRes.data?.data?.servicePartner || spRes.data?.data?.serviceProvider || spRes.data?.data || spRes.data);
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
      // Reload engineer details to reflect updated verified status
      await fetchEngineer();
    } catch (err) {
      console.log("Failed to verify engineer:", err);
      alert(
        "user has to complete the Service partner form before they can be verified",
      );
    } finally {
      setIsVerifying(false);
    }
  };

  if (loading) {
    return (
      <div
        className="resolve-wrap"
        style={{
          height: "50vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
        }}
      >
        <p>Loading engineer details...</p>
        <div className="respinner"></div>
      </div>
    );
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

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.titleGroup}>
          <button
            onClick={() => router.back()}
            className={styles.subtitle}
            style={{
              marginBottom: "16px",
              background: "transparent",
              border: "none",
              cursor: "pointer",
              color: "#3b82f6",
              fontWeight: 500,
              padding: 0,
            }}
          >
            <ArrowLeft size={16} /> Back to Engineers
          </button>
          <h1>Engineer Profile</h1>
          <div className={styles.subtitle}>
            <Calendar size={16} /> Joined: {engineer.createdAt || "N/A"}
            <span style={{ margin: "0 8px" }}>•</span>
            <span
              className={`${styles.badge} ${isApproved ? styles.badgeSuccess : styles.badgeFailed}`}
            >
              {isApproved ? (
                <ShieldCheck size={14} />
              ) : (
                <ShieldAlert size={14} />
              )}
              {isApproved ? "Approved" : "Not Approved"}
            </span>
          </div>
        </div>
        <div style={{ display: "flex", gap: "12px" }}>
          {!isApproved && (
            <button
              className={styles.actionPrimary}
              onClick={handleVerify}
              disabled={isVerifying || isDeleting}
            >
              <ShieldCheck size={16} />
              {isVerifying ? "Verifying..." : "Approve Service Partner"}
            </button>
          )}
          {/* <button
            className={styles.actionPrimary}
            style={{ background: "#dc2626", borderColor: "#dc2626" }}
            onClick={handleDelete}
            disabled={isVerifying || isDeleting}
          >
            <Trash2 size={16} />
            {isDeleting ? "Deleting..." : "Delete Service Partner"}
          </button> */}
        </div>
      </div>

      <div className={styles.grid}>
        <div className={styles.card} style={{ gridColumn: "span 2" }}>
          <div className={styles.profileFlex}>
            <img
              src={
                engineer.photo && engineer.photo !== "default.jpg"
                  ? engineer.photo
                  : "/default-avatar.png"
              }
              alt="Engineer"
              className={styles.avatar}
            />
            <div>
              <div className={styles.profileName}>
                {engineer.fname} {engineer.lname}
              </div>
              <div
                className={styles.profileSub}
                style={{ display: "flex", alignItems: "center", gap: "6px" }}
              >
                <Briefcase size={14} /> {engineer.designation || "Engineer"}
              </div>
            </div>
          </div>

          <div className={styles.kvGrid}>
            <div className={styles.kvItem}>
              <span className={styles.kvKey}>
                <Mail
                  size={14}
                  style={{
                    display: "inline",
                    marginRight: "4px",
                    verticalAlign: "text-bottom",
                  }}
                />{" "}
                Email Address
              </span>
              <span className={styles.kvVal}>{engineer.email}</span>
            </div>
            <div className={styles.kvItem}>
              <span className={styles.kvKey}>
                <Phone
                  size={14}
                  style={{
                    display: "inline",
                    marginRight: "4px",
                    verticalAlign: "text-bottom",
                  }}
                />{" "}
                Phone Number
              </span>
              <span className={styles.kvVal}>
                {engineer.phoneNumber || "N/A"}
              </span>
            </div>
          </div>
        </div>

        {stats && (
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <div className={`${styles.cardIcon} ${styles.iconBlue}`}>
                <Activity size={24} />
              </div>
            </div>
            <div className={styles.cardLabel}>Total Repairs Assigned</div>
            <div className={styles.cardValue}>{stats.totalRepairs || 0}</div>

            <div className={styles.statsGrid} style={{ marginTop: "20px" }}>
              <div className={styles.statItem}>
                <span>Completed</span>
                <strong style={{ color: "#059669" }}>
                  {stats.completed || 0}
                </strong>
              </div>
              <div className={styles.statItem}>
                <span>In Progress</span>
                <strong style={{ color: "#2563eb" }}>
                  {stats.inProgress || 0}
                </strong>
              </div>
              <div className={styles.statItem}>
                <span>Pending</span>
                <strong style={{ color: "#d97706" }}>
                  {stats.pending || 0}
                </strong>
              </div>
              <div className={styles.statItem}>
                <span>Cancelled</span>
                <strong style={{ color: "#dc2626" }}>
                  {stats.cancelled || 0}
                </strong>
              </div>
            </div>
          </div>
        )}

        {serviceProvider && (
          <div className={styles.card} style={{ gridColumn: "span 2" }}>
            <div className={styles.cardHeader}>
              <div className={`${styles.cardIcon} ${styles.iconBlue}`} style={{ marginBottom: "16px" }}>
                <Briefcase size={24} />
              </div>
              <h3 style={{ fontSize: "18px", fontWeight: 600, color: "#111827", margin: 0 }}>Professional Information</h3>
            </div>
            
            <div className={styles.kvGrid} style={{ marginTop: "16px" }}>
              <div className={styles.kvItem}>
                <span className={styles.kvKey}>Full Name</span>
                <span className={styles.kvVal}>{serviceProvider.fullname || "N/A"}</span>
              </div>
              <div className={styles.kvItem}>
                <span className={styles.kvKey}>Email</span>
                <span className={styles.kvVal}>{serviceProvider.email || "N/A"}</span>
              </div>
              <div className={styles.kvItem}>
                <span className={styles.kvKey}>Phone Number</span>
                <span className={styles.kvVal}>{serviceProvider.phoneNumber || "N/A"}</span>
              </div>
              <div className={styles.kvItem}>
                <span className={styles.kvKey}>Previous Employment</span>
                <span className={styles.kvVal}>{serviceProvider.previousEmployment ? "Yes" : "No"}</span>
              </div>
              <div className={styles.kvItem}>
                <span className={styles.kvKey}>Home Address</span>
                <span className={styles.kvVal}>{serviceProvider.address || "N/A"}</span>
              </div>
              <div className={styles.kvItem}>
                <span className={styles.kvKey}>Years of Experience</span>
                <span className={styles.kvVal}>{serviceProvider.yearsOfExperience || "N/A"}</span>
              </div>
              <div className={styles.kvItem}>
                <span className={styles.kvKey}>Gadget Type</span>
                <span className={styles.kvVal}>{serviceProvider.gadgetType || "N/A"}</span>
              </div>
              <div className={styles.kvItem}>
                <span className={styles.kvKey}>Service Center</span>
                <span className={styles.kvVal}>{serviceProvider.serviceCenter ? "Yes" : "No"}</span>
              </div>
              <div className={styles.kvItem} style={{ gridColumn: "1 / -1" }}>
                <span className={styles.kvKey}>Tools & Equipment</span>
                <span className={styles.kvVal}>
                  {Array.isArray(serviceProvider.toolsUsed) 
                    ? serviceProvider.toolsUsed.join(", ") 
                    : (serviceProvider.toolsUsed || "N/A")}
                </span>
              </div>
              <div className={styles.kvItem} style={{ gridColumn: "1 / -1" }}>
                <span className={styles.kvKey}>Why Partner with us?</span>
                <span className={styles.kvVal}>{serviceProvider.whyPartner || "N/A"}</span>
              </div>
              {serviceProvider.certificate && (!Array.isArray(serviceProvider.certificate) || serviceProvider.certificate.length > 0) && (
                <div className={styles.kvItem}>
                  <span className={styles.kvKey}>Certificate</span>
                  <a href={Array.isArray(serviceProvider.certificate) ? serviceProvider.certificate[0] : serviceProvider.certificate} target="_blank" rel="noreferrer" style={{ color: "#3b82f6", textDecoration: "underline" }}>View Document</a>
                </div>
              )}
              {serviceProvider.resume && (!Array.isArray(serviceProvider.resume) || serviceProvider.resume.length > 0) && (
                <div className={styles.kvItem}>
                  <span className={styles.kvKey}>Resume</span>
                  <a href={Array.isArray(serviceProvider.resume) ? serviceProvider.resume[0] : serviceProvider.resume} target="_blank" rel="noreferrer" style={{ color: "#3b82f6", textDecoration: "underline" }}>View Document</a>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
