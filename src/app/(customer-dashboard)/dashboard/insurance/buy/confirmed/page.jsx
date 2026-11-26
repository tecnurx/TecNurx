"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ShieldCheck } from "lucide-react";
import "../../insurance-flow.css";

export default function PolicyConfirmedPage() {
  const [quote, setQuote] = useState({
    plan: "Plus",
    device: "iPhone 13 Pro",
  });

  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const raw = sessionStorage.getItem("pending_insurance_quote");
        if (raw) {
          const parsed = JSON.parse(raw);
          setQuote((prev) => ({ ...prev, ...parsed }));
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
          <h1 className="ins-title">Your policy is set up</h1>
          <p className="ins-subtitle">
            {quote.plan} · {quote.device}
          </p>
        </div>

        <span className="ins-pill ins-pill-amber">
          <span className="ins-pill-dot" />
          <span>Awaiting Verification</span>
        </span>
      </div>

      {/* Hero Card */}
      <div className="ins-confirmed-hero">
        <div className="ins-confirmed-icon">
          <ShieldCheck size={36} strokeWidth={2} />
        </div>

        <h2 className="ins-card-title">Thank you. Your policy is issued</h2>
        <p className="ins-plan-desc" style={{ maxWidth: "420px" }}>
          Cover starts once an engineer has verified your device.
        </p>

        <Link href="/dashboard/repairs/book" className="ins-btn-primary">
          Book an inspection
        </Link>

        <Link
          href="/dashboard/insurance/policies/POL-1029?status=awaiting_verification"
          className="ins-link-underlined"
        >
          View policy
        </Link>
      </div>

      {/* What happens next */}
      <div className="ins-card">
        <h2 className="ins-card-title">What happens next</h2>

        <div>
          <div className="ins-step-row">
            <div className="ins-step-badge">1</div>
            <div>
              <p className="ins-radio-title">Book an inspection</p>
              <p className="ins-radio-sub">
                Bring it to our office or have it checked at pickup.
              </p>
            </div>
          </div>

          <div className="ins-step-row">
            <div className="ins-step-badge">2</div>
            <div>
              <p className="ins-radio-title">Engineer verifies it</p>
              <p className="ins-radio-sub">
                You see the result in your devices.
              </p>
            </div>
          </div>

          <div className="ins-step-row">
            <div className="ins-step-badge">3</div>
            <div>
              <p className="ins-radio-title">Cover starts</p>
              <p className="ins-radio-sub">We confirm the date here.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
