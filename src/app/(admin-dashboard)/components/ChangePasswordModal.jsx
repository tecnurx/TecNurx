"use client";

import React, { useState } from "react";
import { Eye, EyeOff, Lock, X, Check, AlertCircle } from "lucide-react";
import { adminAuthService } from "../../../../services/admin/adminlogin";
import { toast } from "@/components/CustomToast";
import { validatePassword } from "@/lib/passwordValidation";

export default function ChangePasswordModal({ isOpen, onClose }) {
  const [passwordCurrent, setPasswordCurrent] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  if (!isOpen) return null;

  // Real-time regex criteria checks
  const criteria = [
    { label: "At least 8 characters", met: password.length >= 8 },
    { label: "At least one uppercase letter (A-Z)", met: /[A-Z]/.test(password) },
    { label: "At least one lowercase letter (a-z)", met: /[a-z]/.test(password) },
    { label: "At least one number (0-9)", met: /[0-9]/.test(password) },
    {
      label: "At least one special character (!@#$%...)",
      met: /[!@#$%^&*(),.?":{}|<>_\-+=\[\]\\\/`~;']/.test(password),
    },
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    if (!passwordCurrent) {
      const msg = "Please enter your current password.";
      setErrorMsg(msg);
      toast.error(msg);
      return;
    }

    // Validate new password against regex rules
    const validation = validatePassword(password);
    if (!validation.isValid) {
      setErrorMsg(validation.message);
      toast.error(validation.message);
      return;
    }

    if (password !== passwordConfirm) {
      const msg = "New password and confirm password do not match.";
      setErrorMsg(msg);
      toast.error(msg);
      return;
    }

    if (passwordCurrent === password) {
      const msg = "New password must be different from your current password.";
      setErrorMsg(msg);
      toast.error(msg);
      return;
    }

    try {
      setLoading(true);
      await adminAuthService.updateMyPassword({
        passwordCurrent,
        password,
        passwordConfirm,
      });

      const okMsg = "Password changed successfully!";
      setSuccessMsg(okMsg);
      toast.success(okMsg);
      setPasswordCurrent("");
      setPassword("");
      setPasswordConfirm("");

      // Delay closing slightly so user visibly sees the in-modal success state
      setTimeout(() => {
        onClose();
        setSuccessMsg("");
      }, 1200);
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        "Failed to change password. Please check your current password.";
      setErrorMsg(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(0, 0, 0, 0.55)",
        backdropFilter: "blur(2px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 9999,
        padding: "16px",
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: "#ffffff",
          borderRadius: "14px",
          width: "100%",
          maxWidth: "460px",
          boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.15), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
          overflow: "hidden",
          animation: "scaleIn 0.15s ease-out",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "18px 24px",
            borderBottom: "1px solid #e5e7eb",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <Lock size={18} color="#ffc400" />
            <h3 style={{ margin: 0, fontSize: "17px", fontWeight: "700", color: "#111827" }}>
              Change My Password
            </h3>
          </div>
          <button
            onClick={onClose}
            disabled={loading}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "#9ca3af",
              padding: "4px",
              display: "flex",
            }}
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ padding: "20px 24px", display: "flex", flexDirection: "column", gap: "14px" }}>
            {/* Inline Error Banner */}
            {errorMsg && (
              <div
                style={{
                  background: "#fee2e2",
                  color: "#991b1b",
                  border: "1px solid #fecaca",
                  borderRadius: "8px",
                  padding: "10px 14px",
                  fontSize: "13px",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                }}
              >
                <AlertCircle size={16} style={{ flexShrink: 0 }} />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Inline Success Banner */}
            {successMsg && (
              <div
                style={{
                  background: "#dcfce7",
                  color: "#166534",
                  border: "1px solid #bbf7d0",
                  borderRadius: "8px",
                  padding: "10px 14px",
                  fontSize: "13px",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                }}
              >
                <Check size={16} style={{ flexShrink: 0 }} />
                <span>{successMsg}</span>
              </div>
            )}

            {/* Current Password */}
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <label style={{ fontSize: "13px", fontWeight: "600", color: "#374151" }}>
                Current Password *
              </label>
              <div style={{ position: "relative" }}>
                <input
                  type={showCurrent ? "text" : "password"}
                  required
                  placeholder="Enter your current password"
                  value={passwordCurrent}
                  onChange={(e) => {
                    setPasswordCurrent(e.target.value);
                    if (errorMsg) setErrorMsg("");
                  }}
                  disabled={loading}
                  style={{
                    width: "100%",
                    padding: "10px 38px 10px 12px",
                    borderRadius: "8px",
                    border: "1px solid #d1d5db",
                    fontSize: "14px",
                    outline: "none",
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowCurrent(!showCurrent)}
                  style={{
                    position: "absolute",
                    right: "12px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    color: "#9ca3af",
                  }}
                >
                  {showCurrent ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* New Password */}
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <label style={{ fontSize: "13px", fontWeight: "600", color: "#374151" }}>
                New Password *
              </label>
              <div style={{ position: "relative" }}>
                <input
                  type={showNew ? "text" : "password"}
                  required
                  placeholder="Create strong new password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (errorMsg) setErrorMsg("");
                  }}
                  disabled={loading}
                  style={{
                    width: "100%",
                    padding: "10px 38px 10px 12px",
                    borderRadius: "8px",
                    border: "1px solid #d1d5db",
                    fontSize: "14px",
                    outline: "none",
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowNew(!showNew)}
                  style={{
                    position: "absolute",
                    right: "12px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    color: "#9ca3af",
                  }}
                >
                  {showNew ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Password Strength Checklist */}
            {password.length > 0 && (
              <div
                style={{
                  backgroundColor: "#f9fafb",
                  border: "1px solid #e5e7eb",
                  borderRadius: "8px",
                  padding: "10px 12px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "4px",
                }}
              >
                {criteria.map((c, i) => (
                  <div
                    key={i}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                      fontSize: "12px",
                      color: c.met ? "#166534" : "#6b7280",
                    }}
                  >
                    <Check
                      size={12}
                      color={c.met ? "#16a34a" : "#d1d5db"}
                      strokeWidth={c.met ? 3 : 2}
                    />
                    <span>{c.label}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Confirm Password */}
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <label style={{ fontSize: "13px", fontWeight: "600", color: "#374151" }}>
                Confirm New Password *
              </label>
              <div style={{ position: "relative" }}>
                <input
                  type={showConfirm ? "text" : "password"}
                  required
                  placeholder="Re-enter new password"
                  value={passwordConfirm}
                  onChange={(e) => {
                    setPasswordConfirm(e.target.value);
                    if (errorMsg) setErrorMsg("");
                  }}
                  disabled={loading}
                  style={{
                    width: "100%",
                    padding: "10px 38px 10px 12px",
                    borderRadius: "8px",
                    border: "1px solid #d1d5db",
                    fontSize: "14px",
                    outline: "none",
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
                  }}
                >
                  {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>

              {passwordConfirm.length > 0 && password !== passwordConfirm && (
                <span style={{ fontSize: "12px", color: "#dc2626" }}>
                  Passwords do not match
                </span>
              )}
            </div>
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              gap: "10px",
              padding: "14px 24px",
              backgroundColor: "#f9fafb",
              borderTop: "1px solid #e5e7eb",
            }}
          >
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              style={{
                padding: "9px 16px",
                borderRadius: "8px",
                border: "1px solid #d1d5db",
                backgroundColor: "#ffffff",
                color: "#374151",
                fontSize: "14px",
                fontWeight: "500",
                cursor: loading ? "not-allowed" : "pointer",
              }}
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading}
              style={{
                padding: "9px 20px",
                borderRadius: "8px",
                border: "none",
                backgroundColor: "#ffc400",
                color: "#000000",
                fontSize: "14px",
                fontWeight: "600",
                cursor: loading ? "not-allowed" : "pointer",
                opacity: loading ? 0.7 : 1,
              }}
            >
              {loading ? "Updating..." : "Update Password"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
