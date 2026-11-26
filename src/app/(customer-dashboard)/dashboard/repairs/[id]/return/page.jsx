"use client";

import React, { use, useState, useEffect, useMemo, Suspense } from "react";
import "./return.css";
import { Info, Check } from "lucide-react";
import { repairService } from "../../../../../../../services/repairs";
import { useRouter } from "next/navigation";
import Link from "next/link";
import TecNurxLoader from "@/components/TecNurxLoader";

const formatCost = (val) => {
  if (val === undefined || val === null || isNaN(Number(val))) return "0";
  return Number(val).toLocaleString();
};

function ArrangeReturnContent({ params }) {
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
        console.warn("Could not fetch repair details for return:", err);
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

  const addressLine =
    repair?.pickupAddress?.formattedAddress ||
    repair?.pickupAddress?.street ||
    repair?.address ||
    "14 Victoria Island, Lagos";

  const deliveryFee = repair?.returnDeliveryFee ?? repair?.deliveryFee ?? 1500;

  const handleConfirmReturn = async () => {
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setSuccessMsg("Return dispatch booked! You will receive logistics tracking updates.");
      setTimeout(() => {
        router.push(`/dashboard/repairs/${repairId}`);
      }, 1600);
    }, 800);
  };

  const handleBack = () => {
    router.back();
  };

  if (loading) {
    return <TecNurxLoader minHeight="65vh" size="lg" />;
  }

  return (
    <div className="arrange-return-page">
      {/* Top Header */}
      <div className="return-page-header">
        <h1 className="return-page-title">Arrange return of your device</h1>
        <p className="return-page-subtitle">
          Repair #{displayId} · {deviceName}
        </p>
      </div>

      {successMsg && (
        <div className="return-success-banner">
          <Check size={18} />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Main 2-Column Grid */}
      <div className="return-page-grid">
        {/* Left Column: Return method & Slots */}
        <div className="return-left-col">
          <div className="return-card">
            <h2 className="return-card-title">How would you like it back?</h2>

            {/* Return Method Card */}
            <div className="return-method-card selected">
              <div className="return-radio-circle">
                <div className="return-radio-dot" />
              </div>
              <div className="return-method-content">
                <h3 className="return-method-name">Deliver it to me</h3>
                <p className="return-method-sub">
                  To {addressLine}. Delivery fee: ₦{formatCost(deliveryFee)}.
                </p>
              </div>
            </div>

            {/* Delivery Day */}
            <div className="return-section">
              <h3 className="return-section-heading">Delivery day</h3>
              <div className="return-days-row">
                {availableDays.map((d, idx) => (
                  <button
                    key={idx}
                    type="button"
                    className={`return-day-btn ${selectedDayIdx === idx ? "selected" : ""}`}
                    onClick={() => setSelectedDayIdx(idx)}
                  >
                    <span className="return-day-num">{d.dayNum}</span>
                    <span className="return-day-name">{d.dayShort}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Time Window */}
            <div className="return-section">
              <h3 className="return-section-heading">Time window</h3>
              <div className="return-time-chips">
                {timeWindows.map((tw) => (
                  <button
                    key={tw.id}
                    type="button"
                    className={`return-chip-btn ${selectedWindowId === tw.id ? "selected" : ""}`}
                    onClick={() => setSelectedWindowId(tw.id)}
                  >
                    {tw.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="return-actions-row">
              <button
                type="button"
                className="btn-return-back"
                onClick={handleBack}
              >
                Back
              </button>
              <button
                type="button"
                className="btn-confirm-return"
                onClick={handleConfirmReturn}
                disabled={isSubmitting}
              >
                {isSubmitting ? "Confirming..." : "Confirm return"}
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Summary Card */}
        <div className="return-right-col">
          <div className="return-card summary-card">
            <h2 className="summary-title">Summary</h2>

            <div className="summary-table">
              <div className="summary-row">
                <span className="summary-label">Return method</span>
                <span className="summary-value">Delivery</span>
              </div>
              <div className="summary-row">
                <span className="summary-label">Delivery fee</span>
                <span className="summary-value">₦{formatCost(deliveryFee)}</span>
              </div>
            </div>

            <div className="return-info-notice">
              <Info size={16} className="info-icon" />
              <span>
                If a fee applies, you will pay it securely through our payment
                partner.
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ArrangeReturnPage({ params }) {
  return (
    <Suspense fallback={<TecNurxLoader minHeight="65vh" size="lg" />}>
      <ArrangeReturnContent params={params} />
    </Suspense>
  );
}
