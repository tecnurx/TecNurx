"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Lock, ShieldCheck } from "lucide-react";
import "../../insurance-flow.css";

export default function BuyProtectionPaymentPage() {
  const router = useRouter();
  const [autopayMode, setAutopayMode] = useState("auto"); // "auto" | "manual"
  const [quote, setQuote] = useState({
    plan: "Plus",
    billingCycle: "monthly",
    price: "4,500",
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

  const handleContinueToSecurePayment = () => {
    router.push("/dashboard/insurance/buy/confirmed");
  };

  return (
    <div className="ins-page">
      <div className="ins-header">
        <div>
          <h1 className="ins-title">Pay your first premium</h1>
          <p className="ins-subtitle">
            Complete this securely with our payment partner.
          </p>
        </div>
      </div>

      <div className="ins-two-col">
        {/* Left: Summary & Autopay Choice */}
        <div className="ins-card">
          <h2 className="ins-card-title">Summary</h2>

          <div>
            <div className="ins-kv-row">
              <span className="ins-kv-label">Plan</span>
              <span className="ins-kv-val">
                {quote.plan} · {quote.device}
              </span>
            </div>
            <div className="ins-kv-row">
              <span className="ins-kv-label">Billing</span>
              <span className="ins-kv-val" style={{ textTransform: "capitalize" }}>
                {quote.billingCycle}
              </span>
            </div>
            <div className="ins-kv-row">
              <span className="ins-kv-due-label">Due now</span>
              <span className="ins-kv-due-val">₦{quote.price}</span>
            </div>
          </div>

          <button
            type="button"
            className={`ins-radio-card ${
              autopayMode === "auto" ? "selected" : ""
            }`}
            onClick={() => setAutopayMode("auto")}
          >
            <div className="ins-radio-circle" />
            <div className="ins-radio-body">
              <p className="ins-radio-title">Set up automatic payments</p>
              <p className="ins-radio-sub">
                Pay each premium automatically on our payment partner&apos;s
                page.
              </p>
            </div>
          </button>

          <button
            type="button"
            className={`ins-radio-card ${
              autopayMode === "manual" ? "selected" : ""
            }`}
            onClick={() => setAutopayMode("manual")}
          >
            <div className="ins-radio-circle" />
            <div className="ins-radio-body">
              <p className="ins-radio-title">I will pay each premium myself</p>
              <p className="ins-radio-sub">
                We send a reminder before each due date.
              </p>
            </div>
          </button>

          <button
            type="button"
            className="ins-btn-primary full"
            onClick={handleContinueToSecurePayment}
          >
            <Lock size={16} />
            <span>Continue to secure payment</span>
          </button>
        </div>

        {/* Right: What to expect */}
        <div className="ins-card">
          <h2 className="ins-card-title">What to expect</h2>

          <div>
            <div className="ins-step-row">
              <div className="ins-step-badge">1</div>
              <div>
                <p className="ins-radio-title">You go to payment gateway</p>
                <p className="ins-radio-sub">
                  Our payment partner&apos;s secure page opens.
                </p>
              </div>
            </div>

            <div className="ins-step-row">
              <div className="ins-step-badge">2</div>
              <div>
                <p className="ins-radio-title">You complete the payment</p>
                <p className="ins-radio-sub">Then you come back here.</p>
              </div>
            </div>

            <div className="ins-step-row">
              <div className="ins-step-badge">3</div>
              <div>
                <p className="ins-radio-title">Your policy is issued</p>
                <p className="ins-radio-sub">
                  We show your policy and cover start date.
                </p>
              </div>
            </div>
          </div>

          <div className="ins-info-box">
            <ShieldCheck size={18} style={{ flexShrink: 0, marginTop: "2px" }} />
            <span>We never see or store your card details.</span>
          </div>
        </div>
      </div>
    </div>
  );
}
