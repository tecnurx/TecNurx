"use client";

import React, { use, useState, useEffect, Suspense } from "react";
import "./cancelled.css";
import { Check } from "lucide-react";
import { repairService } from "../../../../../../../services/repairs";
import { useRouter } from "next/navigation";
import Link from "next/link";
import TecNurxLoader from "@/components/TecNurxLoader";

const formatCost = (val) => {
  if (val === undefined || val === null || isNaN(Number(val))) return "0";
  return Number(val).toLocaleString();
};

function RepairCancelledContent({ params }) {
  const resolvedParams = use(params);
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
  const userEmail = repair?.user?.email || repair?.customerEmail || "your email";

  const diagnosticFee = repair?.diagnosticFee ?? 0;
  const logisticsFee = repair?.deliveryFee ?? 1500;
  const refundMethod =
    repair?.paymentMethod === "card"
      ? "Original payment method (Card)"
      : "Original payment method";

  // Device collected check
  const isDeviceCollected =
    repair?.status === "in_repair" ||
    repair?.status === "received" ||
    repair?.status === "quote_ready" ||
    repair?.deviceCollected === true;

  if (loading) {
    return <TecNurxLoader minHeight="65vh" size="lg" />;
  }

  return (
    <div className="repair-cancelled-page">
      {/* Top Header */}
      <div className="cancelled-page-header">
        <div className="cancelled-header-text">
          <div className="cancelled-title-row">
            <h1 className="cancelled-page-title">Repair cancelled</h1>
            <span className="cancelled-badge">
              <span className="cancelled-badge-dot">●</span>
              Cancelled
            </span>
          </div>
          <p className="cancelled-page-subtitle">
            Repair #{displayId} · {deviceName}
          </p>
        </div>
      </div>

      {/* Top Banner Card */}
      <div className="cancelled-banner-card">
        <div className="cancelled-badge-icon">
          <Check size={36} strokeWidth={3} className="cancelled-check-icon" />
        </div>
        <h2 className="cancelled-banner-title">Your repair has been cancelled</h2>
        <p className="cancelled-banner-subtitle">
          We have sent a confirmation to {userEmail}.
        </p>
      </div>

      {/* Bottom 2-Column Grid */}
      <div className="cancelled-page-grid">
        {/* Left Column: Refund Card */}
        <div className="cancelled-card refund-card">
          <h3 className="cancelled-card-title">Refund</h3>

          <div className="cancelled-details-table">
            <div className="cancelled-row">
              <span className="cancelled-label">Diagnostic fee</span>
              <span className="cancelled-value">₦{formatCost(diagnosticFee)}</span>
            </div>
            <div className="cancelled-row">
              <span className="cancelled-label">Logistics fee</span>
              <span className="cancelled-value">₦{formatCost(logisticsFee)}</span>
            </div>
            <div className="cancelled-row">
              <span className="cancelled-label">Refunded to</span>
              <span className="cancelled-value">{refundMethod}</span>
            </div>
            <div className="cancelled-row">
              <span className="cancelled-label">Expected by</span>
              <span className="cancelled-value">2–3 business days</span>
            </div>
          </div>
        </div>

        {/* Right Column: Your device Card */}
        <div className="cancelled-card device-card">
          <h3 className="cancelled-card-title">Your device</h3>

          <p className="cancelled-device-text">
            {isDeviceCollected
              ? "We have your device. Choose how to get it back."
              : "Not collected. Nothing more to do."}
          </p>

          <Link
            href={`/dashboard/repairs/${repairId}/return`}
            className="btn-arrange-return"
          >
            Arrange return
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function RepairCancelledPage({ params }) {
  return (
    <Suspense fallback={<TecNurxLoader minHeight="65vh" size="lg" />}>
      <RepairCancelledContent params={params} />
    </Suspense>
  );
}
