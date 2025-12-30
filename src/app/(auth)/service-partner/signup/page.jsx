import React from "react";
import "../service.css";
import Navbar from "@/components/navbar/Navbar";
import logo from "@/assets/images/logo.png";
import Image from "next/image";
import { toast } from "@/components/CustomToast";

const ServicePartnerSignUp = () => {
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
      };

      // This is the real signup
      await authService.signup(payload);

      // Only show success and proceed if NO error
      toast.success(
        "Engineer account creater!"
      );
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
    <>
      <Navbar />
      <div className="service-partner">
        <div className="service-form">
          <div className="service-logo">
            <Image src={logo} alt="logo" width={197} />
          </div>
          <h1>Become a Service Partner</h1>
          <div className="service-group">
            <p>Personal Information</p>
            <div className="service-form-wrap">
              <label htmlFor="">Full Name</label>
              <input type="text" placeholder="Enter Full Name" />
            </div>
            <div className="service-form-wrap">
              <label htmlFor="">Phone Number</label>
              <input type="text" placeholder="Enter Phone Number" />
            </div>
            <div className="service-form-wrap">
              <label htmlFor="">Email Address</label>
              <input type="text" placeholder="Enter Email Address" />
            </div>
            <div className="service-form-wrap">
              <label htmlFor="">Home Address</label>
              <input type="text" placeholder="Enter Home Address" />
            </div>
          </div>

          <div className="service-group">
            <p>Professional Information</p>
            <div className="service-form-wrap">
              <label htmlFor="">Years of Experience</label>
              <input type="text" placeholder="Enter" />
            </div>
            <div className="service-form-wrap">
              <label htmlFor="">Certificates (If any)</label>
              <input type="file" />
            </div>
            <div className="service-form-wrap">
              <label htmlFor="">Gadget Type</label>
              <select name="" id="">
                <option value="">Type of gadgets you specialize in</option>
              </select>
            </div>
            <div className="service-form-wrap">
              <label htmlFor="">
                Do you own or have access to a Service center?
              </label>
              <div className="service-check">
                <div>
                  <input type="radio" name="" id="" />
                  Yes
                </div>
                <div>
                  <input type="radio" name="" id="" />
                  No
                </div>
              </div>
            </div>
            <div className="service-form-wrap">
              <label htmlFor="">
                Tools & Equipment <span>(Separate items with commas)</span>
              </label>
              <input
                type="text"
                placeholder="List of tools & equipment you use"
              />
            </div>
            <div className="service-form-wrap">
              <label htmlFor="">
                Any Previous Employment in a Repair Center?
              </label>
              <div className="service-check">
                <div>
                  <input type="radio" name="" id="" />
                  Yes
                </div>
                <div>
                  <input type="radio" name="" id="" />
                  No
                </div>
              </div>
            </div>
          </div>

          <div className="service-group">
            <p>Additional Information</p>
            <div className="service-form-wrap">
              <label htmlFor="">Why do you want to partner with TecNurx?</label>
              <textarea name="" id="" placeholder="Enter"></textarea>
            </div>
            <div className="service-form-wrap">
              <label htmlFor="">
                Do you agree to abide by TecNurx's quality and Service Standard?
              </label>
              <div className="service-check">
                <div>
                  <input type="radio" name="" id="" />
                  Yes
                </div>
              </div>
            </div>
            <div className="service-form-wrap">
              <label htmlFor="">Upload Resume/ Portfolio (If available)</label>
              <input type="file" />
            </div>
          </div>

          <button>Submit</button>
        </div>
      </div>
    </>
  );
};

export default ServicePartnerSignUp;
