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
} from "lucide-react";
import "./adsidebar.css";
import { SidebarContext } from "../../../../../context/SidebarContext";
import { adminAuthService } from "../../../../../services/admin/adminlogin";
import { hasAdminAccess } from "../../../../../config/adminPermissions";

const sidebarNavItems = [
  {
    href: "/admin-dashboard",
    label: "Dashboard",
    icon: <LayoutGridIcon size={14} />,
    exact: true,
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
];

const AdSidebar = () => {
  const { isSidebarOpen, closeSidebar } = useContext(SidebarContext);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (typeof window !== "undefined") {
      const userJson = localStorage.getItem("user");
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
                  onClick={closeSidebar}
                >
                  {item.icon} {item.label}
                </Link>
              );
            })}
          </div>

          <div className="ad-divider">
            <button type="button" onClick={handleLogout} disabled={isLoggingOut}>
              <LogOut size={14} />
              {isLoggingOut ? "Logging out..." : "Logout"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdSidebar;
