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
import { NotificationService } from "../../../services/notification";

const DashboardNav = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const { isSidebarOpen, toggleSidebar } = useContext(SidebarContext);
  const router = useRouter();

  const notificationsRef = useRef(null);
  const profileRef = useRef(null);

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

  // Format timestamp nicely
  const formatTimestamp = (isoString) => {
    const date = new Date(isoString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      setError(null);

      const [notifsRes, countRes] = await Promise.all([
        NotificationService.getNotifications(),
        NotificationService.getUnreadCount(),
      ]);

      // API structure: { data: { notifications: [...] }, unreadCount: 0 }
      const notifs = notifsRes?.data?.notifications || [];
      const count = countRes?.unreadCount || countRes?.data?.unreadCount || 0;

      setNotifications(notifs);
      setUnreadCount(count);
    } catch (err) {
      console.error("Failed to load notifications:", err);
      setError("Failed to load notifications");
      setNotifications([]);
      setUnreadCount(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  useEffect(() => {
    if (isNotificationsOpen) {
      fetchNotifications();
    }
  }, [isNotificationsOpen]);

  const toggleDropdown = () => {
    setIsDropdownOpen((prev) => !prev);
    setIsNotificationsOpen(false);
  };

  const toggleNotifications = () => {
    setIsNotificationsOpen((prev) => !prev);
    setIsDropdownOpen(false);
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
      document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/";
      router.push("/login");
    } finally {
      setIsLoggingOut(false);
      setIsDropdownOpen(false);
    }
  };

  // FIXED: Use correct _id and isRead
  const markAsRead = async (notificationId) => {
    if (!notificationId) return; // safety

    try {
      await NotificationService.markOneasRead(notificationId);
      setNotifications((prev) =>
        prev.map((n) => (n._id === notificationId ? { ...n, isRead: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (err) {
      console.error("Failed to mark as read:", err);
    }
  };

  const markAllAsRead = async () => {
    try {
      await NotificationService.markAllasRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error("Failed to mark all as read:", err);
    }
  };

  return (
    <div className="dashNav">
      {/* Desktop Logo */}
      <Link href="/dashboard" className="navonelogo">
        <Image src={logo} alt="logo" width={120} />
      </Link>

      {/* Mobile Menu */}
      <div className="side-logo-menu" onClick={toggleSidebar}>
        <button className="menu-toggle-btn">
          {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
        <Image src={logo} alt="logo" width={120} />
      </div>

      <div className="nav-items">
        <div className="nav-search">
          <input type="text" placeholder="Search" />
          <Search className="search-icon" />
        </div>

        {/* Notifications */}
        <div className="notifications" ref={notificationsRef}>
          <div className="notification-wrapper" onClick={toggleNotifications}>
            <Bell className="notification" />
            {unreadCount > 0 && (
              <span className="notification-badge">{unreadCount}</span>
            )}
          </div>

          {isNotificationsOpen && (
            <div className="notifications-panel">
              <div className="notifications-header">
                <h3>Notifications</h3>
                {unreadCount > 0 && (
                  <button onClick={markAllAsRead} className="mark-all-read">
                    Mark all as read
                  </button>
                )}
              </div>

              <div className="notifications-list">
                {loading ? (
                  <p className="loading">Loading...</p>
                ) : error ? (
                  <p className="error">{error}</p>
                ) : notifications.length === 0 ? (
                  <p className="loading">No notifications</p>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n._id} // ← Fixed: use _id
                      className={`notification-item ${
                        n.isRead ? "" : "unread"
                      }`}
                      onClick={() => !n.isRead && markAsRead(n._id)}
                      style={{ cursor: n.isRead ? "default" : "pointer" }}
                    >
                      <div>
                        <p className="notif-title">{n.title}</p>
                        <p className="notif-message">{n.message}</p>
                      </div>
                      <span className="timestamp">
                        {formatTimestamp(n.createdAt)}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Profile Dropdown */}
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
                className="dropdown-item log-out-item"
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
