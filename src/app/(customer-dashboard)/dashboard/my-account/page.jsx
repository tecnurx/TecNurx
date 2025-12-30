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
import { addressService } from "../../../../../services/address";

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

  //UPDATE ME

  const [userUpdateError, setUserUpdateError] = useState("");
  const [userUpdateSuccess, setUserUpdateSuccess] = useState("");
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [userUpdateData, setUserUpdateData] = useState({
    lname: currentUser?.lname,
    fname: currentUser?.fname,
    email: currentUser?.email,
    phoneNumber: currentUser?.phoneNumber,
    photo: currentUser?.photo,
  });

  // Load initial data when currentUser is available
  useEffect(() => {
    if (currentUser) {
      setUserUpdateData({
        fname: currentUser.fname || "",
        lname: currentUser.lname || "",
        email: currentUser.email || "",
        phoneNumber: currentUser.phoneNumber || "",
      });
      // Also set initial profile pic if exists
      if (currentUser.photo) {
        setProfilePic(currentUser.photo);
      }
    }
  }, [currentUser]);

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
        photo: profilePic, // this is the base64 from upload or existing URL
      });

      setUserUpdateSuccess("User data updated successfully!");
      const updatedUser = authService.getCurrentUser();
      if (updatedUser) {
        setCurrentUser(updatedUser);
        localStorage.setItem("user", JSON.stringify(updatedUser));
      }
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        "Failed to update user data. Please try again.";
      setUserUpdateError(msg);
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  //ADDRESS
  const [addresses, setAddresses] = useState([]);
  const [loadingAddresses, setLoadingAddresses] = useState(true);
  const [showAddAddress, setShowAddAddress] = useState(false);

  // Form state for new/edit address
  const [addressForm, setAddressForm] = useState({
    type: "dropoff", // or "pickup"
    label: "",
    streetAddress: "",
    city: "",
    state: "",
    postalCode: "",
    country: "Nigeria",
    isDefault: false,
  });

  const [addressError, setAddressError] = useState("");
  const [addressSuccess, setAddressSuccess] = useState("");
  const [savingAddress, setSavingAddress] = useState(false);

  useEffect(() => {
    const fetchAddresses = async () => {
      try {
        setLoadingAddresses(true);
        const response = await addressService.getUserAddresses();
        setAddresses(response.data?.addresses);
      } catch (err) {
        console.error("Failed to load addresses", err);
      } finally {
        setLoadingAddresses(false);
      }
    };

    fetchAddresses();
  }, []);

  const handleCreateAddress = async (e) => {
    e.preventDefault();
    setAddressError("");
    setAddressSuccess("");

    // Basic validation
    if (!addressForm.label || !addressForm.streetAddress || !addressForm.city) {
      return setAddressError("Please fill in all required fields");
    }

    setSavingAddress(true);

    try {
      const newAddress = await addressService.createAddress({
        type: addressForm.type,
        label: addressForm.label,
        streetAddress: addressForm.streetAddress,
        city: addressForm.city,
        state: addressForm.state,
        postalCode: addressForm.postalCode,
        country: addressForm.country,
        isDefault: addressForm.isDefault,
      });

      setAddresses([...addresses, newAddress]);
      setAddressSuccess("Address added successfully!");

      // Reset form
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
      setShowAddAddress(false);
    } catch (err) {
      setAddressError(err.response?.data?.message || "Failed to save address");
    } finally {
      setSavingAddress(false);
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
          <div>
            <form className="profile-tab" onSubmit={updateUserInfo}>
              <div className="profile-picture-section">
                <div className="avatar-wrapper">
                  {profilePic ? (
                    <img
                      src={profilePic}
                      alt="Profile"
                      className="avatar-img"
                    />
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
              {passwordSuccess && (
                <div className="alert success">
                  <Check size={18} />
                  {passwordSuccess}
                </div>
              )}
              <div className="profile-form">
                <div className="form-row">
                  <div className="form-group">
                    <label>First Name</label>
                    <input
                      type="text"
                      value={userUpdateData?.fname}
                      onChange={(e) =>
                        setUserUpdateData({
                          ...userUpdateData,
                          fname: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="form-group">
                    <label>Last Name</label>
                    <input
                      type="text"
                      value={userUpdateData?.lname}
                      onChange={(e) =>
                        setUserUpdateData({
                          ...userUpdateData,
                          lname: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="form-group">
                    <label>Email</label>
                    <input
                      type="email"
                      value={userUpdateData?.email}
                      onChange={(e) =>
                        setUserUpdateData({
                          ...userUpdateData,
                          email: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="form-group">
                    <label>Phone Number</label>
                    <input
                      type="text"
                      value={userUpdateData?.phoneNumber}
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
            {/* Addresses Section */}
            <div className="addresses-section" style={{ marginTop: "40px" }}>
              <div
                className="section-header"
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <h3>Saved Addresses</h3>
                <button
                  type="button"
                  onClick={() => setShowAddAddress(!showAddAddress)}
                  className="save-btn"
                  style={{ padding: "8px 16px", fontSize: "14px" }}
                >
                  {showAddAddress ? "Cancel" : "+ Add New Address"}
                </button>
              </div>

              {/* Success/Error Messages */}
              {addressError && (
                <div className="alert error" style={{ margin: "16px 0" }}>
                  <X size={18} />
                  {addressError}
                </div>
              )}
              {addressSuccess && (
                <div className="alert success" style={{ margin: "16px 0" }}>
                  <Check size={18} />
                  {addressSuccess}
                </div>
              )}

              {/* Add New Address Form */}
              {showAddAddress && (
                <form
                  onSubmit={handleCreateAddress}
                  className="address-form"
                  style={{
                    marginTop: "20px",
                    padding: "20px",
                    background: "#f9f9f9",
                    borderRadius: "8px",
                    display: "flex",
                    flexDirection: "column",
                    gap: "12px",
                  }}
                >
                  <div className="form-row">
                    <div className="form-group">
                      <label>
                        Address Label <span style={{ color: "red" }}>*</span>
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Home, Office"
                        value={addressForm.label}
                        onChange={(e) =>
                          setAddressForm({
                            ...addressForm,
                            label: e.target.value,
                          })
                        }
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label>Type</label>
                      <select
                        value={addressForm.type}
                        onChange={(e) =>
                          setAddressForm({
                            ...addressForm,
                            type: e.target.value,
                          })
                        }
                      >
                        <option value="dropoff">Dropoff</option>
                        <option value="pickup">Pickup</option>
                      </select>
                    </div>
                  </div>

                  <div className="form-group">
                    <label>
                      Street Address <span style={{ color: "red" }}>*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="House number, street name"
                      value={addressForm.streetAddress}
                      onChange={(e) =>
                        setAddressForm({
                          ...addressForm,
                          streetAddress: e.target.value,
                        })
                      }
                      required
                    />
                  </div>

                  <div className="form-row-three">
                    <div className="form-group">
                      <label>
                        City <span style={{ color: "red" }}>*</span>
                      </label>
                      <input
                        type="text"
                        value={addressForm.city}
                        onChange={(e) =>
                          setAddressForm({
                            ...addressForm,
                            city: e.target.value,
                          })
                        }
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label>State</label>
                      <input
                        type="text"
                        value={addressForm.state}
                        onChange={(e) =>
                          setAddressForm({
                            ...addressForm,
                            state: e.target.value,
                          })
                        }
                      />
                    </div>

                    <div className="form-group">
                      <label>Postal Code</label>
                      <input
                        type="text"
                        value={addressForm.postalCode}
                        onChange={(e) =>
                          setAddressForm({
                            ...addressForm,
                            postalCode: e.target.value,
                          })
                        }
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Country</label>
                    <input type="text" value="Nigeria" disabled />
                  </div>

                  <label
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      margin: "16px 0",
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={addressForm.isDefault}
                      onChange={(e) =>
                        setAddressForm({
                          ...addressForm,
                          isDefault: e.target.checked,
                        })
                      }
                    />
                    <span>Set as default address</span>
                  </label>

                  <button
                    type="submit"
                    className="save-btn"
                    disabled={savingAddress}
                  >
                    {savingAddress ? (
                      <>
                        <Loader2 size={18} className="spin" />
                        Saving...
                      </>
                    ) : (
                      "Save Address"
                    )}
                  </button>
                </form>
              )}

              {/* List of Saved Addresses */}
              <div className="addresses-list" style={{ marginTop: "24px" }}>
                {loadingAddresses ? (
                  <p>Loading addresses...</p>
                ) : addresses.length === 0 ? (
                  <p>No saved addresses yet.</p>
                ) : (
                  addresses?.map((addr) => (
                    <div
                      key={addr._id || addr.id}
                      className="address-card"
                      style={{
                        padding: "16px",
                        border: "1px solid #ddd",
                        borderRadius: "8px",
                        marginBottom: "12px",
                        background: addr.isDefault ? "#f0fdf4" : "#fff",
                        borderLeft: addr.isDefault
                          ? "4px solid #22c55e"
                          : "4px solid transparent",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                        }}
                      >
                        <div>
                          <strong>{addr.label}</strong>
                          {addr.isDefault && (
                            <span
                              style={{
                                marginLeft: "8px",
                                color: "#22c55e",
                                fontSize: "12px",
                              }}
                            >
                              Default
                            </span>
                          )}
                          <p style={{ margin: "8px 0", color: "#555" }}>
                            {addr.streetAddress}
                            <br />
                            {addr.city}, {addr.state}{" "}
                            {addr.postalCode && `• ${addr.postalCode}`}
                            <br />
                            {addr.country}
                          </p>
                          <small style={{ textTransform: "capitalize" }}>
                            Type: {addr.type}
                          </small>
                        </div>
                        <div>
                          {/* You can add Edit/Delete buttons here later */}
                          {/* <button>Edit</button> <button>Delete</button> */}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
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
