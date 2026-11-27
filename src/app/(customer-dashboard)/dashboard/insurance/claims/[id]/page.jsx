"use client";

import React, { use, useState, useRef, useEffect } from "react";
import "./claim-tracker.css";
import "../../insurance-flow.css";
import Link from "next/link";
import { Upload, FileText, X, Check, ArrowLeft, Info } from "lucide-react";
import { toast } from "@/components/CustomToast";

export default function ClaimTrackerPage({ params }) {
  const resolvedParams = use(params);
  const claimId = (resolvedParams?.id || "CLM-0192").toUpperCase();

  // Supports ?outcome=approved (Screen 16), ?outcome=declined (Screen 17), and ?outcome=closed (or ?status=closed)
  const [outcome, setOutcome] = useState(null);
  const [settlementChoice, setSettlementChoice] = useState("repair"); // "repair" | "other"

  useEffect(() => {
    if (typeof window !== "undefined") {
      const sp = new URLSearchParams(window.location.search);
      const out = (sp.get("outcome") || sp.get("status") || "").toLowerCase();
      if (out === "approved" || out === "declined" || out === "closed") {
        setOutcome(out);
      }
    }
  }, []);

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

  if (outcome === "approved") {
    return (
      <div className="ins-page">
        <div className="ins-header">
          <div>
            <h1 className="ins-title">Claim approved</h1>
            <p className="ins-subtitle">
              Claim #{claimId} · iPhone 13 Pro
            </p>
          </div>

          <span className="ins-pill ins-pill-green">
            <span className="ins-pill-dot" />
            <span>Approved</span>
          </span>
        </div>

        <div className="ins-two-col">
          <div className="ins-card">
            <h2 className="ins-card-title">Choose your settlement</h2>

            <button
              type="button"
              className={`ins-radio-card ${
                settlementChoice === "repair" ? "selected" : ""
              }`}
              onClick={() => setSettlementChoice("repair")}
            >
              <div className="ins-radio-circle" />
              <div className="ins-radio-body">
                <p className="ins-radio-title">Repair through TecNurx</p>
                <p className="ins-radio-sub">
                  We coordinate the repair. You may pay an excess of ₦3,500.
                </p>
              </div>
            </button>

            <button
              type="button"
              className={`ins-radio-card ${
                settlementChoice === "other" ? "selected" : ""
              }`}
              onClick={() => setSettlementChoice("other")}
            >
              <div className="ins-radio-circle" />
              <div className="ins-radio-body">
                <p className="ins-radio-title">Other approved settlement</p>
                <p className="ins-radio-sub">
                  Cash payout or partner replacement option
                </p>
              </div>
            </button>

            <div className="ins-actions-row">
              <Link
                href="/dashboard/insurance?state=normal"
                className="ins-btn-outline"
              >
                Back
              </Link>
              <button
                type="button"
                className="ins-btn-primary"
                onClick={() =>
                  toast.success(
                    settlementChoice === "repair"
                      ? "Repair settlement selected. We will coordinate your repair."
                      : "Alternative settlement selected."
                  )
                }
              >
                Continue
              </button>
            </div>
          </div>

          <div className="ins-card">
            <h2 className="ins-card-title">Claim summary</h2>
            <div>
              <div className="ins-kv-row">
                <span className="ins-kv-label">Approved amount</span>
                <span className="ins-kv-val">₦120,000</span>
              </div>
              <div className="ins-kv-row">
                <span className="ins-kv-label">Excess</span>
                <span className="ins-kv-val">₦3,500</span>
              </div>
            </div>
            <div className="ins-info-box">
              <Info size={18} style={{ flexShrink: 0, marginTop: "2px" }} />
              <span>The insurer decides coverage and the outcome.</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (outcome === "declined") {
    return (
      <div className="ins-page">
        <div className="ins-header">
          <div>
            <h1 className="ins-title">Claim declined</h1>
            <p className="ins-subtitle">
              Claim #{claimId} · iPhone 13 Pro
            </p>
          </div>

          <span className="ins-pill ins-pill-red">
            <span className="ins-pill-dot" />
            <span>Declined</span>
          </span>
        </div>

        <div className="ins-two-col">
          <div className="ins-card">
            <h2 className="ins-card-title">Why</h2>
            <p className="ins-radio-title" style={{ fontWeight: 400 }}>
              The reported damage falls outside the covered events for this
              policy period.
            </p>

            <div className="ins-kv-row">
              <span className="ins-kv-label">Policy clause</span>
              <span className="ins-kv-val">Section 4.2 · Exclusions</span>
            </div>

            <div className="ins-header-actions">
              <button
                type="button"
                className="ins-btn-outline"
                onClick={() =>
                  toast.info("Review request will be sent once live.")
                }
              >
                Request a review
              </button>
              <Link href="/dashboard/support" className="ins-btn-outline">
                Contact support
              </Link>
            </div>
          </div>

          <div className="ins-card">
            <h2 className="ins-card-title">Other options</h2>
            <p className="ins-radio-sub">
              You can still book a normal repair and pay for it yourself.
            </p>
            <Link href="/dashboard/repairs/book" className="ins-btn-primary full">
              Book a repair
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (outcome === "closed") {
    const closedTimeline = [
      { label: "Claim Submitted", date: "Nov 2, 2026" },
      { label: "Documentation Review", date: "Nov 4, 2026" },
      { label: "Assessment", date: "Nov 6, 2026" },
      { label: "Outcome: Approved", date: "Nov 8, 2026" },
      { label: "Repair or settlement", date: "Nov 16, 2026" },
      { label: "Closed", date: "Nov 18, 2026" },
    ];

    return (
      <div className="ins-page">
        <div className="ins-header">
          <div>
            <h1 className="ins-title">Claim closed</h1>
            <p className="ins-subtitle">
              Claim #{claimId} · iPhone 13 Pro
            </p>
          </div>

          <span className="ins-pill ins-pill-grey">
            <span className="ins-pill-dot" />
            <span>Closed</span>
          </span>
        </div>

        <div className="ins-two-col">
          {/* Left Column: Claim Summary & Documents */}
          <div className="ins-col-stack">
            <div className="ins-card">
              <h2 className="ins-card-title">Claim summary</h2>
              <div>
                <div className="ins-kv-row">
                  <span className="ins-kv-label">Outcome</span>
                  <span className="ins-kv-val">Approved</span>
                </div>
                <div className="ins-kv-row">
                  <span className="ins-kv-label">Settlement</span>
                  <span className="ins-kv-val">Repair through TecNurx</span>
                </div>
                <div className="ins-kv-row">
                  <span className="ins-kv-label">Amount</span>
                  <span className="ins-kv-val">₦120,000</span>
                </div>
                <div className="ins-kv-row" style={{ borderBottom: "none", paddingBottom: 0 }}>
                  <span className="ins-kv-label">Closed on</span>
                  <span className="ins-kv-val">Nov 18, 2026</span>
                </div>
              </div>
            </div>

            <div className="ins-card">
              <h2 className="ins-card-title">Documents</h2>
              <div>
                {["Decision letter", "Repair receipt"].map((docName, idx) => (
                  <div
                    key={docName}
                    className="ins-doc-row"
                    style={
                      idx === 1 ? { borderBottom: "none", paddingBottom: 0 } : undefined
                    }
                  >
                    <div className="ins-doc-left">
                      <FileText size={18} />
                      <span>{docName}</span>
                    </div>
                    <button
                      type="button"
                      className="ins-link-underlined"
                      onClick={() =>
                        toast.info(`Downloading ${docName.toLowerCase()}...`)
                      }
                    >
                      Download
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Timeline */}
          <div className="ins-card">
            <h2 className="ins-card-title">Timeline</h2>

            <div className="claim-timeline">
              {closedTimeline.map((item, idx) => (
                <div key={item.label} className="claim-timeline-step">
                  <div className="claim-step-indicator">
                    <div
                      className="claim-step-dot completed"
                      style={{ background: "#080808", borderColor: "#080808" }}
                    />
                    {idx < closedTimeline.length - 1 && (
                      <div className="claim-step-line" />
                    )}
                  </div>
                  <div className="claim-step-content">
                    <p className="claim-step-title">{item.label}</p>
                    <p className="claim-step-meta">{item.date}</p>
                  </div>
                </div>
              ))}
            </div>

            <div>
              <Link
                href="/dashboard/insurance/claims/new"
                className="ins-link-underlined"
              >
                Start another claim
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

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
