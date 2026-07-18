"use client";

import React, { useState, useEffect } from "react";
import axios from "../../../../../lib/axios";
import { toast } from "@/components/CustomToast";
import { useRouter } from "next/navigation";
import "../../../(auth)/service-partner/service.css"; 

export default function CompleteProfile() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    fullname: "",
    phone: "",
    email: "",
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
  });

  useEffect(() => {
    // Populate email from localStorage if available
    const userJson = localStorage.getItem("user");
    if (userJson) {
      try {
        const user = JSON.parse(userJson);
        if (user.email) {
          setFormData((prev) => ({ ...prev, email: user.email }));
        }
      } catch (e) {}
    }
  }, []);

  const handleChange = (e) => {
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = new FormData();
      payload.append("fullname", formData.fullname);
      payload.append("phoneNumber", formData.phoneNumber);
      payload.append("email", formData.email);
      payload.append("address", formData.address);
      payload.append("yearsOfExperience", formData.yearsOfExperience);
      payload.append("gadgetType", JSON.stringify(formData.gadgetType));
      payload.append("serviceCenter", formData.serviceCenter === "yes");
      payload.append(
        "toolsUsed",
        JSON.stringify(formData.toolsUsed.split(",").map((i) => i.trim()))
      );
      payload.append("previousEmployment", formData.previousEmployment === "yes");
      payload.append("whyPartner", formData.whyPartner);

      if (formData.certificate) payload.append("certificate", formData.certificate);
      if (formData.resume) payload.append("resume", formData.resume);

      const token = localStorage.getItem("token");

      await axios.post("/service-providers", payload, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      });

      toast.success("Profile completed successfully!");
      
      // Update localStorage to bypass future redirect checks
      const userJson = localStorage.getItem("user");
      if (userJson) {
        try {
          const user = JSON.parse(userJson);
          user.hasServicePartnerProfile = true;
          localStorage.setItem("user", JSON.stringify(user));
        } catch (e) {}
      }
      
      setTimeout(() => {
        // Force hard redirect to reload engineer-dashboard layout cleanly
        window.location.href = "/engineer-dashboard";
      }, 1500);

    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "40px 20px" }}>
      <div className="service-inner" style={{ margin: "0 auto", maxWidth: "800px", padding: 0 }}>
        <h2 style={{ marginBottom: "20px" }}>Complete Your Profile</h2>
        <p style={{ marginBottom: "30px", color: "#6b7280" }}>
          Please provide the following professional information to access your engineer-dashboard.
        </p>

        <form onSubmit={handleSubmit}>
          <div className="service-group">
            <p>Professional Information</p>
            <div className="service-form-wrap">
              <label htmlFor="fullname">Full Name</label>
              <input
                type="text"
                name="fullname"
                id="fullname"
                value={formData.fullname}
                onChange={handleChange}
                required
                placeholder="Enter Full Name"
              />
            </div>
            <div className="service-form-wrap">
              <label htmlFor="phoneNumber">Phone Number</label>
              <input
                type="number"
                name="phoneNumber"
                id="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleChange}
                required
                placeholder="Enter Phone Number"
              />
            </div>
            <div className="service-form-wrap">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                name="email"
                id="email"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="Enter Email"
                disabled // Pulled from localStorage
                style={{ backgroundColor: "#f3f4f6", cursor: "not-allowed" }}
              />
            </div>
            <div className="service-form-wrap">
              <label htmlFor="address">Home Address</label>
              <input
                type="text"
                name="address"
                id="address"
                value={formData.address}
                onChange={handleChange}
                required
                placeholder="Enter Home Address"
              />
            </div>
            <div className="service-form-wrap">
              <label htmlFor="yearsOfExperience">Years of Experience</label>
              <input
                type="number"
                name="yearsOfExperience"
                id="yearsOfExperience"
                value={formData.yearsOfExperience}
                onChange={handleChange}
                required
                placeholder="e.g. 5"
              />
            </div>
            <div className="service-form-wrap">
              <label htmlFor="certificates">Certificates (If any)</label>
              <input type="file" name="certificate" id="certificates" accept=".pdf,.doc,.docx,image/*" onChange={handleFileChange} />
            </div>
            <div className="service-form-wrap">
              <label htmlFor="gadgetType">
                Gadget Type <span style={{ fontSize: "12px", color: "#6b7280", fontWeight: "normal", marginLeft: "4px" }}>(Ctrl/Cmd+click to select multiple)</span>
              </label>
              <select
                multiple
                name="gadgetType"
                id="gadgetType"
                value={formData.gadgetType}
                onChange={handleChange}
                required
                style={{ minHeight: "100px" }}
              >
                <option value="phones">Phones</option>
                <option value="laptops">Laptops</option>
                <option value="tablets">Tablets</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div className="service-form-wrap">
              <label>Do you own or have access to a Service center?</label>
              <div className="service-check">
                <div>
                  <input
                    type="radio"
                    name="serviceCenter"
                    value="yes"
                    onChange={handleChange}
                    checked={formData.serviceCenter === "yes"}
                    required
                  />
                  Yes
                </div>
                <div>
                  <input
                    type="radio"
                    name="serviceCenter"
                    value="no"
                    onChange={handleChange}
                    checked={formData.serviceCenter === "no"}
                  />
                  No
                </div>
              </div>
            </div>
            <div className="service-form-wrap">
              <label htmlFor="toolsUsed">
                Tools & Equipment <span>(Separate items with commas)</span>
              </label>
              <input
                type="text"
                name="toolsUsed"
                id="toolsUsed"
                value={formData.toolsUsed}
                onChange={handleChange}
                required
                placeholder="e.g. Screwdriver, Multimeter, Soldering Iron"
              />
            </div>
            <div className="service-form-wrap">
              <label>Any Previous Employment in a Repair Center?</label>
              <div className="service-check">
                <div>
                  <input
                    type="radio"
                    name="previousEmployment"
                    value="yes"
                    onChange={handleChange}
                    checked={formData.previousEmployment === "yes"}
                    required
                  />
                  Yes
                </div>
                <div>
                  <input
                    type="radio"
                    name="previousEmployment"
                    value="no"
                    onChange={handleChange}
                    checked={formData.previousEmployment === "no"}
                  />
                  No
                </div>
              </div>
            </div>
          </div>

          <div className="service-group">
            <p>Additional Information</p>
            <div className="service-form-wrap">
              <label htmlFor="whyPartner">
                Why do you want to partner with TecNurx?
              </label>
              <textarea
                name="whyPartner"
                id="whyPartner"
                value={formData.whyPartner}
                onChange={handleChange}
                required
                placeholder="Enter your reasons"
                rows="4"
              ></textarea>
            </div>
            <div className="service-form-wrap">
              <label>
                Do you agree to abide by TecNurx's quality and Service Standard?
              </label>
              <div className="service-check">
                <div>
                  <input
                    type="radio"
                    name="agreeToAbide"
                    value="yes"
                    onChange={handleChange}
                    checked={formData.agreeToAbide === "yes"}
                    required
                  />
                  Yes
                </div>
              </div>
            </div>
            <div className="service-form-wrap">
              <label htmlFor="resume">
                Upload Resume/ Portfolio (If available)
              </label>
              <input type="file" name="resume" id="resume" accept=".pdf,.doc,.docx" onChange={handleFileChange} />
            </div>
          </div>

          <button type="submit" disabled={loading} style={{ width: "100%", padding: "14px", background: "#3b82f6", color: "white", border: "none", borderRadius: "8px", fontWeight: "bold", cursor: loading ? "not-allowed" : "pointer" }}>
            {loading ? "Submitting Profile..." : "Complete Profile"}
          </button>
        </form>
      </div>
    </div>
  );
}
