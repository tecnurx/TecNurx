"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation"; // For App Router
import "./verify.css";
import axios from "../../../../lib/axios";
import Navbar from "@/components/navbar/Navbar";
import Footer from "@/components/footer/Footer";
import { authService } from "../../../../services/auth";

const VerifyEmail = () => {
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const router = useRouter();

  useEffect(() => {
    const savedEmail = localStorage.getItem("pendingVerificationEmail");

    if (savedEmail) {
      setEmail(savedEmail);
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await authService.verifyEmail({ email, verificationToken: code });
      setShowSuccessModal(true); // Show success modal
    } catch (err) {
      setError(err.response?.data?.message || "Invalid or expired code");
    } finally {
      setLoading(false);
    }
  };

  const closeModalAndRedirect = () => {
    setShowSuccessModal(false);
    // Clean up if you want
    localStorage.removeItem("pendingVerificationEmail");
    router.push("/login");
  };

  return (
    <>
      <Navbar />
      <div className="section-wrap">
        <div className="header">
          <h1>
            Verify your <span>Email</span>
          </h1>
          <p>
            We sent a 4-digit code to your email. Enter it below to continue.
          </p>
        </div>

        <form className="verify-form" onSubmit={handleSubmit}>
          <div className="form-wrap">
            <div className="input-group">
              <label>Email</label>
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                readOnly={!!localStorage.getItem("pendingVerificationEmail")}
              />
            </div>

            <div className="input-group">
              <label>Verification Code</label>
              <input
                type="text"
                placeholder="Enter 4-digit code"
                value={code}
                onChange={(e) =>
                  setCode(e.target.value.replace(/\D/g, "").slice(0, 4))
                }
                maxLength="4"
                required
                autoFocus
              />
            </div>
          </div>

          {error && <p className="error-text">{error}</p>}

          <button type="submit" disabled={loading || !email || code.length < 4}>
            {loading ? "Verifying..." : "Verify Email"}
          </button>
        </form>
      </div>

      {/* Success Modal - Vanilla CSS */}
      {showSuccessModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-content">
              <div className="success-icon">✓</div>
              <h2>Email Verified Successfully!</h2>
              <p>Your email has been confirmed. You can now log in.</p>
              <button onClick={closeModalAndRedirect} className="modal-btn">
                Go to Login
              </button>
            </div>
          </div>
        </div>
      )}
      <Footer />
    </>
  );
};

export default VerifyEmail;
