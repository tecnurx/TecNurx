import React from "react";
import logimage from "@/assets/images/login.svg";
import logo from "@/assets/images/loglogo.svg";
import Image from "next/image";
import "../login/login.css";
import Link from "next/link";

const ForgotPassword = () => {
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
                Forgot <span>password</span>?
              </h2>
              <p>You’ll create another one in a few minutes</p>
            </div>
            <div className="form">
              <div className="form-group">
                <label htmlFor="">Email Address</label>
                <input type="email" placeholder="Enter email address" />
              </div>
            </div>
            <Link href="/create-password" className="sign-in-btn">
              Submit
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
