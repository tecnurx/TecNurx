"use client";
import React, { useState } from "react";
import "./sidebar.css";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { TrackRepairModal } from "@/app/(main)/track-repair/TrackModal";

const Sidebar = () => {
  const pathname = usePathname();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [trackingData, setTrackingData] = useState({
    trackingNumber: "",
    totalTime: "00:40:00",
    repairTime: "00:00:00",
  });

  const handleRequestRepair = () => {
    setIsModalOpen(true);
  };

  return (
    <div>
      <div className="sidebar">
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
            href="#"
            className={pathname === "/dashboard/orders" ? "active" : ""}
            onClick={handleRequestRepair}
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
            href="/dashboard/settings"
            className={pathname === "/dashboard/settings" ? "active" : ""}
          >
            Settings
          </Link>
        </div>
      </div>
      <TrackRepairModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        trackingNumber={trackingData.trackingNumber}
        totalTime={trackingData.totalTime}
        repairTime={trackingData.repairTime}
      />
    </div>
  );
};

export default Sidebar;
