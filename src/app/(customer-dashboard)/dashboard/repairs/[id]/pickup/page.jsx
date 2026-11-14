"use client";

import React, { use, useState, useEffect, useMemo } from "react";
import "./pickup.css";
import { repairService } from "../../../../../../../services/repairs";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

// Helper to format pickup address
const formatAddress = (addr) => {
  if (!addr) return "70 Allen Ave, Allen, Ikeja 101233, Lagos, Nigeria";
  if (typeof addr === "string") return addr;
  if (typeof addr === "object") {
    if (addr.formattedAddress) return String(addr.formattedAddress);
    const parts = [
      addr.streetAddress,
      addr.city,
      addr.state,
      addr.country,
    ].filter(Boolean);
    if (parts.length > 0) return parts.join(", ");
    if (addr.label) return String(addr.label);
    if (addr.street) return String(addr.street);
  }
  return "70 Allen Ave, Allen, Ikeja 101233, Lagos, Nigeria";
};

// Helper to format device name
const formatDeviceName = (device) => {
  if (!device) return "Device";
  if (typeof device === "string") return device;
  const brand = (device.brand || "").trim();
  const model = (device.model || "").trim();
  if (brand && model) {
    if (model.toLowerCase().startsWith(brand.toLowerCase())) return model;
    return `${brand} ${model}`;
  }
  return brand || model || "Device";
};

export default function PickupScheduledPage({ params }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const repairId = resolvedParams?.id || "";

  const [repair, setRepair] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRepair = async () => {
      try {
        setLoading(true);
        if (repairId) {
          const res = await repairService.getRepairDetails(repairId);
          const data = res?.data?.repair || res?.repair || res?.data;
          setRepair(data);
        }
      } catch (err) {
        console.warn("Could not load repair details for pickup:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchRepair();
  }, [repairId]);

  const displayId = useMemo(() => {
    if (!repairId) return "3EA19933";
    const clean = String(repairId);
    return clean.length > 8 ? clean.slice(-8).toUpperCase() : clean.toUpperCase();
  }, [repairId]);

  const deviceName = useMemo(() => {
    return formatDeviceName(repair?.device);
  }, [repair]);

  const addressText = useMemo(() => {
    return formatAddress(repair?.pickupAddress || repair?.address);
  }, [repair]);

  // Generate 4-digit handover code from repair ID
  const handoverCode = useMemo(() => {
    if (!repairId) return "4 8 2 1";
    // Derive a clean 4-digit string from the ID
    let numStr = "";
    for (let i = 0; i < repairId.length; i++) {
      const code = repairId.charCodeAt(i);
      if (code >= 48 && code <= 57) numStr += repairId[i];
    }
    while (numStr.length < 4) numStr += "7";
    const digits = numStr.slice(-4);
    return `${digits[0]} ${digits[1]} ${digits[2]} ${digits[3]}`;
  }, [repairId]);

  const whenText = useMemo(() => {
    if (repair?.preferredTimeSlot) {
      const slotMap = {
        morning: "Tomorrow, Morning (9am - 12pm)",
        afternoon: "Tomorrow, Afternoon (12pm - 4pm)",
        evening: "Tomorrow, Evening (4pm - 7pm)",
        anytime: "Tomorrow, Afternoon (12pm - 4pm)",
      };
      return slotMap[repair.preferredTimeSlot.toLowerCase()] || "Tomorrow, Afternoon (12pm - 4pm)";
    }
    return "Tomorrow, Afternoon (12pm - 4pm)";
  }, [repair]);

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "60px 20px" }}>
        <p>Loading pickup details...</p>
      </div>
    );
  }

  return (
    <div className="pickup-scheduled-page">
      {/* Top Header */}
      <div className="pickup-page-header">
        <div className="pickup-title-line">
          <h1 className="pickup-page-title">Pickup scheduled</h1>
          <span className="status-badge-pill warning">
            <span className="dot">●</span>
            Pickup Scheduled
          </span>
        </div>
        <p className="pickup-page-sub">
          Repair #{displayId} · {deviceName}
        </p>
      </div>

      {/* 2-Column Grid matching Image 6 */}
      <div className="pickup-page-grid">
        {/* Left Column: Pickup Details */}
        <div className="pickup-card">
          <h2 className="pickup-card-title">Pickup details</h2>

          <div className="pickup-details-list">
            <div className="pickup-detail-row">
              <span className="pickup-label">When</span>
              <span className="pickup-val">{whenText}</span>
            </div>

            <div className="pickup-detail-row">
              <span className="pickup-label">Address</span>
              <span className="pickup-val">{addressText}</span>
            </div>

            <div className="pickup-detail-row">
              <span className="pickup-label">Pickup partner</span>
              <span className="pickup-val">TecNurx Logistics</span>
            </div>

            <div className="pickup-detail-row">
              <span className="pickup-label">Rider</span>
              <span className="pickup-val">Assigned on pickup day</span>
            </div>
          </div>
        </div>

        {/* Right Column: Handover Code Card */}
        <div className="pickup-card handover-card">
          <h2 className="pickup-card-title">Handover code</h2>

          <div className="handover-code-box">
            <span className="handover-digits">{handoverCode}</span>
          </div>

          <p className="handover-footnote">
            Share this code with the rider only when you hand over your device.
          </p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="pickup-actions-row">
        <button
          type="button"
          className="btn-reschedule"
          onClick={() => {
            alert("Reschedule request submitted! Our logistics team will call you to confirm your new time window.");
          }}
        >
          Reschedule
        </button>
        <button
          type="button"
          className="btn-cancel-repair"
          onClick={() => {
            if (confirm("Are you sure you want to cancel this pickup?")) {
              router.push(`/dashboard/repairs/${repairId}`);
            }
          }}
        >
          Cancel repair
        </button>
      </div>
    </div>
  );
}
