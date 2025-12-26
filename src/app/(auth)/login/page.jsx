"use client";

import React, { useState } from "react";
import logimage from "@/assets/images/login.svg";
import logo from "@/assets/images/logo.png";
import google from "@/assets/images/google.svg";
import Image from "next/image";
import "./login.css";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";
import { useRouter } from "next/navigation";
import { authService } from "./../../../../services/auth";
import { toast } from "@/components/CustomToast";

const Login = () => {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.email || !formData.password) {
      toast.error("Please fill in all fields");
      return;
    }

    setLoading(true);

    try {
      const payload = {
        email: formData.email.trim(),
        password: formData.password,
      };

      await authService.login(payload);

      toast.success("Welcome back! Redirecting...");
      setTimeout(() => router.push("/dashboard"), 1500);
    } catch (err) {
      console.error("Login error:", err);
      const message =
        err.response?.data?.message ||
        (err.response?.status === 401
          ? "Invalid email or password"
          : err.response?.status === 404
          ? "Account not found"
          : "Login failed. Please try again.");

      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  // Google OAuth Handler
  const handleGoogleLogin = () => {
    setGoogleLoading(true);
    toast.info("Redirecting to Google...");

    try {
      // Construct the full OAuth URL
      const baseURL = process.env.NEXT_PUBLIC_API_URL;
      const oauthUrl = `${baseURL}/users/auth/google`;

      // Direct redirect to backend OAuth endpoint
      window.location.href = oauthUrl;
    } catch (err) {
      console.error("Google OAuth error:", err);
      toast.error("Google login unavailable. Please try again later.");
      setGoogleLoading(false);
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

            <h2>
              Welcome <span>back</span>
            </h2>

            <div className="auth-options">
              <div
                onClick={handleGoogleLogin}
                style={{
                  cursor: googleLoading ? "not-allowed" : "pointer",
                  opacity: googleLoading ? 0.7 : 1,
                  // display: "flex",
                  // alignItems: "center",
                  // gap: "12px",
                  // padding: "12px",
                  // border: "1px solid #ddd",
                  // borderRadius: "8px",
                  // background: "#fff",
                  // transition: "all 0.2s",
                }}
                onMouseOver={(e) =>
                  !googleLoading &&
                  (e.currentTarget.style.background = "#f9f9f9")
                }
                onMouseOut={(e) =>
                  !googleLoading && (e.currentTarget.style.background = "#fff")
                }
              >
                <Image src={google} alt="google" />
                <span>{googleLoading ? "Connecting..." : "Google"}</span>
              </div>
            </div>

            <div className="divider">
              <h6></h6>
              <h4>or</h4>
              <h6></h6>
            </div>

            <form onSubmit={handleSubmit} className="form">
              <div className="form-group">
                <label>Email Address</label>
                <input
                  type="text"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter email or phone number"
                  required
                  disabled={loading}
                />
              </div>

              <div className="form-group">
                <label>Password</label>
                <div
                  className="password-wrapper"
                  style={{ position: "relative" }}
                >
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Enter password"
                    required
                    disabled={loading}
                  />
                  <span
                    className="eye"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{
                      position: "absolute",
                      right: "12px",
                      top: "50%",
                      transform: "translateY(-50%)",
                      cursor: "pointer",
                      pointerEvents: loading ? "none" : "auto",
                    }}
                  >
                    {showPassword ? <Eye size={20} /> : <EyeOff size={20} />}
                  </span>
                </div>
              </div>

              <div className="remember-forgot">
                <div>
                  <input type="checkbox" id="remember" disabled={loading} />
                  <label htmlFor="remember">Remember me</label>
                </div>
                <Link href="/forgot-password">Forgot Password?</Link>
              </div>

              <div className="sign-btn">
                <button
                  type="submit"
                  disabled={loading || googleLoading}
                  className="sign-in-btn"
                >
                  {loading ? "Signing In..." : "Sign In"}
                </button>

                <div>
                  <h6>Don't have an account?</h6>
                  <Link href="/register">Sign Up</Link>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
