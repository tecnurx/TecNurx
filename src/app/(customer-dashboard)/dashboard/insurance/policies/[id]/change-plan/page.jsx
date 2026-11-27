"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Info } from "lucide-react";
import "../../../insurance-flow.css";
import { toast } from "@/components/CustomToast";

const PLANS = [
  {
    id: "compact",
    name: "Compact",
    price: 2500,
    diff: "-₦2,000/month",
    current: false,
  },
  {
    id: "plus",
    name: "Plus",
    price: 4500,
    diff: null,
    current: true,
  },
  {
    id: "premium",
    name: "Premium",
    price: 7000,
    diff: "+₦2,500/month",
    current: false,
  },
];

export default function ChangePlanPage() {
  const params = useParams();
  const router = useRouter();
  const policyId = params?.id || "POL-1029";

  const [selectedPlanId, setSelectedPlanId] = useState("plus");
  const [effectiveTiming, setEffectiveTiming] = useState("next_date"); // "next_date" | "now"
  const [isSubmitting, setIsSubmitting] = useState(false);

  const selectedPlan = PLANS.find((p) => p.id === selectedPlanId) || PLANS[1];
  const nextPremiumDate = "Dec 4, 2026";
  const takesEffectText =
    effectiveTiming === "now" ? "Immediately" : nextPremiumDate;

  const handleConfirmChange = async () => {
    if (selectedPlan.current) {
      toast.info("You are already on the Plus plan.");
      return;
    }
    setIsSubmitting(true);
    try {
      toast.success(
        `Plan change to ${selectedPlan.name} requested (${takesEffectText}).`
      );
      router.push(`/dashboard/insurance/policies/${policyId}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="ins-page">
      {/* Header */}
      <div className="ins-header">
        <div>
          <h1 className="ins-title">Change plan</h1>
          <p className="ins-subtitle">
            Policy #{String(policyId).toUpperCase()} · iPhone 13 Pro
          </p>
        </div>
      </div>

      {/* 2-Column Layout (3fr : 2fr) */}
      <div className="ins-two-col">
        {/* Left Card: Plan & Timing Selection */}
        <div className="ins-card">
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            <h2
              style={{
                fontSize: "14px",
                fontWeight: 700,
                color: "#080808",
                margin: 0,
              }}
            >
              Choose a plan
            </h2>

            {PLANS.map((plan) => {
              const isSelected = selectedPlanId === plan.id;
              return (
                <button
                  key={plan.id}
                  type="button"
                  className={`ins-radio-card ${isSelected ? "selected" : ""}`}
                  onClick={() => setSelectedPlanId(plan.id)}
                >
                  <span className="ins-radio-circle" />
                  <div className="ins-radio-body" style={{ flex: 1 }}>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                        flexWrap: "wrap",
                      }}
                    >
                      <span className="ins-radio-title">{plan.name}</span>
                      {plan.current && (
                        <span className="ins-rec-pill">
                          <span className="ins-rec-dot" />
                          <span>Current plan</span>
                        </span>
                      )}
                    </div>
                    <p className="ins-radio-sub">
                      ₦{plan.price.toLocaleString()}/month
                      {plan.diff ? ` · ${plan.diff}` : ""}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "12px",
              marginTop: "8px",
            }}
          >
            <h2
              style={{
                fontSize: "14px",
                fontWeight: 700,
                color: "#080808",
                margin: 0,
              }}
            >
              When should it start?
            </h2>

            <button
              type="button"
              className={`ins-radio-card ${
                effectiveTiming === "next_date" ? "selected" : ""
              }`}
              onClick={() => setEffectiveTiming("next_date")}
            >
              <span className="ins-radio-circle" />
              <div className="ins-radio-body">
                <span className="ins-radio-title">
                  From your next premium date
                </span>
                <p className="ins-radio-sub">{nextPremiumDate}</p>
              </div>
            </button>

            <button
              type="button"
              className={`ins-radio-card ${
                effectiveTiming === "now" ? "selected" : ""
              }`}
              onClick={() => setEffectiveTiming("now")}
            >
              <span className="ins-radio-circle" />
              <div className="ins-radio-body">
                <span className="ins-radio-title">Now</span>
                <p className="ins-radio-sub">
                  Pro-rata adjustment applies from today
                </p>
              </div>
            </button>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "12px",
              flexWrap: "wrap",
              marginTop: "8px",
            }}
          >
            <Link
              href={`/dashboard/insurance/policies/${policyId}`}
              className="ins-btn-outline"
            >
              Back
            </Link>
            <button
              type="button"
              className="ins-btn-primary"
              disabled={isSubmitting}
              onClick={handleConfirmChange}
            >
              {isSubmitting ? "Submitting..." : "Confirm change"}
            </button>
          </div>
        </div>

        {/* Right Card: Summary */}
        <div className="ins-card">
          <h2 className="ins-card-title">Summary</h2>

          <div>
            <div className="ins-kv-row">
              <span className="ins-kv-label">New premium</span>
              <span className="ins-kv-val">
                ₦{selectedPlan.price.toLocaleString()}/month
              </span>
            </div>
            <div className="ins-kv-row">
              <span className="ins-kv-label">Takes effect</span>
              <span className="ins-kv-val">{takesEffectText}</span>
            </div>
          </div>

          <div className="ins-info-box">
            <Info size={18} style={{ flexShrink: 0, marginTop: "2px" }} />
            <span>The insurer approves changes to your cover.</span>
          </div>
        </div>
      </div>
    </div>
  );
}
