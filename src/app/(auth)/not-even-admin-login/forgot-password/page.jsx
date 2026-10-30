"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import logo from "@/assets/images/logo.png";
import "../adminlogin.css";
import { adminAuthService } from "../../../../../services/admin/adminlogin";
import { toast } from "@/components/CustomToast";
import { MailCheck } from "lucide-react";

export default function StaffForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) {
      toast.error("Please enter your staff email address.");
      return;
    }

    try {
      setLoading(true);
      await adminAuthService.forgotPassword(email.trim());
      setSubmitted(true);
      toast.success("If an account exists, a reset link has been sent.");
    } catch (err) {
      // Backend returns 200 regardless, but handle network/server errors
      toast.error(err.response?.data?.message || "Failed to send reset link.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="adminlogin-wrap">
        <div className="admincard-wrap">
          <div className="admincard">
            <Link href="/" className="logi-logo">
              <Image src={logo} alt="logo" width={120} />
            </Link>

            <h2>
              Staff <span>Password Reset</span>
            </h2>

            {submitted ? (
              <div style={{ textAlign: "center", padding: "20px 0" }}>
                <MailCheck size={48} color="#ffc400" style={{ margin: "0 auto 16px" }} />
                <h3 style={{ fontSize: "18px", fontWeight: "600", marginBottom: "8px" }}>
                  Check Your Email
                </h3>
                <p style={{ fontSize: "14px", color: "#6b7280", lineHeight: "1.5" }}>
                  If an account exists for <strong>{email}</strong>, we have sent a password reset link (valid for 10 minutes).
                </p>
                <div style={{ marginTop: "24px" }}>
                  <Link
                    href="/not-even-admin-login"
                    style={{ fontSize: "14px", color: "#000", fontWeight: "600", textDecoration: "underline" }}
                  >
                    Return to Login
                  </Link>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="form">
                <p style={{ fontSize: "14px", color: "#666", marginBottom: "16px" }}>
                  Enter your registered staff email address to receive a secure password reset link.
                </p>

                <div className="form-group">
                  <label>Email Address</label>
                  <input
                    type="email"
                    name="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your staff email"
                    required
                    disabled={loading}
                  />
                </div>

                <div className="sign-btn">
                  <button
                    type="submit"
                    disabled={loading}
                    className="sign-in-btn"
                  >
                    {loading ? "Sending Link..." : "Send Reset Link"}
                  </button>
                </div>

                <div style={{ textAlign: "center", marginTop: "16px" }}>
                  <Link
                    href="/not-even-admin-login"
                    style={{ fontSize: "13px", color: "#666", textDecoration: "none" }}
                  >
                    Remember your password? <strong>Sign In</strong>
                  </Link>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
