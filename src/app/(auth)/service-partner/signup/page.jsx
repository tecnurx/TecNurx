"use client";

import React, { useState } from "react";
import "../service.css";
import Navbar from "@/components/navbar/Navbar";
import logo from "@/assets/images/logo.png";
import Image from "next/image";
import { toast } from "@/components/CustomToast";
import axios from "../../../../../lib/axios";
import { useRouter } from "next/navigation";

const ServicePartnerSignUp = () => {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [token, setToken] = useState("");

  const [formData, setFormData] = useState({
    // Step 1
    fname: "",
    lname: "",
    email: "",
    phoneNumber: "",
    password: "",
    passwordConfirm: "",
    designation: "",
    photo: "default.jpg",
    role: "eng",

    // Step 2
    verificationToken: "",

    // Step 3
    fullname: "",
    phone: "",
    address: "",
    yearsOfExperience: "",
    gadgetType: [],
    serviceCenter: "",
    toolsUsed: "",
    previousEmployment: "",
    whyPartner: "",
    certificate: "",
    resume: "",
  });

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

  const handleStep1Submit = async (e) => {
    e.preventDefault();
    if (loading) return;

    if (formData.password !== formData.passwordConfirm) {
      toast.error("Passwords do not match!");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        fname: formData.fname.trim(),
        lname: formData.lname.trim(),
        email: formData.email.trim(),
        password: formData.password,
        passwordConfirm: formData.passwordConfirm,
        phoneNumber: formData.phoneNumber,
        designation: formData.designation,
        photo: formData.photo,
        role: "eng",
      };

      const res = await axios.post("/users/signupEng", payload);

      // Extract the token from the response
      const receivedToken =
        res.data?.token ||
        res.data?.data?.token ||
        res.headers?.authorization ||
        res.data?.data?.user?.token;

      if (receivedToken) {
        setToken(receivedToken.replace("Bearer ", ""));
      }

      toast.success("Account created! Please check your email for the verification code.");
      setStep(2);
    } catch (err) {
      console.error("Signup error:", err);
      toast.error(
        err.response?.data?.message || "Signup failed. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleStep2Submit = async (e) => {
    e.preventDefault();
    if (loading) return;

    if (!formData.verificationToken) {
      toast.error("Please enter the verification code sent to your email.");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        verificationToken: formData.verificationToken.trim(),
        email: formData.email.trim(),
      };

      await axios.post("/users/verify-email", payload);

      toast.success("Email verified successfully! Please complete your profile.");
      
      // Auto-fill Step 3 name and phone based on Step 1
      setFormData((prev) => ({
        ...prev,
        fullname: prev.fname + " " + prev.lname,
        phone: prev.phoneNumber,
      }));
      
      setStep(3);
    } catch (err) {
      console.error("Verification error:", err);
      toast.error(
        err.response?.data?.message || "Verification failed. Please check your code and try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleResendToken = async () => {
    if (loading) return;
    setLoading(true);
    try {
      await axios.post("/users/resend-token", { email: formData.email.trim() });
      toast.success("Verification code resent! Please check your email.");
    } catch (err) {
      console.error("Resend error:", err);
      toast.error(
        err.response?.data?.message || "Failed to resend code. Please try again later.",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleStep3Submit = async (e) => {
    e.preventDefault();
    if (loading) return;

    setLoading(true);
    try {
      const payload = new FormData();
      payload.append("fullname", formData.fullname);
      payload.append("phoneNumber", formData.phone);
      payload.append("email", formData.email); // Uses email from step 1
      payload.append("address", formData.address);
      payload.append("yearsOfExperience", formData.yearsOfExperience);
      
      payload.append("gadgetType", JSON.stringify(formData.gadgetType));
      payload.append("serviceCenter", formData.serviceCenter === "yes" ? "true" : "false");
      
      const tools = formData.toolsUsed.split(",").map((i) => i.trim());
      payload.append("toolsUsed", JSON.stringify(tools));
      
      payload.append("previousEmployment", formData.previousEmployment === "yes" ? "true" : "false");
      payload.append("whyPartner", formData.whyPartner);
      
      if (formData.certificate) payload.append("certificate", formData.certificate);
      if (formData.resume) payload.append("resume", formData.resume);

      await axios.post("/service-providers", payload, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      toast.success("Registration complete!");
      router.push("/not-engineer-login");
    } catch (err) {
      console.error("Service provider profile error:", err);
      toast.error(
        err.response?.data?.message ||
          "Profile creation failed. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <div className="service-partner">
        <div className="service-form">
          <div className="service-logo">
            <Image src={logo} alt="logo" width={197} />
          </div>
          <h1>Become a Service Partner</h1>

          {step === 1 && (
            <form onSubmit={handleStep1Submit}>
              <div className="service-group">
                <p>Personal Information (Step 1 of 3)</p>
                <div className="service-form-wrap">
                  <label htmlFor="fname">First Name</label>
                  <input
                    type="text"
                    name="fname"
                    id="fname"
                    value={formData.fname}
                    onChange={handleChange}
                    required
                    placeholder="Enter First Name"
                  />
                </div>
                <div className="service-form-wrap">
                  <label htmlFor="lname">Last Name</label>
                  <input
                    type="text"
                    name="lname"
                    id="lname"
                    value={formData.lname}
                    onChange={handleChange}
                    required
                    placeholder="Enter Last Name"
                  />
                </div>
                <div className="service-form-wrap">
                  <label htmlFor="phoneNumber">Phone Number</label>
                  <input
                    type="text"
                    name="phoneNumber"
                    id="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={handleChange}
                    required
                    placeholder="Enter Phone Number"
                  />
                </div>
                <div className="service-form-wrap">
                  <label htmlFor="email">Email Address</label>
                  <input
                    type="email"
                    name="email"
                    id="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    placeholder="Enter Email Address"
                  />
                </div>
                <div className="service-form-wrap">
                  <label htmlFor="designation">Designation</label>
                  <input
                    type="text"
                    name="designation"
                    id="designation"
                    value={formData.designation}
                    onChange={handleChange}
                    required
                    placeholder="e.g. Senior Technician"
                  />
                </div>
                <div className="service-form-wrap">
                  <label htmlFor="password">Password</label>
                  <input
                    type="password"
                    name="password"
                    id="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    placeholder="Enter Password"
                  />
                </div>
                <div className="service-form-wrap">
                  <label htmlFor="passwordConfirm">Confirm Password</label>
                  <input
                    type="password"
                    name="passwordConfirm"
                    id="passwordConfirm"
                    value={formData.passwordConfirm}
                    onChange={handleChange}
                    required
                    placeholder="Confirm Password"
                  />
                </div>
              </div>
              <button type="submit" disabled={loading}>
                {loading ? "Processing..." : "Next Step"}
              </button>
            </form>
          )}

          {step === 2 && (
            <form onSubmit={handleStep2Submit}>
              <div className="service-group">
                <p>Email Verification (Step 2 of 3)</p>
                <div style={{ textAlign: "center", marginBottom: "20px" }}>
                  <p style={{ color: "#4b5563", fontSize: "14px" }}>
                    We've sent a verification code to <strong>{formData.email}</strong>. 
                    Please enter it below.
                  </p>
                </div>
                <div className="service-form-wrap">
                  <label htmlFor="verificationToken">Verification Code</label>
                  <input
                    type="text"
                    name="verificationToken"
                    id="verificationToken"
                    value={formData.verificationToken}
                    onChange={handleChange}
                    required
                    placeholder="Enter Code"
                    style={{ textAlign: "center", letterSpacing: "2px", fontSize: "18px" }}
                  />
                </div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                <button type="submit" disabled={loading}>
                  {loading ? "Verifying..." : "Verify Email"}
                </button>
                <button 
                  type="button" 
                  onClick={handleResendToken}
                  disabled={loading}
                  style={{ background: "transparent", color: "#111827", border: "1px solid #111827" }}
                >
                  Resend Code
                </button>
              </div>
            </form>
          )}

          {step === 3 && (
            <form onSubmit={handleStep3Submit}>
              <div className="service-group">
                <p>Professional Information (Step 3 of 3)</p>
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
                  <label htmlFor="phone">Phone Number</label>
                  <input
                    type="number"
                    name="phone"
                    id="phone"
                    value={formData.phone}
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
                    type="text"
                    name="yearsOfExperience"
                    id="yearsOfExperience"
                    value={formData.yearsOfExperience}
                    onChange={handleChange}
                    required
                    placeholder="Enter"
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
                    placeholder="List of tools & equipment you use"
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
                    placeholder="Enter"
                  ></textarea>
                </div>
                <div className="service-form-wrap">
                  <label>
                    Do you agree to abide by TecNurx's quality and Service
                    Standard?
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

              <button type="submit" disabled={loading}>
                {loading ? "Submitting..." : "Submit Application"}
              </button>
            </form>
          )}
        </div>
      </div>
    </>
  );
};

export default ServicePartnerSignUp;
