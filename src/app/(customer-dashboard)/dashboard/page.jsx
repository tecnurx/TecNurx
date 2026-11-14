"use client";

import React, { useEffect, useState, useMemo, Suspense } from "react";
import "./dashboard.css";
import Link from "next/link";
import {
  Wrench,
  Smartphone,
  Shield,
  ArrowRight,
} from "lucide-react";
import { authService } from "../../../../services/auth";
import { repairService } from "../../../../services/repairs";
import { deviceService } from "../../../../services/devices";
import { NotificationService } from "../../../../services/notification";
import { useSearchParams, useRouter } from "next/navigation";

// Helper to format currency
const formatNaira = (amount) => {
  if (amount === undefined || amount === null) return "₦0";
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(amount);
};

// Helper to format device name safely
const formatDeviceName = (device) => {
  if (!device) return "Device";
  if (typeof device === "string") return device;
  const brand = (device.brand || "").trim();
  let model = (device.model || "").trim();

  // Normalize model casings like "iphone 12" -> "iPhone 12"
  if (model.toLowerCase().startsWith("iphone")) {
    model = model.replace(/iphone/i, "iPhone");
  }

  if (brand && model) {
    if (model.toLowerCase().startsWith(brand.toLowerCase())) {
      return model;
    }
    return `${brand.charAt(0).toUpperCase() + brand.slice(1)} ${model}`;
  }
  return brand || model || "Device";
};

// Helper to format device condition for UI
const formatDeviceCondition = (condition) => {
  if (!condition) return "Registered";
  const c = condition.toLowerCase().trim();
  if (c === "uk_used" || c === "uk used") return "UK used";
  if (c === "bought_new" || c === "new") return "Bought new";
  if (c === "used_in_nigeria" || c === "local") return "Used in Nigeria";
  if (c === "good") return "Good condition";
  return condition.charAt(0).toUpperCase() + condition.slice(1);
};

// Helper to determine status pill class and label for devices
const getDeviceStatusInfo = (status) => {
  const s = (status || "").toLowerCase().trim();
  if (s === "verified") {
    return { label: "Verified", className: "pill-verified" };
  }
  if (s === "pending_repair") {
    return { label: "Pending Repair", className: "pill-pending" };
  }
  if (s === "in_repair" || s === "repairing") {
    return { label: "In Repair", className: "pill-pending" };
  }
  if (s === "repaired") {
    return { label: "Repaired", className: "pill-verified" };
  }
  if (s.includes("review") || s.includes("further")) {
    return { label: "Further Review Required", className: "pill-review" };
  }
  if (s.includes("not_eligible") || s.includes("ineligible") || s.includes("rejected")) {
    return { label: "Not Eligible", className: "pill-review" };
  }
  if (s === "pending_verification") {
    return { label: "Pending Verification", className: "pill-pending" };
  }
  return {
    label: s ? s.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()) : "Registered",
    className: "pill-pending",
  };
};

// Helper to format repair issue safely without backend bracket artifacts
const formatIssue = (issue, category) => {
  if (category) {
    const catMap = {
      water_damage: "Water damage",
      battery_draining: "Battery draining",
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

  if (!issue) return "Diagnostic assessment";
  let text =
    typeof issue === "string"
      ? issue
      : issue.title || issue.name || issue.description || "Diagnostic assessment";
  // Strip any square bracketed metadata like [Category: ...] [Device: ...]
  text = text.replace(/\[.*?\]/g, "").trim();
  text = text.replace(/[.,;:]+$/, "").trim();
  return text || "Diagnostic assessment";
};

// Helper to format relative time for activity log
const formatRelativeTime = (isoString) => {
  if (!isoString) return "Recently";
  try {
    const date = new Date(isoString);
    const now = new Date();
    const diffMs = now - date;
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays <= 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  } catch (e) {
    return "Recently";
  }
};

// Helper to format repair ID
const formatRepairId = (id) => {
  if (!id) return "TNX-01";
  const str = String(id);
  return str.length > 8 ? str.slice(-8).toUpperCase() : str.toUpperCase();
};

// Helper to calculate progress step (1-6) and display metadata dynamically
const getRepairStepInfo = (repair, trackData) => {
  if (!repair) return null;
  const status = (trackData?.currentStatus || repair.status || "").toLowerCase();

  // If quote is provided / ready
  const isQuoteProvided =
    status === "quote_ready" ||
    status === "quote_provided" ||
    status === "awaiting_approval" ||
    status === "quote";

  // Step 6: Delivery / Completed
  if (
    status === "completed" ||
    status === "delivered" ||
    status === "out_for_delivery" ||
    status === "ready_for_delivery" ||
    status === "delivering" ||
    status === "ready_for_pickup"
  ) {
    return {
      currentStep: 6,
      stepLabel: "Completed",
      badgeText: status === "completed" || status === "delivered" ? "Completed" : "Out for delivery",
      badgeClass: "status-badge-pill success",
      footnote: "Next step: your repaired device is on its way to you.",
      actionText: "Track repair",
      actionHref: `/dashboard/repairs/${repair._id || repair.id}`,
      isQuoteAction: false,
    };
  }

  // Step 5: Repair in progress
  if (
    status === "in_progress" ||
    status === "in_repair" ||
    status === "repairing" ||
    status === "repaired"
  ) {
    return {
      currentStep: 5,
      stepLabel: "Repair",
      badgeText: "In repair",
      badgeClass: "status-badge-pill warning",
      footnote: "Next step: our certified engineers are repairing your device.",
      actionText: "Track repair",
      actionHref: `/dashboard/repairs/${repair._id || repair.id}`,
      isQuoteAction: false,
    };
  }

  // Step 4: Engineer Assigned
  if (status === "engineer_assigned") {
    return {
      currentStep: 4,
      stepLabel: "Engineer",
      badgeText: "Engineer assigned",
      badgeClass: "status-badge-pill pending",
      footnote: "Next step: engineer is preparing your repair quote.",
      actionText: "Track repair",
      actionHref: `/dashboard/repairs/${repair._id || repair.id}`,
      isQuoteAction: false,
    };
  }

  // Step 3: Repair Scheduled
  if (status === "scheduled") {
    return {
      currentStep: 3,
      stepLabel: "Scheduled",
      badgeText: "Repair scheduled",
      badgeClass: "status-badge-pill pending",
      footnote: "Next step: repair scheduled.",
      actionText: "Track repair",
      actionHref: `/dashboard/repairs/${repair._id || repair.id}`,
      isQuoteAction: false,
    };
  }

  // Step 2: Quote Provided / Quote Ready
  if (isQuoteProvided) {
    return {
      currentStep: 2,
      stepLabel: "Quote",
      badgeText: "Quote ready",
      badgeClass: "status-badge-pill warning",
      footnote: "Next step: your engineer's quote needs your approval.",
      actionText: "Review quote",
      actionHref: `/dashboard/repairs/${repair._id || repair.id}/quote`,
      isQuoteAction: true,
    };
  }

  // Step 1: Quote Requested / Pending Quote
  return {
    currentStep: 1,
    stepLabel: "Requested",
    badgeText: status === "pending_quote" ? "Quote requested" : status ? status.replace(/_/g, " ") : "Quote requested",
    badgeClass: "status-badge-pill warning",
    footnote: "Next step: engineer is assessing your device to prepare the repair quote.",
    actionText: "Track repair",
    actionHref: `/dashboard/repairs/${repair._id || repair.id}`,
    isQuoteAction: false,
  };
};

// Main Dashboard Component
const DashboardContent = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [currentUser, setCurrentUser] = useState(null);
  const [repairs, setRepairs] = useState([]);
  const [devices, setDevices] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [activeTrackData, setActiveTrackData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Handle Google OAuth token if present in URL
  useEffect(() => {
    const googleToken = searchParams.get("token");
    if (googleToken) {
      try {
        localStorage.setItem("token", googleToken);
        document.cookie = `token=${googleToken}; path=/; max-age=604800; SameSite=Lax; ${
          process.env.NODE_ENV === "production" ? "Secure;" : ""
        }`;
        authService.updateCurrentUser().catch(() => {});
        router.replace("/dashboard", { scroll: false });
      } catch (e) {
        console.warn("Failed to process google token:", e);
      }
    }
  }, [searchParams, router]);

  // Fetch dashboard data immediately on mount
  useEffect(() => {
    // Check cached user in localStorage for instant rendering
    try {
      const stored = localStorage.getItem("user");
      if (stored) {
        setCurrentUser(JSON.parse(stored));
      }
    } catch (e) {}

    const fetchData = async () => {
      try {
        const [userRes, repairsRes, devicesRes, notifRes] = await Promise.allSettled([
          authService.getCurrentUser(),
          repairService.getUserRepairs(),
          deviceService.getAllUserDevices(),
          NotificationService.getNotifications(),
        ]);

        if (userRes.status === "fulfilled" && userRes.value) {
          setCurrentUser(userRes.value);
        }
        if (repairsRes.status === "fulfilled") {
          const list =
            repairsRes.value?.data?.repairs ||
            repairsRes.value?.repairs ||
            repairsRes.value?.data ||
            [];
          setRepairs(list);

          // If there's an active repair, fetch its track data
          const active = list.find((r) => {
            const st = (r.status || "").toLowerCase();
            return st !== "completed" && st !== "delivered" && !st.includes("cancel");
          });
          if (active?._id) {
            repairService
              .trackRepair(active._id)
              .then((trackRes) => {
                const trackData = trackRes?.data || trackRes;
                if (trackData) {
                  setActiveTrackData(trackData);
                }
              })
              .catch((err) => {
                console.warn("Could not fetch track data for active repair:", err);
              });
          }
        }
        if (devicesRes.status === "fulfilled") {
          const list =
            devicesRes.value?.data?.devices ||
            devicesRes.value?.devices ||
            devicesRes.value?.data ||
            [];
          setDevices(list);
        }
        if (notifRes.status === "fulfilled") {
          const list =
            notifRes.value?.data?.notifications ||
            notifRes.value?.notifications ||
            [];
          setNotifications(list);
        }
      } catch (err) {
        console.warn("Failed to load dashboard data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const firstName = useMemo(() => {
    if (currentUser?.fname) return currentUser.fname;
    if (currentUser?.firstName) return currentUser.firstName;
    if (currentUser?.name) return currentUser.name.split(" ")[0];
    return "Tobi";
  }, [currentUser]);

  // Dynamic time-based greeting
  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    let text = "Good afternoon";
    if (hour < 12) text = "Good morning";
    else if (hour < 18) text = "Good afternoon";
    else text = "Good evening";

    return `${text}, ${firstName}`;
  }, [firstName]);

  // View state determination:
  // - Supports ?view=new_user or ?view=active to force preview
  // - If no query param, automatically renders new user UI when repairs and devices are both empty (0)
  const isNewUser = useMemo(() => {
    const viewParam = searchParams.get("view") || searchParams.get("state");
    if (viewParam === "new_user" || viewParam === "new-user" || viewParam === "empty") return true;
    if (viewParam === "normal" || viewParam === "active") return false;
    return repairs.length === 0 && devices.length === 0;
  }, [repairs, devices, searchParams]);

  // Pure Dynamic active repair directly from user backend records
  const activeRepair = useMemo(() => {
    if (repairs && repairs.length > 0) {
      const real = repairs.find((r) => {
        const st = (r.status || "").toLowerCase();
        return (
          st !== "completed" &&
          st !== "delivered" &&
          !st.includes("cancel")
        );
      });
      if (real) return real;
    }
    return null;
  }, [repairs]);

  // Step info for active repair
  const activeStepInfo = useMemo(() => {
    return getRepairStepInfo(activeRepair, activeTrackData);
  }, [activeRepair, activeTrackData]);

  // Dynamic timeline steps directly from backend trackRepair API
  const timelineSteps = useMemo(() => {
    if (
      activeTrackData?.timeline &&
      Array.isArray(activeTrackData.timeline) &&
      activeTrackData.timeline.length > 0
    ) {
      return activeTrackData.timeline;
    }
    return [
      { status: "pending_quote", label: "Requested", completed: (activeStepInfo?.currentStep || 1) > 1 },
      { status: "quote_provided", label: "Quote", completed: (activeStepInfo?.currentStep || 1) > 2 },
      { status: "scheduled", label: "Scheduled", completed: (activeStepInfo?.currentStep || 1) > 3 },
      { status: "engineer_assigned", label: "Assigned", completed: (activeStepInfo?.currentStep || 1) > 4 },
      { status: "in_progress", label: "Repair", completed: (activeStepInfo?.currentStep || 1) > 5 },
      { status: "completed", label: "Completed", completed: (activeStepInfo?.currentStep || 1) >= 6 },
    ];
  }, [activeTrackData, activeStepInfo]);

  const activeDeviceName = useMemo(() => {
    if (!activeRepair) return "";
    return formatDeviceName(activeRepair.device);
  }, [activeRepair]);

  const activeIssueName = useMemo(() => {
    if (!activeRepair) return "";
    return formatIssue(
      activeRepair.issueDescription || activeRepair.issue || activeRepair.serviceType,
      activeRepair.issueCategory
    );
  }, [activeRepair]);

  // Display real registered devices from backend
  const displayDevices = useMemo(() => {
    if (devices && devices.length > 0) return devices.slice(0, 3);
    return [];
  }, [devices]);

  // Display activities sourced dynamically from backend notifications with fallback
  const displayActivities = useMemo(() => {
    if (notifications && notifications.length > 0) {
      return notifications.slice(0, 3).map((n) => ({
        id: n._id || n.id,
        title: n.title || "Activity update",
        time: formatRelativeTime(n.createdAt),
      }));
    }
    return [
      { id: "a1", title: "Pickup completed", time: "Today" },
      { id: "a2", title: "Device registered", time: "Yesterday" },
      { id: "a3", title: "Repair request submitted", time: "2 days ago" },
    ];
  }, [notifications]);

  if (loading) {
    return (
      <div className="resolve-wrap">
        <p>Loading overview...</p>
        <div className="respinner"></div>
      </div>
    );
  }

  return (
    <div className="customer-overview-page">
      {/* Overview Top Header */}
      <div className="overview-header">
        <div className="overview-header-left">
          <h1 className="overview-greeting-title">
            {isNewUser ? `Welcome to TecNurx, ${firstName}` : greeting}
          </h1>
          <p className="overview-greeting-subtitle">
            {isNewUser
              ? "Let's get your first device set up."
              : "Here is what is happening with your devices."}
          </p>
        </div>
      </div>

      {/* STATE 1: DASHBOARD FOR NEW USER (Design 1) */}
      {isNewUser ? (
        <>
          {/* Black Hero Banner (Horizontal inline layout matching Image 1) */}
          <div className="overview-hero-banner new-user-hero">
            <div className="new-user-hero-text">
              <h2 className="hero-main-title">Add your first device</h2>
              <p className="hero-sub-desc">
                Register it once and use it for repairs and protection.
              </p>
            </div>

            <Link href="/dashboard/devices/add" className="hero-action-btn">
              Add a device
            </Link>
          </div>

          {/* 3 Equal Cards Grid matching Image 1 */}
          <div className="new-user-cards-grid">
            {/* Card 1: Repairs */}
            <div className="empty-section-card">
              <div>
                <h3 className="empty-section-title">Repairs</h3>
                <p className="empty-section-sub">No repairs yet.</p>
              </div>
              <Link
                href="/dashboard/repairs/book"
                className="btn-section-outline"
              >
                Book a repair
              </Link>
            </div>

            {/* Card 2: Devices */}
            <div className="empty-section-card">
              <div>
                <h3 className="empty-section-title">Devices</h3>
                <p className="empty-section-sub">No devices yet.</p>
              </div>
              <Link
                href="/dashboard/devices/add"
                className="btn-section-outline"
              >
                Add a device
              </Link>
            </div>

            {/* Card 3: Protection */}
            <div className="empty-section-card">
              <div>
                <h3 className="empty-section-title">Protection</h3>
                <p className="empty-section-sub">No protection yet.</p>
              </div>
              <Link
                href="/dashboard/insurance"
                className="btn-section-outline"
              >
                Make a claim
              </Link>
            </div>
          </div>
        </>
      ) : (
        /* STATE 2: DASHBOARD NORMAL / ACTIVE (Design 2) */
        <>
          {/* Black Hero Banner: Stacked vertical layout matching mockup */}
          {activeRepair && activeStepInfo ? (
            <div className="overview-hero-banner">
              <div className="overview-hero-left stacked">
                <span className="hero-pill-badge">
                  <span className="hero-pill-dot">●</span>
                  {activeStepInfo.isQuoteAction ? "Action needed" : activeStepInfo.badgeText}
                </span>
                <div className="hero-text-block">
                  <h2 className="hero-main-title">
                    {activeStepInfo.isQuoteAction
                      ? "Your repair quote is ready"
                      : activeStepInfo.badgeText === "Quote requested"
                      ? "Your repair order has been received"
                      : `${activeDeviceName} repair is in progress`}
                  </h2>
                  <p className="hero-sub-desc">
                    {activeDeviceName} · {activeIssueName} · Repair #{formatRepairId(activeRepair._id || activeRepair.id)}
                  </p>
                </div>
              </div>

              <Link
                href={activeStepInfo.actionHref}
                className="hero-action-btn"
              >
                {activeStepInfo.actionText}
              </Link>
            </div>
          ) : (
            <div className="overview-hero-banner">
              <div className="overview-hero-left stacked">
                <span
                  className="hero-pill-badge"
                  style={{ backgroundColor: "rgba(255,255,255,0.15)", color: "#ffffff" }}
                >
                  <span className="hero-pill-dot" style={{ color: "#22c55e" }}>●</span>
                  All good
                </span>
                <div className="hero-text-block">
                  <h2 className="hero-main-title">No active repairs</h2>
                  <p className="hero-sub-desc">
                    All your registered devices are in good working order.
                  </p>
                </div>
              </div>

              <Link
                href="/dashboard/repairs/book"
                className="hero-action-btn"
              >
                Book a repair
              </Link>
            </div>
          )}

          {/* 2-Column Grid */}
          <div className="overview-active-grid">
            {/* Left Column: Active Repair & My Devices */}
            <div className="overview-col-left">
              {/* Card 1: Active repair (Pure Dynamic Data) */}
              <div className="overview-card">
                <div className="overview-card-head">
                  <h2 className="overview-card-title">Active repair</h2>
                  {activeRepair ? (
                    <Link
                      href={`/dashboard/repairs/${activeRepair._id || activeRepair.id}`}
                      className="overview-head-link"
                    >
                      View details
                    </Link>
                  ) : (
                    <Link
                      href="/dashboard/repairs"
                      className="overview-head-link"
                    >
                      View all repairs
                    </Link>
                  )}
                </div>

                {activeRepair && activeStepInfo ? (
                  <>
                    <div className="active-repair-meta-row">
                      <div>
                        <h3 className="active-repair-device-name">{activeDeviceName}</h3>
                        <p className="active-repair-device-sub">
                          {activeIssueName} · Repair #{formatRepairId(activeRepair._id || activeRepair.id)}
                        </p>
                      </div>

                      <span className={activeStepInfo.badgeClass}>
                        <span className="dot">●</span>
                        {activeStepInfo.badgeText}
                      </span>
                    </div>

                    {/* Dynamic Progress Stepper directly from Backend trackRepair */}
                    <div className="active-repair-stepper">
                      <div className="repair-progress-segments">
                        {timelineSteps.map((step, idx) => {
                          const isCompleted = Boolean(step.completed);
                          const isActive =
                            !isCompleted &&
                            (idx === 0 || timelineSteps[idx - 1]?.completed);

                          return (
                            <div
                              key={step.status || idx}
                              className={`repair-segment-bar ${
                                isCompleted
                                  ? "completed"
                                  : isActive
                                  ? "active"
                                  : "upcoming"
                              }`}
                            />
                          );
                        })}
                      </div>

                      <div className="repair-labels-row">
                        {timelineSteps.map((step, idx) => {
                          const isCompleted = Boolean(step.completed);
                          const isActive =
                            !isCompleted &&
                            (idx === 0 || timelineSteps[idx - 1]?.completed);

                          return (
                            <span
                              key={step.status || idx}
                              className={`repair-step-label-item ${
                                isActive
                                  ? "active"
                                  : isCompleted
                                  ? "completed"
                                  : "upcoming"
                              }`}
                            >
                              {step.label}
                            </span>
                          );
                        })}
                      </div>

                      {/* Mobile Step Status Display */}
                      <div className="repair-mobile-step-summary">
                        <span className="repair-mobile-step-tag">
                          Step {activeStepInfo.currentStep || 1} of {timelineSteps.length}
                        </span>
                        <span className="repair-mobile-step-name">
                          {activeStepInfo.badgeText}
                        </span>
                      </div>
                    </div>

                    <p className="active-repair-footnote">{activeStepInfo.footnote}</p>
                  </>
                ) : (
                  <div style={{ padding: "12px 0 6px 0" }}>
                    <h3
                      className="active-repair-device-name"
                      style={{ fontSize: "16px", color: "#374151", marginBottom: "6px" }}
                    >
                      No active repair in progress
                    </h3>
                    <p className="active-repair-device-sub" style={{ marginBottom: "18px" }}>
                      Need a screen, battery, or component fixed? Book a repair in minutes.
                    </p>
                    <Link
                      href="/dashboard/repairs/book"
                      className="btn-section-outline"
                      style={{ display: "inline-block", maxWidth: "200px" }}
                    >
                      Book a repair
                    </Link>
                  </div>
                )}
              </div>

              {/* Card 2: My devices */}
              <div className="overview-card">
                <div className="overview-card-head">
                  <h2 className="overview-card-title">My devices</h2>
                  <Link
                    href="/dashboard/devices"
                    className="overview-head-link"
                  >
                    Manage
                  </Link>
                </div>

                {displayDevices.length > 0 ? (
                  <div className="overview-devices-list">
                    {displayDevices.map((dev) => {
                      const devName = formatDeviceName(dev);
                      const devCond = formatDeviceCondition(dev.condition);
                      const statusInfo = getDeviceStatusInfo(dev.verificationStatus || dev.status);

                      return (
                        <div key={dev.id || dev._id} className="overview-device-row">
                          <div className="overview-device-left">
                            <div className="overview-device-icon">
                              <Smartphone size={22} />
                            </div>
                            <div className="overview-device-info">
                              <h4 className="overview-device-name">
                                <Link
                                  href={`/dashboard/devices/${dev.id || dev._id}`}
                                  style={{ color: "inherit", textDecoration: "none" }}
                                >
                                  {devName}
                                </Link>
                              </h4>
                              <span className="overview-device-cond">
                                {devCond}
                              </span>
                            </div>
                          </div>

                          <span className={`device-status-pill ${statusInfo.className}`}>
                            <span className="device-status-dot">●</span>
                            {statusInfo.label}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div style={{ padding: "12px 0 6px 0" }}>
                    <p className="active-repair-device-sub" style={{ marginBottom: "18px" }}>
                      You haven't registered any devices yet.
                    </p>
                    <Link
                      href="/dashboard/devices"
                      className="btn-section-outline"
                      style={{ display: "inline-block", maxWidth: "200px" }}
                    >
                      Add a device
                    </Link>
                  </div>
                )}
              </div>
            </div>

            {/* Right Column: Quick Actions & Recent Activity */}
            <div className="overview-col-right">
              {/* Card 1: Quick actions */}
              <div className="overview-card">
                <h2 className="overview-card-title" style={{ marginBottom: "16px" }}>
                  Quick actions
                </h2>

                <div className="quick-actions-list">
                  <Link
                    href="/dashboard/repairs/book"
                    className="quick-action-btn-row"
                  >
                    <div className="quick-action-left-content">
                      <Wrench size={18} />
                      <span>Book a repair</span>
                    </div>
                    <ArrowRight size={16} />
                  </Link>

                  <Link
                    href="/dashboard/devices/add"
                    className="quick-action-btn-row"
                  >
                    <div className="quick-action-left-content">
                      <Smartphone size={18} />
                      <span>Add a device</span>
                    </div>
                    <ArrowRight size={16} />
                  </Link>

                  <Link
                    href="/dashboard/insurance"
                    className="quick-action-btn-row"
                  >
                    <div className="quick-action-left-content">
                      <Shield size={18} />
                      <span>Get protected</span>
                    </div>
                    <ArrowRight size={16} />
                  </Link>
                </div>
              </div>

              {/* Card 2: Recent activity */}
              <div className="overview-card">
                <h2 className="overview-card-title" style={{ marginBottom: "16px" }}>
                  Recent activity
                </h2>

                <div className="recent-activity-list">
                  {displayActivities.map((act) => (
                    <div key={act.id} className="recent-activity-row">
                      <span className="activity-event-name">{act.title}</span>
                      <span className="activity-event-time">{act.time}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default function Dashboard() {
  return (
    <Suspense
      fallback={
        <div className="resolve-wrap">
          <p>Loading dashboard...</p>
          <div className="respinner"></div>
        </div>
      }
    >
      <DashboardContent />
    </Suspense>
  );
}
