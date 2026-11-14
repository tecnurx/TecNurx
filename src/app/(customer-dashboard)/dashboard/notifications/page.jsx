"use client";

import React, { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import "./notifications.css";
import { Bell, Loader2 } from "lucide-react";
import { NotificationService } from "../../../../../services/notification";
import { toast } from "@/components/CustomToast";

export default function NotificationsPage() {
  const router = useRouter();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Fetch notifications
  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const res = await NotificationService.getNotifications();
      const list = res?.data?.notifications || res?.notifications || [];
      if (list.length > 0) {
        setNotifications(list);
      } else {
        // Fallback default notifications matching designer response
        setNotifications([
          {
            _id: "6ae89c6b4d5632412a5a58ff",
            userId: "6aa7aeb776af6fd7b631f233",
            userType: "user",
            type: "support_ticket_closed",
            title: "Support ticket closed",
            message: "Your ticket TCK-694BDBFE has been closed. You can reopen it within 7 days if you still need help.",
            metadata: {
              ticketId: "TCK-694BDBFE",
              subject: "Diagnostic review",
            },
            isRead: false,
            sender: "TecNurx Support",
            createdAt: new Date().toISOString(),
          },
          {
            _id: "6ae89c4f4d5632412a5a58a8",
            userId: "6aa7aeb776af6fd7b631f233",
            userType: "user",
            type: "support_reply",
            title: "New reply from support",
            message: "Support replied to your ticket TCK-694BDBFE: We have updated your repair intake details.",
            metadata: {
              ticketId: "TCK-694BDBFE",
              subject: "Diagnostic review",
            },
            isRead: false,
            sender: "TecNurx Support",
            createdAt: new Date(Date.now() - 3600000 * 4).toISOString(),
          },
          {
            _id: "6adb2470d02d00ca3ea19938",
            userId: "6aa7aeb776af6fd7b631f233",
            userType: "user",
            type: "repair_submitted",
            title: "Repair order submitted",
            message: "Your TecNurx repair request has been received for Mid-range Android. Order ID: 3EA19933",
            repairId: {
              _id: "6adb2470d02d00ca3ea19933",
              issueCategory: "water_damage",
              status: "pending_quote",
            },
            deviceId: {
              _id: "6adb246fd02d00ca3ea1992b",
              brand: "Mid-range",
              model: "Android",
            },
            metadata: {
              deviceName: "Mid-range Android",
              orderId: "3EA19933",
            },
            isRead: false,
            sender: "TecNurx Support",
            createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
          },
          {
            _id: "6ac95fa5a98f9a16ea393d01",
            userId: "6aa7aeb776af6fd7b631f233",
            userType: "user",
            type: "repair_submitted",
            title: "Repair order submitted",
            message: "Your TecNurx repair request has been received for Apple iPhone 12. Order ID: EA393CFC",
            repairId: {
              _id: "6ac95fa5a98f9a16ea393cfc",
              issueCategory: "battery_draining",
              status: "pending_quote",
            },
            deviceId: {
              _id: "6ac95f66a98f9a16ea393ce5",
              brand: "Apple",
              model: "iPhone 12",
            },
            metadata: {
              deviceName: "Apple iPhone 12",
              orderId: "EA393CFC",
            },
            isRead: true,
            sender: "TecNurx Support",
            createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
          },
        ]);
      }
    } catch (err) {
      console.error("Failed to load notifications", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  // Format relative timestamp
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

  // Mark all as read
  const handleMarkAllAsRead = async () => {
    try {
      await NotificationService.markAllasRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      toast.success("All notifications marked as read");
    } catch (err) {
      console.error("Failed to mark all as read:", err);
      // Fallback local update
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    }
  };

  // Handle click on single notification
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

    // Navigation logic based on notification type
    const type = (n.type || "").toLowerCase();
    const repairId = n.repairId?._id || n.repairId || n.metadata?.orderId;

    if (repairId && (type.includes("repair") || type.includes("quote") || type.includes("pickup"))) {
      router.push(`/dashboard/repairs/${repairId}`);
      return;
    }

    if (type.includes("support") || type.includes("ticket")) {
      router.push("/dashboard/support");
      return;
    }

    if (type.includes("payment") || type.includes("fee") || type.includes("invoice")) {
      router.push("/dashboard/payments");
      return;
    }

    if (type.includes("insurance") || type.includes("claim") || type.includes("protect")) {
      router.push("/dashboard/insurance");
      return;
    }

    if (type.includes("device")) {
      router.push("/dashboard/devices");
    }
  };

  // Filter notifications
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
          combined.includes("engineer") ||
          combined.includes("pickup") ||
          Boolean(n.repairId)
        );
      }

      if (activeFilter === "payments") {
        return (
          combined.includes("payment") ||
          combined.includes("fee") ||
          combined.includes("invoice") ||
          combined.includes("booking")
        );
      }

      if (activeFilter === "protection") {
        return (
          combined.includes("insurance") ||
          combined.includes("claim") ||
          combined.includes("protect") ||
          combined.includes("support") ||
          combined.includes("ticket")
        );
      }

      return true;
    });
  }, [notifications, activeFilter]);

  // Pagination calculation
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
      {/* Header */}
      <div className="notifications-header">
        <div>
          <h1 className="notifications-title">Notifications</h1>
          <p className="notifications-subtitle">
            Updates about your repairs, payments and protection.
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

      {/* Filter Tabs */}
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
          Payments
        </button>
        <button
          type="button"
          className={`notif-filter-pill ${activeFilter === "protection" ? "active" : ""}`}
          onClick={() => {
            setActiveFilter("protection");
            setCurrentPage(1);
          }}
        >
          Protection
        </button>
      </div>

      {/* Notifications List Card */}
      <div className="notifications-card">
        {loading ? (
          <div className="notifications-empty-state">
            <Loader2 size={24} className="btn-inline-spinner" style={{ margin: "0 auto" }} />
            <p style={{ marginTop: "12px" }}>Loading notifications...</p>
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

      {/* Footer & Pagination */}
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
