"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import "./book.css";
import step1 from "@/assets/images/step1.svg";
import step2 from "@/assets/images/step2.svg";
import step3 from "@/assets/images/step3.svg";
import upload from "@/assets/images/upload.svg";
import phone from "@/assets/images/phone.svg";
import cam from "@/assets/images/cam.svg";
import desk from "@/assets/images/desk.svg";
import laptop from "@/assets/images/laptop.svg";
import Image from "next/image";
import { repairService } from "./../../../../../services/repairs";
import { deviceService } from "../../../../../services/devices";
import { addressService } from "../../../../../services/address";
import { BookRepairModal } from "./BookModal";
import { toast } from "@/components/CustomToast";

const BookRepair = () => {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [devices, setDevices] = useState([]);
  const [issues, setIssues] = useState([]);
  const [addresses, setAddresses] = useState([]);
  const [loadingAddresses, setLoadingAddresses] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Step 1 states
  const [selectedDevice, setSelectedDevice] = useState(null);
  const [selectedIssueCategory, setSelectedIssueCategory] = useState("");
  const [issueDescription, setIssueDescription] = useState("");
  const [uploadedFiles, setUploadedFiles] = useState([]);

  // Step 2 states
  const [selectedAddress, setSelectedAddress] = useState(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [trackingData] = useState({
    trackingNumber: "REP-2026-00123",
    totalTime: "00:40:00",
    repairTime: "00:00:00",
  });

  // Icon mapping for device types
  const getDeviceIcon = (deviceType) => {
    switch (deviceType?.toLowerCase()) {
      case "phone":
        return phone;
      case "laptop":
        return laptop;
      case "camera":
        return cam;
      case "desktop":
        return desk;
      default:
        return phone;
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [devicesRes, issuesRes, addressesRes] = await Promise.all([
          deviceService.getAllUserDevices(),
          repairService.getIssues(),
          addressService.getUserAddresses(),
        ]);

        setDevices(devicesRes.data?.devices || []);
        setIssues(issuesRes.data?.issues || []);
        setAddresses(addressesRes.data?.addresses || []);

        // Auto-select default address if exists
        const defaultAddr = addressesRes.data?.addresses?.find(
          (a) => a.isDefault,
        );
        if (defaultAddr) {
          setSelectedAddress(defaultAddr);
        }
      } catch (err) {
        console.error("Failed to load data:", err);
      } finally {
        setLoadingAddresses(false);
      }
    };

    fetchData();
  }, []);

  const handleFileChange = (files) => {
    const validFiles = Array.from(files).filter((file) => {
      const validTypes = [
        "image/jpeg",
        "image/png",
        "image/jpg",
        "application/pdf",
      ];
      return validTypes.includes(file.type) && file.size <= 10 * 1024 * 1024; // 10MB
    });
    setUploadedFiles((prev) => [...prev, ...validFiles]);
  };

  const nextStep = () => {
    if (step === 1) {
      if (!selectedDevice) {
        toast.error("Please select a device");
        return;
      }
      if (!selectedIssueCategory) {
        toast.error("Please select an issue category");
        return;
      }
      if (!issueDescription.trim()) {
        toast.error("Please describe the fault");
        return;
      }
    }

    if (step === 2) {
      if (!selectedAddress) {
        toast.error("Please select a pickup address");
        return;
      }
    }

    if (step < 3) {
      setStep(step + 1);
    }
  };

  const prevStep = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleGetQuote = async () => {
    setIsSubmitting(true);

    try {
      const formData = new FormData();

      // Append regular fields
      formData.append("deviceId", selectedDevice?._id || selectedDevice?.id);
      formData.append("issueCategory", selectedIssueCategory);
      formData.append("issueDescription", issueDescription.trim());
      formData.append("serviceType", "pickup_repair");
      formData.append(
        "pickupAddressId",
        selectedAddress?._id || selectedAddress?.id,
      );

      // Append uploaded files
      uploadedFiles.forEach((file, index) => {
        console.log(
          `Appending file ${index}:`,
          file.name,
          file.size,
          file.type,
        );
        formData.append("photos", file);
      });

      // Call the booking API
      const response = await repairService.bookRepair(formData);

      // Extract payment link from response
      const paymentLink = response?.paymentLink || response?.data?.paymentLink;

      if (paymentLink) {
        // Redirect to payment page
        window.location.href = paymentLink;
      } else {
        // Fallback: show success modal if no payment required
        setIsModalOpen(true);
        console.log("Booking successful (no payment link):", response);
      }
    } catch (error) {
      console.error("Booking failed:", error);
      toast.error(
        error.response?.data?.message ||
          "Failed to book repair. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <div className="book-page">
        <div className="book-header">
          <h1>Book Repair</h1>
          <p>Fix your gadgets</p>
        </div>

        {/* STEP 1 - Gadget Details */}
        {step === 1 && (
          <div className="repair-form-wrap">
            <div className="repair-head">
              <Image src={step1} alt="step 1" />
              <h2>Gadget Details</h2>
            </div>

            <div className="repair-form">
              {/* Device Selection */}
              <div className="form-wrap">
                <label>Device</label>
                <div className="gadget-options">
                  {devices.length === 0 ? (
                    <p>Loading devices...</p>
                  ) : (
                    devices.map((device) => (
                      <button
                        key={device._id || device.id}
                        type="button"
                        onClick={() => setSelectedDevice(device)}
                        className={`option-btn ${
                          selectedDevice?._id === device._id
                            ? "active-option"
                            : ""
                        }`}
                      >
                        <Image
                          src={getDeviceIcon(device.deviceType)}
                          alt={`${device.brand} ${device.model}`}
                          width={40}
                          height={40}
                        />
                        <span>
                          {device.brand} {device.model}
                          {device.condition && ` (${device.condition})`}
                        </span>
                      </button>
                    ))
                  )}
                </div>
              </div>

              {/* Issue Category */}
              <div className="form-wrap">
                <label>Fault</label>
                <select
                  value={selectedIssueCategory}
                  onChange={(e) => setSelectedIssueCategory(e.target.value)}
                >
                  <option value="">Select issue category</option>
                  {issues.map((issue) => (
                    <option key={issue.category} value={issue.category}>
                      {issue.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Description */}
              <div className="form-wrap">
                <label>Describe Fault</label>
                <textarea
                  value={issueDescription}
                  onChange={(e) => setIssueDescription(e.target.value)}
                  placeholder="Tell us what's wrong with your device so we can get you an accurate quote"
                  rows={4}
                />
              </div>

              {/* File Upload */}
              <div className="form-wrap">
                <label>Supporting Images / Receipt</label>
                <p>
                  <span>Supported formats: JPG, PNG, PDF</span>
                  <span>Max file size 10MB</span>
                </p>
                <div
                  className="upload-image"
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    e.preventDefault();
                    handleFileChange(e.dataTransfer.files);
                  }}
                >
                  <label htmlFor="file-upload" style={{ cursor: "pointer" }}>
                    <div>
                      <Image src={upload} alt="upload" width={40} height={40} />
                      Drag and drop file(s) here, or <br />
                      <span style={{ color: "#007bff" }}>Choose file(s)</span>
                    </div>
                  </label>
                  <input
                    id="file-upload"
                    type="file"
                    accept="image/jpeg,image/png,image/jpg,application/pdf"
                    multiple
                    style={{ display: "none" }}
                    onChange={(e) => handleFileChange(e.target.files)}
                  />
                </div>
                {uploadedFiles.length > 0 && (
                  <div style={{ marginTop: "10px" }} className="upload-texts">
                    <strong>Uploaded files:</strong>
                    <ul>
                      {uploadedFiles.map((file, idx) => (
                        <li key={idx}>{file.name}</li>
                      ))}
                    </ul>
                  </div>
                )}
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

        {/* STEP 2 - Pickup Details */}
        {step === 2 && (
          <div className="repair-form-wrap">
            <div className="repair-head">
              <Image src={step2} alt="step 2" />
              <h2>Pickup Details</h2>
            </div>

            <div className="repair-form">
              {/* Saved Addresses */}
              <div className="form-wrap">
                <label>Pickup Address</label>
                {loadingAddresses ? (
                  <p>Loading addresses...</p>
                ) : addresses.length === 0 ? (
                  <p style={{ color: "#888" }}>
                    No saved addresses found. Please add one in your profile.
                  </p>
                ) : (
                  <div className="gadget-options address-options">
                    {addresses.map((address) => (
                      <button
                        key={address._id}
                        type="button"
                        onClick={() => setSelectedAddress(address)}
                        className={`option-btn address-btn ${
                          selectedAddress?._id === address._id
                            ? "active-option"
                            : ""
                        }`}
                      >
                        <div className="address-info">
                          <strong>
                            {address.label || address.type || "Address"}
                          </strong>
                          <p>{address.streetAddress}</p>
                          <p>
                            {address.city}, {address.state}
                          </p>
                          <small>{address.formattedAddress}</small>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Selected Address Summary */}
              {/* {selectedAddress && (
                <div
                  className="selected-address-summary"
                  style={{
                    margin: "16px 0",
                    padding: "12px",
                    background: "#f8f9fa",
                    borderRadius: "8px",
                    border: "1px solid #ddd",
                  }}
                >
                  <strong>
                    Selected: {selectedAddress.label || selectedAddress.type}
                  </strong>
                  <p style={{ margin: "4px 0" }}>
                    {selectedAddress.streetAddress}, {selectedAddress.city},{" "}
                    {selectedAddress.state}
                  </p>
                  <small>{selectedAddress.formattedAddress}</small>
                </div>
              )} */}
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

        {/* STEP 3 - Summary */}
        {step === 3 && (
          <div className="repair-form-wrap">
            <div className="repair-head">
              <Image src={step3} alt="step 3" />
              <h2>Summary</h2>
            </div>

            <div className="repair-summary">
              <div className="repair-details">
                {selectedDevice && (
                  <div className="brand-model">
                    <Image
                      src={getDeviceIcon(selectedDevice.deviceType)}
                      alt="device"
                      width={60}
                      height={60}
                    />
                    <div>
                      <h3>{selectedDevice.brand}</h3>
                      <p>
                        {selectedDevice.model} (
                        {selectedDevice.condition || "N/A"})
                      </p>
                    </div>
                  </div>
                )}

                <div className="device-details">
                  <div>
                    <h3>Issue</h3>
                    <p>
                      {issues.find((i) => i.category === selectedIssueCategory)
                        ?.label || selectedIssueCategory}
                    </p>
                  </div>
                  <div>
                    <h3>Issue Description</h3>
                    <p>{issueDescription || "Not provided"}</p>
                  </div>
                  <div>
                    <h3>Pickup Address</h3>
                    {selectedAddress ? (
                      <>
                        <strong>
                          {selectedAddress.label || selectedAddress.type}
                        </strong>
                        <br />
                        {selectedAddress.streetAddress}, {selectedAddress.city},{" "}
                        {selectedAddress.state}
                        <br />
                        <small>{selectedAddress.formattedAddress}</small>
                      </>
                    ) : (
                      "Not selected"
                    )}
                  </div>
                </div>
              </div>

              <div className="agree">
                <input type="checkbox" id="agree" />
                <label htmlFor="agree">
                  I agree to the <span>contract details</span> &{" "}
                  <span>terms of use</span>
                </label>
              </div>
            </div>

            <div className="repair-btn">
              <button className="repair-btn-back" onClick={prevStep}>
                Back
              </button>
              <button
                className="repair-btn-proceed"
                onClick={handleGetQuote}
                disabled={isSubmitting}
              >
                {isSubmitting ? "Processing..." : "Get my quote"}
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
        trackingNumber={trackingData.trackingNumber}
      />
    </>
  );
};

export default BookRepair;
