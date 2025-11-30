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

const Login = () => {
    const [showPassword, setShowPassword] = useState(false);
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
            <div className="form">
              <div className="form-group">
                <label htmlFor="">Email or Phone Number</label>
                <input type="text" placeholder="Enter email or phone number" />
              </div>
              <div className="form-group">
                <label htmlFor="">Password</label>
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter password"
                />
                <span
                  className="eye"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <Eye size={20} /> : <EyeOff size={20} />}
                </span>
              </div>
              <div className="remember-forgot">
                <div>
                  <input type="checkbox" name="" id="" />
                  Remember me
                </div>
                <Link href="/forgot-password">Forgot Password?</Link>
              </div>
            </div>
            <div className="sign-btn">
              <button className="sign-in-btn">Sign In</button>
              <div>
                <h6>Don't have an account?</h6>
                <Link href="/register">Sign Up</Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
