"use client";
import React, { useContext, useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import logo from "@/assets/images/logo.png";
import {
  ArrowLeftRight,
  Bike,
  Cog,
  File,
  LayoutGridIcon,
  LogOut,
  Mail,
  Menu,
  ShoppingCart,
  UserCircle,
  UserCog,
  UserPen,
} from "lucide-react";
import "./adsidebar.css";
import { SidebarContext } from "../../../../../context/SidebarContext";
import { useRouter } from "next/navigation";
import { adminAuthService } from "../../../../../services/admin/adminlogin";

const AdSidebar = () => {
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
      await adminAuthService.logout();
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
          className="adsidebar-open-overlay active"
          onClick={closeSidebar}
          aria-hidden="true"
        />
      )}

      <div className={`adsidebar ${isSidebarOpen ? "open" : "collapsed"}`}>
        <div className="adsidebar-links">
          <div className="ad-divider">
            <Link
              href="/admin-dashboard"
              className={pathname === "/admin-dashboard" ? "active" : ""}
              onClick={closeSidebar}
            >
              <LayoutGridIcon size={14} /> Dashboard
            </Link>
            <Link
              href="/admin-dashboard/engineers"
              className={
                pathname === "/admin-dashboard/engineers" ||
                pathname.startsWith("/admin-dashboard/engineers")
                  ? "active"
                  : ""
              }
              onClick={closeSidebar}
            >
              <UserCog size={14} /> Engineers
            </Link>
            <Link
              href="/admin-dashboard/users"
              className={
                pathname === "/admin-dashboard/users" ||
                pathname.startsWith("/admin-dashboard/users")
                  ? "active"
                  : ""
              }
              onClick={closeSidebar}
            >
              <UserCircle size={14} /> Users
            </Link>
            <Link
              href="/admin-dashboard/orders"
              className={pathname === "/admin-dashboard/orders" ? "active" : ""}
              onClick={closeSidebar}
            >
              <File size={14} /> Repairs (Orders)
            </Link>
            <Link
              href="/admin-dashboard/logistics"
              className={
                pathname === "/admin-dashboard/logistics" ? "active" : ""
              }
              onClick={closeSidebar}
            >
              <Bike size={14} /> Logistics
            </Link>
            <Link
              href="/admin-dashboard/transactions"
              className={
                pathname === "/admin-dashboard/transactions" ? "active" : ""
              }
              onClick={closeSidebar}
            >
              <ArrowLeftRight size={14} /> Transactions
            </Link>
            <Link
              href="/admin-dashboard/gadgets"
              className={
                pathname === "/admin-dashboard/gadgets" ||
                pathname.startsWith("/admin-dashboard/gadgets")
                  ? "active"
                  : ""
              }
              onClick={closeSidebar}
            >
              <Cog size={14} /> Gadgets List
            </Link>
          </div>

          <div className="ad-divider">
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

export default AdSidebar;
