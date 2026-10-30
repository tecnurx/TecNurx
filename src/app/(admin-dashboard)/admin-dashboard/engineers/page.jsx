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
  Eye,
  EyeOff,
  Check,
} from "lucide-react";
import "./admineng.css";
import { adminService } from "../../../../../services/admin/admin";
import { useStaffPermissions } from "../../../../../config/adminPermissions";
import axios from "../../../../../lib/axios";
import Link from "next/link";
import { validatePassword, getPasswordRequirements } from "@/lib/passwordValidation";
import AdminTable from "@/components/AdminTable";

const AdminEngineers = () => {
  const { can } = useStaffPermissions();
  const canManageEngineers = can("engineers:manage");
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
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);

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
      const data =
        res.data?.engineers ||
        res.data?.servicePartners ||
        (Array.isArray(res.data) ? res.data : []) ||
        res.engineers ||
        res.servicePartners ||
        [];
      setEngineers(data);
      setEngStats(res.stats || res.data?.stats || {});
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

  const toggleGadgetType = (val) => {
    setFormData((prev) => {
      const current = Array.isArray(prev.gadgetType) ? prev.gadgetType : [];
      const updated = current.includes(val)
        ? current.filter((item) => item !== val)
        : [...current, val];
      return { ...prev, gadgetType: updated };
    });
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

    const passwordCheck = validatePassword(formData.password);
    if (!passwordCheck.isValid) {
      setModalError(passwordCheck.message);
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

    if (!formData.gadgetType || formData.gadgetType.length === 0) {
      setModalError("Please select at least one gadget type.");
      return;
    }

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

      // Submit via admin auto-approve endpoint, fallback to service-providers
      if (createdEngineerId) {
        try {
          await adminService.createServiceProvider(createdEngineerId, payload);
        } catch (adminErr) {
          console.warn("admin service-partner endpoint fallback:", adminErr.message);
          await axios.post("/service-providers", payload, {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "multipart/form-data",
            },
          });
          try {
            await adminService.verifyEngineer(createdEngineerId);
          } catch (verifyErr) {
            console.log("Auto-verification skipped or failed:", verifyErr);
          }
        }
      } else {
        await axios.post("/service-providers", payload, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        });
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
        {canManageEngineers && (
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
        )}
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

      {/* Responsive Engineers Table */}
      <AdminTable
        title={`All Engineers & Partners (${engineers.length})`}
        subtitle="Manage registered repair engineers, service partner applications, and verification statuses"
        data={engineers}
        columns={[
          {
            header: "Name",
            accessor: "fname",
            sortable: true,
            render: (eng) => (
              <span style={{ fontWeight: "600", color: "#0f172a" }}>
                {eng.fname
                  ? `${eng.fname} ${eng.lname || ""}`
                  : eng.fullname || eng.name || "N/A"}
              </span>
            ),
          },
          {
            header: "Phone",
            accessor: "phoneNumber",
            render: (eng) => eng.phoneNumber || eng.phone || "—",
          },
          {
            header: "Email",
            accessor: "email",
            sortable: true,
            render: (eng) => (
              <span style={{ color: "#475569" }}>{eng.email || "—"}</span>
            ),
          },
          {
            header: "Created At",
            accessor: "createdAt",
            sortable: true,
            render: (eng) => (
              <span style={{ color: "#64748b", fontSize: "13px" }}>
                {eng.createdAt ? new Date(eng.createdAt).toLocaleDateString() : "—"}
              </span>
            ),
          },
          {
            header: "Total Repairs",
            accessor: "stats.totalRepairs",
            sortable: true,
            render: (eng) => eng.stats?.totalRepairs || eng.totalRepairs || 0,
          },
          {
            header: "Status",
            accessor: "isVerified",
            sortable: true,
            render: (eng) => {
              const isVerified =
                eng.isVerified ||
                eng.status === "verified" ||
                eng.status === "approved";
              return (
                <span
                  style={{
                    padding: "4px 10px",
                    borderRadius: "12px",
                    fontSize: "12px",
                    fontWeight: "600",
                    textTransform: "capitalize",
                    background: isVerified ? "#dcfce7" : "#fee2e2",
                    color: isVerified ? "#15803d" : "#b91c1c",
                  }}
                >
                  {isVerified ? "Verified" : "Unverified"}
                </span>
              );
            },
          },
          {
            header: "Action",
            align: "center",
            render: (eng) => (
              <Link
                href={`/admin-dashboard/engineers/${eng._id || eng.id}`}
                className="view-repair"
              >
                View
              </Link>
            ),
          },
        ]}
        filters={[
          {
            key: "isVerified",
            label: "All Verification Status",
            filterFn: (eng, val) => {
              const isVer =
                eng.isVerified ||
                eng.status === "verified" ||
                eng.status === "approved";
              return val === "verified" ? isVer : !isVer;
            },
            options: [
              { value: "verified", label: "Verified" },
              { value: "unverified", label: "Unverified" },
            ],
          },
        ]}
        searchPlaceholder="Search engineer name, email, phone..."
        initialPageSize={10}
        emptyMessage="No engineers found matching your search."
      />

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
                    <div style={{ position: "relative", width: "100%" }}>
                      <input
                        type={showPassword ? "text" : "password"}
                        name="password"
                        value={formData.password}
                        onChange={handleInputChange}
                        required
                        style={{
                          width: "100%",
                          padding: "10px 42px 10px 12px",
                          border: "1px solid #d1d5db",
                          borderRadius: "8px",
                          outline: "none",
                        }}
                      />
                      <span
                        onClick={() => setShowPassword(!showPassword)}
                        style={{
                          position: "absolute",
                          right: "12px",
                          top: "50%",
                          transform: "translateY(-50%)",
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          color: "#6b7280",
                        }}
                      >
                        {showPassword ? <Eye size={18} /> : <EyeOff size={18} />}
                      </span>
                    </div>
                    {formData.password && (
                      <div
                        style={{
                          background: "#f9fafb",
                          border: "1px solid #e5e7eb",
                          borderRadius: "8px",
                          padding: "10px 12px",
                          marginTop: "8px",
                          fontSize: "12px",
                        }}
                      >
                        <p style={{ fontWeight: 600, color: "#374151", marginBottom: "6px" }}>
                          Password must contain:
                        </p>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "4px" }}>
                          {getPasswordRequirements(formData.password).map((req, idx) => (
                            <div
                              key={idx}
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "6px",
                                color: req.met ? "#16a34a" : "#6b7280",
                                transition: "color 0.2s ease",
                              }}
                            >
                              {req.met ? (
                                <Check size={14} color="#16a34a" strokeWidth={3} />
                              ) : (
                                <span
                                  style={{
                                    width: "6px",
                                    height: "6px",
                                    borderRadius: "50%",
                                    backgroundColor: "#9ca3af",
                                    display: "inline-block",
                                    marginLeft: "4px",
                                    marginRight: "4px",
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
                    <div style={{ position: "relative", width: "100%" }}>
                      <input
                        type={showPasswordConfirm ? "text" : "password"}
                        name="passwordConfirm"
                        value={formData.passwordConfirm}
                        onChange={handleInputChange}
                        required
                        style={{
                          width: "100%",
                          padding: "10px 42px 10px 12px",
                          border: "1px solid #d1d5db",
                          borderRadius: "8px",
                          outline: "none",
                        }}
                      />
                      <span
                        onClick={() => setShowPasswordConfirm(!showPasswordConfirm)}
                        style={{
                          position: "absolute",
                          right: "12px",
                          top: "50%",
                          transform: "translateY(-50%)",
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          color: "#6b7280",
                        }}
                      >
                        {showPasswordConfirm ? <Eye size={18} /> : <EyeOff size={18} />}
                      </span>
                    </div>
                    {formData.password &&
                      formData.passwordConfirm &&
                      formData.password !== formData.passwordConfirm && (
                        <small style={{ color: "#dc2626", fontSize: "12px", marginTop: "4px", display: "block" }}>
                          Passwords do not match
                        </small>
                      )}
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
                      Gadget Type <span style={{ fontSize: "12px", color: "#6b7280", fontWeight: "normal", marginLeft: "4px" }}>(Select all that apply)</span>
                    </label>
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(2, 1fr)",
                        gap: "10px",
                        marginTop: "4px",
                      }}
                    >
                      {[
                        { id: "phones", label: "Phones" },
                        { id: "laptops", label: "Laptops" },
                        { id: "tablets", label: "Tablets" },
                        { id: "other", label: "Other" },
                      ].map((item) => {
                        const isChecked = Array.isArray(formData.gadgetType) && formData.gadgetType.includes(item.id);
                        return (
                          <label
                            key={item.id}
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "8px",
                              padding: "10px 12px",
                              border: `1.5px solid ${isChecked ? "#2563eb" : "#d1d5db"}`,
                              borderRadius: "8px",
                              backgroundColor: isChecked ? "#eff6ff" : "#fff",
                              cursor: "pointer",
                              transition: "all 0.15s ease",
                              userSelect: "none",
                              fontWeight: isChecked ? 600 : 500,
                              color: isChecked ? "#1d4ed8" : "#374151",
                              fontSize: "13px",
                            }}
                          >
                            <input
                              type="checkbox"
                              name="gadgetType"
                              value={item.id}
                              checked={isChecked}
                              onChange={() => toggleGadgetType(item.id)}
                              style={{
                                accentColor: "#2563eb",
                                width: "15px",
                                height: "15px",
                                cursor: "pointer",
                              }}
                            />
                            <span style={{ cursor: "pointer", flex: 1 }}>{item.label}</span>
                          </label>
                        );
                      })}
                    </div>
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
