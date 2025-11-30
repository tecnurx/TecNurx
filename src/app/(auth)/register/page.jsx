"use client";
import logo from "@/assets/images/loglogo.svg";
import step1 from "@/assets/images/step1.svg";
import step2 from "@/assets/images/step2.svg";
import step3 from "@/assets/images/step3.svg";
import pstep2 from "@/assets/images/pstep2.svg";
import pstep3 from "@/assets/images/pstep3.svg";
import pstep4 from "@/assets/images/pstep4.svg";
import use from "@/assets/images/use.svg";
import part from "@/assets/images/part.svg";
import Image from "next/image";
import "./register.css";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import SelectGadgets from "@/components/SelectGadgets";

export default function MultiStepRegister() {
  const [role, setRole] = useState("user"); // user | partner
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    deviceType: "",
    deviceBrand: "",
    issue: "",
    businessName: "",
    category: "",
    experience: "",
    phone: "",
    address: "",
    description: "",
  });

  const nextStep = () => {
    const totalSteps = role === "partner" ? 4 : 3;
    if (step < totalSteps) setStep(step + 1);
  };

  const prevStep = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Submitted data:", { role, ...formData });
    console.log("Selected gadgets:", selectedGadgets);
    alert("Form submitted! Check console for details.");
  };

  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [selectedGadgets, setSelectedGadgets] = useState([]);

  return (
    <>
      <div className="register-wrap">
        {/* STEP 1 - Choose Role */}
        {step === 1 && (
          <div className="steps">
            <Link href="/">
              <Image src={logo} alt="logo" />
            </Link>
            <Image src={step1} alt="logo" />

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
                  className={role === "user" ? "active" : ""}
                >
                  <Image src={use} alt="user" />
                  <h3>Regular User</h3>
                  {/* <p>Buy, repair, and protect your devices</p> */}
                  <p>Repair, and protect your devices</p>
                </button>
                <button
                  type="button"
                  onClick={() => setRole("partner")}
                  className={role === "partner" ? "active" : ""}
                >
                  <Image src={part} alt="partner" />
                  <h3>Partner</h3>
                  {/* <p>Buy, repair, and protect your devices</p> */}
                  <p>repair, and protect your devices</p>
                </button>
              </div>
              <div>
                <div className="btns">
                  <button>Cancel</button>
                  <button onClick={nextStep}>Proceed</button>
                </div>
                <div className="alr-login">
                  Already have an account?
                  <Link href="/login">Login</Link>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* USER FLOW */}
        {role === "user" && step === 2 && (
          <div className="steps">
            <Image src={logo} alt="logo" />
            <Image src={step2} alt="logo" />
            <div className="card">
              <div className="welcome">
                <h1>
                  Let’s <span>set up</span> your account
                </h1>
                <p>You can always modify later</p>
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
                  <label htmlFor="">E-mail Address</label>
                  <input type="email" placeholder="Enter email address" />
                </div>
                <div className="form-group">
                  <label htmlFor="">Phone Number</label>
                  <input type="number" placeholder="Enter phone number" />
                </div>
                <div className="two-form-group">
                  <div className="form-group">
                    <label htmlFor="">Date of Birth</label>
                    <input type="date" />
                  </div>
                  <div className="form-group">
                    <label htmlFor="">Gender</label>
                    <select name="" id="">
                      <option value="">Select</option>
                      <option value="">Male</option>
                      <option value="">Female</option>
                    </select>
                  </div>
                </div>
              </div>
              <div className="btns">
                <button onClick={prevStep}>Back</button>
                <button onClick={nextStep}>Proceed</button>
              </div>
            </div>
          </div>
        )}

        {role === "user" && step === 3 && (
          <div className="steps">
            <Image src={logo} alt="logo" />
            <Image src={step3} alt="logo" />
            <div className="card">
              <div className="welcome">
                <h1>
                  Protect your <span>account</span>
                </h1>
                <p>Create a strong password to protect your account</p>
              </div>
              <div className="form">
                <div className="form-group">
                  <label htmlFor="">Create Password</label>
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter a password"
                  />
                  <span
                    className="eye"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <Eye size={20} /> : <EyeOff size={20} />}
                  </span>
                </div>
                <div className="form-group">
                  <label htmlFor="">Confirm Password</label>
                  <input
                    type={showNewPassword ? "text" : "password"}
                    placeholder="**********"
                  />
                  <span
                    className="eye"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                  >
                    {showNewPassword ? <Eye size={20} /> : <EyeOff size={20} />}
                  </span>
                </div>
              </div>
              <div>
                <p className="crt-p">
                  By creating an account you agree to our <br />
                  <span>Terms of Service</span> and
                  <span> Privacy Policy</span>
                </p>
                <div className="btns">
                  <button onClick={prevStep}>Back</button>
                  <button>Proceed</button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* PARTNER FLOW */}
        {role === "partner" && step === 2 && (
          <div className="steps">
            <Image src={logo} alt="logo" />
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
                  <input type="email" placeholder="Enter company name" />
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
            <Image src={logo} alt="logo" />
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
            <Image src={logo} alt="logo" />
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
    </>
  );
}
