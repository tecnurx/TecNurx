"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import "./setup.css";
import "../engineer.css";
import {
  ShieldCheck,
  Eye,
  EyeOff,
  X,
  Loader2,
  Check,
  Wrench,
  Camera,
} from "lucide-react";
import TecNurxLoader from "@/components/TecNurxLoader";
import { toast } from "@/components/CustomToast";
import { authService } from "../../../../../services/auth";
import { engineerAuthService } from "../../../../../services/eng/engineerAuth";
import { validatePassword, getPasswordRequirements } from "@/lib/passwordValidation";

const EngineerAccountSetup = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);

  // Modals
  const [showEditProfileModal, setShowEditProfileModal] = useState(false);
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // Profile Update State
  const [userUpdateData, setUserUpdateData] = useState({
    fname: "",
    lname: "",
    email: "",
    phoneNumber: "",
  });
  const [userUpdateError, setUserUpdateError] = useState("");
  const [userUpdateSuccess, setUserUpdateSuccess] = useState("");
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);

  // Password Form State
  const [passwordData, setPasswordData] = useState({
    passwordCurrent: "",
    password: "",
    passwordConfirm: "",
  });
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    try {
      const user = authService.getCurrentUser();
      setCurrentUser(user);
      if (user) {
        setUserUpdateData({
          fname: user.fname || "",
          lname: user.lname || "",
          email: user.email || "",
          phoneNumber: user.phoneNumber || "",
        });
      }
    } catch (err) {
      console.error("Failed to load engineer account:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  const handlePhotoChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setIsUploadingPhoto(true);
      const res = await authService.updateMyPhoto(file);
      const updatedUser =
        res?.data?.user || res?.user || authService.getCurrentUser();
      if (updatedUser) {
        setCurrentUser(updatedUser);
      }
      toast.success("Profile photo updated!");
    } catch (err) {
      toast.error(
        err?.response?.data?.message || "Failed to update profile photo."
      );
    } finally {
      setIsUploadingPhoto(false);
      e.target.value = "";
    }
  };

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
      });

      setUserUpdateSuccess("Engineer profile updated successfully!");
      const updatedUser = authService.getCurrentUser();
      if (updatedUser) {
        setCurrentUser(updatedUser);
        localStorage.setItem("user", JSON.stringify(updatedUser));
      }
      setTimeout(() => {
        setShowEditProfileModal(false);
        setUserUpdateSuccess("");
      }, 900);
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        "Failed to update profile. Please try again.";
      setUserUpdateError(msg);
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setPasswordError("");
    setPasswordSuccess("");

    const { passwordCurrent, password, passwordConfirm } = passwordData;

    if (!passwordCurrent) return setPasswordError("Current password is required");
    if (!password) return setPasswordError("New password is required");

    const passwordCheck = validatePassword(password);
    if (!passwordCheck.isValid) {
      return setPasswordError(passwordCheck.message);
    }

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
      setTimeout(() => {
        setShowChangePasswordModal(false);
        setPasswordSuccess("");
      }, 1000);
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        "Failed to update password. Please try again.";
      setPasswordError(msg);
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  const handleLogout = async () => {
    if (isLoggingOut) return;
    setIsLoggingOut(true);
    try {
      await engineerAuthService.logout();
      router.push("/");
    } catch (error) {
      console.error("Logout failed:", error);
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      localStorage.removeItem("pendingVerificationEmail");
      document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/";
      router.push("/");
    } finally {
      setIsLoggingOut(false);
    }
  };

  if (loading) {
    return <TecNurxLoader minHeight="65vh" size="lg" />;
  }

  const fullName =
    `${currentUser?.fname || ""} ${currentUser?.lname || ""}`.trim() ||
    "Service Engineer";

  return (
    <div className="eng-page">
      {/* Header */}
      <div className="eng-page-header">
        <div>
          <h1 className="eng-page-title">Account Setup</h1>
          <p className="eng-page-subtitle">
            Manage your engineer profile, security, and verification status.
          </p>
        </div>

        <span className="eng-workspace-tag">
          <Wrench size={14} />
          <span>Engineer Account</span>
        </span>
      </div>

      {/* 2-Column Customer-Style Grid */}
      <div className="eng-account-grid">
        {/* Left Column: Profile & Security */}
        <div>
          {/* 1. Profile Card */}
          <div className="eng-account-card">
            <div className="eng-account-card-head">
              <h2 className="eng-account-card-title">Profile</h2>
              <button
                type="button"
                className="eng-account-action-link"
                onClick={() => {
                  setUserUpdateData({
                    fname: currentUser?.fname || "",
                    lname: currentUser?.lname || "",
                    email: currentUser?.email || "",
                    phoneNumber: currentUser?.phoneNumber || "",
                  });
                  setUserUpdateError("");
                  setUserUpdateSuccess("");
                  setShowEditProfileModal(true);
                }}
              >
                Edit
              </button>
            </div>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "16px",
                paddingBottom: "18px",
                marginBottom: "6px",
                borderBottom: "1px solid #f1f5f9",
              }}
            >
              <div style={{ position: "relative", flexShrink: 0 }}>
                {currentUser?.photo ? (
                  <img
                    src={currentUser.photo}
                    alt={fullName}
                    style={{
                      width: "64px",
                      height: "64px",
                      borderRadius: "50%",
                      objectFit: "cover",
                      border: "1.5px solid #e5e7eb",
                      display: "block",
                    }}
                  />
                ) : (
                  <div
                    style={{
                      width: "64px",
                      height: "64px",
                      borderRadius: "50%",
                      background: "#111827",
                      color: "#ffffff",
                      fontWeight: 700,
                      fontSize: "20px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {`${currentUser?.fname?.[0] || ""}${
                      currentUser?.lname?.[0] || ""
                    }`.toUpperCase() || "EN"}
                  </div>
                )}
              </div>

              <div>
                <h3 style={{ margin: "0 0 4px", fontSize: "16px", color: "#111827" }}>
                  {fullName}
                </h3>
                <label
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "6px",
                    fontSize: "13px",
                    fontWeight: 600,
                    color: "#111827",
                    textDecoration: "underline",
                    cursor: isUploadingPhoto ? "wait" : "pointer",
                  }}
                >
                  {isUploadingPhoto ? (
                    <>
                      <Loader2 size={14} className="notif-spinner" />
                      <span>Uploading...</span>
                    </>
                  ) : (
                    <>
                      <Camera size={14} />
                      <span>Change photo</span>
                    </>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoChange}
                    disabled={isUploadingPhoto}
                    style={{ display: "none" }}
                  />
                </label>
              </div>
            </div>

            <div className="eng-account-rows">
              <div className="eng-account-row">
                <span className="eng-account-label">Name</span>
                <span className="eng-account-value">{fullName}</span>
              </div>
              <div className="eng-account-row">
                <span className="eng-account-label">Phone</span>
                <span className="eng-account-value">
                  <span>{currentUser?.phoneNumber || "Not set"}</span>
                </span>
              </div>
              <div className="eng-account-row">
                <span className="eng-account-label">Email</span>
                <span className="eng-account-value">
                  <span>{currentUser?.email || "—"}</span>
                  <span className="eng-pill-verified">• Verified</span>
                </span>
              </div>
              <div className="eng-account-row">
                <span className="eng-account-label">Role</span>
                <span className="eng-account-value">Service Engineer</span>
              </div>
            </div>
          </div>

          {/* 2. Security Card */}
          <div className="eng-account-card">
            <div className="eng-account-card-head">
              <h2 className="eng-account-card-title">Security</h2>
            </div>

            <div className="eng-account-rows">
              <div className="eng-account-row">
                <span className="eng-account-label">Password</span>
                <button
                  type="button"
                  className="eng-account-action-link"
                  onClick={() => {
                    setPasswordData({
                      passwordCurrent: "",
                      password: "",
                      passwordConfirm: "",
                    });
                    setPasswordError("");
                    setPasswordSuccess("");
                    setShowChangePasswordModal(true);
                  }}
                >
                  Change
                </button>
              </div>
              <div className="eng-account-row">
                <span className="eng-account-label">Portal Access</span>
                <span className="eng-account-value">Engineer Workspace</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Engineer Verification & Logout */}
        <div>
          <div className="eng-account-card">
            <h2 className="eng-account-card-title" style={{ marginBottom: "16px" }}>
              Verification
            </h2>

            <div className="eng-verification-banner">
              <ShieldCheck size={15} />
              <span>Service Partner Verified</span>
            </div>

            <p className="eng-verification-desc">
              Your engineer profile is active and eligible to receive repair
              assignments and withdraw earnings.
            </p>

            <Link href="/engineer-dashboard/wallet" className="eng-account-action-link">
              Manage wallet &amp; payouts
            </Link>
          </div>

          <button
            type="button"
            className="eng-btn-logout-outline"
            onClick={handleLogout}
            disabled={isLoggingOut}
          >
            {isLoggingOut ? "Logging out..." : "Log out"}
          </button>
        </div>
      </div>

      {/* Edit Profile Modal */}
      {showEditProfileModal && (
        <div
          className="eng-acct-modal-backdrop"
          onClick={() => setShowEditProfileModal(false)}
        >
          <div
            className="eng-acct-modal-card"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="eng-acct-modal-head">
              <div>
                <h2>Edit profile</h2>
                <p>Update your engineer contact details</p>
              </div>
              <button
                type="button"
                className="eng-acct-modal-close"
                onClick={() => setShowEditProfileModal(false)}
              >
                <X size={18} />
              </button>
            </div>

            {userUpdateError && (
              <div className="eng-acct-alert error">
                <X size={16} />
                <span>{userUpdateError}</span>
              </div>
            )}
            {userUpdateSuccess && (
              <div className="eng-acct-alert success">
                <Check size={16} />
                <span>{userUpdateSuccess}</span>
              </div>
            )}

            <form onSubmit={updateUserInfo}>
              <div className="eng-acct-form-grid">
                <div className="eng-acct-field">
                  <label>First Name</label>
                  <input
                    type="text"
                    className="eng-acct-input"
                    value={userUpdateData.fname}
                    onChange={(e) =>
                      setUserUpdateData({ ...userUpdateData, fname: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="eng-acct-field">
                  <label>Last Name</label>
                  <input
                    type="text"
                    className="eng-acct-input"
                    value={userUpdateData.lname}
                    onChange={(e) =>
                      setUserUpdateData({ ...userUpdateData, lname: e.target.value })
                    }
                    required
                  />
                </div>
              </div>

              <div className="eng-acct-field">
                <label>Email Address</label>
                <input
                  type="email"
                  className="eng-acct-input"
                  value={userUpdateData.email}
                  onChange={(e) =>
                    setUserUpdateData({ ...userUpdateData, email: e.target.value })
                  }
                  required
                />
              </div>

              <div className="eng-acct-field">
                <label>Phone Number</label>
                <input
                  type="text"
                  className="eng-acct-input"
                  value={userUpdateData.phoneNumber}
                  onChange={(e) =>
                    setUserUpdateData({
                      ...userUpdateData,
                      phoneNumber: e.target.value,
                    })
                  }
                />
              </div>

              <div className="eng-acct-modal-actions">
                <button
                  type="button"
                  className="eng-btn-outline"
                  onClick={() => setShowEditProfileModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="eng-btn-primary"
                  disabled={isUpdatingProfile}
                >
                  {isUpdatingProfile ? (
                    <>
                      <Loader2 size={15} className="notif-spinner" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    "Save Changes"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Change Password Modal */}
      {showChangePasswordModal && (
        <div
          className="eng-acct-modal-backdrop"
          onClick={() => setShowChangePasswordModal(false)}
        >
          <div
            className="eng-acct-modal-card"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="eng-acct-modal-head">
              <div>
                <h2>Change password</h2>
                <p>Keep your engineer account secure</p>
              </div>
              <button
                type="button"
                className="eng-acct-modal-close"
                onClick={() => setShowChangePasswordModal(false)}
              >
                <X size={18} />
              </button>
            </div>

            {passwordError && (
              <div className="eng-acct-alert error">
                <X size={16} />
                <span>{passwordError}</span>
              </div>
            )}
            {passwordSuccess && (
              <div className="eng-acct-alert success">
                <Check size={16} />
                <span>{passwordSuccess}</span>
              </div>
            )}

            <form onSubmit={handlePasswordChange}>
              <div className="eng-acct-field">
                <label>Current Password</label>
                <div style={{ position: "relative" }}>
                  <input
                    type={showCurrentPassword ? "text" : "password"}
                    className="eng-acct-input"
                    style={{ paddingRight: "42px" }}
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
                  <span
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    style={{
                      position: "absolute",
                      right: "14px",
                      top: "50%",
                      transform: "translateY(-50%)",
                      cursor: "pointer",
                      color: "#64748b",
                      display: "flex",
                    }}
                  >
                    {showCurrentPassword ? <Eye size={17} /> : <EyeOff size={17} />}
                  </span>
                </div>
              </div>

              <div className="eng-acct-field">
                <label>New Password</label>
                <div style={{ position: "relative" }}>
                  <input
                    type={showNewPassword ? "text" : "password"}
                    className="eng-acct-input"
                    style={{ paddingRight: "42px" }}
                    value={passwordData.password}
                    onChange={(e) =>
                      setPasswordData({ ...passwordData, password: e.target.value })
                    }
                    disabled={isUpdatingPassword}
                    minLength={8}
                    required
                  />
                  <span
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    style={{
                      position: "absolute",
                      right: "14px",
                      top: "50%",
                      transform: "translateY(-50%)",
                      cursor: "pointer",
                      color: "#64748b",
                      display: "flex",
                    }}
                  >
                    {showNewPassword ? <Eye size={17} /> : <EyeOff size={17} />}
                  </span>
                </div>

                {passwordData.password && (
                  <div
                    style={{
                      background: "#f8fafc",
                      border: "1px solid #e2e8f0",
                      borderRadius: "10px",
                      padding: "10px 12px",
                      marginTop: "6px",
                      fontSize: "12px",
                    }}
                  >
                    <p style={{ fontWeight: 600, color: "#334155", margin: "0 0 6px" }}>
                      Password must contain:
                    </p>
                    <div style={{ display: "grid", gap: "4px" }}>
                      {getPasswordRequirements(passwordData.password).map((req, idx) => (
                        <div
                          key={idx}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "6px",
                            color: req.met ? "#16a34a" : "#64748b",
                          }}
                        >
                          {req.met ? (
                            <Check size={13} color="#16a34a" strokeWidth={3} />
                          ) : (
                            <span
                              style={{
                                width: "6px",
                                height: "6px",
                                borderRadius: "50%",
                                backgroundColor: "#94a3b8",
                                display: "inline-block",
                                margin: "0 3px",
                              }}
                            />
                          )}
                          <span>{req.label}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="eng-acct-field">
                <label>Confirm New Password</label>
                <div style={{ position: "relative" }}>
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    className="eng-acct-input"
                    style={{ paddingRight: "42px" }}
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
                  <span
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    style={{
                      position: "absolute",
                      right: "14px",
                      top: "50%",
                      transform: "translateY(-50%)",
                      cursor: "pointer",
                      color: "#64748b",
                      display: "flex",
                    }}
                  >
                    {showConfirmPassword ? <Eye size={17} /> : <EyeOff size={17} />}
                  </span>
                </div>
                {passwordData.password &&
                  passwordData.passwordConfirm &&
                  passwordData.password !== passwordData.passwordConfirm && (
                    <small style={{ color: "#dc2626" }}>Passwords do not match</small>
                  )}
              </div>

              <div className="eng-acct-modal-actions">
                <button
                  type="button"
                  className="eng-btn-outline"
                  onClick={() => setShowChangePasswordModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="eng-btn-primary"
                  disabled={
                    isUpdatingPassword ||
                    !passwordData.passwordCurrent ||
                    !passwordData.password ||
                    !passwordData.passwordConfirm ||
                    passwordData.password !== passwordData.passwordConfirm ||
                    !validatePassword(passwordData.password).isValid
                  }
                >
                  {isUpdatingPassword ? (
                    <>
                      <Loader2 size={15} className="notif-spinner" />
                      <span>Updating...</span>
                    </>
                  ) : (
                    "Update Password"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default EngineerAccountSetup;
