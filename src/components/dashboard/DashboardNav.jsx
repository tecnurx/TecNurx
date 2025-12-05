"use client";

import { Bell, Search, CircleUserRound, LogOut } from "lucide-react";
import React, { useState } from "react";
import logo from "@/assets/images/logo.svg";
import "./dashcomp.css";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { authService } from "../../../services/auth";

const DashboardNav = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false); // Optional: loading state

  const router = useRouter();

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
    setIsNotificationsOpen(false);
  };

  const toggleNotifications = () => {
    setIsNotificationsOpen(!isNotificationsOpen);
    setIsDropdownOpen(false);
  };

  // Handle Logout
  const handleLogout = async () => {
    if (isLoggingOut) return;

    setIsLoggingOut(true);

    try {
      await authService.logout(); 
    } catch (error) {
      console.error("Logout failed:", error);
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      localStorage.removeItem("pendingVerificationEmail");
      document.cookie = "token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
      router.push("/login");
    } finally {
      setIsLoggingOut(false);
      setIsDropdownOpen(false);
    }
  };

  const notifications = [
    {
      id: 1,
      message: "Your device has been received by Engineer David.",
      timestamp: "2025-11-14 10:30 AM",
    },
    {
      id: 2,
      message: "Your insurance plan will renew on November 15.",
      timestamp: "2025-11-13 3:15 PM",
    },
    {
      id: 3,
      message: "We’re offering 10% off repairs this month.",
      timestamp: "2025-11-12 9:00 AM",
    },
  ];

  return (
    <div className="dashNav">
      <Link href="/dashboard">
        <Image src={logo} alt="logo" width={150} height={40} />
      </Link>

      <div className="nav-items">
        {/* Search */}
        <div className="nav-search">
          <input type="text" placeholder="Search" />
          <Search className="search-icon" />
        </div>

        {/* Notifications */}
        <div className="notifications">
          <Bell onClick={toggleNotifications} className="notification" />
          {isNotificationsOpen && (
            <div className="notifications-panel">
              <div className="notifications-header">
                <h3>Notifications</h3>
              </div>
              <div className="notifications-list">
                {notifications.length > 0 ? (
                  notifications.map((notification) => (
                    <div key={notification.id} className="notification-item">
                      <p>{notification.message}</p>
                      <span className="timestamp">
                        {notification.timestamp}
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="no-notifications">No new notifications</p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Profile Dropdown */}
        <div className="user-profile">
          <CircleUserRound onClick={toggleDropdown} className="user-icon" />

          {isDropdownOpen && (
            <div className="dropdown-menu">
              <Link href="/dashboard/account" className="dropdown-item">
                My Account
              </Link>
              <Link href="/dashboard/payments" className="dropdown-item">
                Payment Settings
              </Link>
              <Link href="/dashboard/preferences" className="dropdown-item">
                Preferences
              </Link>

              <hr className="dropdown-divider" />

              <button
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="dropdown-item logout-item"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  background: "none",
                  border: "none",
                  width: "100%",
                  textAlign: "left",
                  padding: "12px 16px",
                  cursor: isLoggingOut ? "not-allowed" : "pointer",
                  color: "#e74c3c",
                }}
              >
                <LogOut size={16} />
                {isLoggingOut ? "Logging out..." : "Logout"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardNav;
