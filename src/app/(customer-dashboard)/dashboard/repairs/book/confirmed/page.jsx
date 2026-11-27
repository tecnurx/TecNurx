"use client";

import React, { use, useState, useEffect, Suspense } from "react";
import "../book.css";
import { useRouter, useSearchParams } from "next/navigation";
import { repairService } from "../../../../../../../services/repairs";
import TecNurxLoader from "@/components/TecNurxLoader";
import PrintableReceipt from "@/components/PrintableReceipt";
import { Check } from "lucide-react";

function BookingConfirmedContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const repairId =
    searchParams.get("id") ||
    searchParams.get("repairId") ||
    (typeof window !== "undefined"
      ? sessionStorage.getItem("pending_booking_repair_id") ||
        localStorage.getItem("pending_booking_repair_id")
      : null) ||
    "3EA19933";
  const txReference =
    searchParams.get("reference") ||
    searchParams.get("trxref") ||
    searchParams.get("transactionId") ||
    (typeof window !== "undefined"
      ? sessionStorage.getItem("pending_booking_reference") ||
        localStorage.getItem("pending_booking_reference") ||
        localStorage.getItem(`draft_ref_${repairId}`)
      : null);

  const [repair, setRepair] = useState(null);
  const [loading, setLoading] = useState(true);
  const [confirmingMsg, setConfirmingMsg] = useState("Confirming your payment...");

  useEffect(() => {
    let cancelled = false;
    const verifyAndFetch = async () => {
      try {
        setLoading(true);
        if (repairId && repairId !== "3EA19933") {
          try {
            if (txReference) {
              try {
                await repairService.verifyPayment(txReference);
              } catch (verifyErr) {
                console.warn("Direct verifyPayment fallback:", verifyErr);
              }
            }

            let statusData = null;
            for (let attempt = 0; attempt < 5; attempt++) {
              if (cancelled) return;
              const statusRes = await repairService.getPaymentStatus(
                repairId,
                "booking_charge"
              );
              statusData = statusRes?.data || statusRes;

              if (statusData?.paymentStatus === "failed" || statusData?.canRetry) {
                if (!cancelled) {
                  router.replace(
                    `/dashboard/repairs/book/payment?repairId=${repairId}&reference=${statusData?.reference || ""}`
                  );
                }
                return;
              }

              if (
                statusData?.bookingPlaced ||
                statusData?.paymentStatus === "completed" ||
                statusData?.outcome === "already_resolved"
              ) {
                break;
              }

              setConfirmingMsg("Confirming your payment with Bank78...");
              await new Promise((resolve) => setTimeout(resolve, 2500));
            }
          } catch (statusErr) {
            console.warn("Could not check booking payment status:", statusErr);
          }

          const res = await repairService.getRepairDetails(repairId);
          const data = res?.data?.repair || res?.repair || res?.data;
          if (!cancelled) {
            setRepair(data);
            if (typeof window !== "undefined") {
              sessionStorage.removeItem("pending_booking_repair_id");
              sessionStorage.removeItem("pending_booking_reference");
              localStorage.removeItem("pending_booking_repair_id");
              localStorage.removeItem("pending_booking_reference");
              localStorage.removeItem(`draft_ref_${repairId}`);
            }
          }
        }
      } catch (err) {
        console.warn("Could not fetch repair details for confirmed screen:", err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    verifyAndFetch();
    return () => {
      cancelled = true;
    };
  }, [repairId, router]);

  const displayId = repairId.length > 8 ? repairId.slice(-8).toUpperCase() : repairId.toUpperCase();
  const deviceName = repair?.device?.model || repair?.device?.brand || "iPhone 13 Pro";
  const problemName = repair?.issueCategory?.replace(/_/g, " ") || "Screen replacement";
  const isPickup =
    repair?.handoverType !== "office_dropoff" &&
    repair?.serviceType !== "workshop_repair" &&
    repair?.serviceType !== "walkin_repair";

  if (loading) {
    return <TecNurxLoader minHeight="65vh" size="lg" />;
  }

  const diagFee = Number(repair?.bookingCharge?.diagnosticFee ?? 5000);
  const logisticsFeeVal = repair?.bookingCharge
    ? Number(repair?.bookingCharge?.deliveryFee ?? 0) +
      Number(repair?.bookingCharge?.returnFee ?? 0)
    : isPickup
    ? 5000
    : 0;
  const totalPaidVal = Number(
    repair?.bookingCharge?.total ?? repair?.amountPaid ?? diagFee + logisticsFeeVal
  );

  return (
    <div className="book-repair-page">
      <div className="tnx-screen-only">
        {/* Top Banner Card */}
        <div className="confirmed-hero-card">
        <div className="confirmed-check-box">
          <Check size={28} strokeWidth={3.5} color="#000000" />
        </div>
        <h1 className="confirmed-title">Booking confirmed</h1>
        <p className="confirmed-subtitle">
          Repair #{displayId} · {deviceName} · {problemName}
        </p>
        <div className="confirmed-actions-row">
          <button
            type="button"
            className="btn-confirmed-view"
            onClick={() => router.push(`/dashboard/repairs/${repairId}`)}
          >
            View repair
          </button>
          <button
            type="button"
            className="btn-confirmed-receipt"
            onClick={() => window.print()}
          >
            Download receipt
          </button>
        </div>
      </div>

      {/* Bottom 2-Column Cards */}
      <div className="confirmed-bottom-grid">
        {/* Left Card: Payment receipt */}
        <div className="book-card confirmed-receipt-card">
          <h2 className="book-card-title">Payment receipt</h2>

          <div className="receipt-rows-list">
            <div className="receipt-row">
              <span className="receipt-label">Diagnostic fee</span>
              <span className="receipt-val">
                ₦{Number(repair?.bookingCharge?.diagnosticFee ?? 5000).toLocaleString()}
              </span>
            </div>
            <div className="receipt-row">
              <span className="receipt-label">Logistics fee (pickup)</span>
              <span className="receipt-val">
                {(() => {
                  const logistics =
                    Number(repair?.bookingCharge?.deliveryFee ?? 0) +
                    Number(repair?.bookingCharge?.returnFee ?? 0);
                  if (repair?.bookingCharge) {
                    return logistics === 0 ? "₦0 (Drop-off)" : `₦${logistics.toLocaleString()}`;
                  }
                  return isPickup ? "₦5,000" : "₦0 (Drop-off)";
                })()}
              </span>
            </div>

            <div className="receipt-divider" />

            <div className="receipt-row total">
              <span className="receipt-label-total">Total paid</span>
              <span className="receipt-val-total">
                ₦{Number(
                  repair?.bookingCharge?.total ??
                    repair?.amountPaid ??
                    (isPickup ? 10000 : 5000)
                ).toLocaleString()}
              </span>
            </div>

            <div className="receipt-row">
              <span className="receipt-label">Paid through</span>
              <span className="receipt-val">{repair?.paymentGateway || "Bank78"}</span>
            </div>

            <div className="receipt-row">
              <span className="receipt-label">Reference</span>
              <span className="receipt-val">TNX-REC-{displayId}</span>
            </div>
          </div>
        </div>

        {/* Right Card: What happens next */}
        <div className="book-card confirmed-next-card">
          <h2 className="book-card-title">What happens next</h2>
          <div className="how-it-works-list">
            <div className="how-step-item">
              <div className="how-step-num">1</div>
              <div className="how-step-text">
                <h4>Hand over your device</h4>
                <p>
                  {isPickup
                    ? "Pickup on scheduled day and time window."
                    : "Drop off at 21 Kodesho Street, Computer Village, Lagos State."}
                </p>
              </div>
            </div>

            <div className="how-step-item">
              <div className="how-step-num">2</div>
              <div className="how-step-text">
                <h4>Diagnosis and quote</h4>
                <p>You get the repair cost to approve.</p>
              </div>
            </div>

            <div className="how-step-item">
              <div className="how-step-num">3</div>
              <div className="how-step-text">
                <h4>Repair and return</h4>
                <p>We keep you updated at every step.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      </div>

      <PrintableReceipt
        title="Booking Receipt"
        reference={`TNX-REC-${displayId}`}
        date={
          repair?.createdAt
            ? new Date(repair.createdAt).toLocaleDateString()
            : new Date().toLocaleDateString()
        }
        status="Confirmed"
        totalAmount={totalPaidVal}
        leftDetails={[
          { label: "Repair ID", value: `#${displayId}` },
          { label: "Device", value: deviceName },
          { label: "Issue", value: problemName },
          { label: "Handover", value: isPickup ? "Pickup & Return" : "Drop-off" },
        ]}
        rightDetails={[
          { label: "Reference", value: `TNX-REC-${displayId}` },
          { label: "Paid Through", value: repair?.paymentGateway || "Bank78" },
        ]}
        lineItems={[
          { label: "Diagnostic Fee", amount: diagFee },
          {
            label: isPickup ? "Logistics Fee (Pickup)" : "Logistics Fee (Drop-off)",
            amount: logisticsFeeVal,
          },
        ]}
      />
    </div>
  );
}

export default function BookingConfirmedPage() {
  return (
    <Suspense fallback={<TecNurxLoader minHeight="65vh" size="lg" />}>
      <BookingConfirmedContent />
    </Suspense>
  );
}
