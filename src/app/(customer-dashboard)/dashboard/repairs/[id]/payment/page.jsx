"use client";

import React, { use, useState, useEffect, useMemo, Suspense } from "react";
import "./payment.css";
import { Check, Lock, ArrowLeft, Download, ShieldCheck, AlertTriangle } from "lucide-react";
import { repairService } from "../../../../../../../services/repairs";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import TecNurxLoader from "@/components/TecNurxLoader";
import PrintableReceipt from "@/components/PrintableReceipt";
import { toast } from "@/components/CustomToast";

// Helpers
const formatCost = (val) => {
  if (val === undefined || val === null || isNaN(Number(val))) return "0";
  return Number(val).toLocaleString();
};

const formatDeliveryFee = (val) => {
  if (val === undefined || val === null || val === 0 || val === "0") return "Free";
  if (typeof val === "number" || !isNaN(Number(val))) {
    return `₦${Number(val).toLocaleString()}`;
  }
  return String(val);
};

function RepairPaymentContent({ params }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const searchParams = useSearchParams();
  const repairId = resolvedParams?.id || "";

  const [repair, setRepair] = useState(null);
  const [quoteData, setQuoteData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const statusParam = searchParams?.get("status");
  const [isPaymentFailed, setIsPaymentFailed] = useState(
    statusParam === "failed" ||
      statusParam === "cancelled" ||
      statusParam === "not-completed"
  );
  const [isPaidSuccess, setIsPaidSuccess] = useState(
    searchParams?.get("status") === "success" ||
      searchParams?.get("payment") === "success"
  );
  const [paymentReference, setPaymentReference] = useState("");
  const [paymentDate, setPaymentDate] = useState("");

  // Payment gateway name (e.g. Bank78)
  const paymentGateway = repair?.paymentGateway || "Bank78";

  useEffect(() => {
    const fetchRepair = async () => {
      try {
        setLoading(true);
        if (repairId) {
          const [repairRes, quoteRes, statusRes] = await Promise.allSettled([
            repairService.getRepairDetails(repairId),
            repairService.getQuote(repairId),
            repairService.getPaymentStatus(repairId, "repair_cost"),
          ]);

          if (repairRes.status === "fulfilled") {
            const data =
              repairRes.value?.data?.repair ||
              repairRes.value?.repair ||
              repairRes.value?.data;
            setRepair(data);
            if (
              data?.paymentStatus === "paid" ||
              data?.status === "repair_in_progress" ||
              data?.status === "in_progress"
            ) {
              setIsPaidSuccess(true);
            }
          }

          if (quoteRes.status === "fulfilled") {
            const qData = quoteRes.value?.data || quoteRes.value;
            setQuoteData(qData);
          }

          if (statusRes.status === "fulfilled") {
            const sData = statusRes.value?.data || statusRes.value;
            if (sData?.paymentStatus === "completed") {
              setIsPaidSuccess(true);
            } else if (sData?.paymentStatus === "failed" || sData?.canRetry) {
              setIsPaymentFailed(true);
            }
            if (sData?.reference) {
              setPaymentReference(sData.reference);
            }
          }
        }
      } catch (err) {
        console.warn("Could not fetch repair details for payment:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchRepair();
  }, [repairId]);

  // Set default reference and date
  useEffect(() => {
    const now = new Date();
    const formattedDate = now.toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
    setPaymentDate(formattedDate);

    const ref =
      repair?.paymentReference ||
      `TX-${Math.floor(10000000 + Math.random() * 90000000)}`;
    setPaymentReference(ref);
  }, [repair]);

  // Costs calculation (prefer GET /repairs/:id/quote balanceDue & breakdown)
  const breakdownParts = quoteData?.breakdown?.find((b) => b.key === "parts")?.amount;
  const breakdownLabour = quoteData?.breakdown?.find((b) => b.key === "labour")?.amount;
  const breakdownReturn = quoteData?.breakdown?.find(
    (b) => b.key === "return_delivery" || b.key === "return"
  )?.amount;

  const partsCost = breakdownParts ?? repair?.quote?.parts ?? repair?.estimatedCost?.partsCost ?? 0;
  const laborCost = breakdownLabour ?? repair?.quote?.labour ?? repair?.estimatedCost?.laborCost ?? 0;
  const returnDeliveryCost =
    breakdownReturn ??
    (typeof repair?.returnDeliveryFee === "number"
      ? repair.returnDeliveryFee
      : typeof repair?.deliveryFee === "number"
      ? repair.deliveryFee
      : 0);

  const totalCost =
    quoteData?.balanceDue ??
    quoteData?.total ??
    repair?.quote?.total ??
    repair?.estimatedCost?.totalCost ??
    (partsCost + laborCost + (returnDeliveryCost || 0));

  // Handle proceed to payment
  const handleProceedPayment = async () => {
    setIsProcessing(true);
    try {
      const res = await repairService.initiateRepairPayment(repairId);
      const data = res?.data || res;
      if (data?.paymentLink) {
        window.location.href = data.paymentLink;
        return;
      }
      if (repair?.paymentLink) {
        window.location.href = repair.paymentLink;
        return;
      }

      setIsProcessing(false);
      setIsPaidSuccess(true);
    } catch (err) {
      console.error("Payment initiation failed:", err);
      toast.error(err?.response?.data?.message || "Payment initiation failed.");
      setIsProcessing(false);
    }
  };

  // Handle receipt download / print
  const handleDownloadReceipt = () => {
    window.print();
  };

  if (loading) {
    return <TecNurxLoader minHeight="65vh" size="lg" />;
  }

  // ==========================================
  // SCREEN 3: PAYMENT NOT COMPLETED (media_1795526834350_5c4df3d1.png)
  // ==========================================
  if (isPaymentFailed) {
    return (
      <div className="repair-payment-page">
        <div className="payment-page-header">
          <h1 className="payment-page-title">Payment not completed</h1>
          <p className="payment-page-subtitle">
            Your booking is not confirmed yet.
          </p>
        </div>

        <div className="payment-success-card payment-failed-card">
          <div className="payment-warning-badge">
            <AlertTriangle
              size={36}
              strokeWidth={2.4}
              className="payment-warning-icon"
            />
          </div>

          <h2 className="payment-success-title">Payment not completed</h2>
          <p
            className="payment-success-subtitle"
            style={{ maxWidth: "520px", marginBottom: "16px" }}
          >
            The payment was cancelled or did not go through. If you were debited,
            contact support with your reference.
          </p>

          <p className="payment-failed-ref">Reference: {paymentReference}</p>

          <div
            className="payment-success-actions"
            style={{ marginBottom: "24px" }}
          >
            <button
              type="button"
              className="btn-back-to-repair"
              onClick={() => setIsPaymentFailed(false)}
            >
              Try again
            </button>
            <Link
              href={`/dashboard/support?issue=payment_not_completed&ref=${paymentReference}`}
              className="btn-download-receipt"
            >
              Contact support
            </Link>
          </div>

          <Link
            href={`/dashboard/repairs/${repairId}/quote`}
            className="payment-back-review-link"
          >
            Back to review
          </Link>
        </div>
      </div>
    );
  }

  // ==========================================
  // SCREEN 2: PAYMENT SUCCESSFUL (media_1795526654428_b5c23428.png)
  // ==========================================
  if (isPaidSuccess) {
    return (
      <div className="repair-payment-page">
        <div className="tnx-screen-only">
          <div className="payment-success-card">
            {/* Yellow Check Icon Badge */}
            <div className="payment-success-badge">
              <Check size={38} strokeWidth={3} className="payment-check-icon" />
            </div>

            <h1 className="payment-success-title">Payment successful</h1>
            <p className="payment-success-subtitle">
              ₦{formatCost(totalCost)} paid. Your repair starts now.
            </p>

            {/* Receipt Details Box */}
            <div className="payment-receipt-box">
              <div className="receipt-row">
                <span className="receipt-label">Reference</span>
                <span className="receipt-value">{paymentReference}</span>
              </div>

              <div className="receipt-row">
                <span className="receipt-label">Date</span>
                <span className="receipt-value">{paymentDate}</span>
              </div>

              <div className="receipt-row">
                <span className="receipt-label">Paid through</span>
                <span className="receipt-value">{paymentGateway}</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="payment-success-actions">
              <button
                type="button"
                className="btn-download-receipt"
                onClick={handleDownloadReceipt}
              >
                Download receipt
              </button>
              <Link
                href={`/dashboard/repairs/${repairId}`}
                className="btn-back-to-repair"
              >
                Back to repair
              </Link>
            </div>
          </div>
        </div>

        <PrintableReceipt
          title="Repair Payment Receipt"
          reference={paymentReference}
          date={paymentDate}
          status="Paid"
          totalAmount={totalCost}
          leftDetails={[
            { label: "Repair ID", value: `#${String(repairId).slice(-8).toUpperCase()}` },
            {
              label: "Device",
              value: repair?.device
                ? `${repair.device.brand || ""} ${repair.device.model || ""}`.trim()
                : "Device",
            },
            {
              label: "Issue",
              value: repair?.issueCategory
                ? repair.issueCategory.replace(/_/g, " ")
                : "Repair Service",
            },
          ]}
          rightDetails={[
            { label: "Reference", value: paymentReference },
            { label: "Paid Through", value: paymentGateway },
            { label: "Payment Date", value: paymentDate },
          ]}
          lineItems={[{ label: "Approved Repair Payment", amount: totalCost }]}
        />
      </div>
    );
  }

  // ==========================================
  // SCREEN 1: PAY FOR YOUR REPAIR (media_1795526645499_ae9c63c6.jpg)
  // ==========================================
  return (
    <div className="repair-payment-page">
      {/* Top Header */}
      <div className="payment-page-header">
        <div className="payment-header-text">
          <h1 className="payment-page-title">Pay for your repair</h1>
          <p className="payment-page-subtitle">
            You approved the quote. Complete payment to start the repair.
          </p>
        </div>
      </div>

      {/* Main 2-Column Grid */}
      <div className="payment-page-grid">
        {/* Left Column: Repair Cost Card */}
        <div className="payment-left-col">
          <div className="payment-card">
            <h2 className="payment-card-title">Repair cost</h2>

            <div className="cost-breakdown-table">
              <div className="cost-row">
                <span className="cost-label">Parts</span>
                <span className="cost-value">₦{formatCost(partsCost)}</span>
              </div>

              <div className="cost-row">
                <span className="cost-label">Labour</span>
                <span className="cost-value">₦{formatCost(laborCost)}</span>
              </div>

              <div className="cost-row">
                <span className="cost-label">
                  Return delivery (if applicable)
                </span>
                <span className="cost-value">
                  {formatDeliveryFee(returnDeliveryCost)}
                </span>
              </div>

              <div className="cost-row">
                <span className="cost-label">Diagnostic fee</span>
                <span className="cost-value diagnostic-paid">
                  Paid at booking
                </span>
              </div>

              <hr className="cost-divider" />

              <div className="cost-row cost-total-row">
                <span className="cost-total-label">Total due now</span>
                <span className="cost-total-value">
                  ₦{formatCost(totalCost)}
                </span>
              </div>
            </div>

            {/* Continue to secure payment button */}
            <button
              type="button"
              className="btn-continue-payment"
              onClick={handleProceedPayment}
              disabled={isProcessing}
            >
              <Lock size={16} strokeWidth={2.4} />
              <span>
                {isProcessing
                  ? "Connecting to gateway..."
                  : "Continue to secure payment"}
              </span>
            </button>
          </div>
        </div>

        {/* Right Column: What to expect Card */}
        <div className="payment-right-col">
          <div className="payment-card what-to-expect-card">
            <h2 className="payment-card-title">What to expect</h2>

            <div className="what-to-expect-steps">
              {/* Step 1 */}
              <div className="expect-step-item">
                <div className="expect-step-badge">1</div>
                <div className="expect-step-content">
                  <h3 className="expect-step-title">
                    You go to {paymentGateway}
                  </h3>
                  <p className="expect-step-desc">
                    Our payment partner’s secure page opens.
                  </p>
                </div>
              </div>

              {/* Step 2 */}
              <div className="expect-step-item">
                <div className="expect-step-badge">2</div>
                <div className="expect-step-content">
                  <h3 className="expect-step-title">You complete the payment</h3>
                  <p className="expect-step-desc">
                    Using the method you choose on that page.
                  </p>
                </div>
              </div>

              {/* Step 3 */}
              <div className="expect-step-item">
                <div className="expect-step-badge">3</div>
                <div className="expect-step-content">
                  <h3 className="expect-step-title">You come back here</h3>
                  <p className="expect-step-desc">
                    Your repair starts once the payment is verified.
                  </p>
                </div>
              </div>
            </div>

            {/* Security Notice Box */}
            <div className="payment-security-notice">
              <Lock size={15} className="security-lock-icon" />
              <span>We never see or store your card details.</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function RepairPaymentPage({ params }) {
  return (
    <Suspense fallback={<TecNurxLoader minHeight="65vh" size="lg" />}>
      <RepairPaymentContent params={params} />
    </Suspense>
  );
}
