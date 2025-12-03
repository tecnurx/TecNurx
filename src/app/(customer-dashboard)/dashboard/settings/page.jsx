// Settings.jsx
"use client";
import React, { useState } from "react";
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
} from "lucide-react";

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

  return (
    <div className="settings-page">
      <div className="settings-header">
        <h1>Settings</h1>
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
        <button
          className={activeTab === "notifications" ? "tab active" : "tab"}
          onClick={() => setActiveTab("notifications")}
        >
          <Bell size={18} />
          Notifications
        </button>
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
                <h3>John Doe</h3>
                <p>john.doe@example.com</p>
              </div>
            </div>

            <form className="profile-form">
              <div className="form-row">
                <div className="form-group">
                  <label>Full Name</label>
                  <input type="text" defaultValue="John Doe" />
                </div>
                <div className="form-group">
                  <label>Email</label>
                  <input type="email" defaultValue="john.doe@example.com" />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Phone Number</label>
                  <input type="tel" defaultValue="+1 (555) 123-4567" />
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

        {/* 2. Security */}
        {activeTab === "security" && (
          <div className="security-tab">
            <div className="security-section">
              <h3>Change Password</h3>
              <form className="password-form">
                <div className="form-group">
                  <label>Current Password</label>
                  <input type="password" />
                </div>
                <div className="form-group">
                  <label>New Password</label>
                  <input type="password" />
                </div>
                <div className="form-group">
                  <label>Confirm New Password</label>
                  <input type="password" />
                </div>
                <button type="submit" className="save-btn">
                  Update Password
                </button>
              </form>
            </div>

            <div className="security-section">
              <div className="twofa-toggle">
                <div>
                  <h3>Two-Factor Authentication</h3>
                  <p>Add an extra layer of security to your account</p>
                </div>
                <label className="toggle-switch">
                  <input
                    type="checkbox"
                    checked={twoFA}
                    onChange={() => setTwoFA(!twoFA)}
                  />
                  <span className="slider"></span>
                </label>
              </div>
            </div>

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
