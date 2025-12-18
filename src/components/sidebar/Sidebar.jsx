"use client";
import React, { useContext, useEffect, useState } from "react";
import "./sidebar.css";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import logo from "@/assets/images/logo.svg";
import { Menu } from "lucide-react";
import { SidebarContext } from "./../../../context/SidebarContext";

const Sidebar = () => {
  const { isSidebarOpen, closeSidebar } = useContext(SidebarContext);
  const pathname = usePathname();

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
          >
            Dashboard Overview
          </Link>
          <Link
            href="/dashboard/devices"
            className={pathname === "/dashboard/devices" ? "active" : ""}
          >
            My Devices
          </Link>
          <Link
            href="/book-repair"
            className={pathname === "/dashboard/book-repair" ? "active" : ""}
          >
            Book a Repair
          </Link>
          <Link
            href="/dashboard/my-orders"
            className={pathname === "/dashboard/my-orders" ? "active" : ""}
          >
            My Orders / Tracking
          </Link>
          <Link
            href="/dashboard/insurance"
            className={pathname === "/dashboard/insurance" ? "active" : ""}
          >
            Insurance
          </Link>
          <Link
            href="/dashboard/payments"
            className={pathname === "/dashboard/payments" ? "active" : ""}
          >
            Payment & Plans
          </Link>
          <Link
            href="/dashboard/feedback"
            className={pathname === "/dashboard/feedback" ? "active" : ""}
          >
            Feedback & Reviews
          </Link>
          <Link
            href="/dashboard/my-account"
            className={pathname === "/dashboard/my-account" ? "active" : ""}
          >
            My Account{" "}
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
