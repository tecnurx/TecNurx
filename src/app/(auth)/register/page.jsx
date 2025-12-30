// app/register/page.tsx
"use client";

import logo from "@/assets/images/logo.png";
import step1 from "@/assets/images/step1.svg";
import step2 from "@/assets/images/step2.svg";
import step3 from "@/assets/images/step3.svg";
import useImg from "@/assets/images/use.svg";
import partImg from "@/assets/images/part.svg";
import pstep2 from "@/assets/images/pstep2.svg";
import pstep3 from "@/assets/images/pstep3.svg";
import pstep4 from "@/assets/images/pstep4.svg";

import Image from "next/image";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "@/components/CustomToast";
import "./register.css";
import { authService } from "./../../../../services/auth";
import SelectGadgets from "@/components/SelectGadgets";

export default function MultiStepRegister() {
  const router = useRouter();

  const [step, setStep] = useState(1);
  const [role, setRole] = useState("user");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedGadgets, setSelectedGadgets] = useState([]);

  // Unified form data for BOTH flows
  const [formData, setFormData] = useState({
    // User fields
    fname: "",
    lname: "",
    email: "",
    phoneNumber: "",
    dateOfBirth: "",
    gender: "",
    password: "",
    passwordConfirm: "",

    // Partner fields
    coName: "",
    industry: "",
    state: "",
    lga: "",
    address: "",
    designation: "",
    partnerEmail: "",
    partnerPhone: "",
    gadgetTypes: [],
    monthlyQuantity: "",
    servicePlan: "",
    comments: "",

    // Shared
    photo: "default.jpg",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const nextStep = () => {
    const maxSteps = role === "user" ? 3 : 4;
    if (step < maxSteps) setStep(step + 1);
  };

  const prevStep = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;

    setLoading(true);

    // Validate passwords match
    if (formData.password !== formData.passwordConfirm) {
      toast.error("Passwords do not match!");
      setLoading(false);
      return;
    }

    try {
      let payload = {
        photo: formData.photo,
      };

      if (role === "user") {
        payload = {
          ...payload,
          fname: formData.fname.trim(),
          lname: formData.lname.trim(),
          email: formData.email.trim(),
          phoneNumber: formData.phoneNumber,
          dateOfBirth: formData.dateOfBirth,
          gender: formData.gender.toLowerCase(),
          password: formData.password,
          passwordConfirm: formData.passwordConfirm,
          role: "user",
        };

        // This is the real signup
        await authService.signup(payload);

        // Only show success and proceed if NO error
        toast.success(
          "Account created! Please check your email for verification code."
        );

        // Save email for verification page
        localStorage.setItem("pendingVerificationEmail", formData.email.trim());

        // Redirect after a short delay so user sees the toast
        setTimeout(() => {
          router.push("/verify-email");
        }, 1000);
      } else {
        // Partner flow (same logic)
        payload = {
          ...payload,
          coName: formData.coName,
          email: formData.partnerEmail || formData.email,
          phoneNumber: formData.partnerPhone,
          role: "partner",
          // add more fields later
        };

        await authService.signup(payload);
        toast.success("Partner application submitted! We'll review it soon.");
        // No email verification for partners? Skip redirect or change route
      }
    } catch (err) {
      // This block runs ONLY on actual error
      console.error("Signup error:", err);

      if (err.response?.data?.code === 11000) {
        const field = Object.keys(err.response.data.keyPattern)[0];
        const value = err.response.data.keyValue[field];
        toast.error(
          field === "email"
            ? `Email "${value}" is already registered!`
            : `Phone "${value}" is already in use!`
        );
      } else if (err.response?.data?.message) {
        toast.error(err.response.data.message);
      } else {
        toast.error("Signup failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-wrap">
      {/* STEP 1 – Role Selection */}
      {step === 1 && (
        <div className="steps">
          <Link href="/">
            <Image src={logo} alt="logo" width={120} />
          </Link>
          <Image src={step1} alt="step 1" className="my-6" />

          <div className="card">
            <div className="welcome">
              <h1>Welcome!</h1>
              <h2>First things first...</h2>
              <p>What best describes what you want to do?</p>
            </div>

            <div className="user-partner">
              <button
                type="button"
                onClick={() => setRole("user")}
                className={role === "user" ? "activeselect" : ""}
              >
                <Image src={useImg} alt="user" />
                <h3>Regular User</h3>
                <p>Repair and protect your devices</p>
              </button>

              <button
                type="button"
                onClick={() => setRole("partner")}
                className={role === "partner" ? "activeselect" : ""}
              >
                <Image src={partImg} alt="partner" />
                <h3>Partner</h3>
                <p>Join as a business</p>
              </button>
            </div>

            <div className="btns">
              <button type="button">Cancel</button>
              <button type="button" onClick={nextStep}>
                Proceed
              </button>
            </div>

            <div className="alr-login">
              Already have an account? <Link href="/login">Login</Link>
            </div>
          </div>
        </div>
      )}
      {/* USER FLOW */}
      {role === "user" && step === 2 && (
        <div className="steps">
          <Image src={logo} alt="logo" width={120} />
          <Image src={step2} alt="step 2" className="my-6" />
          <div className="card">
            <div className="welcome">
              <h1>
                Let’s <span>set up</span> your account
              </h1>
              <p>You can always modify later</p>
            </div>

            <form className="form space-y-4">
              <div className="two-form-group">
                <div className="form-group">
                  <label>First Name</label>
                  <input
                    type="text"
                    name="fname"
                    value={formData.fname}
                    onChange={handleChange}
                    placeholder="John"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Last Name</label>
                  <input
                    type="text"
                    name="lname"
                    value={formData.lname}
                    onChange={handleChange}
                    placeholder="Doe"
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Email Address</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="john@example.com"
                  required
                />
              </div>

              <div className="form-group">
                <label>Phone Number</label>
                <input
                  type="tel"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  placeholder="1234567890"
                  required
                />
              </div>

              <div className="two-form-group">
                <div className="form-group">
                  <label>Date of Birth</label>
                  <input
                    type="date"
                    name="dateOfBirth"
                    value={formData.dateOfBirth}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Gender</label>
                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                  </select>
                </div>
              </div>
            </form>

            <div className="btns">
              <button type="button" onClick={prevStep}>
                Back
              </button>
              <button type="button" onClick={nextStep}>
                Proceed
              </button>
            </div>
          </div>
        </div>
      )}
      {role === "user" && step === 3 && (
        <div className="steps">
          <Image src={logo} alt="logo"  width={120} />
          <Image src={step3} alt="step 3" className="my-6" />
          <div className="card">
            <div className="welcome">
              <h1>
                Protect your <span>account</span>
              </h1>
              <p>Create a strong password</p>
            </div>

            <form onSubmit={handleSubmit} className="form space-y-4">
              <div className="form-group relative">
                <label>Create Password</label>
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  required
                />
                <span
                  className="eye"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <Eye size={20} /> : <EyeOff size={20} />}
                </span>
              </div>

              <div className="form-group relative">
                <label>Confirm Password</label>
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  name="passwordConfirm"
                  value={formData.passwordConfirm}
                  onChange={handleChange}
                  placeholder="••••••••"
                  required
                />
                <span
                  className="eye"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <Eye size={20} />
                  ) : (
                    <EyeOff size={20} />
                  )}
                </span>
              </div>

              <p className="crt-p text-center text-sm">
                By creating an account you agree to our <br />
                <span className="text-blue-500">Terms of Service</span> and{" "}
                <span className="text-blue-500">Privacy Policy</span>
              </p>

              <div className="btns">
                <button type="button" onClick={prevStep}>
                  Back
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className={`submit-btn ${loading ? "submit-disable" : ""}`}
                >
                  {loading ? "Creating Account..." : "Create Account"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* PARTNER FLOW */}

      {role === "partner" && step === 2 && (
        <div className="steps">
          <Image src={logo} alt="logo"  width={120} />
          <Image src={pstep2} alt="logo" />
          <div className="card">
            <div className="welcome">
              <h1>
                Become a <span> partner</span>
              </h1>
              <p>Let’s get to know you</p>
            </div>

            <div className="form">
              <div className="form-group">
                <label htmlFor="">Company Name</label>

                <input type="text" placeholder="Enter company name" />
              </div>

              <div className="form-group">
                <label htmlFor="">Industry</label>

                <select name="" id="">
                  <option value="">Select Industry</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="">Business Address</label>

                <select name="" id="">
                  <option value="">Select State</option>
                </select>

                <select name="" id="">
                  <option value="">Select LGA</option>
                </select>

                <input type="text" placeholder="Enter address" />
              </div>
            </div>

            <div className="btns">
              <button onClick={prevStep}>Back</button>
              <button onClick={nextStep}>Proceed</button>
            </div>
          </div>
        </div>
      )}

      {role === "partner" && step === 3 && (
        <div className="steps">
          <Image src={logo} alt="logo"  width={120} />

          <Image src={pstep3} alt="logo" />

          <div className="card">
            <div className="welcome">
              <h1>
                Become a <span> partner</span>
              </h1>
              <p>Let’s get to know you</p>
            </div>

            <div className="form">
              <div className="two-form-group">
                <div className="form-group">
                  <label htmlFor="">Name</label>

                  <input type="text" placeholder="First name" />
                </div>

                <div className="form-group">
                  <label htmlFor="" style={{ color: "white" }}>
                    Last Name
                  </label>

                  <input type="text" placeholder="Last name" />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="">Designation</label>

                <input type="email" placeholder="Enter designation" />
              </div>

              <div className="form-group">
                <label htmlFor="">E-mail Address</label>

                <input type="email" placeholder="Enter email address" />
              </div>

              <div className="form-group">
                <label htmlFor="">Phone Number</label>

                <input type="number" placeholder="Enter phone number" />
              </div>
            </div>

            <div className="btns">
              <button onClick={prevStep}>Back</button>
              <button onClick={nextStep}>Proceed</button>
            </div>
          </div>
        </div>
      )}

      {role === "partner" && step === 4 && (
        <div className="steps">
          <Image src={logo} alt="logo"  width={120} />

          <Image src={pstep4} alt="logo" />

          <div className="card">
            <div className="welcome">
              <h1>
                Become a <span> partner</span>
              </h1>
              <p>What would you be working on?</p>
            </div>

            <div className="form">
              {/* GADGETS OPTION */}

              <div className="form-group">
                <label htmlFor="">Type of Gadget</label>
                <p>Select all that apply</p>

                <SelectGadgets
                  selectedOptions={selectedGadgets}
                  setSelectedOptions={setSelectedGadgets}
                />
              </div>

              <div className="form-group">
                <label htmlFor="">Quantity</label>

                <input
                  type="number"
                  placeholder="How many gadgets will be attended to monthly?"
                />
              </div>

              <div className="form-group">
                <label htmlFor="">Service Plan</label>

                <input type="text" placeholder="Select preferred plan" />
              </div>

              <div className="form-group">
                <label htmlFor="">Additional Requirements or Comments</label>

                <textarea placeholder="Enter here" />
              </div>
            </div>

            <div className="btns">
              <button onClick={prevStep}>Back</button>
              <button>Submit Information</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
