"use client";
import React from "react";
import "../book.css";
import step2 from "@/assets/images/step2.svg";
import Image from "next/image";
import { useRouter } from "next/navigation";

import pickup from "@/assets/images/pickupg.svg";
import upload from "@/assets/images/upload.svg";

const Step2 = () => {
  const router = useRouter();

  const onProceed = () => {
    router.push("/dashboard/book-repair/step3");
  };
  const onBack = () => {
    router.back();
  };

  return (
    <>
      <div className="book-page">
        <div className="book-header">
          <h1>Book Repair</h1>
          <p>Fix your gadgets</p>
        </div>
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
              <input type="text" placeholder="Street" className="form-street" />
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
            <button className="repair-btn-back" onClick={onBack}>
              Back
            </button>
            <button className="repair-btn-proceed" onClick={onProceed}>
              Proceed
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Step2;
