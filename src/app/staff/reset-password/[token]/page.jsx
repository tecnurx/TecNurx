"use client";

import React, { useState, use } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, CheckCircle2, Check } from "lucide-react";
import logo from "@/assets/images/logo.png";
import { adminAuthService } from "@/../services/admin/adminlogin";
import { toast } from "@/components/CustomToast";
import { validatePassword, getPasswordRequirements } from "@/lib/passwordValidation";

export default function StaffResetPasswordPage({ params }) {
  const resolvedParams = use(params);
  const token = resolvedParams?.token;
  const router = useRouter();

  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!password || !passwordConfirm) {
      toast.error("Please fill in both password fields.");
      return;
    }

    if (password !== passwordConfirm) {
      toast.error("Passwords do not match.");
      return;
    }

    const validation = validatePassword(password);
    if (!validation.isValid) {
      toast.error(validation.message);
      return;
    }

    try {
      setLoading(true);
      await adminAuthService.resetPassword(token, {
        password,
        passwordConfirm,
      });

      setSuccess(true);
      toast.success("Password reset successfully! Logging you in...");

      setTimeout(() => {
        router.push("/admin-dashboard");
      }, 1500);
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        "Failed to reset password. The link may have expired or is invalid.";
      toast.error(msg);
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
        <div style={{ textAlign: "center", marginBottom: "28px" }}>
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
            Reset Staff Password
          </h2>
          <p style={{ fontSize: "14px", color: "#6b7280", marginTop: "8px", lineHeight: "1.4" }}>
            Enter your new password below.
          </p>
        </div>

        {success ? (
          <div style={{ textAlign: "center", padding: "24px 0" }}>
            <CheckCircle2 size={48} color="#16a34a" style={{ margin: "0 auto 12px" }} />
            <h3 style={{ fontSize: "18px", fontWeight: "600", color: "#16a34a" }}>
              Password Reset Successfully!
            </h3>
            <p style={{ fontSize: "14px", color: "#6b7280" }}>
              Redirecting you to the Admin Dashboard...
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            <div>
              <label style={{ fontSize: "13px", fontWeight: "600", color: "#374151", display: "block", marginBottom: "6px" }}>
                New Password
              </label>
              <div style={{ position: "relative" }}>
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="Enter new password (min. 8 characters)"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
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
                  onClick={() => setShowPassword(!showPassword)}
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
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
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

            <div>
              <label style={{ fontSize: "13px", fontWeight: "600", color: "#374151", display: "block", marginBottom: "6px" }}>
                Confirm Password
              </label>
              <div style={{ position: "relative" }}>
                <input
                  type={showConfirm ? "text" : "password"}
                  required
                  placeholder="Confirm new password"
                  value={passwordConfirm}
                  onChange={(e) => setPasswordConfirm(e.target.value)}
                  disabled={loading}
                  style={{
                    width: "100%",
                    boxSizing: "border-box",
                    padding: "12px 42px 12px 14px",
                    borderRadius: "10px",
                    border: passwordConfirm && password !== passwordConfirm ? "1px solid #ef4444" : "1px solid #d1d5db",
                    fontSize: "14px",
                    outline: "none",
                    backgroundColor: "#fff",
                    color: "#111827",
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
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
                  {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {passwordConfirm && password !== passwordConfirm && (
                <small style={{ color: "#ef4444", fontSize: "12px", display: "block", marginTop: "4px" }}>
                  Passwords do not match
                </small>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
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
              {loading ? "Resetting Password..." : "Reset Password & Log In"}
            </button>

            <div style={{ textAlign: "center", marginTop: "8px" }}>
              <Link
                href="/not-even-admin-login"
                style={{ fontSize: "14px", color: "#6b7280", textDecoration: "none", fontWeight: "500" }}
              >
                Back to Staff Login
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
