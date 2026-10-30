// services/supportService.js
import axios from "../lib/axios";
import { io } from "socket.io-client";

const getSocketOrigin = () => {
  if (typeof window === "undefined") return "";
  const apiUrl =
    process.env.NEXT_PUBLIC_SOCKET_URL ||
    process.env.NEXT_PUBLIC_API_URL ||
    "https://backend-develop-2v1v.onrender.com/api/v1";
  return apiUrl.replace(/\/api\/v1\/?$/, "");
};

class SupportService {
  constructor() {
    this.socket = null;
    this.activeToken = null;
  }

  // ===================== REST API =====================

  /**
   * Get all available support categories
   */
  async getCategories() {
    try {
      const response = await axios.get("/support/categories");
      return (
        response.data?.data?.categories ||
        response.data?.categories ||
        response.data?.data ||
        response.data ||
        []
      );
    } catch (error) {
      console.error("Failed to fetch support categories:", error);
      throw error;
    }
  }

  /**
   * List my support tickets
   */
  async getMyTickets() {
    try {
      const response = await axios.get("/support/tickets");
      return (
        response.data?.data?.tickets ||
        response.data?.tickets ||
        response.data?.data ||
        response.data ||
        []
      );
    } catch (error) {
      console.error("Failed to fetch my tickets:", error);
      throw error;
    }
  }

  /**
   * Get single ticket with full message history
   */
  async getTicketDetails(ticketId) {
    try {
      const response = await axios.get(`/support/tickets/${ticketId}`);
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
      console.error(`Failed to fetch ticket ${ticketId}:`, error);
      throw error;
    }
  }

  /**
   * Open a new support ticket
   * @param {Object} data { category, subject, message, repairId, attachments }
   */
  async createTicket({ category, subject, message, repairId, attachments = [] }) {
    try {
      const payloadMessage = message || "";

      // If there are file attachments, send multipart/form-data
      if (attachments && attachments.length > 0) {
        const formData = new FormData();
        formData.append("category", category);
        formData.append("subject", subject);
        formData.append("message", payloadMessage);
        formData.append("text", payloadMessage);
        if (repairId) {
          formData.append("repairId", repairId);
        }

        Array.from(attachments).forEach((file) => {
          formData.append("attachments", file);
        });

        const response = await axios.post("/support/tickets", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        return response.data?.data?.ticket || response.data?.ticket || response.data;
      }

      // Plain JSON
      const body = {
        category,
        subject,
        message: payloadMessage,
        text: payloadMessage,
      };
      if (repairId) {
        body.repairId = repairId;
      }

      const response = await axios.post("/support/tickets", body);
      return response.data?.data?.ticket || response.data?.ticket || response.data;
    } catch (error) {
      console.error("Failed to create support ticket:", error);
      throw error;
    }
  }

  /**
   * Send a message on a ticket
   * @param {string} ticketId
   * @param {Object} data { text, message, attachments }
   */
  async sendMessage(ticketId, { text, message, attachments = [] }) {
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
          `/support/tickets/${ticketId}/messages`,
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

      const response = await axios.post(`/support/tickets/${ticketId}/messages`, {
        text: content,
        message: content,
      });
      return (
        response.data?.data?.message ||
        response.data?.messageRecord ||
        response.data?.data ||
        response.data
      );
    } catch (error) {
      console.error(`Failed to send message to ticket ${ticketId}:`, error);
      throw error;
    }
  }

  /**
   * Close a ticket
   */
  async closeTicket(ticketId) {
    try {
      const response = await axios.patch(`/support/tickets/${ticketId}/close`);
      return response.data?.data?.ticket || response.data?.ticket || response.data;
    } catch (error) {
      console.error(`Failed to close ticket ${ticketId}:`, error);
      throw error;
    }
  }

  /**
   * Reopen a closed ticket (within 7 days)
   */
  async reopenTicket(ticketId) {
    try {
      const response = await axios.patch(`/support/tickets/${ticketId}/reopen`);
      return response.data?.data?.ticket || response.data?.ticket || response.data;
    } catch (error) {
      console.error(`Failed to reopen ticket ${ticketId}:`, error);
      throw error;
    }
  }

  // ===================== SOCKET.IO LAYER =====================

  /**
   * Initialize or reuse Socket.IO client connection
   * @param {string} token - JWT user token
   */
  initSocket(token) {
    if (typeof window === "undefined") return null;

    const authToken = token || localStorage.getItem("token");
    if (!authToken) {
      console.warn("SupportService: No auth token available for Socket.IO connection");
      return null;
    }

    // Reuse existing healthy socket if token matches
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
      console.log("🟢 Support Socket.IO connected:", this.socket.id);
    });

    this.socket.on("connect_error", (err) => {
      console.warn("Support Socket.IO connection error:", err.message);
    });

    this.socket.on("disconnect", (reason) => {
      console.log("Support Socket.IO disconnected:", reason);
    });

    return this.socket;
  }

  getSocket() {
    return this.socket;
  }

  /**
   * Join a specific ticket room (needed for typing indicators & targeted events)
   */
  joinTicket(ticketId) {
    if (!this.socket || !ticketId) return;
    this.socket.emit("support:join", { ticketId }, (ack) => {
      if (ack?.error) {
        console.warn(`Failed to join ticket room ${ticketId}:`, ack.error);
      }
    });
  }

  /**
   * Leave a ticket room
   */
  leaveTicket(ticketId) {
    if (!this.socket || !ticketId) return;
    this.socket.emit("support:leave", { ticketId });
  }

  /**
   * Send typing status
   */
  sendTyping(ticketId, isTyping) {
    if (!this.socket || !ticketId) return;
    this.socket.emit("support:typing", { ticketId, isTyping });
  }

  /**
   * Disconnect socket cleanly
   */
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.activeToken = null;
    }
  }
}

export const supportService = new SupportService();
