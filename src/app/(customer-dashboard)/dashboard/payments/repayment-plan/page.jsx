"use client";

import React, { useState, useEffect, Suspense } from "react";
import "./repayment-plan.css";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { repairService } from "../../../../../../services/repairs";
import { toast } from "@/components/CustomToast";
import TecNurxLoader from "@/components/TecNurxLoader";

function RepaymentPlanContent() {
  const searchParams = useSearchParams();
  const repairId = searchParams?.get("repairId") || "TNX-88412";
  const statusParam = searchParams?.get("status");

  const [repair, setRepair] = useState(null);
  const [loading, setLoading] = useState(Boolean(searchParams?.get("repairId")));
  const [isProcessing, setIsProcessing] = useState(false);

  // Overdue state can be driven by query ?status=overdue or backend data
  const isOverdue =
    statusParam === "overdue" || repair?.rnplPlan?.status === "overdue";

  useEffect(() => {
    const idParam = searchParams?.get("repairId");
    if (!idParam) return;
    const fetchRepair = async () => {
      try {
        setLoading(true);
        const res = await repairService.getRepairDetails(idParam);
        const data = res?.data?.repair || res?.repair || res?.data;
        setRepair(data);
      } catch (err) {
        console.warn("Could not load repair for repayment plan:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchRepair();
  }, [searchParams]);

  const displayId =
    repairId.length > 8 ? repairId.slice(-8).toUpperCase() : repairId.toUpperCase();
  const deviceName =
    repair?.device?.name ||
    repair?.deviceName ||
    repair?.deviceModel ||
    "iPhone 13 Pro";

  const totalAmount = Number(repair?.rnplPlan?.total ?? 100000);
  const perInstallment = Math.round(totalAmount / 4);
  const paidAmount = Number(repair?.rnplPlan?.paid ?? perInstallment);
  const overdueAmount = isOverdue ? perInstallment : 0;
  const remainingAmount = totalAmount - paidAmount;

  const formatNaira = (val) => `₦${Number(val || 0).toLocaleString()}`;

  const [schedule, setSchedule] = useState([
    { id: 1, date: "Oct 15, 2026", amount: perInstallment, status: "paid" },
    {
      id: 2,
      date: "Nov 15, 2026",
      amount: perInstallment,
      status: isOverdue ? "overdue" : "due-soon",
    },
    { id: 3, date: "Dec 15, 2026", amount: perInstallment, status: "upcoming" },
    { id: 4, date: "Jan 15, 2027", amount: perInstallment, status: "upcoming" },
  ]);

  useEffect(() => {
    setSchedule((prev) =>
      prev.map((item) =>
        item.id === 2
          ? { ...item, status: isOverdue ? "overdue" : "due-soon" }
          : item
      )
    );
  }, [isOverdue]);

  const handlePayNow = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      toast.success(
        `Payment of ${formatNaira(perInstallment)} processed successfully!`
      );
    }, 1000);
  };

  const handlePayOffEarly = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      toast.success(
        `Remaining balance of ${formatNaira(remainingAmount)} paid off!`
      );
    }, 1000);
  };

  if (loading) {
    return <TecNurxLoader minHeight="65vh" size="lg" />;
  }

  const paidCount = schedule.filter((s) => s.status === "paid").length;

  return (
    <div className="repayment-plan-page">
      {/* Header */}
      <div className="repayment-header">
        <div className="repayment-title-row">
          <h1 className="repayment-title">Repayment plan</h1>
          {isOverdue ? (
            <span className="repayment-badge overdue">
              <span className="dot">●</span>
              Payment Overdue
            </span>
          ) : (
            <span className="repayment-badge on-track">
              <span className="dot">●</span>
              On Track
            </span>
          )}
        </div>
        <p className="repayment-subtitle">
          Repair #{displayId} · {deviceName}
        </p>
      </div>

      {/* Overdue Alert Banner (Screen 5) */}
      {isOverdue && (
        <div className="repayment-overdue-banner">
          <h2 className="repayment-overdue-title">
            Payment 2 was due {schedule[1]?.date}
          </h2>
          <p className="repayment-overdue-desc">
            Pay now to stay on track. Late fees may apply if payment remains
            outstanding per your lending partner terms.
          </p>
          <button
            type="button"
            className="btn-repayment-primary"
            disabled={isProcessing}
            onClick={handlePayNow}
          >
            {isProcessing ? "Processing..." : "Pay now"}
          </button>
          <Link
            href={`/dashboard/support?issue=overdue_repayment&repairId=${repairId}`}
            className="repayment-overdue-support"
          >
            Contact support
          </Link>
        </div>
      )}

      {/* 2-Column Grid */}
      <div className="repayment-grid">
        {/* Left Card: Schedule */}
        <div className="repayment-card">
          <h2 className="repayment-card-title">Schedule</h2>

          <div className="repayment-progress-segments">
            {schedule.map((item, idx) => {
              let segClass = "";
              if (item.status === "paid") segClass = "paid";
              else if (idx === paidCount) segClass = "active";
              return (
                <div
                  key={item.id}
                  className={`repayment-segment ${segClass}`}
                />
              );
            })}
          </div>

          <div className="repayment-schedule-list">
            {schedule.map((item) => (
              <div key={item.id} className="repayment-schedule-row">
                <div className="repayment-schedule-left">
                  <span className="repayment-schedule-date">
                    Payment {item.id} · {item.date}
                  </span>
                  <span className="repayment-schedule-amount">
                    {formatNaira(item.amount)}
                  </span>
                </div>

                {item.status === "paid" && (
                  <span className="repayment-status-pill paid">
                    <span className="dot">●</span>
                    Paid
                  </span>
                )}
                {item.status === "due-soon" && (
                  <span className="repayment-status-pill due-soon">
                    <span className="dot">●</span>
                    Due soon
                  </span>
                )}
                {item.status === "overdue" && (
                  <span className="repayment-status-pill overdue">
                    <span className="dot">●</span>
                    Overdue
                  </span>
                )}
                {item.status === "upcoming" && (
                  <span className="repayment-status-pill upcoming">
                    <span className="dot">●</span>
                    Upcoming
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Summary & Automatic Repayments */}
        <div className="repayment-right-col">
          <div className="repayment-card">
            <h2 className="repayment-card-title">Summary</h2>

            <div
              className="repayment-summary-rows"
              style={isOverdue ? { marginBottom: 0 } : undefined}
            >
              <div className="repayment-summary-row">
                <span className="repayment-summary-label">Total</span>
                <span className="repayment-summary-val">
                  {formatNaira(totalAmount)}
                </span>
              </div>
              <div className="repayment-summary-row">
                <span className="repayment-summary-label">Paid</span>
                <span className="repayment-summary-val">
                  {formatNaira(paidAmount)}
                </span>
              </div>

              {isOverdue && (
                <div className="repayment-summary-row">
                  <span className="repayment-summary-label">Overdue</span>
                  <span className="repayment-summary-val">
                    {formatNaira(overdueAmount)}
                  </span>
                </div>
              )}

              <div className="repayment-summary-row">
                <span className="repayment-summary-label">Remaining</span>
                <span className="repayment-summary-val">
                  {formatNaira(remainingAmount)}
                </span>
              </div>

              {!isOverdue && (
                <div className="repayment-summary-row">
                  <span className="repayment-summary-label">Next due</span>
                  <span className="repayment-summary-val">
                    {schedule[1]?.date}
                  </span>
                </div>
              )}
            </div>

            {!isOverdue && (
              <>
                <button
                  type="button"
                  className="btn-repayment-primary"
                  disabled={isProcessing}
                  onClick={handlePayNow}
                >
                  {isProcessing ? "Processing..." : "Pay now"}
                </button>
                <button
                  type="button"
                  className="btn-repayment-outline"
                  disabled={isProcessing}
                  onClick={handlePayOffEarly}
                >
                  Pay off early
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function RepaymentPlanPage() {
  return (
    <Suspense fallback={<TecNurxLoader minHeight="65vh" size="lg" />}>
      <RepaymentPlanContent />
    </Suspense>
  );
}
