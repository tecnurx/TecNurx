"use client";
import React, { useState, useEffect, Suspense } from "react";
import logimage from "@/assets/images/login.svg";
import logo from "@/assets/images/logo.png";
import Image from "next/image";
import "../../login/login.css";
import { Eye, EyeOff, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { authService } from "../../../../../services/auth";

const CreatePasswordContent = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [showpassword, setShowpassword] = useState(false);
  const [showpasswordConfirm, setShowpasswordConfirm] = useState(false);

  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [token, setToken] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);

  // Extract token from URL
  useEffect(() => {
    const path = window.location.pathname;
    const pathParts = path.split("/");
    const tokenFromPath = pathParts[pathParts.length - 1];

    const tokenFromQuery = searchParams.get("token");

    const extractedToken =
      tokenFromPath && tokenFromPath.length > 10 && tokenFromPath !== "create-password"
        ? tokenFromPath
        : tokenFromQuery || "";

    if (!extractedToken) {
      setError(
        "Invalid or missing reset token. Please request a new password reset link."
      );
    } else {
      setToken(extractedToken);
    }
  }, [searchParams]);

  // Password match & strength validation
  const isPasswordMatch =
    password && passwordConfirm && password === passwordConfirm;
  const isPasswordStrong =
    password.length >= 8 &&
    /[a-z]/.test(password) &&
    /[0-9]/.test(password) &&
    /[!@#$%^&*(),.?":{}|<>]/.test(password);

  const handleReset = async (e) => {
    e.preventDefault();
    setError("");

    if (!password || !passwordConfirm) {
      setError("Please fill in both password fields.");
      return;
    }

    if (password !== passwordConfirm) {
      setError("Passwords do not match.");
      return;
    }

    if (!isPasswordStrong) {
      setError(
        "Password must be 8+ chars with lowercase, number, and special character."
      );
      return;
    }

    if (!token) {
      setError("Invalid token. Please try resetting again.");
      return;
    }

    setLoading(true);

    try {
      await authService.resetPassword({ password, passwordConfirm, token });
      setShowModal(true);
    } catch (err) {
      const errMsg =
        err.response?.data?.message ||
        err.message ||
        "Failed to reset password. Link may have expired.";
      setError(errMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="login-wrap">
        <Image className="sideimage" src={logimage} alt="Login" />
        <div className="card-wrap">
          <div className="card">
            <Link href="/" className="logi-logo">
              <Image src={logo} alt="logo" width={120} />
            </Link>
            <div>
              <h2>
                Create a new <span>password</span>
              </h2>
              <p>Create a strong password to protect your account</p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="error-message">
                <p>{error}</p>
              </div>
            )}

            <form onSubmit={handleReset} className="form">
              {/* New Password */}
              <div className="form-group">
                <label>New Password</label>
                <div className="password-wrapper">
                  <input
                    type={showpassword ? "text" : "password"}
                    placeholder="Enter strong password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={loading || showModal}
                  />
                  <span
                    className="eye"
                    onClick={() => setShowpassword(!showpassword)}
                    style={{ cursor: "pointer" }}
                  >
                    {showpassword ? <Eye size={20} /> : <EyeOff size={20} />}
                  </span>
                </div>
              </div>

              {/* Confirm Password */}
              <div className="form-group">
                <label>Confirm Password</label>
                <div className="password-wrapper">
                  <input
                    type={showpasswordConfirm ? "text" : "password"}
                    placeholder="Re-enter password"
                    value={passwordConfirm}
                    onChange={(e) => setPasswordConfirm(e.target.value)}
                    required
                    disabled={loading || showModal}
                    style={{
                      borderColor:
                        passwordConfirm && password !== passwordConfirm
                          ? "red"
                          : "",
                    }}
                  />
                  <span
                    className="eye"
                    onClick={() => setShowpasswordConfirm(!showpasswordConfirm)}
                    style={{ cursor: "pointer" }}
                  >
                    {showpasswordConfirm ? (
                      <Eye size={20} />
                    ) : (
                      <EyeOff size={20} />
                    )}
                  </span>
                </div>
                {passwordConfirm && password !== passwordConfirm && (
                  <small style={{ color: "red" }}>Passwords do not match</small>
                )}
              </div>

              <button
                type="submit"
                className="sign-in-btn"
                disabled={loading || !isPasswordMatch || !isPasswordStrong || showModal}
              >
                {loading ? "Saving..." : "Save Password"}
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Role Selection Modal on Successful Password Reset */}
      {showModal && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.6)",
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
              background: "#ffffff",
              borderRadius: "24px",
              padding: "36px 32px",
              maxWidth: "440px",
              width: "100%",
              textAlign: "center",
              boxShadow: "0 20px 40px rgba(0,0,0,0.2)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "20px",
            }}
          >
            <div
              style={{
                width: "60px",
                height: "60px",
                borderRadius: "50%",
                backgroundColor: "#e6f4ea",
                color: "#1e8e3e",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <CheckCircle2 size={36} />
            </div>

            <div>
              <h3
                style={{
                  fontSize: "22px",
                  fontWeight: "700",
                  color: "#111",
                  marginBottom: "8px",
                  fontFamily: "Plus Jakarta Sans, sans-serif",
                }}
              >
                Password Reset Successful!
              </h3>
              <p
                style={{
                  fontSize: "14px",
                  color: "#666",
                  lineHeight: "1.5",
                  fontFamily: "Plus Jakarta Sans, sans-serif",
                }}
              >
                Your password has been updated. Please select your account portal to sign in:
              </p>
            </div>

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "12px",
                width: "100%",
              }}
            >
              <button
                onClick={() => router.push("/login")}
                style={{
                  width: "100%",
                  padding: "16px",
                  borderRadius: "60px",
                  backgroundColor: "#000",
                  color: "#fff",
                  fontWeight: "600",
                  fontSize: "15px",
                  border: "none",
                  cursor: "pointer",
                  fontFamily: "Plus Jakarta Sans, sans-serif",
                  transition: "all 0.2s ease-in-out",
                }}
                onMouseOver={(e) => (e.currentTarget.style.opacity = "0.9")}
                onMouseOut={(e) => (e.currentTarget.style.opacity = "1")}
              >
                Login as Customer
              </button>

              <button
                onClick={() => router.push("/not-engineer-login")}
                style={{
                  width: "100%",
                  padding: "16px",
                  borderRadius: "60px",
                  backgroundColor: "#fff",
                  color: "#000",
                  fontWeight: "600",
                  fontSize: "15px",
                  border: "1.5px solid #000",
                  cursor: "pointer",
                  fontFamily: "Plus Jakarta Sans, sans-serif",
                  transition: "all 0.2s ease-in-out",
                }}
                onMouseOver={(e) => (e.currentTarget.style.backgroundColor = "#f9f9f9")}
                onMouseOut={(e) => (e.currentTarget.style.backgroundColor = "#fff")}
              >
                Login as Engineer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default function CreatePassword() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <CreatePasswordContent />
    </Suspense>
  );
}
