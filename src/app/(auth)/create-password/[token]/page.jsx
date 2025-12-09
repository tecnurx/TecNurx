"use client";
import React, { useState, useEffect } from "react";
import logimage from "@/assets/images/login.svg";
import logo from "@/assets/images/loglogo.svg";
import Image from "next/image";
import "../../login/login.css";
import { Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation"; // For App Router
import { authService } from "../../../../../services/auth";

const CreatePassword = () => {
  const router = useRouter();
  const searchParams = useSearchParams(); // To get query params (if using ?token=)

  const [showpassword, setShowpassword] = useState(false);
  const [showpasswordConfirm, setShowpasswordConfirm] = useState(false);

  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [token, setToken] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // Extract token from URL
  useEffect(() => {
    // Option 1: Token in path like /reset-password/abc123
    const path = window.location.pathname;
    const pathParts = path.split("/");
    const tokenFromPath = pathParts[pathParts.length - 1];

    // Option 2: Token in query param like ?token=abc123
    const tokenFromQuery = searchParams.get("token");

    const extractedToken =
      tokenFromPath && tokenFromPath.length > 10
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

  // Password match validation
  const isPasswordMatch =
    password && passwordConfirm && password === passwordConfirm;
  const isPasswordStrong =
    password.length >= 8 &&
    // /[A-Z]/.test(password) &&
    /[a-z]/.test(password) &&
    /[0-9]/.test(password) &&
    /[!@#$%^&*(),.?":{}|<>]/.test(password);

  const handleReset = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");

    // Validation
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
        "Password must be 8+ chars with uppercase, lowercase, number, and special character."
      );
      return;
    }

    if (!token) {
      setError("Invalid token. Please try resetting again.");
      return;
    }

    setLoading(true);

    try {
      await authService.resetPassword({ password, passwordConfirm, token }); // Make sure this matches your service

      setMessage(
        "Your password has been successfully reset! Redirecting to login..."
      );

      setTimeout(() => {
        router.push("/login");
      }, 3000);
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
              <Image src={logo} alt="logo" />
            </Link>
            <div>
              <h2>
                Create a new <span>password</span>
              </h2>
              <p>Create a strong password to protect your account</p>
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

            <form onSubmit={handleReset} className="form">
              {/* New Password */}
              <div className="form-group">
                <label>New Password</label>
                <div
                  className="password-wrapper"
                  // style={{ position: "relative" }}
                >
                  <input
                    type={showpassword ? "text" : "password"}
                    placeholder="Enter strong password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={loading}
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
                <div
                  className="password-wrapper"
                  // style={{ position: "relative" }}
                >
                  <input
                    type={showpasswordConfirm ? "text" : "password"}
                    placeholder="Re-enter password"
                    value={passwordConfirm}
                    onChange={(e) => setPasswordConfirm(e.target.value)}
                    required
                    disabled={loading}
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
                disabled={loading || !isPasswordMatch || !isPasswordStrong}
              >
                {loading ? "Saving..." : "Save Password"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreatePassword;
