// src/components/chatbox/ChatboxStaticAssistant.jsx
// PRESERVED: Static Assistant Demo Version (with canned mock data & quick prompts)
// To re-enable, import and use this component or switch in Chatbox.jsx

"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  MessageSquare,
  ArrowRight,
  X,
  Minimize2,
  Maximize2,
} from "lucide-react";
import "./chatbox.css";

const QUICK_PROMPTS = [
  { id: "where_repair", label: "Where is my repair?" },
  { id: "booking_fees", label: "How do booking fees work?" },
  { id: "change_handover", label: "Change my handover" },
  { id: "talk_person", label: "Talk to a person" },
];

export default function ChatboxStaticAssistant({ isInline = false }) {
  const [isOpen, setIsOpen] = useState(isInline ? true : false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [inputMessage, setInputMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [showQuickPrompts, setShowQuickPrompts] = useState(true);

  const messagesEndRef = useRef(null);
  const repairOrderId = "3EA19933";

  const [messages, setMessages] = useState([
    {
      id: "initial-greeting",
      sender: "assistant",
      text: "Hi. What can I help you with today?",
    },
  ]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isTyping, isOpen]);

  const handlePromptClick = (prompt) => {
    const userMsg = {
      id: `user-${Date.now()}`,
      sender: "user",
      text: prompt.label,
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsTyping(true);

    setTimeout(() => {
      let assistantMsg = null;
      if (prompt.id === "where_repair") {
        assistantMsg = {
          id: `asst-${Date.now()}`,
          sender: "assistant",
          text: `Repair #${repairOrderId} is waiting for your approval.\nYour quote is ready.`,
          link: {
            label: "Review quote",
            href: "/dashboard/repairs",
          },
        };
      } else if (prompt.id === "booking_fees") {
        assistantMsg = {
          id: `asst-${Date.now()}`,
          sender: "assistant",
          text: "Booking fees cover the cost of your diagnostic assessment and logistics rider collection. Once you approve your repair quote, 100% of this fee is credited toward your total repair cost.",
        };
      } else if (prompt.id === "change_handover") {
        assistantMsg = {
          id: `asst-${Date.now()}`,
          sender: "assistant",
          text: "You can update your device collection or drop-off address and scheduled time window directly on your repair tracking page.",
          link: {
            label: "Track repair",
            href: "/dashboard/repairs",
          },
        };
      } else if (prompt.id === "talk_person") {
        assistantMsg = {
          id: `asst-${Date.now()}`,
          sender: "assistant",
          text: "Our support agents are available to assist you directly:\n• WhatsApp: +234 916 870 1802\n• Phone: +234 916 870 1802\n• Email: contact@tecnurx.com",
        };
      }

      setIsTyping(false);
      if (assistantMsg) {
        setMessages((prev) => [...prev, assistantMsg]);
      }
    }, 450);
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    const text = inputMessage.trim();
    if (!text) return;

    const userMsg = {
      id: `user-${Date.now()}`,
      sender: "user",
      text,
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputMessage("");
    setIsTyping(true);

    setTimeout(() => {
      setIsTyping(false);
      setMessages((prev) => [
        ...prev,
        {
          id: `asst-${Date.now()}`,
          sender: "assistant",
          text: `Thank you for your message! Our support team has logged your inquiry regarding Repair #${repairOrderId} and will respond shortly.`,
        },
      ]);
    }, 500);
  };

  return (
    <>
      {!isInline && (
        <button
          type="button"
          className={`tnx-chat-bubble-btn tnx-launcher ${isOpen ? "is-open" : ""}`}
          onClick={() => setIsOpen((prev) => !prev)}
          aria-label={isOpen ? "Close TecNurx Assistant" : "Open TecNurx Assistant"}
        >
          <div className="tnx-launcher-icon">
            <MessageSquare size={22} color="#ffffff" />
          </div>
        </button>
      )}

      {(isOpen || isInline) && (
        <div
          className={`tnx-assistant-card ${isInline ? "is-inline" : "is-floating"} ${
            isMinimized && !isInline ? "is-minimized" : ""
          }`}
        >
          {!isInline && (
            <div className="tnx-floating-controls">
              <button
                type="button"
                onClick={() => setIsMinimized((prev) => !prev)}
                className="tnx-floating-btn"
                title={isMinimized ? "Expand" : "Minimize"}
              >
                {isMinimized ? <Maximize2 size={16} /> : <Minimize2 size={16} />}
              </button>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="tnx-floating-btn"
                title="Close chat"
              >
                <X size={17} />
              </button>
            </div>
          )}

          {!isMinimized && (
            <>
              <div className="tnx-assistant-header">
                <div className="tnx-assistant-icon-box">
                  <MessageSquare size={18} color="#111827" strokeWidth={2} />
                </div>
                <h2 className="tnx-assistant-title">TecNurx Assistant</h2>
                <p className="tnx-assistant-subtitle">
                  Ask about your repairs, payments and protection.
                </p>

                <div className="tnx-assistant-context-row">
                  <span className="tnx-context-label">Asking about</span>
                  <span className="tnx-context-pill">
                    <span className="tnx-context-dot">●</span>
                    <span>Repair #{repairOrderId}</span>
                  </span>
                </div>
              </div>

              <div className="tnx-assistant-chat-stream">
                {messages.map((msg, index) => {
                  const isAssistant = msg.sender === "assistant";
                  return (
                    <React.Fragment key={msg.id || index}>
                      <div
                        className={`tnx-bubble ${
                          isAssistant ? "tnx-bubble-assistant" : "tnx-bubble-user"
                        }`}
                      >
                        <div className="tnx-bubble-text">{msg.text}</div>
                        {msg.link && (
                          <Link href={msg.link.href} className="tnx-bubble-link">
                            {msg.link.label}
                          </Link>
                        )}
                      </div>

                      {index === 0 && showQuickPrompts && (
                        <div className="tnx-prompts-group">
                          {QUICK_PROMPTS.map((prompt) => (
                            <button
                              key={prompt.id}
                              type="button"
                              className="tnx-prompt-chip"
                              onClick={() => handlePromptClick(prompt)}
                            >
                              {prompt.label}
                            </button>
                          ))}
                        </div>
                      )}
                    </React.Fragment>
                  );
                })}

                {isTyping && (
                  <div className="tnx-bubble tnx-bubble-assistant tnx-bubble-typing">
                    <span className="tnx-typing-dot"></span>
                    <span className="tnx-typing-dot"></span>
                    <span className="tnx-typing-dot"></span>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              <form className="tnx-assistant-input-form" onSubmit={handleSendMessage}>
                <div className="tnx-assistant-input-wrap">
                  <input
                    type="text"
                    className="tnx-assistant-input-field"
                    placeholder="Type your message"
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                  />
                  <button
                    type="submit"
                    className="tnx-assistant-send-btn"
                    disabled={!inputMessage.trim()}
                    aria-label="Send message"
                  >
                    <ArrowRight size={18} color="#111827" strokeWidth={2.4} />
                  </button>
                </div>
              </form>

              <p className="tnx-assistant-disclaimer">
                The assistant can make mistakes. For payments or claim decisions, talk to our team.
              </p>
            </>
          )}
        </div>
      )}
    </>
  );
}
