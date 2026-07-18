"use client";

import React, { useState, useEffect } from "react";
import {
  UserCog,
  Award,
  AlertCircle,
  Building2,
  Smartphone,
  CircleCheck,
  BadgeCheck,
  ShieldAlert,
  Plus,
  X,
} from "lucide-react";
import "./admineng.css";
import { adminService } from "../../../../../services/admin/admin";
import axios from "../../../../../lib/axios";
import Link from "next/link";

const AdminEngineers = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [engineers, setEngineers] = useState([]);
  const [engStats, setEngStats] = useState({});

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [step, setStep] = useState(1);
  const [createdEngineerId, setCreatedEngineerId] = useState(null);
  const [token, setToken] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [modalError, setModalError] = useState(null);

  const initialFormData = {
    // Step 1
    fname: "",
    lname: "",
    phoneNumber: "",
    email: "",
    password: "",
    passwordConfirm: "",
    designation: "",
    photo: "default.jpg",

    // Step 2
    fullname: "",
    phone: "",
    address: "",
    yearsOfExperience: "",
    gadgetType: [],
    serviceCenter: "",
    toolsUsed: "",
    previousEmployment: "",
    whyPartner: "",
    agreeToAbide: "",
    certificate: "",
    resume: "",
  };

  const [formData, setFormData] = useState(initialFormData);

  const fetchEngineers = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await adminService.getAllEngineers();
      const data = res.data?.engineers || [];
      setEngineers(data);
      setEngStats(res.stats || {});
    } catch (err) {
      console.error("Failed to load engineers:", err);
      setError(err.message || "Failed to load engineers. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEngineers();
  }, []);

  const handleInputChange = (e) => {
    const { name, value, type, selectedOptions } = e.target;
    if (type === "select-multiple") {
      const values = Array.from(selectedOptions, option => option.value);
      setFormData((prev) => ({ ...prev, [name]: values }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleFileChange = (e) => {
    const { name, files } = e.target;
    if (files && files[0]) {
      setFormData((prev) => ({ ...prev, [name]: files[0] }));
    }
  };

  const handleStep1Submit = async (e) => {
    e.preventDefault();
    setModalError(null);
    if (formData.password !== formData.passwordConfirm) {
      setModalError("Passwords do not match");
      return;
    }

    try {
      setIsSubmitting(true);
      const payload = {
        fname: formData.fname.trim(),
        lname: formData.lname.trim(),
        email: formData.email.trim(),
        password: formData.password,
        passwordConfirm: formData.passwordConfirm,
        phoneNumber: formData.phoneNumber,
        designation: formData.designation,
        photo: "default.jpg",
      };

      const res = await adminService.createEngineer(payload);
      
      const engId =
        res.data?.engineer?._id ||
        res.data?.engineer?.id ||
        res.data?._id ||
        res.data?.id ||
        res.data?.user?._id;

      if (engId) {
        setCreatedEngineerId(engId);
      }

      // Extract token exactly like signup/page.jsx
      const receivedToken =
        res.data?.token ||
        res.data?.data?.token ||
        res.headers?.authorization ||
        res.data?.data?.user?.token;

      if (receivedToken) {
        setToken(receivedToken.replace("Bearer ", ""));
      }

      // Pre-fill Step 2 data based on Step 1 if possible
      setFormData(prev => ({
        ...prev,
        fullname: prev.fname + " " + prev.lname,
        phone: prev.phoneNumber
      }));

      setStep(2);
      fetchEngineers(); // Refresh list to show the new engineer
    } catch (err) {
      console.error("Failed to create engineer:", err);
      setModalError(
        err.response?.data?.message ||
          err.message ||
          "Failed to create engineer.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStep2Submit = async (e) => {
    e.preventDefault();
    setModalError(null);

    try {
      setIsSubmitting(true);
      const payload = new FormData();
      payload.append("fullname", formData.fullname);
      payload.append("phoneNumber", formData.phone);
      payload.append("email", formData.email);
      payload.append("address", formData.address);
      payload.append("yearsOfExperience", formData.yearsOfExperience);
      
      // The backend runs JSON.parse() on gadgetType and toolsUsed when using FormData
      payload.append("gadgetType", JSON.stringify(formData.gadgetType));
      payload.append("serviceCenter", formData.serviceCenter === "yes" ? "true" : "false");
      
      const tools = formData.toolsUsed.split(",").map((i) => i.trim());
      payload.append("toolsUsed", JSON.stringify(tools));
      
      payload.append("previousEmployment", formData.previousEmployment === "yes" ? "true" : "false");
      payload.append("whyPartner", formData.whyPartner);
      
      if (formData.certificate) payload.append("certificate", formData.certificate);
      if (formData.resume) payload.append("resume", formData.resume);

      // Send using axios with token header and multipart/form-data
      await axios.post("/service-providers", payload, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      if (createdEngineerId) {
        try {
          await adminService.verifyEngineer(createdEngineerId);
        } catch (verifyErr) {
          console.log("Auto-verification skipped or failed:", verifyErr);
        }
      }

      setIsModalOpen(false);
      setStep(1);
      setFormData(initialFormData);
      fetchEngineers();
    } catch (err) {
      console.error("Failed to submit service partner form:", err);
      setModalError(
        err.response?.data?.message ||
          err.message ||
          "Failed to submit service partner details.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setStep(1);
    setFormData(initialFormData);
    setModalError(null);
  };

  const stats = [
    {
      id: 1,
      title: "Total Engineers",
      value: engStats?.total || 0,
      icon: <UserCog size={24} />,
    },
    {
      id: 2,
      title: "Verified Engineers",
      value: engStats?.verified || 0,
      icon: <BadgeCheck size={24} />,
    },
    {
      id: 3,
      title: "Unverified Engineers",
      value: engStats?.unverified || 0,
      icon: <ShieldAlert size={24} />,
    },
  ];

  if (loading && engineers.length === 0) {
    return (
      <div className="resolve-wrap">
        <p>Loading engineers...</p>
        <div className="respinner"></div>
      </div>
    );
  }

  if (error && engineers.length === 0) {
    return (
      <div className="resolve-wrap error">
        <AlertCircle size={32} color="#ef4444" />
        <p>{error}</p>
        <button onClick={() => fetchEngineers()}>Retry</button>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      <div
        className="dashboard-header"
        style={{
          display: "flex",
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <h1>Engineers / Service Partners</h1>
        <button
          onClick={() => setIsModalOpen(true)}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            background: "#111827",
            color: "white",
            border: "none",
            padding: "10px 20px",
            borderRadius: "8px",
            cursor: "pointer",
            fontWeight: 600,
            fontSize: "14px",
          }}
        >
          <Plus size={18} /> Create Engineer
        </button>
      </div>

      {/* Stats Cards */}
      <div className="dashboard-cards">
        {stats.map((item) => (
          <div key={item.id} className="stat-card">
            <div>
              <span>{item.title}</span>
              <h3>{item.value}</h3>
            </div>
            {item.icon}
          </div>
        ))}
      </div>

      {/* Engineers Table */}
      <div className="adcard">
        <h3>All Engineers ({engineers.length})</h3>

        {engineers.length === 0 ? (
          <div className="empty-state">
            <p>No engineers found in the system.</p>
          </div>
        ) : (
          <div className="adtable-container">
            <table className="addata-table engineers-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Phone</th>
                  <th>Email</th>
                  <th>Created At</th>
                  <th>Total Repairs</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {engineers.map((eng) => (
                  <tr key={eng._id || eng.id}>
                    <td>
                      {eng.fname} {eng.lname}
                    </td>
                    <td>{eng.phoneNumber}</td>
                    <td>{eng.email}</td>
                    <td>{eng.createdAt}</td>
                    <td>{eng.stats?.totalRepairs || 0}</td>
                    <td>{eng.isVerified ? "verified" : "unverified"}</td>
                    <td>
                      <Link
                        href={`/admin-dashboard/engineers/${eng._id || eng.id}`}
                        className="view-repair"
                      >
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create Engineer Modal */}
      {isModalOpen && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0,0,0,0.5)",
            zIndex: 9999,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            padding: "20px",
          }}
        >
          <div
            style={{
              background: "white",
              borderRadius: "16px",
              width: "100%",
              maxWidth: "600px",
              maxHeight: "90vh",
              overflowY: "auto",
              padding: "32px",
              position: "relative",
            }}
          >
            <button
              onClick={closeModal}
              style={{
                position: "absolute",
                top: "24px",
                right: "24px",
                background: "transparent",
                border: "none",
                cursor: "pointer",
              }}
            >
              <X size={24} color="#6b7280" />
            </button>
            <h2
              style={{
                fontSize: "24px",
                fontWeight: 700,
                marginBottom: "24px",
                color: "#111827",
              }}
            >
              {step === 1
                ? "Create New Engineer (Step 1)"
                : "Service Partner Details (Step 2)"}
            </h2>

            {modalError && (
              <div
                style={{
                  background: "#fde8e8",
                  color: "#9b1c1c",
                  padding: "12px",
                  borderRadius: "8px",
                  marginBottom: "24px",
                  fontSize: "14px",
                }}
              >
                {modalError}
              </div>
            )}

            {step === 1 && (
              <form
                onSubmit={handleStep1Submit}
                style={{ display: "grid", gap: "20px" }}
              >
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "20px",
                  }}
                >
                  <div>
                    <label
                      style={{
                        display: "block",
                        marginBottom: "8px",
                        fontSize: "14px",
                        fontWeight: 500,
                        color: "#374151",
                      }}
                    >
                      First Name
                    </label>
                    <input
                      type="text"
                      name="fname"
                      value={formData.fname}
                      onChange={handleInputChange}
                      required
                      style={{
                        width: "100%",
                        padding: "10px 12px",
                        border: "1px solid #d1d5db",
                        borderRadius: "8px",
                        outline: "none",
                      }}
                    />
                  </div>
                  <div>
                    <label
                      style={{
                        display: "block",
                        marginBottom: "8px",
                        fontSize: "14px",
                        fontWeight: 500,
                        color: "#374151",
                      }}
                    >
                      Last Name
                    </label>
                    <input
                      type="text"
                      name="lname"
                      value={formData.lname}
                      onChange={handleInputChange}
                      required
                      style={{
                        width: "100%",
                        padding: "10px 12px",
                        border: "1px solid #d1d5db",
                        borderRadius: "8px",
                        outline: "none",
                      }}
                    />
                  </div>
                </div>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "20px",
                  }}
                >
                  <div>
                    <label
                      style={{
                        display: "block",
                        marginBottom: "8px",
                        fontSize: "14px",
                        fontWeight: 500,
                        color: "#374151",
                      }}
                    >
                      Phone Number
                    </label>
                    <input
                      type="text"
                      name="phoneNumber"
                      value={formData.phoneNumber}
                      onChange={handleInputChange}
                      required
                      style={{
                        width: "100%",
                        padding: "10px 12px",
                        border: "1px solid #d1d5db",
                        borderRadius: "8px",
                        outline: "none",
                      }}
                    />
                  </div>
                  <div>
                    <label
                      style={{
                        display: "block",
                        marginBottom: "8px",
                        fontSize: "14px",
                        fontWeight: 500,
                        color: "#374151",
                      }}
                    >
                      Email Address
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      style={{
                        width: "100%",
                        padding: "10px 12px",
                        border: "1px solid #d1d5db",
                        borderRadius: "8px",
                        outline: "none",
                      }}
                    />
                  </div>
                </div>

                <div>
                  <label
                    style={{
                      display: "block",
                      marginBottom: "8px",
                      fontSize: "14px",
                      fontWeight: 500,
                      color: "#374151",
                    }}
                  >
                    Designation
                  </label>
                  <input
                    type="text"
                    name="designation"
                    value={formData.designation}
                    onChange={handleInputChange}
                    required
                    placeholder="e.g. Senior Repair Technician"
                    style={{
                      width: "100%",
                      padding: "10px 12px",
                      border: "1px solid #d1d5db",
                      borderRadius: "8px",
                      outline: "none",
                    }}
                  />
                </div>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "20px",
                  }}
                >
                  <div>
                    <label
                      style={{
                        display: "block",
                        marginBottom: "8px",
                        fontSize: "14px",
                        fontWeight: 500,
                        color: "#374151",
                      }}
                    >
                      Password
                    </label>
                    <input
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      required
                      style={{
                        width: "100%",
                        padding: "10px 12px",
                        border: "1px solid #d1d5db",
                        borderRadius: "8px",
                        outline: "none",
                      }}
                    />
                  </div>
                  <div>
                    <label
                      style={{
                        display: "block",
                        marginBottom: "8px",
                        fontSize: "14px",
                        fontWeight: 500,
                        color: "#374151",
                      }}
                    >
                      Confirm Password
                    </label>
                    <input
                      type="password"
                      name="passwordConfirm"
                      value={formData.passwordConfirm}
                      onChange={handleInputChange}
                      required
                      style={{
                        width: "100%",
                        padding: "10px 12px",
                        border: "1px solid #d1d5db",
                        borderRadius: "8px",
                        outline: "none",
                      }}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  style={{
                    marginTop: "12px",
                    width: "100%",
                    padding: "14px",
                    background: "#111827",
                    color: "white",
                    border: "none",
                    borderRadius: "8px",
                    fontWeight: 600,
                    fontSize: "16px",
                    cursor: isSubmitting ? "not-allowed" : "pointer",
                    opacity: isSubmitting ? 0.7 : 1,
                  }}
                >
                  {isSubmitting ? "Creating Engineer..." : "Next Step"}
                </button>
              </form>
            )}

            {step === 2 && (
              <form
                onSubmit={handleStep2Submit}
                style={{ display: "grid", gap: "20px" }}
              >
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "20px",
                  }}
                >
                  <div>
                    <label
                      style={{
                        display: "block",
                        marginBottom: "8px",
                        fontSize: "14px",
                        fontWeight: 500,
                        color: "#374151",
                      }}
                    >
                      Full Name
                    </label>
                    <input
                      type="text"
                      name="fullname"
                      value={formData.fullname}
                      onChange={handleInputChange}
                      required
                      style={{
                        width: "100%",
                        padding: "10px 12px",
                        border: "1px solid #d1d5db",
                        borderRadius: "8px",
                        outline: "none",
                      }}
                    />
                  </div>
                  <div>
                    <label
                      style={{
                        display: "block",
                        marginBottom: "8px",
                        fontSize: "14px",
                        fontWeight: 500,
                        color: "#374151",
                      }}
                    >
                      Phone Number
                    </label>
                    <input
                      type="text"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      required
                      style={{
                        width: "100%",
                        padding: "10px 12px",
                        border: "1px solid #d1d5db",
                        borderRadius: "8px",
                        outline: "none",
                      }}
                    />
                  </div>
                </div>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "20px",
                  }}
                >
                  <div>
                    <label
                      style={{
                        display: "block",
                        marginBottom: "8px",
                        fontSize: "14px",
                        fontWeight: 500,
                        color: "#374151",
                      }}
                    >
                      Email Address
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      style={{
                        width: "100%",
                        padding: "10px 12px",
                        border: "1px solid #d1d5db",
                        borderRadius: "8px",
                        outline: "none",
                      }}
                    />
                  </div>
                  <div>
                    <label
                      style={{
                        display: "block",
                        marginBottom: "8px",
                        fontSize: "14px",
                        fontWeight: 500,
                        color: "#374151",
                      }}
                    >
                      Home Address
                    </label>
                    <input
                      type="text"
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      required
                      style={{
                        width: "100%",
                        padding: "10px 12px",
                        border: "1px solid #d1d5db",
                        borderRadius: "8px",
                        outline: "none",
                      }}
                    />
                  </div>
                </div>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "20px",
                  }}
                >
                  <div>
                    <label
                      style={{
                        display: "block",
                        marginBottom: "8px",
                        fontSize: "14px",
                        fontWeight: 500,
                        color: "#374151",
                      }}
                    >
                      Years of Experience
                    </label>
                    <input
                      type="text"
                      name="yearsOfExperience"
                      value={formData.yearsOfExperience}
                      onChange={handleInputChange}
                      required
                      style={{
                        width: "100%",
                        padding: "10px 12px",
                        border: "1px solid #d1d5db",
                        borderRadius: "8px",
                        outline: "none",
                      }}
                    />
                  </div>
                  <div>
                    <label
                      style={{
                        display: "block",
                        marginBottom: "8px",
                        fontSize: "14px",
                        fontWeight: 500,
                        color: "#374151",
                      }}
                    >
                      Gadget Type <span style={{ fontSize: "12px", color: "#6b7280", fontWeight: "normal", marginLeft: "4px" }}>(Ctrl/Cmd+click to select multiple)</span>
                    </label>
                    <select
                      multiple
                      name="gadgetType"
                      value={formData.gadgetType}
                      onChange={handleInputChange}
                      required
                      style={{
                        width: "100%",
                        padding: "10px 12px",
                        border: "1px solid #d1d5db",
                        borderRadius: "8px",
                        outline: "none",
                        backgroundColor: "white",
                        minHeight: "100px",
                      }}
                    >
                      <option value="phones">Phones</option>
                      <option value="laptops">Laptops</option>
                      <option value="tablets">Tablets</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "20px",
                  }}
                >
                  <div>
                    <label
                      style={{
                        display: "block",
                        marginBottom: "8px",
                        fontSize: "14px",
                        fontWeight: 500,
                        color: "#374151",
                      }}
                    >
                      Certificate (Optional)
                    </label>
                    <input
                      type="file"
                      name="certificate"
                      accept=".pdf,.doc,.docx,image/*"
                      onChange={handleFileChange}
                      style={{
                        width: "100%",
                        padding: "7px 12px",
                        border: "1px solid #d1d5db",
                        borderRadius: "8px",
                        outline: "none",
                        backgroundColor: "white",
                      }}
                    />
                  </div>
                  <div>
                    <label
                      style={{
                        display: "block",
                        marginBottom: "8px",
                        fontSize: "14px",
                        fontWeight: 500,
                        color: "#374151",
                      }}
                    >
                      Resume (Optional)
                    </label>
                    <input
                      type="file"
                      name="resume"
                      accept=".pdf,.doc,.docx, image/*"
                      onChange={handleFileChange}
                      style={{
                        width: "100%",
                        padding: "7px 12px",
                        border: "1px solid #d1d5db",
                        borderRadius: "8px",
                        outline: "none",
                        backgroundColor: "white",
                      }}
                    />
                  </div>
                </div>

                <div>
                  <label
                    style={{
                      display: "block",
                      marginBottom: "8px",
                      fontSize: "14px",
                      fontWeight: 500,
                      color: "#374151",
                    }}
                  >
                    Tools & Equipment (comma separated)
                  </label>
                  <input
                    type="text"
                    name="toolsUsed"
                    value={formData.toolsUsed}
                    onChange={handleInputChange}
                    required
                    style={{
                      width: "100%",
                      padding: "10px 12px",
                      border: "1px solid #d1d5db",
                      borderRadius: "8px",
                      outline: "none",
                    }}
                  />
                </div>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "20px",
                  }}
                >
                  <div>
                    <label
                      style={{
                        display: "block",
                        marginBottom: "8px",
                        fontSize: "14px",
                        fontWeight: 500,
                        color: "#374151",
                      }}
                    >
                      Own a Service Center?
                    </label>
                    <select
                      name="serviceCenter"
                      value={formData.serviceCenter}
                      onChange={handleInputChange}
                      required
                      style={{
                        width: "100%",
                        padding: "10px 12px",
                        border: "1px solid #d1d5db",
                        borderRadius: "8px",
                        outline: "none",
                        backgroundColor: "white",
                      }}
                    >
                      <option value="">Select...</option>
                      <option value="yes">Yes</option>
                      <option value="no">No</option>
                    </select>
                  </div>
                  <div>
                    <label
                      style={{
                        display: "block",
                        marginBottom: "8px",
                        fontSize: "14px",
                        fontWeight: 500,
                        color: "#374151",
                      }}
                    >
                      Previous Employment?
                    </label>
                    <select
                      name="previousEmployment"
                      value={formData.previousEmployment}
                      onChange={handleInputChange}
                      required
                      style={{
                        width: "100%",
                        padding: "10px 12px",
                        border: "1px solid #d1d5db",
                        borderRadius: "8px",
                        outline: "none",
                        backgroundColor: "white",
                      }}
                    >
                      <option value="">Select...</option>
                      <option value="yes">Yes</option>
                      <option value="no">No</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label
                    style={{
                      display: "block",
                      marginBottom: "8px",
                      fontSize: "14px",
                      fontWeight: 500,
                      color: "#374151",
                    }}
                  >
                    Why partner with TecNurx?
                  </label>
                  <textarea
                    name="whyPartner"
                    value={formData.whyPartner}
                    onChange={handleInputChange}
                    required
                    style={{
                      width: "100%",
                      padding: "10px 12px",
                      border: "1px solid #d1d5db",
                      borderRadius: "8px",
                      outline: "none",
                      minHeight: "80px",
                      fontFamily: "inherit",
                    }}
                  ></textarea>
                </div>

                <div>
                  <label
                    style={{
                      display: "block",
                      marginBottom: "8px",
                      fontSize: "14px",
                      fontWeight: 500,
                      color: "#374151",
                    }}
                  >
                    Agree to Quality Standard?
                  </label>
                  <select
                    name="agreeToAbide"
                    value={formData.agreeToAbide}
                    onChange={handleInputChange}
                    required
                    style={{
                      width: "100%",
                      padding: "10px 12px",
                      border: "1px solid #d1d5db",
                      borderRadius: "8px",
                      outline: "none",
                      backgroundColor: "white",
                    }}
                  >
                    <option value="">Select...</option>
                    <option value="yes">Yes</option>
                    <option value="no">No</option>
                  </select>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  style={{
                    marginTop: "12px",
                    width: "100%",
                    padding: "14px",
                    background: "#10b981",
                    color: "white",
                    border: "none",
                    borderRadius: "8px",
                    fontWeight: 600,
                    fontSize: "16px",
                    cursor: isSubmitting ? "not-allowed" : "pointer",
                    opacity: isSubmitting ? 0.7 : 1,
                  }}
                >
                  {isSubmitting ? "Submitting..." : "Complete Profile"}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminEngineers;
