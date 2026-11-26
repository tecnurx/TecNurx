"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ShieldCheck, Info } from "lucide-react";
import "../insurance-flow.css";
import { toast } from "@/components/CustomToast";

const PLANS = [
  {
    id: "compact",
    name: "Compact",
    monthlyPrice: "2,500",
    yearlyPrice: "25,000",
    bestFor: "Phones and everyday essentials",
    benefits: [
      "Cracked screen repair",
      "Battery & charging issues",
      "Up to 2 claims per year",
    ],
    excess: "5,000",
  },
  {
    id: "plus",
    name: "Plus",
    recommended: true,
    monthlyPrice: "4,500",
    yearlyPrice: "45,000",
    bestFor: "Flagship phones and tablets",
    benefits: [
      "Accidental & liquid damage",
      "Screen & internal hardware",
      "Priority pickup & return",
    ],
    excess: "3,500",
  },
  {
    id: "premium",
    name: "Premium",
    monthlyPrice: "7,500",
    yearlyPrice: "75,000",
    bestFor: "Laptops, MacBooks & high-value devices",
    benefits: [
      "Full accidental, liquid & theft cover",
      "Genuine OEM replacement parts",
      "Unlimited claims up to device value",
    ],
    excess: "0",
  },
];

const DEMO_DEVICES = [
  {
    id: "dev-1",
    name: "iPhone 13 Pro",
    condition: "UK used",
    status: "verified",
    statusLabel: "Verified",
    note: null,
  },
  {
    id: "dev-2",
    name: "Galaxy S23",
    condition: "Bought new",
    status: "pending",
    statusLabel: "Pending Verification",
    note: "Cover starts after an engineer verifies it.",
  },
  {
    id: "dev-3",
    name: "Pixel 7",
    condition: "Used in Nigeria",
    status: "ineligible",
    statusLabel: "Not Eligible",
    note: "This device cannot be covered.",
  },
];

export default function BuyProtectionPlanPage() {
  const router = useRouter();
  const [step, setStep] = useState(1); // 1: Plan, 2: Device, 3: Details, 4: Review
  const [billingCycle, setBillingCycle] = useState("monthly"); // "monthly" | "yearly"
  const [selectedPlanId, setSelectedPlanId] = useState("plus");
  const [selectedDeviceId, setSelectedDeviceId] = useState("dev-1");
  const [policyholder, setPolicyholder] = useState({
    fullName: "",
    phone: "",
    email: "",
    address: "",
    otherDetails: "",
  });
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  const selectedPlan = PLANS.find((p) => p.id === selectedPlanId) || PLANS[1];
  const selectedDevice =
    DEMO_DEVICES.find((d) => d.id === selectedDeviceId) || DEMO_DEVICES[0];

  const activePrice =
    billingCycle === "yearly" ? selectedPlan.yearlyPrice : selectedPlan.monthlyPrice;
  const periodSuffix = billingCycle === "yearly" ? "/year" : "/month";

  const stepHeaders = {
    1: {
      title: "Choose a plan",
      subtitle:
        "Cover for your device. Plans and prices are set by our insurance partner.",
    },
    2: {
      title: "Choose a device",
      subtitle: "Step 2 of 4: which device should this plan cover?",
    },
    3: {
      title: "Your details",
      subtitle: "Step 3 of 4: details the insurer needs.",
    },
    4: {
      title: "Review your plan",
      subtitle: "Step 4 of 4: check everything before you pay.",
    },
  };

  const handleContinueFromDetails = (e) => {
    e.preventDefault();
    if (!policyholder.fullName.trim() || !policyholder.phone.trim() || !policyholder.email.trim()) {
      toast.error("Please fill in your full name, phone, and email.");
      return;
    }
    setStep(4);
  };

  const handleContinueToPayment = () => {
    if (!acceptedTerms) {
      toast.error("Please accept the policy terms before continuing.");
      return;
    }
    if (typeof window !== "undefined") {
      sessionStorage.setItem(
        "pending_insurance_quote",
        JSON.stringify({
          plan: selectedPlan.name,
          billingCycle,
          price: activePrice,
          device: selectedDevice.name,
          deviceStatus: selectedDevice.status,
          policyholder: policyholder.fullName || "Policyholder",
        })
      );
    }
    router.push("/dashboard/insurance/buy/payment");
  };

  return (
    <div className="ins-page">
      {/* Header */}
      <div className="ins-header">
        <div>
          <h1 className="ins-title">{stepHeaders[step].title}</h1>
          <p className="ins-subtitle">{stepHeaders[step].subtitle}</p>
        </div>
      </div>

      {/* 4-Step Progress Bar */}
      <div className="ins-steps-bar">
        {[
          { num: 1, label: "1 Plan" },
          { num: 2, label: "2 Device" },
          { num: 3, label: "3 Details" },
          { num: 4, label: "4 Review" },
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

      {/* STEP 1: CHOOSE A PLAN */}
      {step === 1 && (
        <>
          <div className="ins-toggle-row">
            <button
              type="button"
              className={`ins-toggle-pill ${
                billingCycle === "monthly" ? "active" : ""
              }`}
              onClick={() => setBillingCycle("monthly")}
            >
              Monthly
            </button>
            <button
              type="button"
              className={`ins-toggle-pill ${
                billingCycle === "yearly" ? "active" : ""
              }`}
              onClick={() => setBillingCycle("yearly")}
            >
              Yearly
            </button>
          </div>

          <div className="ins-plans-grid">
            {PLANS.map((plan) => {
              const isSelected = selectedPlanId === plan.id;
              const price =
                billingCycle === "yearly" ? plan.yearlyPrice : plan.monthlyPrice;
              return (
                <button
                  key={plan.id}
                  type="button"
                  className={`ins-plan-card ${isSelected ? "selected" : ""}`}
                  onClick={() => setSelectedPlanId(plan.id)}
                >
                  {plan.recommended && (
                    <span className="ins-rec-pill">
                      <span className="ins-rec-dot" />
                      <span>Recommended for you</span>
                    </span>
                  )}

                  <h2 className="ins-plan-name">{plan.name}</h2>

                  <div className="ins-plan-price-row">
                    <span className="ins-plan-price">₦{price}</span>
                    <span className="ins-plan-period">{periodSuffix}</span>
                  </div>

                  <p className="ins-plan-desc">Best for {plan.bestFor}</p>

                  <div className="ins-divider" />

                  <ul className="ins-benefits-list">
                    {plan.benefits.map((b, i) => (
                      <li key={i}>{b}</li>
                    ))}
                    <li>Excess: ₦{plan.excess}</li>
                  </ul>
                </button>
              );
            })}
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
              onClick={() => setStep(2)}
            >
              Continue with {selectedPlan.name}
            </button>
          </div>
        </>
      )}

      {/* STEP 2: CHOOSE A DEVICE */}
      {step === 2 && (
        <div className="ins-two-col">
          <div className="ins-card">
            {DEMO_DEVICES.map((dev) => {
              const isSelected = selectedDeviceId === dev.id;
              const isDisabled = dev.status === "ineligible";
              const pillClass =
                dev.status === "verified"
                  ? "ins-pill-green"
                  : dev.status === "pending"
                  ? "ins-pill-grey"
                  : "ins-pill-red";

              return (
                <button
                  key={dev.id}
                  type="button"
                  disabled={isDisabled}
                  className={`ins-radio-card ${isSelected ? "selected" : ""} ${
                    isDisabled ? "disabled" : ""
                  }`}
                  onClick={() => !isDisabled && setSelectedDeviceId(dev.id)}
                >
                  <div className="ins-radio-circle" />
                  <div className="ins-radio-body">
                    <p className="ins-radio-title">{dev.name}</p>
                    <span className={`ins-pill ${pillClass}`}>
                      <span className="ins-pill-dot" />
                      <span>{dev.statusLabel}</span>
                    </span>
                    {dev.note && <p className="ins-radio-sub">{dev.note}</p>}
                    <p className="ins-radio-sub">{dev.condition}</p>
                  </div>
                </button>
              );
            })}

            <Link href="/dashboard/devices/add" className="ins-link-underlined">
              Add a new device
            </Link>

            <div className="ins-actions-row" style={{ marginTop: "6px" }}>
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
            <h2 className="ins-card-title">Good to know</h2>
            <div className="ins-info-box">
              <Info size={18} style={{ flexShrink: 0, marginTop: "2px" }} />
              <span>
                Some devices need a physical check before cover takes effect.
              </span>
            </div>
          </div>
        </div>
      )}

      {/* STEP 3: POLICYHOLDER DETAILS */}
      {step === 3 && (
        <div className="ins-two-col">
          <form className="ins-card" onSubmit={handleContinueFromDetails}>
            <div className="ins-field">
              <label htmlFor="ins-fullname">Full name</label>
              <input
                id="ins-fullname"
                type="text"
                className="ins-input"
                placeholder="Enter full name"
                value={policyholder.fullName}
                onChange={(e) =>
                  setPolicyholder({ ...policyholder, fullName: e.target.value })
                }
              />
            </div>

            <div className="ins-field">
              <label htmlFor="ins-phone">Phone</label>
              <input
                id="ins-phone"
                type="tel"
                className="ins-input"
                placeholder="Enter phone number"
                value={policyholder.phone}
                onChange={(e) =>
                  setPolicyholder({ ...policyholder, phone: e.target.value })
                }
              />
            </div>

            <div className="ins-field">
              <label htmlFor="ins-email">Email</label>
              <input
                id="ins-email"
                type="email"
                className="ins-input"
                placeholder="Enter email address"
                value={policyholder.email}
                onChange={(e) =>
                  setPolicyholder({ ...policyholder, email: e.target.value })
                }
              />
            </div>

            <div className="ins-field">
              <label htmlFor="ins-address">Address</label>
              <input
                id="ins-address"
                type="text"
                className="ins-input"
                placeholder="Enter street address"
                value={policyholder.address}
                onChange={(e) =>
                  setPolicyholder({ ...policyholder, address: e.target.value })
                }
              />
            </div>

            <div className="ins-field">
              <label htmlFor="ins-other">
                Other details required by the insurer
              </label>
              <input
                id="ins-other"
                type="text"
                className="ins-input"
                placeholder="Optional ID or serial notes"
                value={policyholder.otherDetails}
                onChange={(e) =>
                  setPolicyholder({
                    ...policyholder,
                    otherDetails: e.target.value,
                  })
                }
              />
            </div>

            <div className="ins-actions-row" style={{ marginTop: "6px" }}>
              <button
                type="button"
                className="ins-btn-outline"
                onClick={() => setStep(2)}
              >
                Back
              </button>
              <button type="submit" className="ins-btn-primary">
                Continue
              </button>
            </div>
          </form>

          <div className="ins-card">
            <h2 className="ins-card-title">Why we ask</h2>
            <p className="ins-radio-sub">
              The insurer needs these details to issue your policy.
            </p>
            <div className="ins-info-box">
              <ShieldCheck
                size={18}
                style={{ flexShrink: 0, marginTop: "2px" }}
              />
              <span>
                Your information is shared only with our licensed insurance
                partner to underwrite your policy.
              </span>
            </div>
          </div>
        </div>
      )}

      {/* STEP 4: REVIEW YOUR PLAN */}
      {step === 4 && (
        <div className="ins-two-col">
          <div className="ins-card">
            <h2 className="ins-card-title">Your cover</h2>

            <div>
              <div className="ins-kv-row">
                <span className="ins-kv-label">Plan</span>
                <span className="ins-kv-val">{selectedPlan.name}</span>
              </div>
              <div className="ins-kv-row">
                <span className="ins-kv-label">Device</span>
                <span className="ins-kv-val">
                  {selectedDevice.name} · {selectedDevice.statusLabel}
                </span>
              </div>
              <div className="ins-kv-row">
                <span className="ins-kv-label">Policyholder</span>
                <span className="ins-kv-val">
                  {policyholder.fullName || "Policyholder"}
                </span>
              </div>
              <div className="ins-kv-row">
                <span className="ins-kv-label">Billing</span>
                <span className="ins-kv-val" style={{ textTransform: "capitalize" }}>
                  {billingCycle}
                </span>
              </div>
              <div className="ins-kv-row">
                <span className="ins-kv-label">Cover starts</span>
                <span className="ins-kv-val">
                  {selectedDevice.status === "verified"
                    ? "Immediately after payment"
                    : "After verification"}
                </span>
              </div>
            </div>

            <label className="ins-checkbox-row">
              <input
                type="checkbox"
                checked={acceptedTerms}
                onChange={(e) => setAcceptedTerms(e.target.checked)}
              />
              <span>I have read the policy terms.</span>
              <Link href="/terms-conditions" className="ins-link-underlined">
                Read terms
              </Link>
            </label>

            <div className="ins-actions-row">
              <button
                type="button"
                className="ins-btn-outline"
                onClick={() => setStep(3)}
              >
                Back
              </button>
              <button
                type="button"
                className="ins-btn-primary"
                onClick={handleContinueToPayment}
              >
                Continue to payment
              </button>
            </div>
          </div>

          <div className="ins-card">
            <h2 className="ins-card-title">Premium</h2>

            <div>
              <div className="ins-kv-row">
                <span className="ins-kv-label">Premium</span>
                <span className="ins-kv-val">
                  ₦{activePrice}
                  {periodSuffix}
                </span>
              </div>
              <div className="ins-kv-row">
                <span className="ins-kv-due-label">Due now</span>
                <span className="ins-kv-due-val">₦{activePrice}</span>
              </div>
            </div>

            <div className="ins-info-box">
              <ShieldCheck
                size={18}
                style={{ flexShrink: 0, marginTop: "2px" }}
              />
              <span>
                You will pay securely on our payment partner&apos;s page.
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
