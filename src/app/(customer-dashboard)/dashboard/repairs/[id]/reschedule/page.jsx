"use client";

import React, { use, useState, useEffect, useMemo, Suspense } from "react";
import "./reschedule.css";
import { Info, Check } from "lucide-react";
import { repairService } from "../../../../../../../services/repairs";
import { useRouter } from "next/navigation";
import Link from "next/link";
import TecNurxLoader from "@/components/TecNurxLoader";

function ReschedulePickupContent({ params }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const repairId = resolvedParams?.id || "";

  const [repair, setRepair] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState(null);

  // Generate next 5 business days
  const availableDays = useMemo(() => {
    const days = [];
    const today = new Date();
    let current = new Date(today);
    current.setDate(current.getDate() + 1); // Start from tomorrow

    while (days.length < 5) {
      const dayOfWeek = current.getDay();
      if (dayOfWeek !== 0) { // Exclude Sunday
        const dayNum = current.getDate();
        const dayShort = current.toLocaleDateString("en-US", { weekday: "short" });
        const dayFull = current.toLocaleDateString("en-GB", {
          day: "numeric",
          month: "short",
        });
        days.push({
          dateStr: dayFull,
          dayNum,
          dayShort,
          fullLabel: `${dayShort} ${dayFull}`,
        });
      }
      current.setDate(current.getDate() + 1);
    }
    return days;
  }, []);

  const [selectedDayIdx, setSelectedDayIdx] = useState(1);
  const timeWindows = [
    { id: "morning", label: "Morning (9am - 12pm)" },
    { id: "afternoon", label: "Afternoon (12pm - 4pm)" },
    { id: "evening", label: "Evening (4pm - 7pm)" },
  ];
  const [selectedWindowId, setSelectedWindowId] = useState("afternoon");

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
        console.warn("Could not fetch repair details:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchRepair();
  }, [repairId]);

  const displayId =
    repairId.length > 8 ? repairId.slice(-8).toUpperCase() : repairId.toUpperCase();
  const deviceName =
    repair?.device?.name ||
    repair?.deviceName ||
    repair?.deviceModel ||
    "iPhone 13 Pro";

  const currentPickupStr =
    repair?.pickupSchedule?.day ||
    repair?.pickupDay ||
    "Wed 26 Nov, 10:00 - 14:00";

  const selectedDay = availableDays[selectedDayIdx] || availableDays[0];
  const selectedWindow =
    timeWindows.find((w) => w.id === selectedWindowId) || timeWindows[1];

  const addressLine =
    repair?.pickupAddress?.formattedAddress ||
    repair?.pickupAddress?.street ||
    repair?.address ||
    "14 Victoria Island, Lagos";

  const handleConfirmNewTime = async () => {
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setSuccessMsg("Pickup rescheduled successfully!");
      setTimeout(() => {
        router.push(`/dashboard/repairs/${repairId}`);
      }, 1500);
    }, 800);
  };

  const handleBack = () => {
    router.push(`/dashboard/repairs/${repairId}`);
  };

  if (loading) {
    return <TecNurxLoader minHeight="65vh" size="lg" />;
  }

  return (
    <div className="reschedule-page">
      {/* Top Header */}
      <div className="reschedule-page-header">
        <h1 className="reschedule-page-title">Reschedule pickup</h1>
        <p className="reschedule-page-subtitle">
          Repair #{displayId} · {deviceName}
        </p>
      </div>

      {successMsg && (
        <div className="reschedule-success-banner">
          <Check size={18} />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Main 2-Column Grid */}
      <div className="reschedule-page-grid">
        {/* Left Column: Form Card */}
        <div className="reschedule-left-col">
          <div className="reschedule-card">
            {/* Current Pickup Row */}
            <div className="current-pickup-row">
              <div className="current-pickup-info">
                <span className="current-pickup-label">Current pickup</span>
                <span className="current-pickup-value">{currentPickupStr}</span>
              </div>
              <span className="pickup-scheduled-badge">
                <span className="badge-dot">●</span>
                Pickup Scheduled
              </span>
            </div>

            {/* New Pickup Day */}
            <div className="reschedule-section">
              <h3 className="section-heading">New pickup day</h3>
              <div className="days-picker-row">
                {availableDays.map((d, idx) => (
                  <button
                    key={idx}
                    type="button"
                    className={`day-box-btn ${selectedDayIdx === idx ? "selected" : ""}`}
                    onClick={() => setSelectedDayIdx(idx)}
                  >
                    <span className="day-number">{d.dayNum}</span>
                    <span className="day-name">{d.dayShort}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* New Time Window */}
            <div className="reschedule-section">
              <h3 className="section-heading">New time window</h3>
              <div className="time-chips-row">
                {timeWindows.map((tw) => (
                  <button
                    key={tw.id}
                    type="button"
                    className={`time-chip-btn ${selectedWindowId === tw.id ? "selected" : ""}`}
                    onClick={() => setSelectedWindowId(tw.id)}
                  >
                    {tw.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Info notice */}
            <div className="reschedule-info-notice">
              <Info size={16} className="info-icon" />
              <span>You can reschedule up to 2 times for free.</span>
            </div>

            {/* Action Buttons */}
            <div className="reschedule-actions-row">
              <button
                type="button"
                className="btn-reschedule-back"
                onClick={handleBack}
              >
                Back
              </button>
              <button
                type="button"
                className="btn-confirm-new-time"
                onClick={handleConfirmNewTime}
                disabled={isSubmitting}
              >
                {isSubmitting ? "Confirming..." : "Confirm new time"}
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Summary Card */}
        <div className="reschedule-right-col">
          <div className="reschedule-card summary-card">
            <h2 className="summary-title">Summary</h2>

            <div className="summary-table">
              <div className="summary-row">
                <span className="summary-label">New pickup</span>
                <span className="summary-value">
                  {selectedDay.fullLabel}, {selectedWindow.label.split(" ")[0]}
                </span>
              </div>
              <div className="summary-row">
                <span className="summary-label">Address</span>
                <span className="summary-value">{addressLine}</span>
              </div>
              <div className="summary-row">
                <span className="summary-label">Rescheduling fee</span>
                <span className="summary-value">Free</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ReschedulePickupPage({ params }) {
  return (
    <Suspense fallback={<TecNurxLoader minHeight="65vh" size="lg" />}>
      <ReschedulePickupContent params={params} />
    </Suspense>
  );
}
