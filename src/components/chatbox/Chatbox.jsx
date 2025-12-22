// components/Chatbox/Chatbox.jsx
"use client";
import React, { useState } from "react";
import { MessageCircle, X, Send, Minimize2 } from "lucide-react";
import "./chatbox.css"; // We'll add styles next

const Chatbox = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Hi there! 👋 How can we help you today?",
      sender: "bot",
      time: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    },
  ]);
  const [inputValue, setInputValue] = useState("");

  const sendMessage = (e) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    const newMsg = {
      id: messages.length + 1,
      text: inputValue,
      sender: "user",
      time: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };

    setMessages([...messages, newMsg]);
    setInputValue("");

    // Optional: Simulate bot reply
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          id: prev.length + 1,
          text: "Thanks for your message! Our team will get back to you soon.",
          sender: "bot",
          time: new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
        },
      ]);
    }, 1000);
  };

  return (
    <>
      {/* Floating Toggle Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="chatbox-toggle"
          aria-label="Open chat"
        >
          <MessageCircle size={28} />
          <span className="chat-badge">1</span>
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className={`chatbox-window ${isMinimized ? "minimized" : ""}`}>
          {/* Header */}
          <div className="chatbox-header">
            <div className="header-info">
              <h4>Customer Support</h4>
              <small>Typically replies in a few minutes</small>
            </div>
            <div className="header-actions">
              <button
                onClick={() => setIsMinimized(!isMinimized)}
                aria-label={isMinimized ? "Expand" : "Minimize"}
              >
                <Minimize2 size={18} />
              </button>
              <button onClick={() => setIsOpen(false)} aria-label="Close chat">
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Messages Area */}
          {!isMinimized && (
            <>
              <div className="chatbox-messages">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`message ${
                      msg.sender === "user" ? "user" : "bot"
                    }`}
                  >
                    <p>{msg.text}</p>
                    <small>{msg.time}</small>
                  </div>
                ))}
              </div>

              {/* Input Area */}
              <form onSubmit={sendMessage} className="chatbox-input">
                <input
                  type="text"
                  placeholder="Type your message..."
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                />
                <button type="submit" disabled={!inputValue.trim()}>
                  <Send size={20} />
                </button>
              </form>
            </>
          )}
        </div>
      )}
    </>
  );
};

export default Chatbox;
