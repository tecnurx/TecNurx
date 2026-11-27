"use client";

import React, { use, useState, useEffect, useMemo, Suspense } from "react";
import "./pay-later.css";
import { Info, Lock, Check, Upload, X } from "lucide-react";
import { repairService } from "../../../../../../../services/repairs";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import Link from "next/link";
import TecNurxLoader from "@/components/TecNurxLoader";
import { toast } from "@/components/CustomToast";

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
  const [quoteData, setQuoteData] = useState(null);
  const [application, setApplication] = useState(null);
  const [loading, setLoading] = useState(true);
  const [checkingStatus, setCheckingStatus] = useState(false);

  // Form states
  const [agreedStart, setAgreedStart] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [moreInfoFile, setMoreInfoFile] = useState(null);

  // Part 2 Form states
  const [agreedOffer, setAgreedOffer] = useState(false);
  const [repaymentMethod, setRepaymentMethod] = useState("auto");
  const [agreedAccept, setAgreedAccept] = useState(false);
  const [isAccepting, setIsAccepting] = useState(false);

  // Lending partner name
  const lendingPartner = repair?.lendingPartner || "our partner";
  const paymentGateway = repair?.paymentGateway || "Bank78";

  useEffect(() => {
    if (stepParam) {
      setStep(stepParam === "identity" ? "start" : stepParam);
    } else if (getPathStep() === "identity") {
      setStep("start");
    }
  }, [stepParam, pathname]);

  useEffect(() => {
    const fetchPayLaterData = async () => {
      try {
        setLoading(true);
        if (repairId) {
          const [devRes, qRes, appRes] = await Promise.allSettled([
            repairService.getRepairDetails(repairId),
            repairService.getQuote(repairId),
            repairService.getPayLaterApplication(repairId),
          ]);

          if (devRes.status === "fulfilled") {
            const data = devRes.value?.data?.repair || devRes.value?.repair || devRes.value?.data;
            setRepair(data || null);
          }

          if (qRes.status === "fulfilled") {
            setQuoteData(qRes.value?.data || qRes.value || null);
          }

          if (appRes.status === "fulfilled") {
            const appData =
              appRes.value?.data?.application ||
              appRes.value?.application ||
              appRes.value?.data ||
              appRes.value;
            if (appData && appData.status) {
              setApplication(appData);
              const s = appData.status.toLowerCase();
              const currentPathStep = stepParam || getPathStep();
              if (currentPathStep === "start" || currentPathStep === "identity") {
                if (s === "pending") setStep("review");
                else if (s === "not_approved") setStep("result");
                else if (s === "approved") setStep("offer");
                else if (s === "more_info_needed") setStep("more-info");
              }
            }
          }
        }
      } catch (err) {
        console.warn("Could not fetch pay later data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchPayLaterData();
  }, [repairId]);

  const handleSubmitEligibility = async () => {
    try {
      setIsSubmitting(true);
      const res = await repairService.submitPayLaterEligibility(repairId);
      const appData =
        res?.data?.application || res?.application || res?.data || res;
      if (appData) {
        setApplication(appData);
      }
      const s = (appData?.status || "pending").toLowerCase();
      if (res?.resumed) {
        toast.info("Loaded your existing Pay Later request.");
      } else {
        toast.success("Pay Later availability request submitted.");
      }
      if (s === "not_approved") {
        setStep("result");
      } else if (s === "approved") {
        setStep("offer");
      } else if (s === "more_info_needed") {
        setStep("more-info");
      } else {
        setStep("review");
      }
    } catch (err) {
      toast.error(
        err?.response?.data?.message ||
          "Could not submit Pay Later check. You can still pay outright."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCheckApplicationStatus = async () => {
    try {
      setCheckingStatus(true);
      const res = await repairService.getPayLaterApplication(repairId);
      const appData =
        res?.data?.application || res?.application || res?.data || res;
      if (appData) {
        setApplication(appData);
        const s = (appData.status || "").toLowerCase();
        if (s === "not_approved") {
          setStep("result");
        } else if (s === "approved") {
          setStep("offer");
        } else if (s === "more_info_needed") {
          setStep("more-info");
        } else {
          toast.info("Your request is still pending review.");
        }
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || "Could not refresh status.");
    } finally {
      setCheckingStatus(false);
    }
  };

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
    [repair?.user?.fname, repair?.user?.lname].filter(Boolean).join(" ") ||
    repair?.customerName ||
    "Customer";
  const userPhone =
    repair?.user?.phoneNumber ||
    repair?.user?.phone ||
    repair?.contactNumber ||
    "—";
  const userEmail =
    repair?.user?.email ||
    repair?.customerEmail ||
    "—";

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

  // Offer calculations (derived from quote / application / repair)
  const repairTotalNum = Number(
    application?.amount ??
      quoteData?.balanceDue ??
      quoteData?.total ??
      repair?.quote?.total ??
      repair?.estimatedCost?.totalCost ??
      0
  );
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
  // SCREEN 4: RESULT - NOT APPROVED
  // ==========================================
  if (step === "result" || step === "not-approved") {
    const decisionReason =
      application?.decisionReason ||
      quoteData?.payLater?.reason ||
      "Repair Now, Pay Later isn't available yet.";
    return (
      <div className="pay-later-page">
        <div className="pay-later-header">
          <div className="pay-later-title-row">
            <h1 className="pay-later-title">Pay Later status</h1>
            <span className="pl-badge not-approved">
              <span className="pl-badge-dot">●</span>
              Not Available
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
            {decisionReason}
          </h2>
          <p className="rnpl-centered-desc">
            Your repair quote has not changed. You can pay in full now to get your repair started.
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
              href={`/dashboard/support?issue=rnpl_unavailable&repairId=${repairId}`}
              className="btn-rnpl-white"
            >
              Contact support
            </Link>
          </div>
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
  // SCREEN 3: PENDING / APPLICATION STATUS
  // ==========================================
  if (step === "review") {
    const submittedAtText = application?.submittedAt
      ? new Date(application.submittedAt).toLocaleString("en-US", {
          month: "short",
          day: "numeric",
          hour: "numeric",
          minute: "2-digit",
        })
      : "Just now";
    const decideAfterText = application?.decideAfter
      ? new Date(application.decideAfter).toLocaleString("en-US", {
          month: "short",
          day: "numeric",
          hour: "numeric",
          minute: "2-digit",
        })
      : "Shortly";

    return (
      <div className="pay-later-page">
        <div className="pay-later-header">
          <div className="pay-later-title-row">
            <h1 className="pay-later-title">Checking availability</h1>
            <span className="pl-badge more-info">
              <span className="pl-badge-dot">●</span>
              Pending
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
              <h2 className="rnpl-card-title">Request summary</h2>

              <div className="rnpl-review-table">
                <div className="rnpl-review-row">
                  <span className="rnpl-review-label">Name</span>
                  <span className="rnpl-review-value">{userName}</span>
                </div>
                <div className="rnpl-review-row">
                  <span className="rnpl-review-label">Email</span>
                  <span className="rnpl-review-value">{userEmail}</span>
                </div>
                <div className="rnpl-review-row">
                  <span className="rnpl-review-label">Amount</span>
                  <span className="rnpl-review-value">{formatNaira(repairTotalNum)}</span>
                </div>
                <div className="rnpl-review-row">
                  <span className="rnpl-review-label">Submitted</span>
                  <span className="rnpl-review-value">{submittedAtText}</span>
                </div>
                <div className="rnpl-review-row">
                  <span className="rnpl-review-label">Decision expected</span>
                  <span className="rnpl-review-value">{decideAfterText}</span>
                </div>
              </div>

              <div className="rnpl-actions-row" style={{ marginTop: "16px" }}>
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
                  disabled={checkingStatus}
                  onClick={handleCheckApplicationStatus}
                >
                  {checkingStatus ? "Checking..." : "Check status"}
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
                    <h3 className="rnpl-step-heading">Availability check</h3>
                    <p className="rnpl-step-desc">We are checking if Pay Later is available for this repair.</p>
                  </div>
                </div>

                <div className="rnpl-step-row">
                  <div className="rnpl-step-circle">2</div>
                  <div className="rnpl-step-content">
                    <h3 className="rnpl-step-heading">Email &amp; in-app update</h3>
                    <p className="rnpl-step-desc">We will email you as soon as an update is ready.</p>
                  </div>
                </div>

                <div className="rnpl-step-row">
                  <div className="rnpl-step-circle">3</div>
                  <div className="rnpl-step-content">
                    <h3 className="rnpl-step-heading">Pay outright anytime</h3>
                    <p className="rnpl-step-desc">
                      You can still pay in full at any time to start your repair immediately.
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
  // SCREEN 1: START (NO NIN/BVN CAPTURE)
  // ==========================================
  return (
    <div className="pay-later-page">
      <div className="pay-later-header">
        <h1 className="pay-later-title">Repair Now, Pay Later</h1>
        <p className="pay-later-subtitle">
          Check if Repair Now, Pay Later is available for this repair.
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
                  <h3 className="rnpl-step-heading">Submit an availability check</h3>
                  <p className="rnpl-step-desc">
                    No NIN, BVN, or extra identity documents are needed.
                  </p>
                </div>
              </div>

              <div className="rnpl-step-row">
                <div className="rnpl-step-circle">2</div>
                <div className="rnpl-step-content">
                  <h3 className="rnpl-step-heading">Wait for an update</h3>
                  <p className="rnpl-step-desc">
                    We check availability and notify you by email and here.
                  </p>
                </div>
              </div>

              <div className="rnpl-step-row">
                <div className="rnpl-step-circle">3</div>
                <div className="rnpl-step-content">
                  <h3 className="rnpl-step-heading">Pay outright anytime</h3>
                  <p className="rnpl-step-desc">
                    You can still pay in full at any time to start your repair immediately.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Card 2: Before you start */}
          <div className="rnpl-card">
            <h2 className="rnpl-card-title">Before you start</h2>
            <p className="rnpl-before-desc">
              We only check availability for Repair #{displayId} ({formatNaira(repairTotalNum)}). No identity documents are collected.
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
                I would like to check if Repair Now, Pay Later is available for this repair.
              </span>
            </label>

            <button
              type="button"
              className="btn-rnpl-primary"
              disabled={!agreedStart || isSubmitting}
              onClick={handleSubmitEligibility}
            >
              {isSubmitting ? "Submitting..." : "Check availability"}
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

        {/* Right Column: Info */}
        <div className="rnpl-right-col">
          <div className="rnpl-card rnpl-sidebar-card">
            <h2 className="rnpl-card-title">Availability check</h2>
            <p className="rnpl-sidebar-text">
              TecNurx manages your repair and lets you know if instalment plans are currently available for your order.
            </p>
            <div className="rnpl-info-notice">
              <Info size={16} className="info-icon" />
              <span>We do not ask for BVN, NIN, or ID uploads for this check.</span>
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
