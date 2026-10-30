"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { adminService } from "../../../../../../services/admin/admin";
import { useStaffPermissions } from "../../../../../../config/adminPermissions";
import {
  AlertCircle,
  ArrowLeft,
  RefreshCw,
  User,
  Wrench,
  Smartphone,
  ShieldAlert,
  MapPin,
  CheckCircle2,
  Navigation,
  Star,
  Phone,
  Mail,
  Award,
  ExternalLink,
} from "lucide-react";
import { toast } from "@/components/CustomToast";

export default function OrderDetails() {
  const { id } = useParams();
  const router = useRouter();
  const { can } = useStaffPermissions();
  const canAssign = can("repairs:assign");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [availableData, setAvailableData] = useState(null);
  const [repairDetails, setRepairDetails] = useState(null);
  const [engineers, setEngineers] = useState([]);
  const [selectedEngineerId, setSelectedEngineerId] = useState("");

  const [reassigning, setReassigning] = useState(false);
  const [reassignSuccess, setReassignSuccess] = useState("");

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      setReassignSuccess("");

      const [availRes, detailsRes] = await Promise.allSettled([
        adminService.getAvailableEngineersForRepair(id),
        adminService.getRepairById(id),
      ]);

      if (availRes.status === "fulfilled") {
        const data = availRes.value?.data || availRes.value || {};
        setAvailableData(data);
        const engList = Array.isArray(data.engineers) ? data.engineers : [];
        setEngineers(engList);
      } else {
        throw availRes.reason;
      }

      if (detailsRes.status === "fulfilled") {
        const rData =
          detailsRes.value?.data?.repair ||
          detailsRes.value?.repair ||
          detailsRes.value?.data ||
          detailsRes.value;
        setRepairDetails(rData);
      }
    } catch (err) {
      console.error("Failed to load order details:", err);
      setError(
        err.response?.data?.message ||
          err.message ||
          "Failed to load repair details and available engineers."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchData();
    }
  }, [id]);

  const handleReassign = async (engineerIdToAssign) => {
    const targetId = engineerIdToAssign || selectedEngineerId;
    if (!targetId) {
      toast.error("Please select an engineer to assign.");
      return;
    }

    try {
      setReassigning(true);
      setReassignSuccess("");

      await adminService.reassignRepair(id, targetId);
      const successMsg = "Engineer successfully reassigned to this repair!";
      setReassignSuccess(successMsg);
      toast.success(successMsg);

      await fetchData();
      setSelectedEngineerId("");
    } catch (err) {
      const errMsg =
        err.response?.data?.message || err.message || "Failed to reassign repair.";
      setError(errMsg);
      toast.error(errMsg);
    } finally {
      setReassigning(false);
    }
  };

  if (loading) {
    return (
      <div className="resolve-wrap" style={{ padding: "60px 20px", textAlign: "center" }}>
        <p style={{ color: "#64748b", fontWeight: "500", marginBottom: "16px" }}>
          Loading repair details and finding available engineers...
        </p>
        <div className="respinner"></div>
      </div>
    );
  }

  if (error && !availableData) {
    return (
      <div className="resolve-wrap error" style={{ padding: "40px", textAlign: "center" }}>
        <AlertCircle size={36} color="#ef4444" style={{ marginBottom: "12px" }} />
        <p style={{ color: "#ef4444", fontWeight: "600" }}>{error}</p>
        <button
          onClick={fetchData}
          style={{
            padding: "8px 20px",
            marginTop: "16px",
            cursor: "pointer",
            background: "#0f172a",
            color: "#ffffff",
            border: "none",
            borderRadius: "8px",
            fontWeight: "600",
          }}
        >
          Retry
        </button>
      </div>
    );
  }

  const serviceLocation = availableData?.serviceLocation || repairDetails?.serviceLocation || {};
  const coordinates = serviceLocation?.location?.coordinates; // [longitude, latitude]
  const hasCoordinates = Array.isArray(coordinates) && coordinates.length === 2;
  const mapsUrl = hasCoordinates
    ? `https://www.google.com/maps/search/?api=1&query=${coordinates[1]},${coordinates[0]}`
    : serviceLocation?.formattedAddress
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
        serviceLocation.formattedAddress
      )}`
    : null;

  return (
    <div className="admin-dashboard" style={{ padding: "24px", maxWidth: "1200px", margin: "0 auto" }}>
      {/* Top Navigation */}
      <button
        onClick={() => router.back()}
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "8px",
          background: "none",
          border: "none",
          cursor: "pointer",
          color: "#64748b",
          marginBottom: "16px",
          fontWeight: "600",
          fontSize: "14px",
        }}
      >
        <ArrowLeft size={18} /> Back to Orders
      </button>

      {/* Header Bar */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "12px",
          marginBottom: "20px",
        }}
      >
        <div>
          <h1 style={{ fontSize: "24px", fontWeight: "700", color: "#0f172a", margin: "0 0 4px" }}>
            Repair Order #{id?.slice(-8) || id}
          </h1>
          <p style={{ margin: 0, fontSize: "13px", color: "#64748b" }}>
            Full Repair ID: <code style={{ color: "#334155" }}>{id}</code>
          </p>
        </div>

        <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
          {serviceLocation?.type && (
            <span
              style={{
                padding: "6px 14px",
                borderRadius: "20px",
                fontSize: "13px",
                fontWeight: "600",
                textTransform: "uppercase",
                background: "#e0f2fe",
                color: "#0369a1",
                border: "1px solid #bae6fd",
              }}
            >
              {serviceLocation.type}
            </span>
          )}

          {repairDetails?.status && (
            <span
              style={{
                padding: "6px 14px",
                borderRadius: "20px",
                fontSize: "13px",
                fontWeight: "600",
                textTransform: "uppercase",
                background:
                  repairDetails.status === "completed"
                    ? "#dcfce7"
                    : repairDetails.status === "in_progress"
                    ? "#fef3c7"
                    : "#f1f5f9",
                color:
                  repairDetails.status === "completed"
                    ? "#15803d"
                    : repairDetails.status === "in_progress"
                    ? "#b45309"
                    : "#475569",
              }}
            >
              {repairDetails.status.replace(/_/g, " ")}
            </span>
          )}
        </div>
      </div>

      {/* Success Notification */}
      {reassignSuccess && (
        <div
          style={{
            background: "#dcfce7",
            color: "#166534",
            padding: "12px 16px",
            borderRadius: "8px",
            marginBottom: "20px",
            display: "flex",
            alignItems: "center",
            gap: "10px",
            fontSize: "14px",
            fontWeight: "500",
            border: "1px solid #bbf7d0",
          }}
        >
          <CheckCircle2 size={18} /> {reassignSuccess}
        </div>
      )}

      {/* Error Notification */}
      {error && availableData && (
        <div
          style={{
            background: "#fee2e2",
            color: "#991b1b",
            padding: "12px 16px",
            borderRadius: "8px",
            marginBottom: "20px",
            display: "flex",
            alignItems: "center",
            gap: "10px",
            fontSize: "14px",
            border: "1px solid #fecaca",
          }}
        >
          <AlertCircle size={18} /> {error}
        </div>
      )}

      {/* 2-Column Responsive Layout */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(360px, 1fr))",
          gap: "24px",
          alignItems: "start",
        }}
      >
        {/* Left Column: Order & Service Location Details */}
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          {/* Repair Details Card (If available) */}
          {repairDetails && (
            <div
              style={{
                background: "#ffffff",
                padding: "24px",
                borderRadius: "12px",
                border: "1px solid #e2e8f0",
                boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
              }}
            >
              <h2
                style={{
                  fontSize: "17px",
                  fontWeight: "600",
                  marginBottom: "16px",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  color: "#0f172a",
                }}
              >
                <Smartphone size={20} color="#3b82f6" /> Gadget & Order Information
              </h2>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                <div>
                  <p style={{ margin: "0 0 4px", fontSize: "12px", color: "#64748b" }}>Device</p>
                  <p style={{ margin: 0, fontWeight: "600", color: "#1e293b" }}>
                    {repairDetails.device?.brand || ""} {repairDetails.device?.model || "Device Details Not Specified"}
                  </p>
                </div>

                <div>
                  <p style={{ margin: "0 0 4px", fontSize: "12px", color: "#64748b" }}>Issue Category</p>
                  <p style={{ margin: 0, fontWeight: "600", color: "#1e293b", textTransform: "capitalize" }}>
                    {repairDetails.issueCategory ? repairDetails.issueCategory.replace(/_/g, " ") : "General Repair"}
                  </p>
                </div>

                {repairDetails.issueDescription && (
                  <div style={{ gridColumn: "span 2" }}>
                    <p style={{ margin: "0 0 4px", fontSize: "12px", color: "#64748b" }}>Issue Description</p>
                    <p style={{ margin: 0, fontSize: "14px", color: "#334155" }}>
                      {repairDetails.issueDescription}
                    </p>
                  </div>
                )}

                {repairDetails.customer && (
                  <div>
                    <p style={{ margin: "0 0 4px", fontSize: "12px", color: "#64748b" }}>Customer</p>
                    <p style={{ margin: 0, fontWeight: "500", color: "#1e293b" }}>
                      {repairDetails.customer.fname} {repairDetails.customer.lname}
                    </p>
                    <p style={{ margin: 0, fontSize: "12px", color: "#64748b" }}>
                      {repairDetails.customer.phoneNumber || repairDetails.customer.email}
                    </p>
                  </div>
                )}

                {repairDetails.engineer && (
                  <div>
                    <p style={{ margin: "0 0 4px", fontSize: "12px", color: "#64748b" }}>Assigned Engineer</p>
                    <p style={{ margin: 0, fontWeight: "500", color: "#1e293b" }}>
                      {repairDetails.engineer.name ||
                        `${repairDetails.engineer.fname || ""} ${repairDetails.engineer.lname || ""}`.trim() ||
                        "Currently Assigned"}
                    </p>
                    <p style={{ margin: 0, fontSize: "12px", color: "#64748b" }}>
                      {repairDetails.engineer.phoneNumber || repairDetails.engineer.email}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Service Location Info Card */}
          <div
            style={{
              background: "#ffffff",
              padding: "24px",
              borderRadius: "12px",
              border: "1px solid #e2e8f0",
              boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "16px",
              }}
            >
              <h2
                style={{
                  fontSize: "17px",
                  fontWeight: "600",
                  margin: 0,
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  color: "#0f172a",
                }}
              >
                <MapPin size={20} color="#10b981" /> Service Location Details
              </h2>

              {serviceLocation.label && (
                <span
                  style={{
                    fontSize: "12px",
                    fontWeight: "600",
                    background: "#f1f5f9",
                    color: "#475569",
                    padding: "4px 10px",
                    borderRadius: "6px",
                  }}
                >
                  {serviceLocation.label}
                </span>
              )}
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
              <div style={{ gridColumn: "span 2" }}>
                <p style={{ margin: "0 0 4px", fontSize: "12px", color: "#64748b" }}>Formatted Address</p>
                <p style={{ margin: 0, fontWeight: "600", color: "#1e293b", fontSize: "15px" }}>
                  {serviceLocation.formattedAddress ||
                    serviceLocation.streetAddress ||
                    "No Address Recorded"}
                </p>
              </div>

              {serviceLocation.streetAddress && (
                <div style={{ gridColumn: "span 2" }}>
                  <p style={{ margin: "0 0 4px", fontSize: "12px", color: "#64748b" }}>Street Address</p>
                  <p style={{ margin: 0, fontWeight: "500", color: "#334155" }}>
                    {serviceLocation.streetAddress}
                  </p>
                </div>
              )}

              <div>
                <p style={{ margin: "0 0 4px", fontSize: "12px", color: "#64748b" }}>City & State</p>
                <p style={{ margin: 0, fontWeight: "500", color: "#334155", textTransform: "capitalize" }}>
                  {[serviceLocation.city, serviceLocation.state].filter(Boolean).join(", ") || "N/A"}
                </p>
              </div>

              <div>
                <p style={{ margin: "0 0 4px", fontSize: "12px", color: "#64748b" }}>Country & Postal Code</p>
                <p style={{ margin: 0, fontWeight: "500", color: "#334155" }}>
                  {[serviceLocation.country, serviceLocation.postalCode].filter(Boolean).join(" - ") || "Nigeria"}
                </p>
              </div>

              {hasCoordinates && (
                <div style={{ gridColumn: "span 2", paddingTop: "8px" }}>
                  <p style={{ margin: "0 0 4px", fontSize: "12px", color: "#64748b" }}>GPS Coordinates</p>
                  <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
                    <code
                      style={{
                        background: "#f8fafc",
                        padding: "4px 8px",
                        borderRadius: "6px",
                        fontSize: "12px",
                        border: "1px solid #e2e8f0",
                      }}
                    >
                      {coordinates[1].toFixed(6)}, {coordinates[0].toFixed(6)}
                    </code>

                    {mapsUrl && (
                      <a
                        href={mapsUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "4px",
                          fontSize: "13px",
                          color: "#2563eb",
                          textDecoration: "none",
                          fontWeight: "500",
                        }}
                      >
                        <ExternalLink size={14} /> View on Google Maps
                      </a>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Available Engineers & Reassignment */}
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          <div
            style={{
              background: "#ffffff",
              padding: "24px",
              borderRadius: "12px",
              border: "1px solid #e2e8f0",
              boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "16px",
              }}
            >
              <h2
                style={{
                  fontSize: "17px",
                  fontWeight: "600",
                  margin: 0,
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  color: "#0f172a",
                }}
              >
                <Wrench size={20} color="#f59e0b" /> Available Engineers
              </h2>

              <span
                style={{
                  background: engineers.length > 0 ? "#f0fdf4" : "#fef2f2",
                  color: engineers.length > 0 ? "#166534" : "#991b1b",
                  fontSize: "12px",
                  fontWeight: "600",
                  padding: "4px 10px",
                  borderRadius: "12px",
                  border: `1px solid ${engineers.length > 0 ? "#bbf7d0" : "#fecaca"}`,
                }}
              >
                {engineers.length} Found
              </span>
            </div>

            {canAssign ? (
              <>
                <p style={{ fontSize: "13px", color: "#64748b", margin: "0 0 16px" }}>
                  Select an engineer nearby to reassign this repair task based on their distance and current active workload.
                </p>

                {/* Interactive Engineer Card List */}
                {engineers.length > 0 ? (
                  <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginBottom: "20px" }}>
                    {engineers.map((item, index) => {
                      const eng = item.engineer || item;
                      const engId = eng.id || eng._id;
                      const engName =
                        eng.name ||
                        `${eng.fname || ""} ${eng.lname || ""}`.trim() ||
                        "Engineer";
                      const isSelected = selectedEngineerId === engId;
                      const distance = typeof item.distance === "number" ? item.distance : null;
                      const workload = item.workload || {};

                      return (
                        <div
                          key={engId || index}
                          onClick={() => setSelectedEngineerId(engId)}
                          style={{
                            border: `2px solid ${isSelected ? "#0f172a" : "#e2e8f0"}`,
                            borderRadius: "10px",
                            padding: "14px",
                            cursor: "pointer",
                            transition: "all 0.15s ease",
                            background: isSelected ? "#f8fafc" : "#ffffff",
                          }}
                        >
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "6px" }}>
                            <div>
                              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                <input
                                  type="radio"
                                  name="selectedEngineer"
                                  checked={isSelected}
                                  onChange={() => setSelectedEngineerId(engId)}
                                  style={{ cursor: "pointer" }}
                                />
                                <span style={{ fontWeight: "600", fontSize: "15px", color: "#0f172a" }}>
                                  {engName}
                                </span>
                              </div>
                              <p style={{ margin: "2px 0 0 24px", fontSize: "12px", color: "#64748b" }}>
                                {eng.phoneNumber || eng.email}
                              </p>
                            </div>

                            {distance !== null && (
                              <span
                                style={{
                                  fontSize: "12px",
                                  fontWeight: "600",
                                  background: distance === 0 ? "#dcfce7" : "#f1f5f9",
                                  color: distance === 0 ? "#15803d" : "#475569",
                                  padding: "3px 8px",
                                  borderRadius: "6px",
                                  display: "inline-flex",
                                  alignItems: "center",
                                  gap: "4px",
                                }}
                              >
                                <Navigation size={11} />
                                {distance === 0 ? "0 km" : `${distance.toFixed(1)} km`}
                              </span>
                            )}
                          </div>

                          {/* Workload & Rating Details */}
                          <div
                            style={{
                              display: "flex",
                              gap: "16px",
                              marginTop: "10px",
                              paddingTop: "8px",
                              borderTop: "1px dashed #e2e8f0",
                              fontSize: "12px",
                              color: "#64748b",
                            }}
                          >
                            <div>
                              Active: <strong style={{ color: "#0f172a" }}>{workload.activeRepairs ?? 0}</strong>
                            </div>
                            <div>
                              Completed: <strong style={{ color: "#0f172a" }}>{workload.completedRepairs ?? 0}</strong>
                            </div>
                            {typeof workload.averageRating === "number" && workload.averageRating > 0 && (
                              <div style={{ display: "flex", alignItems: "center", gap: "3px" }}>
                                <Star size={12} fill="#eab308" color="#eab308" />
                                <strong style={{ color: "#0f172a" }}>{workload.averageRating.toFixed(1)}</strong>
                              </div>
                            )}
                          </div>

                          {item.address?.formattedAddress && (
                            <p style={{ margin: "6px 0 0", fontSize: "11px", color: "#94a3b8" }}>
                              {item.address.formattedAddress}
                            </p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div
                    style={{
                      padding: "20px",
                      background: "#fef2f2",
                      border: "1px solid #fee2e2",
                      borderRadius: "8px",
                      color: "#991b1b",
                      fontSize: "13px",
                      marginBottom: "16px",
                    }}
                  >
                    No available engineers currently match the service partner criteria or location for this repair order.
                  </div>
                )}

                {/* Reassign Action Button */}
                <button
                  onClick={() => handleReassign()}
                  disabled={!selectedEngineerId || reassigning}
                  style={{
                    width: "100%",
                    padding: "13px",
                    background: !selectedEngineerId || reassigning ? "#94a3b8" : "#0f172a",
                    color: "white",
                    border: "none",
                    borderRadius: "8px",
                    fontWeight: "600",
                    fontSize: "14px",
                    cursor: !selectedEngineerId || reassigning ? "not-allowed" : "pointer",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    gap: "8px",
                    transition: "background 0.2s",
                  }}
                >
                  {reassigning && <RefreshCw size={16} className="spin-animation" />}
                  {reassigning ? "Reassigning Repair..." : "Confirm Reassignment"}
                </button>
              </>
            ) : (
              <div
                style={{
                  padding: "16px",
                  background: "#f8fafc",
                  borderRadius: "8px",
                  border: "1px dashed #cbd5e1",
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                }}
              >
                <ShieldAlert size={22} color="#64748b" />
                <p style={{ fontSize: "13px", color: "#64748b", margin: 0 }}>
                  You have view-only access. Reassigning repairs requires the{" "}
                  <strong>repairs:assign</strong> permission.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
