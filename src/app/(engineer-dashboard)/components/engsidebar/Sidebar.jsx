"use client";
import React, { useContext, useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import logo from "@/assets/images/logo.png";
import {
  LayoutGridIcon,
  LogOut,
  Menu,
  ShoppingCart,
  UserPen,
} from "lucide-react";
import { SidebarContext } from "../../../../../context/SidebarContext";
import "./sidebar.css";
import { useRouter } from "next/navigation";

const Sidebar = () => {
  const { isSidebarOpen, closeSidebar } = useContext(SidebarContext);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  // useEffect(() => {
  //   closeSidebar();
  // }, [pathname, closeSidebar]);

  const handleLogout = async () => {
    if (isLoggingOut) return;
    setIsLoggingOut(true);
    try {
      await engineerAuthService.logout();
      router.push("/");
    } catch (error) {
      console.error("Logout failed:", error);
      localStorage.clear();
      document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/";
      router.push("/");
    } finally {
      setIsLoggingOut(false);
      setIsDropdownOpen(false);
    }
  };

  return (
    <div>
      {/* Overlay for mobile */}
      {isSidebarOpen && (
        <div
          className="engsidebar-open-overlay active"
          onClick={closeSidebar}
          aria-hidden="true"
        />
      )}

      <div className={`engsidebar ${isSidebarOpen ? "open" : "collapsed"}`}>
        <div className="engsidebar-links">
          <div className="eng-divider">
            <Link
              href="/engineer-dashboard"
              className={pathname === "/engineer-dashboard" ? "active" : ""}
              onClick={closeSidebar}
            >
              <LayoutGridIcon size={14} /> Overview
            </Link>
            {/* <Link
              href="/engineer-dashboard/my-orders"
              className={
                pathname === "/engineer-dashboard/my-orders" ? "active" : ""
              }
              onClick={closeSidebar}
            >
              <ShoppingCart size={14} /> My Orders / Tracking
            </Link> */}
          </div>

          <div className="eng-divider">
            <Link
              href="/engineer-dashboard/account-setup"
              className={
                pathname === "/engineer-dashboard/account-setup" ? "active" : ""
              }
              onClick={closeSidebar}
            >
              <UserPen size={14} /> Account Setup
            </Link>
            <button href="/" onClick={handleLogout} disabled={isLoggingOut}>
              <LogOut size={14} />
              {isLoggingOut ? "Logging out..." : "Logout"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
