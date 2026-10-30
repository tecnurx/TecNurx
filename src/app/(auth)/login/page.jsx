"use client";

import React, { useState, useEffect, Suspense } from "react";
import logimage from "@/assets/images/login.svg";
import logo from "@/assets/images/logo.png";
import Image from "next/image";
import "./login.css";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { authService } from "./../../../../services/auth";
import { toast } from "@/components/CustomToast";

const REMEMBER_KEY = "technurx_remember_user";

const Login = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
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
      console.error("Failed to parse remembered credentials", e);
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

      await authService.login(payload);

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

      toast.success("Welcome back! Redirecting...");

      const redirectParam = searchParams.get("redirect");
      let dest = redirectParam;
      if (!dest && typeof window !== "undefined") {
        try {
          const pending = localStorage.getItem("pendingRepairEstimate");
          if (pending) {
            const parsed = JSON.parse(pending);
            if (parsed.bookingUrl) {
              dest = parsed.bookingUrl;
            }
          }
        } catch (e) {
          // ignore
        }
      }

      setTimeout(() => router.push(dest || "/dashboard"), 1500);
    } catch (err) {
      console.error("Login error:", err);

      const response = err.response?.data;

      // Check for unverified account specifically
      if (
        response?.status === "error" &&
        response?.message?.toLowerCase().includes("not verified") &&
        (response?.error?.statusCode === 401 || err.response?.status === 401)
      ) {
        toast.error("Please verify your email first");
        localStorage.setItem("pendingVerificationEmail", formData.email.trim());
        router.push("/verify-email");
        setLoading(false);
        return;
      }

      // Fallback error messages for other cases
      let message = "Login failed. Please try again.";

      if (err.response?.status === 401) {
        message = "Invalid email or password";
      } else if (err.response?.status === 404) {
        message = "Account not found";
      } else if (response?.message) {
        message = response.message;
      }

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
      const baseURL = process.env.NEXT_PUBLIC_API_URL;
      const oauthUrl = `${baseURL}/users/auth/google/callback`;
      window.location.href = oauthUrl;
    } catch (err) {
      console.error("Google OAuth error:", err);
      toast.error("Google login unavailable. Please try again later.");
      setGoogleLoading(false);
    }
  };

  return (
    <div className="login-page-container">
      <div className="login-wrap">
        <div className="login-image-col">
          <Image
            className="sideimage"
            src={logimage}
            alt="TecNurx Devices"
            priority
          />
        </div>

        <div className="card-wrap">
          <div className="card login-card">
            <Link href="/" className="logi-logo" aria-label="TecNurx Home">
              <Image src={logo} alt="TecNurx" width={135} priority />
            </Link>

            <h2 className="login-heading">
              Welcome <span>back</span>
            </h2>

            <form onSubmit={handleSubmit} className="form">
              <div className="form-group">
                <label htmlFor="login-email">E-mail</label>
                <input
                  id="login-email"
                  type="text"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter email"
                  required
                  disabled={loading}
                />
              </div>

              <div className="form-group">
                <label htmlFor="login-password">Password</label>
                <div className="password-wrapper">
                  <input
                    id="login-password"
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Enter password"
                    required
                    disabled={loading}
                  />
                  <button
                    type="button"
                    className="eye"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={loading}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <Eye size={19} /> : <EyeOff size={19} />}
                  </button>
                </div>
              </div>

              <div className="remember-forgot">
                <label className="remember-label" htmlFor="remember">
                  <input
                    type="checkbox"
                    id="remember"
                    checked={rememberMe}
                    onChange={handleRememberToggle}
                    disabled={loading}
                  />
                  <span>Remember me</span>
                </label>
                <Link href="/forgot-password" className="forgot-link">
                  Forgot Password?
                </Link>
              </div>

              <button
                type="submit"
                disabled={loading || googleLoading}
                className="btn-signin-primary"
              >
                {loading ? "Signing In..." : "Sign In"}
              </button>

              <div className="signup-prompt">
                <span>Don't have an account? </span>
                <Link href="/register">Sign up</Link>
              </div>

              <div className="auth-divider">
                <span className="divider-line" />
                <span className="divider-text">or</span>
                <span className="divider-line" />
              </div>

              <button
                type="button"
                onClick={handleGoogleLogin}
                disabled={googleLoading || loading}
                className="btn-signin-google"
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  aria-hidden="true"
                >
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    fill="#EA4335"
                  />
                </svg>
                <span>{googleLoading ? "Connecting..." : "Google"}</span>
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <Login />
    </Suspense>
  );
}
