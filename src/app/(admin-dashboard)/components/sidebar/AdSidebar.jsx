"use client";

import React, { useContext, useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import Image from "next/image";
import sidebarLogo from "@/assets/images/sidebar-logo.png";
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
  Banknote,
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
    icon: <LayoutGridIcon size={16} />,
    exact: true,
  },
  {
    href: "/admin-dashboard/staff",
    label: "Staff Members",
    icon: <Users size={16} />,
  },
  {
    href: "/admin-dashboard/roles",
    label: "Roles & Permissions",
    icon: <ShieldCheck size={16} />,
  },
  {
    href: "/admin-dashboard/engineers",
    label: "Engineers",
    icon: <UserCog size={16} />,
  },
  {
    href: "/admin-dashboard/users",
    label: "Users",
    icon: <UserCircle size={16} />,
  },
  {
    href: "/admin-dashboard/orders",
    label: "Repairs (Orders)",
    icon: <File size={16} />,
  },
  {
    href: "/admin-dashboard/logistics",
    label: "Logistics",
    icon: <Bike size={16} />,
  },
  {
    href: "/admin-dashboard/transactions",
    label: "Transactions",
    icon: <ArrowLeftRight size={16} />,
  },
  {
    href: "/admin-dashboard/gadgets",
    label: "Gadgets List",
    icon: <Cog size={16} />,
  },
  {
    href: "/admin-dashboard/support",
    label: "Support Tickets",
    icon: <LifeBuoy size={16} />,
  },
  {
    href: "/admin-dashboard/fees",
    label: "Fee Config",
    icon: <Banknote size={16} />,
  },
];

const AdSidebar = () => {
  const { isSidebarOpen, closeSidebar } = useContext(SidebarContext);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(() => {
    if (typeof window !== "undefined") {
      const userJson = localStorage.getItem("staff") || localStorage.getItem("user");
      if (userJson) {
        try {
          return JSON.parse(userJson);
        } catch (e) {
          return null;
        }
      }
    }
    return null;
  });
  const [unreadSupportCount, setUnreadSupportCount] = useState(0);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const handleUnread = (e) => {
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
    const syncUser = () => {
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
    };

    syncUser();
    window.addEventListener("storage", syncUser);
    return () => window.removeEventListener("storage", syncUser);
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

  const visibleNavItems = sidebarNavItems.filter((item) => {
    if (
      item.href === "/admin-dashboard" ||
      item.href === "/dashboard" ||
      item.label?.toLowerCase() === "dashboard"
    ) {
      return true;
    }
    return hasAdminAccess(currentUser, item.href);
  });

  return (
    <>
      {isSidebarOpen && (
        <div
          className="adsidebar-open-overlay active"
          onClick={closeSidebar}
          aria-hidden="true"
        />
      )}

      <aside className={`ad-sidebar ${isSidebarOpen ? "open" : "collapsed"}`}>
        {/* Brand Logo + Admin Portal Badge */}
        <div className="ad-sidebar-logo">
          <Link href="/admin-dashboard" onClick={closeSidebar}>
            <Image
              src={sidebarLogo}
              alt="TecNurx"
              width={140}
              height={27}
              priority
              style={{ width: "140px", height: "auto", display: "block" }}
            />
          </Link>
          <span className="ad-portal-badge">
            <ShieldCheck size={12} />
            <span>Admin Portal</span>
          </span>
        </div>

        {/* Navigation Links */}
        <nav className="ad-sidebar-links">
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
              >
                <span style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  {item.icon}
                  <span>{item.label}</span>
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
                      }}
                    >
                      {unreadSupportCount}
                    </span>
                  )}
              </Link>
            );
          })}
        </nav>

        {/* Footer Actions */}
        <div className="ad-sidebar-footer">
          <button
            type="button"
            className="ad-sidebar-footer-btn"
            onClick={() => {
              closeSidebar();
              setIsPasswordModalOpen(true);
            }}
          >
            <KeyRound size={15} />
            <span>Change Password</span>
          </button>

          <button
            type="button"
            className="ad-sidebar-footer-btn logout"
            onClick={handleLogout}
            disabled={isLoggingOut}
          >
            <LogOut size={15} />
            <span>{isLoggingOut ? "Logging out..." : "Logout"}</span>
          </button>
        </div>
      </aside>

      <ChangePasswordModal
        isOpen={isPasswordModalOpen}
        onClose={() => setIsPasswordModalOpen(false)}
      />
    </>
  );
};

export default AdSidebar;
