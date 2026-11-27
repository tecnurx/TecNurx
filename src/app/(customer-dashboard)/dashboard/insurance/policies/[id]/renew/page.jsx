"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Check, Info } from "lucide-react";
import "../../../insurance-flow.css";
import { toast } from "@/components/CustomToast";

export default function RenewPolicyPage() {
  const params = useParams();
  const router = useRouter();
  const policyId = params?.id || "POL-1029";

  const [renewalChoice, setRenewalChoice] = useState("keep"); // "keep" | "change"
  const [agreedTerms, setAgreedTerms] = useState(false);

  const handleRenewAndPay = () => {
    if (!agreedTerms) {
      toast.error("Please confirm you have read the renewal terms.");
      return;
    }
    if (renewalChoice === "change") {
      router.push(`/dashboard/insurance/policies/${policyId}/change-plan`);
      return;
    }
    router.push("/dashboard/insurance/buy/payment");
  };

  return (
    <div className="ins-page">
      {/* Header */}
      <div className="ins-header">
        <div>
          <h1 className="ins-title">Renew your policy</h1>
          <p className="ins-subtitle">Plus · expires Nov 4, 2027</p>
        </div>

        <span className="ins-pill ins-pill-amber">
          <span className="ins-pill-dot" />
          <span>Expiring Soon</span>
        </span>
      </div>

      {/* 2-Column Layout (3fr : 2fr) */}
      <div className="ins-two-col">
        {/* Left Card: Renewal Summary */}
        <div className="ins-card">
          <h2 className="ins-card-title">Renewal summary</h2>

          <div>
            <div className="ins-kv-row">
              <span className="ins-kv-label">Plan</span>
              <span className="ins-kv-val">Plus</span>
            </div>
            <div className="ins-kv-row">
              <span className="ins-kv-label">Device</span>
              <span className="ins-kv-val">iPhone 13 Pro</span>
            </div>
            <div className="ins-kv-row">
              <span className="ins-kv-label">Cover period</span>
              <span className="ins-kv-val">Nov 4, 2027 to Nov 4, 2028</span>
            </div>
            <div
              className="ins-kv-row"
              style={{ borderBottom: "1px solid #eceef1" }}
            >
              <span
                style={{
                  fontSize: "18px",
                  fontWeight: 800,
                  color: "#080808",
                }}
              >
                Premium
              </span>
              <span
                style={{
                  fontSize: "18px",
                  fontWeight: 900,
                  color: "#080808",
                }}
              >
                ₦4,500/month
              </span>
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            <button
              type="button"
              className={`ins-radio-card ${
                renewalChoice === "keep" ? "selected" : ""
              }`}
              onClick={() => setRenewalChoice("keep")}
            >
              <span className="ins-radio-circle" />
              <div className="ins-radio-body">
                <span className="ins-radio-title">Keep the same plan</span>
              </div>
            </button>

            <button
              type="button"
              className={`ins-radio-card ${
                renewalChoice === "change" ? "selected" : ""
              }`}
              onClick={() => setRenewalChoice("change")}
            >
              <span className="ins-radio-circle" />
              <div className="ins-radio-body">
                <span className="ins-radio-title">Change plan</span>
                <p className="ins-radio-sub">Compare plans first.</p>
              </div>
            </button>
          </div>

          <label
            className="ins-checkbox-label"
            onClick={() => setAgreedTerms((prev) => !prev)}
          >
            <span className={`ins-checkbox-box ${agreedTerms ? "checked" : ""}`}>
              {agreedTerms && <Check size={14} strokeWidth={3} />}
            </span>
            <span>I have read the renewal terms.</span>
          </label>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "12px",
              flexWrap: "wrap",
            }}
          >
            <Link
              href={`/dashboard/insurance/policies/${policyId}`}
              className="ins-btn-outline"
            >
              Not now
            </Link>
            <button
              type="button"
              className="ins-btn-primary"
              disabled={!agreedTerms}
              onClick={handleRenewAndPay}
            >
              {renewalChoice === "change" ? "Compare plans" : "Renew and pay"}
            </button>
          </div>
        </div>

        {/* Right Card: Good to know */}
        <div className="ins-card">
          <h2 className="ins-card-title">Good to know</h2>
          <div className="ins-info-box">
            <Info size={18} style={{ flexShrink: 0, marginTop: "2px" }} />
            <span>You will pay securely on our payment partner’s page.</span>
          </div>
        </div>
      </div>
    </div>
  );
}
