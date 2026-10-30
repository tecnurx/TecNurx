// src/components/chatbox/Chatbox.jsx
"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  MessageCircle,
  X,
  Send,
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
  Headphones,
  Sparkles,
  ArrowRight,
  Wrench,
  CreditCard,
  Smartphone,
  User,
  HelpCircle,
  Bot,
  ExternalLink,
} from "lucide-react";
import { supportService } from "../../../services/supportService";
import ConfirmModal from "@/components/ConfirmModal";
import { playNotificationSound } from "@/lib/soundUtils";
import { toast } from "@/components/CustomToast";
import "./chatbox.css";

const MAX_ATTACHMENTS = 3;
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

const CATEGORY_ICONS = {
  account: <User size={13} />,
  repair: <Wrench size={13} />,
  payment: <CreditCard size={13} />,
  device: <Smartphone size={13} />,
  engineer: <ShieldCheck size={13} />,
  other: <HelpCircle size={13} />,
};

export default function Chatbox() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [view, setView] = useState("list"); // "list" | "detail" | "new"
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  // Tickets state
  const [tickets, setTickets] = useState([]);
  const [activeTicket, setActiveTicket] = useState(null);
  const [messages, setMessages] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [categories, setCategories] = useState([
    "account",
    "repair",
    "payment",
    "device",
    "engineer",
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

  // Lightbox / preview image modal
  const [previewImage, setPreviewImage] = useState(null);

  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const replyFileInputRef = useRef(null);

  // Custom Modal dialog state (replacing native alert & confirm)
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

  // Check login status on mount
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
        // Customer is not viewing this conversation -> notify & increment badge
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

  // Fetch categories and user tickets when opening chat
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
        "account",
        "repair",
        "payment",
        "device",
        "engineer",
        "other",
      ];
      const validCategories =
        Array.isArray(cats) && cats.length > 0 ? cats : defaultCategories;
      setCategories(validCategories);

      const ticketList = Array.isArray(tix) ? tix : [];
      setTickets(ticketList);

      // Compute initial unread tickets waiting on user response
      const pendingResponseCount = ticketList.filter(
        (t) =>
          (t.status || "").toLowerCase() === "pending" ||
          t.lastMessageBy === "staff"
      ).length;
      setUnreadCount(pendingResponseCount);
    } catch (err) {
      console.error("Support chat load error:", err);
      setError("Unable to load support tickets. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [isLoggedIn]);

  // Load tickets on mount to display badge, and re-fetch when opened
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
    const firstCat = categories[0];
    const defaultCat =
      typeof firstCat === "string"
        ? firstCat
        : firstCat?.id || firstCat?.slug || firstCat?.name || "account";
    setNewCategory(defaultCat);
    setNewSubject("");
    setNewMessage("");
    setNewRepairId("");
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
        "Missing Information",
        "Please provide both a subject and initial message for your ticket.",
        "warning"
      );
      return;
    }

    try {
      setSubmittingTicket(true);
      setError(null);
      const created = await supportService.createTicket({
        category: newCategory || "general",
        subject: newSubject.trim(),
        message: newMessage.trim(),
        repairId: newRepairId ? newRepairId.trim() : undefined,
        attachments: newAttachments,
      });

      const newTix = created?.ticket || created;
      if (newTix) {
        setTickets((prev) => [newTix, ...prev]);
        handleOpenTicket(newTix);
      } else {
        handleBackToList();
      }
    } catch (err) {
      console.error("Create ticket error:", err);
      const msg =
        err.response?.data?.message ||
        err.response?.data?.error?.message ||
        "Failed to create support ticket. Please try again.";
      setError(msg);
    } finally {
      setSubmittingTicket(false);
    }
  };

  // Typing indicator trigger on reply input
  const handleReplyInputChange = (e) => {
    setReplyMessage(e.target.value);
    if (!activeTicket) return;

    const tid = activeTicket._id || activeTicket.id;
    supportService.sendTyping(tid, true);

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      supportService.sendTyping(tid, false);
    }, 1500);
  };

  // Send message on active ticket
  const handleSendReply = async (e) => {
    e.preventDefault();
    if (!replyMessage.trim() && replyAttachments.length === 0) return;
    if (!activeTicket) return;

    const tid = activeTicket._id || activeTicket.id;
    try {
      setSendingReply(true);
      supportService.sendTyping(tid, false);

      const res = await supportService.sendMessage(tid, {
        text: replyMessage.trim(),
        message: replyMessage.trim(),
        attachments: replyAttachments,
      });

      const savedMsg = res?.message || res?.data || res;
      if (savedMsg && (savedMsg.text || savedMsg.message || savedMsg.content)) {
        setMessages((prev) => {
          const mid = savedMsg._id || savedMsg.id;
          return prev.some((m) => (m._id || m.id) === mid)
            ? prev
            : [...prev, savedMsg];
        });
      }

      setReplyMessage("");
      setReplyAttachments([]);
      if (replyFileInputRef.current) replyFileInputRef.current.value = "";
    } catch (err) {
      console.error("Failed to send message:", err);
      showAlertModal(
        "Delivery Failed",
        "Failed to send message. Please retry.",
        "danger"
      );
    } finally {
      setSendingReply(false);
    }
  };

  // Close ticket
  const handleCloseActiveTicket = () => {
    if (!activeTicket) return;
    showConfirmModal(
      "Close Support Ticket",
      "Are you sure you want to resolve this ticket? You can reopen it within 7 days if needed.",
      async () => {
        const tid = activeTicket._id || activeTicket.id;
        try {
          setLoading(true);
          const updated = await supportService.closeTicket(tid);
          const ticketObj =
            updated?.ticket || updated || { ...activeTicket, status: "closed" };
          setActiveTicket(ticketObj);
          setTickets((prev) =>
            prev.map((t) =>
              (t._id || t.id) === tid ? { ...t, status: "closed" } : t
            )
          );
        } catch (err) {
          console.error("Close ticket error:", err);
          showAlertModal(
            "Error",
            "Failed to close ticket. Please try again.",
            "danger"
          );
        } finally {
          setLoading(false);
        }
      },
      "warning",
      "Resolve Ticket"
    );
  };

  // Reopen ticket
  const handleReopenActiveTicket = async () => {
    if (!activeTicket) return;
    const tid = activeTicket._id || activeTicket.id;
    try {
      setLoading(true);
      const updated = await supportService.reopenTicket(tid);
      const ticketObj =
        updated?.ticket || updated || { ...activeTicket, status: "open" };
      setActiveTicket(ticketObj);
      setTickets((prev) =>
        prev.map((t) =>
          (t._id || t.id) === tid ? { ...t, status: "open" } : t
        )
      );
    } catch (err) {
      console.error("Reopen ticket error:", err);
      const msg =
        err.response?.data?.message ||
        "Could not reopen ticket (may have expired 7-day window).";
      showAlertModal("Reopen Ticket", msg, "danger");
    } finally {
      setLoading(false);
    }
  };

  const activeCount = tickets.filter(
    (t) => (t.status || "").toLowerCase() !== "closed"
  ).length;

  return (
    <>
      {/* ===================== FLOATING LAUNCHER BUTTON ===================== */}
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className={`tnx-launcher ${isOpen ? "is-open" : ""}`}
        aria-label={isOpen ? "Close TecNurx support" : "Open TecNurx support"}
      >
        <div className="tnx-launcher-icon">
          {isOpen ? <X size={22} /> : <MessageCircle size={24} />}
        </div>
        {!isOpen && unreadCount > 0 && (
          <span className="tnx-launcher-badge">{unreadCount}</span>
        )}
      </button>

      {/* ===================== CHAT WIDGET WINDOW ===================== */}
      {isOpen && (
        <div className={`tnx-chatbox ${isMinimized ? "is-minimized" : ""}`}>
          {/* HEADER */}
          <div className="tnx-header">
            <div className="tnx-header-main">
              {view !== "list" ? (
                <button
                  type="button"
                  onClick={handleBackToList}
                  className="tnx-btn-header-back"
                  aria-label="Back"
                >
                  <ChevronLeft size={20} />
                </button>
              ) : (
                <div className="tnx-brand-avatar">
                  <Headphones size={17} />
                  <span className="tnx-online-dot"></span>
                </div>
              )}

              <div className="tnx-header-text">
                <h4 className="tnx-header-title">
                  {view === "detail"
                    ? activeTicket?.subject || "Support Discussion"
                    : view === "new"
                    ? "New Support Request"
                    : "TecNurx Support"}
                </h4>
                <p className="tnx-header-subtitle">
                  {view === "detail" ? (
                    <span
                      className={`tnx-badge-status status-${(
                        activeTicket?.status || "open"
                      ).toLowerCase()}`}
                    >
                      {activeTicket?.status === "pending"
                        ? "Awaiting your reply"
                        : activeTicket?.status === "closed"
                        ? "Resolved"
                        : "In Progress"}
                    </span>
                  ) : (
                    <span>
                      <span className="tnx-dot-green"></span> Online • Instant help
                    </span>
                  )}
                </p>
              </div>
            </div>

            <div className="tnx-header-actions">
              <button
                type="button"
                onClick={() => setIsMinimized((prev) => !prev)}
                className="tnx-btn-header-action"
                title={isMinimized ? "Expand" : "Minimize"}
                aria-label={isMinimized ? "Expand" : "Minimize"}
              >
                {isMinimized ? <Maximize2 size={16} /> : <Minimize2 size={16} />}
              </button>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="tnx-btn-header-action"
                title="Close chat"
                aria-label="Close"
              >
                <X size={17} />
              </button>
            </div>
          </div>

          {/* CHAT CONTAINER BODY */}
          {!isMinimized && (
            <div className="tnx-body">
              {!isLoggedIn ? (
                /* AUTH REQUIRED STATE */
                <div className="tnx-empty-box">
                  <div className="tnx-empty-icon">
                    <ShieldCheck size={36} />
                  </div>
                  <h3>Sign in to TecNurx</h3>
                  <p>
                    Please sign in to open support tickets, chat with our
                    technicians, and track repairs.
                  </p>
                  <a href="/login" className="tnx-btn-primary">
                    Sign In
                  </a>
                </div>
              ) : view === "list" ? (
                /* =================== VIEW 1: HOME & TICKETS =================== */
                <div className="tnx-view-home">
                  {/* WELCOME / GREETING HERO */}
                  <div className="tnx-hero-card">
                    <div className="tnx-hero-badge">
                      <Sparkles size={13} /> TecNurx Customer Care
                    </div>
                    <h3>How can we help today?</h3>
                    <p>
                      Get fast answers regarding your repairs, payments, devices,
                      or account.
                    </p>

                    <button
                      type="button"
                      onClick={handleStartNewTicket}
                      disabled={activeCount >= 2}
                      className="tnx-btn-new-ticket"
                    >
                      <Plus size={18} />
                      <span>Start a New Ticket</span>
                      <ArrowRight size={16} className="tnx-arrow-right" />
                    </button>
                    {activeCount >= 2 && (
                      <span className="tnx-limit-note">
                        Maximum 2 active tickets reached. Please resolve one to open another.
                      </span>
                    )}
                  </div>

                  {error && <div className="tnx-alert-banner">{error}</div>}

                  {/* CONVERSATIONS LIST */}
                  <div className="tnx-conversations-section">
                    <div className="tnx-section-title">
                      <span>Recent Conversations</span>
                      {tickets.length > 0 && (
                        <span className="tnx-count-pill">{tickets.length}</span>
                      )}
                    </div>

                    {loading ? (
                      <div className="tnx-loading-box">
                        <div className="tnx-spinner"></div>
                        <p>Loading your conversations...</p>
                      </div>
                    ) : tickets.length === 0 ? (
                      <div className="tnx-no-tix-box">
                        <MessageCircle size={28} />
                        <h4>No conversations yet</h4>
                        <p>
                          Click &ldquo;Start a New Ticket&rdquo; above to chat with our support team.
                        </p>
                      </div>
                    ) : (
                      <div className="tnx-ticket-items">
                        {tickets.map((t) => {
                          const status = (t.status || "open").toLowerCase();
                          const isClosed = status === "closed";
                          const isPending = status === "pending";
                          const cat =
                            typeof t.category === "object"
                              ? t.category?.name
                              : t.category;

                          return (
                            <div
                              key={t._id || t.id}
                              className="tnx-ticket-row"
                              onClick={() => handleOpenTicket(t)}
                            >
                              <div className="tnx-ticket-row-top">
                                <span className="tnx-cat-tag">
                                  {CATEGORY_ICONS[cat] || <HelpCircle size={12} />}
                                  <span>{cat || "General"}</span>
                                </span>
                                <span
                                  className={`tnx-status-chip chip-${status}`}
                                >
                                  {isClosed
                                    ? "Resolved"
                                    : isPending
                                    ? "Waiting on you"
                                    : "In Progress"}
                                </span>
                              </div>

                              <h5 className="tnx-ticket-row-title">{t.subject}</h5>

                              <p className="tnx-ticket-row-snippet">
                                {t.latestMessage?.text ||
                                  t.latestMessage?.message ||
                                  t.latestMessage?.content ||
                                  t.message ||
                                  "Click to open conversation..."}
                              </p>

                              <div className="tnx-ticket-row-footer">
                                <span>
                                  <Clock size={12} />{" "}
                                  {t.updatedAt || t.createdAt
                                    ? new Date(
                                        t.updatedAt || t.createdAt
                                      ).toLocaleDateString([], {
                                        month: "short",
                                        day: "numeric",
                                      })
                                    : "Recently"}
                                </span>
                                <span className="tnx-view-link">
                                  Open discussion <ArrowRight size={13} />
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              ) : view === "new" ? (
                /* =================== VIEW 2: NEW TICKET FORM =================== */
                <form
                  onSubmit={handleCreateTicketSubmit}
                  className="tnx-view-form"
                >
                  <div className="tnx-form-intro">
                    <h4>Submit a Request</h4>
                    <p>Describe your issue and we will connect you with a technician.</p>
                  </div>

                  {error && <div className="tnx-alert-banner">{error}</div>}

                  {/* Category Pills */}
                  <div className="tnx-form-group">
                    <label>Issue Category</label>
                    <div className="tnx-pills-row">
                      {categories.map((c, i) => {
                        const val =
                          typeof c === "string"
                            ? c
                            : c.id || c.slug || c.name || c._id;
                        const label =
                          typeof c === "string"
                            ? c.charAt(0).toUpperCase() + c.slice(1)
                            : c.name || c.label || c.slug || val;
                        const isSelected = newCategory === val;

                        return (
                          <button
                            key={val || i}
                            type="button"
                            onClick={() => setNewCategory(val)}
                            className={`tnx-pill-btn ${
                              isSelected ? "is-selected" : ""
                            }`}
                          >
                            {CATEGORY_ICONS[val] || <HelpCircle size={13} />}
                            <span>{label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Subject input */}
                  <div className="tnx-form-group">
                    <label>Subject</label>
                    <input
                      type="text"
                      className="tnx-input"
                      placeholder="e.g. Screen still flickering after repair"
                      value={newSubject}
                      onChange={(e) => setNewSubject(e.target.value)}
                      required
                    />
                  </div>

                  {/* Conditional Repair ID */}
                  {newCategory === "repair" && (
                    <div className="tnx-form-group">
                      <label className="tnx-label-flex">
                        <span>Repair Order ID</span>
                        <small>Optional</small>
                      </label>
                      <input
                        type="text"
                        className="tnx-input"
                        placeholder="e.g. 64a8fe90a1b2..."
                        value={newRepairId}
                        onChange={(e) => setNewRepairId(e.target.value)}
                      />
                    </div>
                  )}

                  {/* Message body */}
                  <div className="tnx-form-group">
                    <label>Message Details</label>
                    <textarea
                      rows={4}
                      className="tnx-textarea"
                      placeholder="Explain what happened or what you need assistance with..."
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      required
                    />
                  </div>

                  {/* Photos Upload with Preview Thumbnails */}
                  <div className="tnx-form-group">
                    <div className="tnx-label-flex">
                      <label>Photo Attachments</label>
                      <small>Up to 3 images (max 5MB each)</small>
                    </div>

                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleNewFilesSelect}
                      multiple
                      accept="image/jpeg,image/png,image/webp"
                      style={{ display: "none" }}
                    />

                    <div className="tnx-thumbs-grid">
                      {newAttachments.map((f, idx) => (
                        <div key={idx} className="tnx-thumb-card">
                          <img
                            src={URL.createObjectURL(f)}
                            alt={f.name}
                            className="tnx-thumb-img"
                          />
                          <button
                            type="button"
                            onClick={() =>
                              setNewAttachments((prev) =>
                                prev.filter((_, i) => i !== idx)
                              )
                            }
                            className="tnx-thumb-remove"
                            title="Remove image"
                          >
                            <X size={12} />
                          </button>
                        </div>
                      ))}

                      {newAttachments.length < MAX_ATTACHMENTS && (
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="tnx-thumb-add-btn"
                        >
                          <ImageIcon size={18} />
                          <span>Attach Photo</span>
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="tnx-form-actions">
                    <button
                      type="button"
                      onClick={handleBackToList}
                      className="tnx-btn-secondary"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={submittingTicket}
                      className="tnx-btn-primary"
                    >
                      {submittingTicket ? "Submitting..." : "Send Ticket"}
                    </button>
                  </div>
                </form>
              ) : (
                /* =================== VIEW 3: LIVE CONVERSATION =================== */
                <div className="tnx-view-chat">
                  {/* SUB-HEADER TICKET DETAILS STRIP */}
                  <div className="tnx-chat-meta-bar">
                    <div className="tnx-chat-meta-left">
                      <span className="tnx-meta-title">
                        {activeTicket?.subject}
                      </span>
                      <span className="tnx-meta-id">
                        #
                        {(
                          activeTicket?._id ||
                          activeTicket?.id ||
                          ""
                        ).slice(-8)}
                      </span>
                    </div>

                    <div className="tnx-chat-meta-right">
                      {(activeTicket?.status || "").toLowerCase() ===
                      "closed" ? (
                        <button
                          type="button"
                          onClick={handleReopenActiveTicket}
                          className="tnx-btn-resolve reopen"
                          title="Reopen within 7 days"
                        >
                          <RotateCcw size={12} /> Reopen
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={handleCloseActiveTicket}
                          className="tnx-btn-resolve"
                          title="Mark as resolved"
                        >
                          <CheckCircle2 size={12} /> Resolve
                        </button>
                      )}
                    </div>
                  </div>

                  {/* MESSAGES FEED */}
                  <div className="tnx-chat-messages">
                    {loading && messages.length === 0 ? (
                      <div className="tnx-loading-box">
                        <div className="tnx-spinner"></div>
                        <p>Loading messages...</p>
                      </div>
                    ) : messages.length === 0 ? (
                      <div className="tnx-empty-chat-state">
                        <Bot size={28} />
                        <p>Ticket opened. Feel free to send a message!</p>
                      </div>
                    ) : (
                      messages.map((msg, index) => {
                        const isMe =
                          msg.senderType === "user" ||
                          msg.senderType === "customer";
                        const isSystem = msg.senderType === "system";
                        const isStaff =
                          msg.senderType === "staff" ||
                          msg.senderType === "admin";
                        const text =
                          msg.text || msg.message || msg.content || "";
                        const time = msg.createdAt
                          ? new Date(msg.createdAt).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })
                          : "";
                        const attachs = msg.attachments || [];

                        // 1. SYSTEM BOT GREETING / NOTICE
                        if (isSystem) {
                          const isActivityNotice =
                            /reopened|closed|resolved|assigned|transferred|created this ticket|status changed/i.test(text);
                          return (
                            <div
                              key={msg._id || msg.id || index}
                              className="tnx-msg-system"
                            >
                              <div className="tnx-system-box">
                                <span className="tnx-system-tag">
                                  <Sparkles size={11} />{" "}
                                  {isActivityNotice
                                    ? "System Notification"
                                    : "TecNurx Support"}
                                </span>
                                <p>{text}</p>
                                <small>{time}</small>
                              </div>
                            </div>
                          );
                        }

                        // 2. USER OR STAFF BUBBLE
                        const senderName = isMe
                          ? "You"
                          : msg.senderName
                          ? `${msg.senderName} (Support)`
                          : "TecNurx Support";

                        return (
                          <div
                            key={msg._id || msg.id || index}
                            className={`tnx-msg-row ${
                              isMe ? "is-user" : "is-staff"
                            }`}
                          >
                            <div className="tnx-msg-bubble">
                              <div className="tnx-msg-author">
                                {!isMe && <span className="tnx-staff-badge"></span>}
                                <span>{senderName}</span>
                              </div>

                              {text && <p className="tnx-msg-text">{text}</p>}

                              {attachs.length > 0 && (
                                <div className="tnx-msg-photos">
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
                                        className="tnx-msg-img"
                                        onClick={() => setPreviewImage(src)}
                                      />
                                    );
                                  })}
                                </div>
                              )}

                              <div className="tnx-msg-time">{time}</div>
                            </div>
                          </div>
                        );
                      })
                    )}

                    {/* LIVE TYPING INDICATOR */}
                    {typingUser && (
                      <div className="tnx-typing-box">
                        <div className="tnx-typing-dots">
                          <span></span>
                          <span></span>
                          <span></span>
                        </div>
                        <small>{typingUser} is typing...</small>
                      </div>
                    )}

                    <div ref={messagesEndRef} />
                  </div>

                  {/* INPUT / REOPEN FOOTER */}
                  {(activeTicket?.status || "").toLowerCase() === "closed" ? (
                    <div className="tnx-closed-bar">
                      <p>This support ticket is marked as resolved.</p>
                      <button
                        type="button"
                        onClick={handleReopenActiveTicket}
                        className="tnx-btn-reopen"
                      >
                        <RotateCcw size={13} /> Reopen Ticket (Within 7 Days)
                      </button>
                    </div>
                  ) : (
                    <form onSubmit={handleSendReply} className="tnx-input-area">
                      {/* Attached file previews above input */}
                      {replyAttachments.length > 0 && (
                        <div className="tnx-reply-thumbs">
                          {replyAttachments.map((f, i) => (
                            <div key={i} className="tnx-reply-thumb-chip">
                              <img
                                src={URL.createObjectURL(f)}
                                alt={f.name}
                                className="tnx-mini-thumb"
                              />
                              <span className="tnx-mini-name">{f.name}</span>
                              <button
                                type="button"
                                onClick={() =>
                                  setReplyAttachments((prev) =>
                                    prev.filter((_, idx) => idx !== i)
                                  )
                                }
                              >
                                <X size={12} />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}

                      <div className="tnx-input-wrapper">
                        <input
                          type="file"
                          ref={replyFileInputRef}
                          onChange={handleReplyFilesSelect}
                          multiple
                          accept="image/jpeg,image/png,image/webp"
                          style={{ display: "none" }}
                        />

                        <button
                          type="button"
                          onClick={() => replyFileInputRef.current?.click()}
                          className="tnx-btn-paperclip"
                          title="Attach photo (up to 3)"
                          disabled={replyAttachments.length >= MAX_ATTACHMENTS}
                        >
                          <Paperclip size={18} />
                        </button>

                        <input
                          type="text"
                          className="tnx-chat-input"
                          placeholder="Type your message..."
                          value={replyMessage}
                          onChange={handleReplyInputChange}
                          disabled={sendingReply}
                        />

                        <button
                          type="submit"
                          disabled={
                            (!replyMessage.trim() &&
                              replyAttachments.length === 0) ||
                            sendingReply
                          }
                          className="tnx-btn-send"
                          title="Send message"
                        >
                          <Send size={16} />
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* FULL-SCREEN LIGHTBOX MODAL */}
      {previewImage && (
        <div className="tnx-lightbox" onClick={() => setPreviewImage(null)}>
          <div className="tnx-lightbox-container">
            <img src={previewImage} alt="Attachment full view" />
            <button
              type="button"
              className="tnx-btn-lightbox-close"
              onClick={() => setPreviewImage(null)}
            >
              <X size={20} />
            </button>
          </div>
        </div>
      )}

      {/* CONFIRM / ALERT MODAL OVERLAY */}
      <ConfirmModal
        isOpen={modalConfig.isOpen}
        title={modalConfig.title}
        message={modalConfig.message}
        type={modalConfig.type}
        confirmText={modalConfig.confirmText}
        cancelText={modalConfig.cancelText}
        showCancel={modalConfig.showCancel}
        zIndex={40000}
        onConfirm={modalConfig.onConfirm}
        onCancel={() => setModalConfig((prev) => ({ ...prev, isOpen: false }))}
      />
    </>
  );
}
