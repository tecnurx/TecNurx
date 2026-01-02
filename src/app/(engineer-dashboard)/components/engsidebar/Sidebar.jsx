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
            <Link href="/" onClick={closeSidebar}>
              <LogOut size={14} /> Logout
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
