"use client";
import React, { useState } from "react";
import "./payment.css";
import {
  CreditCard,
  Wallet,
  Building2,
  Calendar,
  Receipt,
  ArrowRight,
  Check,
  AlertCircle,
} from "lucide-react";

const Payments = () => {
  const [selectedMethod, setSelectedMethod] = useState("card");

  // Sample current plan
  const currentPlan = {
    type: "Yearly",
    nextBilling: "Oct 12, 2026",
    totalPaid: "₦24,900",
    tier: "Premium",
  };

  // Sample payment history
  const paymentHistory = [
    {
      date: "Oct 12, 2025",
      description: "Yearly Premium Plan Renewal",
      amount: "₦24,900",
      method: "Visa Card •••• 4242",
      status: "success",
    },
  ];

  const getStatusIcon = (status) => {
    return status === "success" ? (
      <Check size={16} style={{ color: "#10b981" }} />
    ) : null;
  };

  return (
    <div className="payments-page">
      <div className="payments-header">
        <h1>Payments & Plans</h1>
        <p>
          Manage your subscription, view history, and update payment methods
        </p>
      </div>

      <div className="no-payment">
        <AlertCircle size={48} />
        <h2>Current Plan Summary</h2>
        <p>No active subscription plans at the moment.</p>
      </div>

      {/* Current Plan Summary */}
      {/* <div className="current-plan-section">
        <h2>Current Plan Summary</h2>
        <div className="plan-summary-card">
          <div className="plan-details">
            <div className="plan-tier">
              {currentPlan.tier} Plan ({currentPlan.type})
            </div>
            <div className="plan-meta">
              <span>
                <Calendar size={16} /> Next billing:{" "}
                <strong>{currentPlan.nextBilling}</strong>
              </span>
              <span>
                <Receipt size={16} /> Total paid to date:{" "}
                <strong>{currentPlan.totalPaid}</strong>
              </span>
            </div>
          </div>
          <button className="manage-plan-btn">Manage Plan</button>
        </div>
      </div> */}

      {/* Payment History Table */}
      {/* <div className="payment-history-section">
        <h2>Payment History</h2>
        <div className="history-table">
          <div className="table-header">
            <span>Date</span>
            <span>Description</span>
            <span>Amount</span>
            <span>Method</span>
            <span>Status</span>
          </div>
          {paymentHistory.map((payment, i) => (
            <div key={i} className="table-row">
              <span>{payment.date}</span>
              <span>{payment.description}</span>
              <span className="amount">{payment.amount}</span>
              <span>{payment.method}</span>
              <span className="status-success">
                {getStatusIcon(payment.status)} Paid
              </span>
            </div>
          ))}
        </div>
      </div> */}

      {/* Add Payment Method */}
      {/* <div className="add-method-section">
        <h2>Add Payment Method</h2>
        <div className="method-selector">
          <button
            className={selectedMethod === "card" ? "active" : ""}
            onClick={() => setSelectedMethod("card")}
          >
            <CreditCard size={20} /> Card
          </button>
          <button
            className={selectedMethod === "bank" ? "active" : ""}
            onClick={() => setSelectedMethod("bank")}
          >
            <Building2 size={20} /> Bank Transfer
          </button>
          <button
            className={selectedMethod === "wallet" ? "active" : ""}
            onClick={() => setSelectedMethod("wallet")}
          >
            <Wallet size={20} /> Wallet / USSD
          </button>
        </div>

        <div className="integration-note">
          <p>We securely process payments via:</p>
          <div className="logos">
            <span>Paystack</span>
            <span>Flutterwave</span>
            <span>Providus Bank</span>
          </div>
        </div>

        <form className="add-method-form">
          {selectedMethod === "card" && (
            <>
              <input type="text" placeholder="Card Number" />
              <div className="row">
                <input type="text" placeholder="MM/YY" />
                <input type="text" placeholder="CVV" />
              </div>
              <input type="text" placeholder="Cardholder Name" />
            </>
          )}
          {selectedMethod === "bank" && (
            <p className="info-text">
              You will be redirected to your bank's secure page for transfer
              authorization.
            </p>
          )}
          {selectedMethod === "wallet" && (
            <p className="info-text">
              Pay via mobile wallet, USSD, or QR code through Flutterwave or
              Paystack.
            </p>
          )}
          <button type="submit" className="add-method-btn">
            Add Payment Method
          </button>
        </form>
      </div> */}
    </div>
  );
};

export default Payments;
