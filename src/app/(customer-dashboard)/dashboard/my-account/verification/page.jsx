"use client";

import React from "react";
import "./verification.css";
import {
  User,
  Wrench,
  CreditCard,
  Shield,
  FileText,
  BadgeInfo,
} from "lucide-react";

export default function VerificationPage() {
  const verificationSteps = [
    {
      id: "account",
      icon: User,
      title: "Account",
      description: "Name, email or phone, and OTP",
      status: "Complete",
      statusType: "complete",
    },
    {
      id: "repairs",
      icon: Wrench,
      title: "Repairs",
      description: "Contact details, pickup address, device details and ownership confirmation",
      status: "Asked when you book",
      statusType: "neutral",
    },
    {
      id: "pay-later",
      icon: CreditCard,
      title: "Pay Later",
      description: "Identity and credit checks, only if you choose Pay Later. The lending partner sets the requirements.",
      status: "Not started",
      statusType: "neutral",
    },
    {
      id: "insurance",
      icon: Shield,
      title: "Insurance",
      description: "Policyholder and device details, plus checks the insurer requires",
      status: "Not started",
      statusType: "neutral",
    },
    {
      id: "claims",
      icon: FileText,
      title: "Claims",
      description: "Policy check, identity, ownership and evidence",
      status: "Asked when you claim",
      statusType: "neutral",
    },
  ];

  return (
    <div className="verification-page">
      {/* Header */}
      <div className="verification-header">
        <h1 className="verification-title">Verification</h1>
        <p className="verification-subtitle">We only ask for more when a service needs it.</p>
      </div>

      {/* 2-Column Grid */}
      <div className="verification-grid">
        {/* Left Column: Services */}
        <div className="verification-services-list">
          {verificationSteps.map((step) => {
            const Icon = step.icon;
            return (
              <div key={step.id} className="verification-service-card">
                <div className="verification-service-left">
                  <div className="verification-service-icon">
                    <Icon size={20} />
                  </div>
                  <div className="verification-service-info">
                    <h3>{step.title}</h3>
                    <p>{step.description}</p>
                  </div>
                </div>

                {step.statusType === "complete" ? (
                  <span className="pill-verification-complete">
                    <span className="dot">•</span> {step.status}
                  </span>
                ) : (
                  <span className="pill-verification-neutral">
                    <span className="dot">•</span> {step.status}
                  </span>
                )}
              </div>
            );
          })}
        </div>

        {/* Right Column: Information Cards */}
        <div className="verification-right-col">
          {/* Why We Ask */}
          <div className="verification-info-card">
            <h3>Why we ask</h3>
            <p>
              Each service has its own checks, so you only share what that service needs.
            </p>

            <div className="verification-notice-box">
              <BadgeInfo size={18} className="verification-notice-icon" />
              <div className="verification-notice-text">
                We do not ask for BVN or NIN for ordinary repairs.
              </div>
            </div>
          </div>

          {/* How We Use Your Documents */}
          <div className="verification-info-card">
            <h3>How we use your documents</h3>
            <p>
              We only share your submitted documentation with authorized underwriting and regulatory partners when strictly necessary to process your claims, financing, or coverage.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
