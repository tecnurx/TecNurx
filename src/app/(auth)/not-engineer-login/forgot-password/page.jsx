"use client";

import React, { useState } from "react";
import logo from "@/assets/images/logo.png";
import Image from "next/image";
import "../englogin.css";
import Link from "next/link";
import { authService } from "../../../../../services/auth";

const EngineerForgotPassword = () => {
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
      setEmail("");
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
      <div className="englogin-wrap">
        <div className="engcard-wrap">
          <div className="engcard">
            <Link href="/" className="logi-logo">
              <Image src={logo} alt="logo" width={120} />
            </Link>

            <div>
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

            <form className="form" onSubmit={handleForgot}>
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

              <div className="sign-btn">
                <button
                  type="submit"
                  className="sign-in-btn"
                  disabled={loading || !email.trim()}
                >
                  {loading ? "Sending..." : "Submit"}
                </button>
                <div>
                  <h6>Remembered your password?</h6>
                  <Link href="/not-engineer-login">Sign In</Link>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EngineerForgotPassword;
