"use client";

import React, { useState, useEffect } from "react";
import "./setup.css";
import axios from '../../../../../lib/axios';
import { toast } from "@/components/CustomToast";

const EngineerAccount = () => {
  const [loading, setLoading] = useState(true);
  const [passwordCurrent, setPasswordCurrent] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [updatingPassword, setUpdatingPassword] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    if (!passwordCurrent || !password || !passwordConfirm) {
      toast.error("Please fill in all password fields.");
      return;
    }
    if (password !== passwordConfirm) {
      toast.error("New passwords do not match.");
      return;
    }
    setUpdatingPassword(true);
    try {
      await axios.patch("/users/updateMyPassword", { passwordCurrent, password, passwordConfirm });
      toast.success("Password updated successfully!");
      setPasswordCurrent("");
      setPassword("");
      setPasswordConfirm("");
    } catch (err) {
      console.error("Failed to update password:", err);
      toast.error(err.response?.data?.message || "Failed to update password.");
    } finally {
      setUpdatingPassword(false);
    }
  };

  if (loading) {
    return (
      <div className="resolve-wrap">
        <p>Loading...</p>
        <div className="respinner"></div>
      </div>
    );
  }

  return (
    <div className="account-settings">
      <div className="card">
        <h2>Account Information</h2>
        <form className="settings-form" onSubmit={(e) => e.preventDefault()}>
          <div className="form-grid">
            <div className="engform-group">
              <label>First Name</label>
              <input type="text" defaultValue="Israel" />
            </div>
            <div className="engform-group">
              <label>Last Name</label>
              <input type="text" defaultValue="Olayiwola" />
            </div>
            <div className="engform-group">
              <label>Email Address</label>
              <input type="email" defaultValue="israelolayiwola@gmail.com" />
            </div>
            <div className="engform-group">
              <label>Contact Number</label>
              <input type="tel" defaultValue="09098339187" />
            </div>
            <div className="engform-group">
              <label>Office Address</label>
              <input
                type="text"
                defaultValue=""
                placeholder="Enter office address"
              />
            </div>
            <div className="engform-group">
              <label>Account Name</label>
              <input type="text" defaultValue="Israel Olayiwola" />
            </div>
            <div className="engform-group">
              <label>Account Number</label>
              <input type="text" defaultValue="09098339187" />
            </div>
            <div className="engform-group">
              <label>Bank Name</label>
              <input type="text" defaultValue="GTBank" />
            </div>
          </div>
          <button type="button" className="btn-primary" style={{ marginBottom: "40px" }}>
            Save Account Details
          </button>
        </form>

        <form className="settings-form" onSubmit={handleUpdatePassword}>
          <h3>Update my Password</h3>
          <div className="password-grid">
            <div className="engform-group">
              <label>Current Password</label>
              <input 
                type="password" 
                placeholder="Enter current password" 
                value={passwordCurrent}
                onChange={(e) => setPasswordCurrent(e.target.value)}
                required
              />
            </div>
            <div className="engform-group">
              <label>New Password</label>
              <input 
                type="password" 
                placeholder="Enter new password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <div className="engform-group">
              <label>Confirm New Password</label>
              <input 
                type="password" 
                placeholder="Confirm new password" 
                value={passwordConfirm}
                onChange={(e) => setPasswordConfirm(e.target.value)}
                required
              />
            </div>
          </div>

          <button type="submit" className="btn-primary" disabled={updatingPassword}>
            {updatingPassword ? "Updating..." : "Update Password"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default EngineerAccount;
