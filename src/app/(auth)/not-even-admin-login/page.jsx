"use client";

import React, { useState } from "react";
import logo from "@/assets/images/logo.png";
import Image from "next/image";
import "./adminlogin.css";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "@/components/CustomToast";
import { adminAuthService } from "../../../../services/admin/adminlogin";

const AdminLogin = () => {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

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

      await adminAuthService.login(payload);

      toast.success("Welcome back! Redirecting...");
      setTimeout(() => router.push("/admin-dashboard"), 1500);
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
      <div className="adminlogin-wrap">
        <div className="admincard-wrap">
          <div className="admincard">
            <Link href="/" className="logi-logo">
              <Image src={logo} alt="logo" width={120} />
            </Link>

            <h2>
              Welcome back, <span>Admin</span>
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
                  <input type="checkbox" id="remember" disabled={loading} />
                  <label htmlFor="remember">Remember me</label>
                </div>
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

export default AdminLogin;
