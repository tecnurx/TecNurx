"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import "./verify.css";
import axios from "../../../../lib/axios";
import Navbar from "@/components/navbar/Navbar";
import Footer from "@/components/footer/Footer";
import { authService } from "../../../../services/auth";
import { Check } from "lucide-react";

// This forces the page to be dynamic (no static rendering → no localStorage error at build time)
export const dynamic = "force-dynamic";
// Optional: export const revalidate = 0; // also works

const VerifyEmail = () => {
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [isClient, setIsClient] = useState(false); // Track client-side rendering

  const router = useRouter();

  // Run only on the client
  useEffect(() => {
    setIsClient(true);

    if (typeof window === "undefined") return;

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
      setShowSuccessModal(true);
    } catch (err) {
      setError(err.response?.data?.message || "Invalid or expired code");
    } finally {
      setLoading(false);
    }
  };

  const closeModalAndRedirect = () => {
    setShowSuccessModal(false);

    // Safely remove from localStorage (only runs in browser)
    if (typeof window !== "undefined") {
      localStorage.removeItem("pendingVerificationEmail");
    }

    router.push("/login");
  };

  // Safe check: only true after hydration and localStorage is available
  const hasPendingEmail =
    isClient &&
    typeof window !== "undefined" &&
    !!localStorage.getItem("pendingVerificationEmail");

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
                readOnly={hasPendingEmail} // Safe: won't access localStorage during SSR
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
                maxLength={4}
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

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-content">
              <div className="success-icon"><Check /></div>
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
