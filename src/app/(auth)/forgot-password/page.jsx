"use client";

import React, { useState } from "react";
import logimage from "@/assets/images/login.svg";
import logo from "@/assets/images/loglogo.svg";
import Image from "next/image";
import "../login/login.css";
import Link from "next/link";
import { authService } from "../../../../services/auth";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleForgot = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");
    setLoading(true);

    try {
      await authService.forgotPassword({ email });

      setMessage("Check your email! We’ve sent you a password reset link.");
      setEmail(""); // Optional: clear field
    } catch (err) {
      const errMsg =
        err.response?.data?.message ||
        err.message ||
        "Something went wrong. Please try again.";
      setError(errMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="login-wrap">
        <Image className="sideimage" src={logimage} alt="Login Illustration" />

        <form className="card-wrap" onSubmit={handleForgot}>
          <div className="card">
            <Link href="/" className="logi-logo">
              <Image src={logo} alt="Logo" />
            </Link>

            <div className="text-content">
              <h2>
                Forgot <span>password</span>?
              </h2>
              <p>You’ll create another one in a few minutes</p>
            </div>

            {/* Success Message */}
            {message && (
              <div className="success-message">
                <p>{message}</p>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="error-message">
                <p>{error}</p>
              </div>
            )}

            <div className="form">
              <div className="form-group">
                <label htmlFor="email">Email Address</label>
                <input
                  id="email"
                  type="email"
                  placeholder="Enter email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>
            </div>

            <button
              type="submit"
              className="sign-in-btn"
              disabled={loading || !email.trim()}
            >
              {loading ? "Sending..." : "Submit"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ForgotPassword;
