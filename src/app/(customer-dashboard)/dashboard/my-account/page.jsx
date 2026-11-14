"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import "./settings.css";
import {
  MapPin,
  Eye,
  EyeOff,
  X,
  Loader2,
  Check,
} from "lucide-react";
import { authService } from "../../../../../services/auth";
import { addressService } from "../../../../../services/address";
import { validatePassword, getPasswordRequirements } from "@/lib/passwordValidation";

export default function AccountPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Modals state
  const [showEditProfileModal, setShowEditProfileModal] = useState(false);
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);
  const [showAddAddressModal, setShowAddAddressModal] = useState(false);

  // Profile Form State
  const [profileFormData, setProfileFormData] = useState({
    fname: "",
    lname: "",
    email: "",
    phoneNumber: "",
  });
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileError, setProfileError] = useState("");
  const [profileSuccess, setProfileSuccess] = useState("");

  // Password Form State
  const [passwordData, setPasswordData] = useState({
    passwordCurrent: "",
    password: "",
    passwordConfirm: "",
  });
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");

  // Address State
  const [addresses, setAddresses] = useState([]);
  const [loadingAddresses, setLoadingAddresses] = useState(true);
  const [addressForm, setAddressForm] = useState({
    type: "dropoff",
    label: "",
    streetAddress: "",
    city: "",
    state: "Lagos",
    postalCode: "",
    country: "Nigeria",
    isDefault: false,
  });
  const [savingAddress, setSavingAddress] = useState(false);
  const [addressError, setAddressError] = useState("");
  const [addressSuccess, setAddressSuccess] = useState("");

  // Load User Data
  useEffect(() => {
    try {
      const user = authService.getCurrentUser();
      setCurrentUser(user);
      if (user) {
        setProfileFormData({
          fname: user.fname || "",
          lname: user.lname || "",
          email: user.email || "",
          phoneNumber: user.phoneNumber || "",
        });
      }
    } catch (e) {
      console.error("Error loading user", e);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch Addresses
  const fetchAddresses = async () => {
    try {
      setLoadingAddresses(true);
      const res = await addressService.getUserAddresses();
      const list = res?.data?.addresses || [];
      setAddresses(list);
    } catch (err) {
      console.error("Failed to load addresses", err);
    } finally {
      setLoadingAddresses(false);
    }
  };

  useEffect(() => {
    fetchAddresses();
  }, []);

  // Update Profile Info
  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setProfileError("");
    setProfileSuccess("");
    setProfileSaving(true);

    try {
      await authService.updateMe({
        fname: profileFormData.fname,
        lname: profileFormData.lname,
        email: profileFormData.email,
        phoneNumber: profileFormData.phoneNumber,
      });

      setProfileSuccess("Profile updated successfully!");
      const updated = authService.getCurrentUser();
      if (updated) {
        setCurrentUser(updated);
        localStorage.setItem("user", JSON.stringify(updated));
      }
      setTimeout(() => {
        setShowEditProfileModal(false);
        setProfileSuccess("");
      }, 900);
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to update profile. Please try again.";
      setProfileError(msg);
    } finally {
      setProfileSaving(false);
    }
  };

  // Change Password
  const handlePasswordSubmit = async (e) => {
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

    setPasswordSaving(true);
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
      const msg = err.response?.data?.message || "Failed to update password. Please try again.";
      setPasswordError(msg);
    } finally {
      setPasswordSaving(false);
    }
  };

  // Create Address
  const handleAddressSubmit = async (e) => {
    e.preventDefault();
    setAddressError("");
    setAddressSuccess("");

    if (!addressForm.label?.trim()) {
      return setAddressError("Address label is required");
    }
    if (!addressForm.streetAddress?.trim()) {
      return setAddressError("Street address is required");
    }
    if (!addressForm.city?.trim()) {
      return setAddressError("City is required");
    }

    setSavingAddress(true);
    try {
      await addressService.createAddress({
        type: addressForm.type || "dropoff",
        label: addressForm.label.trim(),
        streetAddress: addressForm.streetAddress.trim(),
        city: addressForm.city.trim(),
        state: addressForm.state?.trim() || "",
        postalCode: addressForm.postalCode?.trim() || "",
        country: addressForm.country || "Nigeria",
        isDefault: Boolean(addressForm.isDefault),
      });

      await fetchAddresses();
      setAddressSuccess("Address added successfully!");
      setAddressForm({
        type: "dropoff",
        label: "",
        streetAddress: "",
        city: "",
        state: "",
        postalCode: "",
        country: "Nigeria",
        isDefault: false,
      });
      setTimeout(() => {
        setShowAddAddressModal(false);
        setAddressSuccess("");
      }, 900);
    } catch (err) {
      setAddressError(err.response?.data?.message || "Failed to save address");
    } finally {
      setSavingAddress(false);
    }
  };

  // Logout
  const handleLogout = async () => {
    try {
      await authService.logout();
    } catch (e) {
      console.error("Logout error", e);
    } finally {
      router.push("/login");
    }
  };

  const fullName = [currentUser?.fname, currentUser?.lname].filter(Boolean).join(" ") || "User";
  const userEmail = currentUser?.email || "No email registered";
  const userPhone = currentUser?.phoneNumber || "No phone registered";

  // Check if address is in Lagos for serviceable pill
  const isServiceableAddress = (addr) => {
    const loc = `${addr.state || ""} ${addr.city || ""} ${addr.streetAddress || ""}`.toLowerCase();
    return loc.includes("lagos") || loc.includes("ikeja") || loc.includes("lekki") || loc.includes("victoria");
  };

  return (
    <div className="account-page">
      {/* Header */}
      <div className="account-header">
        <h1 className="account-title">Account</h1>
        <p className="account-subtitle">Your details, addresses and security.</p>
      </div>

      {/* Main 2-Column Grid */}
      <div className="account-grid">
        {/* Left Column */}
        <div className="account-left-col">
          {/* 1. Profile Card */}
          <div className="account-card">
            <div className="account-card-header">
              <h2 className="account-card-title">Profile</h2>
              <button
                type="button"
                className="account-card-action-link"
                onClick={() => {
                  setProfileFormData({
                    fname: currentUser?.fname || "",
                    lname: currentUser?.lname || "",
                    email: currentUser?.email || "",
                    phoneNumber: currentUser?.phoneNumber || "",
                  });
                  setProfileError("");
                  setProfileSuccess("");
                  setShowEditProfileModal(true);
                }}
              >
                Edit
              </button>
            </div>

            <div className="account-info-rows">
              <div className="account-info-row">
                <span className="account-info-label">Name</span>
                <span className="account-info-value">{fullName}</span>
              </div>
              <div className="account-info-row">
                <span className="account-info-label">Email</span>
                <div className="account-info-value">
                  <span>{userEmail}</span>
                  <span className="pill-verified-inline">
                    <span className="dot">•</span> Verified
                  </span>
                </div>
              </div>
              <div className="account-info-row">
                <span className="account-info-label">Phone</span>
                <div className="account-info-value">
                  <span>{userPhone}</span>
                  <span className="pill-verified-inline">
                    <span className="dot">•</span> Verified
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* 2. Addresses Card */}
          <div className="account-card">
            <div className="account-card-header">
              <h2 className="account-card-title">Addresses</h2>
            </div>

            <div className="account-addresses-list">
              {addresses && addresses.length > 0 ? (
                addresses.map((addr, idx) => {
                  const serviceable = isServiceableAddress(addr);
                  const displayCity = addr.city || (addr.state ? addr.state : "Lagos");
                  return (
                    <div key={addr._id || idx} className="account-address-row">
                      <div className="account-address-left">
                        <div className="account-address-icon">
                          <MapPin size={18} />
                        </div>
                        <div className="account-address-text">
                          <h4>{addr.streetAddress || addr.label || "Address line"}</h4>
                          <p>{displayCity}</p>
                        </div>
                      </div>
                      {serviceable ? (
                        <span className="pill-serviceable">
                          <span className="dot">•</span> Serviceable
                        </span>
                      ) : (
                        <span className="pill-outside-coverage">
                          <span className="dot">•</span> Outside current coverage
                        </span>
                      )}
                    </div>
                  );
                })
              ) : (
                <div className="account-address-row">
                  <div className="account-address-left">
                    <div className="account-address-icon">
                      <MapPin size={18} />
                    </div>
                    <div className="account-address-text">
                      <h4>No address added yet</h4>
                      <p>Add your pickup address to schedule repairs</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <button
              type="button"
              className="btn-add-address-outline"
              onClick={() => {
                setAddressError("");
                setAddressSuccess("");
                setShowAddAddressModal(true);
              }}
            >
              Add address
            </button>
          </div>

          {/* 3. Security Card */}
          <div className="account-card">
            <div className="account-card-header">
              <h2 className="account-card-title">Security</h2>
            </div>

            <div className="account-info-rows">
              <div className="security-row">
                <span className="security-label">Password</span>
                <button
                  type="button"
                  className="account-card-action-link"
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
              <div className="security-row">
                <span className="security-label">Sign-in methods</span>
                <span className="security-value">Google · Phone OTP</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="account-right-col">
          {/* Verification Card */}
          <div className="account-card">
            <h2 className="account-card-title" style={{ marginBottom: "16px" }}>
              Verification
            </h2>

            <div className="verification-status-banner">
              <span className="dot">•</span> Account verified
            </div>

            <p className="verification-desc">
              Extra checks appear only when a service needs them.
            </p>

            <Link href="/dashboard/my-account/verification" className="verification-link">
              Open verification centre
            </Link>
          </div>

          {/* Log out Button */}
          <button
            type="button"
            className="btn-account-logout"
            onClick={handleLogout}
          >
            Log out
          </button>
        </div>
      </div>

      {/* Edit Profile Modal */}
      {showEditProfileModal && (
        <div className="account-modal-backdrop" onClick={() => setShowEditProfileModal(false)}>
          <div className="account-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="account-modal-header">
              <div>
                <h2>Edit profile</h2>
                <p>Update your personal details</p>
              </div>
              <button
                type="button"
                className="account-modal-close-btn"
                onClick={() => setShowEditProfileModal(false)}
              >
                <X size={18} />
              </button>
            </div>

            {profileError && <div className="account-form-error">{profileError}</div>}
            {profileSuccess && <div className="account-form-success">{profileSuccess}</div>}

            <form onSubmit={handleProfileSubmit}>
              <div className="account-form-grid">
                <div className="account-form-field">
                  <label>First name</label>
                  <input
                    type="text"
                    value={profileFormData.fname}
                    onChange={(e) =>
                      setProfileFormData({ ...profileFormData, fname: e.target.value })
                    }
                    placeholder="First name"
                    required
                  />
                </div>
                <div className="account-form-field">
                  <label>Last name</label>
                  <input
                    type="text"
                    value={profileFormData.lname}
                    onChange={(e) =>
                      setProfileFormData({ ...profileFormData, lname: e.target.value })
                    }
                    placeholder="Last name"
                    required
                  />
                </div>
                <div className="account-form-field full">
                  <label>Email address</label>
                  <input
                    type="email"
                    value={profileFormData.email}
                    onChange={(e) =>
                      setProfileFormData({ ...profileFormData, email: e.target.value })
                    }
                    placeholder="Email address"
                    required
                  />
                </div>
                <div className="account-form-field full">
                  <label>Phone number</label>
                  <input
                    type="tel"
                    value={profileFormData.phoneNumber}
                    onChange={(e) =>
                      setProfileFormData({ ...profileFormData, phoneNumber: e.target.value })
                    }
                    placeholder="+234..."
                  />
                </div>
              </div>

              <div className="account-modal-actions">
                <button
                  type="button"
                  className="btn-modal-cancel"
                  onClick={() => setShowEditProfileModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-modal-submit"
                  disabled={profileSaving}
                >
                  {profileSaving ? (
                    <>
                      <Loader2 size={16} className="btn-inline-spinner" /> Saving...
                    </>
                  ) : (
                    "Save changes"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Change Password Modal */}
      {showChangePasswordModal && (
        <div className="account-modal-backdrop" onClick={() => setShowChangePasswordModal(false)}>
          <div className="account-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="account-modal-header">
              <div>
                <h2>Change password</h2>
                <p>Ensure your account is using a strong, unique password</p>
              </div>
              <button
                type="button"
                className="account-modal-close-btn"
                onClick={() => setShowChangePasswordModal(false)}
              >
                <X size={18} />
              </button>
            </div>

            {passwordError && <div className="account-form-error">{passwordError}</div>}
            {passwordSuccess && <div className="account-form-success">{passwordSuccess}</div>}

            <form onSubmit={handlePasswordSubmit}>
              <div className="account-form-grid">
                <div className="account-form-field full">
                  <label>Current password</label>
                  <div className="password-input-wrap">
                    <input
                      type={showCurrentPassword ? "text" : "password"}
                      value={passwordData.passwordCurrent}
                      onChange={(e) =>
                        setPasswordData({ ...passwordData, passwordCurrent: e.target.value })
                      }
                      placeholder="Enter current password"
                      required
                    />
                    <button
                      type="button"
                      className="password-toggle-btn"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    >
                      {showCurrentPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <div className="account-form-field full">
                  <label>New password</label>
                  <div className="password-input-wrap">
                    <input
                      type={showNewPassword ? "text" : "password"}
                      value={passwordData.password}
                      onChange={(e) =>
                        setPasswordData({ ...passwordData, password: e.target.value })
                      }
                      placeholder="Enter new password (min. 8 characters)"
                      required
                    />
                    <button
                      type="button"
                      className="password-toggle-btn"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                    >
                      {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>

                  {passwordData.password && (
                    <div className="password-requirements-box">
                      <p className="password-requirements-title">Password must contain:</p>
                      <div className="password-requirements-list">
                        {getPasswordRequirements(passwordData.password).map((req, idx) => (
                          <div
                            key={idx}
                            className={`password-requirement-item ${req.met ? "met" : ""}`}
                          >
                            {req.met ? (
                              <Check size={13} className="req-icon met" />
                            ) : (
                              <span className="req-dot">•</span>
                            )}
                            <span>{req.label}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="account-form-field full">
                  <label>Confirm new password</label>
                  <div className="password-input-wrap">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      value={passwordData.passwordConfirm}
                      onChange={(e) =>
                        setPasswordData({ ...passwordData, passwordConfirm: e.target.value })
                      }
                      placeholder="Repeat new password"
                      required
                    />
                    <button
                      type="button"
                      className="password-toggle-btn"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  {passwordData.passwordConfirm &&
                    passwordData.password !== passwordData.passwordConfirm && (
                      <span className="password-mismatch-hint">
                        Passwords do not match
                      </span>
                    )}
                </div>
              </div>

              <div className="account-modal-actions">
                <button
                  type="button"
                  className="btn-modal-cancel"
                  onClick={() => setShowChangePasswordModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-modal-submit"
                  disabled={passwordSaving}
                >
                  {passwordSaving ? (
                    <>
                      <Loader2 size={16} className="btn-inline-spinner" /> Updating...
                    </>
                  ) : (
                    "Update password"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Address Modal */}
      {showAddAddressModal && (
        <div className="account-modal-backdrop" onClick={() => setShowAddAddressModal(false)}>
          <div className="account-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="account-modal-header">
              <div>
                <h2>Add new address</h2>
                <p>We will check coverage when arranging device pickups</p>
              </div>
              <button
                type="button"
                className="account-modal-close-btn"
                onClick={() => setShowAddAddressModal(false)}
              >
                <X size={18} />
              </button>
            </div>

            {addressError && <div className="account-form-error">{addressError}</div>}
            {addressSuccess && <div className="account-form-success">{addressSuccess}</div>}

            <form onSubmit={handleAddressSubmit}>
              <div className="account-form-grid">
                <div className="account-form-field">
                  <label>
                    Address Label <span className="required-star">*</span>
                  </label>
                  <input
                    type="text"
                    value={addressForm.label}
                    onChange={(e) => setAddressForm({ ...addressForm, label: e.target.value })}
                    placeholder="e.g. Home, Office"
                    required
                  />
                </div>

                <div className="account-form-field">
                  <label>Type</label>
                  <select
                    value={addressForm.type}
                    onChange={(e) => setAddressForm({ ...addressForm, type: e.target.value })}
                  >
                    <option value="dropoff">Dropoff</option>
                    <option value="pickup">Pickup</option>
                  </select>
                </div>

                <div className="account-form-field full">
                  <label>
                    Street Address <span className="required-star">*</span>
                  </label>
                  <input
                    type="text"
                    value={addressForm.streetAddress}
                    onChange={(e) =>
                      setAddressForm({ ...addressForm, streetAddress: e.target.value })
                    }
                    placeholder="House number, street name"
                    required
                  />
                </div>
              </div>

              <div className="account-form-grid three-cols">
                <div className="account-form-field">
                  <label>
                    City <span className="required-star">*</span>
                  </label>
                  <input
                    type="text"
                    value={addressForm.city}
                    onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
                    required
                  />
                </div>

                <div className="account-form-field">
                  <label>State</label>
                  <input
                    type="text"
                    value={addressForm.state}
                    onChange={(e) => setAddressForm({ ...addressForm, state: e.target.value })}
                  />
                </div>

                <div className="account-form-field">
                  <label>Postal Code</label>
                  <input
                    type="text"
                    value={addressForm.postalCode}
                    onChange={(e) => setAddressForm({ ...addressForm, postalCode: e.target.value })}
                  />
                </div>
              </div>

              <div className="account-form-grid" style={{ marginBottom: "8px" }}>
                <div className="account-form-field full">
                  <label>Country</label>
                  <input
                    type="text"
                    value={addressForm.country || "Nigeria"}
                    readOnly
                    style={{ backgroundColor: "#f9fafb", cursor: "default" }}
                  />
                </div>
              </div>

              <label className="account-checkbox-row">
                <input
                  type="checkbox"
                  checked={addressForm.isDefault}
                  onChange={(e) => setAddressForm({ ...addressForm, isDefault: e.target.checked })}
                />
                <span>Set as default address</span>
              </label>

              <div className="account-modal-actions">
                <button
                  type="button"
                  className="btn-modal-cancel"
                  onClick={() => setShowAddAddressModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-modal-submit"
                  disabled={savingAddress}
                >
                  {savingAddress ? (
                    <>
                      <Loader2 size={16} className="btn-inline-spinner" /> Saving...
                    </>
                  ) : (
                    "Save address"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
