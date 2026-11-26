"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { FileText, Smartphone } from "lucide-react";
import "../../insurance-flow.css";
import { toast } from "@/components/CustomToast";

export default function PolicyDetailPage() {
  const params = useParams();
  const policyId = params?.id || "POL-1029";

  // Supports ?status=awaiting_verification for Screen 10, defaults to active (Screen 9)
  const [policyStatus, setPolicyStatus] = useState("active");
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const sp = new URLSearchParams(window.location.search);
      if (sp.get("status") === "awaiting_verification") {
        setPolicyStatus("awaiting_verification");
      }
    }
  }, []);

  const isAwaiting = policyStatus === "awaiting_verification";

  return (
    <div className="ins-page">
      {/* Header */}
      <div className="ins-header">
        <div>
          <h1 className="ins-title">Plus</h1>
          <p className="ins-subtitle">
            Policy #{String(policyId).toUpperCase()} · iPhone 13 Pro
          </p>
        </div>

        <div className="ins-header-actions">
          <span
            className={`ins-pill ${
              isAwaiting ? "ins-pill-amber" : "ins-pill-green"
            }`}
          >
            <span className="ins-pill-dot" />
            <span>{isAwaiting ? "Awaiting Verification" : "Active"}</span>
          </span>

          <Link
            href="/dashboard/insurance/claims/new"
            className={isAwaiting ? "ins-btn-outline" : "ins-btn-primary"}
          >
            Start a claim
          </Link>
        </div>
      </div>

      {/* Screen 10 Awaiting Verification Callout Banner */}
      {isAwaiting && (
        <div className="ins-card highlight-border">
          <h2 className="ins-card-title">Your cover has not started yet</h2>
          <p className="ins-plan-desc">
            Your device needs a physical check first.
          </p>
          <Link href="/dashboard/repairs/book" className="ins-btn-primary full">
            Book an inspection
          </Link>
        </div>
      )}

      {/* 2-Column Details Grid */}
      <div className="ins-two-col">
        {/* Left Column: Cover Summary & Documents */}
        <div className="ins-col-stack">
          <div className="ins-card">
            <h2 className="ins-card-title">Cover summary</h2>
            <div>
              <div className="ins-kv-row">
                <span className="ins-kv-label">Covers</span>
                <span className="ins-kv-val">
                  Accidental, screen &amp; liquid damage
                </span>
              </div>
              <div className="ins-kv-row">
                <span className="ins-kv-label">Does not cover</span>
                <span className="ins-kv-val">
                  Unauthorised repairs &amp; cosmetic wear
                </span>
              </div>
              <div className="ins-kv-row">
                <span className="ins-kv-label">Excess</span>
                <span className="ins-kv-val">₦3,500</span>
              </div>
              <div className="ins-kv-row">
                <span className="ins-kv-label">Cover period</span>
                <span className="ins-kv-val">
                  {isAwaiting
                    ? "Starts after verification"
                    : "Nov 4, 2026 to Nov 4, 2027"}
                </span>
              </div>
            </div>
          </div>

          <div className="ins-card">
            <h2 className="ins-card-title">Documents</h2>
            <div>
              {[
                "Policy certificate",
                "Policy schedule",
                "Terms and conditions",
              ].map((docName) => (
                <div key={docName} className="ins-doc-row">
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

        {/* Right Column: Device, Premium & Manage */}
        <div className="ins-col-stack">
          <div className="ins-card">
            <h2 className="ins-card-title">Device</h2>
            <div className="ins-doc-row" style={{ borderBottom: "none", paddingBottom: 0 }}>
              <div className="ins-doc-left" style={{ gap: "14px" }}>
                <div
                  style={{
                    width: "48px",
                    height: "48px",
                    borderRadius: "14px",
                    background: "#f4f4f4",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <Smartphone size={22} color="#080808" />
                </div>
                <div>
                  <p className="ins-radio-title">iPhone 13 Pro</p>
                  <p className="ins-radio-sub">UK used</p>
                </div>
              </div>

              <span
                className={`ins-pill ${
                  isAwaiting ? "ins-pill-grey" : "ins-pill-green"
                }`}
              >
                <span className="ins-pill-dot" />
                <span>{isAwaiting ? "Pending Verification" : "Verified"}</span>
              </span>
            </div>
          </div>

          <div className="ins-card">
            <h2 className="ins-card-title">Premium</h2>
            <div>
              <div className="ins-kv-row">
                <span className="ins-kv-label">Amount</span>
                <span className="ins-kv-val">₦4,500/month</span>
              </div>
              <div className="ins-kv-row">
                <span className="ins-kv-label">Next payment</span>
                <span className="ins-kv-val">Dec 4, 2026</span>
              </div>
            </div>

            <button
              type="button"
              className="ins-btn-outline full"
              onClick={() =>
                toast.info("Opening partner payment portal...")
              }
            >
              Pay on partner page
            </button>
          </div>

          <div className="ins-card">
            <h2 className="ins-card-title">Manage</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px", alignItems: "flex-start" }}>
              <Link href="/dashboard/insurance/buy" className="ins-link-underlined">
                Change plan
              </Link>
              <button
                type="button"
                className="ins-link-underlined"
                onClick={() => setIsCancelModalOpen(true)}
              >
                Cancel policy
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Cancel Policy Confirmation Modal (Screen 11) */}
      {isCancelModalOpen && (
        <div
          className="ins-modal-overlay"
          onClick={() => setIsCancelModalOpen(false)}
        >
          <div
            className="ins-modal-card"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="ins-modal-title">Cancel this policy?</h2>
            <p className="ins-modal-sub">Here is what happens.</p>

            <div>
              <div className="ins-kv-row">
                <span className="ins-kv-label">Cover ends</span>
                <span className="ins-kv-val">Immediately upon cancellation</span>
              </div>
              <div className="ins-kv-row">
                <span className="ins-kv-label">Refund</span>
                <span className="ins-kv-val">
                  Pro-rata refund · depends on partner rules
                </span>
              </div>
              <div className="ins-kv-row">
                <span className="ins-kv-label">Open claims</span>
                <span className="ins-kv-val">
                  Existing claims continue to be assessed
                </span>
              </div>
            </div>

            <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", marginTop: "4px" }}>
              <button
                type="button"
                className="ins-btn-primary"
                onClick={() => setIsCancelModalOpen(false)}
              >
                Keep policy
              </button>
              <button
                type="button"
                className="ins-btn-outline"
                onClick={() => {
                  setIsCancelModalOpen(false);
                  toast.info("Policy cancellation will be processed once live.");
                }}
              >
                Cancel policy
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
