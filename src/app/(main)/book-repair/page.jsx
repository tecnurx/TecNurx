"use client";
import React, { useEffect, useState } from "react";
import "./book.css";
import step1 from "@/assets/images/step1.svg";
import upload from "@/assets/images/upload.svg";
import Image from "next/image";
import { useRouter } from "next/navigation";
import SelectGadgets from "@/components/SelectGadgets";
import Footer from "@/components/footer/Footer";
import { repairService } from "../../../../services/repairs";

const BookRepair = () => {
  const router = useRouter();

  const onProceed = () => {
    router.push("/book-repair/step2");
  };

  const [selectedGadgets, setSelectedGadgets] = useState([]);

  useEffect(() => {
    const fetchIssues = async () => {
      try {
        const res = await repairService.getIssues();
        console.log(res)
      } catch (err) {
        console.error("Failed to load devices:", err);
      }
    };
    fetchIssues();
  }, []);

  return (
    <>
      <div className="section-wrap">
        <div className="header">
          <h1>
            Fix your <span>gadget</span>
          </h1>
          <p>
            We make gadget repair simple. Get an upfront quote, expert service,
            and real-time updates for a hassle-free fix
          </p>
        </div>
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
            <div className="form-grid">
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
            <button className="repair-btn-proceed" onClick={onProceed}>
              Proceed
            </button>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default BookRepair;
