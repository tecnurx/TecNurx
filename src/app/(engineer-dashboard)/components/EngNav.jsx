"use client";

import React, { useContext, useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Bell,
  Menu,
  X,
  LogOut,
  UserPen,
  Wrench,
  Wallet,
} from "lucide-react";
import { SidebarContext } from "../../../../context/SidebarContext";
import { NotificationService } from "../../../../services/notification";
import { engineerAuthService } from "../../../../services/eng/engineerAuth";
import "@/components/dashboard/dashcomp.css";

const EngNav = () => {
  const { isSidebarOpen, toggleSidebar } = useContext(SidebarContext);
  const [unreadCount, setUnreadCount] = useState(0);
  const [currentUser, setCurrentUser] = useState(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const pathname = usePathname();
  const router = useRouter();
  const profileRef = useRef(null);

  useEffect(() => {
    const syncUser = () => {
      try {
        const userJson = localStorage.getItem("user");
        if (userJson) {
          setCurrentUser(JSON.parse(userJson));
        }
      } catch (err) {
        console.error("Failed to read engineer user:", err);
      }
    };
    syncUser();
    window.addEventListener("user-updated", syncUser);
    return () => window.removeEventListener("user-updated", syncUser);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    let isMounted = true;
    const fetchUnreadCount = async () => {
      try {
        const res = await NotificationService.getUnreadCount();
        const count = res?.unreadCount ?? res?.data?.unreadCount ?? 0;
        if (isMounted) setUnreadCount(count);
      } catch (err) {
        console.error("Failed to load engineer unread notifications:", err);
      }
    };
    fetchUnreadCount();
    return () => {
      isMounted = false;
    };
  }, [pathname]);

  const handleLogout = async () => {
    if (isLoggingOut) return;
    setIsLoggingOut(true);
    try {
      await engineerAuthService.logout();
      router.push("/");
    } catch (error) {
      console.error("Logout failed:", error);
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      localStorage.removeItem("pendingVerificationEmail");
      document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/";
      router.push("/");
    } finally {
      setIsLoggingOut(false);
      setIsDropdownOpen(false);
    }
  };

  const getUserInitials = () => {
    if (currentUser?.fname && currentUser?.lname) {
      return `${currentUser.fname[0]}${currentUser.lname[0]}`.toUpperCase();
    }
    if (currentUser?.fname) {
      return `${currentUser.fname.slice(0, 2)}`.toUpperCase();
    }
    return "EN";
  };

  const renderBreadcrumb = () => {
    if (pathname?.startsWith("/engineer-dashboard/repairs/")) {
      const idSegment = pathname.split("/").pop();
      const shortId =
        idSegment && idSegment.length > 8
          ? idSegment.slice(-8).toUpperCase()
          : idSegment?.toUpperCase();
      return (
        <div className="topbar-breadcrumb">
          <Link href="/engineer-dashboard/repairs" className="breadcrumb-link breadcrumb-root">
            My Repairs
          </Link>
          <span className="breadcrumb-sep breadcrumb-sub">/</span>
          <span className="breadcrumb-current breadcrumb-sub">#{shortId}</span>
        </div>
      );
    }

    if (pathname === "/engineer-dashboard/repairs") {
      return <span className="topbar-title">My Repairs</span>;
    }

    if (pathname?.startsWith("/engineer-dashboard/payments/")) {
      const idSegment = pathname.split("/").pop();
      const shortId =
        idSegment && idSegment.length > 8
          ? idSegment.slice(-8).toUpperCase()
          : idSegment?.toUpperCase();
      return (
        <div className="topbar-breadcrumb">
          <Link href="/engineer-dashboard/payments" className="breadcrumb-link breadcrumb-root">
            My Payments
          </Link>
          <span className="breadcrumb-sep breadcrumb-sub">/</span>
          <span className="breadcrumb-current breadcrumb-sub">#{shortId}</span>
        </div>
      );
    }

    if (pathname === "/engineer-dashboard/payments") {
      return <span className="topbar-title">My Payments</span>;
    }

    if (pathname === "/engineer-dashboard/wallet") {
      return <span className="topbar-title">My Wallet</span>;
    }

    if (pathname === "/engineer-dashboard/notifications") {
      return (
        <div className="topbar-breadcrumb">
          <Link href="/engineer-dashboard" className="breadcrumb-link breadcrumb-root">
            Overview
          </Link>
          <span className="breadcrumb-sep breadcrumb-sub">/</span>
          <span className="breadcrumb-current breadcrumb-sub">Notifications</span>
        </div>
      );
    }

    if (pathname === "/engineer-dashboard/account-setup") {
      return <span className="topbar-title">Account Setup</span>;
    }

    return <span className="topbar-title">Overview</span>;
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

      {/* Right side: Engineer Mode Pill + Notifications Bell + User Avatar */}
      <div className="topbar-right">
        <span
          className="eng-topbar-role-pill"
          title="Signed in as Service Engineer"
        >
          <Wrench size={13} />
          <span>Engineer</span>
        </span>

        <div className="topbar-notifications">
          <Link
            href="/engineer-dashboard/notifications"
            className="topbar-bell-btn"
            aria-label="View notifications"
          >
            <Bell size={18} strokeWidth={2} />
            {unreadCount > 0 && <span className="topbar-bell-dot" />}
          </Link>
        </div>

        <div className="topbar-profile" ref={profileRef}>
          <button
            type="button"
            className="user-avatar-badge"
            onClick={() => setIsDropdownOpen((prev) => !prev)}
            aria-label="Engineer account menu"
            style={
              currentUser?.photo
                ? { padding: 0, overflow: "hidden", width: "38px" }
                : undefined
            }
          >
            {currentUser?.photo ? (
              <img
                src={currentUser.photo}
                alt="Engineer avatar"
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
                <span>{currentUser?.email || "Service Engineer"}</span>
              </div>
              <hr className="dropdown-divider" />
              <Link
                href="/engineer-dashboard/wallet"
                className="dropdown-item"
                onClick={() => setIsDropdownOpen(false)}
              >
                <Wallet size={15} /> My Wallet
              </Link>
              <Link
                href="/engineer-dashboard/account-setup"
                className="dropdown-item"
                onClick={() => setIsDropdownOpen(false)}
              >
                <UserPen size={15} /> Account Setup
              </Link>
              <hr className="dropdown-divider" />
              <button
                type="button"
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

export default EngNav;
