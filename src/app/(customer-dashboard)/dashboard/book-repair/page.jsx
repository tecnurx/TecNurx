"use client";
import React, { useEffect, useState } from "react";
import "./book.css";
import step1 from "@/assets/images/step1.svg";
import upload from "@/assets/images/upload.svg";
import Image from "next/image";
import { useRouter } from "next/navigation";
import SelectGadgets from "@/components/SelectGadgets";
import { repairService } from "./../../../../../services/repairs";
import step2 from "@/assets/images/step2.svg";
import step3 from "@/assets/images/step3.svg";
import { BookRepairModal } from "./step3/BookModal";
import phone from "@/assets/images/phone.svg";
import cam from "@/assets/images/cam.svg";
import desk from "@/assets/images/desk.svg";
import laptop from "@/assets/images/laptop.svg";

const BookRepair = () => {
  const [step, setStep] = useState(1);

  const nextStep = () => {
    const maxSteps = 3;
    if (step < maxSteps) setStep(step + 1);
  };

  const prevStep = () => {
    if (step > 1) setStep(step - 1);
  };

  const repairDetails = {
    brand: "iPhone",
    model: "16 pro max",
    issue: "Screen Replacement",
    issueDescription: "Cracked screen needs replacement",
    phoneNumber: "08123456789",
    Address: "123 Main St, City, Country",
    Icon: phone,
  };

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [trackingData, setTrackingData] = useState({
    trackingNumber: "",
    totalTime: "00:40:00",
    repairTime: "00:00:00",
  });

  const GetMyQuote = () => {
    setIsModalOpen(true);
  };

  const [selectedGadgets, setSelectedGadgets] = useState([]);

  useEffect(() => {
    const fetchIssues = async () => {
      try {
        const res = await repairService.getIssues();
        console.log(res);
      } catch (err) {
        console.error("Failed to load devices:", err);
      }
    };
    fetchIssues();
  }, []);

  return (
    <>
      <div className="book-page">
        <div className="book-header">
          <h1>Book Repair</h1>
          <p>Fix your gadgets</p>
        </div>
        {step === 1 && (
          <div className="repair-form-wrap">
            <div className="repair-head">
              <Image src={step1} alt="step 1" />
              <h2>Gadget Details</h2>
            </div>
            <div className="repair-form">
              <div className="form-wrap">
                <label htmlFor="">Type of Gadget</label>
                <SelectGadgets
                  selectedOptions={selectedGadgets}
                  setSelectedOptions={setSelectedGadgets}
                />
              </div>
              <div className="bookform-grid">
                <div className="form-wrap">
                  <label htmlFor="">Device Brand</label>
                  <select name="" id="">
                    <option value="">Select</option>
                  </select>
                </div>
                <div className="form-wrap">
                  <label htmlFor="">Device Model</label>
                  <select name="" id="">
                    <option value="">Select</option>
                  </select>
                </div>
                <div className="form-wrap">
                  <label htmlFor="">Fault</label>
                  <select name="" id="">
                    <option value="">Select</option>
                  </select>
                </div>
              </div>
              <div className="form-wrap">
                <label htmlFor="">Describe Fault</label>
                <textarea
                  name=""
                  id=""
                  placeholder="Tell us what's wrong with your device so we can get you an accurate quote"
                ></textarea>
              </div>
              <div className="form-wrap">
                <label htmlFor="">Supporting Images</label>
                <p>
                  <span>Supported formats: .pdf, .docx, .csv, .txt</span>
                  <span>Max file size 10MB</span>
                </p>
                <div
                  className="upload-image"
                  onDragOver={(e) => e.preventDefault()} // Prevents default browser behavior
                  onDrop={(e) => {
                    e.preventDefault();
                    const files = e.dataTransfer.files;
                    if (files) {
                      console.log("Dropped files:", files);
                      // Handle dropped files here
                    }
                  }}
                >
                  <label htmlFor="file-upload" style={{ cursor: "pointer" }}>
                    <div>
                      <Image src={upload} alt="upload" />
                      Drag and drop a file(s) here, or <br />
                      Choose file(s)
                    </div>
                  </label>
                  <input
                    id="file-upload"
                    type="file"
                    style={{ display: "none" }}
                    onChange={(e) => {
                      const files = e.target.files;
                      if (files) {
                        console.log("Selected files:", files);
                        // Handle file upload logic here
                      }
                    }}
                    multiple
                  />
                </div>
              </div>
            </div>
            <div className="repair-btn">
              <button className="repair-btn-back">Cancel</button>
              <button className="repair-btn-proceed" onClick={nextStep}>
                Proceed
              </button>
            </div>
          </div>
        )}
        {step === 2 && (
          <div className="repair-form-wrap">
            <div className="repair-head">
              <Image src={step2} alt="step 2" />
              <h2>Pickup Details</h2>
            </div>
            <div className="repair-form">
              <div className="form-wrap">
                <label htmlFor="">Business Address</label>
                <div className="bookform-grid">
                  <select name="" id="">
                    <option value="">Select State</option>
                  </select>
                  <select name="" id="">
                    <option value="">Select LGA</option>
                  </select>
                  <input type="text" placeholder="House Number" />
                </div>
              </div>
              <div className="form-wrap">
                <input
                  type="text"
                  placeholder="Street"
                  className="form-street"
                />
              </div>
              <div className="bookform-grid2">
                <div className="form-wrap">
                  <label htmlFor="">Phone Number</label>
                  <input type="phone" placeholder="Street" />
                </div>
                <div className="form-wrap">
                  <label htmlFor="">Payment Option</label>
                  <select name="" id="">
                    <option value="">Select</option>
                  </select>
                </div>
              </div>
              <div className="form-wrap">
                <label htmlFor="">Pickup Date & Time</label>
                <div className="bookform-grid2">
                  <div className="form-wrap">
                    <input type="date" />
                  </div>
                  <div className="form-wrap">
                    <input type="time" />
                  </div>
                </div>
              </div>
            </div>
            <div className="repair-btn">
              <button className="repair-btn-back" onClick={prevStep}>
                Back
              </button>
              <button className="repair-btn-proceed" onClick={nextStep}>
                Proceed
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="repair-form-wrap">
            <div className="repair-head">
              <Image src={step3} alt="step 3" />
              <h2>Summary</h2>
            </div>
            <div className="repair-summary">
              <div className="repair-details">
                <div className="brand-model">
                  <Image src={repairDetails.Icon} alt="device icon" />
                  <div>
                    <h3>{repairDetails.brand}</h3>
                    <p>{repairDetails.model}</p>
                  </div>
                </div>
                <div className="device-details">
                  <div>
                    <h3>Issue</h3>
                    <p>{repairDetails.issue}</p>
                  </div>
                  <div>
                    <h3>Issue Description</h3>
                    <p>{repairDetails.issueDescription}</p>
                  </div>
                  <div>
                    <h3>Phone Number</h3>
                    <p>{repairDetails.phoneNumber}</p>
                  </div>
                  <div>
                    <h3>Address</h3>
                    <p>{repairDetails.Address}</p>
                  </div>
                </div>
              </div>
              <div className="agree">
                <input type="checkbox" name="" id="" />
                <p>
                  l agree to the <span>contract details</span> &{" "}
                  <span>terms of use</span>
                </p>
              </div>
            </div>
            <div className="repair-btn">
              <button className="repair-btn-back" onClick={prevStep}>
                Back
              </button>
              <button className="repair-btn-proceed" onClick={GetMyQuote}>
                Get my quote
              </button>
            </div>
          </div>
        )}
      </div>
      <BookRepairModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        totalTime={trackingData.totalTime}
        repairTime={trackingData.repairTime}
      />
    </>
  );
};

export default BookRepair;
