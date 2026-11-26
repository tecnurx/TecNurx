"use client";

import React, { useEffect, useState, useMemo } from "react";
import "./orders.css";
import { Wrench } from "lucide-react";
import { repairService } from "../../../../../services/repairs";
import Link from "next/link";
import { useRouter } from "next/navigation";
import TecNurxLoader from "@/components/TecNurxLoader";
import { toast } from "@/components/CustomToast";

const MyOrders = () => {
  const router = useRouter();
  const [orders, setOrders] = useState([]);
  const [drafts, setDrafts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("active"); // "active" | "completed" | "all"
  const [resumingDraftId, setResumingDraftId] = useState(null);
  const [confirmingDiscardId, setConfirmingDiscardId] = useState(null);
  const [discardingDraftId, setDiscardingDraftId] = useState(null);

  useEffect(() => {
    const fetchUserRepairs = async () => {
      try {
        const [repairsRes, draftsRes] = await Promise.allSettled([
          repairService.getUserRepairs(),
          repairService.getDrafts(),
        ]);

        if (repairsRes.status === "fulfilled") {
          const repairsList =
            repairsRes.value?.data?.repairs || repairsRes.value?.repairs || [];
          setOrders(repairsList);
        } else {
          setOrders([]);
        }

        if (draftsRes.status === "fulfilled") {
          const draftsList =
            draftsRes.value?.data?.drafts ||
            draftsRes.value?.drafts ||
            draftsRes.value?.data ||
            [];
          setDrafts(Array.isArray(draftsList) ? draftsList : []);
        }
      } catch (err) {
        console.error("Failed to fetch user repairs:", err);
        setOrders([]);
      } finally {
        setLoading(false);
      }
    };
    fetchUserRepairs();
  }, []);

  const handleResumeDraft = async (draftId) => {
    try {
      setResumingDraftId(draftId);
      const res = await repairService.initiateBookingPayment(draftId);
      const data = res?.data || res;
      if (data?.paymentLink) {
        if (typeof window !== "undefined") {
          sessionStorage.setItem("pending_booking_repair_id", draftId);
          if (data.reference) {
            sessionStorage.setItem("pending_booking_reference", data.reference);
          }
          window.location.href = data.paymentLink;
        }
      } else {
        toast.info("Redirecting to booking...");
        router.push(`/dashboard/repairs/book?repairId=${draftId}`);
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || "Could not resume draft payment.");
    } finally {
      setResumingDraftId(null);
    }
  };

  const handleDiscardDraft = async (draftId) => {
    try {
      setDiscardingDraftId(draftId);
      await repairService.deleteDraft(draftId);
      setDrafts((prev) => prev.filter((d) => (d._id || d.id) !== draftId));
      setConfirmingDiscardId(null);
      toast.success("Draft discarded");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Could not discard draft.");
    } finally {
      setDiscardingDraftId(null);
    }
  };

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
      status === "repairing" ||
      status === "awaiting_parts"
    ) {
      return {
        currentStep: 5,
        totalSteps: 6,
        stepText:
          status === "awaiting_parts"
            ? "Step 5 of 6: awaiting replacement parts"
            : "Step 5 of 6: device is being repaired",
        actionText: "Track repair",
        badgeText: status === "awaiting_parts" ? "Awaiting parts" : "In progress",
        badgeType: "badge-warning",
      };
    }

    if (status === "quote_accepted" || status === "scheduled" || status === "approved") {
      return {
        currentStep: 4,
        totalSteps: 6,
        stepText:
          status === "quote_accepted"
            ? "Step 4 of 6: quote accepted · payment needed"
            : "Step 4 of 6: repair scheduled",
        actionText: status === "quote_accepted" ? "Pay for repair" : "Track repair",
        badgeText: status === "quote_accepted" ? "Quote accepted" : "Scheduled",
        badgeType: "badge-info",
      };
    }

    const hasQuoteReady =
      status === "quote_ready" ||
      status === "quote_provided" ||
      status === "awaiting_approval";

    if (hasQuoteReady) {
      return {
        currentStep: 3,
        totalSteps: 6,
        stepText: "Step 3 of 6: your quote needs approval",
        actionText: "Review quote",
        badgeText: "Quote ready",
        badgeType: "badge-warning",
      };
    }

    if (status === "engineer_assigned") {
      return {
        currentStep: 2,
        totalSteps: 6,
        stepText: "Step 2 of 6: engineer assigned to device",
        actionText: "Track repair",
        badgeText: "Engineer assigned",
        badgeType: "badge-info",
      };
    }

    if (status === "pending_quote" || status === "booked") {
      return {
        currentStep: 1,
        totalSteps: 6,
        stepText:
          status === "booked"
            ? "Step 1 of 6: booking confirmed"
            : "Step 1 of 6: quote requested",
        actionText: "Track repair",
        badgeText: status === "booked" ? "Booked" : "Quote requested",
        badgeType: "badge-warning",
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
    return <TecNurxLoader minHeight="65vh" size="lg" />;
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

      {/* Unpaid Resumable Drafts */}
      {drafts.length > 0 && (
        <div style={{ marginBottom: "24px", display: "flex", flexDirection: "column", gap: "12px" }}>
          {drafts.map((draft) => {
            const dId = draft._id || draft.id;
            const total = draft?.bookingCharge?.total ?? 0;
            return (
              <div
                key={dId}
                className="past-repairs-card"
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: "16px",
                  flexWrap: "wrap",
                  padding: "18px 24px",
                  border: "1.5px solid #ffc400",
                }}
              >
                <div>
                  <div style={{ fontSize: "12px", fontWeight: 700, color: "#92400e", marginBottom: "4px" }}>
                    UNPAID DRAFT · #{formatRepairId(dId)}
                  </div>
                  <div style={{ fontSize: "15.5px", fontWeight: 700, color: "#111827" }}>
                    {formatDeviceName(draft.device)} · {formatIssue(draft.issueDescription, draft.issueCategory)}
                  </div>
                  <div style={{ fontSize: "13px", color: "#64748b", marginTop: "2px" }}>
                    Booking charge: ₦{Number(total).toLocaleString()}
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  {confirmingDiscardId === dId ? (
                    <>
                      <button
                        type="button"
                        disabled={discardingDraftId === dId}
                        onClick={() => setConfirmingDiscardId(null)}
                        style={{
                          background: "#ffffff",
                          border: "1.5px solid #cbd5e1",
                          borderRadius: "9999px",
                          padding: "8px 16px",
                          fontSize: "13px",
                          fontWeight: 600,
                          color: "#475569",
                          cursor: discardingDraftId === dId ? "not-allowed" : "pointer",
                        }}
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        disabled={discardingDraftId === dId}
                        onClick={() => handleDiscardDraft(dId)}
                        style={{
                          background: "#fef2f2",
                          border: "1.5px solid #fecaca",
                          borderRadius: "9999px",
                          padding: "8px 18px",
                          fontSize: "13px",
                          fontWeight: 700,
                          color: "#b91c1c",
                          cursor: discardingDraftId === dId ? "not-allowed" : "pointer",
                        }}
                      >
                        {discardingDraftId === dId ? "Discarding..." : "Confirm discard"}
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        type="button"
                        disabled={resumingDraftId === dId}
                        onClick={() => setConfirmingDiscardId(dId)}
                        style={{
                          background: "#ffffff",
                          border: "1.5px solid #111827",
                          borderRadius: "9999px",
                          padding: "8px 18px",
                          fontSize: "13px",
                          fontWeight: 600,
                          color: "#111827",
                          cursor: resumingDraftId === dId ? "not-allowed" : "pointer",
                        }}
                      >
                        Discard
                      </button>
                      <button
                        type="button"
                        disabled={resumingDraftId === dId}
                        onClick={() => handleResumeDraft(dId)}
                        style={{
                          background: "#ffc400",
                          border: "none",
                          borderRadius: "9999px",
                          padding: "9px 20px",
                          fontSize: "13px",
                          fontWeight: 700,
                          color: "#111827",
                          cursor: resumingDraftId === dId ? "not-allowed" : "pointer",
                        }}
                      >
                        {resumingDraftId === dId ? "Loading..." : "Resume payment"}
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

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
