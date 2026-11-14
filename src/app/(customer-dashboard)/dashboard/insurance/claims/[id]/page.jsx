"use client";

import React, { use, useState, useRef } from "react";
import "./claim-tracker.css";
import Link from "next/link";
import { Upload, FileText, X, Check, ArrowLeft } from "lucide-react";
import { toast } from "@/components/CustomToast";

export default function ClaimTrackerPage({ params }) {
  const resolvedParams = use(params);
  const claimId = (resolvedParams?.id || "CLM-0192").toUpperCase();

  // Attached document state for the insurer request
  const [attachedFile, setAttachedFile] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasSentToInsurer, setHasSentToInsurer] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileSelect = (file) => {
    if (!file) return;
    setAttachedFile(file);
  };

  const handleRemoveFile = (e) => {
    e.stopPropagation();
    setAttachedFile(null);
  };

  const handleSendToInsurer = (e) => {
    e.preventDefault();
    if (!attachedFile && !hasSentToInsurer) {
      toast.error("Please select a document or photo to upload.");
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setHasSentToInsurer(true);
      toast.success(
        "Document uploaded and sent to insurer! Review in progress."
      );
    }, 1000);
  };

  return (
    <div className="claim-tracker-page">
      {/* Top Header */}
      <div className="claim-tracker-header">
        <div className="claim-header-left">
          <h1 className="claim-page-title">
            Claim <span className="claim-id-nowrap">#{claimId}</span>
          </h1>
          <p className="claim-page-subtitle">
            iPhone 13 Pro · Submitted Nov 2, 2026
          </p>
        </div>

        <span className="pill-claim-status pill-more-info">
          <span className="dot">●</span>
          {hasSentToInsurer ? "Documentation Under Review" : "More Information Needed"}
        </span>
      </div>

      {/* Main 2-Column Grid */}
      <div className="claim-tracker-grid">
        {/* Left Column: Claim Progress Card */}
        <div className="claim-progress-card">
          <h2 className="claim-card-title">Claim progress</h2>

          <div className="claim-timeline">
            {/* Step 1: Claim Submitted (Completed) */}
            <div className="claim-timeline-step">
              <div className="claim-step-indicator">
                <div className="claim-step-dot completed" />
                <div className="claim-step-line completed" />
              </div>
              <div className="claim-step-content">
                <h3 className="claim-step-title">Claim Submitted</h3>
                <span className="claim-step-sub">Nov 2, 2026</span>
              </div>
            </div>

            {/* Step 2: Documentation Review (Completed) */}
            <div className="claim-timeline-step">
              <div className="claim-step-indicator">
                <div className="claim-step-dot completed" />
                <div className="claim-step-line completed" />
              </div>
              <div className="claim-step-content">
                <h3 className="claim-step-title">Documentation Review</h3>
                <span className="claim-step-sub">Nov 3, 2026</span>
              </div>
            </div>

            {/* Step 3: Assessment (Completed) */}
            <div className="claim-timeline-step">
              <div className="claim-step-indicator">
                <div className="claim-step-dot completed" />
                <div className="claim-step-line completed" />
              </div>
              <div className="claim-step-content">
                <h3 className="claim-step-title">Assessment</h3>
                <span className="claim-step-sub">Nov 4, 2026</span>
              </div>
            </div>

            {/* Step 4: Outcome (Active - More info needed) */}
            <div className="claim-timeline-step">
              <div className="claim-step-indicator">
                <div className="claim-step-dot active" />
                <div className="claim-step-line upcoming" />
              </div>
              <div className="claim-step-content">
                <h3 className="claim-step-title active">Outcome</h3>
                <span
                  className="claim-step-sub"
                  style={{ color: "#b45309", fontWeight: 600 }}
                >
                  {hasSentToInsurer
                    ? "Updated information received"
                    : "More information needed"}
                </span>
              </div>
            </div>

            {/* Step 5: Repair or other approved settlement (Upcoming) */}
            <div className="claim-timeline-step">
              <div className="claim-step-indicator">
                <div className="claim-step-dot upcoming" />
                <div className="claim-step-line upcoming" />
              </div>
              <div className="claim-step-content">
                <h3 className="claim-step-title" style={{ color: "#64748b" }}>
                  Repair or other approved settlement
                </h3>
              </div>
            </div>

            {/* Step 6: Closed (Upcoming) */}
            <div className="claim-timeline-step">
              <div className="claim-step-indicator">
                <div className="claim-step-dot upcoming" />
              </div>
              <div className="claim-step-content">
                <h3 className="claim-step-title" style={{ color: "#64748b" }}>
                  Closed
                </h3>
              </div>
            </div>
          </div>

          <p className="claim-progress-footnote">
            The outcome can be Approved, Declined or More Information Needed.
          </p>
        </div>

        {/* Right Column: Action Needed Card & Policy Card */}
        <div className="claim-tracker-right-col">
          {/* Card 1: Action needed (Solid Black Outline) */}
          <div className="claim-action-needed-card">
            <h2 className="action-needed-title">Action needed</h2>
            <p className="action-needed-instruction">
              Please upload: proof of purchase or photo of incident
            </p>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,.pdf"
              style={{ display: "none" }}
              onChange={(e) => handleFileSelect(e.target.files?.[0])}
            />

            {attachedFile ? (
              <div className="claim-attached-file-row">
                <div className="claim-attached-left">
                  <FileText size={18} color="#059669" />
                  <span>{attachedFile.name}</span>
                </div>
                <button
                  type="button"
                  className="btn-remove-claim-file"
                  onClick={handleRemoveFile}
                  title="Remove file"
                >
                  <X size={14} />
                </button>
              </div>
            ) : (
              <div
                className="claim-doc-upload-box"
                onClick={() => fileInputRef.current?.click()}
                role="button"
                tabIndex={0}
              >
                <Upload size={22} className="claim-upload-icon" />
                <h3 className="claim-upload-main">
                  Upload a document or photo
                </h3>
                <span className="claim-upload-sub">JPG, PNG or PDF</span>
              </div>
            )}

            <button
              type="button"
              className="btn-send-to-insurer"
              onClick={handleSendToInsurer}
              disabled={isSubmitting}
            >
              {isSubmitting
                ? "Sending..."
                : hasSentToInsurer
                ? "Document sent"
                : "Send to insurer"}
            </button>
          </div>

          {/* Card 2: Policy */}
          <div className="claim-policy-card">
            <h2 className="policy-card-title">Policy</h2>

            <div className="policy-rows-list">
              <div className="policy-row-item">
                <span className="policy-row-label">Plan</span>
                <span className="policy-row-value">Total Device Care</span>
              </div>

              <div className="policy-row-item">
                <span className="policy-row-label">Policy number</span>
                <span className="policy-row-value">POL-882194</span>
              </div>

              <div className="policy-row-item">
                <span className="policy-row-label">Device</span>
                <span className="policy-row-value">iPhone 13 Pro</span>
              </div>

              <div className="policy-row-item">
                <span className="policy-row-label">Status</span>
                <span className="pill-policy-active">
                  <span className="dot">●</span>
                  Active
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
