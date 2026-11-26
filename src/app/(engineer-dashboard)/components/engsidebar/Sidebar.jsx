"use client";

import React, { useContext, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import Image from "next/image";
import sidebarLogo from "@/assets/images/sidebar-logo.png";
import {
  Home,
  Wrench,
  CreditCard,
  Wallet,
  UserPen,
  LogOut,
  ShieldCheck,
} from "lucide-react";
import { SidebarContext } from "../../../../../context/SidebarContext";
import { engineerAuthService } from "../../../../../services/eng/engineerAuth";
import "./sidebar.css";

const Sidebar = () => {
  const { isSidebarOpen, closeSidebar } = useContext(SidebarContext);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

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
    }
  };

  return (
    <>
      {/* Overlay for mobile */}
      {isSidebarOpen && (
        <div
          className="engsidebar-open-overlay active"
          onClick={closeSidebar}
          aria-hidden="true"
        />
      )}

      <aside className={`eng-sidebar ${isSidebarOpen ? "open" : "collapsed"}`}>
        {/* Brand Logo + Engineer Portal Badge */}
        <div className="eng-sidebar-logo">
          <Link href="/engineer-dashboard" onClick={closeSidebar}>
            <Image
              src={sidebarLogo}
              alt="TecNurx"
              width={140}
              height={27}
              priority
              style={{ width: "140px", height: "auto", display: "block" }}
            />
          </Link>
          <span className="eng-portal-badge">
            <ShieldCheck size={12} />
            <span>Engineer Portal</span>
          </span>
        </div>

        {/* Navigation Links */}
        <nav className="eng-sidebar-links">
          <Link
            href="/engineer-dashboard"
            className={pathname === "/engineer-dashboard" ? "active" : ""}
            onClick={closeSidebar}
          >
            <Home size={18} />
            <span>Overview</span>
          </Link>

          <Link
            href="/engineer-dashboard/repairs"
            className={
              pathname?.startsWith("/engineer-dashboard/repairs") ? "active" : ""
            }
            onClick={closeSidebar}
          >
            <Wrench size={18} />
            <span>My Repairs</span>
          </Link>

          <Link
            href="/engineer-dashboard/payments"
            className={
              pathname?.startsWith("/engineer-dashboard/payments") ? "active" : ""
            }
            onClick={closeSidebar}
          >
            <CreditCard size={18} />
            <span>My Payments</span>
          </Link>

          <Link
            href="/engineer-dashboard/wallet"
            className={
              pathname?.startsWith("/engineer-dashboard/wallet") ? "active" : ""
            }
            onClick={closeSidebar}
          >
            <Wallet size={18} />
            <span>My Wallet</span>
          </Link>

          <Link
            href="/engineer-dashboard/account-setup"
            className={
              pathname?.startsWith("/engineer-dashboard/account-setup")
                ? "active"
                : ""
            }
            onClick={closeSidebar}
          >
            <UserPen size={18} />
            <span>Account Setup</span>
          </Link>
        </nav>

        {/* Footer Logout */}
        <div className="eng-sidebar-footer">
          <button
            type="button"
            className="eng-sidebar-logout-btn"
            onClick={handleLogout}
            disabled={isLoggingOut}
          >
            <LogOut size={16} />
            <span>{isLoggingOut ? "Logging out..." : "Logout"}</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
