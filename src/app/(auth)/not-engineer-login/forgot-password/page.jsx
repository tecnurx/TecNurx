"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { MailCheck, AlertCircle } from "lucide-react";
import logo from "@/assets/images/logo.png";
import { authService } from "../../../../../services/auth";
import { toast } from "@/components/CustomToast";

const EngineerForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submittedEmail, setSubmittedEmail] = useState("");
  const [error, setError] = useState("");

  const handleForgot = async (e) => {
    e.preventDefault();
    setError("");
    if (!email.trim()) {
      toast.error("Please enter your engineer email address.");
      return;
    }

    setLoading(true);

    try {
      await authService.forgotPassword({ email: email.trim() });
      setSubmittedEmail(email.trim());
      setSubmitted(true);
      toast.success("Password reset link sent!");
    } catch (err) {
      const errMsg =
        err.response?.data?.message ||
        err.message ||
        "Something went wrong. Please try again.";
      setError(errMsg);
      toast.error(errMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        width: "100%",
        backgroundColor: "#f5f6f8",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
        boxSizing: "border-box",
      }}
    >
      <div
        style={{
          maxWidth: "460px",
          width: "100%",
          background: "#ffffff",
          borderRadius: "24px",
          padding: "40px 36px",
          boxShadow: "0 10px 30px rgba(0, 0, 0, 0.05)",
          border: "1px solid #e5e7eb",
          display: "flex",
          flexDirection: "column",
          boxSizing: "border-box",
        }}
      >
        {/* Brand Logo */}
        <div style={{ textAlign: "center", marginBottom: "26px" }}>
          <Link href="/" style={{ display: "inline-block", marginBottom: "16px" }}>
            <Image
              src={logo}
              alt="TecNurx"
              width={130}
              height={32}
              priority
              style={{ objectFit: "contain", margin: "0 auto" }}
            />
          </Link>
          <h2 style={{ fontSize: "24px", fontWeight: "800", color: "#111827", margin: 0 }}>
            {submitted ? "Check Your Email" : "Engineer Password Reset"}
          </h2>
          <p style={{ fontSize: "14px", color: "#6b7280", marginTop: "8px", lineHeight: "1.4" }}>
            {submitted
              ? "We have sent a password reset link to your email address."
              : "Enter your registered engineer email and we'll send you a link to reset your password."}
          </p>
        </div>

        {/* Success State - Matching Staff Style */}
        {submitted ? (
          <div style={{ textAlign: "center", padding: "10px 0" }}>
            <div
              style={{
                width: "64px",
                height: "64px",
                borderRadius: "50%",
                backgroundColor: "#fffbeb",
                color: "#b45309",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 20px",
              }}
            >
              <MailCheck size={36} color="#ffc400" />
            </div>

            <p style={{ fontSize: "14px", color: "#374151", lineHeight: "1.5", margin: "0 0 24px" }}>
              If an engineer account exists for <strong>{submittedEmail}</strong>, you will receive an email shortly with instructions to reset your password.
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              <Link
                href="/not-engineer-login"
                style={{
                  display: "inline-block",
                  width: "100%",
                  boxSizing: "border-box",
                  padding: "13px",
                  borderRadius: "10px",
                  backgroundColor: "#ffc400",
                  color: "#000",
                  fontWeight: "700",
                  fontSize: "15px",
                  textAlign: "center",
                  textDecoration: "none",
                  transition: "all 0.2s ease",
                }}
              >
                Back to Engineer Login
              </Link>

              <button
                type="button"
                onClick={() => setSubmitted(false)}
                style={{
                  background: "transparent",
                  border: "none",
                  color: "#6b7280",
                  fontSize: "13px",
                  fontWeight: "500",
                  cursor: "pointer",
                  padding: "8px",
                }}
              >
                Didn't receive it? Try another email
              </button>
            </div>
          </div>
        ) : (
          /* Form State */
          <form onSubmit={handleForgot} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            {error && (
              <div
                style={{
                  padding: "12px 14px",
                  background: "#fef2f2",
                  border: "1px solid #fecaca",
                  borderRadius: "10px",
                  color: "#b91c1c",
                  fontSize: "13px",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                }}
              >
                <AlertCircle size={16} style={{ flexShrink: 0 }} />
                <span>{error}</span>
              </div>
            )}

            <div>
              <label style={{ fontSize: "13px", fontWeight: "600", color: "#374151", display: "block", marginBottom: "6px" }}>
                Engineer Email Address
              </label>
              <input
                id="email"
                type="email"
                placeholder="e.g. engineer@tecnurx.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
                style={{
                  width: "100%",
                  boxSizing: "border-box",
                  padding: "12px 14px",
                  borderRadius: "10px",
                  border: "1px solid #d1d5db",
                  fontSize: "14px",
                  outline: "none",
                  backgroundColor: "#fff",
                  color: "#111827",
                }}
              />
            </div>

            <button
              type="submit"
              disabled={loading || !email.trim()}
              style={{
                backgroundColor: "#ffc400",
                color: "#000",
                border: "none",
                borderRadius: "10px",
                padding: "13px",
                fontSize: "15px",
                fontWeight: "700",
                cursor: loading || !email.trim() ? "not-allowed" : "pointer",
                opacity: loading || !email.trim() ? 0.7 : 1,
                transition: "all 0.2s ease",
                marginTop: "4px",
              }}
            >
              {loading ? "Sending Reset Link..." : "Send Reset Link"}
            </button>

            <div style={{ textAlign: "center", marginTop: "8px" }}>
              <Link
                href="/not-engineer-login"
                style={{ fontSize: "14px", color: "#6b7280", textDecoration: "none", fontWeight: "500" }}
              >
                Remember your password? <strong>Sign In</strong>
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default EngineerForgotPassword;
