"use client";

import React, { useContext, useEffect, useState, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Menu,
  X,
  KeyRound,
  LogOut,
  ShieldCheck,
} from "lucide-react";
import { SidebarContext } from "../../../../context/SidebarContext";
import { adminAuthService } from "../../../../services/admin/adminlogin";
import ChangePasswordModal from "./ChangePasswordModal";
import "@/components/dashboard/dashcomp.css";

const AdNav = () => {
  const { isSidebarOpen, toggleSidebar } = useContext(SidebarContext);
  const router = useRouter();
  const pathname = usePathname();

  const [staff, setStaff] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [passwordModalOpen, setPasswordModalOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("staff") || localStorage.getItem("user");
      if (stored) {
        try {
          setStaff(JSON.parse(stored));
        } catch (e) {
          console.error(e);
        }
      }
    }

    adminAuthService
      .getMe()
      .then((res) => {
        const fresh = res?.data?.staff || res?.staff || res?.data;
        if (fresh) {
          setStaff(fresh);
          localStorage.setItem("staff", JSON.stringify(fresh));
          localStorage.setItem("user", JSON.stringify(fresh));
        }
      })
      .catch((err) => {
        console.warn("Could not fetch /staff/me in navbar", err?.message);
      });
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    if (isLoggingOut) return;
    setIsLoggingOut(true);
    try {
      await adminAuthService.logout();
      router.push("/not-even-admin-login");
    } catch {
      router.push("/not-even-admin-login");
    } finally {
      setIsLoggingOut(false);
    }
  };

  const displayName =
    staff?.fname || staff?.lname
      ? `${staff?.fname || ""} ${staff?.lname || ""}`.trim()
      : staff?.name || "Admin";

  const roleName =
    staff?.role?.name || (typeof staff?.role === "string" ? staff.role : "Admin");

  const getInitials = () => {
    if (staff?.fname && staff?.lname) {
      return `${staff.fname[0]}${staff.lname[0]}`.toUpperCase();
    }
    if (displayName) {
      return displayName.slice(0, 2).toUpperCase();
    }
    return "AD";
  };

  const renderBreadcrumb = () => {
    const segments = (pathname || "").replace(/^\/admin-dashboard\/?/, "").split("/").filter(Boolean);
    if (segments.length === 0) {
      return <span className="topbar-title">Overview</span>;
    }

    const labelMap = {
      staff: "Staff Members",
      roles: "Roles & Permissions",
      engineers: "Engineers",
      users: "Users",
      orders: "Repairs (Orders)",
      logistics: "Logistics",
      transactions: "Transactions",
      gadgets: "Gadgets List",
      support: "Support Tickets",
      fees: "Fee Config",
      "service-offering": "Service Offering",
    };

    const rootKey = segments[0];
    const rootLabel = labelMap[rootKey] || rootKey;

    if (segments.length === 1) {
      return <span className="topbar-title">{rootLabel}</span>;
    }

    const subRaw = segments[segments.length - 1];
    const subLabel =
      labelMap[subRaw] ||
      (subRaw.length > 8 ? `#${subRaw.slice(-8).toUpperCase()}` : subRaw);

    return (
      <div className="topbar-breadcrumb">
        <Link href={`/admin-dashboard/${rootKey}`} className="breadcrumb-link breadcrumb-root">
          {rootLabel}
        </Link>
        <span className="breadcrumb-sep breadcrumb-sub">/</span>
        <span className="breadcrumb-current breadcrumb-sub">{subLabel}</span>
      </div>
    );
  };

  return (
    <>
      <div className="topbar-container">
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

        <div className="topbar-right">
          <span className="eng-topbar-role-pill" title={`Signed in as ${roleName}`}>
            <ShieldCheck size={13} />
            <span style={{ textTransform: "capitalize" }}>{roleName}</span>
          </span>

          <div className="topbar-profile" ref={dropdownRef}>
            <button
              type="button"
              className="user-avatar-badge"
              onClick={() => setDropdownOpen((prev) => !prev)}
              aria-label="Admin account menu"
            >
              {getInitials()}
            </button>

            {dropdownOpen && (
              <div className="dropdown-menu">
                <div className="dropdown-user-info">
                  <strong>{displayName}</strong>
                  <span>{staff?.email || roleName}</span>
                </div>
                <hr className="dropdown-divider" />
                <button
                  type="button"
                  className="dropdown-item"
                  onClick={() => {
                    setDropdownOpen(false);
                    setPasswordModalOpen(true);
                  }}
                >
                  <KeyRound size={15} /> Change Password
                </button>
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

      <ChangePasswordModal
        isOpen={passwordModalOpen}
        onClose={() => setPasswordModalOpen(false)}
      />
    </>
  );
};

export default AdNav;
