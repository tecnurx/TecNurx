"use client";

import React, { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import "./notifications.css";
import { Bell } from "lucide-react";
import { NotificationService } from "../../../../../services/notification";
import { toast } from "@/components/CustomToast";
import TecNurxLoader from "@/components/TecNurxLoader";

export default function EngineerNotificationsPage() {
  const router = useRouter();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeFilter, setActiveFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await NotificationService.getNotifications();
      const list = res?.data?.notifications || res?.notifications || [];
      setNotifications(Array.isArray(list) ? list : []);
    } catch (err) {
      console.error("Failed to load engineer notifications", err);
      setError("Failed to load notifications");
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const formatNotificationTime = (isoString) => {
    if (!isoString) return "Recently";
    const date = new Date(isoString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
    });
  };

  const handleMarkAllAsRead = async () => {
    try {
      await NotificationService.markAllasRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      toast.success("All notifications marked as read");
    } catch (err) {
      console.error("Failed to mark all as read:", err);
      toast.error("Failed to mark notifications as read");
    }
  };

  const handleNotificationClick = async (n) => {
    if (!n.isRead) {
      try {
        await NotificationService.markOneasRead(n._id);
      } catch (err) {
        console.error("Failed to mark notification read:", err);
      }
      setNotifications((prev) =>
        prev.map((item) => (item._id === n._id ? { ...item, isRead: true } : item))
      );
    }

    const type = (n.type || "").toLowerCase();
    const repairId =
      n.repairId?._id || n.repairId || n.metadata?.repairId || n.metadata?.orderId;

    if (
      repairId &&
      (type.includes("repair") ||
        type.includes("quote") ||
        type.includes("pickup") ||
        type.includes("assign"))
    ) {
      router.push(`/engineer-dashboard/repairs/${repairId}`);
      return;
    }

    if (type.includes("wallet") || type.includes("withdraw")) {
      router.push("/engineer-dashboard/wallet");
      return;
    }

    if (type.includes("payment") || type.includes("payout") || type.includes("fee") || type.includes("invoice")) {
      router.push("/engineer-dashboard/payments");
      return;
    }

    if (type.includes("account") || type.includes("profile") || type.includes("verification")) {
      router.push("/engineer-dashboard/account-setup");
      return;
    }

    if (repairId) {
      router.push(`/engineer-dashboard/repairs/${repairId}`);
    }
  };

  const filteredNotifications = useMemo(() => {
    if (activeFilter === "all") return notifications;

    return notifications.filter((n) => {
      const type = (n.type || "").toLowerCase();
      const title = (n.title || "").toLowerCase();
      const message = (n.message || "").toLowerCase();
      const combined = `${type} ${title} ${message}`;

      if (activeFilter === "repairs") {
        return (
          combined.includes("repair") ||
          combined.includes("quote") ||
          combined.includes("pickup") ||
          combined.includes("assign") ||
          Boolean(n.repairId)
        );
      }

      if (activeFilter === "payments") {
        return (
          combined.includes("payment") ||
          combined.includes("payout") ||
          combined.includes("wallet") ||
          combined.includes("withdraw") ||
          combined.includes("fee") ||
          combined.includes("invoice")
        );
      }

      if (activeFilter === "account") {
        return (
          combined.includes("account") ||
          combined.includes("profile") ||
          combined.includes("verification") ||
          combined.includes("kyc")
        );
      }

      return true;
    });
  }, [notifications, activeFilter]);

  const totalItems = filteredNotifications.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));
  const displayedItems = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredNotifications.slice(start, start + itemsPerPage);
  }, [filteredNotifications, currentPage, itemsPerPage]);

  const startIndex = totalItems === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;
  const endIndex = Math.min(totalItems, currentPage * itemsPerPage);

  return (
    <div className="notifications-page">
      <div className="notifications-header">
        <div>
          <h1 className="notifications-title">Notifications</h1>
          <p className="notifications-subtitle">
            Updates about your assigned repairs, payouts, and account.
          </p>
        </div>

        {notifications.some((n) => !n.isRead) && (
          <button
            type="button"
            className="notifications-mark-all-btn"
            onClick={handleMarkAllAsRead}
          >
            Mark all as read
          </button>
        )}
      </div>

      <div className="notifications-filters-row">
        <button
          type="button"
          className={`notif-filter-pill ${activeFilter === "all" ? "active" : ""}`}
          onClick={() => {
            setActiveFilter("all");
            setCurrentPage(1);
          }}
        >
          All
        </button>
        <button
          type="button"
          className={`notif-filter-pill ${activeFilter === "repairs" ? "active" : ""}`}
          onClick={() => {
            setActiveFilter("repairs");
            setCurrentPage(1);
          }}
        >
          Repairs
        </button>
        <button
          type="button"
          className={`notif-filter-pill ${activeFilter === "payments" ? "active" : ""}`}
          onClick={() => {
            setActiveFilter("payments");
            setCurrentPage(1);
          }}
        >
          Payments &amp; Wallet
        </button>
        <button
          type="button"
          className={`notif-filter-pill ${activeFilter === "account" ? "active" : ""}`}
          onClick={() => {
            setActiveFilter("account");
            setCurrentPage(1);
          }}
        >
          Account
        </button>
      </div>

      <div className="notifications-card">
        {loading ? (
          <TecNurxLoader minHeight="220px" size="md" text="Loading notifications..." />
        ) : error ? (
          <div className="notifications-empty-state">
            <Bell size={32} style={{ color: "#94a3b8", margin: "0 auto" }} />
            <h3>Unable to load notifications</h3>
            <p>{error}</p>
          </div>
        ) : displayedItems.length === 0 ? (
          <div className="notifications-empty-state">
            <Bell size={32} style={{ color: "#94a3b8", margin: "0 auto" }} />
            <h3>No notifications found</h3>
            <p>You have no notifications under this category.</p>
          </div>
        ) : (
          displayedItems.map((n) => {
            const timeLabel = formatNotificationTime(n.createdAt);
            const deviceSubtitle =
              n.metadata?.deviceName ||
              n.deviceId?.model ||
              n.metadata?.subject ||
              null;

            return (
              <div
                key={n._id}
                className="notification-row-item"
                onClick={() => handleNotificationClick(n)}
              >
                <div className="notification-row-left">
                  {!n.isRead ? (
                    <span className="notif-unread-dot" title="Unread" />
                  ) : (
                    <span className="notif-read-spacer" />
                  )}

                  <div className="notification-row-content">
                    <h3 className="notification-row-title">{n.title}</h3>
                    <p className="notification-row-sub">
                      {deviceSubtitle ? `${deviceSubtitle} · ${n.message}` : n.message}
                    </p>
                  </div>
                </div>

                <span className="notification-row-time">{timeLabel}</span>
              </div>
            );
          })
        )}
      </div>

      {totalItems > 0 && (
        <div className="notifications-footer">
          <span className="notifications-count-label">
            Showing {startIndex} to {endIndex} of {totalItems}
          </span>

          {totalPages > 1 && (
            <div className="notifications-pagination">
              <button
                type="button"
                className="btn-pagination"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              >
                Previous
              </button>

              {Array.from({ length: totalPages }).map((_, idx) => {
                const pageNum = idx + 1;
                return (
                  <button
                    key={pageNum}
                    type="button"
                    className={`btn-pagination ${currentPage === pageNum ? "active" : ""}`}
                    onClick={() => setCurrentPage(pageNum)}
                  >
                    {pageNum}
                  </button>
                );
              })}

              <button
                type="button"
                className="btn-pagination"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              >
                Next
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
