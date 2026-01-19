"use client";
import React, { useEffect, useRef, useState } from "react";
import "./dashboard.css";
import Link from "next/link";
import {
  ChevronDown,
  Wrench,
  CreditCard,
  ShieldCheck,
  CircleCheck,
  Phone,
  MessageCircle,
  ThumbsUp,
  Calendar,
} from "lucide-react";
import { authService } from "../../../../services/auth";
import { repairService } from "../../../../services/repairs";

const Dashboard = () => {
  const [isQuickOptionsOpen, setIsQuickOptionsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const [repairs, setRepairs] = useState([]);
  const [repairCount, setRepairCount] = useState(0);
  const [latestRepair, setLatestRepair] = useState(null);
  const [trackingData, setTrackingData] = useState(null); // From /track endpoint
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Toggle dropdown
  const toggleQuickOptions = () => {
    setIsQuickOptionsOpen((prev) => !prev);
  };

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsQuickOptionsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Fetch dashboard data
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Get current user
        const user = authService.getCurrentUser();
        setCurrentUser(user);
        await authService.UpdateCurrentUser(); // Optional refresh

        // Fetch all repairs
        const res = await repairService.getUserRepairs();
        const repairsData = res.data.repairs || [];

        setRepairs(repairsData);
        setRepairCount(repairsData.length);

        if (repairsData.length > 0) {
          // Sort by newest first
          const sorted = [...repairsData].sort(
            (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
          );
          const newest = sorted[0];
          setLatestRepair(newest);

          // Fetch detailed tracking for the latest repair
          try {
            const trackRes = await repairService.trackRepair(newest._id);
            setTrackingData(trackRes.data);
          } catch (trackErr) {
            console.error("Failed to fetch tracking data:", trackErr);
            // Fallback: use basic info from repairs list
          }
        }
      } catch (err) {
        console.error("Failed to load dashboard data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Format date helper
  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Use tracking timeline if available, otherwise fallback
  const repairStages = trackingData?.timeline || [];

  const currentStatusLabel =
    repairStages.find(
      (s) =>
        s.completed &&
        !repairStages.find(
          (next) =>
            next.completed === false &&
            repairStages.indexOf(next) > repairStages.indexOf(s),
        ),
    )?.label || "Processing";

  // Correct: active stage = first non-completed stage
  const activeStageIndex = repairStages.findIndex((stage) => !stage.completed);

  const stats = [
    {
      id: 1,
      title: "Active Repairs",
      value: repairCount,
      icon: <Wrench size={24} />,
    },
    {
      id: 2,
      title: "Completed Repairs",
      value: "0", // Enhance later with status filter
      icon: <CircleCheck size={24} />,
    },
    {
      id: 3,
      title: "Active Plans",
      value: "0",
      icon: <ShieldCheck size={24} />,
    },
    {
      id: 4,
      title: "Pending Payments",
      value: repairs.filter((r) => r.paymentStatus === "unpaid").length,
      icon: <CreditCard size={24} />,
    },
  ];

  // Recent Activity Feed Data
  const recentActivity = [
    {
      id: 1,
      icon: <Wrench size={18} />,
      title: "Booked repair",
      description: "iPhone 15 Pro screen replacement",
      time: "2 hours ago",
    },
    {
      id: 2,
      icon: <CreditCard size={18} />,
      title: "Updated payment method",
      description: "•••• 4242 (Visa)",
      time: "5 hours ago",
    },
    {
      id: 3,
      icon: <MessageCircle size={18} />,
      title: "Chat",
      description: "Discussed MacBook battery issue",
      time: "Yesterday",
    },
    {
      id: 4,
      icon: <ThumbsUp size={18} />,
      title: "Feedback submitted",
      description: "Rated Samsung Galaxy repair 5 stars",
      time: "2 days ago",
    },
    {
      id: 5,
      icon: <Calendar size={18} />,
      title: "Repair completed",
      description: "Pixel 8 camera module replaced",
      time: "Nov 15, 2025",
    },
  ];
  if (loading) {
    return (
      <div className="resolve-wrap">
        <p>Loading...</p>
        <div className="respinner"></div>
      </div>
    );
  }

  return (
    <div className="dashboard-wrap">
      {/* Header */}
      <div className="head-quick">
        <div className="dashboard-header">
          <h1>Welcome, {currentUser?.fname || "User"}!</h1>
          <p>Here’s a quick summary of your device activity.</p>
        </div>

        <div className="quick-options" ref={dropdownRef}>
          <button onClick={toggleQuickOptions} className="quick-actions-btn">
            Quick actions <ChevronDown size={14} />
          </button>

          {isQuickOptionsOpen && (
            <div className="quick-options-dropdown">
              <Link href="/dashboard/book-repair" className="dropdown-item">
                Book Repair
              </Link>
              <Link href="/dashboard/devices" className="dropdown-item">
                Add New Device
              </Link>
              <Link href="/dashboard/insurance" className="dropdown-item">
                Claim Insurance
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="dashboard-cards">
        {stats.map((item) => (
          <div key={item.id} className="stat-card">
            <div>
              <span>{item.title}</span>
              <h3>{item.value}</h3>
            </div>
            {item.icon}
          </div>
        ))}
      </div>

      {/* Active Repair Tracker */}
      {latestRepair ? (
        <div className="repair-tracker-section">
          <div className="repair-tracker-header">
            <h2 className="repair-tracker-title">Active Repair Tracker</h2>
            <Link href="/dashboard/my-orders" className="view-details-btn">
              View Details →
            </Link>
          </div>

          <div className="repair-progress-container">
            {repairStages.map((stage, index) => {
              const isActive = index === activeStageIndex;
              const isCompleted = stage.completed;

              return (
                <div key={index} className="stage-wrapper">
                  <div
                    className={`stage ${
                      isCompleted ? "completed" : isActive ? "active" : ""
                    }`}
                  >
                    <div className="stage-icon">
                      {isCompleted ? (
                        <svg
                          width="20"
                          height="20"
                          viewBox="0 0 20 20"
                          fill="none"
                        >
                          <circle cx="10" cy="10" r="10" fill="#FFC400" />
                          <path
                            d="M5 10L8.5 13.5L15 6.5"
                            stroke="white"
                            strokeWidth="2.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      ) : isActive ? (
                        <div className="pulse-dot"></div>
                      ) : (
                        <div className="inactive-dot"></div>
                      )}
                    </div>
                    <div className="stage-label">
                      <p className="stage-name">{stage.label || stage.name}</p>
                    </div>
                  </div>

                  {index < repairStages.length - 1 && (
                    <div
                      className={`connector ${isCompleted ? "completed" : ""}`}
                    />
                  )}
                </div>
              );
            })}
          </div>

          <div className="current-status-summary">
            <p>
              <strong>Current Status:</strong> {currentStatusLabel}
            </p>
            <p>
              <strong>Device:</strong> {latestRepair.device.brand}{" "}
              {latestRepair.device.model} (
              {latestRepair.issueCategory.replace(/_/g, " ")})
            </p>
          </div>
        </div>
      ) : (
        <div className="repair-tracker-section repair-tracker-none">
          <h2 className="repair-tracker-title">No Active Repairs</h2>
          <p>You haven't booked any repairs yet. Start by booking one!</p>
          <Link href="/dashboard/book-repair" className="view-details-btn">
            Book a Repair →
          </Link>
        </div>
      )}

      {/* Recent Activity */}
      <div className="activity-section">
        <h2 className="activity-title">Recent Activity</h2>
        {recentActivity.length > 0 ? (
          <div className="activity-list">
            {recentActivity.map((activity) => (
              <div key={activity.id} className="activity-item">
                <div className="activity-icon">{activity.icon}</div>
                <div className="activity-content">
                  <div className="activity-main">
                    <p className="activity-title-text">{activity.title}</p>
                    <span className="activity-time">{activity.time}</span>
                  </div>
                  {activity.description && (
                    <p className="activity-description">
                      {activity.description}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p>No recent activity.</p>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
