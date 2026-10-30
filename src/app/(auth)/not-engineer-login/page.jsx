"use client";

import React, { useState, useEffect } from "react";
import logo from "@/assets/images/logo.png";
import Image from "next/image";
import "./englogin.css";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "@/components/CustomToast";
import { engineerAuthService } from './../../../../services/eng/engineerAuth';

const REMEMBER_KEY = "tecnurx_remember_engineer";

const EngineerLogin = () => {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  // Load remembered credentials on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(REMEMBER_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.email && parsed.password) {
          setFormData({
            email: parsed.email,
            password: parsed.password,
          });
          setRememberMe(true);
        }
      }
    } catch (e) {
      console.error("Failed to parse remembered engineer credentials", e);
    }
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleRememberToggle = (e) => {
    const isChecked = e.target.checked;
    setRememberMe(isChecked);
    if (!isChecked) {
      localStorage.removeItem(REMEMBER_KEY);
    }
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

      const response = await engineerAuthService.login(payload);

      // Handle Remember Me persistence on successful login
      if (rememberMe) {
        localStorage.setItem(
          REMEMBER_KEY,
          JSON.stringify({
            email: formData.email.trim(),
            password: formData.password,
          })
        );
      } else {
        localStorage.removeItem(REMEMBER_KEY);
      }

      const hasProfile = response.data?.hasServicePartnerProfile;

      if (hasProfile === false) {
        toast.info("Please complete your professional profile to access the dashboard.");
        setTimeout(() => router.push("/engineer-dashboard/complete-profile"), 1500);
      } else {
        toast.success("Welcome back! Redirecting...");
        setTimeout(() => router.push("/engineer-dashboard"), 1500);
      }
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

  return (
    <div>
      <div className="englogin-wrap">
        <div className="engcard-wrap">
          <div className="engcard">
            <Link href="/" className="logi-logo">
              <Image src={logo} alt="logo" width={120} />
            </Link>

            <h2>
              Welcome back, <span>Engineer</span>
            </h2>

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
                  <input
                    type="checkbox"
                    id="remember"
                    checked={rememberMe}
                    onChange={handleRememberToggle}
                    disabled={loading}
                    style={{ cursor: "pointer" }}
                  />
                  <label htmlFor="remember" style={{ cursor: "pointer" }}>
                    Remember me
                  </label>
                </div>
                <Link href="/not-engineer-login/forgot-password">Forgot Password?</Link>
              </div>

              <div className="sign-btn">
                <button
                  type="submit"
                  disabled={loading}
                  className="sign-in-btn"
                >
                  {loading ? "Signing In..." : "Sign In"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EngineerLogin;
