"use client";
import React, { useState } from "react";
import "../book.css";
import step3 from "@/assets/images/step3.svg";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { BookRepairModal } from "./BookModal";
import Footer from "@/components/footer/Footer";

//for user selection
import phone from "@/assets/images/phone.svg";
import cam from "@/assets/images/cam.svg";
import desk from "@/assets/images/desk.svg";
import laptop from "@/assets/images/laptop.svg";
import { Icon } from "lucide-react";

const Step3 = () => {
  const router = useRouter();

  const onProceed = () => {
    router.push("/dashboard/book-repair");
  };
  const onBack = () => {
    router.back();
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

  return (
    <>
      <div className="book-page">
        <div className="book-header">
          <h1>Book Repair</h1>
          <p>Fix your gadgets</p>
        </div>
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
            <button className="repair-btn-back" onClick={onBack}>
              Back
            </button>
            <button className="repair-btn-proceed" onClick={GetMyQuote}>
              Get my quote
            </button>
          </div>
        </div>

        <BookRepairModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          totalTime={trackingData.totalTime}
          repairTime={trackingData.repairTime}
        />
      </div>
    </>
  );
};

export default Step3;
