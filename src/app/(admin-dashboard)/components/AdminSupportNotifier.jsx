// src/app/(admin-dashboard)/components/AdminSupportNotifier.jsx
"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { adminSupportService } from "../../../../services/admin/adminSupportService";
import { playNotificationSound } from "@/lib/soundUtils";
import { toast } from "@/components/CustomToast";

export default function AdminSupportNotifier() {
  const pathname = usePathname();
  const currentTicketIdRef = useRef(null);

  // Keep track of active ticket being viewed if window dispatches event
  useEffect(() => {
    const handleActiveTicketChange = (e) => {
      currentTicketIdRef.current = e.detail?.ticketId || null;
    };
    window.addEventListener("admin-active-ticket-change", handleActiveTicketChange);
    return () => {
      window.removeEventListener("admin-active-ticket-change", handleActiveTicketChange);
    };
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const token =
      localStorage.getItem("staff_token") || localStorage.getItem("token");
    if (!token) return;

    const socket = adminSupportService.initSocket(token);
    if (!socket) return;

    // 1. New Ticket Opened by Customer
    const handleTicketNew = (payload) => {
      const ticket =
        payload?.ticket || payload?.data?.ticket || payload?.data || payload;
      if (!ticket) return;

      playNotificationSound();
      const subject = ticket.subject || "Support Request";
      const requester =
        ticket.user?.name ||
        ticket.user?.fname ||
        ticket.user?.email ||
        "Customer";

      toast.info(
        `🎫 New Ticket from ${requester}: "${subject.slice(0, 45)}${
          subject.length > 45 ? "..." : ""
        }"`
      );

      // Only notify sidebar if admin is not already on the support page
      if (pathname !== "/admin-dashboard/support") {
        window.dispatchEvent(
          new CustomEvent("admin-support-unread", { detail: { delta: 1 } })
        );
      }
    };

    // 2. New Message Sent on Ticket
    const handleMessageNew = (payload) => {
      const ticketId = payload?.ticketId || payload?.ticket;
      const message =
        payload?.message ||
        payload?.data?.message ||
        payload?.data ||
        payload;
      if (!message) return;

      // Only notify if message is from a customer
      const isFromCustomer =
        message.senderType === "user" || message.senderType === "customer";
      if (!isFromCustomer) return;

      // If the admin is on the support page AND viewing this exact ticket, don't trigger toast
      const isViewingThisTicket =
        pathname === "/admin-dashboard/support" &&
        currentTicketIdRef.current === ticketId;

      if (!isViewingThisTicket) {
        playNotificationSound();
        const sender = message.senderName || "Customer";
        const text =
          message.text ||
          message.message ||
          message.content ||
          "Sent an attachment";

        toast.info(
          `💬 ${sender}: "${text.slice(0, 45)}${text.length > 45 ? "..." : ""}"`
        );

        // Only increment sidebar badge if admin is NOT on the support page
        if (pathname !== "/admin-dashboard/support") {
          window.dispatchEvent(
            new CustomEvent("admin-support-unread", { detail: { delta: 1 } })
          );
        }
      }
    };

    socket.on("support:ticket:new", handleTicketNew);
    socket.on("support:message:new", handleMessageNew);

    return () => {
      socket.off("support:ticket:new", handleTicketNew);
      socket.off("support:message:new", handleMessageNew);
    };
  }, [pathname]);

  return null;
}
