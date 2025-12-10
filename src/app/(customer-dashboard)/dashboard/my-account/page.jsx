// Settings.jsx
"use client";
import React, { useEffect, useState } from "react";
import "./settings.css";
import {
  User,
  Shield,
  Bell,
  Database,
  Upload,
  Camera,
  Check,
  X,
  Smartphone,
  Globe,
  Mail,
  Lock,
  Trash2,
  Download,
  Loader2,
} from "lucide-react";
import { authService } from "../../../../../services/auth";

const Settings = () => {
  const [activeTab, setActiveTab] = useState("profile");
  const [profilePic, setProfilePic] = useState(null);
  const [twoFA, setTwoFA] = useState(true);
  const [notifications, setNotifications] = useState({
    email: true,
    sms: false,
    app: true,
  });

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePic(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const [currentUser, setCurrentUser] = useState();

  useEffect(() => {
    const response = authService.getCurrentUser();
    setCurrentUser(response);
  }, []);

  // Password Form State
  const [passwordData, setPasswordData] = useState({
    passwordCurrent: "",
    password: "",
    passwordConfirm: "",
  });

  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);

  const handlePasswordChange = async (e) => {
    e.preventDefault();

    // Reset messages
    setPasswordError("");
    setPasswordSuccess("");

    const { passwordCurrent, password, passwordConfirm } = passwordData;

    // Validation
    if (!passwordCurrent)
      return setPasswordError("Current password is required");
    if (!password) return setPasswordError("New password is required");
    if (password.length < 8)
      return setPasswordError("New password must be at least 8 characters");
    if (password !== passwordConfirm) {
      return setPasswordError("New passwords do not match");
    }

    setIsUpdating(true);

    try {
      await authService.updatePassword({
        passwordCurrent,
        password,
      });

      setPasswordSuccess("Password updated successfully!");
      setPasswordData({
        passwordCurrent: "",
        password: "",
        passwordConfirm: "",
      });
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        "Failed to update password. Please try again.";
      setPasswordError(msg);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="settings-page">
      <div className="settings-header">
        <h1>My Account</h1>
        <p>Manage your account preferences and security</p>
      </div>

      {/* Tab Navigation */}
      <div className="settings-tabs">
        <button
          className={activeTab === "profile" ? "tab active" : "tab"}
          onClick={() => setActiveTab("profile")}
        >
          <User size={18} />
          Profile
        </button>
        <button
          className={activeTab === "security" ? "tab active" : "tab"}
          onClick={() => setActiveTab("security")}
        >
          <Shield size={18} />
          Security
        </button>
        {/* <button
          className={activeTab === "notifications" ? "tab active" : "tab"}
          onClick={() => setActiveTab("notifications")}
        >
          <Bell size={18} />
          Notifications
        </button> */}
        <button
          className={activeTab === "privacy" ? "tab active" : "tab"}
          onClick={() => setActiveTab("privacy")}
        >
          <Database size={18} />
          Data & Privacy
        </button>
      </div>

      <div className="settings-content">
        {/* 1. Profile Settings */}
        {activeTab === "profile" && (
          <div className="profile-tab">
            <div className="profile-picture-section">
              <div className="avatar-wrapper">
                {profilePic ? (
                  <img src={profilePic} alt="Profile" className="avatar-img" />
                ) : (
                  <div className="avatar-placeholder">
                    <User size={48} />
                  </div>
                )}
                <label className="upload-btn">
                  <Camera size={18} />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                  />
                </label>
              </div>
              <div>
                <h3>
                  {currentUser?.fname} {currentUser?.lname}
                </h3>
                <p>{currentUser?.email}</p>
              </div>
            </div>

            <form className="profile-form">
              <div className="form-row">
                <div className="form-group">
                  <label>First Name</label>
                  <input
                    type="text"
                    defaultValue="John"
                    value={currentUser?.fname}
                  />
                </div>
                <div className="form-group">
                  <label>Last Name</label>
                  <input
                    type="text"
                    defaultValue="Doe"
                    value={currentUser?.lname}
                  />
                </div>
                <div className="form-group">
                  <label>Email</label>
                  <input
                    type="email"
                    defaultValue="john.doe@example.com"
                    value={currentUser?.email}
                  />
                </div>
                <div className="form-group">
                  <label>Phone Number</label>
                  <input
                    type="tel"
                    defaultValue="+1 (555) 123-4567"
                    value={currentUser?.phoneNumber}
                  />
                </div>
                <div className="form-group">
                  <label>Address</label>
                  <input
                    type="text"
                    defaultValue="123 Main St, New York, NY 10001"
                  />
                </div>
              </div>
              <button type="submit" className="save-btn">
                Save Changes
              </button>
            </form>
          </div>
        )}

        {/* Security Tab */}
        {activeTab === "security" && (
          <div className="security-tab">
            {/* Change Password */}
            <div className="security-section">
              <h3>Change Password</h3>

              {/* Error / Success Messages */}
              {passwordError && (
                <div className="alert error">
                  <X size={18} />
                  {passwordError}
                </div>
              )}
              {passwordSuccess && (
                <div className="alert success">
                  <Check size={18} />
                  {passwordSuccess}
                </div>
              )}

              <form className="password-form" onSubmit={handlePasswordChange}>
                <div className="form-group">
                  <label>Current Password</label>
                  <input
                    type="password"
                    value={passwordData.passwordCurrent}
                    onChange={(e) =>
                      setPasswordData({
                        ...passwordData,
                        passwordCurrent: e.target.value,
                      })
                    }
                    disabled={isUpdating}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>New Password</label>
                  <input
                    type="password"
                    value={passwordData.password}
                    onChange={(e) =>
                      setPasswordData({
                        ...passwordData,
                        password: e.target.value,
                      })
                    }
                    disabled={isUpdating}
                    minLength={8}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Confirm New Password</label>
                  <input
                    type="password"
                    value={passwordData.passwordConfirm}
                    onChange={(e) =>
                      setPasswordData({
                        ...passwordData,
                        passwordConfirm: e.target.value,
                      })
                    }
                    disabled={isUpdating}
                    required
                  />
                  {passwordData.password &&
                    passwordData.passwordConfirm &&
                    passwordData.password !== passwordData.passwordConfirm && (
                      <small style={{ color: "#e74c3c" }}>
                        Passwords do not match
                      </small>
                    )}
                </div>

                <button
                  type="submit"
                  className="save-btn"
                  disabled={
                    isUpdating ||
                    !passwordData.passwordCurrent ||
                    !passwordData.password ||
                    !passwordData.passwordConfirm ||
                    passwordData.password !== passwordData.passwordConfirm ||
                    passwordData.password.length < 8
                  }
                >
                  {isUpdating ? (
                    <>
                      <Loader2 size={18} className="spin" />
                      Updating...
                    </>
                  ) : (
                    "Update Password"
                  )}
                </button>
              </form>
            </div>

            {/* Recent Login Activity */}
            <div className="security-section">
              <h3>Recent Login Activity</h3>
              <div className="login-history">
                <div className="login-item">
                  <Smartphone size={20} />
                  <div>
                    <strong>iPhone 15 Pro</strong> • New York, USA
                    <small>Today, 2:34 PM • Current session</small>
                  </div>
                  <span className="active-dot"></span>
                </div>
                <div className="login-item">
                  <Globe size={20} />
                  <div>
                    <strong>Chrome • Windows</strong> • Los Angeles, USA
                    <small>Yesterday, 9:12 AM</small>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 3. Notifications */}
        {activeTab === "notifications" && (
          <div className="notifications-tab">
            <h3>Notification Preferences</h3>
            <div className="notification-options">
              <div className="notif-item">
                <div>
                  <Mail size={20} />
                  <div>
                    <strong>Email Notifications</strong>
                    <p>Repair updates, promotions, account alerts</p>
                  </div>
                </div>
                <label className="toggle-switch">
                  <input
                    type="checkbox"
                    checked={notifications.email}
                    onChange={() =>
                      setNotifications({
                        ...notifications,
                        email: !notifications.email,
                      })
                    }
                  />
                  <span className="slider"></span>
                </label>
              </div>

              <div className="notif-item">
                <div>
                  <Smartphone size={20} />
                  <div>
                    <strong>SMS Alerts</strong>
                    <p>Critical updates only (repair status, claims)</p>
                  </div>
                </div>
                <label className="toggle-switch">
                  <input
                    type="checkbox"
                    checked={notifications.sms}
                    onChange={() =>
                      setNotifications({
                        ...notifications,
                        sms: !notifications.sms,
                      })
                    }
                  />
                  <span className="slider"></span>
                </label>
              </div>

              <div className="notif-item">
                <div>
                  <Bell size={20} />
                  <div>
                    <strong>App Push Notifications</strong>
                    <p>Real-time updates in the mobile app</p>
                  </div>
                </div>
                <label className="toggle-switch">
                  <input
                    type="checkbox"
                    checked={notifications.app}
                    onChange={() =>
                      setNotifications({
                        ...notifications,
                        app: !notifications.app,
                      })
                    }
                  />
                  <span className="slider"></span>
                </label>
              </div>
            </div>
          </div>
        )}

        {/* 4. Data & Privacy */}
        {activeTab === "privacy" && (
          <div className="privacy-tab">
            <div className="privacy-actions">
              <button className="privacy-btn download">
                <Download size={20} />
                Download My Data
                <small>Receive a copy of all your account data</small>
              </button>

              <button className="privacy-btn delete">
                <Trash2 size={20} />
                Delete Account
                <small>This action is permanent and cannot be undone</small>
              </button>
            </div>

            <div className="legal-notices">
              <h4>Legal & Consent</h4>
              <p>
                By using this service, you agree to our{" "}
                <a href="#">Terms of Service</a> and{" "}
                <a href="#">Privacy Policy</a>. You consent to the collection
                and processing of your personal data as described.
              </p>
              <p>Last updated: December 1, 2025</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Settings;
