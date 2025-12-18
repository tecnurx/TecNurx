"use client";
import React, { useEffect, useRef, useState } from "react";
import "./dashboard.css";
import Link from "next/link";
import {
  ChevronDown,
  Wrench,
  CreditCard,
  MessageCircle,
  ThumbsUp,
  Calendar,
  ShieldCheck,
  CircleCheck,
} from "lucide-react";
import { authService } from "../../../../services/auth";

const Dashboard = () => {
  const stats = [
    { id: 1, title: "Active Repairs", value: "5", icon: <Wrench size={24} /> },
    {
      id: 2,
      title: "Completed Repairs",
      value: "2",
      icon: <CircleCheck size={24} />,
    },
    {
      id: 3,
      title: "Active Plans",
      value: "1",
      icon: <ShieldCheck size={24} />,
    },
    {
      id: 4,
      title: "Pending Payments",
      value: "0",
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

  const [isQuickOptionsOpen, setIsQuickOptionsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Toggle dropdown
  const toggleQuickOptions = () => {
    setIsQuickOptionsOpen((prev) => !prev);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsQuickOptionsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const repairStages = [
    {
      name: "Device Picked Up",
      completed: true,
      active: false,
      timestamp: "Nov 17, 2025 – 10:30 AM",
    },
    {
      name: "Diagnosed",
      completed: true,
      active: false,
      timestamp: "Nov 17, 2025 – 2:15 PM",
    },
    {
      name: "Repair in Progress",
      completed: false,
      active: true,
      timestamp: "Nov 18, 2025 – 9:00 AM",
    },
    { name: "Quality Check", completed: false, active: false },
    { name: "Out for Delivery", completed: false, active: false },
    { name: "Delivered", completed: false, active: false },
  ];

  const [currentUser, setCurrentUser] = useState();

  useEffect(() => {
    const response = authService.getCurrentUser();
    setCurrentUser(response);

    //fetch user from server
    const fetchUser = async () => {
      try {
        const response = authService.UpdateCurrentUser();
        console.log(response);
      } catch (err) {
        console.error("Failed to fetch user from server:", err);
      }
    };
    fetchUser();
  }, []);

  return (
    <div className="dashboard-wrap">
      {/* Header + Quick Actions */}
      <div className="head-quick">
        <div className="dashboard-header">
          <h1>Welcome, {currentUser?.fname || "User"}</h1>
          <p>Here’s a quick summary of your device activity.</p>
        </div>

        {/* Quick Actions with outside click detection */}
        <div className="quick-options" ref={dropdownRef}>
          <button onClick={toggleQuickOptions} className="quick-actions-btn">
            Quick actions <ChevronDown size={14} />
          </button>

          {isQuickOptionsOpen && (
            <div className="quick-options-dropdown">
              <Link href="/book-repair" className="dropdown-item">
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
      <div className="repair-tracker-section">
        <div className="repair-tracker-header">
          <h2 className="repair-tracker-title">Active Repair Tracker</h2>
          <Link href="#" className="view-details-btn">
            View Details →
          </Link>
        </div>

        <div className="repair-progress-container">
          {repairStages.map((stage, index) => (
            <div key={index} className="stage-wrapper">
              <div
                className={`stage ${
                  stage.completed ? "completed" : stage.active ? "active" : ""
                }`}
              >
                <div className="stage-icon">
                  {stage.completed ? (
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                      <circle cx="10" cy="10" r="10" fill="#FFC400" />
                      <path
                        d="M5 10L8.5 13.5L15 6.5"
                        stroke="white"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  ) : stage.active ? (
                    <div className="pulse-dot"></div>
                  ) : (
                    <div className="inactive-dot"></div>
                  )}
                </div>
                <div className="stage-label">
                  <p className="stage-name">{stage.name}</p>
                  {stage.timestamp && (
                    <span className="stage-time">{stage.timestamp}</span>
                  )}
                </div>
              </div>

              {index < repairStages.length - 1 && (
                <div
                  className={`connector ${stage.completed ? "completed" : ""}`}
                />
              )}
            </div>
          ))}
        </div>

        <div className="current-status-summary">
          <p>
            <strong>Current Status:</strong> Repair in Progress • Estimated
            completion: Tomorrow, 3 PM
          </p>
        </div>
      </div>

      {/* Recent Activity Feed */}
      <div className="activity-section">
        <h2 className="activity-title">Recent Activity</h2>
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
                  <p className="activity-description">{activity.description}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
