"use client";
import React, { useState } from "react";
import logimage from "@/assets/images/login.svg";
import logo from "@/assets/images/loglogo.svg";
import Image from "next/image";
import "../login/login.css";
import { Eye, EyeOff } from "lucide-react";
import Link from "next/link";

const CreatePassword = () => {
  const [showNewPassword, setShowNewPassword] = useState(false);
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
            <div>
              <h2>
                Create a new <span>password</span>
              </h2>
              <p>Create a strong password to protect your account</p>
            </div>
            <div className="form">
              <div className="form-group">
                <label htmlFor="">New Password</label>
                <input
                  type={showNewPassword ? "text" : "password"}
                  placeholder="Enter a strong password"
                />
                <span
                  className="eye"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                >
                  {showPassword ? <Eye size={20} /> : <EyeOff size={20} />}
                </span>
              </div>
              <div className="form-group">
                <label htmlFor="">Confirm Password</label>
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="*********"
                />
                <span
                  className="eye"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <Eye size={20} /> : <EyeOff size={20} />}
                </span>
              </div>
            </div>
            <button className="sign-in-btn">Save Password</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreatePassword;
