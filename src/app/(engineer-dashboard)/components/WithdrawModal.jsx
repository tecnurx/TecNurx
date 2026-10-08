"use client";

import React, { useState, useEffect } from "react";
import { toast } from "@/components/CustomToast";
import { X, ArrowRight, Wallet } from "lucide-react";
import { engineerAuthService } from "../../../../services/eng/engineerAuth";

const WithdrawModal = ({ isOpen, onClose, walletBalance = 0, onSuccess }) => {
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [bankName, setBankName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [accountName, setAccountName] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const user = engineerAuthService.getCurrentUser();
      if (user) {
        setAccountName(`${user.fname || ""} ${user.lname || ""}`.trim());
      }
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    const amount = Number(withdrawAmount);

    if (!amount || amount <= 0) {
      toast.error("Please enter a valid withdrawal amount.");
      return;
    }

    if (amount > walletBalance) {
      toast.error("Insufficient funds. Amount exceeds wallet balance.");
      return;
    }

    if (!bankName.trim() || !accountNumber.trim() || !accountName.trim()) {
      toast.error("Please fill in all bank account details.");
      return;
    }

    setSubmitting(true);

    setTimeout(() => {
      toast.success(
        `Withdrawal request of ₦${amount.toLocaleString()} submitted successfully!`
      );
      setSubmitting(false);
      setWithdrawAmount("");
      if (onSuccess) onSuccess(amount);
      onClose();
    }, 1000);
  };

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: "rgba(0,0,0,0.6)",
        backdropFilter: "blur(4px)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 1000,
        padding: "20px",
      }}
    >
      <div
        style={{
          background: "#fff",
          padding: "32px",
          borderRadius: "24px",
          width: "100%",
          maxWidth: "480px",
          boxShadow: "0 20px 40px rgba(0,0,0,0.2)",
          display: "flex",
          flexDirection: "column",
          gap: "20px",
          position: "relative",
          fontFamily: "Plus Jakarta Sans, sans-serif",
        }}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          style={{
            position: "absolute",
            top: "20px",
            right: "20px",
            background: "#f1f5f9",
            border: "none",
            borderRadius: "50%",
            width: "36px",
            height: "36px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            color: "#64748b",
          }}
        >
          <X size={20} />
        </button>

        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div
            style={{
              width: "48px",
              height: "48px",
              borderRadius: "14px",
              background: "#fffbe6",
              border: "1.5px solid #ffc400",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#000",
            }}
          >
            <Wallet size={24} />
          </div>
          <div>
            <h2 style={{ fontSize: "20px", fontWeight: "700", color: "#111" }}>
              Withdraw Funds
            </h2>
            <p style={{ color: "#666", fontSize: "14px", marginTop: "2px" }}>
              Available Balance:{" "}
              <strong style={{ color: "#000" }}>
                ₦{walletBalance.toLocaleString()}
              </strong>
            </p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <label style={{ fontSize: "14px", fontWeight: "600", color: "#333" }}>
              Amount to Withdraw (₦)
            </label>
            <input
              type="number"
              value={withdrawAmount}
              onChange={(e) => setWithdrawAmount(e.target.value)}
              placeholder="e.g. 50000"
              required
              style={{
                padding: "14px",
                border: "1.5px solid #e2e8f0",
                borderRadius: "12px",
                fontSize: "15px",
                width: "100%",
                fontFamily: "inherit",
              }}
            />
            {Number(withdrawAmount) > walletBalance && (
              <span style={{ color: "#ef4444", fontSize: "13px", fontWeight: "500" }}>
                Amount exceeds available wallet balance
              </span>
            )}
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <label style={{ fontSize: "14px", fontWeight: "600", color: "#333" }}>
              Bank Name
            </label>
            <input
              type="text"
              value={bankName}
              onChange={(e) => setBankName(e.target.value)}
              placeholder="e.g. GTBank, Zenith, Kuda"
              required
              style={{
                padding: "14px",
                border: "1.5px solid #e2e8f0",
                borderRadius: "12px",
                fontSize: "15px",
                width: "100%",
                fontFamily: "inherit",
              }}
            />
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <label style={{ fontSize: "14px", fontWeight: "600", color: "#333" }}>
              Account Number
            </label>
            <input
              type="text"
              value={accountNumber}
              onChange={(e) => setAccountNumber(e.target.value)}
              placeholder="10-digit account number"
              required
              maxLength={10}
              style={{
                padding: "14px",
                border: "1.5px solid #e2e8f0",
                borderRadius: "12px",
                fontSize: "15px",
                width: "100%",
                fontFamily: "inherit",
              }}
            />
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <label style={{ fontSize: "14px", fontWeight: "600", color: "#333" }}>
              Account Name
            </label>
            <input
              type="text"
              value={accountName}
              onChange={(e) => setAccountName(e.target.value)}
              placeholder="Account holder name"
              required
              style={{
                padding: "14px",
                border: "1.5px solid #e2e8f0",
                borderRadius: "12px",
                fontSize: "15px",
                width: "100%",
                fontFamily: "inherit",
              }}
            />
          </div>

          {/* Action Buttons */}
          <div style={{ display: "flex", gap: "12px", marginTop: "12px" }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                flex: 1,
                padding: "14px",
                background: "#f1f5f9",
                border: "none",
                borderRadius: "60px",
                cursor: "pointer",
                fontWeight: "600",
                fontSize: "15px",
                color: "#475569",
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={
                submitting ||
                !withdrawAmount ||
                Number(withdrawAmount) <= 0 ||
                Number(withdrawAmount) > walletBalance ||
                !bankName ||
                !accountNumber ||
                !accountName
              }
              style={{
                flex: 1,
                padding: "14px",
                background:
                  submitting ||
                  !withdrawAmount ||
                  Number(withdrawAmount) <= 0 ||
                  Number(withdrawAmount) > walletBalance ||
                  !bankName ||
                  !accountNumber ||
                  !accountName
                    ? "#cbd5e1"
                    : "#ffc400",
                color:
                  submitting ||
                  !withdrawAmount ||
                  Number(withdrawAmount) <= 0 ||
                  Number(withdrawAmount) > walletBalance ||
                  !bankName ||
                  !accountNumber ||
                  !accountName
                    ? "#64748b"
                    : "#000",
                border: "none",
                borderRadius: "60px",
                cursor:
                  submitting ||
                  !withdrawAmount ||
                  Number(withdrawAmount) <= 0 ||
                  Number(withdrawAmount) > walletBalance ||
                  !bankName ||
                  !accountNumber ||
                  !accountName
                    ? "not-allowed"
                    : "pointer",
                fontWeight: "700",
                fontSize: "15px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
              }}
            >
              {submitting ? "Processing..." : "Submit Request"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default WithdrawModal;
