"use client";

import React, { useState, use } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Lock, CheckCircle2 } from "lucide-react";
import logo from "@/assets/images/logo.png";
import "@/app/(auth)/login/login.css";
import { adminAuthService } from "@/../services/admin/adminlogin";
import { toast } from "@/components/CustomToast";
import { validatePassword } from "@/lib/passwordValidation";

export default function StaffSetPasswordPage({ params }) {
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
      toast.success("Account activated! Logging you in...");

      setTimeout(() => {
        router.push("/admin-dashboard");
      }, 1500);
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        "Failed to set password. The token may be invalid or expired.";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-wrap" style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" }}>
      <div className="card-wrap" style={{ maxWidth: "440px", width: "100%", background: "#fff", borderRadius: "16px", padding: "32px", boxShadow: "0 10px 25px rgba(0,0,0,0.08)" }}>
        <div style={{ textAlign: "center", marginBottom: "24px" }}>
          <Image src={logo} alt="TecNurx Logo" width={140} height={40} style={{ objectFit: "contain", margin: "0 auto 16px" }} />
          <h2 style={{ fontSize: "22px", fontWeight: "700", color: "#111827", margin: 0 }}>
            Set Your Staff Password
          </h2>
          <p style={{ fontSize: "14px", color: "#6b7280", marginTop: "6px" }}>
            Welcome to the TecNurx Staff Portal. Please set a password for your account.
          </p>
        </div>

        {success ? (
          <div style={{ textAlign: "center", padding: "24px 0" }}>
            <CheckCircle2 size={48} color="#16a34a" style={{ margin: "0 auto 12px" }} />
            <h3 style={{ fontSize: "18px", fontWeight: "600", color: "#16a34a" }}>
              Password Set Successfully!
            </h3>
            <p style={{ fontSize: "14px", color: "#6b7280" }}>
              Redirecting you to the Admin Dashboard...
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
            <div className="form-group">
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
                    padding: "10px 40px 10px 12px",
                    borderRadius: "8px",
                    border: "1px solid #d1d5db",
                    fontSize: "14px",
                    outline: "none",
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
                  }}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div className="form-group">
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
                    padding: "10px 40px 10px 12px",
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
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                backgroundColor: "#ffc400",
                color: "#000",
                border: "none",
                borderRadius: "8px",
                padding: "12px",
                fontSize: "15px",
                fontWeight: "600",
                cursor: loading ? "not-allowed" : "pointer",
                opacity: loading ? 0.7 : 1,
                transition: "background 0.2s ease",
              }}
            >
              {loading ? "Setting Password..." : "Set Password & Log In"}
            </button>

            <div style={{ textAlign: "center", marginTop: "12px" }}>
              <Link
                href="/not-even-admin-login"
                style={{ fontSize: "13px", color: "#4b5563", textDecoration: "none" }}
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
