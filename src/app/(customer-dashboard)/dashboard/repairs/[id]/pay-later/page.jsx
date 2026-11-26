"use client";

import React, { use, useState, useEffect, useMemo, Suspense } from "react";
import "./pay-later.css";
import { Info, Lock, Check, Upload, X } from "lucide-react";
import { repairService } from "../../../../../../../services/repairs";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import Link from "next/link";
import TecNurxLoader from "@/components/TecNurxLoader";

function PayLaterContent({ params }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname() || "";
  const repairId = resolvedParams?.id || "";

  const getPathStep = () => {
    if (pathname.endsWith("/identity")) return "identity";
    if (pathname.endsWith("/review")) return "review";
    if (pathname.endsWith("/result")) return "result";
    if (pathname.endsWith("/more-information") || pathname.endsWith("/more-info")) return "more-info";
    if (pathname.endsWith("/offer")) return "offer";
    if (pathname.endsWith("/accept")) return "accept";
    if (pathname.endsWith("/confirmed")) return "confirmed";
    return "start";
  };

  // Step state: "start" | "identity" | "review" | "result" | "more-info" | "offer" | "accept" | "confirmed"
  const stepParam = searchParams?.get("step");
  const [step, setStep] = useState(stepParam || getPathStep());

  const [repair, setRepair] = useState(null);
  const [loading, setLoading] = useState(true);

  // Form states
  const [agreedStart, setAgreedStart] = useState(false);
  const [nin, setNin] = useState("");
  const [bvn, setBvn] = useState("");
  const [idFileName, setIdFileName] = useState("National_ID_Card.jpg");
  const [agreedReview, setAgreedReview] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [moreInfoFile, setMoreInfoFile] = useState(null);

  // Part 2 Form states
  const [agreedOffer, setAgreedOffer] = useState(false);
  const [repaymentMethod, setRepaymentMethod] = useState("auto");
  const [agreedAccept, setAgreedAccept] = useState(false);
  const [isAccepting, setIsAccepting] = useState(false);

  // Lending partner name
  const lendingPartner = repair?.lendingPartner || "CredPal";
  const paymentGateway = repair?.paymentGateway || "Bank78";

  useEffect(() => {
    if (stepParam) {
      setStep(stepParam);
    }
  }, [stepParam]);

  useEffect(() => {
    const fetchRepair = async () => {
      try {
        setLoading(true);
        if (repairId) {
          const res = await repairService.getRepairDetails(repairId);
          const data = res?.data?.repair || res?.repair || res?.data;
          setRepair(data);
        }
      } catch (err) {
        console.warn("Could not fetch repair details for pay later:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchRepair();
  }, [repairId]);

  const displayId =
    repairId.length > 8 ? repairId.slice(-8).toUpperCase() : repairId.toUpperCase();
  const deviceName =
    repair?.device?.name ||
    repair?.deviceName ||
    repair?.deviceModel ||
    "iPhone 13 Pro";

  // User details
  const userName =
    repair?.user?.name ||
    repair?.customerName ||
    "Tunde Oladipo";
  const userPhone =
    repair?.user?.phone ||
    repair?.contactNumber ||
    "+234 812 345 6789";
  const userEmail =
    repair?.user?.email ||
    repair?.customerEmail ||
    "tunde@example.com";

  // Masked NIN and BVN
  const maskedNin = useMemo(() => {
    if (!nin) return "•••• 5821";
    return `•••• ${nin.slice(-4)}`;
  }, [nin]);

  const maskedBvn = useMemo(() => {
    if (!bvn) return "•••• 9043";
    return `•••• ${bvn.slice(-4)}`;
  }, [bvn]);

  // Navigate to outright payment
  const handlePayOutright = () => {
    const isMyOrders =
      typeof window !== "undefined" &&
      window.location.pathname.includes("/my-orders/");
    const targetUrl = isMyOrders
      ? `/dashboard/my-orders/${repairId}/payment`
      : `/dashboard/repairs/${repairId}/payment`;
    router.push(targetUrl);
  };

  if (loading) {
    return <TecNurxLoader minHeight="65vh" size="lg" />;
  }

  // ==========================================
  // SHARED STEPPER BAR
  // ==========================================
  const rnplSteps = [
    "Quote approved",
    "Eligibility check",
    "Offer",
    "Accept",
    "Repay",
  ];

  const renderStepper = (activeIndex = 1) => (
    <div className="rnpl-stepper-bar">
      {rnplSteps.map((label, idx) => {
        let statusClass = "";
        if (idx < activeIndex) statusClass = "done";
        else if (idx === activeIndex) statusClass = "active";
        return (
          <div key={label} className={`rnpl-step-item ${statusClass}`}>
            <span className="rnpl-step-label">{label}</span>
          </div>
        );
      })}
    </div>
  );

  // Offer calculations (derived from repair quote or defaults)
  const repairTotalNum = Number(repair?.quote?.total ?? repair?.estimatedCost ?? 75000);
  const depositNum = Number(repair?.rnplOffer?.deposit ?? 0);
  const feesAndInterestNum = Number(repair?.rnplOffer?.fees ?? 0);
  const totalToRepayNum = repairTotalNum + feesAndInterestNum;
  const repaymentCount = Number(repair?.rnplOffer?.instalments ?? 3);
  const perRepaymentNum = Math.round((totalToRepayNum - depositNum) / repaymentCount);
  const firstPaymentDate = repair?.rnplOffer?.firstPaymentDate || "Dec 15, 2026";
  const formatNaira = (n) => `₦${Number(n || 0).toLocaleString()}`;

  // ==========================================
  // PART 2 - SCREEN 1: OFFER (media_1795529209914_4cf8ecf0.png)
  // ==========================================
  if (step === "offer") {
    return (
      <div className="pay-later-page">
        <div className="pay-later-header">
          <h1 className="pay-later-title">Repair Now, Pay Later</h1>
          <p className="pay-later-subtitle">
            Offers come from our licensed lending partner and depend on an eligibility check.
          </p>
        </div>

        {renderStepper(2)}

        <div className="pay-later-grid">
          {/* Left Column: Your offer */}
          <div className="rnpl-left-col">
            <div className="rnpl-card">
              <h2 className="rnpl-card-title">Your offer</h2>

              <div className="rnpl-offer-rows">
                <div className="rnpl-offer-row">
                  <span className="rnpl-offer-row-label">Repair total</span>
                  <span className="rnpl-offer-row-value">{formatNaira(repairTotalNum)}</span>
                </div>
                <div className="rnpl-offer-row">
                  <span className="rnpl-offer-row-label">Deposit</span>
                  <span className="rnpl-offer-row-value">{formatNaira(depositNum)}</span>
                </div>
                <div className="rnpl-offer-row">
                  <span className="rnpl-offer-row-label">Repayments</span>
                  <span className="rnpl-offer-row-value">
                    {repaymentCount} × {formatNaira(perRepaymentNum)}
                  </span>
                </div>
                <div className="rnpl-offer-row">
                  <span className="rnpl-offer-row-label">Fees and interest</span>
                  <span className="rnpl-offer-row-value">{formatNaira(feesAndInterestNum)}</span>
                </div>
                <div className="rnpl-offer-row">
                  <span className="rnpl-offer-row-label">First payment</span>
                  <span className="rnpl-offer-row-value">{firstPaymentDate}</span>
                </div>
              </div>

              <div className="rnpl-offer-total-row">
                <span className="rnpl-offer-total-label">Total to repay</span>
                <span className="rnpl-offer-total-value">{formatNaira(totalToRepayNum)}</span>
              </div>

              <p className="rnpl-terms-note">Terms provided by {lendingPartner}.</p>

              <label
                className="rnpl-checkbox-label"
                onClick={() => setAgreedOffer(!agreedOffer)}
              >
                <div className={`rnpl-custom-checkbox ${agreedOffer ? "checked" : ""}`}>
                  {agreedOffer && <Check size={13} strokeWidth={3} />}
                </div>
                <span>I have read and accept the offer and repayment terms</span>
              </label>

              <div className="rnpl-actions-row">
                <button
                  type="button"
                  className="btn-rnpl-white"
                  onClick={handlePayOutright}
                >
                  Pay in full instead
                </button>
                <button
                  type="button"
                  className="btn-rnpl-primary"
                  disabled={!agreedOffer}
                  onClick={() => setStep("accept")}
                >
                  Accept offer
                </button>
              </div>
            </div>
          </div>

          {/* Right Column: Repayment tracker & Questions */}
          <div className="rnpl-right-col">
            <div className="rnpl-card">
              <h2 className="rnpl-card-title">Repayment tracker</h2>
              <p className="rnpl-tracker-subtitle">Shown after you accept the offer.</p>

              <div className="rnpl-tracker-list">
                <div className="rnpl-tracker-item">
                  <div className="rnpl-tracker-left">
                    <span className="rnpl-tracker-date">Payment 1 · {firstPaymentDate}</span>
                    <span className="rnpl-tracker-amount">{formatNaira(perRepaymentNum)}</span>
                  </div>
                  <span className="rnpl-status-pill paid">
                    <span className="dot">●</span>
                    Paid
                  </span>
                </div>

                <div className="rnpl-tracker-item">
                  <div className="rnpl-tracker-left">
                    <span className="rnpl-tracker-date">Payment 2 · Jan 15, 2027</span>
                    <span className="rnpl-tracker-amount">{formatNaira(perRepaymentNum)}</span>
                  </div>
                  <span className="rnpl-status-pill due-soon">
                    <span className="dot">●</span>
                    Due soon
                  </span>
                </div>

                <div className="rnpl-tracker-item">
                  <div className="rnpl-tracker-left">
                    <span className="rnpl-tracker-date">Payment 3 · Feb 15, 2027</span>
                    <span className="rnpl-tracker-amount">{formatNaira(perRepaymentNum)}</span>
                  </div>
                  <span className="rnpl-status-pill upcoming">
                    <span className="dot">●</span>
                    Upcoming
                  </span>
                </div>
              </div>
            </div>

            <div className="rnpl-card">
              <h2 className="rnpl-card-title" style={{ marginBottom: "8px" }}>
                Questions about this offer?
              </h2>
              <p className="rnpl-sidebar-text" style={{ marginBottom: "18px" }}>
                Our team can explain the terms before you decide.
              </p>
              <Link
                href={`/dashboard/support?issue=rnpl_offer&repairId=${repairId}`}
                className="btn-rnpl-white"
                style={{ width: "100%", boxSizing: "border-box" }}
              >
                Contact support
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // PART 2 - SCREEN 2: ACCEPT (media_1795529224214_97296065.jpg)
  // ==========================================
  if (step === "accept") {
    return (
      <div className="pay-later-page">
        <div className="pay-later-header">
          <h1 className="pay-later-title">Accept your offer</h1>
          <p className="pay-later-subtitle">
            Review the repayments and confirm.
          </p>
        </div>

        {renderStepper(3)}

        <div className="pay-later-grid">
          {/* Left Column */}
          <div className="rnpl-left-col">
            <div className="rnpl-card">
              <h2 className="rnpl-card-title">Your offer</h2>

              <div className="rnpl-offer-rows">
                <div className="rnpl-offer-row">
                  <span className="rnpl-offer-row-label">Repair total</span>
                  <span className="rnpl-offer-row-value">{formatNaira(repairTotalNum)}</span>
                </div>
                <div className="rnpl-offer-row">
                  <span className="rnpl-offer-row-label">Deposit</span>
                  <span className="rnpl-offer-row-value">{formatNaira(depositNum)}</span>
                </div>
                <div className="rnpl-offer-row">
                  <span className="rnpl-offer-row-label">Repayments</span>
                  <span className="rnpl-offer-row-value">
                    {repaymentCount} × {formatNaira(perRepaymentNum)}
                  </span>
                </div>
                <div className="rnpl-offer-row" style={{ borderBottom: "none", paddingBottom: 0 }}>
                  <span className="rnpl-offer-row-label">First payment</span>
                  <span className="rnpl-offer-row-value">{firstPaymentDate}</span>
                </div>
              </div>

              <h3 className="rnpl-radio-section-title">How would you like to repay?</h3>
              <div className="rnpl-radio-group">
                <button
                  type="button"
                  className={`rnpl-radio-card ${repaymentMethod === "auto" ? "selected" : ""}`}
                  onClick={() => setRepaymentMethod("auto")}
                >
                  <span className="rnpl-radio-circle" />
                  <div>
                    <div className="rnpl-radio-title">Automatic repayments</div>
                    <p className="rnpl-radio-desc">
                      Set up on our payment partner’s secure page.
                    </p>
                  </div>
                </button>

                <button
                  type="button"
                  className={`rnpl-radio-card ${repaymentMethod === "manual" ? "selected" : ""}`}
                  onClick={() => setRepaymentMethod("manual")}
                >
                  <span className="rnpl-radio-circle" />
                  <div>
                    <div className="rnpl-radio-title">I will pay each instalment myself</div>
                    <p className="rnpl-radio-desc">
                      You get a reminder before each due date.
                    </p>
                  </div>
                </button>
              </div>

              <label
                className="rnpl-checkbox-label"
                onClick={() => setAgreedAccept(!agreedAccept)}
              >
                <div className={`rnpl-custom-checkbox ${agreedAccept ? "checked" : ""}`}>
                  {agreedAccept && <Check size={13} strokeWidth={3} />}
                </div>
                <span>
                  I accept the agreement from {lendingPartner}.
                  <a
                    href="#agreement"
                    className="rnpl-agreement-link"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                    }}
                  >
                    Read agreement
                  </a>
                </span>
              </label>

              <div className="rnpl-actions-row">
                <button
                  type="button"
                  className="btn-rnpl-white"
                  onClick={() => setStep("offer")}
                >
                  Back
                </button>
                <button
                  type="button"
                  className="btn-rnpl-primary"
                  disabled={!agreedAccept || isAccepting}
                  onClick={() => {
                    setIsAccepting(true);
                    setTimeout(() => {
                      setIsAccepting(false);
                      setStep("confirmed");
                    }, 900);
                  }}
                >
                  {isAccepting ? "Confirming..." : "Accept and continue"}
                </button>
              </div>
            </div>
          </div>

          {/* Right Column: What happens next */}
          <div className="rnpl-right-col">
            <div className="rnpl-card rnpl-sidebar-card">
              <h2 className="rnpl-card-title">What happens next</h2>
              <div className="rnpl-steps-list" style={{ marginBottom: "20px" }}>
                <div className="rnpl-step-row">
                  <div className="rnpl-step-num">1</div>
                  <div>
                    <h3 className="rnpl-step-title">Pay the deposit (if any)</h3>
                    <p className="rnpl-step-desc">You may go to {paymentGateway}.</p>
                  </div>
                </div>
                <div className="rnpl-step-row">
                  <div className="rnpl-step-num">2</div>
                  <div>
                    <h3 className="rnpl-step-title">Set up repayments</h3>
                    <p className="rnpl-step-desc">On our payment partner’s secure page.</p>
                  </div>
                </div>
                <div className="rnpl-step-row">
                  <div className="rnpl-step-num">3</div>
                  <div>
                    <h3 className="rnpl-step-title">Your repair starts</h3>
                    <p className="rnpl-step-desc">We keep you updated.</p>
                  </div>
                </div>
              </div>

              <div className="rnpl-info-notice">
                <Lock size={15} className="info-icon" />
                <span>We never see or store your card details.</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // PART 2 - SCREEN 3: CONFIRMED (media_1795529254401_eb053585.png)
  // ==========================================
  if (step === "confirmed") {
    const isMyOrders =
      typeof window !== "undefined" &&
      window.location.pathname.includes("/my-orders/");
    const backRepairHref = isMyOrders
      ? `/dashboard/my-orders/${repairId}`
      : `/dashboard/repairs/${repairId}`;

    return (
      <div className="pay-later-page">
        <div className="pay-later-header">
          <h1 className="pay-later-title">Pay Later confirmed</h1>
          <p className="pay-later-subtitle">
            Repair #{displayId} · {deviceName}
          </p>
        </div>

        {renderStepper(4)}

        <div className="rnpl-centered-card">
          <div className="rnpl-confirmed-badge">
            <Check size={30} strokeWidth={2.5} />
          </div>
          <h2 className="rnpl-centered-title">Your repair starts now</h2>
          <p className="rnpl-centered-desc" style={{ marginBottom: "8px" }}>
            Your Pay Later plan is active.
          </p>

          <div className="rnpl-confirmed-summary">
            <div className="rnpl-confirmed-row">
              <span className="rnpl-confirmed-label">First repayment</span>
              <span className="rnpl-confirmed-val">{firstPaymentDate}</span>
            </div>
            <div className="rnpl-confirmed-row">
              <span className="rnpl-confirmed-label">Amount</span>
              <span className="rnpl-confirmed-val">{formatNaira(perRepaymentNum)}</span>
            </div>
            <div className="rnpl-confirmed-row">
              <span className="rnpl-confirmed-label">Repayments</span>
              <span className="rnpl-confirmed-val">{repaymentCount}</span>
            </div>
          </div>

          <div className="rnpl-centered-actions" style={{ marginBottom: 0 }}>
            <Link
              href={`/dashboard/payments/repayment-plan?repairId=${repairId}`}
              className="btn-rnpl-primary"
              style={{ width: "auto", padding: "12px 30px", textDecoration: "none" }}
            >
              View repayment plan
            </Link>
            <Link href={backRepairHref} className="btn-rnpl-white">
              Back to repair
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // SCREEN 4: RESULT - NOT APPROVED (media_1795527822990_25d41116.png)
  // ==========================================
  if (step === "result" || step === "not-approved") {
    return (
      <div className="pay-later-page">
        <div className="pay-later-header">
          <div className="pay-later-title-row">
            <h1 className="pay-later-title">Pay Later result</h1>
            <span className="pl-badge not-approved">
              <span className="pl-badge-dot">●</span>
              Not Approved
            </span>
          </div>
          <p className="pay-later-subtitle">
            Repair #{displayId} · {deviceName}
          </p>
        </div>

        {renderStepper()}

        <div className="rnpl-centered-card">
          <div className="rnpl-centered-icon">
            <Info size={32} />
          </div>
          <h2 className="rnpl-centered-title">
            We could not offer Pay Later this time
          </h2>
          <p className="rnpl-centered-desc">
            This is the lender’s decision. Your repair quote has not changed.
          </p>

          <div className="rnpl-centered-actions">
            <button
              type="button"
              className="btn-rnpl-primary"
              style={{ width: "auto", padding: "12px 32px" }}
              onClick={handlePayOutright}
            >
              Pay outright
            </button>
            <Link
              href={`/dashboard/support?issue=rnpl_rejected&repairId=${repairId}`}
              className="btn-rnpl-white"
            >
              Contact support
            </Link>
          </div>

          <p className="rnpl-centered-reason">
            [Credit evaluation by {lendingPartner} did not meet criteria for this order value]
          </p>
        </div>
      </div>
    );
  }

  // ==========================================
  // SCREEN 5: MORE INFORMATION NEEDED (media_1795527855083_126f9c71.png)
  // ==========================================
  if (step === "more-info" || step === "more-information") {
    return (
      <div className="pay-later-page">
        <div className="pay-later-header">
          <div className="pay-later-title-row">
            <h1 className="pay-later-title">More information needed</h1>
            <span className="pl-badge more-info">
              <span className="pl-badge-dot">●</span>
              More Information Needed
            </span>
          </div>
          <p className="pay-later-subtitle">
            Repair #{displayId} · {deviceName}
          </p>
        </div>

        {renderStepper()}

        <div className="pay-later-grid">
          {/* Left Column */}
          <div className="rnpl-left-col">
            <div className="rnpl-card">
              <h2 className="rnpl-card-title">
                {lendingPartner} needs one more thing
              </h2>
              <p className="rnpl-before-desc">
                Please provide: Recent 3-month bank statement (PDF) or proof of address
              </p>

              <label className="rnpl-upload-box">
                <input
                  type="file"
                  accept=".jpg,.jpeg,.png,.pdf"
                  style={{ display: "none" }}
                  onChange={(e) => setMoreInfoFile(e.target.files?.[0]?.name)}
                />
                <span className="rnpl-upload-icon">↑</span>
                <span className="rnpl-upload-title">
                  {moreInfoFile || "Upload a document or photo"}
                </span>
                <span className="rnpl-upload-sub">JPG, PNG or PDF</span>
              </label>

              <button
                type="button"
                className="btn-rnpl-primary"
                onClick={() => setStep("review")}
              >
                Send to lender
              </button>
            </div>
          </div>

          {/* Right Column */}
          <div className="rnpl-right-col">
            <div className="rnpl-card rnpl-sidebar-card">
              <h2 className="rnpl-card-title">Need help?</h2>
              <p className="rnpl-sidebar-text">
                We can explain what is being asked.
              </p>
              <Link
                href={`/dashboard/support?issue=rnpl_more_info&repairId=${repairId}`}
                className="btn-rnpl-white"
                style={{ width: "100%", textAlign: "center" }}
              >
                Contact support
              </Link>
              <button
                type="button"
                className="link-rnpl-outright"
                style={{ background: "transparent", border: "none" }}
                onClick={handlePayOutright}
              >
                Pay outright instead
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // SCREEN 3: REVIEW YOUR APPLICATION (media_1795527754667_b52c4e8f.png)
  // ==========================================
  if (step === "review") {
    return (
      <div className="pay-later-page">
        <div className="pay-later-header">
          <h1 className="pay-later-title">Review your application</h1>
          <p className="pay-later-subtitle">Step 3 of 3</p>
        </div>

        {renderStepper()}

        <div className="pay-later-grid">
          {/* Left Column */}
          <div className="rnpl-left-col">
            <div className="rnpl-card">
              <h2 className="rnpl-card-title">Your details</h2>

              <div className="rnpl-review-table">
                <div className="rnpl-review-row">
                  <span className="rnpl-review-label">Name</span>
                  <span className="rnpl-review-value">{userName}</span>
                </div>
                <div className="rnpl-review-row">
                  <span className="rnpl-review-label">Phone</span>
                  <span className="rnpl-review-value">{userPhone}</span>
                </div>
                <div className="rnpl-review-row">
                  <span className="rnpl-review-label">Email</span>
                  <span className="rnpl-review-value">{userEmail}</span>
                </div>
                <div className="rnpl-review-row">
                  <span className="rnpl-review-label">NIN</span>
                  <span className="rnpl-review-value">{maskedNin}</span>
                </div>
                <div className="rnpl-review-row">
                  <span className="rnpl-review-label">BVN</span>
                  <span className="rnpl-review-value">{maskedBvn}</span>
                </div>
                <div className="rnpl-review-row">
                  <span className="rnpl-review-label">ID document</span>
                  <span className="rnpl-uploaded-badge">
                    <span className="dot">●</span>
                    Uploaded
                  </span>
                </div>
              </div>

              {/* Agreement checkbox */}
              <label
                className="rnpl-checkbox-label"
                onClick={() => setAgreedReview(!agreedReview)}
              >
                <div
                  className={`rnpl-custom-checkbox ${
                    agreedReview ? "checked" : ""
                  }`}
                >
                  {agreedReview && <Check size={13} strokeWidth={3} />}
                </div>
                <span>
                  I confirm these details are correct and agree to share them with{" "}
                  {lendingPartner}.
                </span>
              </label>

              {/* Action Buttons */}
              <div className="rnpl-actions-row">
                <button
                  type="button"
                  className="btn-rnpl-white"
                  onClick={() => setStep("identity")}
                >
                  Back
                </button>
                <button
                  type="button"
                  className="btn-rnpl-primary"
                  disabled={!agreedReview || isSubmitting}
                  onClick={() => {
                    setIsSubmitting(true);
                    setTimeout(() => {
                      setIsSubmitting(false);
                      // Move to result or more info for demo
                      setStep("result");
                    }, 800);
                  }}
                >
                  {isSubmitting ? "Submitting..." : "Submit application"}
                </button>
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="rnpl-right-col">
            <div className="rnpl-card rnpl-sidebar-card">
              <h2 className="rnpl-card-title">What happens next</h2>
              <div className="rnpl-steps-list">
                <div className="rnpl-step-row">
                  <div className="rnpl-step-circle">1</div>
                  <div className="rnpl-step-content">
                    <h3 className="rnpl-step-heading">
                      We send it to {lendingPartner}
                    </h3>
                    <p className="rnpl-step-desc">Securely.</p>
                  </div>
                </div>

                <div className="rnpl-step-row">
                  <div className="rnpl-step-circle">2</div>
                  <div className="rnpl-step-content">
                    <h3 className="rnpl-step-heading">They review it</h3>
                    <p className="rnpl-step-desc">This can take a few minutes.</p>
                  </div>
                </div>

                <div className="rnpl-step-row">
                  <div className="rnpl-step-circle">3</div>
                  <div className="rnpl-step-content">
                    <h3 className="rnpl-step-heading">You get a result here</h3>
                    <p className="rnpl-step-desc">
                      Approved, more information needed, or not approved.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // SCREEN 2: YOUR IDENTITY (media_1795527741383_a8cf8e63.jpg)
  // ==========================================
  if (step === "identity") {
    return (
      <div className="pay-later-page">
        <div className="pay-later-header">
          <h1 className="pay-later-title">Your identity</h1>
          <p className="pay-later-subtitle">
            Step 2 of 3 · Needed by {lendingPartner} to check your eligibility.
          </p>
        </div>

        {renderStepper()}

        <div className="pay-later-grid">
          {/* Left Column */}
          <div className="rnpl-left-col">
            <div className="rnpl-card">
              <div className="rnpl-form-group">
                <label className="rnpl-input-label" htmlFor="nin-input">
                  NIN
                </label>
                <input
                  id="nin-input"
                  type="text"
                  maxLength={11}
                  className="rnpl-text-input"
                  placeholder="[11-digit NIN]"
                  value={nin}
                  onChange={(e) => setNin(e.target.value)}
                />
              </div>

              <div className="rnpl-form-group">
                <label className="rnpl-input-label" htmlFor="bvn-input">
                  BVN
                </label>
                <input
                  id="bvn-input"
                  type="text"
                  maxLength={11}
                  className="rnpl-text-input"
                  placeholder="[11-digit BVN]"
                  value={bvn}
                  onChange={(e) => setBvn(e.target.value)}
                />
              </div>

              {/* Identity Document Upload */}
              <div className="rnpl-form-group">
                <label className="rnpl-input-label">Identity document</label>
                <label className="rnpl-upload-box">
                  <input
                    type="file"
                    accept="image/*,.pdf"
                    style={{ display: "none" }}
                    onChange={(e) => setIdFileName(e.target.files?.[0]?.name || "Uploaded ID")}
                  />
                  <span className="rnpl-upload-icon">↑</span>
                  <span className="rnpl-upload-title">Upload your ID</span>
                  <span className="rnpl-upload-sub">
                    [National ID, Driver’s License, International Passport or Voter’s Card]
                  </span>
                </label>
              </div>

              {/* Consent Notice */}
              <div className="rnpl-security-box">
                <Lock size={15} className="rnpl-lock-icon" />
                <span>
                  Your identity details are encrypted and securely validated with licensed verification providers.
                </span>
              </div>

              {/* Action Buttons */}
              <div className="rnpl-actions-row">
                <button
                  type="button"
                  className="btn-rnpl-white"
                  onClick={() => setStep("start")}
                >
                  Back
                </button>
                <button
                  type="button"
                  className="btn-rnpl-primary"
                  onClick={() => setStep("review")}
                >
                  Continue
                </button>
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="rnpl-right-col">
            <div className="rnpl-card rnpl-sidebar-card">
              <h2 className="rnpl-card-title">Why we ask</h2>
              <p className="rnpl-sidebar-text">
                Pay Later needs more checks than a normal repair. We only ask for
                these when you choose it.
              </p>
              <div className="rnpl-info-notice">
                <Info size={16} className="info-icon" />
                <span>We do not ask for BVN or NIN for ordinary repairs.</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // SCREEN 1: START (media_1795527729198_cb9cd45d.jpg)
  // ==========================================
  return (
    <div className="pay-later-page">
      <div className="pay-later-header">
        <h1 className="pay-later-title">Repair Now, Pay Later</h1>
        <p className="pay-later-subtitle">
          Check if you can spread the cost of this repair.
        </p>
      </div>

      {renderStepper()}

      <div className="pay-later-grid">
        {/* Left Column */}
        <div className="rnpl-left-col">
          {/* Card 1: How it works */}
          <div className="rnpl-card">
            <h2 className="rnpl-card-title">How it works</h2>
            <div className="rnpl-steps-list">
              <div className="rnpl-step-row">
                <div className="rnpl-step-circle">1</div>
                <div className="rnpl-step-content">
                  <h3 className="rnpl-step-heading">Tell us a bit more</h3>
                  <p className="rnpl-step-desc">
                    Identity details so {lendingPartner} can check your
                    eligibility.
                  </p>
                </div>
              </div>

              <div className="rnpl-step-row">
                <div className="rnpl-step-circle">2</div>
                <div className="rnpl-step-content">
                  <h3 className="rnpl-step-heading">Wait for a decision</h3>
                  <p className="rnpl-step-desc">
                    Not instant. We tell you as soon as {lendingPartner} replies.
                  </p>
                </div>
              </div>

              <div className="rnpl-step-row">
                <div className="rnpl-step-circle">3</div>
                <div className="rnpl-step-content">
                  <h3 className="rnpl-step-heading">See your offer</h3>
                  <p className="rnpl-step-desc">
                    Terms are shown before you decide.
                  </p>
                </div>
              </div>

              <div className="rnpl-step-row">
                <div className="rnpl-step-circle">4</div>
                <div className="rnpl-step-content">
                  <h3 className="rnpl-step-heading">Accept and repay</h3>
                  <p className="rnpl-step-desc">
                    Your repair starts after you accept.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Card 2: Before you start */}
          <div className="rnpl-card">
            <h2 className="rnpl-card-title">Before you start</h2>
            <p className="rnpl-before-desc">
              [You will need your BVN, NIN, and a valid government-issued ID card]
            </p>

            <label
              className="rnpl-checkbox-label"
              onClick={() => setAgreedStart(!agreedStart)}
            >
              <div
                className={`rnpl-custom-checkbox ${
                  agreedStart ? "checked" : ""
                }`}
              >
                {agreedStart && <Check size={13} strokeWidth={3} />}
              </div>
              <span>
                I agree to share my details with {lendingPartner} to check my
                eligibility.
              </span>
            </label>

            <button
              type="button"
              className="btn-rnpl-primary"
              disabled={!agreedStart}
              onClick={() => setStep("identity")}
            >
              Check my eligibility
            </button>

            <button
              type="button"
              className="link-rnpl-outright"
              style={{ background: "transparent", border: "none", width: "100%" }}
              onClick={handlePayOutright}
            >
              Pay outright instead
            </button>
          </div>
        </div>

        {/* Right Column: Provided by */}
        <div className="rnpl-right-col">
          <div className="rnpl-card rnpl-sidebar-card">
            <h2 className="rnpl-card-title">Provided by {lendingPartner}</h2>
            <p className="rnpl-sidebar-text">
              Pay Later is provided by a licensed lender. TecNurx manages your
              repair and tracks your payments.
            </p>
            <div className="rnpl-info-notice">
              <Info size={16} className="info-icon" />
              <span>If you have already been verified, we skip repeat checks.</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PayLaterPage({ params }) {
  return (
    <Suspense fallback={<TecNurxLoader minHeight="65vh" size="lg" />}>
      <PayLaterContent params={params} />
    </Suspense>
  );
}
