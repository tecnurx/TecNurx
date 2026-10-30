"use client";

import React, { useContext, useEffect, useState, useRef } from "react";
import Image from "next/image";
import logo from "@/assets/images/logo.png";
import {
  Menu,
  CircleUserRound,
  X,
  ChevronDown,
  KeyRound,
  LogOut,
  ShieldCheck,
  Mail,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { SidebarContext } from "../../../../context/SidebarContext";
import { adminAuthService } from "../../../../services/admin/adminlogin";
import ChangePasswordModal from "./ChangePasswordModal";

const AdNav = () => {
  const { isSidebarOpen, toggleSidebar } = useContext(SidebarContext);
  const router = useRouter();

  const [staff, setStaff] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [passwordModalOpen, setPasswordModalOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    // Read cached staff info
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

    // Also fetch fresh details from /staff/me
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

  // Close dropdown when clicking outside
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
    staff?.role?.name || (typeof staff?.role === "string" ? staff.role : "staff");

  return (
    <div>
      <header className="engheader">
        {/* Desktop Logo */}
        <Link href="/admin-dashboard" className="engnavonelogo">
          <Image src={logo} alt="logo" width={120} />
        </Link>

        {/* Mobile Menu */}
        <div className="engside-logo-menu">
          <button
            type="button"
            className="menu-toggle-btn"
            onClick={toggleSidebar}
            aria-label="Toggle navigation menu"
          >
            {isSidebarOpen ? (
              <X size={20} color="#111111" strokeWidth={2.2} />
            ) : (
              <Menu size={20} color="#111111" strokeWidth={2.2} />
            )}
          </button>
          <Link href="/admin-dashboard" style={{ display: "flex", alignItems: "center" }}>
            <Image src={logo} alt="TecNurx" width={115} height={28} priority />
          </Link>
        </div>

        {/* Staff Profile Dropdown Trigger */}
        <div style={{ position: "relative" }} ref={dropdownRef}>
          <div
            className="eng-head-icon ad-user-trigger"
            onClick={() => setDropdownOpen(!dropdownOpen)}
            style={{
              cursor: "pointer",
              padding: "6px 10px",
              borderRadius: "8px",
              backgroundColor: dropdownOpen ? "#e5e7eb" : "transparent",
              transition: "background-color 0.2s ease",
              userSelect: "none",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <CircleUserRound size={24} color="#ffc400" style={{ flexShrink: 0 }} />
            <div className="ad-user-details" style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", lineHeight: "1.2", minWidth: 0 }}>
              <span
                style={{
                  fontSize: "14px",
                  fontWeight: "700",
                  color: "#111827",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  maxWidth: "120px",
                }}
              >
                {displayName}
              </span>
              <span
                style={{
                  fontSize: "11px",
                  color: "#6b7280",
                  textTransform: "capitalize",
                  fontWeight: "500",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  maxWidth: "120px",
                }}
              >
                {roleName}
              </span>
            </div>
            <ChevronDown size={14} color="#6b7280" className="ad-user-chevron" style={{ flexShrink: 0 }} />
          </div>

          {/* Profile Dropdown Menu */}
          {dropdownOpen && (
            <div
              style={{
                position: "absolute",
                right: 0,
                top: "100%",
                marginTop: "8px",
                width: "250px",
                maxWidth: "calc(100vw - 24px)",
                backgroundColor: "#ffffff",
                borderRadius: "12px",
                boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.12), 0 8px 10px -6px rgba(0, 0, 0, 0.04)",
                border: "1px solid #e5e7eb",
                overflow: "hidden",
                zIndex: 1100,
                animation: "scaleIn 0.15s ease-out",
              }}
            >
              {/* Profile Card Header */}
              <div style={{ padding: "14px 16px", borderBottom: "1px solid #f3f4f6", backgroundColor: "#fafafa" }}>
                <p style={{ margin: 0, fontSize: "14px", fontWeight: "700", color: "#111827" }}>
                  {displayName}
                </p>
                {staff?.email && (
                  <p style={{ margin: "2px 0 0 0", fontSize: "12px", color: "#6b7280", wordBreak: "break-all" }}>
                    {staff.email}
                  </p>
                )}
                <div style={{ marginTop: "8px" }}>
                  <span
                    style={{
                      display: "inline-block",
                      padding: "2px 8px",
                      borderRadius: "6px",
                      fontSize: "11px",
                      fontWeight: "600",
                      backgroundColor: "#fef3c7",
                      color: "#92400e",
                      textTransform: "capitalize",
                    }}
                  >
                    Role: {roleName}
                  </span>
                </div>
              </div>

              {/* Menu Actions */}
              <div style={{ padding: "6px" }}>
                <button
                  type="button"
                  onClick={() => {
                    setDropdownOpen(false);
                    setPasswordModalOpen(true);
                  }}
                  style={{
                    width: "100%",
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    padding: "10px 12px",
                    borderRadius: "6px",
                    border: "none",
                    backgroundColor: "transparent",
                    color: "#374151",
                    fontSize: "13px",
                    fontWeight: "500",
                    cursor: "pointer",
                    textAlign: "left",
                    transition: "background-color 0.15s ease",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#f3f4f6")}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                >
                  <KeyRound size={15} color="#d97706" /> Change Password
                </button>

                <button
                  type="button"
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                  style={{
                    width: "100%",
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    padding: "10px 12px",
                    borderRadius: "6px",
                    border: "none",
                    backgroundColor: "transparent",
                    color: "#dc2626",
                    fontSize: "13px",
                    fontWeight: "500",
                    cursor: isLoggingOut ? "not-allowed" : "pointer",
                    textAlign: "left",
                    transition: "background-color 0.15s ease",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#fef2f2")}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                >
                  <LogOut size={15} color="#dc2626" />
                  {isLoggingOut ? "Logging out..." : "Logout"}
                </button>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Change Password Modal */}
      <ChangePasswordModal
        isOpen={passwordModalOpen}
        onClose={() => setPasswordModalOpen(false)}
      />
    </div>
  );
};

export default AdNav;
