// src/app/(admin-dashboard)/admin-dashboard/support/page.jsx
"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  LifeBuoy,
  MessageSquare,
  Clock,
  CheckCircle2,
  AlertCircle,
  Eye,
  Send,
  X,
  Paperclip,
  User,
  ShieldCheck,
  UserCheck,
  RotateCcw,
  RefreshCw,
  Search,
  Filter,
} from "lucide-react";
import AdminTable from "@/components/AdminTable";
import { adminSupportService } from "../../../../../services/admin/adminSupportService";
import { staffService } from "../../../../../services/admin/staffService";
import { toast } from "@/components/CustomToast";
import "./support.css";

const MAX_ATTACHMENTS = 3;
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export default function AdminSupportPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tickets, setTickets] = useState([]);
  const [categories, setCategories] = useState([]);
  const [staffMembers, setStaffMembers] = useState([]);

  // Active Ticket Drawer state
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [ticketDetails, setTicketDetails] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loadingDetails, setLoadingDetails] = useState(false);

  // Staff reply form state
  const [replyText, setReplyText] = useState("");
  const [replyAttachments, setReplyAttachments] = useState([]);
  const [sendingReply, setSendingReply] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [updatingAssign, setUpdatingAssign] = useState(false);

  // Typing indicator
  const [typingInfo, setTypingInfo] = useState(null);
  const typingTimerRef = useRef(null);

  // Lightbox
  const [previewImage, setPreviewImage] = useState(null);

  const fileInputRef = useRef(null);
  const messagesEndRef = useRef(null);

  // Fetch initial tickets, categories, and staff
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const [ticketsRes, catsRes, staffRes] = await Promise.allSettled([
        adminSupportService.getAllTickets(),
        adminSupportService.getCategories(),
        staffService.getAllStaff().catch(() => ({ data: [] })),
      ]);

      if (ticketsRes.status === "fulfilled") {
        setTickets(Array.isArray(ticketsRes.value) ? ticketsRes.value : []);
      } else {
        throw ticketsRes.reason;
      }

      if (catsRes.status === "fulfilled") {
        setCategories(Array.isArray(catsRes.value) ? catsRes.value : []);
      }

      if (staffRes.status === "fulfilled") {
        const staffList =
          staffRes.value?.data?.staff ||
          staffRes.value?.staff ||
          staffRes.value?.data ||
          [];
        setStaffMembers(Array.isArray(staffList) ? staffList : []);
      }
    } catch (err) {
      console.error("Admin Support fetch error:", err);
      const msg =
        err.response?.data?.message ||
        err.message ||
        "Failed to load support tickets. Please ensure you have support:tickets:read permission.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("admin-support-unread-reset"));
    }
  }, [fetchData]);

  // Setup Socket.IO for staff live updates
  useEffect(() => {
    const socket = adminSupportService.initSocket();
    if (!socket) return;

    const onTicketNew = (payload) => {
      const ticket =
        payload?.ticket || payload?.data?.ticket || payload?.data || payload;
      if (!ticket || (!ticket._id && !ticket.id)) return;
      const tid = ticket._id || ticket.id;

      // 1. Immediately inject into state so table updates with zero delay
      setTickets((prev) => {
        return prev.some((t) => (t._id || t.id) === tid)
          ? prev
          : [ticket, ...prev];
      });

      // 2. Fetch full server data to sync populated relations (user, category) & stat cards
      fetchData();
    };

    const onTicketUpdated = (payload) => {
      const ticket =
        payload?.ticket || payload?.data?.ticket || payload?.data || payload;
      if (!ticket || (!ticket._id && !ticket.id)) return;
      const tid = ticket._id || ticket.id;

      setTickets((prev) =>
        prev.map((t) => ((t._id || t.id) === tid ? { ...t, ...ticket } : t))
      );
      if (selectedTicket && (selectedTicket._id || selectedTicket.id) === tid) {
        setTicketDetails((prev) => ({ ...prev, ...ticket }));
      }
      fetchData();
    };

    const onMessageNew = (payload) => {
      const ticketId = payload?.ticketId || payload?.ticket;
      const message =
        payload?.message ||
        payload?.data?.message ||
        payload?.data ||
        payload;
      if (!message) return;

      // If currently viewing this ticket in drawer, append message
      if (selectedTicket && (selectedTicket._id || selectedTicket.id) === ticketId) {
        setMessages((prev) => {
          const mid = message._id || message.id;
          return prev.some((m) => (m._id || m.id) === mid) ? prev : [...prev, message];
        });
      }

      // Update in ticket table
      setTickets((prev) =>
        prev.map((t) => {
          if ((t._id || t.id) === ticketId) {
            return {
              ...t,
              latestMessage: message,
              status: message.senderType === "staff" ? "pending" : "open",
              updatedAt: new Date().toISOString(),
            };
          }
          return t;
        })
      );

      // Background sync to keep sorting order and metric counts fresh
      fetchData();
    };

    const onTyping = ({ ticketId, senderType, name, isTyping }) => {
      if (selectedTicket && (selectedTicket._id || selectedTicket.id) === ticketId) {
        if (isTyping && senderType !== "staff") {
          setTypingInfo(name || "Customer");
          if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
          typingTimerRef.current = setTimeout(() => setTypingInfo(null), 3000);
        } else {
          setTypingInfo(null);
        }
      }
    };

    socket.on("support:ticket:new", onTicketNew);
    socket.on("support:ticket:updated", onTicketUpdated);
    socket.on("support:message:new", onMessageNew);
    socket.on("support:typing", onTyping);

    return () => {
      socket.off("support:ticket:new", onTicketNew);
      socket.off("support:ticket:updated", onTicketUpdated);
      socket.off("support:message:new", onMessageNew);
      socket.off("support:typing", onTyping);
    };
  }, [selectedTicket]);

  // Scroll to bottom of message feed
  useEffect(() => {
    if (selectedTicket && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, selectedTicket, typingInfo]);

  // Open ticket drawer and join room
  const handleSelectTicket = async (ticket) => {
    const tid = ticket._id || ticket.id;
    try {
      setSelectedTicket(ticket);
      setTicketDetails(ticket);
      setLoadingDetails(true);
      setReplyText("");
      setReplyAttachments([]);

      if (typeof window !== "undefined") {
        window.dispatchEvent(
          new CustomEvent("admin-active-ticket-change", { detail: { ticketId: tid } })
        );
      }

      adminSupportService.joinTicket(tid);

      const res = await adminSupportService.getTicketDetails(tid);
      const ticketObj = res?.ticket || res?.data?.ticket || res || ticket;
      const msgList =
        (Array.isArray(res?.messages) && res.messages) ||
        (Array.isArray(ticketObj?.messages) && ticketObj.messages) ||
        [];
      setTicketDetails(ticketObj);
      setMessages(msgList);
    } catch (err) {
      console.error("Failed to load ticket details:", err);
      toast.error("Failed to load ticket messages.");
    } finally {
      setLoadingDetails(false);
    }
  };

  // Close drawer
  const handleCloseDrawer = () => {
    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent("admin-active-ticket-change", { detail: { ticketId: null } })
      );
    }
    if (selectedTicket) {
      adminSupportService.leaveTicket(selectedTicket._id || selectedTicket.id);
    }
    setSelectedTicket(null);
    setTicketDetails(null);
    setMessages([]);
    setReplyText("");
    setReplyAttachments([]);
    setTypingInfo(null);
  };

  // Typing event emitter
  const handleReplyChange = (e) => {
    setReplyText(e.target.value);
    if (!selectedTicket) return;

    const tid = selectedTicket._id || selectedTicket.id;
    adminSupportService.sendTyping(tid, true);

    if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
    typingTimerRef.current = setTimeout(() => {
      adminSupportService.sendTyping(tid, false);
    }, 1500);
  };

  // Select reply images
  const handleSelectAttachments = (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    if (replyAttachments.length + files.length > MAX_ATTACHMENTS) {
      toast.error(`You can attach up to ${MAX_ATTACHMENTS} images in total.`);
      return;
    }

    const validFiles = files.filter((f) => {
      if (!f.type.startsWith("image/")) {
        toast.error(`${f.name} is not an image file.`);
        return false;
      }
      if (f.size > MAX_FILE_SIZE) {
        toast.error(`${f.name} exceeds the 5MB file limit.`);
        return false;
      }
      return true;
    });

    setReplyAttachments((prev) => [...prev, ...validFiles]);
  };

  // Send staff reply
  const handleSendReply = async (e) => {
    e.preventDefault();
    if (!replyText.trim() && replyAttachments.length === 0) return;
    if (!selectedTicket) return;

    const tid = selectedTicket._id || selectedTicket.id;
    try {
      setSendingReply(true);
      adminSupportService.sendTyping(tid, false);

      const res = await adminSupportService.replyTicket(tid, {
        text: replyText.trim(),
        message: replyText.trim(),
        attachments: replyAttachments,
      });

      const savedMsg = res?.message || res?.data || res;
      if (savedMsg) {
        setMessages((prev) => {
          const mid = savedMsg._id || savedMsg.id;
          return prev.some((m) => (m._id || m.id) === mid) ? prev : [...prev, savedMsg];
        });
      }

      // Automatically changes status to pending (waiting on user)
      setTicketDetails((prev) => (prev ? { ...prev, status: "pending" } : prev));
      setTickets((prev) =>
        prev.map((t) =>
          (t._id || t.id) === tid ? { ...t, status: "pending" } : t
        )
      );

      setReplyText("");
      setReplyAttachments([]);
      if (fileInputRef.current) fileInputRef.current.value = "";
      toast.success("Reply sent successfully.");
    } catch (err) {
      console.error("Failed to send staff reply:", err);
      toast.error(err.response?.data?.message || "Failed to send reply.");
    } finally {
      setSendingReply(false);
    }
  };

  // Toggle ticket status (close or reopen)
  const handleToggleStatus = async (newStatus) => {
    if (!selectedTicket) return;
    const tid = selectedTicket._id || selectedTicket.id;
    try {
      setUpdatingStatus(true);
      const res = await adminSupportService.updateTicketStatus(tid, newStatus);
      const updated = res?.ticket || res?.data || { ...ticketDetails, status: newStatus };

      setTicketDetails(updated);
      setTickets((prev) =>
        prev.map((t) => ((t._id || t.id) === tid ? { ...t, status: newStatus } : t))
      );
      toast.success(`Ticket marked as ${newStatus}.`);
    } catch (err) {
      console.error("Failed to update status:", err);
      toast.error(err.response?.data?.message || "Failed to change ticket status.");
    } finally {
      setUpdatingStatus(false);
    }
  };

  // Assign staff to ticket
  const handleAssignStaff = async (staffId) => {
    if (!selectedTicket) return;
    const tid = selectedTicket._id || selectedTicket.id;
    try {
      setUpdatingAssign(true);
      const res = await adminSupportService.assignTicket(
        tid,
        staffId === "unassigned" ? null : staffId
      );
      const updated = res?.ticket || res?.data || { ...ticketDetails, assignedTo: staffId };

      setTicketDetails(updated);
      setTickets((prev) =>
        prev.map((t) =>
          (t._id || t.id) === tid ? { ...t, assignedTo: updated.assignedTo } : t
        )
      );
      toast.success("Ticket assignment updated.");
    } catch (err) {
      console.error("Failed to assign ticket:", err);
      toast.error(err.response?.data?.message || "Failed to assign staff.");
    } finally {
      setUpdatingAssign(false);
    }
  };

  // Stats computation
  const totalCount = tickets.length;
  const openCount = tickets.filter(
    (t) => (t.status || "").toLowerCase() === "open"
  ).length;
  const pendingCount = tickets.filter(
    (t) => (t.status || "").toLowerCase() === "pending"
  ).length;
  const closedCount = tickets.filter(
    (t) => (t.status || "").toLowerCase() === "closed"
  ).length;

  const columns = [
    {
      header: "Ticket ID",
      accessor: "_id",
      sortable: true,
      render: (t) => (
        <span style={{ fontWeight: "700", color: "#0f172a" }}>
          #{t._id ? t._id.slice(-8) : "N/A"}
        </span>
      ),
    },
    {
      header: "User / Requester",
      accessor: "user.email",
      render: (t) => {
        const u = t.user || {};
        const name =
          u.name ||
          (u.fname ? `${u.fname} ${u.lname || ""}` : "") ||
          "Customer";
        const email = u.email || "No email";
        const role = u.role || u.type || "customer";

        return (
          <div style={{ display: "flex", flexDirection: "column" }}>
            <span style={{ fontWeight: "600", color: "#0f172a" }}>{name}</span>
            <small style={{ color: "#64748b", fontSize: "12px" }}>
              {email} • <span style={{ textTransform: "capitalize" }}>{role}</span>
            </small>
          </div>
        );
      },
    },
    {
      header: "Subject & Category",
      accessor: "subject",
      sortable: true,
      render: (t) => {
        const catName =
          typeof t.category === "object" ? t.category?.name : t.category;
        return (
          <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
            <span style={{ fontWeight: "600", color: "#0f172a" }}>
              {t.subject || "No Subject"}
            </span>
            <span
              style={{
                fontSize: "11px",
                color: "#475569",
                background: "#f1f5f9",
                padding: "2px 6px",
                borderRadius: "4px",
                width: "fit-content",
                textTransform: "capitalize",
              }}
            >
              {catName || "General Support"}
            </span>
          </div>
        );
      },
    },
    {
      header: "Status",
      accessor: "status",
      sortable: true,
      render: (t) => {
        const status = (t.status || "open").toLowerCase();
        const isOpen = status === "open";
        const isPending = status === "pending";
        const isClosed = status === "closed";

        return (
          <span
            style={{
              padding: "4px 10px",
              borderRadius: "20px",
              fontSize: "12px",
              fontWeight: "700",
              textTransform: "capitalize",
              background: isOpen ? "#fef3c7" : isPending ? "#e0f2fe" : "#f1f5f9",
              color: isOpen ? "#b45309" : isPending ? "#0369a1" : "#64748b",
              border: isOpen
                ? "1px solid #fde68a"
                : isPending
                ? "1px solid #bae6fd"
                : "1px solid #e2e8f0",
            }}
          >
            {isOpen ? "Waiting on Support" : isPending ? "Waiting on User" : "Closed"}
          </span>
        );
      },
    },
    {
      header: "Assigned Agent",
      accessor: "assignedTo",
      render: (t) => {
        const agent = t.assignedTo;
        const name =
          typeof agent === "object"
            ? agent?.name || (agent?.fname ? `${agent.fname} ${agent.lname || ""}` : agent?.email)
            : agent || "Unassigned";

        return (
          <span
            style={{
              fontSize: "13px",
              color: agent ? "#0f172a" : "#94a3b8",
              fontWeight: agent ? "600" : "400",
              display: "inline-flex",
              alignItems: "center",
              gap: "4px",
            }}
          >
            <UserCheck size={14} color={agent ? "#16a34a" : "#94a3b8"} />
            {name}
          </span>
        );
      },
    },
    {
      header: "Last Updated",
      accessor: "updatedAt",
      sortable: true,
      render: (t) => (
        <span style={{ fontSize: "12px", color: "#64748b" }}>
          {t.updatedAt || t.createdAt
            ? new Date(t.updatedAt || t.createdAt).toLocaleDateString([], {
                month: "short",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })
            : "—"}
        </span>
      ),
    },
    {
      header: "Action",
      align: "center",
      render: (t) => (
        <button
          onClick={() => handleSelectTicket(t)}
          style={{
            background: "#0f172a",
            color: "#ffc400",
            border: "1px solid #ffc400",
            borderRadius: "6px",
            padding: "5px 12px",
            fontSize: "12px",
            fontWeight: "700",
            cursor: "pointer",
            display: "inline-flex",
            alignItems: "center",
            gap: "5px",
          }}
        >
          <Eye size={13} />
          <span>Reply</span>
        </button>
      ),
    },
  ];

  return (
    <div className="admin-support-page">
      {/* Header */}
      <div className="support-header-row">
        <div>
          <h1>Support Desk & Tickets</h1>
          <p>
            Manage live conversations, assist customers and engineers, and assign
            tickets.
          </p>
        </div>
        <button onClick={fetchData} className="btn-refresh-support">
          <RefreshCw size={15} /> Refresh
        </button>
      </div>

      {/* Metrics Row */}
      <div className="support-stats-grid">
        <div className="support-stat-card">
          <div>
            <span>Total Tickets</span>
            <h3>{totalCount}</h3>
          </div>
          <LifeBuoy size={24} color="#0f172a" />
        </div>

        <div className="support-stat-card">
          <div>
            <span>Open (Waiting on Support)</span>
            <h3>{openCount}</h3>
          </div>
          <AlertCircle size={24} color="#b45309" />
        </div>

        <div className="support-stat-card">
          <div>
            <span>Pending (Waiting on User)</span>
            <h3>{pendingCount}</h3>
          </div>
          <Clock size={24} color="#0369a1" />
        </div>

        <div className="support-stat-card">
          <div>
            <span>Closed Tickets</span>
            <h3>{closedCount}</h3>
          </div>
          <CheckCircle2 size={24} color="#16a34a" />
        </div>
      </div>

      {error && <div className="support-error-banner">{error}</div>}

      {/* Tickets Table */}
      <AdminTable
        title="Support Tickets"
        subtitle={`Total of ${tickets.length} tickets across all categories`}
        data={tickets}
        columns={columns}
        loading={loading}
        filters={[
          {
            key: "status",
            label: "Filter Status",
            options: [
              { value: "open", label: "Open (Waiting on Support)" },
              { value: "pending", label: "Pending (Waiting on User)" },
              { value: "closed", label: "Closed" },
            ],
            filterFn: (item, val) => (item.status || "").toLowerCase() === val,
          },
          ...(categories.length > 0
            ? [
                {
                  key: "category",
                  label: "Filter Category",
                  options: categories.map((c) => {
                    const val =
                      typeof c === "string" ? c : c.id || c.slug || c.name;
                    const label =
                      typeof c === "string"
                        ? c.charAt(0).toUpperCase() + c.slice(1)
                        : c.name || c.label || val;
                    return { value: val, label };
                  }),
                  filterFn: (item, val) => {
                    const itemCat =
                      typeof item.category === "object"
                        ? item.category?.name || item.category?.slug
                        : item.category;
                    return (itemCat || "").toLowerCase() === val.toLowerCase();
                  },
                },
              ]
            : []),
        ]}
        searchPlaceholder="Search ticket ID, user email, subject, or agent..."
        searchKeys={["_id", "subject", "user.email", "user.name", "status"]}
        initialPageSize={10}
        pageSizeOptions={[10, 20, 50]}
        emptyMessage="No support tickets found."
      />

      {/* Slide-over Ticket Drawer */}
      {selectedTicket && (
        <div className="support-drawer-backdrop" onClick={handleCloseDrawer}>
          <div
            className="support-drawer-container"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Drawer Header */}
            <div className="drawer-header">
              <div className="drawer-header-info">
                <h3>{ticketDetails?.subject || selectedTicket.subject}</h3>
                <div className="drawer-tags">
                  <span className="drawer-id">
                    #{(ticketDetails?._id || selectedTicket._id).slice(-8)}
                  </span>
                  <span
                    className={`ticket-status-pill status-${(
                      ticketDetails?.status || "open"
                    ).toLowerCase()}`}
                  >
                    {ticketDetails?.status || "Open"}
                  </span>
                </div>
              </div>
              <button
                onClick={handleCloseDrawer}
                className="drawer-close-btn"
                title="Close Drawer"
              >
                <X size={20} />
              </button>
            </div>

            {/* Requester & Assignment Management Bar */}
            <div className="drawer-management-bar">
              <div className="requester-info">
                <span className="info-label">Customer / Requester</span>
                <span className="info-name">
                  {ticketDetails?.user?.name ||
                    (ticketDetails?.user?.fname
                      ? `${ticketDetails.user.fname} ${ticketDetails.user.lname || ""}`
                      : "User")}
                </span>
                <span className="info-email">{ticketDetails?.user?.email}</span>
              </div>

              <div className="assignment-selector">
                <span className="info-label">Assigned Staff</span>
                <select
                  value={
                    typeof ticketDetails?.assignedTo === "object"
                      ? ticketDetails.assignedTo?._id || ""
                      : ticketDetails?.assignedTo || "unassigned"
                  }
                  onChange={(e) => handleAssignStaff(e.target.value)}
                  disabled={updatingAssign}
                >
                  <option value="unassigned">— Unassigned —</option>
                  {staffMembers.map((s) => (
                    <option key={s._id || s.id} value={s._id || s.id}>
                      {s.fname ? `${s.fname} ${s.lname || ""}` : s.email} (
                      {s.role?.name || s.role || "Staff"})
                    </option>
                  ))}
                </select>
              </div>

              <div className="drawer-status-toggle">
                <span className="info-label">Action</span>
                {(ticketDetails?.status || "").toLowerCase() === "closed" ? (
                  <button
                    onClick={() => handleToggleStatus("open")}
                    disabled={updatingStatus}
                    className="btn-status-action btn-reopen"
                  >
                    <RotateCcw size={13} /> Reopen Ticket
                  </button>
                ) : (
                  <button
                    onClick={() => handleToggleStatus("closed")}
                    disabled={updatingStatus}
                    className="btn-status-action btn-close"
                  >
                    <CheckCircle2 size={13} /> Close Ticket
                  </button>
                )}
              </div>
            </div>

            {/* Conversation Thread */}
            <div className="drawer-messages-feed">
              {loadingDetails ? (
                <div className="feed-loading">
                  <div className="respinner"></div>
                  <p>Loading conversation history...</p>
                </div>
              ) : messages.length === 0 ? (
                <div className="feed-empty">
                  <p>No messages recorded for this ticket.</p>
                </div>
              ) : (
                messages.map((msg, index) => {
                  const text = msg.text || msg.message || msg.content || "";
                  const isStaff =
                    msg.senderType === "staff" || msg.senderType === "admin";
                  const isSystem = msg.senderType === "system";
                  const isActivityNotice =
                    /reopened|closed|resolved|assigned|transferred|created this ticket|status changed/i.test(text);
                  const senderTag = isStaff
                    ? msg.senderName
                      ? `${msg.senderName} (Staff)`
                      : "Staff Support (You)"
                    : isSystem
                    ? isActivityNotice
                      ? "System Notification"
                      : msg.senderName && !msg.senderName.toLowerCase().includes("support")
                      ? `${msg.senderName} (Automated Bot)`
                      : "System Notification"
                    : msg.senderName || "Customer / Requester";
                  const time = msg.createdAt
                    ? new Date(msg.createdAt).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    : "";
                  const attachs = msg.attachments || [];

                  return (
                    <div
                      key={msg._id || msg.id || index}
                      className={`admin-bubble-row ${
                        isStaff
                          ? "admin-staff"
                          : isSystem
                          ? "admin-system"
                          : "admin-user"
                      }`}
                    >
                      <div className="admin-bubble-box">
                        <div className="admin-bubble-header">
                          <span className="sender-tag">{senderTag}</span>
                          <span className="bubble-timestamp">{time}</span>
                        </div>
                        {text && <p className="bubble-text-admin">{text}</p>}

                        {attachs.length > 0 && (
                          <div className="bubble-attachments-strip">
                            {attachs.map((att, aIdx) => {
                              const src =
                                typeof att === "string" ? att : att.url || att.path;
                              return (
                                <img
                                  key={aIdx}
                                  src={src}
                                  alt="attachment"
                                  className="admin-att-img"
                                  onClick={() => setPreviewImage(src)}
                                />
                              );
                            })}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })
              )}

              {/* Typing indicator */}
              {typingInfo && (
                <div className="admin-typing-pill">
                  <div className="typing-dots">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                  <small>{typingInfo} is typing a response...</small>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Reply Input Bar */}
            <form onSubmit={handleSendReply} className="drawer-reply-bar">
              {replyAttachments.length > 0 && (
                <div className="admin-reply-files-strip">
                  {replyAttachments.map((f, i) => (
                    <div key={i} className="admin-reply-chip">
                      <span>{f.name}</span>
                      <button
                        type="button"
                        onClick={() =>
                          setReplyAttachments(
                            replyAttachments.filter((_, idx) => idx !== i)
                          )
                        }
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div className="admin-reply-controls">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleSelectAttachments}
                  multiple
                  accept="image/jpeg,image/png,image/webp"
                  style={{ display: "none" }}
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="btn-admin-attach"
                  title="Attach images (up to 3)"
                  disabled={replyAttachments.length >= MAX_ATTACHMENTS}
                >
                  <Paperclip size={18} />
                </button>

                <textarea
                  rows={2}
                  placeholder="Type a response to the customer..."
                  value={replyText}
                  onChange={handleReplyChange}
                  disabled={sendingReply}
                />

                <button
                  type="submit"
                  disabled={
                    (!replyText.trim() && replyAttachments.length === 0) ||
                    sendingReply
                  }
                  className="btn-admin-send"
                >
                  <Send size={18} />
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Lightbox for viewing attachments */}
      {previewImage && (
        <div
          className="chatbox-lightbox-overlay"
          onClick={() => setPreviewImage(null)}
        >
          <div className="lightbox-content">
            <img src={previewImage} alt="Full view" />
            <button
              type="button"
              className="btn-close-lightbox"
              onClick={() => setPreviewImage(null)}
            >
              <X size={20} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
