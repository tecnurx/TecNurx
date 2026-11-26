"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { FileCheck2 } from "lucide-react";
import "../../insurance-flow.css";

const CLAIM_STEPS = [
  "Claim Submitted",
  "Documentation Review",
  "Assessment",
  "Outcome",
  "Settlement",
  "Closed",
];

export default function ClaimSubmittedPage() {
  const [claimInfo, setClaimInfo] = useState({
    claimId: "CLM-0244",
    device: "iPhone 13 Pro",
  });

  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const raw = sessionStorage.getItem("pending_insurance_claim");
        if (raw) {
          const parsed = JSON.parse(raw);
          setClaimInfo((prev) => ({ ...prev, ...parsed }));
        }
      } catch {
        // ignore parse errors
      }
    }
  }, []);

  return (
    <div className="ins-page">
      {/* Header */}
      <div className="ins-header">
        <div>
          <h1 className="ins-title">Claim submitted</h1>
          <p className="ins-subtitle">
            Claim #{claimInfo.claimId} · {claimInfo.device}
          </p>
        </div>

        <span className="ins-pill ins-pill-amber">
          <span className="ins-pill-dot" />
          <span>Claim Submitted</span>
        </span>
      </div>

      {/* Hero Card */}
      <div className="ins-confirmed-hero">
        <div className="ins-confirmed-icon">
          <FileCheck2 size={36} strokeWidth={2} />
        </div>

        <h2 className="ins-card-title">We have your claim</h2>
        <p className="ins-plan-desc" style={{ maxWidth: "420px" }}>
          Follow every step here. We will tell you if the insurer needs
          anything else.
        </p>

        <Link
          href={`/dashboard/insurance/claims/${claimInfo.claimId}`}
          className="ins-btn-primary"
        >
          View claim
        </Link>

        <Link
          href="/dashboard/insurance?state=normal"
          className="ins-link-underlined"
        >
          Back to Protection
        </Link>
      </div>

      {/* 6-Step Progress Bar */}
      <div className="ins-steps-bar six-steps">
        {CLAIM_STEPS.map((label, idx) => (
          <div
            key={label}
            className={`ins-step-item ${idx === 0 ? "active" : ""}`}
          >
            {label}
          </div>
        ))}
      </div>
    </div>
  );
}
