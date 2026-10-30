"use client";

import React, { useContext, useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import Image from "next/image";
import logo from "@/assets/images/logo.png";
import {
  ArrowLeftRight,
  Bike,
  Cog,
  File,
  LayoutGridIcon,
  LogOut,
  UserCircle,
  UserCog,
  Users,
  ShieldCheck,
  KeyRound,
  LifeBuoy,
} from "lucide-react";
import "./adsidebar.css";
import { SidebarContext } from "../../../../../context/SidebarContext";
import { adminAuthService } from "../../../../../services/admin/adminlogin";
import { hasAdminAccess } from "../../../../../config/adminPermissions";
import ChangePasswordModal from "../ChangePasswordModal";

const sidebarNavItems = [
  {
    href: "/admin-dashboard",
    label: "Dashboard",
    icon: <LayoutGridIcon size={14} />,
    exact: true,
  },
  {
    href: "/admin-dashboard/staff",
    label: "Staff Members",
    icon: <Users size={14} />,
  },
  {
    href: "/admin-dashboard/roles",
    label: "Roles & Permissions",
    icon: <ShieldCheck size={14} />,
  },
  {
    href: "/admin-dashboard/engineers",
    label: "Engineers",
    icon: <UserCog size={14} />,
  },
  {
    href: "/admin-dashboard/users",
    label: "Users",
    icon: <UserCircle size={14} />,
  },
  {
    href: "/admin-dashboard/orders",
    label: "Repairs (Orders)",
    icon: <File size={14} />,
  },
  {
    href: "/admin-dashboard/logistics",
    label: "Logistics",
    icon: <Bike size={14} />,
  },
  {
    href: "/admin-dashboard/transactions",
    label: "Transactions",
    icon: <ArrowLeftRight size={14} />,
  },
  {
    href: "/admin-dashboard/gadgets",
    label: "Gadgets List",
    icon: <Cog size={14} />,
  },
  {
    href: "/admin-dashboard/support",
    label: "Support Tickets",
    icon: <LifeBuoy size={14} />,
  },
];

const AdSidebar = () => {
  const { isSidebarOpen, closeSidebar } = useContext(SidebarContext);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [unreadSupportCount, setUnreadSupportCount] = useState(0);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const handleUnread = (e) => {
      // If currently on support tickets page, never show an unread badge
      if (pathname === "/admin-dashboard/support") {
        setUnreadSupportCount(0);
        return;
      }
      const delta = e.detail?.delta || 1;
      setUnreadSupportCount((prev) => Math.max(0, prev + delta));
    };
    const handleReset = () => {
      setUnreadSupportCount(0);
    };
    window.addEventListener("admin-support-unread", handleUnread);
    window.addEventListener("admin-support-unread-reset", handleReset);
    return () => {
      window.removeEventListener("admin-support-unread", handleUnread);
      window.removeEventListener("admin-support-unread-reset", handleReset);
    };
  }, [pathname]);

  useEffect(() => {
    if (pathname === "/admin-dashboard/support") {
      setUnreadSupportCount(0);
    }
  }, [pathname]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const userJson = localStorage.getItem("staff") || localStorage.getItem("user");
      if (userJson) {
        try {
          setCurrentUser(JSON.parse(userJson));
        } catch (err) {
          console.error("Failed to parse user from localStorage", err);
        }
      }
    }
  }, []);

  const handleLogout = async () => {
    if (isLoggingOut) return;
    setIsLoggingOut(true);
    try {
      await adminAuthService.logout();
      router.push("/");
    } catch (error) {
      console.error("Logout failed:", error);
      localStorage.clear();
      document.cookie = "staff_jwt=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/";
      document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/";
      router.push("/");
    } finally {
      setIsLoggingOut(false);
    }
  };

  // Filter links based on current admin permissions
  const visibleNavItems = sidebarNavItems.filter((item) =>
    hasAdminAccess(currentUser, item.href)
  );

  return (
    <div>
      {/* Overlay for mobile */}
      {isSidebarOpen && (
        <div
          className="adsidebar-open-overlay active"
          onClick={closeSidebar}
          aria-hidden="true"
        />
      )}

      <div className={`adsidebar ${isSidebarOpen ? "open" : "collapsed"}`}>
        <div className="adsidebar-links">
          <div className="ad-divider">
            {visibleNavItems.map((item) => {
              const isActive = item.exact
                ? pathname === item.href
                : pathname === item.href || pathname?.startsWith(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={isActive ? "active" : ""}
                  onClick={() => {
                    closeSidebar();
                    if (item.href === "/admin-dashboard/support") {
                      setUnreadSupportCount(0);
                    }
                  }}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <span style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    {item.icon} {item.label}
                  </span>
                  {item.href === "/admin-dashboard/support" &&
                    unreadSupportCount > 0 && (
                      <span
                        style={{
                          background: "#ef4444",
                          color: "#ffffff",
                          fontSize: "10px",
                          fontWeight: "800",
                          minWidth: "18px",
                          height: "18px",
                          borderRadius: "9px",
                          display: "inline-flex",
                          alignItems: "center",
                          justifyContent: "center",
                          padding: "0 5px",
                          boxShadow: "0 2px 6px rgba(239, 68, 68, 0.4)",
                          lineHeight: "1",
                        }}
                      >
                        {unreadSupportCount}
                      </span>
                    )}
                </Link>
              );
            })}
          </div>

          <div className="ad-divider">
            <button
              type="button"
              onClick={() => {
                closeSidebar();
                setIsPasswordModalOpen(true);
              }}
              style={{ marginBottom: "8px" }}
            >
              <KeyRound size={14} />
              Change Password
            </button>
            <button type="button" onClick={handleLogout} disabled={isLoggingOut}>
              <LogOut size={14} />
              {isLoggingOut ? "Logging out..." : "Logout"}
            </button>
          </div>
        </div>
      </div>

      <ChangePasswordModal
        isOpen={isPasswordModalOpen}
        onClose={() => setIsPasswordModalOpen(false)}
      />
    </div>
  );
};

export default AdSidebar;
