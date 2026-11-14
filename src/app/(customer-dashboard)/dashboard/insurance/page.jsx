"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import "./dashinsure.css";
import {
  Shield,
  FileText,
  X,
  Check,
  AlertCircle,
  Plus,
  ArrowRight,
} from "lucide-react";
import { toast } from "@/components/CustomToast";

const DashboardInsurance = () => {
  // Set default viewState to "coming_soon"
  const [viewState, setViewState] = useState("coming_soon"); // "normal" | "coming_soon"
  const [isNotified, setIsNotified] = useState(false);

  // Modals state
  const [isPolicyModalOpen, setIsPolicyModalOpen] = useState(false);
  const [isClaimModalOpen, setIsClaimModalOpen] = useState(false);
  const [isTrackModalOpen, setIsTrackModalOpen] = useState(false);

  // New claim form state
  const [claimIssue, setClaimIssue] = useState("");
  const [claimNotes, setClaimNotes] = useState("");
  const [isSubmittingClaim, setIsSubmittingClaim] = useState(false);

  // Default state is "coming_soon". Allow ?state=normal if needed for dev review
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const stateParam = params.get("state") || params.get("view");
      if (stateParam === "normal") {
        setViewState("normal");
      }
    }
  }, []);

  const handleNotifyMe = () => {
    setIsNotified(true);
    toast.success("You're on the list! We'll notify you when plans launch.");
  };

  const handleStartClaimSubmit = (e) => {
    e.preventDefault();
    if (!claimIssue) {
      toast.error("Please describe the damage or issue");
      return;
    }
    setIsSubmittingClaim(true);
    setTimeout(() => {
      setIsSubmittingClaim(false);
      setIsClaimModalOpen(false);
      setClaimIssue("");
      setClaimNotes("");
      toast.success("Claim submitted successfully! Claim #CLM-0244 created.");
    }, 1200);
  };

  return (
    <div className="protection-page">
      {/* Header */}
      <div className="protection-header">
        <div className="protection-header-left">
          <h1 className="protection-title">Protection</h1>
          <p className="protection-subtitle">Your plans and claims.</p>
        </div>

        <div className="protection-header-right">
          {/* State switcher commented out */}
          {/*
          <div className="state-switcher-pills">
            <button
              type="button"
              className={`state-switcher-btn ${
                viewState === "normal" ? "active" : ""
              }`}
              onClick={() => setViewState("normal")}
            >
              Plans & Claims
            </button>
            <button
              type="button"
              className={`state-switcher-btn ${
                viewState === "coming_soon" ? "active" : ""
              }`}
              onClick={() => setViewState("coming_soon")}
            >
              Coming Soon
            </button>
          </div>
          */}

          {viewState === "normal" && (
            <button
              type="button"
              className="btn-find-plan-header"
              onClick={() => toast.success("Browsing available protection plans...")}
            >
              Find a plan
            </button>
          )}
        </div>
      </div>

      {/* STATE 1: COMING SOON */}
      {viewState === "coming_soon" ? (
        <div className="coming-soon-card">
          <div className="coming-soon-icon-box">
            <Shield size={28} strokeWidth={2} />
          </div>
          <h2 className="coming-soon-title">Device protection is coming soon</h2>
          <p className="coming-soon-desc">
            We are finalising our plans. Tell us if you would like to hear first.
          </p>
          <div className="coming-soon-pill-badge">
            <span className="dot">●</span>
            Coming soon
          </div>
          <button
            type="button"
            className="btn-notify-me"
            onClick={handleNotifyMe}
            disabled={isNotified}
          >
            {isNotified ? "We'll notify you" : "Notify me"}
          </button>
        </div>
      ) : (
        /* STATE 2: NORMAL STATE (PLANS & CLAIMS) */
        <div className="protection-sections-list">
          {/* Section 1: Plans */}
          <div className="protection-section">
            <h2 className="protection-section-title">Plans</h2>

            <div className="protection-card">
              <div className="protection-card-header">
                <div className="protection-card-meta">
                  <div className="protection-icon-box">
                    <Shield size={22} strokeWidth={2} />
                  </div>
                  <div className="protection-plan-info">
                    <h3 className="protection-item-title">Total Device Care</h3>
                    <p className="protection-item-sub">
                      iPhone 13 Pro · Renews Nov 4, 2027
                    </p>
                  </div>
                </div>

                <span className="pill-active-plan">
                  <span className="dot">●</span>
                  Active
                </span>
              </div>

              <div className="protection-actions-row">
                <button
                  type="button"
                  className="btn-view-policy"
                  onClick={() => setIsPolicyModalOpen(true)}
                >
                  View policy
                </button>
                <button
                  type="button"
                  className="btn-start-claim"
                  onClick={() => setIsClaimModalOpen(true)}
                >
                  Start a claim
                </button>
              </div>
            </div>
          </div>

          {/* Section 2: Claims */}
          <div className="protection-section">
            <h2 className="protection-section-title">Claims</h2>

            <div className="protection-card">
              <div className="protection-card-header">
                <div className="protection-card-meta">
                  <div className="protection-icon-box">
                    <FileText size={22} strokeWidth={2} />
                  </div>
                  <div className="protection-plan-info">
                    <h3 className="protection-item-title">
                      Claim <span className="claim-id-nowrap">#CLM-0192</span>
                    </h3>
                    <p className="protection-item-sub">
                      iPhone 13 Pro · Submitted Nov 2, 2026
                    </p>
                  </div>
                </div>

                <span className="pill-claim-warning">
                  <span className="dot">●</span>
                  More Information Needed
                </span>
              </div>

              <div className="protection-claim-action">
                <Link
                  href="/dashboard/insurance/claims/CLM-0192"
                  className="claim-track-link"
                >
                  Track claim
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 1: VIEW POLICY */}
      {isPolicyModalOpen && (
        <div
          className="protection-modal-backdrop"
          onClick={() => setIsPolicyModalOpen(false)}
        >
          <div
            className="protection-modal-card"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="protection-modal-head">
              <h2>Policy Details</h2>
              <button
                type="button"
                className="protection-modal-close"
                onClick={() => setIsPolicyModalOpen(false)}
              >
                <X size={18} />
              </button>
            </div>

            <div className="policy-info-grid">
              <div className="policy-info-item">
                <span>Plan Type</span>
                <span>Total Device Care (Comprehensive)</span>
              </div>
              <div className="policy-info-item">
                <span>Covered Device</span>
                <span>iPhone 13 Pro (128GB)</span>
              </div>
              <div className="policy-info-item">
                <span>Status</span>
                <span style={{ color: "#059669" }}>Active</span>
              </div>
              <div className="policy-info-item">
                <span>Coverage Limit</span>
                <span>₦450,000 / year</span>
              </div>
              <div className="policy-info-item">
                <span>Deductible</span>
                <span>₦0 on first repair</span>
              </div>
              <div className="policy-info-item">
                <span>Renewal Date</span>
                <span>Nov 4, 2027</span>
              </div>
            </div>

            <div className="protection-modal-actions">
              <button
                type="button"
                className="btn-protection-modal-close"
                onClick={() => setIsPolicyModalOpen(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: START A CLAIM */}
      {isClaimModalOpen && (
        <div
          className="protection-modal-backdrop"
          onClick={() => setIsClaimModalOpen(false)}
        >
          <div
            className="protection-modal-card"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="protection-modal-head">
              <h2>Start a claim</h2>
              <button
                type="button"
                className="protection-modal-close"
                onClick={() => setIsClaimModalOpen(false)}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleStartClaimSubmit}>
              <div style={{ marginBottom: "16px" }}>
                <label
                  style={{
                    display: "block",
                    fontSize: "13.5px",
                    fontWeight: 600,
                    marginBottom: "6px",
                  }}
                >
                  Covered Device
                </label>
                <input
                  type="text"
                  value="iPhone 13 Pro (Total Device Care)"
                  disabled
                  style={{
                    width: "100%",
                    padding: "10px 14px",
                    borderRadius: "10px",
                    border: "1px solid #e5e7eb",
                    background: "#f9fafb",
                    fontSize: "14px",
                    color: "#374151",
                  }}
                />
              </div>

              <div style={{ marginBottom: "16px" }}>
                <label
                  style={{
                    display: "block",
                    fontSize: "13.5px",
                    fontWeight: 600,
                    marginBottom: "6px",
                  }}
                >
                  Type of Damage or Incident *
                </label>
                <select
                  value={claimIssue}
                  onChange={(e) => setClaimIssue(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "10px 14px",
                    borderRadius: "10px",
                    border: "1px solid #d1d5db",
                    fontSize: "14px",
                  }}
                  required
                >
                  <option value="">Select incident type</option>
                  <option value="cracked_screen">Cracked Screen</option>
                  <option value="liquid_damage">Liquid Damage</option>
                  <option value="battery_failure">Battery / Power Failure</option>
                  <option value="accidental_damage">Accidental Drop Damage</option>
                  <option value="other">Other Component Issue</option>
                </select>
              </div>

              <div style={{ marginBottom: "20px" }}>
                <label
                  style={{
                    display: "block",
                    fontSize: "13.5px",
                    fontWeight: 600,
                    marginBottom: "6px",
                  }}
                >
                  Incident Details (Optional)
                </label>
                <textarea
                  rows={3}
                  placeholder="Describe what occurred..."
                  value={claimNotes}
                  onChange={(e) => setClaimNotes(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "10px 14px",
                    borderRadius: "10px",
                    border: "1px solid #d1d5db",
                    fontSize: "14px",
                    fontFamily: "inherit",
                  }}
                />
              </div>

              <div className="protection-modal-actions">
                <button
                  type="button"
                  className="btn-modal-cancel"
                  onClick={() => setIsClaimModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-protection-modal-close"
                  disabled={isSubmittingClaim}
                >
                  {isSubmittingClaim ? "Submitting..." : "Submit claim"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: TRACK CLAIM */}
      {isTrackModalOpen && (
        <div
          className="protection-modal-backdrop"
          onClick={() => setIsTrackModalOpen(false)}
        >
          <div
            className="protection-modal-card"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="protection-modal-head">
              <h2>Claim Status: #CLM-0192</h2>
              <button
                type="button"
                className="protection-modal-close"
                onClick={() => setIsTrackModalOpen(false)}
              >
                <X size={18} />
              </button>
            </div>

            <div
              style={{
                background: "#fef3c7",
                border: "1px solid #fde68a",
                borderRadius: "12px",
                padding: "16px",
                display: "flex",
                gap: "12px",
                alignItems: "flex-start",
                marginBottom: "20px",
              }}
            >
              <AlertCircle size={20} color="#b45309" style={{ flexShrink: 0 }} />
              <div>
                <strong
                  style={{
                    display: "block",
                    color: "#92400e",
                    fontSize: "14px",
                    marginBottom: "4px",
                  }}
                >
                  More Information Needed
                </strong>
                <p style={{ margin: 0, fontSize: "13.5px", color: "#78350f" }}>
                  Our claims officer has requested a photo showing the device
                  serial/IMEI screen to finalize your repair authorization.
                </p>
              </div>
            </div>

            <div className="policy-info-grid">
              <div className="policy-info-item">
                <span>Submitted Date</span>
                <span>Nov 2, 2026</span>
              </div>
              <div className="policy-info-item">
                <span>Incident Reported</span>
                <span>Screen Cracked</span>
              </div>
              <div className="policy-info-item">
                <span>Assigned Officer</span>
                <span>TecNurx Claims Desk</span>
              </div>
            </div>

            <div className="protection-modal-actions">
              <button
                type="button"
                className="btn-protection-modal-close"
                onClick={() => setIsTrackModalOpen(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardInsurance;
