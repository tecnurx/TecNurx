"use client";

import React, { useState } from "react";
import logimage from "@/assets/images/login.svg";
import logo from "@/assets/images/loglogo.svg";
import google from "@/assets/images/google.svg";
import facebook from "@/assets/images/facebook.svg";
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

      console.log("Login payload →", payload);

      // This hits your backend: /api/v1/users/loginUser
      const response = await authService.login(payload);

      // Success!
      toast.success("Welcome back! Redirecting...");

      // Token & user already saved in authService.login()
      setTimeout(() => {
        router.push("/dashboard"); // Change to your protected route
      }, 1500);
    } catch (err) {
      console.error("Login error:", err);

      // Handle common backend errors
      if (err.response?.status === 401) {
        toast.error("Invalid email/phone or password");
      } else if (err.response?.status === 404) {
        toast.error("Account not found. Please sign up first.");
      } else if (err.response?.data?.message) {
        toast.error(err.response.data.message);
      } else if (err.code === "ERR_NETWORK") {
        toast.error("Server is waking up... Try again in 30s");
      } else {
        toast.error("Login failed. Please try again.");
      }
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

            <h2>
              Welcome <span>back</span>
            </h2>

            <div className="auth-options">
              <div>
                <Image src={google} alt="google" />
                <span>Google</span>
              </div>
              <div>
                <Image src={facebook} alt="facebook" />
                <span>Facebook</span>
              </div>
            </div>

            <div className="divider">
              <h6></h6>
              <h4>or</h4>
              <h6></h6>
            </div>

            <form onSubmit={handleSubmit} className="form">
              <div className="form-group">
                <label>Email or Phone Number</label>
                <input
                  type="text"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter email or phone number"
                  required
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
                    }}
                  >
                    {showPassword ? <Eye size={20} /> : <EyeOff size={20} />}
                  </span>
                </div>
              </div>

              <div className="remember-forgot">
                <div>
                  <input type="checkbox" id="remember" />
                  <label htmlFor="remember">Remember me</label>
                </div>
                <Link href="/forgot-password">Forgot Password?</Link>
              </div>

              <div className="sign-btn">
                <button
                  type="submit"
                  disabled={loading}
                  className="sign-in-btn"
                  style={{
                    opacity: loading ? 0.8 : 1,
                    cursor: loading ? "not-allowed" : "pointer",
                  }}
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
