"use client";
import { Bell, Search, CircleUserRound } from "lucide-react";
import React, { useState } from "react";
import logo from "@/assets/images/logo.svg";
import "./dashcomp.css";
import Image from "next/image";
import Link from "next/link";

const DashboardNav = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
    setIsNotificationsOpen(false); // Close notifications if open
  };

  const toggleNotifications = () => {
    setIsNotificationsOpen(!isNotificationsOpen);
    setIsDropdownOpen(false); // Close user dropdown if open
  };

  const notifications = [
    {
      id: 1,
      message: "Your device has been received by Engineer David.",
      timestamp: "2025-11-14 10:30 AM",
    },
    {
      id: 2,
      message: "Your insurance plan will renew on November 15.",
      timestamp: "2025-11-13 3:15 PM",
    },
    {
      id: 3,
      message: "We’re offering 10% off repairs this month.",
      timestamp: "2025-11-12 9:00 AM",
    },
  ];

  return (
    <div>
      <div className="dashNav">
        <Link href="/dashboard">
          <Image src={logo} alt="logo" width={150} />
        </Link>
        <div className="nav-items">
          <div className="nav-search">
            <input type="text" placeholder="Search" />
            <Search className="search-icon" />
          </div>
          <div className="notifications">
            <Bell onClick={toggleNotifications} className="notification" />
            {isNotificationsOpen && (
              <div className="notifications-panel">
                <div className="notifications-header">
                  <h3>Notifications</h3>
                </div>
                <div className="notifications-list">
                  {notifications.map((notification) => (
                    <div key={notification.id} className="notification-item">
                      <p>{notification.message}</p>
                      <span className="timestamp">
                        {notification.timestamp}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          <div className="user-profile">
            <CircleUserRound onClick={toggleDropdown} className="user-icon" />
            {isDropdownOpen && (
              <div className="dropdown-menu">
                <Link href="#" className="dropdown-item">
                  My Account
                </Link>
                <Link href="#" className="dropdown-item">
                  Payment Settings
                </Link>
                <Link href="#" className="dropdown-item">
                  Preferences
                </Link>
                <Link href="#" className="dropdown-item">
                  Logout
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardNav;
