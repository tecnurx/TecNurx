"use client";

import React, { useState, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Camera, Upload, Info } from "lucide-react";
import "../../insurance-flow.css";
import { toast } from "@/components/CustomToast";

const CLAIM_TYPES = [
  "Accidental damage",
  "Theft",
  "Loss",
  "Liquid damage",
];

export default function StartClaimPage() {
  const router = useRouter();
  const [step, setStep] = useState(1); // 1: Incident, 2: Evidence, 3: Review

  // Step 1
  const [claimType, setClaimType] = useState("Accidental damage");
  const [incidentDate, setIncidentDate] = useState("");
  const [description, setDescription] = useState("");

  // Step 2
  const [photos, setPhotos] = useState([null, null, null, null]);
  const [ownershipFile, setOwnershipFile] = useState(null);
  const [policeReportFile, setPoliceReportFile] = useState(null);
  const photoInputRefs = [useRef(null), useRef(null), useRef(null), useRef(null)];
  const ownershipRef = useRef(null);
  const policeRef = useRef(null);

  // Step 3
  const [confirmedTruth, setConfirmedTruth] = useState(false);

  const stepHeaders = {
    1: "Step 1 of 3: tell us what happened.",
    2: "Step 2 of 3: add your evidence.",
    3: "Step 3 of 3: check everything, then submit.",
  };

  const handlePhotoChange = (index, file) => {
    if (!file) return;
    const previewUrl = URL.createObjectURL(file);
    setPhotos((prev) => {
      const next = [...prev];
      next[index] = { name: file.name, url: previewUrl };
      return next;
    });
  };

  const uploadedPhotoCount = photos.filter(Boolean).length;
  const requiresPoliceReport = claimType === "Theft" || claimType === "Loss";

  const handleStep1Continue = () => {
    if (!incidentDate.trim() || !description.trim()) {
      toast.error("Please enter the incident date and describe what happened.");
      return;
    }
    setStep(2);
  };

  const handleSubmitClaim = () => {
    if (!confirmedTruth) {
      toast.error("Please confirm the information is true and complete.");
      return;
    }
    if (typeof window !== "undefined") {
      sessionStorage.setItem(
        "pending_insurance_claim",
        JSON.stringify({
          claimId: "CLM-0244",
          device: "iPhone 13 Pro",
          type: claimType,
          incidentDate,
        })
      );
    }
    router.push("/dashboard/insurance/claims/submitted");
  };

  return (
    <div className="ins-page">
      {/* Header */}
      <div className="ins-header">
        <div>
          <h1 className="ins-title">Start a claim</h1>
          <p className="ins-subtitle">{stepHeaders[step]}</p>
        </div>
      </div>

      {/* 3-Step Progress Bar */}
      <div className="ins-steps-bar">
        {[
          { num: 1, label: "1 Incident" },
          { num: 2, label: "2 Evidence" },
          { num: 3, label: "3 Review" },
        ].map((s) => (
          <div
            key={s.num}
            className={`ins-step-item ${
              step === s.num ? "active" : step > s.num ? "done" : ""
            }`}
          >
            {s.label}
          </div>
        ))}
      </div>

      {/* STEP 1: INCIDENT */}
      {step === 1 && (
        <div className="ins-two-col">
          <div className="ins-card">
            <div>
              <div className="ins-kv-row">
                <span className="ins-kv-label">Policy</span>
                <span className="ins-kv-val">Plus · #POL-1029</span>
              </div>
              <div className="ins-kv-row">
                <span className="ins-kv-label">Device</span>
                <span className="ins-kv-val">iPhone 13 Pro · IMEI •••• 4821</span>
              </div>
            </div>

            <div className="ins-field">
              <label>What happened?</label>
              <div className="ins-toggle-row">
                {CLAIM_TYPES.map((type) => (
                  <button
                    key={type}
                    type="button"
                    className={`ins-toggle-pill ${
                      claimType === type ? "active" : ""
                    }`}
                    onClick={() => setClaimType(type)}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            <div className="ins-field">
              <label htmlFor="claim-date">Date of the incident</label>
              <input
                id="claim-date"
                type="date"
                className="ins-input"
                value={incidentDate}
                onChange={(e) => setIncidentDate(e.target.value)}
              />
            </div>

            <div className="ins-field">
              <label htmlFor="claim-desc">Describe what happened</label>
              <textarea
                id="claim-desc"
                rows={4}
                className="ins-input"
                style={{ minHeight: "110px", resize: "vertical" }}
                placeholder="Where, when and how did it happen?"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            <div className="ins-actions-row">
              <Link
                href="/dashboard/insurance?state=normal"
                className="ins-btn-outline"
              >
                Cancel
              </Link>
              <button
                type="button"
                className="ins-btn-primary"
                onClick={handleStep1Continue}
              >
                Continue
              </button>
            </div>
          </div>

          <div className="ins-card">
            <h2 className="ins-card-title">Before you start</h2>
            <div className="ins-info-box">
              <Info size={18} style={{ flexShrink: 0, marginTop: "2px" }} />
              <span>
                Your policy number and device details are filled in for you.
              </span>
            </div>
            <ul className="ins-benefits-list">
              <li>Have photos of the damage ready</li>
              <li>Proof of ownership or police report if required</li>
            </ul>
          </div>
        </div>
      )}

      {/* STEP 2: EVIDENCE */}
      {step === 2 && (
        <div className="ins-two-col">
          <div className="ins-card">
            <div className="ins-field">
              <label>Photos of the damage</label>
              <div className="ins-photo-grid">
                {photos.map((photo, idx) => (
                  <div
                    key={idx}
                    className="ins-photo-slot"
                    onClick={() => photoInputRefs[idx].current?.click()}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        photoInputRefs[idx].current?.click();
                      }
                    }}
                  >
                    <input
                      ref={photoInputRefs[idx]}
                      type="file"
                      accept="image/*"
                      style={{ display: "none" }}
                      onChange={(e) =>
                        handlePhotoChange(idx, e.target.files?.[0])
                      }
                    />
                    {photo ? (
                      <img src={photo.url} alt={`Damage ${idx + 1}`} />
                    ) : (
                      <>
                        <Camera size={22} />
                        <span>Photo {idx + 1}</span>
                      </>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="ins-field">
              <label>Proof of ownership (if required)</label>
              <div
                className="ins-dropzone"
                onClick={() => ownershipRef.current?.click()}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    ownershipRef.current?.click();
                  }
                }}
              >
                <input
                  ref={ownershipRef}
                  type="file"
                  accept="image/*,.pdf"
                  style={{ display: "none" }}
                  onChange={(e) =>
                    setOwnershipFile(e.target.files?.[0] || null)
                  }
                />
                <Upload size={24} />
                <span>
                  {ownershipFile
                    ? ownershipFile.name
                    : "Upload a receipt or invoice"}
                </span>
              </div>
            </div>

            {requiresPoliceReport && (
              <div className="ins-police-box">
                <label
                  style={{
                    fontSize: "14px",
                    fontWeight: 700,
                    color: "#080808",
                  }}
                >
                  Police report
                </label>
                <p className="ins-radio-sub">
                  Required for {claimType.toLowerCase()} claims by the insurer.
                </p>
                <div
                  className="ins-dropzone"
                  onClick={() => policeRef.current?.click()}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      policeRef.current?.click();
                    }
                  }}
                >
                  <input
                    ref={policeRef}
                    type="file"
                    accept="image/*,.pdf"
                    style={{ display: "none" }}
                    onChange={(e) =>
                      setPoliceReportFile(e.target.files?.[0] || null)
                    }
                  />
                  <Upload size={24} />
                  <span>
                    {policeReportFile
                      ? policeReportFile.name
                      : "Upload your police report"}
                  </span>
                </div>
              </div>
            )}

            <div className="ins-actions-row">
              <button
                type="button"
                className="ins-btn-outline"
                onClick={() => setStep(1)}
              >
                Back
              </button>
              <button
                type="button"
                className="ins-btn-primary"
                onClick={() => setStep(3)}
              >
                Continue
              </button>
            </div>
          </div>

          <div className="ins-card">
            <h2 className="ins-card-title">What counts as evidence</h2>
            <ul className="ins-benefits-list">
              <li>Clear, well-lit photos showing the damaged area</li>
              <li>Device IMEI or serial number visible where possible</li>
              <li>Purchase receipt or invoice matching the policyholder</li>
              {requiresPoliceReport && (
                <li>Official police extract for theft or loss claims</li>
              )}
            </ul>
          </div>
        </div>
      )}

      {/* STEP 3: REVIEW */}
      {step === 3 && (
        <div className="ins-two-col">
          <div className="ins-card">
            <h2 className="ins-card-title">Your claim</h2>

            <div>
              <div className="ins-kv-row">
                <span className="ins-kv-label">Policy</span>
                <span className="ins-kv-val">Plus · #POL-1029</span>
              </div>
              <div className="ins-kv-row">
                <span className="ins-kv-label">Device</span>
                <span className="ins-kv-val">iPhone 13 Pro</span>
              </div>
              <div className="ins-kv-row">
                <span className="ins-kv-label">Type</span>
                <span className="ins-kv-val">{claimType}</span>
              </div>
              <div className="ins-kv-row">
                <span className="ins-kv-label">Incident date</span>
                <span className="ins-kv-val">{incidentDate || "—"}</span>
              </div>
              <div className="ins-kv-row">
                <span className="ins-kv-label">Description</span>
                <span className="ins-kv-val" style={{ maxWidth: "60%" }}>
                  {description || "—"}
                </span>
              </div>

              <div className="ins-kv-row">
                <div>
                  <div className="ins-kv-val" style={{ textAlign: "left" }}>
                    Photos
                  </div>
                  <div className="ins-kv-label" style={{ fontSize: "13px" }}>
                    {uploadedPhotoCount} uploaded
                  </div>
                </div>
                <span
                  className={`ins-pill ${
                    uploadedPhotoCount > 0 ? "ins-pill-green" : "ins-pill-grey"
                  }`}
                >
                  <span className="ins-pill-dot" />
                  <span>{uploadedPhotoCount > 0 ? "Done" : "Optional"}</span>
                </span>
              </div>

              <div className="ins-kv-row">
                <div>
                  <div className="ins-kv-val" style={{ textAlign: "left" }}>
                    Proof of ownership
                  </div>
                  <div className="ins-kv-label" style={{ fontSize: "13px" }}>
                    {ownershipFile ? "1 file" : "None uploaded"}
                  </div>
                </div>
                <span
                  className={`ins-pill ${
                    ownershipFile ? "ins-pill-green" : "ins-pill-grey"
                  }`}
                >
                  <span className="ins-pill-dot" />
                  <span>{ownershipFile ? "Done" : "Optional"}</span>
                </span>
              </div>
            </div>

            <label className="ins-checkbox-row">
              <input
                type="checkbox"
                checked={confirmedTruth}
                onChange={(e) => setConfirmedTruth(e.target.checked)}
              />
              <span>I confirm the information is true and complete.</span>
            </label>

            <div className="ins-actions-row">
              <button
                type="button"
                className="ins-btn-outline"
                onClick={() => setStep(2)}
              >
                Back
              </button>
              <button
                type="button"
                className="ins-btn-primary"
                onClick={handleSubmitClaim}
              >
                Submit claim
              </button>
            </div>
          </div>

          <div className="ins-card">
            <h2 className="ins-card-title">What happens next</h2>

            <div>
              <div className="ins-step-row">
                <div className="ins-step-badge">1</div>
                <div>
                  <p className="ins-radio-title">Documentation review</p>
                  <p className="ins-radio-sub">
                    The insurer checks your documents.
                  </p>
                </div>
              </div>

              <div className="ins-step-row">
                <div className="ins-step-badge">2</div>
                <div>
                  <p className="ins-radio-title">Assessment</p>
                  <p className="ins-radio-sub">They assess the claim.</p>
                </div>
              </div>

              <div className="ins-step-row">
                <div className="ins-step-badge">3</div>
                <div>
                  <p className="ins-radio-title">Outcome</p>
                  <p className="ins-radio-sub">
                    Approved, declined or more information needed.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
