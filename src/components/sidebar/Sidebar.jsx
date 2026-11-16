"use client";

import React, { useContext } from "react";
import "./sidebar.css";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import sidebarLogo from "@/assets/images/sidebar-logo.png";
import {
  Home,
  Wrench,
  Smartphone,
  CreditCard,
  Shield,
  MessageSquare,
  User,
} from "lucide-react";
import { SidebarContext } from "./../../../context/SidebarContext";

const Sidebar = () => {
  const { isSidebarOpen, closeSidebar } = useContext(SidebarContext);
  const pathname = usePathname();

  const handleOpenSupport = () => {
    closeSidebar();
    const chatBtn = document.querySelector(".tnx-chat-bubble-btn");
    if (chatBtn) {
      chatBtn.click();
    }
  };

  return (
    <>
      {/* Overlay for mobile */}
      {isSidebarOpen && (
        <div
          className="sidebar-open-overlay active"
          onClick={closeSidebar}
          aria-hidden="true"
        />
      )}

      <aside className={`sidebar ${isSidebarOpen ? "open" : "collapsed"}`}>
        {/* Brand Logo */}
        <div className="sidebar-logo">
          <Link href="/dashboard" onClick={closeSidebar}>
            <Image
              src={sidebarLogo}
              alt="TecNurx"
              width={140}
              height={27}
              priority
              style={{ width: "140px", height: "auto", display: "block" }}
            />
          </Link>
        </div>

        {/* Nav Links */}
        <nav className="sidebar-links">
          <Link
            href="/dashboard"
            className={pathname === "/dashboard" ? "active" : ""}
            onClick={closeSidebar}
          >
            <Home size={18} />
            <span>Overview</span>
          </Link>

          <Link
            href="/dashboard/repairs"
            className={
              pathname.startsWith("/dashboard/repairs") ||
              pathname.startsWith("/dashboard/my-orders")
                ? "active"
                : ""
            }
            onClick={closeSidebar}
          >
            <Wrench size={18} />
            <span>Repairs</span>
          </Link>

          <Link
            href="/dashboard/devices"
            className={
              pathname.startsWith("/dashboard/devices") ? "active" : ""
            }
            onClick={closeSidebar}
          >
            <Smartphone size={18} />
            <span>Devices</span>
          </Link>

          <Link
            href="/dashboard/payments"
            className={
              pathname.startsWith("/dashboard/payments") ? "active" : ""
            }
            onClick={closeSidebar}
          >
            <CreditCard size={18} />
            <span>Payments</span>
          </Link>

          <Link
            href="/dashboard/insurance"
            className={
              pathname.startsWith("/dashboard/insurance") ? "active" : ""
            }
            onClick={closeSidebar}
          >
            <Shield size={18} />
            <span>Protection</span>
          </Link>

          <Link
            href="/dashboard/support"
            className={
              pathname.startsWith("/dashboard/support") ? "active" : ""
            }
            onClick={closeSidebar}
          >
            <MessageSquare size={18} />
            <span>Support</span>
          </Link>

          <Link
            href="/dashboard/my-account"
            className={
              pathname.startsWith("/dashboard/my-account") ||
              pathname.startsWith("/dashboard/notifications")
                ? "active"
                : ""
            }
            onClick={closeSidebar}
          >
            <User size={18} />
            <span>Account</span>
          </Link>
        </nav>

        {/* Footer Support Link */}
        <div className="sidebar-footer">
          <button
            type="button"
            className="sidebar-help-btn"
            onClick={handleOpenSupport}
          >
            Need help? Contact support
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
