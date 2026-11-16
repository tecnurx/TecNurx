// src/components/chatbox/Chatbox.jsx
"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import {
  MessageSquare,
  ArrowRight,
  X,
  Minimize2,
  Maximize2,
  Paperclip,
  ChevronLeft,
  Plus,
  Clock,
  CheckCircle2,
  RotateCcw,
  Image as ImageIcon,
  ShieldCheck,
  Send,
  Loader2,
  Bot,
  HelpCircle,
} from "lucide-react";
import { supportService } from "../../../services/supportService";
import { repairService } from "../../../services/repairs";
import ConfirmModal from "@/components/ConfirmModal";
import { playNotificationSound } from "@/lib/soundUtils";
import { toast } from "@/components/CustomToast";
import TecNurxLoader from "@/components/TecNurxLoader";
import "./chatbox.css";

/* =========================================================================
   NOTE: Static Assistant Demo Version has been commented out and preserved
   in src/components/chatbox/ChatboxStaticAssistant.jsx
   ========================================================================= */

const MAX_ATTACHMENTS = 3;
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

const CATEGORY_LABELS = {
  repair: "Repair",
  payment: "Payment",
  device: "Device",
  account: "Account",
  engineer: "Engineer",
  other: "General",
};

export default function Chatbox({
  isInline = false,
  defaultView = "list",
  initialTicketId = null,
}) {
  const [isOpen, setIsOpen] = useState(isInline ? true : false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [view, setView] = useState(defaultView); // "list" | "detail" | "new"
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [activeRepair, setActiveRepair] = useState(null);

  // Tickets state
  const [tickets, setTickets] = useState([]);
  const [activeTicket, setActiveTicket] = useState(null);
  const [messages, setMessages] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [categories, setCategories] = useState([
    "repair",
    "payment",
    "device",
    "account",
    "other",
  ]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // New ticket form state
  const [newCategory, setNewCategory] = useState("repair");
  const [newSubject, setNewSubject] = useState("");
  const [newMessage, setNewMessage] = useState("");
  const [newRepairId, setNewRepairId] = useState("");
  const [newAttachments, setNewAttachments] = useState([]);
  const [submittingTicket, setSubmittingTicket] = useState(false);

  // Active chat reply state
  const [replyMessage, setReplyMessage] = useState("");
  const [replyAttachments, setReplyAttachments] = useState([]);
  const [sendingReply, setSendingReply] = useState(false);

  // Typing state
  const [typingUser, setTypingUser] = useState(null);
  const typingTimeoutRef = useRef(null);

  // Lightbox preview image modal
  const [previewImage, setPreviewImage] = useState(null);

  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const replyFileInputRef = useRef(null);

  // Custom Modal dialog state
  const [modalConfig, setModalConfig] = useState({
    isOpen: false,
    title: "",
    message: "",
    type: "warning",
    confirmText: "Got it",
    cancelText: "Cancel",
    showCancel: false,
    onConfirm: () => {},
  });

  const showAlertModal = (title, message, type = "warning") => {
    setModalConfig({
      isOpen: true,
      title,
      message,
      type,
      confirmText: "Got it",
      cancelText: "Cancel",
      showCancel: false,
      onConfirm: () => setModalConfig((prev) => ({ ...prev, isOpen: false })),
    });
  };

  const showConfirmModal = (
    title,
    message,
    onConfirmAction,
    type = "warning",
    confirmText = "Confirm"
  ) => {
    setModalConfig({
      isOpen: true,
      title,
      message,
      type,
      confirmText,
      cancelText: "Cancel",
      showCancel: true,
      onConfirm: () => {
        setModalConfig((prev) => ({ ...prev, isOpen: false }));
        onConfirmAction();
      },
    });
  };

  // Check login status & load active repair context on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const token =
        localStorage.getItem("token") || localStorage.getItem("staff_token");
      const userJson =
        localStorage.getItem("user") || localStorage.getItem("staff");
      if (token) {
        setIsLoggedIn(true);
        if (userJson) {
          try {
            setCurrentUser(JSON.parse(userJson));
          } catch (e) {
            console.error(e);
          }
        }
      }
    }

    const fetchActiveRepair = async () => {
      try {
        const res = await repairService.getUserRepairs();
        const list = res?.data?.repairs || res?.repairs || [];
        if (list && list.length > 0) {
          const active =
            list.find(
              (r) =>
                r.status !== "completed" &&
                r.status !== "cancelled" &&
                r.status !== "delivered"
            ) || list[0];
          setActiveRepair(active);
        }
      } catch (err) {
        console.warn("Could not fetch active repair for Chatbox context:", err);
      }
    };

    fetchActiveRepair();
  }, []);

  // Initialize Socket and listeners
  useEffect(() => {
    if (!isLoggedIn) return;

    const token =
      localStorage.getItem("token") || localStorage.getItem("staff_token");
    const socket = supportService.initSocket(token);

    if (!socket) return;

    const handleTicketNew = ({ ticket }) => {
      if (!ticket) return;
      setTickets((prev) => {
        const exists = prev.some(
          (t) => (t._id || t.id) === (ticket._id || ticket.id)
        );
        return exists ? prev : [ticket, ...prev];
      });
    };

    const handleTicketUpdated = ({ ticket }) => {
      if (!ticket) return;
      const tid = ticket._id || ticket.id;
      setTickets((prev) =>
        prev.map((t) => ((t._id || t.id) === tid ? { ...t, ...ticket } : t))
      );
      if (activeTicket && (activeTicket._id || activeTicket.id) === tid) {
        setActiveTicket((prev) => ({ ...prev, ...ticket }));
      }
    };

    const handleMessageNew = ({ ticketId, message }) => {
      if (!message) return;
      const isFromStaff =
        message.senderType === "staff" || message.senderType === "system";

      const isCurrentActive =
        isOpen &&
        view === "detail" &&
        activeTicket &&
        (activeTicket._id || activeTicket.id) === ticketId;

      if (isCurrentActive) {
        setMessages((prev) => {
          const mid = message._id || message.id;
          const exists = prev.some((m) => (m._id || m.id) === mid);
          return exists ? prev : [...prev, message];
        });
      } else if (isFromStaff) {
        setUnreadCount((prev) => prev + 1);
        playNotificationSound();
        const snippet =
          message.text ||
          message.message ||
          message.content ||
          "New message from TecNurx Support";
        toast.info(
          `TecNurx Support: "${snippet.slice(0, 45)}${
            snippet.length > 45 ? "..." : ""
          }"`
        );
      }

      setTickets((prev) =>
        prev.map((t) => {
          if ((t._id || t.id) === ticketId) {
            return {
              ...t,
              latestMessage: message,
              updatedAt: new Date().toISOString(),
              status: message.senderType === "staff" ? "pending" : t.status,
            };
          }
          return t;
        })
      );
    };

    const handleTyping = ({ ticketId, senderType, name, isTyping }) => {
      if (activeTicket && (activeTicket._id || activeTicket.id) === ticketId) {
        if (isTyping && senderType === "staff") {
          setTypingUser(name || "Support Agent");
          if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
          typingTimeoutRef.current = setTimeout(() => {
            setTypingUser(null);
          }, 3000);
        } else {
          setTypingUser(null);
        }
      }
    };

    socket.on("support:ticket:new", handleTicketNew);
    socket.on("support:ticket:updated", handleTicketUpdated);
    socket.on("support:message:new", handleMessageNew);
    socket.on("support:typing", handleTyping);

    return () => {
      socket.off("support:ticket:new", handleTicketNew);
      socket.off("support:ticket:updated", handleTicketUpdated);
      socket.off("support:message:new", handleMessageNew);
      socket.off("support:typing", handleTyping);
    };
  }, [isLoggedIn, activeTicket, isOpen, view]);

  // Scroll to bottom of message thread
  useEffect(() => {
    if (view === "detail" && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, view, typingUser]);

  // Fetch categories and user tickets
  const loadInitialData = useCallback(async () => {
    if (!isLoggedIn) return;
    try {
      setLoading(true);
      setError(null);
      const [cats, tix] = await Promise.all([
        supportService.getCategories().catch(() => []),
        supportService.getMyTickets().catch(() => []),
      ]);
      const defaultCategories = [
        "repair",
        "payment",
        "device",
        "account",
        "other",
      ];
      const validCategories =
        Array.isArray(cats) && cats.length > 0 ? cats : defaultCategories;
      setCategories(validCategories);

      const ticketList = Array.isArray(tix) ? tix : [];
      setTickets(ticketList);

      const pendingResponseCount = ticketList.filter(
        (t) =>
          (t.status || "").toLowerCase() === "pending" ||
          t.lastMessageBy === "staff"
      ).length;
      setUnreadCount(pendingResponseCount);

      if (initialTicketId) {
        const found = ticketList.find(
          (t) => (t._id || t.id) === initialTicketId
        );
        if (found) {
          handleOpenTicket(found);
        }
      }
    } catch (err) {
      console.error("Support chat load error:", err);
      setError("Unable to load support tickets. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [isLoggedIn, initialTicketId]);

  useEffect(() => {
    if (isLoggedIn) {
      loadInitialData();
    }
  }, [isLoggedIn, isOpen, loadInitialData]);

  // Open ticket detail
  const handleOpenTicket = async (ticket) => {
    setUnreadCount((prev) => Math.max(0, prev - 1));
    const tid = ticket._id || ticket.id;
    try {
      setLoading(true);
      setError(null);
      setActiveTicket(ticket);
      setView("detail");

      supportService.joinTicket(tid);

      const details = await supportService.getTicketDetails(tid);
      const ticketObj = details?.ticket || details || ticket;
      const msgList =
        (Array.isArray(details?.messages) && details.messages) ||
        (Array.isArray(ticketObj?.messages) && ticketObj.messages) ||
        [];
      setActiveTicket(ticketObj);
      setMessages(msgList);
    } catch (err) {
      console.error("Failed to load ticket details:", err);
      setError("Could not load ticket messages.");
    } finally {
      setLoading(false);
    }
  };

  // Back to tickets list
  const handleBackToList = () => {
    if (activeTicket) {
      supportService.leaveTicket(activeTicket._id || activeTicket.id);
    }
    setActiveTicket(null);
    setMessages([]);
    setView("list");
    loadInitialData();
  };

  // Open New Ticket View
  const handleStartNewTicket = () => {
    const nonClosedCount = tickets.filter(
      (t) => (t.status || "").toLowerCase() !== "closed"
    ).length;

    if (nonClosedCount >= 2) {
      showAlertModal(
        "Ticket Limit Reached",
        "You currently have 2 active tickets. Please resolve or close an existing ticket before opening a new one.",
        "warning"
      );
      return;
    }

    setError(null);
    setNewCategory("repair");
    setNewSubject("");
    setNewMessage("");
    setNewRepairId(
      activeRepair?.orderId || activeRepair?._id?.slice(-8).toUpperCase() || ""
    );
    setNewAttachments([]);
    setView("new");
  };

  // Handle files selection for new ticket
  const handleNewFilesSelect = (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    if (newAttachments.length + files.length > MAX_ATTACHMENTS) {
      showAlertModal(
        "Attachment Limit",
        `You can attach up to ${MAX_ATTACHMENTS} images in total.`,
        "warning"
      );
      return;
    }

    const validFiles = files.filter((f) => {
      if (!f.type.startsWith("image/")) {
        showAlertModal(
          "Invalid File",
          `"${f.name}" is not an image file (JPEG, PNG, WEBP only).`,
          "danger"
        );
        return false;
      }
      if (f.size > MAX_FILE_SIZE) {
        showAlertModal(
          "File Too Large",
          `"${f.name}" exceeds the 5MB file size limit.`,
          "danger"
        );
        return false;
      }
      return true;
    });

    setNewAttachments((prev) => [...prev, ...validFiles]);
  };

  // Handle file selection for reply
  const handleReplyFilesSelect = (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    if (replyAttachments.length + files.length > MAX_ATTACHMENTS) {
      showAlertModal(
        "Attachment Limit",
        `You can attach up to ${MAX_ATTACHMENTS} images in total.`,
        "warning"
      );
      return;
    }

    const validFiles = files.filter((f) => {
      if (!f.type.startsWith("image/")) {
        showAlertModal(
          "Invalid File",
          `"${f.name}" is not an image file (JPEG, PNG, WEBP only).`,
          "danger"
        );
        return false;
      }
      if (f.size > MAX_FILE_SIZE) {
        showAlertModal(
          "File Too Large",
          `"${f.name}" exceeds the 5MB file size limit.`,
          "danger"
        );
        return false;
      }
      return true;
    });

    setReplyAttachments((prev) => [...prev, ...validFiles]);
  };

  // Submit new ticket
  const handleCreateTicketSubmit = async (e) => {
    e.preventDefault();
    if (!newSubject.trim() || !newMessage.trim()) {
      showAlertModal(
        "Missing Fields",
        "Please provide both a subject and details for your ticket.",
        "warning"
      );
      return;
    }

    setSubmittingTicket(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("category", newCategory);
      formData.append("subject", newSubject.trim());
      formData.append("message", newMessage.trim());
      if (newRepairId.trim()) {
        formData.append("repairId", newRepairId.trim());
      }
      newAttachments.forEach((file) => {
        formData.append("attachments", file);
      });

      const response = await supportService.createTicket(formData);
      const createdTicket = response?.ticket || response?.data || response;

      toast.success("Support ticket opened successfully!");
      if (createdTicket && (createdTicket._id || createdTicket.id)) {
        await handleOpenTicket(createdTicket);
      } else {
        handleBackToList();
      }
    } catch (err) {
      console.error("Create ticket error:", err);
      const msg =
        err.response?.data?.message ||
        err.message ||
        "Failed to open support ticket. Please try again.";
      showAlertModal("Ticket Creation Failed", msg, "danger");
    } finally {
      setSubmittingTicket(false);
    }
  };

  // Reply to active ticket
  const handleSendReply = async (e) => {
    e.preventDefault();
    if (!replyMessage.trim() && replyAttachments.length === 0) return;
    if (!activeTicket) return;

    const tid = activeTicket._id || activeTicket.id;
    setSendingReply(true);

    try {
      const formData = new FormData();
      if (replyMessage.trim()) {
        formData.append("text", replyMessage.trim());
      }
      replyAttachments.forEach((f) => {
        formData.append("attachments", f);
      });

      const res = await supportService.replyTicket(tid, formData);
      const newMsg = res?.message || res?.data || res;

      if (newMsg && (newMsg._id || newMsg.id || newMsg.text || newMsg.message)) {
        setMessages((prev) => {
          const mid = newMsg._id || newMsg.id;
          const exists = prev.some((m) => (m._id || m.id) === mid);
          return exists ? prev : [...prev, newMsg];
        });
      }

      setReplyMessage("");
      setReplyAttachments([]);

      supportService.emitTyping({ ticketId: tid, isTyping: false });
    } catch (err) {
      console.error("Failed to send reply:", err);
      toast.error(
        err.response?.data?.message ||
          "Failed to send message. Please try again."
      );
    } finally {
      setSendingReply(false);
    }
  };

  // Close / Resolve active ticket
  const handleCloseActiveTicket = () => {
    if (!activeTicket) return;
    const tid = activeTicket._id || activeTicket.id;

    showConfirmModal(
      "Resolve Support Ticket",
      "Are you sure you want to mark this support ticket as resolved? You can reopen it within 7 days if you still need help.",
      async () => {
        try {
          await supportService.closeTicket(tid);
          setActiveTicket((prev) => ({ ...prev, status: "closed" }));
          setTickets((prev) =>
            prev.map((t) =>
              (t._id || t.id) === tid ? { ...t, status: "closed" } : t
            )
          );
          toast.success("Support ticket marked as resolved.");
        } catch (err) {
          toast.error("Failed to resolve ticket.");
        }
      },
      "warning",
      "Resolve Ticket"
    );
  };

  // Reopen active ticket
  const handleReopenActiveTicket = () => {
    if (!activeTicket) return;
    const tid = activeTicket._id || activeTicket.id;

    showConfirmModal(
      "Reopen Support Ticket",
      "Would you like to reopen this ticket to continue discussing with support?",
      async () => {
        try {
          await supportService.reopenTicket(tid);
          setActiveTicket((prev) => ({ ...prev, status: "open" }));
          setTickets((prev) =>
            prev.map((t) =>
              (t._id || t.id) === tid ? { ...t, status: "open" } : t
            )
          );
          toast.success("Support ticket reopened.");
        } catch (err) {
          toast.error("Failed to reopen ticket.");
        }
      },
      "warning",
      "Reopen Ticket"
    );
  };

  const repairOrderId =
    activeRepair?.orderId ||
    (activeRepair?._id ? activeRepair._id.slice(-8).toUpperCase() : null) ||
    "3EA19933";

  const contextLabel = activeTicket
    ? activeTicket.repairId?.orderId
      ? `Repair #${activeTicket.repairId.orderId}`
      : `Ticket #${(
          activeTicket.ticketId ||
          activeTicket._id ||
          activeTicket.id ||
          ""
        )
          .slice(-8)
          .toUpperCase()}`
    : `Repair #${repairOrderId}`;

  const activeCount = tickets.filter(
    (t) => (t.status || "").toLowerCase() !== "closed"
  ).length;

  return (
    <>
      {/* Floating launcher button when not inline */}
      {!isInline && (
        <button
          type="button"
          className={`tnx-chat-bubble-btn tnx-launcher ${
            isOpen ? "is-open" : ""
          }`}
          onClick={() => setIsOpen((prev) => !prev)}
          aria-label={
            isOpen ? "Close TecNurx Assistant" : "Open TecNurx Assistant"
          }
        >
          <div className="tnx-launcher-icon">
            <MessageSquare size={22} color="#ffffff" />
          </div>
          {unreadCount > 0 && !isOpen && (
            <span className="tnx-launcher-badge">{unreadCount}</span>
          )}
        </button>
      )}

      {/* Main Assistant Card */}
      {(isOpen || isInline) && (
        <div
          className={`tnx-assistant-card ${
            isInline ? "is-inline" : "is-floating"
          } ${isMinimized && !isInline ? "is-minimized" : ""}`}
        >
          {/* Header Controls for floating mode */}
          {!isInline && (
            <div className="tnx-floating-controls">
              <button
                type="button"
                onClick={() => setIsMinimized((prev) => !prev)}
                className="tnx-floating-btn"
                title={isMinimized ? "Expand" : "Minimize"}
                aria-label={isMinimized ? "Expand" : "Minimize"}
              >
                {isMinimized ? (
                  <Maximize2 size={16} />
                ) : (
                  <Minimize2 size={16} />
                )}
              </button>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="tnx-floating-btn"
                title="Close chat"
                aria-label="Close"
              >
                <X size={17} />
              </button>
            </div>
          )}

          {!isMinimized && (
            <>
              {/* Header Matching Designer Mockup */}
              <div className="tnx-assistant-header">
                <div className="tnx-header-top-row">
                  <div className="tnx-assistant-icon-box">
                    <MessageSquare
                      size={18}
                      color="#111827"
                      strokeWidth={2}
                    />
                  </div>
                  {view !== "list" && (
                    <button
                      type="button"
                      onClick={handleBackToList}
                      className="tnx-btn-header-back-chip"
                    >
                      <ChevronLeft size={16} />
                      <span>All Tickets</span>
                    </button>
                  )}
                </div>

                <h2 className="tnx-assistant-title">
                  {view === "detail" && activeTicket
                    ? activeTicket.subject || "Support Discussion"
                    : view === "new"
                    ? "New Support Request"
                    : "TecNurx Assistant"}
                </h2>

                <p className="tnx-assistant-subtitle">
                  {view === "detail" && activeTicket ? (
                    <span
                      className={`tnx-ticket-status-tag ${
                        (activeTicket.status || "").toLowerCase() === "closed"
                          ? "closed"
                          : "open"
                      }`}
                    >
                      ●{" "}
                      {(activeTicket.status || "").toLowerCase() === "closed"
                        ? "Resolved"
                        : "In Progress"}
                    </span>
                  ) : (
                    "Ask about your repairs, payments and protection."
                  )}
                </p>

                <div className="tnx-assistant-context-row">
                  <span className="tnx-context-label">Asking about</span>
                  <span className="tnx-context-pill">
                    <span className="tnx-context-dot">●</span>
                    <span>{contextLabel}</span>
                  </span>
                </div>
              </div>

              {/* BODY CONTAINER */}
              {!isLoggedIn ? (
                /* Auth required state */
                <div className="tnx-auth-state-box">
                  <ShieldCheck size={36} color="#ffb800" />
                  <h3>Sign in to TecNurx</h3>
                  <p>
                    Please sign in to chat with our support technicians and track
                    your orders.
                  </p>
                  <Link href="/login" className="tnx-btn-auth-link">
                    Sign In
                  </Link>
                </div>
              ) : view === "detail" ? (
                /* =================== VIEW 1: LIVE TICKET CONVERSATION =================== */
                <div className="tnx-view-conversation">
                  {/* Messages Stream */}
                  <div className="tnx-assistant-chat-stream">
                    {loading && messages.length === 0 ? (
                      <div className="tnx-stream-loader">
                        <TecNurxLoader size="sm" />
                      </div>
                    ) : messages.length === 0 ? (
                      <div className="tnx-empty-stream-box">
                        <Bot size={28} color="#9ca3af" />
                        <p>Ticket opened. Feel free to type your message below!</p>
                      </div>
                    ) : (
                      messages.map((msg, index) => {
                        const isMe =
                          msg.senderType === "user" ||
                          msg.senderType === "customer";
                        const isSystem = msg.senderType === "system";
                        const text =
                          msg.text || msg.message || msg.content || "";
                        const time = msg.createdAt
                          ? new Date(msg.createdAt).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })
                          : "";
                        const attachs = msg.attachments || [];

                        // Skip completely empty items
                        if (!text && attachs.length === 0 && !isSystem) {
                          return null;
                        }

                        if (isSystem) {
                          return (
                            <div
                              key={msg._id || msg.id || index}
                              className="tnx-bubble-system-box"
                            >
                              <span className="tnx-system-title">Notice</span>
                              <p>{text}</p>
                              {time && <small>{time}</small>}
                            </div>
                          );
                        }

                        return (
                          <div
                            key={msg._id || msg.id || index}
                            className={`tnx-bubble ${
                              isMe ? "tnx-bubble-user" : "tnx-bubble-assistant"
                            }`}
                          >
                            <div className="tnx-bubble-text">{text}</div>

                            {attachs.length > 0 && (
                              <div className="tnx-bubble-attachments-row">
                                {attachs.map((att, aIdx) => {
                                  const src =
                                    typeof att === "string"
                                      ? att
                                      : att.url || att.path;
                                  return (
                                    <img
                                      key={aIdx}
                                      src={src}
                                      alt="attachment"
                                      className="tnx-bubble-thumb-img"
                                      onClick={() => setPreviewImage(src)}
                                    />
                                  );
                                })}
                              </div>
                            )}

                            {time && (
                              <div className="tnx-bubble-timestamp">{time}</div>
                            )}
                          </div>
                        );
                      })
                    )}

                    {typingUser && (
                      <div className="tnx-bubble tnx-bubble-assistant tnx-bubble-typing">
                        <span className="tnx-typing-dot"></span>
                        <span className="tnx-typing-dot"></span>
                        <span className="tnx-typing-dot"></span>
                        <small className="tnx-typing-label">
                          {typingUser} is typing...
                        </small>
                      </div>
                    )}

                    <div ref={messagesEndRef} />
                  </div>

                  {/* Attachment previews before sending */}
                  {replyAttachments.length > 0 && (
                    <div className="tnx-pending-attachments-strip">
                      {replyAttachments.map((f, i) => (
                        <div key={i} className="tnx-pending-thumb-card">
                          <img
                            src={URL.createObjectURL(f)}
                            alt={f.name}
                            className="tnx-pending-thumb-img"
                          />
                          <button
                            type="button"
                            onClick={() =>
                              setReplyAttachments((prev) =>
                                prev.filter((_, idx) => idx !== i)
                              )
                            }
                            className="tnx-pending-thumb-remove"
                            aria-label="Remove photo"
                          >
                            <X size={12} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Live Input Bar or Resolved Notice */}
                  {(activeTicket?.status || "").toLowerCase() === "closed" ? (
                    <div className="tnx-resolved-banner-box">
                      <p>This support ticket is marked as resolved.</p>
                      <button
                        type="button"
                        onClick={handleReopenActiveTicket}
                        className="tnx-btn-reopen-pill"
                      >
                        <RotateCcw size={13} /> Reopen Ticket (Within 7 Days)
                      </button>
                    </div>
                  ) : (
                    <form
                      className="tnx-assistant-input-form"
                      onSubmit={handleSendReply}
                    >
                      <input
                        type="file"
                        ref={replyFileInputRef}
                        onChange={handleReplyFilesSelect}
                        multiple
                        accept="image/jpeg,image/png,image/webp"
                        style={{ display: "none" }}
                      />

                      <div className="tnx-assistant-input-wrap">
                        <button
                          type="button"
                          onClick={() => replyFileInputRef.current?.click()}
                          className="tnx-paperclip-btn"
                          title="Attach photo (up to 3)"
                          disabled={
                            replyAttachments.length >= MAX_ATTACHMENTS ||
                            sendingReply
                          }
                          aria-label="Attach photo"
                        >
                          <Paperclip size={18} color="#64748b" />
                        </button>

                        <input
                          type="text"
                          className="tnx-assistant-input-field"
                          placeholder="Type your message..."
                          value={replyMessage}
                          onChange={(e) => {
                            setReplyMessage(e.target.value);
                            if (activeTicket) {
                              supportService.emitTyping({
                                ticketId: activeTicket._id || activeTicket.id,
                                isTyping: Boolean(e.target.value.trim()),
                              });
                            }
                          }}
                          disabled={sendingReply}
                        />

                        <button
                          type="submit"
                          className="tnx-assistant-send-btn"
                          disabled={
                            (!replyMessage.trim() &&
                              replyAttachments.length === 0) ||
                            sendingReply
                          }
                          aria-label="Send message"
                        >
                          {sendingReply ? (
                            <Loader2
                              size={18}
                              className="tnx-spinner-icon"
                              color="#111827"
                            />
                          ) : (
                            <ArrowRight
                              size={18}
                              color="#111827"
                              strokeWidth={2.4}
                            />
                          )}
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              ) : view === "new" ? (
                /* =================== VIEW 2: NEW SUPPORT TICKET =================== */
                <form
                  className="tnx-new-ticket-form"
                  onSubmit={handleCreateTicketSubmit}
                >
                  <div className="tnx-form-field">
                    <label className="tnx-form-label">Category</label>
                    <div className="tnx-categories-pills-row">
                      {categories.map((cat) => {
                        const val =
                          typeof cat === "string"
                            ? cat
                            : cat?.id || cat?.slug || cat?.name;
                        const isSelected = newCategory === val;
                        return (
                          <button
                            key={val}
                            type="button"
                            onClick={() => setNewCategory(val)}
                            className={`tnx-category-pill ${
                              isSelected ? "active" : ""
                            }`}
                          >
                            {CATEGORY_LABELS[val] || val}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="tnx-form-field">
                    <label className="tnx-form-label">Subject</label>
                    <input
                      type="text"
                      className="tnx-form-input"
                      placeholder="e.g. Question about my repair"
                      value={newSubject}
                      onChange={(e) => setNewSubject(e.target.value)}
                      required
                    />
                  </div>

                  <div className="tnx-form-field">
                    <label className="tnx-form-label">Message Details</label>
                    <textarea
                      rows={3}
                      className="tnx-form-textarea"
                      placeholder="Explain what you need assistance with..."
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      required
                    />
                  </div>

                  {/* Photo Attachments */}
                  <div className="tnx-form-field">
                    <div className="tnx-form-label-row">
                      <label className="tnx-form-label">Photo Attachments</label>
                      <span className="tnx-form-hint">Up to 3 images</span>
                    </div>

                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleNewFilesSelect}
                      multiple
                      accept="image/jpeg,image/png,image/webp"
                      style={{ display: "none" }}
                    />

                    <div className="tnx-thumbs-row">
                      {newAttachments.map((f, idx) => (
                        <div key={idx} className="tnx-pending-thumb-card">
                          <img
                            src={URL.createObjectURL(f)}
                            alt={f.name}
                            className="tnx-pending-thumb-img"
                          />
                          <button
                            type="button"
                            onClick={() =>
                              setNewAttachments((prev) =>
                                prev.filter((_, i) => i !== idx)
                              )
                            }
                            className="tnx-pending-thumb-remove"
                            aria-label="Remove image"
                          >
                            <X size={12} />
                          </button>
                        </div>
                      ))}

                      {newAttachments.length < MAX_ATTACHMENTS && (
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="tnx-add-photo-btn"
                        >
                          <ImageIcon size={16} />
                          <span>Attach Photo</span>
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="tnx-new-actions-row">
                    <button
                      type="button"
                      onClick={handleBackToList}
                      className="tnx-btn-cancel-flat"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={submittingTicket}
                      className="tnx-btn-submit-yellow"
                    >
                      {submittingTicket ? "Submitting..." : "Send Ticket"}
                    </button>
                  </div>
                </form>
              ) : (
                /* =================== VIEW 3: TICKETS LIST / HOME =================== */
                <div className="tnx-view-ticket-list">
                  <div className="tnx-ticket-list-header">
                    <span className="tnx-list-heading">Recent Conversations</span>
                    <button
                      type="button"
                      onClick={handleStartNewTicket}
                      disabled={activeCount >= 2}
                      className="tnx-btn-create-ticket-pill"
                    >
                      <Plus size={15} />
                      <span>New Ticket</span>
                    </button>
                  </div>

                  {error && <div className="tnx-error-box">{error}</div>}

                  <div className="tnx-ticket-cards-scroll">
                    {loading ? (
                      <div className="tnx-stream-loader">
                        <TecNurxLoader size="sm" />
                      </div>
                    ) : tickets.length === 0 ? (
                      <div className="tnx-no-tickets-box">
                        <MessageSquare size={32} color="#9ca3af" />
                        <h4>No conversations yet</h4>
                        <p>
                          Click &ldquo;New Ticket&rdquo; above to start a live
                          conversation with our customer care team.
                        </p>
                      </div>
                    ) : (
                      tickets.map((t) => {
                        const isClosed =
                          (t.status || "").toLowerCase() === "closed";
                        const isPending =
                          (t.status || "").toLowerCase() === "pending";
                        const snippet =
                          t.latestMessage?.text ||
                          t.latestMessage?.message ||
                          t.message ||
                          "Click to view conversation...";
                        const dateStr = t.updatedAt
                          ? new Date(t.updatedAt).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                            })
                          : "";

                        return (
                          <div
                            key={t._id || t.id}
                            className="tnx-ticket-item-card"
                            onClick={() => handleOpenTicket(t)}
                          >
                            <div className="tnx-ticket-item-top">
                              <span className="tnx-ticket-category-tag">
                                {CATEGORY_LABELS[t.category] ||
                                  t.category ||
                                  "General"}
                              </span>
                              <span
                                className={`tnx-ticket-status-pill ${
                                  isClosed ? "closed" : "open"
                                }`}
                              >
                                ● {isClosed ? "Resolved" : "Open"}
                              </span>
                            </div>

                            <h4 className="tnx-ticket-item-subject">
                              {t.subject || "Support Inquiry"}
                            </h4>

                            <p className="tnx-ticket-item-snippet">{snippet}</p>

                            {dateStr && (
                              <span className="tnx-ticket-item-date">
                                Updated {dateStr}
                              </span>
                            )}
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              )}

              {/* Disclaimer Footnote */}
              <p className="tnx-assistant-disclaimer">
                The assistant can make mistakes. For payments or claim decisions,
                talk to our team.
              </p>
            </>
          )}
        </div>
      )}

      {/* Lightbox Modal */}
      {previewImage && (
        <div
          className="tnx-lightbox-wrap"
          onClick={() => setPreviewImage(null)}
        >
          <div className="tnx-lightbox-inner">
            <img src={previewImage} alt="Preview" className="tnx-lightbox-img" />
            <button
              type="button"
              className="tnx-lightbox-close"
              onClick={() => setPreviewImage(null)}
            >
              <X size={20} />
            </button>
          </div>
        </div>
      )}

      {/* Confirmation Dialog Modal */}
      <ConfirmModal
        isOpen={modalConfig.isOpen}
        title={modalConfig.title}
        message={modalConfig.message}
        type={modalConfig.type}
        confirmText={modalConfig.confirmText}
        cancelText={modalConfig.cancelText}
        showCancel={modalConfig.showCancel}
        onConfirm={modalConfig.onConfirm}
        onCancel={() => setModalConfig((prev) => ({ ...prev, isOpen: false }))}
      />
    </>
  );
}
