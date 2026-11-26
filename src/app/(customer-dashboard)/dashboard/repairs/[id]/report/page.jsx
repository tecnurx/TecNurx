"use client";

import React, { use, useState, useEffect, Suspense } from "react";
import "./report.css";
import { Check } from "lucide-react";
import { repairService } from "../../../../../../../services/repairs";
import { useRouter } from "next/navigation";
import Link from "next/link";
import TecNurxLoader from "@/components/TecNurxLoader";

function ProblemReportedContent({ params }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const repairId = resolvedParams?.id || "";

  const [repair, setRepair] = useState(null);
  const [loading, setLoading] = useState(true);

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
        console.warn("Could not fetch repair details for report status:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchRepair();
  }, [repairId]);

  const displayRepairId =
    repairId.length > 8 ? repairId.slice(-8).toUpperCase() : repairId.toUpperCase();
  const reportId =
    repair?.reportId ||
    `RP-${Math.floor(100000 + Math.random() * 900000)}`;

  if (loading) {
    return <TecNurxLoader minHeight="65vh" size="lg" />;
  }

  return (
    <div className="problem-reported-page">
      {/* Top Header */}
      <div className="problem-reported-header">
        <div className="reported-title-row">
          <h1 className="problem-reported-title">Problem reported</h1>
          <span className="under-review-badge">
            <span className="review-badge-dot">●</span>
            Under Review
          </span>
        </div>
        <p className="problem-reported-subtitle">
          Report #{reportId} · Repair #{displayRepairId}
        </p>
      </div>

      {/* Top Confirmation Card */}
      <div className="reported-banner-card">
        <div className="reported-badge-icon">
          <Check size={36} strokeWidth={3} className="reported-check-icon" />
        </div>
        <h2 className="reported-banner-title">We have your report</h2>
        <p className="reported-banner-subtitle">
          We will review it and reply within 24 hours.
        </p>
      </div>

      {/* Bottom Card: What happens next */}
      <div className="what-happens-card">
        <h3 className="what-happens-title">What happens next</h3>

        <div className="happens-steps-list">
          {/* Step 1 */}
          <div className="happens-step-item">
            <div className="happens-step-num">1</div>
            <div className="happens-step-content">
              <h4 className="happens-step-title">We review your report</h4>
              <p className="happens-step-desc">
                Your photos and notes go to an engineer.
              </p>
            </div>
          </div>

          {/* Step 2 */}
          <div className="happens-step-item">
            <div className="happens-step-num">2</div>
            <div className="happens-step-content">
              <h4 className="happens-step-title">
                We may ask you to bring the device back
              </h4>
              <p className="happens-step-desc">
                Only if an inspection is needed.
              </p>
            </div>
          </div>

          {/* Step 3 */}
          <div className="happens-step-item">
            <div className="happens-step-num">3</div>
            <div className="happens-step-content">
              <h4 className="happens-step-title">We tell you the outcome</h4>
              <p className="happens-step-desc">You will see it here.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ProblemReportedPage({ params }) {
  return (
    <Suspense fallback={<TecNurxLoader minHeight="65vh" size="lg" />}>
      <ProblemReportedContent params={params} />
    </Suspense>
  );
}
