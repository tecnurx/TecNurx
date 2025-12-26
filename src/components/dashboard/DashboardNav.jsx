"use client";

import { Bell, Search, CircleUserRound, LogOut, Menu, X } from "lucide-react";
import React, { useContext, useState, useRef, useEffect } from "react";
import logo from "@/assets/images/logo.png";
import "./dashcomp.css";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { authService } from "../../../services/auth";
import { SidebarContext } from "../../../context/SidebarContext";

const DashboardNav = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const { isSidebarOpen, toggleSidebar } = useContext(SidebarContext);
  const router = useRouter();

  // Refs for click-outside detection
  const notificationsRef = useRef(null);
  const profileRef = useRef(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        notificationsRef.current &&
        !notificationsRef.current.contains(event.target)
      ) {
        setIsNotificationsOpen(false);
      }

      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleDropdown = () => {
    setIsDropdownOpen((prev) => !prev);
    setIsNotificationsOpen(false); // Close notifications when opening profile
  };

  const toggleNotifications = () => {
    setIsNotificationsOpen((prev) => !prev);
    setIsDropdownOpen(false); // Close profile when opening notifications
  };

  const handleLogout = async () => {
    if (isLoggingOut) return;
    setIsLoggingOut(true);

    try {
      await authService.logout();
      router.push("/login");
    } catch (error) {
      console.error("Logout failed:", error);
      localStorage.clear();
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
      {/* Desktop Logo */}
      <Link href="/dashboard" className="navonelogo">
        <Image src={logo} alt="logo" width={120} />
      </Link>

      {/* Mobile Logo + Menu Toggle */}
      <div className="side-logo-menu" onClick={toggleSidebar}>
        <button className="menu-toggle-btn">
          {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
        <Image src={logo} alt="logo" width={120} />
      </div>

      <div className="nav-items">
        {/* Search */}
        <div className="nav-search">
          <input type="text" placeholder="Search" />
          <Search className="search-icon" />
        </div>

        {/* Notifications – with ref */}
        <div className="notifications" ref={notificationsRef}>
          <Bell onClick={toggleNotifications} className="notification" />
          {isNotificationsOpen && (
            <div className="notifications-panel">
              <div className="notifications-header">
                <h3>Notifications</h3>
              </div>
              <div className="notifications-list">
                {notifications.length > 0 ? (
                  notifications.map((n) => (
                    <div key={n.id} className="notification-item">
                      <p>{n.message}</p>
                      <span className="timestamp">{n.timestamp}</span>
                    </div>
                  ))
                ) : (
                  <p className="no-notifications">No new notifications</p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Profile Dropdown – with ref */}
        <div className="user-profile" ref={profileRef}>
          <CircleUserRound onClick={toggleDropdown} className="user-icon" />

          {isDropdownOpen && (
            <div className="dropdown-menu">
              <Link href="/dashboard/my-account" className="dropdown-item">
                My Account
              </Link>
              <Link href="/dashboard/payments" className="dropdown-item">
                Payment Settings
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
