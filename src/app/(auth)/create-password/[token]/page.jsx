"use client";

import React, { useState, useEffect, Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Eye, EyeOff, CheckCircle2, Check, X } from "lucide-react";
import logo from "@/assets/images/logo.png";
import { authService } from "../../../../../services/auth";
import { validatePassword, getPasswordRequirements } from "@/lib/passwordValidation";
import { toast } from "@/components/CustomToast";

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
  const passwordCheck = validatePassword(password);
  const isPasswordStrong = passwordCheck.isValid;

  const handleReset = async (e) => {
    e.preventDefault();
    setError("");

    if (!password || !passwordConfirm) {
      setError("Please fill in both password fields.");
      toast.error("Please fill in both password fields.");
      return;
    }

    if (password !== passwordConfirm) {
      setError("Passwords do not match.");
      toast.error("Passwords do not match.");
      return;
    }

    if (!isPasswordStrong) {
      setError(passwordCheck.message);
      toast.error(passwordCheck.message);
      return;
    }

    if (!token) {
      setError("Invalid or expired reset link. Please request a new one.");
      toast.error("Invalid reset token.");
      return;
    }

    setLoading(true);

    try {
      await authService.resetPassword({ password, passwordConfirm, token });
      setShowModal(true);
      toast.success("Password reset successfully!");
    } catch (err) {
      const errMsg =
        err.response?.data?.message ||
        err.message ||
        "Failed to reset password. Link may have expired.";
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
        {/* Header */}
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
            Create a new password
          </h2>
          <p style={{ fontSize: "14px", color: "#6b7280", marginTop: "8px", lineHeight: "1.4" }}>
            Create a strong password to protect your account.
          </p>
        </div>

        {/* Error Banner */}
        {error && (
          <div
            style={{
              padding: "12px 14px",
              background: "#fef2f2",
              border: "1px solid #fecaca",
              borderRadius: "10px",
              marginBottom: "20px",
              color: "#b91c1c",
              fontSize: "13px",
              lineHeight: "1.4",
            }}
          >
            {error}
          </div>
        )}

        <form onSubmit={handleReset} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          {/* New Password */}
          <div>
            <label style={{ fontSize: "13px", fontWeight: "600", color: "#374151", display: "block", marginBottom: "6px" }}>
              New Password
            </label>
            <div style={{ position: "relative" }}>
              <input
                type={showpassword ? "text" : "password"}
                placeholder="Enter strong password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading || showModal}
                style={{
                  width: "100%",
                  boxSizing: "border-box",
                  padding: "12px 42px 12px 14px",
                  borderRadius: "10px",
                  border: "1px solid #d1d5db",
                  fontSize: "14px",
                  outline: "none",
                  backgroundColor: "#fff",
                  color: "#111827",
                }}
              />
              <button
                type="button"
                onClick={() => setShowpassword(!showpassword)}
                style={{
                  position: "absolute",
                  right: "12px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "#9ca3af",
                  padding: "4px",
                  display: "flex",
                  alignItems: "center",
                }}
              >
                {showpassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            {/* Password Requirements Checklist */}
            {password && (
              <div
                style={{
                  background: "#f9fafb",
                  border: "1px solid #e5e7eb",
                  borderRadius: "10px",
                  padding: "12px 14px",
                  marginTop: "10px",
                  fontSize: "12px",
                }}
              >
                <p style={{ fontWeight: 600, color: "#374151", marginBottom: "8px", margin: 0 }}>
                  Password must contain:
                </p>
                <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "5px", marginTop: "6px" }}>
                  {getPasswordRequirements(password).map((req, idx) => (
                    <div
                      key={idx}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                        color: req.met ? "#16a34a" : "#6b7280",
                        fontSize: "12px",
                        fontWeight: req.met ? "600" : "400",
                      }}
                    >
                      {req.met ? (
                        <Check size={14} color="#16a34a" strokeWidth={3} />
                      ) : (
                        <span
                          style={{
                            width: "5px",
                            height: "5px",
                            borderRadius: "50%",
                            backgroundColor: "#9ca3af",
                            display: "inline-block",
                            marginLeft: "4px",
                            marginRight: "4px",
                          }}
                        />
                      )}
                      <span>{req.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Confirm Password */}
          <div>
            <label style={{ fontSize: "13px", fontWeight: "600", color: "#374151", display: "block", marginBottom: "6px" }}>
              Confirm Password
            </label>
            <div style={{ position: "relative" }}>
              <input
                type={showpasswordConfirm ? "text" : "password"}
                placeholder="Re-enter password"
                value={passwordConfirm}
                onChange={(e) => setPasswordConfirm(e.target.value)}
                required
                disabled={loading || showModal}
                style={{
                  width: "100%",
                  boxSizing: "border-box",
                  padding: "12px 42px 12px 14px",
                  borderRadius: "10px",
                  border: passwordConfirm && !isPasswordMatch ? "1px solid #ef4444" : "1px solid #d1d5db",
                  fontSize: "14px",
                  outline: "none",
                  backgroundColor: "#fff",
                  color: "#111827",
                }}
              />
              <button
                type="button"
                onClick={() => setShowpasswordConfirm(!showpasswordConfirm)}
                style={{
                  position: "absolute",
                  right: "12px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "#9ca3af",
                  padding: "4px",
                  display: "flex",
                  alignItems: "center",
                }}
              >
                {showpasswordConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {passwordConfirm && !isPasswordMatch && (
              <small style={{ color: "#ef4444", fontSize: "12px", display: "block", marginTop: "4px" }}>
                Passwords do not match
              </small>
            )}
          </div>

          <button
            type="submit"
            disabled={loading || showModal}
            style={{
              backgroundColor: "#ffc400",
              color: "#000",
              border: "none",
              borderRadius: "10px",
              padding: "13px",
              fontSize: "15px",
              fontWeight: "700",
              cursor: loading ? "not-allowed" : "pointer",
              opacity: loading ? 0.7 : 1,
              transition: "all 0.2s ease",
              marginTop: "4px",
            }}
          >
            {loading ? "Saving Password..." : "Save Password"}
          </button>

          <div style={{ textAlign: "center", marginTop: "8px" }}>
            <Link
              href="/login"
              style={{ fontSize: "14px", color: "#6b7280", textDecoration: "none", fontWeight: "500" }}
            >
              Back to Sign In
            </Link>
          </div>
        </form>
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
                  color: "#111827",
                  marginBottom: "8px",
                  margin: 0,
                }}
              >
                Password Reset Successful!
              </h3>
              <p
                style={{
                  fontSize: "14px",
                  color: "#6b7280",
                  lineHeight: "1.5",
                  marginTop: "8px",
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
                  padding: "14px",
                  borderRadius: "10px",
                  backgroundColor: "#000",
                  color: "#fff",
                  fontWeight: "700",
                  fontSize: "15px",
                  border: "none",
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                }}
              >
                Login as Customer
              </button>

              <button
                onClick={() => router.push("/not-engineer-login")}
                style={{
                  width: "100%",
                  padding: "14px",
                  borderRadius: "10px",
                  backgroundColor: "#fff",
                  color: "#000",
                  fontWeight: "700",
                  fontSize: "15px",
                  border: "1.5px solid #d1d5db",
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                }}
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
    <Suspense fallback={<div style={{ padding: "40px", textAlign: "center" }}>Loading...</div>}>
      <CreatePasswordContent />
    </Suspense>
  );
}
