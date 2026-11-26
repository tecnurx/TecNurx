"use client";

import React, { use, useState, useEffect, Suspense } from "react";
import "./pickup-missed.css";
import { Check } from "lucide-react";
import { repairService } from "../../../../../../../services/repairs";
import { useRouter } from "next/navigation";
import Link from "next/link";
import TecNurxLoader from "@/components/TecNurxLoader";

function PickupMissedContent({ params }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const repairId = resolvedParams?.id || "";

  const [repair, setRepair] = useState(null);
  const [loading, setLoading] = useState(true);
  const [choice, setChoice] = useState("reschedule"); // "reschedule" | "office" | "cancel"
  const [statusMsg, setStatusMsg] = useState(null);

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

  const plannedPickup =
    repair?.pickupSchedule?.day ||
    repair?.pickupDay ||
    "Monday, 10:00 - 13:00";
  const riderName =
    repair?.riderName ||
    repair?.logisticsRider ||
    "Michael A. (GIG Logistics)";
  const riderNote =
    repair?.missedRiderNote ||
    repair?.riderNote ||
    "Rider arrived at the pickup location but was unable to reach the contact phone number after multiple attempts.";

  const handleContinue = () => {
    const isMyOrders =
      typeof window !== "undefined" &&
      window.location.pathname.includes("/my-orders/");
    const base = isMyOrders
      ? `/dashboard/my-orders/${repairId}`
      : `/dashboard/repairs/${repairId}`;

    if (choice === "reschedule") {
      router.push(`${base}/reschedule`);
      return;
    }

    if (choice === "cancel") {
      router.push(`${base}/cancel`);
      return;
    }

    if (choice === "office") {
      setStatusMsg(
        "Drop-off confirmed. Please bring your device to 21 Kodesho Street, Computer Village, Ikeja."
      );
      setTimeout(() => {
        router.push(base);
      }, 2500);
    }
  };

  if (loading) {
    return <TecNurxLoader minHeight="65vh" size="lg" />;
  }

  return (
    <div className="pickup-missed-page">
      {/* Top Header */}
      <div className="pickup-missed-header">
        <div className="missed-header-text">
          <div className="missed-title-row">
            <h1 className="missed-page-title">Pickup missed</h1>
            <span className="missed-badge">
              <span className="missed-badge-dot">●</span>
              Pickup Missed
            </span>
          </div>
          <p className="missed-page-subtitle">
            Repair #{displayId} · {deviceName}
          </p>
        </div>
      </div>

      {statusMsg && (
        <div className="missed-success-banner">
          <Check size={18} />
          <span>{statusMsg}</span>
        </div>
      )}

      {/* Main 2-Column Grid */}
      <div className="pickup-missed-grid">
        {/* Left Column: Collection notice & Options */}
        <div className="pickup-missed-left-col">
          <div className="pickup-missed-card">
            <h2 className="missed-card-title">We could not collect your device</h2>
            <p className="missed-rider-note">{riderNote}</p>

            <div className="missed-details-table">
              <div className="missed-detail-row">
                <span className="detail-label">Planned</span>
                <span className="detail-value">{plannedPickup}</span>
              </div>
              <div className="missed-detail-row">
                <span className="detail-label">Rider</span>
                <span className="detail-value">{riderName}</span>
              </div>
            </div>

            <h3 className="missed-question-title">What would you like to do?</h3>

            {/* Radio Options */}
            <div className="missed-options-list">
              {/* Option 1: Reschedule pickup */}
              <div
                className={`missed-option-card ${
                  choice === "reschedule" ? "selected" : ""
                }`}
                onClick={() => setChoice("reschedule")}
                role="button"
                tabIndex={0}
              >
                <div className="missed-radio-circle">
                  {choice === "reschedule" && (
                    <div className="missed-radio-dot" />
                  )}
                </div>
                <div className="missed-option-content">
                  <h4 className="missed-option-name">Reschedule pickup</h4>
                  <p className="missed-option-sub">
                    Choose a new day and time. A fee may apply: ₦1,500.
                  </p>
                </div>
              </div>

              {/* Option 2: Bring it to our office */}
              <div
                className={`missed-option-card ${
                  choice === "office" ? "selected" : ""
                }`}
                onClick={() => setChoice("office")}
                role="button"
                tabIndex={0}
              >
                <div className="missed-radio-circle">
                  {choice === "office" && (
                    <div className="missed-radio-dot" />
                  )}
                </div>
                <div className="missed-option-content">
                  <h4 className="missed-option-name">Bring it to our office</h4>
                  <p className="missed-option-sub">
                    No logistics fee. Drop-off at 21 Kodesho Street, Computer Village.
                  </p>
                </div>
              </div>

              {/* Option 3: Cancel repair */}
              <div
                className={`missed-option-card ${
                  choice === "cancel" ? "selected" : ""
                }`}
                onClick={() => setChoice("cancel")}
                role="button"
                tabIndex={0}
              >
                <div className="missed-radio-circle">
                  {choice === "cancel" && (
                    <div className="missed-radio-dot" />
                  )}
                </div>
                <div className="missed-option-content">
                  <h4 className="missed-option-name">Cancel repair</h4>
                  <p className="missed-option-sub">Refund rules apply.</p>
                </div>
              </div>
            </div>

            {/* Continue Button */}
            <button
              type="button"
              className="btn-missed-continue"
              onClick={handleContinue}
            >
              Continue
            </button>
          </div>
        </div>

        {/* Right Column: Need help? Card */}
        <div className="pickup-missed-right-col">
          <div className="pickup-missed-card help-card">
            <h2 className="help-card-title">Need help?</h2>
            <p className="help-card-text">
              If you were home and nobody came, tell us.
            </p>
            <Link
              href={`/dashboard/support?issue=missed_pickup&repairId=${repairId}`}
              className="btn-contact-support-white"
            >
              Contact support
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PickupMissedPage({ params }) {
  return (
    <Suspense fallback={<TecNurxLoader minHeight="65vh" size="lg" />}>
      <PickupMissedContent params={params} />
    </Suspense>
  );
}
