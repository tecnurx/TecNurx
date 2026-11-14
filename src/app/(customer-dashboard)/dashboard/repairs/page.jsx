"use client";

import React, { useEffect, useState, useMemo } from "react";
import "./orders.css";
import { Wrench } from "lucide-react";
import { repairService } from "../../../../../services/repairs";
import Link from "next/link";
import { useRouter } from "next/navigation";

const MyOrders = () => {
  const router = useRouter();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("active"); // "active" | "completed" | "all"

  useEffect(() => {
    const fetchUserRepairs = async () => {
      try {
        const res = await repairService.getUserRepairs();
        const repairsList = res?.data?.repairs || res?.repairs || [];
        setOrders(repairsList);
      } catch (err) {
        console.error("Failed to fetch user repairs:", err);
        setOrders([]);
      } finally {
        setLoading(false);
      }
    };
    fetchUserRepairs();
  }, []);

  // Displayed repairs list - pure dynamic from backend
  const displayedOrders = useMemo(() => {
    return orders || [];
  }, [orders]);

  // Categorize active vs completed/cancelled
  const { activeRepairs, completedRepairs } = useMemo(() => {
    const active = [];
    const completed = [];

    displayedOrders.forEach((order) => {
      const status = (order?.status || "").toLowerCase();
      if (
        status === "completed" ||
        status === "delivered" ||
        status.includes("cancel")
      ) {
        completed.push(order);
      } else {
        active.push(order);
      }
    });

    return { activeRepairs: active, completedRepairs: completed };
  }, [displayedOrders]);

  const formatDeviceName = (device) => {
    if (!device) return "Unknown Device";
    if (typeof device === "string") return device;
    const brand = (device.brand || "").trim();
    const model = (device.model || "").trim();
    if (brand && model) {
      if (model.toLowerCase().startsWith(brand.toLowerCase())) {
        return model;
      }
      return `${brand.charAt(0).toUpperCase() + brand.slice(1)} ${model}`;
    }
    return brand || model || "Unknown Device";
  };

  const formatIssue = (issue, category) => {
    if (category) {
      const catMap = {
        water_damage: "Water damage",
        battery_draining: "Battery replacement",
        screen_replacement: "Screen replacement",
        charging_port: "Charging port",
        camera_issue: "Camera issue",
        speaker_mic: "Speaker & mic",
        hardware_fault: "Hardware diagnostics",
      };
      if (catMap[category.toLowerCase()]) {
        return catMap[category.toLowerCase()];
      }
      return category.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
    }

    if (!issue) return "Screen replacement";
    let text =
      typeof issue === "string"
        ? issue
        : issue.title || issue.name || issue.description || "Screen replacement";
    // Strip square-bracketed artifacts from auto-generated backend descriptions
    text = text.replace(/\[.*?\]/g, "").trim();
    text = text.replace(/[.,;:]+$/, "").trim();
    return text || "Screen replacement";
  };

  const formatRepairId = (id) => {
    if (!id) return "TNX-01";
    const cleanId = String(id);
    if (cleanId.length > 8) return cleanId.slice(-8).toUpperCase();
    return cleanId.toUpperCase();
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Nov 4, 2026";
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const getProgressInfo = (order) => {
    const status = (order?.status || "").toLowerCase();

    if (status.includes("cancel")) {
      return {
        currentStep: 0,
        totalSteps: 6,
        stepText: "Repair was cancelled",
        actionText: "View details",
        badgeText: "Cancelled",
        badgeType: "badge-neutral",
      };
    }

    if (status === "completed" || status === "delivered") {
      return {
        currentStep: 6,
        totalSteps: 6,
        stepText: "Step 6 of 6: repair completed and delivered",
        actionText: "View details",
        badgeText: "Delivered",
        badgeType: "badge-success",
      };
    }

    if (
      status === "in_progress" ||
      status === "in_repair" ||
      status === "repairing"
    ) {
      return {
        currentStep: 5,
        totalSteps: 6,
        stepText: "Step 5 of 6: device is being repaired",
        actionText: "Track repair",
        badgeText: "In progress",
        badgeType: "badge-warning",
      };
    }

    if (status === "engineer_assigned") {
      return {
        currentStep: 4,
        totalSteps: 6,
        stepText: "Step 4 of 6: engineer assigned to device",
        actionText: "Track repair",
        badgeText: "Engineer assigned",
        badgeType: "badge-info",
      };
    }

    if (status === "pending_quote") {
      return {
        currentStep: 1,
        totalSteps: 6,
        stepText: "Step 1 of 6: quote requested",
        actionText: "Track repair",
        badgeText: "Quote requested",
        badgeType: "badge-warning",
      };
    }

    const hasQuoteReady =
      status === "quote_ready" ||
      status === "quote_provided" ||
      status === "awaiting_approval";

    if (hasQuoteReady) {
      return {
        currentStep: 2,
        totalSteps: 6,
        stepText: "Step 2 of 6: your quote needs approval",
        actionText: "Review quote",
        badgeText: "Quote ready",
        badgeType: "badge-warning",
      };
    }

    if (status === "scheduled" || status === "approved") {
      return {
        currentStep: 3,
        totalSteps: 6,
        stepText: "Step 3 of 6: repair scheduled",
        actionText: "Track repair",
        badgeText: "Scheduled",
        badgeType: "badge-info",
      };
    }

    if (status === "diagnosing" || status === "inspected") {
      return {
        currentStep: 2,
        totalSteps: 6,
        stepText: "Step 2 of 6: inspection completed",
        actionText: "Track repair",
        badgeText: "Inspected",
        badgeType: "badge-info",
      };
    }

    // Default / Step 1: Quote Requested
    return {
      currentStep: 1,
      totalSteps: 6,
      stepText: "Step 1 of 6: quote requested",
      actionText: "Track repair",
      badgeText: "Quote requested",
      badgeType: "badge-warning",
    };
  };

  if (loading) {
    return (
      <div className="resolve-wrap">
        <p>Loading...</p>
        <div className="respinner"></div>
      </div>
    );
  }

  const hasNoRepairs = displayedOrders.length === 0;

  return (
    <div className="repairs-page-wrapper">
      {/* Page Header */}
      <div className="repairs-header">
        <div className="repairs-header-text">
          <h1 className="repairs-title">Repairs</h1>
          <p className="repairs-subtitle">Track and manage your repairs.</p>
        </div>

        <Link href="/dashboard/repairs/book" className="book-repair-header-btn">
          Book a repair
        </Link>
      </div>

      {/* 2. REPAIRS PAGE EMPTY (Design 2) */}
      {hasNoRepairs ? (
        <div className="empty-repairs-card">
          <div className="empty-icon-box">
            <Wrench size={26} strokeWidth={2.2} className="empty-wrench-icon" />
          </div>
          <h2 className="empty-title">No repairs yet</h2>
          <p className="empty-desc">
            When you book a repair, you can follow every step here,
            <br />
            from pickup to delivery.
          </p>
          <Link href="/dashboard/repairs/book" className="empty-book-btn">
            Book a repair
          </Link>
          <Link href="/dashboard/repairs/book" className="empty-estimate-link">
            Get an estimate first
          </Link>
        </div>
      ) : (
        /* 1. REPAIRS PAGE WITH REPAIRS (Design 1) */
        <>
          {/* Filter Tabs */}
          <div className="repairs-tabs-bar">
            <button
              type="button"
              className={`tab-pill-btn ${activeTab === "active" ? "active" : ""}`}
              onClick={() => setActiveTab("active")}
            >
              Active {activeRepairs.length}
            </button>
            <button
              type="button"
              className={`tab-pill-btn ${
                activeTab === "completed" ? "active" : ""
              }`}
              onClick={() => setActiveTab("completed")}
            >
              Completed {completedRepairs.length}
            </button>
            <button
              type="button"
              className={`tab-pill-btn ${activeTab === "all" ? "active" : ""}`}
              onClick={() => setActiveTab("all")}
            >
              All {displayedOrders.length}
            </button>
          </div>

          {/* Active Repairs Section */}
          {(activeTab === "active" || activeTab === "all") && (
            <>
              {activeRepairs.length === 0 && activeTab === "active" ? (
                <div
                  className="past-repairs-card"
                  style={{ textAlign: "center", padding: "48px 24px" }}
                >
                  <p style={{ color: "#64748b", margin: 0 }}>
                    No active repairs in progress.
                  </p>
                </div>
              ) : (
                activeRepairs.map((activeRepair) => {
                  const progressInfo = getProgressInfo(activeRepair);

                  return (
                    <div
                      key={activeRepair._id}
                      className="active-repair-card"
                      onClick={() =>
                        router.push(`/dashboard/repairs/${activeRepair._id}`)
                      }
                      style={{ cursor: "pointer" }}
                    >
                      <div className="active-card-label">Active</div>

                      <div className="active-card-top">
                        <div>
                          <h2 className="active-device-name">
                            {formatDeviceName(activeRepair.device)}
                          </h2>
                          <p className="active-repair-sub">
                            {formatIssue(activeRepair.issueDescription, activeRepair.issueCategory)} · Repair #{formatRepairId(activeRepair._id)}
                          </p>
                        </div>

                        <div className={`status-pill ${progressInfo.badgeType}`}>
                          <span className="status-dot">●</span>
                          <span>{progressInfo.badgeText}</span>
                        </div>
                      </div>

                      {/* 6-segment Progress Bar */}
                      <div className="progress-segments-row">
                        {[1, 2, 3, 4, 5, 6].map((stepNum) => {
                          let segmentClass = "upcoming";
                          if (stepNum < progressInfo.currentStep) {
                            segmentClass = "completed";
                          } else if (stepNum === progressInfo.currentStep) {
                            segmentClass = "active";
                          }
                          return (
                            <div
                              key={stepNum}
                              className={`progress-segment ${segmentClass}`}
                            />
                          );
                        })}
                      </div>

                      <div className="active-card-bottom">
                        <span className="step-info-label">
                          {progressInfo.stepText}
                        </span>
                        <Link
                          href={
                            progressInfo.actionText === "Review quote"
                              ? `/dashboard/repairs/${activeRepair._id}/quote`
                              : `/dashboard/repairs/${activeRepair._id}`
                          }
                          className="review-quote-action"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {progressInfo.actionText}
                        </Link>
                      </div>
                    </div>
                  );
                })
              )}
            </>
          )}

          {/* Past Repairs Section (Rendered on Active, Completed, and All tabs matching Image 1) */}
          {(activeTab === "completed" || activeTab === "all" || activeTab === "active") && (
            <>
              {completedRepairs.length === 0 && activeTab === "completed" ? (
                <div
                  className="past-repairs-card"
                  style={{ textAlign: "center", padding: "48px 24px" }}
                >
                  <p style={{ color: "#64748b", margin: 0 }}>
                    No completed repairs yet.
                  </p>
                </div>
              ) : (
                completedRepairs.length > 0 && (
                  <div className="past-repairs-card">
                    <h3 className="past-repairs-title">Past repairs</h3>
                    <div className="past-repairs-list">
                      {completedRepairs.map((repair) => {
                        const progress = getProgressInfo(repair);

                        return (
                          <div
                            key={repair._id}
                            className="past-repair-row"
                            onClick={() =>
                              router.push(`/dashboard/repairs/${repair._id}`)
                            }
                            role="button"
                            tabIndex={0}
                          >
                            <div className="past-repair-info">
                              <h4 className="past-repair-device">
                                {formatDeviceName(repair.device)} ·{" "}
                                {formatIssue(repair.issueDescription, repair.issueCategory)}
                              </h4>
                              <p className="past-repair-sub">
                                Repair #{formatRepairId(repair._id)} ·{" "}
                                {formatDate(repair.createdAt)}
                              </p>
                            </div>

                            <div className={`status-pill ${progress.badgeType}`}>
                              <span className="status-dot">●</span>
                              <span>{progress.badgeText}</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )
              )}
            </>
          )}
        </>
      )}
    </div>
  );
};

export default MyOrders;
