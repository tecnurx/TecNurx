"use client";
import React, { useContext, useEffect, useState } from "react";
import "./sidebar.css";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import logo from "@/assets/images/logo.png";
import {
  BookCopy,
  CreditCard,
  LayoutGridIcon,
  UserPen,
  Shield,
  Smartphone,
  ToolCase,
} from "lucide-react";
import { SidebarContext } from "./../../../context/SidebarContext";

const Sidebar = () => {
  const { isSidebarOpen, closeSidebar } = useContext(SidebarContext);
  const pathname = usePathname();

  // useEffect(() => {
  //   closeSidebar();
  // }, [pathname, closeSidebar]);

  return (
    <div>
      {/* Overlay for mobile */}
      {isSidebarOpen && (
        <div
          className="sidebar-open-overlay active"
          onClick={closeSidebar}
          aria-hidden="true"
        />
      )}

      <div className={`sidebar ${isSidebarOpen ? "open" : "collapsed"}`}>
        <div className="sidebar-links">
          <Link
            href="/dashboard"
            className={pathname === "/dashboard" ? "active" : ""}
            onClick={closeSidebar}
          >
            <LayoutGridIcon size={14} /> Dashboard Overview
          </Link>
          <Link
            href="/dashboard/devices"
            className={pathname === "/dashboard/devices" ? "active" : ""}
            onClick={closeSidebar}
          >
            <Smartphone size={14} /> My Devices
          </Link>
          <Link
            href="/dashboard/book-repair"
            className={pathname === "/dashboard/book-repair" ? "active" : ""}
            onClick={closeSidebar}
          >
            <ToolCase size={14} /> Book a Repair
          </Link>
          <Link
            href="/dashboard/my-orders"
            className={pathname === "/dashboard/my-orders" ? "active" : ""}
            onClick={closeSidebar}
          >
            <BookCopy size={14} /> My Orders / Tracking
          </Link>
          <Link
            href="/dashboard/insurance"
            className={pathname === "/dashboard/insurance" ? "active" : ""}
            onClick={closeSidebar}
          >
            <Shield size={14} /> Insurance
          </Link>
          <Link
            href="/dashboard/payments"
            className={pathname === "/dashboard/payments" ? "active" : ""}
            onClick={closeSidebar}
          >
            <CreditCard size={14} /> Payment & Plans
          </Link>
          {/* <Link
            href="/dashboard/feedback"
            className={pathname === "/dashboard/feedback" ? "active" : ""}
            onClick={closeSidebar}
          >
            Feedback & Reviews
          </Link> */}
          <Link
            href="/dashboard/my-account"
            className={pathname === "/dashboard/my-account" ? "active" : ""}
            onClick={closeSidebar}
          >
            <UserPen size={14} /> My Account{" "}
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
