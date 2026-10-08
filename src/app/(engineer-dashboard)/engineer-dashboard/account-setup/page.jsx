"use client";

import React, { useEffect, useState } from "react";
import "./setup.css";
import {
  User,
  Shield,
  Database,
  Camera,
  Check,
  X,
  Trash2,
  Download,
  Loader2,
} from "lucide-react";
import { authService } from "../../../../../services/auth";

const EngineerAccountSetup = () => {
  const [activeTab, setActiveTab] = useState("profile");
  const [profilePic, setProfilePic] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);

  // Load initial current user
  useEffect(() => {
    const user = authService.getCurrentUser();
    setCurrentUser(user);
    setLoading(false);
  }, []);

  // Password Form State
  const [passwordData, setPasswordData] = useState({
    passwordCurrent: "",
    password: "",
    passwordConfirm: "",
  });

  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setPasswordError("");
    setPasswordSuccess("");

    const { passwordCurrent, password, passwordConfirm } = passwordData;

    if (!passwordCurrent)
      return setPasswordError("Current password is required");
    if (!password) return setPasswordError("New password is required");
    if (password.length < 8)
      return setPasswordError("New password must be at least 8 characters");
    if (password !== passwordConfirm) {
      return setPasswordError("New passwords do not match");
    }

    setIsUpdatingPassword(true);

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
      setIsUpdatingPassword(false);
    }
  };

  // Profile Update State
  const [userUpdateError, setUserUpdateError] = useState("");
  const [userUpdateSuccess, setUserUpdateSuccess] = useState("");
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [userUpdateData, setUserUpdateData] = useState({
    lname: "",
    fname: "",
    email: "",
    phoneNumber: "",
  });

  // Populate user data when currentUser updates
  useEffect(() => {
    if (currentUser) {
      setUserUpdateData({
        fname: currentUser.fname || "",
        lname: currentUser.lname || "",
        email: currentUser.email || "",
        phoneNumber: currentUser.phoneNumber || "",
      });
      if (currentUser.photo) {
        setProfilePic(currentUser.photo);
      }
    }
  }, [currentUser]);

  /*
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
  */

  const updateUserInfo = async (e) => {
    e.preventDefault();
    setUserUpdateError("");
    setUserUpdateSuccess("");

    setIsUpdatingProfile(true);

    try {
      await authService.updateMe({
        fname: userUpdateData.fname,
        lname: userUpdateData.lname,
        email: userUpdateData.email,
        phoneNumber: userUpdateData.phoneNumber,
        photo: profilePic,
      });

      setUserUpdateSuccess("Engineer profile updated successfully!");
      const updatedUser = authService.getCurrentUser();
      if (updatedUser) {
        setCurrentUser(updatedUser);
      }
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        "Failed to update profile. Please try again.";
      setUserUpdateError(msg);
    } finally {
      setIsUpdatingProfile(false);
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
    <div className="settings-page">
      <div className="settings-header">
        <h1>My Account</h1>
        <p>Manage your engineer profile preferences and security settings</p>
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
          className={activeTab === "privacy" ? "tab active" : "tab"}
          onClick={() => setActiveTab("privacy")}
        >
          <Database size={18} />
          Data & Privacy
        </button> */}
      </div>

      <div className="settings-content">
        {/* 1. Profile Settings */}
        {activeTab === "profile" && (
          <div>
            <form className="profile-tab" onSubmit={updateUserInfo}>
              <div className="profile-picture-section">
                <div className="avatar-wrapper">
                  {/* {profilePic ? (
                    <img
                      src={profilePic}
                      alt="Profile"
                      className="avatar-img"
                    />
                  ) : ( */}
                  <div className="avatar-placeholder">
                    <User size={48} />
                  </div>
                  {/*  )}*/}
                  {/* Photo upload commented out */}
                  {/* <label className="upload-btn">
                    <Camera size={18} />
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                    />
                  </label> */}
                </div>
                <div>
                  <h3>
                    {currentUser?.fname} {currentUser?.lname}
                  </h3>
                  <p>{currentUser?.email}</p>
                </div>
              </div>

              {/* Error / Success Messages */}
              {userUpdateError && (
                <div className="alert error">
                  <X size={18} />
                  {userUpdateError}
                </div>
              )}
              {userUpdateSuccess && (
                <div className="alert success">
                  <Check size={18} />
                  {userUpdateSuccess}
                </div>
              )}

              <div className="profile-form">
                <div className="form-row">
                  <div className="form-group">
                    <label>First Name</label>
                    <input
                      type="text"
                      value={userUpdateData.fname}
                      onChange={(e) =>
                        setUserUpdateData({
                          ...userUpdateData,
                          fname: e.target.value,
                        })
                      }
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Last Name</label>
                    <input
                      type="text"
                      value={userUpdateData.lname}
                      onChange={(e) =>
                        setUserUpdateData({
                          ...userUpdateData,
                          lname: e.target.value,
                        })
                      }
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Email Address</label>
                    <input
                      type="email"
                      value={userUpdateData.email}
                      onChange={(e) =>
                        setUserUpdateData({
                          ...userUpdateData,
                          email: e.target.value,
                        })
                      }
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Phone Number</label>
                    <input
                      type="text"
                      value={userUpdateData.phoneNumber}
                      onChange={(e) =>
                        setUserUpdateData({
                          ...userUpdateData,
                          phoneNumber: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  className="save-btn"
                  disabled={isUpdatingProfile}
                >
                  {isUpdatingProfile ? (
                    <>
                      <Loader2 size={18} className="spin" />
                      Saving...
                    </>
                  ) : (
                    "Save Changes"
                  )}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* 2. Security Tab */}
        {activeTab === "security" && (
          <div className="security-tab">
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
                    disabled={isUpdatingPassword}
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
                    disabled={isUpdatingPassword}
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
                    disabled={isUpdatingPassword}
                    required
                  />
                  {passwordData.password &&
                    passwordData.passwordConfirm &&
                    passwordData.password !== passwordData.passwordConfirm && (
                      <small style={{ color: "#dc2626" }}>
                        Passwords do not match
                      </small>
                    )}
                </div>

                <button
                  type="submit"
                  className="save-btn"
                  disabled={
                    isUpdatingPassword ||
                    !passwordData.passwordCurrent ||
                    !passwordData.password ||
                    !passwordData.passwordConfirm ||
                    passwordData.password !== passwordData.passwordConfirm ||
                    passwordData.password.length < 8
                  }
                >
                  {isUpdatingPassword ? (
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
          </div>
        )}

        {/* 3. Data & Privacy (Commented Out) */}
        {/* {activeTab === "privacy" && (
          <div className="privacy-tab">
            <div className="privacy-actions">
              <button className="privacy-btn download">
                <Download size={20} />
                Download My Data
                <small>Receive a copy of all your engineer account data</small>
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
                By using this service as an engineer/partner, you agree to our{" "}
                <a href="#">Terms of Service</a> and{" "}
                <a href="#">Privacy Policy</a>. You consent to the collection
                and processing of your personal data as described.
              </p>
              <p>Last updated: December 1, 2025</p>
            </div>
          </div>
        )} */}
      </div>
    </div>
  );
};

export default EngineerAccountSetup;
