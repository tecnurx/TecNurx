"use client";
import React, { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
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
import Link from "next/link";
import { AlertCircle, Upload, X } from "lucide-react";

// Fallback issue categories if backend API is offline or returns empty
const DEFAULT_ISSUES = [
  { category: "screen_repair", label: "Screen Replacement / Repair" },
  { category: "battery_replacement", label: "Battery Replacement" },
  { category: "charging_port", label: "Charging Port Repair" },
  { category: "back_glass", label: "Back Glass / Rear Housing" },
  { category: "camera_repair", label: "Camera Repair" },
  { category: "water_damage", label: "Liquid / Water Damage" },
  { category: "diagnostic_assessment", label: "Diagnostic Assessment / Inspection" },
  { category: "other", label: "Other Issue" },
];

// Helper to infer brand, model, and deviceType from device name
const inferDeviceDetails = (deviceName = "") => {
  const name = (deviceName || "").trim();
  const lower = name.toLowerCase();

  let brand = "Other";
  let deviceType = "phone";

  if (/iphone|ipad|macbook|apple|imac|watch/i.test(lower)) {
    brand = "Apple";
    if (/macbook|imac/i.test(lower)) deviceType = "laptop";
    else if (/ipad/i.test(lower)) deviceType = "phone";
  } else if (/samsung|galaxy/i.test(lower)) {
    brand = "Samsung";
    deviceType = "phone";
  } else if (/google|pixel/i.test(lower)) {
    brand = "Google";
    deviceType = "phone";
  } else if (/redmi|xiaomi/i.test(lower)) {
    brand = "Redmi";
    deviceType = "phone";
  } else if (/tecno/i.test(lower)) {
    brand = "Tecno";
    deviceType = "phone";
  } else if (/infinix/i.test(lower)) {
    brand = "Infinix";
    deviceType = "phone";
  } else if (/oneplus/i.test(lower)) {
    brand = "OnePlus";
    deviceType = "phone";
  } else if (/oppo/i.test(lower)) {
    brand = "Oppo";
    deviceType = "phone";
  } else if (/vivo/i.test(lower)) {
    brand = "Vivo";
    deviceType = "phone";
  } else if (/hp|dell|lenovo|thinkpad|asus|acer/i.test(lower)) {
    if (/hp/i.test(lower)) brand = "HP";
    else if (/dell/i.test(lower)) brand = "Dell";
    else if (/lenovo|thinkpad/i.test(lower)) brand = "Lenovo";
    else if (/asus/i.test(lower)) brand = "Asus";
    else if (/acer/i.test(lower)) brand = "Acer";
    deviceType = "laptop";
  } else if (/camera|canon|nikon|sony/i.test(lower)) {
    brand = /canon/i.test(lower) ? "Canon" : /nikon/i.test(lower) ? "Nikon" : "Sony";
    deviceType = "camera";
  } else {
    const parts = name.split(" ");
    if (parts.length > 1) {
      brand = parts[0];
    }
  }

  let cleanModel = name;
  if (name.toLowerCase().startsWith(brand.toLowerCase() + " ")) {
    cleanModel = name.slice(brand.length).trim();
  }

  return { brand, model: cleanModel || name, deviceType };
};

// Helper to map incoming issue string to available issue categories
const mapIssueCategory = (issueParam, list) => {
  if (!issueParam || !list?.length) return list?.[0]?.category || "";
  const norm = issueParam.toLowerCase().replace(/[-_]/g, "");

  const found = list.find((item) => {
    const cat = (item.category || "").toLowerCase().replace(/[-_]/g, "");
    const lbl = (item.label || "").toLowerCase().replace(/[-_]/g, "");
    if (norm === "screen" && (cat.includes("screen") || lbl.includes("screen"))) return true;
    if (norm === "battery" && (cat.includes("battery") || lbl.includes("battery"))) return true;
    if (norm === "charging" && (cat.includes("charg") || cat.includes("port") || lbl.includes("charg"))) return true;
    if (norm === "backglass" && (cat.includes("back") || cat.includes("glass") || lbl.includes("back"))) return true;
    if (norm === "camera" && (cat.includes("camera") || lbl.includes("camera"))) return true;
    if (norm === "water" && (cat.includes("water") || cat.includes("liquid") || lbl.includes("water"))) return true;
    if ((norm === "notsure" || norm === "diagnostic") && (cat.includes("diag") || lbl.includes("diag") || cat.includes("inspect"))) return true;
    return cat.includes(norm) || norm.includes(cat) || lbl.includes(norm);
  });

  if (found) return found.category;
  if (norm === "notsure" || norm === "diagnostic") {
    const diag = list.find((i) => /diag|inspect/i.test((i.category || "") + (i.label || "")));
    if (diag) return diag.category;
  }
  return list[0]?.category || issueParam;
};

const BookRepair = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

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
  const [loading, setLoading] = useState(true);
  const [loadingDevices, setLoadingDevices] = useState(false);

  // Add device modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    deviceType: "phone",
    brand: "",
    model: "",
    serialNumber: "",
    purchaseDate: "",
    condition: "good",
    notes: "",
  });
  const [photos, setPhotos] = useState([]);
  const [receipt, setReceipt] = useState(null);
  const [submitError, setSubmitError] = useState("");
  const [submitSuccess, setSubmitSuccess] = useState(false);

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
        const [devicesRes, issuesRes, addressesRes] = await Promise.allSettled([
          deviceService.getAllUserDevices(),
          repairService.getIssues(),
          addressService.getUserAddresses(),
        ]);

        let devList = [];
        if (devicesRes.status === "fulfilled") {
          devList =
            devicesRes.value?.data?.devices || devicesRes.value?.devices || [];
        }

        let issueList = [];
        if (issuesRes.status === "fulfilled") {
          issueList =
            issuesRes.value?.data?.issues || issuesRes.value?.issues || [];
        }
        if (!issueList.length) {
          issueList = DEFAULT_ISSUES;
        }
        setIssues(issueList);

        if (addressesRes.status === "fulfilled") {
          const addrList =
            addressesRes.value?.data?.addresses ||
            addressesRes.value?.addresses ||
            [];
          setAddresses(addrList);

          // Auto-select default address if exists
          const defaultAddr = addrList.find((a) => a.isDefault);
          if (defaultAddr) {
            setSelectedAddress(defaultAddr);
          }
        }

        // Read query parameters & localStorage
        const deviceParam = searchParams.get("device") || "";
        const customModelParam = searchParams.get("customModel") || "";
        const issueParam = searchParams.get("issue") || "";
        const qualityParam = searchParams.get("quality") || "";
        const typeParam = searchParams.get("type") || "";
        const categoryParam = searchParams.get("category") || "";
        const payOverTimeParam = searchParams.get("payOverTime") || "";

        let pendingEstimate = null;
        if (typeof window !== "undefined") {
          try {
            const raw = localStorage.getItem("pendingRepairEstimate");
            if (raw) pendingEstimate = JSON.parse(raw);
          } catch (e) {
            // ignore
          }
        }

        const effectiveDeviceName =
          customModelParam || deviceParam || pendingEstimate?.device || "";
        const effectiveIssue =
          issueParam || pendingEstimate?.problem || (typeParam === "diagnostic" ? "diagnostic" : "");
        const effectiveQuality =
          qualityParam || pendingEstimate?.quality || "";
        const effectivePayOverTime =
          payOverTimeParam || pendingEstimate?.payOverTime || "";

        if (effectiveIssue) {
          const mappedCat = mapIssueCategory(effectiveIssue, issueList);
          setSelectedIssueCategory(mappedCat);
        } else if (issueList.length > 0) {
          setSelectedIssueCategory(issueList[0].category);
        }

        // Pre-fill fault description if coming from estimate
        if (effectiveDeviceName || effectiveIssue || effectiveQuality) {
          if (
            typeParam === "diagnostic" ||
            effectiveIssue === "not_sure" ||
            effectiveIssue === "diagnostic"
          ) {
            let desc = "Diagnostic assessment requested for device.";
            if (categoryParam) desc += ` [Category: ${categoryParam.replace(/_/g, " ")}]`;
            if (effectiveDeviceName) desc += ` [Device: ${effectiveDeviceName}]`;
            setIssueDescription(desc);
          } else {
            const issueLabel = effectiveIssue
              ? effectiveIssue.replace(/_/g, " ")
              : "repair";
            let desc = `Online estimate request for ${issueLabel}.`;
            if (effectiveQuality) {
              desc += ` Requested part quality: ${effectiveQuality.toUpperCase()}.`;
            }
            if (effectivePayOverTime) {
              desc += ` Selected Pay Over Time (${effectivePayOverTime} months financing).`;
            }
            setIssueDescription(desc);
          }
        }

        // Match device or create temporary device for the form
        if (effectiveDeviceName) {
          const targetLower = effectiveDeviceName.toLowerCase();
          const existingDevice = devList.find((d) => {
            const full = `${d.brand || ""} ${d.model || ""}`.toLowerCase();
            return (
              full.includes(targetLower) ||
              targetLower.includes(full) ||
              (d.model && targetLower.includes(d.model.toLowerCase()))
            );
          });

          if (existingDevice) {
            setSelectedDevice(existingDevice);
            setDevices(devList);
          } else {
            // Create a temporary device for this booking form
            const { brand, model, deviceType } = inferDeviceDetails(effectiveDeviceName);
            const tempId = `temp_${Date.now()}`;
            const tempDevice = {
              _id: tempId,
              id: tempId,
              brand,
              model,
              deviceType,
              condition: "good",
              purchaseDate: new Date().toISOString().split("T")[0],
              serialNumber: `TEMP-${Date.now().toString(36).toUpperCase()}`,
              isTemporary: true,
            };
            const mergedList = [tempDevice, ...devList];
            setDevices(mergedList);
            setSelectedDevice(tempDevice);
          }
        } else {
          setDevices(devList);
          if (devList.length > 0) {
            setSelectedDevice(devList[0]);
          }
        }
      } catch (err) {
        console.error("Failed to load data:", err);
      } finally {
        setLoading(false);
        setLoadingAddresses(false);
      }
    };

    fetchData();
  }, [searchParams]);

  const refetchDevices = async () => {
    try {
      setLoadingDevices(true);
      const res = await deviceService.getAllUserDevices();
      setDevices(res?.data?.devices || []);

      // Auto-select the newest device
      if (res?.data?.devices?.length > 0) {
        setSelectedDevice(res.data.devices[res.data.devices.length - 1]);
      }
    } catch (err) {
      console.error("Failed to refetch devices:", err);
      toast.error("Failed to refresh device list");
    } finally {
      setLoadingDevices(false);
    }
  };

  const handleFileChange = (files) => {
    const validFiles = Array.from(files).filter((file) => {
      const validTypes = [
        "image/jpeg",
        "image/png",
        "image/jpg",
        "application/pdf",
      ];
      return validTypes.includes(file.type) && file.size <= 10 * 1024 * 1024;
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
      let persistentDeviceId = selectedDevice?._id || selectedDevice?.id;

      // If device was created temporarily from quote parameters, auto-register it in database first
      if (selectedDevice?.isTemporary) {
        const tempPayload = new FormData();
        tempPayload.append("deviceType", selectedDevice.deviceType || "phone");
        tempPayload.append("brand", selectedDevice.brand || "Other");
        tempPayload.append("model", selectedDevice.model || "Unknown");
        tempPayload.append(
          "serialNumber",
          selectedDevice.serialNumber ||
            `TEMP-${Date.now().toString(36).toUpperCase()}`
        );
        tempPayload.append(
          "purchaseDate",
          selectedDevice.purchaseDate || new Date().toISOString().split("T")[0]
        );
        tempPayload.append("condition", selectedDevice.condition || "good");
        tempPayload.append("notes", "Auto-created from repair quote estimator");

        const addRes = await deviceService.addDevice(tempPayload);
        const created =
          addRes?.data?.device ||
          addRes?.device ||
          addRes?.data?.newDevice ||
          addRes?.data;
        const newId = created?._id || created?.id || addRes?._id || addRes?.id;

        if (!newId || `${newId}`.startsWith("temp_")) {
          throw new Error(
            addRes?.message ||
              "Failed to register device in database before booking."
          );
        }

        persistentDeviceId = newId;
        setSelectedDevice((prev) => ({
          ...prev,
          _id: newId,
          id: newId,
          isTemporary: false,
        }));
      }

      const formData = new FormData();
      formData.append("deviceId", persistentDeviceId);
      formData.append("issueCategory", selectedIssueCategory);
      formData.append("issueDescription", issueDescription.trim());
      formData.append("serviceType", "pickup_repair");
      formData.append(
        "pickupAddressId",
        selectedAddress?._id || selectedAddress?.id
      );

      // Append uploaded files
      uploadedFiles.forEach((file) => {
        formData.append("photos", file);
      });

      // Call the booking API
      const response = await repairService.bookRepair(formData);

      // Clean up stored pending estimate
      if (typeof window !== "undefined") {
        try {
          localStorage.removeItem("pendingRepairEstimate");
        } catch (e) {
          // ignore
        }
      }

      // Extract payment link from response
      const paymentLink = response?.paymentLink || response?.data?.paymentLink;

      if (paymentLink) {
        window.location.href = paymentLink;
      } else {
        setIsModalOpen(true);
      }
    } catch (error) {
      console.error("Booking failed:", error);
      toast.error(
        error.response?.data?.message ||
          error.message ||
          "Failed to book repair. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Add Device Modal Submission
  const handleSubmitDevice = async (e) => {
    e.preventDefault();
    setSubmitError("");
    setIsSubmitting(true);

    if (!formData.brand || !formData.model || !formData.serialNumber) {
      setSubmitError("Please fill in all required fields");
      setIsSubmitting(false);
      return;
    }

    try {
      const payload = new FormData();
      payload.append("deviceType", formData.deviceType);
      payload.append("brand", formData.brand);
      payload.append("model", formData.model);
      payload.append("serialNumber", formData.serialNumber);
      payload.append("purchaseDate", formData.purchaseDate);
      payload.append("condition", formData.condition);
      if (formData.notes) payload.append("notes", formData.notes);

      photos.forEach((photo) => payload.append("photos", photo));
      if (receipt) payload.append("purchaseReceipt", receipt);

      await deviceService.addDevice(payload);
      toast.success("Device added successfully!");

      setIsAddModalOpen(false);
      await refetchDevices();

      // Reset form
      setFormData({
        deviceType: "phone",
        brand: "",
        model: "",
        serialNumber: "",
        purchaseDate: "",
        condition: "good",
        notes: "",
      });
      setPhotos([]);
      setReceipt(null);
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to add device";
      setSubmitError(msg);
      toast.error(msg);
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
                    <div className="no-added-devices">
                      <p>No Device found, Kindly add a device to continue...</p>
                      <button
                        type="button"
                        onClick={() => {
                          setIsAddModalOpen(true);
                        }}
                      >
                        Add Device
                      </button>
                    </div>
                  ) : (
                    <>
                      {devices.map((device) => {
                        const isSelected =
                          selectedDevice &&
                          ((device._id && selectedDevice._id === device._id) ||
                            (device.id && selectedDevice.id === device.id) ||
                            selectedDevice === device);
                        return (
                          <button
                            key={device._id || device.id || `${device.brand}-${device.model}`}
                            type="button"
                            onClick={() => setSelectedDevice(device)}
                            className={`option-btn ${
                              isSelected ? "active-option" : ""
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
                              {device.isTemporary
                                ? " (From Quote)"
                                : device.condition
                                ? ` (${device.condition})`
                                : ""}
                            </span>
                          </button>
                        );
                      })}
                      <button
                        type="button"
                        onClick={() => setIsAddModalOpen(true)}
                        className="option-btn"
                        style={{
                          border: "2px dashed #d1d5db",
                          background: "#fafafa",
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: "4px",
                          color: "#4b5563",
                          cursor: "pointer",
                        }}
                      >
                        <span style={{ fontSize: "20px", fontWeight: "bold", lineHeight: "1" }}>+</span>
                        <span style={{ fontSize: "13px" }}>Add Device</span>
                      </button>
                    </>
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
              <button
                type="button"
                className="repair-btn-back"
                onClick={() => router.push("/dashboard")}
              >
                Cancel
              </button>
              <button type="button" className="repair-btn-proceed" onClick={nextStep}>
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
                  <div className="no-added-devices">
                    <p style={{ color: "#888" }}>
                      No saved addresses found. Please add one in your profile.
                    </p>
                    <Link href="/dashboard/my-account">Add Address.</Link>
                  </div>
                ) : (
                  <div className="gadget-options address-options">
                    {addresses.map((address) => (
                      <button
                        key={address._id || address.id}
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
            </div>

            <div className="repair-btn">
              <button type="button" className="repair-btn-back" onClick={prevStep}>
                Back
              </button>
              <button type="button" className="repair-btn-proceed" onClick={nextStep}>
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
              <div className="repair-detailss">
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
                        {selectedDevice.isTemporary
                          ? "From Online Quote"
                          : selectedDevice.condition || "N/A"}
                        )
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
              <button type="button" className="repair-btn-back" onClick={prevStep}>
                Back
              </button>
              <button
                type="button"
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

      {isAddModalOpen && (
        <div className="modal-overlay" onClick={() => setIsAddModalOpen(false)}>
          <div
            className="modal-content add-device-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="modal-close"
              onClick={() => setIsAddModalOpen(false)}
            >
              <X size={24} color="black" />
            </button>
            <div className="modal-header modal-head2">
              <h2>Add New Device</h2>
              <p>Register your device for repairs & insurance</p>
            </div>

            {submitError && (
              <div className="error-message">
                <AlertCircle size={18} />
                <span>{submitError}</span>
              </div>
            )}

            <form onSubmit={handleSubmitDevice} className="device-modal-form">
              <div className="form-grid">
                <div className="form-grouup">
                  <label>Device Type *</label>
                  <select
                    value={formData.deviceType}
                    onChange={(e) =>
                      setFormData({ ...formData, deviceType: e.target.value })
                    }
                    required
                  >
                    <option value="phone">Phone</option>
                    <option value="laptop">Laptop</option>
                    <option value="camera">Camera</option>
                    <option value="desktop">Desktop</option>
                  </select>
                </div>

                <div className="form-grouup">
                  <label>Brand *</label>
                  <input
                    type="text"
                    placeholder="e.g. Apple, Samsung"
                    value={formData.brand}
                    onChange={(e) =>
                      setFormData({ ...formData, brand: e.target.value })
                    }
                    required
                  />
                </div>

                <div className="form-grouup">
                  <label>Model *</label>
                  <input
                    type="text"
                    placeholder="e.g. iPhone 13 Pro"
                    value={formData.model}
                    onChange={(e) =>
                      setFormData({ ...formData, model: e.target.value })
                    }
                    required
                  />
                </div>

                <div className="form-grouup">
                  <label>Serial Number / IMEI *</label>
                  <input
                    type="text"
                    placeholder="Serial or IMEI"
                    value={formData.serialNumber}
                    onChange={(e) =>
                      setFormData({ ...formData, serialNumber: e.target.value })
                    }
                    required
                  />
                </div>

                <div className="form-grouup">
                  <label>Purchase Date</label>
                  <input
                    type="date"
                    value={formData.purchaseDate}
                    onChange={(e) =>
                      setFormData({ ...formData, purchaseDate: e.target.value })
                    }
                  />
                </div>

                <div className="form-grouup">
                  <label>Condition</label>
                  <select
                    value={formData.condition}
                    onChange={(e) =>
                      setFormData({ ...formData, condition: e.target.value })
                    }
                  >
                    <option value="brand_new">Brand New</option>
                    <option value="good">Good</option>
                    <option value="fair">Fair</option>
                    <option value="poor">Poor</option>
                  </select>
                </div>

                <div className="form-grouup full">
                  <label>Device Photos (Optional)</label>
                  <label className="upload-box">
                    <Upload size={20} />
                    <span>Upload photos (max 5)</span>
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={(e) => {
                        const newFiles = Array.from(e.target.files);
                        setPhotos((prev) => [...prev, ...newFiles].slice(0, 5));
                      }}
                      style={{ display: "none" }}
                    />
                  </label>
                  {photos.length > 0 && (
                    <div className="selected-files">
                      {photos.map((f, i) => (
                        <span key={i} className="file-tag">
                          {f.name}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="form-grouup full">
                  <label>Purchase Receipt (Optional)</label>
                  <label className="upload-box">
                    <Upload size={20} />
                    <span>{receipt ? receipt.name : "Upload receipt"}</span>
                    <input
                      type="file"
                      accept="image/*,.pdf"
                      onChange={(e) => setReceipt(e.target.files[0])}
                      style={{ display: "none" }}
                    />
                  </label>
                </div>

                <div className="form-grouup full">
                  <label>Notes (Optional)</label>
                  <textarea
                    rows={3}
                    placeholder="Any additional info..."
                    value={formData.notes}
                    onChange={(e) =>
                      setFormData({ ...formData, notes: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  className="action-btn secondary"
                  onClick={() => setIsAddModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="action-btn primary"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Saving..." : "Add Device"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

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

export default function BookRepairPage() {
  return (
    <Suspense
      fallback={
        <div className="book-page">
          <div className="book-header">
            <h1>Book Repair</h1>
            <p>Loading details...</p>
          </div>
        </div>
      }
    >
      <BookRepair />
    </Suspense>
  );
}
