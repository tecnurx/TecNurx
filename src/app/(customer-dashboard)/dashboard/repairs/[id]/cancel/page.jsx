"use client";

import React, { use, useState, useEffect, Suspense } from "react";
import "./cancel.css";
import { repairService } from "../../../../../../../services/repairs";
import { useRouter } from "next/navigation";
import Link from "next/link";
import TecNurxLoader from "@/components/TecNurxLoader";

const formatCost = (val) => {
  if (val === undefined || val === null || isNaN(Number(val))) return "0";
  return Number(val).toLocaleString();
};

function CancelRepairContent({ params }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const repairId = resolvedParams?.id || "";

  const [repair, setRepair] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cancelReason, setCancelReason] = useState("I changed my mind");

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
  const issueName = repair?.issue || "Screen replacement";

  const diagnosticFee = repair?.diagnosticFee ?? 0;
  const logisticsFee = repair?.deliveryFee ?? 1500;

  const handleCancelConfirm = () => {
    const isMyOrders =
      typeof window !== "undefined" &&
      window.location.pathname.includes("/my-orders/");
    const targetUrl = isMyOrders
      ? `/dashboard/my-orders/${repairId}/cancelled`
      : `/dashboard/repairs/${repairId}/cancelled`;
    router.push(targetUrl);
  };

  const handleKeepRepair = () => {
    const isMyOrders =
      typeof window !== "undefined" &&
      window.location.pathname.includes("/my-orders/");
    const targetUrl = isMyOrders
      ? `/dashboard/my-orders/${repairId}`
      : `/dashboard/repairs/${repairId}`;
    router.push(targetUrl);
  };

  if (loading) {
    return <TecNurxLoader minHeight="65vh" size="lg" />;
  }

  return (
    <div className="cancel-repair-page-wrap">
      {/* Background Dimmed Simulation of Repair View */}
      <div className="cancel-page-bg-preview" aria-hidden="true">
        <div className="bg-preview-header">
          <div className="bg-header-left">
            <h1 className="bg-device-title">{deviceName}</h1>
            <p className="bg-device-sub">
              {issueName} · Repair #{displayId}
            </p>
          </div>
          <span className="bg-status-badge">
            <span className="bg-badge-dot">●</span>
            Pickup Scheduled
          </span>
        </div>
        <div className="bg-card-skeleton">
          <h2 className="bg-skeleton-title">Progress</h2>
          <div className="bg-skeleton-line" />
          <div className="bg-skeleton-line short" />
          <div className="bg-skeleton-line" />
        </div>
      </div>

      {/* Modal Dialog */}
      <div className="cancel-modal-container">
        <div className="cancel-modal-card">
          <h2 className="cancel-modal-title">Cancel this repair?</h2>
          <p className="cancel-modal-subtitle">
            You can cancel until your device is collected. Here is what happens.
          </p>

          {/* Fee Table */}
          <div className="cancel-fee-table">
            <div className="cancel-fee-row">
              <span className="fee-label">Diagnostic fee</span>
              <span className="fee-value">
                ₦{formatCost(diagnosticFee)} · 100% refundable
              </span>
            </div>
            <div className="cancel-fee-row">
              <span className="fee-label">Logistics fee</span>
              <span className="fee-value">
                ₦{formatCost(logisticsFee)} · Refunded if not yet dispatched
              </span>
            </div>
            <div className="cancel-fee-row">
              <span className="fee-label">Your device</span>
              <span className="fee-value device-status">Not yet collected</span>
            </div>
          </div>

          <h3 className="cancel-reason-title">Why are you cancelling?</h3>

          {/* Reason Radios */}
          <div className="cancel-reasons-list">
            {[
              "I changed my mind",
              "I found another option",
              "The price is too high",
              "Other",
            ].map((reason) => (
              <div
                key={reason}
                className={`cancel-reason-card ${
                  cancelReason === reason ? "selected" : ""
                }`}
                onClick={() => setCancelReason(reason)}
                role="button"
                tabIndex={0}
              >
                <div className="cancel-radio-circle">
                  {cancelReason === reason && (
                    <div className="cancel-radio-dot" />
                  )}
                </div>
                <span className="cancel-reason-text">{reason}</span>
              </div>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="cancel-modal-actions">
            <button
              type="button"
              className="btn-keep-repair"
              onClick={handleKeepRepair}
            >
              Keep repair
            </button>
            <button
              type="button"
              className="btn-confirm-cancel"
              onClick={handleCancelConfirm}
            >
              Cancel repair
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CancelRepairPage({ params }) {
  return (
    <Suspense fallback={<TecNurxLoader minHeight="65vh" size="lg" />}>
      <CancelRepairContent params={params} />
    </Suspense>
  );
}
