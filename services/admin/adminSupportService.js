// services/admin/adminSupportService.js
import axios from "../../lib/axios";
import { io } from "socket.io-client";

const getSocketOrigin = () => {
  if (typeof window === "undefined") return "";
  const apiUrl =
    process.env.NEXT_PUBLIC_SOCKET_URL ||
    process.env.NEXT_PUBLIC_API_URL ||
    "https://backend-develop-2v1v.onrender.com/api/v1";
  return apiUrl.replace(/\/api\/v1\/?$/, "");
};

class AdminSupportService {
  constructor() {
    this.socket = null;
    this.activeToken = null;
  }

  // ===================== REST API =====================

  /**
   * List support ticket categories (Staff: support:tickets:read)
   */
  async getCategories() {
    try {
      const response = await axios.get("/admin/support/categories");
      return (
        response.data?.data?.categories ||
        response.data?.categories ||
        response.data?.data ||
        response.data ||
        []
      );
    } catch (error) {
      console.error("AdminSupportService: Failed to fetch categories:", error);
      throw error;
    }
  }

  /**
   * List all support tickets with optional filters (Staff: support:tickets:read)
   */
  async getAllTickets(params = {}) {
    try {
      const response = await axios.get("/admin/support/tickets", { params });
      return (
        response.data?.data?.tickets ||
        response.data?.tickets ||
        response.data?.data ||
        response.data ||
        []
      );
    } catch (error) {
      console.error("AdminSupportService: Failed to fetch all tickets:", error);
      throw error;
    }
  }

  /**
   * Get a ticket with its full message history (Staff: support:tickets:read)
   */
  async getTicketDetails(ticketId) {
    try {
      const response = await axios.get(`/admin/support/tickets/${ticketId}`);
      const payload = response.data?.data || response.data;
      return {
        ticket: payload?.ticket || payload,
        messages: Array.isArray(payload?.messages)
          ? payload.messages
          : Array.isArray(payload?.ticket?.messages)
          ? payload.ticket.messages
          : [],
      };
    } catch (error) {
      console.error(
        `AdminSupportService: Failed to fetch ticket ${ticketId}:`,
        error
      );
      throw error;
    }
  }

  /**
   * Reply to a ticket (Staff: support:tickets:reply)
   * @param {string} ticketId
   * @param {Object} data { text, message, attachments }
   */
  async replyTicket(ticketId, { text, message, attachments = [] }) {
    try {
      const content = text || message || "";

      if (attachments && attachments.length > 0) {
        const formData = new FormData();
        if (content) {
          formData.append("text", content);
          formData.append("message", content);
        }

        Array.from(attachments).forEach((file) => {
          formData.append("attachments", file);
        });

        const response = await axios.post(
          `/admin/support/tickets/${ticketId}/messages`,
          formData,
          {
            headers: { "Content-Type": "multipart/form-data" },
          }
        );
        return (
          response.data?.data?.message ||
          response.data?.messageRecord ||
          response.data?.data ||
          response.data
        );
      }

      const response = await axios.post(
        `/admin/support/tickets/${ticketId}/messages`,
        {
          text: content,
          message: content,
        }
      );
      return (
        response.data?.data?.message ||
        response.data?.messageRecord ||
        response.data?.data ||
        response.data
      );
    } catch (error) {
      console.error(
        `AdminSupportService: Failed to reply to ticket ${ticketId}:`,
        error
      );
      throw error;
    }
  }

  /**
   * Close or reopen a ticket (Staff: support:tickets:reply)
   * @param {string} ticketId
   * @param {"open" | "closed" | "pending"} status
   */
  async updateTicketStatus(ticketId, status) {
    try {
      const response = await axios.patch(
        `/admin/support/tickets/${ticketId}/status`,
        { status }
      );
      return (
        response.data?.data?.ticket || response.data?.ticket || response.data
      );
    } catch (error) {
      console.error(
        `AdminSupportService: Failed to update status of ticket ${ticketId}:`,
        error
      );
      throw error;
    }
  }

  /**
   * Assign or unassign a ticket (Staff: support:tickets:reply)
   * @param {string} ticketId
   * @param {string|null} staffId - Staff ID or null/empty to unassign
   */
  async assignTicket(ticketId, staffId) {
    try {
      const payloadStaffId = staffId === "unassigned" ? null : staffId || null;
      const response = await axios.patch(
        `/admin/support/tickets/${ticketId}/assign`,
        {
          staffId: payloadStaffId,
          assignedTo: payloadStaffId,
        }
      );
      return (
        response.data?.data?.ticket || response.data?.ticket || response.data
      );
    } catch (error) {
      console.error(
        `AdminSupportService: Failed to assign ticket ${ticketId}:`,
        error
      );
      throw error;
    }
  }

  // ===================== SOCKET.IO LAYER FOR STAFF =====================

  initSocket(token) {
    if (typeof window === "undefined") return null;

    const authToken =
      token || localStorage.getItem("staff_token") || localStorage.getItem("token");
    if (!authToken) {
      console.warn(
        "AdminSupportService: No staff token available for Socket.IO connection"
      );
      return null;
    }

    if (this.socket && this.activeToken === authToken && this.socket.connected) {
      return this.socket;
    }

    if (this.socket) {
      this.socket.disconnect();
    }

    const socketOrigin = getSocketOrigin();
    this.activeToken = authToken;

    this.socket = io(socketOrigin, {
      auth: { token: authToken },
      transports: ["websocket", "polling"],
      reconnectionAttempts: 5,
      reconnectionDelay: 2000,
    });

    this.socket.on("connect", () => {
      console.log("🟢 Staff Support Socket.IO connected:", this.socket.id);
    });

    this.socket.on("connect_error", (err) => {
      console.warn("Staff Support Socket.IO connection error:", err.message);
    });

    this.socket.on("disconnect", (reason) => {
      console.log("Staff Support Socket.IO disconnected:", reason);
    });

    return this.socket;
  }

  getSocket() {
    return this.socket;
  }

  joinTicket(ticketId) {
    if (!this.socket || !ticketId) return;
    this.socket.emit("support:join", { ticketId }, (ack) => {
      if (ack?.error) {
        console.warn(`Staff failed to join ticket ${ticketId}:`, ack.error);
      }
    });
  }

  leaveTicket(ticketId) {
    if (!this.socket || !ticketId) return;
    this.socket.emit("support:leave", { ticketId });
  }

  sendTyping(ticketId, isTyping) {
    if (!this.socket || !ticketId) return;
    this.socket.emit("support:typing", { ticketId, isTyping });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.activeToken = null;
    }
  }
}

export const adminSupportService = new AdminSupportService();
