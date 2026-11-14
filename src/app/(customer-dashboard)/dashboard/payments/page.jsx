"use client";

import React, { useState } from "react";
import "./payment.css";
import { CreditCard, Check, X, AlertCircle, Download } from "lucide-react";
import { toast } from "@/components/CustomToast";

const Payments = () => {
  const [isAddCardOpen, setIsAddCardOpen] = useState(false);
  const [isAutoRepayOpen, setIsAutoRepayOpen] = useState(false);
  const [isAutoRepayActive, setIsAutoRepayActive] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  // New Card Form
  const [cardForm, setCardForm] = useState({
    cardNumber: "",
    expiry: "",
    cvv: "",
  });

  // Active instalment demo data (matching mockup exactly with no brackets)
  const activeInstalment = {
    current: 2,
    total: 3,
    dueDate: "Nov 18, 2026",
    amount: "₦25,000",
  };

  // History items matching mockup
  const historyItems = [
    {
      id: "TNX-4421",
      service: "Screen replacement",
      amount: "₦35,000",
      date: "Nov 4, 2026",
      status: "Paid",
    },
    {
      id: "TNX-1290",
      service: "Battery replacement",
      amount: "₦18,000",
      date: "Oct 24, 2026",
      status: "Paid",
    },
  ];

  const handlePayNow = () => {
    setIsProcessingPayment(true);
    setTimeout(() => {
      setIsProcessingPayment(false);
      toast.success("Instalment payment of ₦25,000 processed successfully!");
    }, 1200);
  };

  const handleAddCardSubmit = (e) => {
    e.preventDefault();
    if (!cardForm.cardNumber || !cardForm.expiry || !cardForm.cvv) {
      toast.error("Please fill in all card details");
      return;
    }
    toast.success("Payment method added successfully!");
    setIsAddCardOpen(false);
    setCardForm({ cardNumber: "", expiry: "", cvv: "" });
  };

  const handleDownloadReceipts = () => {
    toast.success("Downloading payment receipts as PDF...");
  };

  return (
    <div className="payments-page">
      {/* Header */}
      <div className="payments-header">
        <h1 className="payments-title">Payments</h1>
        <p className="payments-subtitle">
          Instalments, payment methods and receipts.
        </p>
      </div>

      {/* 2-Column Grid */}
      <div className="payments-grid">
        {/* Left Column: Active Instalment & History */}
        <div className="payments-left-col">
          {/* Card 1: Active Instalment (Pay Later) */}
          <div className="payment-card active-instalment-card">
            <div className="instalment-banner-bar">
              <span className="instalment-dot">●</span>
              <span>Pay Later</span>
            </div>

            <h2 className="instalment-title">
              Payment {activeInstalment.current} of {activeInstalment.total}
            </h2>
            <p className="instalment-due-date">Due {activeInstalment.dueDate}</p>

            <div className="instalment-amount">{activeInstalment.amount}</div>

            <button
              type="button"
              className="btn-pay-now-full"
              onClick={handlePayNow}
              disabled={isProcessingPayment}
            >
              {isProcessingPayment ? "Processing payment..." : "Pay now"}
            </button>
          </div>

          {/* Card 2: History */}
          <div className="payment-card">
            <h2 className="payment-card-title">History</h2>

            <div className="history-list">
              {historyItems.map((item) => (
                <div key={item.id} className="history-item-row">
                  <div className="history-item-info">
                    <h3 className="history-item-title">
                      Repair #{item.id} · {item.service}
                    </h3>
                    <p className="history-item-sub">
                      {item.amount} · {item.date}
                    </p>
                  </div>

                  <span className="status-pill-paid">
                    <span className="status-dot">●</span>
                    <span>{item.status}</span>
                  </span>
                </div>
              ))}
            </div>

            <button
              type="button"
              className="download-receipts-link"
              onClick={handleDownloadReceipts}
            >
              Download receipts
            </button>
          </div>
        </div>

        {/* Right Column: Payment Methods & Automatic Repayments */}
        <div className="payments-right-col">
          {/* Card 1: Payment methods */}
          <div className="payment-card">
            <h2 className="payment-card-title">Payment methods</h2>

            <div className="saved-card-row">
              <div className="saved-card-meta">
                <div className="card-icon-box">
                  <CreditCard size={20} />
                </div>
                <div className="card-number-exp">
                  <span className="card-number-label">
                    Mastercard •••• 4242
                  </span>
                  <span className="card-exp-label">Expires 12/28</span>
                </div>
              </div>

              <span className="pill-default-badge">
                <span className="dot">●</span>
                Default
              </span>
            </div>

            <button
              type="button"
              className="btn-outline-action"
              onClick={() => setIsAddCardOpen(true)}
            >
              Add payment method
            </button>
          </div>

          {/* Card 2: Automatic repayments */}
          <div className="payment-card">
            <div className="auto-repayments-header">
              <h2 className="auto-repayments-title">Automatic repayments</h2>
              <span
                className={
                  isAutoRepayActive ? "pill-status-on" : "pill-status-off"
                }
              >
                <span className="dot">●</span>
                {isAutoRepayActive ? "On" : "Off"}
              </span>
            </div>

            <p className="auto-repayments-desc">
              Pay each instalment automatically when it is due.
            </p>

            <button
              type="button"
              className="btn-outline-action"
              onClick={() => setIsAutoRepayOpen(true)}
            >
              {isAutoRepayActive ? "Manage" : "Set up"}
            </button>
          </div>
        </div>
      </div>

      {/* MODAL 1: ADD PAYMENT METHOD */}
      {isAddCardOpen && (
        <div
          className="payment-modal-backdrop"
          onClick={() => setIsAddCardOpen(false)}
        >
          <div
            className="payment-modal-card"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="payment-modal-head">
              <h2>Add payment method</h2>
              <button
                type="button"
                className="payment-modal-close"
                onClick={() => setIsAddCardOpen(false)}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAddCardSubmit}>
              <div style={{ marginBottom: "16px" }}>
                <label
                  style={{
                    display: "block",
                    fontSize: "13.5px",
                    fontWeight: 600,
                    marginBottom: "6px",
                  }}
                >
                  Card number
                </label>
                <input
                  type="text"
                  placeholder="1234 5678 9012 3456"
                  maxLength={19}
                  value={cardForm.cardNumber}
                  onChange={(e) =>
                    setCardForm({ ...cardForm, cardNumber: e.target.value })
                  }
                  style={{
                    width: "100%",
                    padding: "10px 14px",
                    borderRadius: "10px",
                    border: "1px solid #d1d5db",
                    fontSize: "14px",
                    boxBox: "border-box",
                  }}
                  required
                />
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "14px",
                  marginBottom: "20px",
                }}
              >
                <div>
                  <label
                    style={{
                      display: "block",
                      fontSize: "13.5px",
                      fontWeight: 600,
                      marginBottom: "6px",
                    }}
                  >
                    Expiry date
                  </label>
                  <input
                    type="text"
                    placeholder="MM/YY"
                    maxLength={5}
                    value={cardForm.expiry}
                    onChange={(e) =>
                      setCardForm({ ...cardForm, expiry: e.target.value })
                    }
                    style={{
                      width: "100%",
                      padding: "10px 14px",
                      borderRadius: "10px",
                      border: "1px solid #d1d5db",
                      fontSize: "14px",
                    }}
                    required
                  />
                </div>

                <div>
                  <label
                    style={{
                      display: "block",
                      fontSize: "13.5px",
                      fontWeight: 600,
                      marginBottom: "6px",
                    }}
                  >
                    CVV
                  </label>
                  <input
                    type="password"
                    placeholder="123"
                    maxLength={4}
                    value={cardForm.cvv}
                    onChange={(e) =>
                      setCardForm({ ...cardForm, cvv: e.target.value })
                    }
                    style={{
                      width: "100%",
                      padding: "10px 14px",
                      borderRadius: "10px",
                      border: "1px solid #d1d5db",
                      fontSize: "14px",
                    }}
                    required
                  />
                </div>
              </div>

              <div className="payment-modal-actions">
                <button
                  type="button"
                  className="btn-modal-cancel"
                  onClick={() => setIsAddCardOpen(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn-modal-submit">
                  Save card
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: AUTOMATIC REPAYMENTS SETUP */}
      {isAutoRepayOpen && (
        <div
          className="payment-modal-backdrop"
          onClick={() => setIsAutoRepayOpen(false)}
        >
          <div
            className="payment-modal-card"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="payment-modal-head">
              <h2>Set up automatic repayments</h2>
              <button
                type="button"
                className="payment-modal-close"
                onClick={() => setIsAutoRepayOpen(false)}
              >
                <X size={18} />
              </button>
            </div>

            <p style={{ fontSize: "14px", color: "#4b5563", lineHeight: 1.5 }}>
              When enabled, your scheduled repair instalments will be debited
              from your default payment method on the due date automatically.
            </p>

            <div
              style={{
                background: "#f9fafb",
                padding: "16px",
                borderRadius: "14px",
                margin: "18px 0",
              }}
            >
              <div style={{ fontSize: "13.5px", color: "#64748b" }}>
                Default card:
              </div>
              <strong style={{ fontSize: "15px", color: "#111827" }}>
                Mastercard •••• 4242
              </strong>
            </div>

            <div className="payment-modal-actions">
              <button
                type="button"
                className="btn-modal-cancel"
                onClick={() => setIsAutoRepayOpen(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn-modal-submit"
                onClick={() => {
                  setIsAutoRepayActive(!isAutoRepayActive);
                  setIsAutoRepayOpen(false);
                  toast.success(
                    isAutoRepayActive
                      ? "Automatic repayments turned off"
                      : "Automatic repayments enabled!"
                  );
                }}
              >
                {isAutoRepayActive ? "Turn off" : "Enable automatic debits"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Payments;
