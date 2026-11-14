"use client";

import React, { useState, useEffect } from "react";
import "./support.css";
import {
  MessageSquare,
  Phone,
  Mail,
  ChevronRight,
  ArrowRight,
  Clock,
  HelpCircle,
} from "lucide-react";
import Chatbox from "@/components/chatbox/Chatbox";
import { supportService } from "../../../../../services/supportService";

const FAQS = [
  {
    question: "How does Repair Now, Pay Later work?",
    answer:
      "Repair Now, Pay Later lets you spread the cost of your repairs into 3 to 6 manageable monthly payments with zero hidden fees. Once your diagnostic quote is confirmed, choose 'Pay over time' at approval to set up your installment schedule.",
  },
  {
    question: "How long does a repair take?",
    answer:
      "Most standard screen, battery, and charging port repairs are completed and dispatched within 24 to 48 hours from the time of device collection. Complex diagnostics, liquid damage, or motherboard repairs typically take 3 to 5 business days.",
  },
  {
    question: "How is my device collected and returned?",
    answer:
      "A vetted TecNurx logistics rider picks up your device from your scheduled address. You will receive a unique 4-digit handover verification code in your dashboard to confirm the rider's identity. Once repairs and rigorous QA checks are complete, it is safely returned to your doorstep.",
  },
  {
    question: "How do I make a claim?",
    answer:
      "Navigate to the Protection section in your dashboard, select your registered insured device, and click 'Make a claim'. Fill out the brief incident description, and our claims team will approve your repair or replacement within 24 hours.",
  },
];

export default function SupportPage() {
  const [openFaqIndex, setOpenFaqIndex] = useState(null);
  const [tickets, setTickets] = useState([]);
  const [loadingTickets, setLoadingTickets] = useState(true);

  // Toggle FAQ accordion item
  const toggleFaq = (idx) => {
    setOpenFaqIndex((prev) => (prev === idx ? null : idx));
  };

  // Fetch user support tickets
  useEffect(() => {
    const fetchTickets = async () => {
      try {
        const data = await supportService.getMyTickets();
        const ticketList = Array.isArray(data) ? data : data?.tickets || [];
        setTickets(ticketList);
      } catch (err) {
        console.warn("Could not load support tickets:", err);
      } finally {
        setLoadingTickets(false);
      }
    };

    fetchTickets();
  }, []);

  return (
    <div className="support-page">
      {/* Top Header */}
      <div className="support-header">
        <h1 className="support-title">Support</h1>
        <p className="support-subtitle">We are here to help.</p>
      </div>

      {/* 2-Column Content Grid */}
      <div className="support-grid">
        {/* Left Column: Contact Channels, Tickets, FAQs */}
        <div className="support-col-main">
          {/* Card 1: Contact Us */}
          <div className="support-card">
            <h2 className="support-card-title">Contact us</h2>

            <div className="contact-channels-list">
              {/* WhatsApp */}
              <a
                href="https://wa.me/2349168701802"
                target="_blank"
                rel="noopener noreferrer"
                className="contact-channel-item"
              >
                <div className="contact-channel-icon">
                  <MessageSquare size={20} />
                </div>
                <div className="contact-channel-info">
                  <h4>WhatsApp</h4>
                  <p>+234 916 870 1802</p>
                </div>
              </a>

              {/* Phone */}
              <a href="tel:+2349168701802" className="contact-channel-item">
                <div className="contact-channel-icon">
                  <Phone size={20} />
                </div>
                <div className="contact-channel-info">
                  <h4>Phone</h4>
                  <p>+234 916 870 1802</p>
                </div>
              </a>

              {/* Email */}
              <a
                href="mailto:contact@tecnurx.com"
                className="contact-channel-item"
              >
                <div className="contact-channel-icon">
                  <Mail size={20} />
                </div>
                <div className="contact-channel-info">
                  <h4>Email</h4>
                  <p>contact@tecnurx.com</p>
                </div>
              </a>
            </div>

            <p className="support-hours-footnote">
              Support hours: Monday – Friday, 8am – 6pm; Saturday, 9am – 4pm
            </p>
          </div>

          {/* Card 2: Your Tickets */}
          <div className="support-card">
            <h2 className="support-card-title">Your tickets</h2>

            {loadingTickets ? (
              <p className="ticket-empty-text">Loading support tickets...</p>
            ) : tickets && tickets.length > 0 ? (
              <div className="tickets-list">
                {tickets.slice(0, 5).map((t) => {
                  const isClosed = (t.status || "").toLowerCase() === "closed";
                  const dateStr = t.updatedAt
                    ? new Date(t.updatedAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    : "Recently";

                  return (
                    <div key={t._id || t.id} className="ticket-item-row">
                      <div className="ticket-item-left">
                        <h4>{t.subject || "Support Inquiry"}</h4>
                        <p>Updated {dateStr}</p>
                      </div>

                      <span
                        className={`ticket-status-pill ${
                          isClosed ? "closed" : "open"
                        }`}
                      >
                        ● {isClosed ? "Resolved" : "Open"}
                      </span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="ticket-empty-text">
                No active support tickets. You can start a live conversation with our support team on the right.
              </p>
            )}
          </div>

          {/* Card 3: Common Questions (FAQs) */}
          <div className="support-card">
            <h2 className="support-card-title">Common questions</h2>

            <div className="faq-accordion-list">
              {FAQS.map((faq, idx) => {
                const isOpen = openFaqIndex === idx;

                return (
                  <div
                    key={idx}
                    className={`faq-item ${isOpen ? "is-open" : ""}`}
                  >
                    <button
                      type="button"
                      className="faq-question-btn"
                      onClick={() => toggleFaq(idx)}
                      aria-expanded={isOpen}
                    >
                      <span>{faq.question}</span>
                      <ChevronRight size={18} className="faq-icon" />
                    </button>

                    {isOpen && (
                      <div className="faq-answer-content">
                        <p style={{ margin: 0 }}>{faq.answer}</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Embedded Chatbox Widget */}
        <div className="support-chatbox-column">
          <Chatbox isInline={true} />
        </div>
      </div>
    </div>
  );
}
