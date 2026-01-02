"use client";

import React, { useState, useEffect } from "react";
import "./setup.css";

const EngineerAccount = () => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 2000);
    return () => clearTimeout(timer);
  }, []);

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
        <form className="settings-form">
          <div className="form-grid">
            <div className="form-group">
              <label>First Name</label>
              <input type="text" defaultValue="Israel" />
            </div>
            <div className="form-group">
              <label>Last Name</label>
              <input type="text" defaultValue="Olayiwola" />
            </div>
            <div className="form-group">
              <label>Email Address</label>
              <input type="email" defaultValue="israelolayiwola@gmail.com" />
            </div>
            <div className="form-group">
              <label>Contact Number</label>
              <input type="tel" defaultValue="09098339187" />
            </div>
            <div className="form-group">
              <label>Office Address</label>
              <input
                type="text"
                defaultValue=""
                placeholder="Enter office address"
              />
            </div>
            <div className="form-group">
              <label>Account Name</label>
              <input type="text" defaultValue="Israel Olayiwola" />
            </div>
            <div className="form-group">
              <label>Account Number</label>
              <input type="text" defaultValue="09098339187" />
            </div>
            <div className="form-group">
              <label>Bank Name</label>
              <input type="text" defaultValue="GTBank" />
            </div>
          </div>

          <h3>Create a New Password</h3>
          <div className="password-grid">
            <div className="form-group">
              <label>New Password</label>
              <input type="password" placeholder="Enter new password" />
            </div>
            <div className="form-group">
              <label>Confirm Password</label>
              <input type="password" placeholder="Confirm new password" />
            </div>
          </div>

          <button type="submit" className="btn-primary">
            Save Changes
          </button>
        </form>
      </div>
    </div>
  );
};

export default EngineerAccount;
