"use client";

import { Bell, Menu, X, LogOut, User, CreditCard } from "lucide-react";
import React, { useContext, useState, useRef, useEffect } from "react";
import "./dashcomp.css";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
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
  const [currentUser, setCurrentUser] = useState(null);

  const { isSidebarOpen, toggleSidebar } = useContext(SidebarContext);
  const router = useRouter();
  const pathname = usePathname();

  const notificationsRef = useRef(null);
  const profileRef = useRef(null);

  useEffect(() => {
    const syncUser = () => {
      try {
        const userJson = localStorage.getItem("user");
        if (userJson) {
          setCurrentUser(JSON.parse(userJson));
        }
      } catch (e) {
        console.error(e);
      }
    };
    syncUser();
    window.addEventListener("user-updated", syncUser);
    return () => window.removeEventListener("user-updated", syncUser);
  }, []);

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
    } catch (err) {
      console.error("Logout failed:", err);
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/";
      router.push("/login");
    } finally {
      setIsLoggingOut(false);
      setIsDropdownOpen(false);
    }
  };

  const markAsRead = async (notificationId) => {
    if (!notificationId) return;
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

  // Generate dynamic breadcrumbs matching design
  const renderBreadcrumb = () => {
    // Book repair payment
    if (pathname.startsWith("/dashboard/repairs/book/payment")) {
      return (
        <div className="topbar-breadcrumb">
          <Link href="/dashboard/repairs" className="breadcrumb-link breadcrumb-root">
            Repairs
          </Link>
          <span className="breadcrumb-sep breadcrumb-sub">/</span>
          <Link href="/dashboard/repairs/book" className="breadcrumb-link breadcrumb-sub">
            Book a repair
          </Link>
          <span className="breadcrumb-sep breadcrumb-sub">/</span>
          <span className="breadcrumb-current breadcrumb-sub">Payment</span>
        </div>
      );
    }

    // Book repair confirmed
    if (pathname === "/dashboard/repairs/book/confirmed") {
      return (
        <div className="topbar-breadcrumb">
          <Link href="/dashboard/repairs" className="breadcrumb-link breadcrumb-root">
            Repairs
          </Link>
          <span className="breadcrumb-sep breadcrumb-sub">/</span>
          <span className="breadcrumb-current breadcrumb-sub">
            Booking confirmed
          </span>
        </div>
      );
    }

    // Book repair
    if (pathname === "/dashboard/repairs/book" || pathname === "/dashboard/book-repair") {
      const isConfirmed =
        typeof window !== "undefined" &&
        new URLSearchParams(window.location.search).get("confirmed") === "true";
      return (
        <div className="topbar-breadcrumb">
          <Link href="/dashboard/repairs" className="breadcrumb-link breadcrumb-root">
            Repairs
          </Link>
          <span className="breadcrumb-sep breadcrumb-sub">/</span>
          <span className="breadcrumb-current breadcrumb-sub">
            {isConfirmed ? "Booking confirmed" : "Book a repair"}
          </span>
        </div>
      );
    }

    if (
      pathname.startsWith("/dashboard/repairs/") ||
      pathname.startsWith("/dashboard/my-orders/")
    ) {
      const rest = pathname
        .replace("/dashboard/repairs/", "")
        .replace("/dashboard/my-orders/", "");
      const isQuote = rest.includes("/quote");
      const isPickup = rest.includes("/pickup");
      const isPayment = rest.includes("/payment");
      const isAdditional = rest.includes("/additional-repair");
      const isDelivered = rest.includes("/delivered");
      const isCancel = rest.includes("/cancel");
      const isCancelled = rest.includes("/cancelled");
      const isReschedule = rest.includes("/reschedule");
      const isPickupMissed =
        rest.includes("/pickup-missed") || rest.includes("/missed");
      const isReturn = rest.includes("/return");
      const isReportProblem =
        rest.includes("/report-problem") || rest.includes("/report-a-problem");
      const isReport =
        rest.includes("/report") && !rest.includes("/report-problem") && !rest.includes("/report-a-problem");
      const isPayLater = rest.includes("/pay-later");
      const id = rest.split("/")[0];
      const displayId =
        id.length > 8 ? id.slice(-8).toUpperCase() : id.toUpperCase();

      if (isPayLater) {
        let subTitle = "Start";
        if (rest.includes("/identity")) subTitle = "Identity";
        else if (rest.includes("/review")) subTitle = "Review";
        else if (rest.includes("/result")) subTitle = "Result";
        else if (
          rest.includes("/more-information") ||
          rest.includes("/more-info")
        )
          subTitle = "More information";
        else if (rest.includes("/offer")) subTitle = "Offer";
        else if (rest.includes("/accept")) subTitle = "Accept";
        else if (rest.includes("/confirmed")) subTitle = "Confirmed";

        return (
          <div className="topbar-breadcrumb">
            <Link href="/dashboard/repairs" className="breadcrumb-link breadcrumb-root">
              Repairs
            </Link>
            <span className="breadcrumb-sep breadcrumb-sub">/</span>
            <Link
              href={`/dashboard/repairs/${id}`}
              className="breadcrumb-link breadcrumb-sub"
            >
              Repair #{displayId}
            </Link>
            <span className="breadcrumb-sep breadcrumb-sub">/</span>
            <Link
              href={`/dashboard/repairs/${id}/pay-later`}
              className="breadcrumb-link breadcrumb-sub"
            >
              Pay Later
            </Link>
            <span className="breadcrumb-sep breadcrumb-sub">/</span>
            <span className="breadcrumb-current breadcrumb-sub">{subTitle}</span>
          </div>
        );
      }

      if (isReportProblem) {
        return (
          <div className="topbar-breadcrumb">
            <Link href="/dashboard/repairs" className="breadcrumb-link breadcrumb-root">
              Repairs
            </Link>
            <span className="breadcrumb-sep breadcrumb-sub">/</span>
            <Link
              href={`/dashboard/repairs/${id}`}
              className="breadcrumb-link breadcrumb-sub"
            >
              Repair #{displayId}
            </Link>
            <span className="breadcrumb-sep breadcrumb-sub">/</span>
            <span className="breadcrumb-current breadcrumb-sub">Report a problem</span>
          </div>
        );
      }

      if (isReport) {
        return (
          <div className="topbar-breadcrumb">
            <Link href="/dashboard/repairs" className="breadcrumb-link breadcrumb-root">
              Repairs
            </Link>
            <span className="breadcrumb-sep breadcrumb-sub">/</span>
            <Link
              href={`/dashboard/repairs/${id}`}
              className="breadcrumb-link breadcrumb-sub"
            >
              Repair #{displayId}
            </Link>
            <span className="breadcrumb-sep breadcrumb-sub">/</span>
            <span className="breadcrumb-current breadcrumb-sub">Report</span>
          </div>
        );
      }

      if (isCancelled) {
        return (
          <div className="topbar-breadcrumb">
            <Link href="/dashboard/repairs" className="breadcrumb-link breadcrumb-root">
              Repairs
            </Link>
            <span className="breadcrumb-sep breadcrumb-sub">/</span>
            <Link
              href={`/dashboard/repairs/${id}`}
              className="breadcrumb-link breadcrumb-sub"
            >
              Repair #{displayId}
            </Link>
            <span className="breadcrumb-sep breadcrumb-sub">/</span>
            <span className="breadcrumb-current breadcrumb-sub">Cancelled</span>
          </div>
        );
      }

      if (isCancel) {
        return (
          <div className="topbar-breadcrumb">
            <Link href="/dashboard/repairs" className="breadcrumb-link breadcrumb-root">
              Repairs
            </Link>
            <span className="breadcrumb-sep breadcrumb-sub">/</span>
            <Link
              href={`/dashboard/repairs/${id}`}
              className="breadcrumb-link breadcrumb-sub"
            >
              Repair #{displayId}
            </Link>
            <span className="breadcrumb-sep breadcrumb-sub">/</span>
            <span className="breadcrumb-current breadcrumb-sub">Cancel</span>
          </div>
        );
      }

      if (isReschedule) {
        return (
          <div className="topbar-breadcrumb">
            <Link href="/dashboard/repairs" className="breadcrumb-link breadcrumb-root">
              Repairs
            </Link>
            <span className="breadcrumb-sep breadcrumb-sub">/</span>
            <Link
              href={`/dashboard/repairs/${id}`}
              className="breadcrumb-link breadcrumb-sub"
            >
              Repair #{displayId}
            </Link>
            <span className="breadcrumb-sep breadcrumb-sub">/</span>
            <span className="breadcrumb-current breadcrumb-sub">Reschedule</span>
          </div>
        );
      }

      if (isPickupMissed) {
        return (
          <div className="topbar-breadcrumb">
            <Link href="/dashboard/repairs" className="breadcrumb-link breadcrumb-root">
              Repairs
            </Link>
            <span className="breadcrumb-sep breadcrumb-sub">/</span>
            <Link
              href={`/dashboard/repairs/${id}`}
              className="breadcrumb-link breadcrumb-sub"
            >
              Repair #{displayId}
            </Link>
            <span className="breadcrumb-sep breadcrumb-sub">/</span>
            <span className="breadcrumb-current breadcrumb-sub">Pickup missed</span>
          </div>
        );
      }

      if (isReturn) {
        return (
          <div className="topbar-breadcrumb">
            <Link href="/dashboard/repairs" className="breadcrumb-link breadcrumb-root">
              Repairs
            </Link>
            <span className="breadcrumb-sep breadcrumb-sub">/</span>
            <Link
              href={`/dashboard/repairs/${id}`}
              className="breadcrumb-link breadcrumb-sub"
            >
              Repair #{displayId}
            </Link>
            <span className="breadcrumb-sep breadcrumb-sub">/</span>
            <span className="breadcrumb-current breadcrumb-sub">Return</span>
          </div>
        );
      }

      if (isAdditional) {
        return (
          <div className="topbar-breadcrumb">
            <Link href="/dashboard/repairs" className="breadcrumb-link breadcrumb-root">
              Repairs
            </Link>
            <span className="breadcrumb-sep breadcrumb-sub">/</span>
            <Link
              href={`/dashboard/repairs/${id}`}
              className="breadcrumb-link breadcrumb-sub"
            >
              Repair #{displayId}
            </Link>
            <span className="breadcrumb-sep breadcrumb-sub">/</span>
            <span className="breadcrumb-current breadcrumb-sub">Additional repair</span>
          </div>
        );
      }

      if (isDelivered) {
        return (
          <div className="topbar-breadcrumb">
            <Link href="/dashboard/repairs" className="breadcrumb-link breadcrumb-root">
              Repairs
            </Link>
            <span className="breadcrumb-sep breadcrumb-sub">/</span>
            <Link
              href={`/dashboard/repairs/${id}`}
              className="breadcrumb-link breadcrumb-sub"
            >
              Repair #{displayId}
            </Link>
            <span className="breadcrumb-sep breadcrumb-sub">/</span>
            <span className="breadcrumb-current breadcrumb-sub">Delivered</span>
          </div>
        );
      }

      if (isPayment) {
        return (
          <div className="topbar-breadcrumb">
            <Link href="/dashboard/repairs" className="breadcrumb-link breadcrumb-root">
              Repairs
            </Link>
            <span className="breadcrumb-sep breadcrumb-sub">/</span>
            <Link
              href={`/dashboard/repairs/${id}`}
              className="breadcrumb-link breadcrumb-sub"
            >
              Repair #{displayId}
            </Link>
            <span className="breadcrumb-sep breadcrumb-sub">/</span>
            <span className="breadcrumb-current breadcrumb-sub">Payment</span>
          </div>
        );
      }

      if (isQuote) {
        return (
          <div className="topbar-breadcrumb">
            <Link href="/dashboard/repairs" className="breadcrumb-link breadcrumb-root">
              Repairs
            </Link>
            <span className="breadcrumb-sep breadcrumb-sub">/</span>
            <Link
              href={`/dashboard/repairs/${id}`}
              className="breadcrumb-link breadcrumb-sub"
            >
              Repair #{displayId}
            </Link>
            <span className="breadcrumb-sep breadcrumb-sub">/</span>
            <span className="breadcrumb-current breadcrumb-sub">Quote</span>
          </div>
        );
      }

      if (isPickup) {
        return (
          <div className="topbar-breadcrumb">
            <Link href="/dashboard/repairs" className="breadcrumb-link breadcrumb-root">
              Repairs
            </Link>
            <span className="breadcrumb-sep breadcrumb-sub">/</span>
            <Link
              href={`/dashboard/repairs/${id}`}
              className="breadcrumb-link breadcrumb-sub"
            >
              Repair #{displayId}
            </Link>
            <span className="breadcrumb-sep breadcrumb-sub">/</span>
            <span className="breadcrumb-current breadcrumb-sub">Pickup</span>
          </div>
        );
      }

      return (
        <div className="topbar-breadcrumb">
          <Link href="/dashboard/repairs" className="breadcrumb-link breadcrumb-root">
            Repairs
          </Link>
          <span className="breadcrumb-sep breadcrumb-sub">/</span>
          <span className="breadcrumb-current breadcrumb-sub">Repair #{displayId}</span>
        </div>
      );
    }
    if (pathname === "/dashboard/repairs" || pathname === "/dashboard/my-orders") {
      return <span className="topbar-title">Repairs</span>;
    }
    if (pathname === "/dashboard/devices/add") {
      return (
        <div className="topbar-breadcrumb">
          <Link href="/dashboard/devices" className="breadcrumb-link breadcrumb-root">
            Devices
          </Link>
          <span className="breadcrumb-sep breadcrumb-sub">/</span>
          <span className="breadcrumb-current breadcrumb-sub">Add a device</span>
        </div>
      );
    }
    if (pathname.startsWith("/dashboard/devices/")) {
      const devId = pathname.replace("/dashboard/devices/", "");
      if (devId !== "add") {
        return (
          <div className="topbar-breadcrumb">
            <Link href="/dashboard/devices" className="breadcrumb-link breadcrumb-root">
              Devices
            </Link>
            <span className="breadcrumb-sep breadcrumb-sub">/</span>
            <span className="breadcrumb-current breadcrumb-sub">View device</span>
          </div>
        );
      }
    }
    if (pathname === "/dashboard/devices") {
      return <span className="topbar-title">Devices</span>;
    }
    if (pathname.startsWith("/dashboard/payments/repayment-plan")) {
      return (
        <div className="topbar-breadcrumb">
          <Link href="/dashboard/payments" className="breadcrumb-link breadcrumb-root">
            Payments
          </Link>
          <span className="breadcrumb-sep breadcrumb-sub">/</span>
          <span className="breadcrumb-current breadcrumb-sub">Repayment plan</span>
        </div>
      );
    }
    if (pathname.startsWith("/dashboard/payments/")) {
      return (
        <div className="topbar-breadcrumb">
          <Link href="/dashboard/payments" className="breadcrumb-link breadcrumb-root">
            Payments
          </Link>
          <span className="breadcrumb-sep breadcrumb-sub">/</span>
          <span className="breadcrumb-current breadcrumb-sub">Payment details</span>
        </div>
      );
    }
    if (pathname === "/dashboard/payments") {
      return (
        <div className="topbar-breadcrumb">
          <Link href="/dashboard/my-account" className="breadcrumb-link breadcrumb-root">
            Account
          </Link>
          <span className="breadcrumb-sep breadcrumb-sub">/</span>
          <span className="breadcrumb-current breadcrumb-sub">Payments</span>
        </div>
      );
    }
    if (pathname.startsWith("/dashboard/insurance/buy/payment")) {
      return (
        <div className="topbar-breadcrumb">
          <Link href="/dashboard/insurance" className="breadcrumb-link breadcrumb-root">
            Protection
          </Link>
          <span className="breadcrumb-sep breadcrumb-sub">/</span>
          <Link href="/dashboard/insurance/buy" className="breadcrumb-link breadcrumb-root">
            Buy a plan
          </Link>
          <span className="breadcrumb-sep breadcrumb-sub">/</span>
          <span className="breadcrumb-current breadcrumb-sub">Payment</span>
        </div>
      );
    }
    if (pathname.startsWith("/dashboard/insurance/buy/confirmed")) {
      return (
        <div className="topbar-breadcrumb">
          <Link href="/dashboard/insurance" className="breadcrumb-link breadcrumb-root">
            Protection
          </Link>
          <span className="breadcrumb-sep breadcrumb-sub">/</span>
          <span className="breadcrumb-current breadcrumb-sub">Policy confirmed</span>
        </div>
      );
    }
    if (pathname.startsWith("/dashboard/insurance/buy")) {
      return (
        <div className="topbar-breadcrumb">
          <Link href="/dashboard/insurance" className="breadcrumb-link breadcrumb-root">
            Protection
          </Link>
          <span className="breadcrumb-sep breadcrumb-sub">/</span>
          <span className="breadcrumb-current breadcrumb-sub">Buy a plan</span>
        </div>
      );
    }
    if (pathname.startsWith("/dashboard/insurance/policies/")) {
      return (
        <div className="topbar-breadcrumb">
          <Link href="/dashboard/insurance" className="breadcrumb-link breadcrumb-root">
            Protection
          </Link>
          <span className="breadcrumb-sep breadcrumb-sub">/</span>
          <span className="breadcrumb-current breadcrumb-sub">Policy details</span>
        </div>
      );
    }
    if (pathname.startsWith("/dashboard/insurance/claims/new")) {
      return (
        <div className="topbar-breadcrumb">
          <Link href="/dashboard/insurance" className="breadcrumb-link breadcrumb-root">
            Protection
          </Link>
          <span className="breadcrumb-sep breadcrumb-sub">/</span>
          <span className="breadcrumb-current breadcrumb-sub">Start a claim</span>
        </div>
      );
    }
    if (pathname.startsWith("/dashboard/insurance/claims/submitted")) {
      return (
        <div className="topbar-breadcrumb">
          <Link href="/dashboard/insurance" className="breadcrumb-link breadcrumb-root">
            Protection
          </Link>
          <span className="breadcrumb-sep breadcrumb-sub">/</span>
          <span className="breadcrumb-current breadcrumb-sub">Claim submitted</span>
        </div>
      );
    }
    if (pathname.includes("/claims/")) {
      const rest = pathname.split("/claims/")[1];
      const claimId = rest ? rest.split("/")[0] : "CLM-0192";
      return (
        <div className="topbar-breadcrumb">
          <Link href="/dashboard/insurance" className="breadcrumb-link breadcrumb-root">
            Protection
          </Link>
          <span className="breadcrumb-sep breadcrumb-sub">/</span>
          <span className="breadcrumb-current breadcrumb-sub">Claim #{claimId.toUpperCase()}</span>
        </div>
      );
    }
    if (pathname === "/dashboard/insurance" || pathname === "/dashboard/protection") {
      return <span className="topbar-title">Protection</span>;
    }
    if (pathname === "/dashboard/support") {
      return (
        <div className="topbar-breadcrumb">
          <Link href="/dashboard/my-account" className="breadcrumb-link breadcrumb-root">
            Account
          </Link>
          <span className="breadcrumb-sep breadcrumb-sub">/</span>
          <span className="breadcrumb-current breadcrumb-sub">Support</span>
        </div>
      );
    }
    if (
      pathname === "/dashboard/notifications" ||
      pathname === "/dashboard/my-account/notifications"
    ) {
      return (
        <div className="topbar-breadcrumb">
          <Link href="/dashboard/my-account" className="breadcrumb-link breadcrumb-root">
            Account
          </Link>
          <span className="breadcrumb-sep breadcrumb-sub">/</span>
          <span className="breadcrumb-current breadcrumb-sub">Notifications</span>
        </div>
      );
    }
    if (pathname === "/dashboard/my-account/verification") {
      return (
        <div className="topbar-breadcrumb">
          <Link href="/dashboard/my-account" className="breadcrumb-link breadcrumb-root">
            Account
          </Link>
          <span className="breadcrumb-sep breadcrumb-sub">/</span>
          <span className="breadcrumb-current breadcrumb-sub">Verification</span>
        </div>
      );
    }
    if (pathname === "/dashboard/my-account") {
      return <span className="topbar-title">Account</span>;
    }
    if (pathname === "/dashboard/book-repair") {
      return <span className="topbar-title">Book a Repair</span>;
    }
    if (pathname === "/dashboard") {
      return <span className="topbar-title">Overview</span>;
    }
    return <span className="topbar-title">Repairs</span>;
  };

  const getUserInitials = () => {
    if (currentUser?.fname && currentUser?.lname) {
      return `${currentUser.fname[0]}${currentUser.lname[0]}`.toUpperCase();
    }
    if (currentUser?.fname) {
      return `${currentUser.fname.slice(0, 2)}`.toUpperCase();
    }
    return "TO";
  };

  return (
    <div className="topbar-container">
      {/* Left side: Mobile menu toggle + dynamic breadcrumb */}
      <div className="topbar-left">
        <button
          type="button"
          className="mobile-sidebar-toggle"
          onClick={toggleSidebar}
          aria-label="Toggle navigation menu"
        >
          {isSidebarOpen ? (
            <X size={20} color="#111111" strokeWidth={2.2} />
          ) : (
            <Menu size={20} color="#111111" strokeWidth={2.2} />
          )}
        </button>

        {renderBreadcrumb()}
      </div>

      {/* Right side: Notifications bell + User badge */}
      <div className="topbar-right">
        {/* Notifications Page Link */}
        <div className="topbar-notifications">
          <Link
            href="/dashboard/notifications"
            className="topbar-bell-btn"
            aria-label="View notifications"
          >
            <Bell size={18} strokeWidth={2} />
            {unreadCount > 0 && <span className="topbar-bell-dot"></span>}
          </Link>
        </div>

        {/* User initials badge */}
        <div className="topbar-profile" ref={profileRef}>
          <button
            type="button"
            className="user-avatar-badge"
            onClick={toggleDropdown}
            aria-label="User account menu"
            style={
              currentUser?.photo
                ? { padding: 0, overflow: "hidden", width: "38px" }
                : undefined
            }
          >
            {currentUser?.photo ? (
              <img
                src={currentUser.photo}
                alt="User avatar"
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            ) : (
              getUserInitials()
            )}
          </button>

          {isDropdownOpen && (
            <div className="dropdown-menu">
              <div className="dropdown-user-info">
                <strong>
                  {currentUser?.fname} {currentUser?.lname}
                </strong>
                <span>{currentUser?.email}</span>
              </div>
              <hr className="dropdown-divider" />
              <Link href="/dashboard/my-account" className="dropdown-item">
                <User size={15} /> My Account
              </Link>
              {/* <Link href="/dashboard/payments" className="dropdown-item">
                <CreditCard size={15} /> Payment Settings
              </Link> */}
              <hr className="dropdown-divider" />
              <button
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="dropdown-item log-out-item"
              >
                <LogOut size={15} />
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
