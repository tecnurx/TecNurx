"use client";

import React, { useState, Suspense } from "react";
import "./payment-failed.css";
import { AlertTriangle } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import TecNurxLoader from "@/components/TecNurxLoader";
import { repairService } from "../../../../../../../services/repairs";
import { toast } from "@/components/CustomToast";

function PaymentNotCompletedContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [retrying, setRetrying] = useState(false);

  const repairId = searchParams?.get("repairId");
  const reference =
    searchParams?.get("reference") ||
    searchParams?.get("ref") ||
    `TX-${Math.floor(10000000 + Math.random() * 90000000)}`;

  const handleTryAgain = async () => {
    if (repairId) {
      try {
        setRetrying(true);
        const res = await repairService.initiateBookingPayment(repairId);
        const data = res?.data || res;
        if (data?.paymentLink) {
          window.location.href = data.paymentLink;
          return;
        }
      } catch (err) {
        toast.error(err?.response?.data?.message || "Could not restart payment. Returning to review.");
      } finally {
        setRetrying(false);
      }
    }
    router.push("/dashboard/repairs/book?step=4");
  };

  return (
    <div className="payment-not-completed-page">
      {/* Top Header */}
      <div className="payment-not-completed-header">
        <h1 className="payment-not-completed-title">Payment not completed</h1>
        <p className="payment-not-completed-subtitle">
          Your booking is not confirmed yet.
        </p>
      </div>

      {/* Main Centered Card */}
      <div className="payment-not-completed-card">
        {/* Yellow Warning Badge */}
        <div className="payment-warning-badge">
          <AlertTriangle size={36} strokeWidth={2.4} className="payment-warning-icon" />
        </div>

        <h2 className="card-payment-title">Payment not completed</h2>
        <p className="card-payment-desc">
          The payment was cancelled or did not go through. If you were debited,
          contact support with your reference.
        </p>

        <p className="card-payment-ref">Reference: {reference}</p>

        {/* Action Buttons */}
        <div className="card-payment-actions">
          <button
            type="button"
            className="btn-try-again"
            onClick={handleTryAgain}
          >
            Try again
          </button>

          <Link
            href={`/dashboard/support?issue=payment_not_completed&ref=${reference}`}
            className="btn-contact-support"
          >
            Contact support
          </Link>
        </div>

        {/* Back Link */}
        <Link href="/dashboard/repairs/book?step=4" className="link-back-review">
          Back to review
        </Link>
      </div>
    </div>
  );
}

export default function BookPaymentNotCompletedPage() {
  return (
    <Suspense fallback={<TecNurxLoader minHeight="65vh" size="lg" />}>
      <PaymentNotCompletedContent />
    </Suspense>
  );
}
