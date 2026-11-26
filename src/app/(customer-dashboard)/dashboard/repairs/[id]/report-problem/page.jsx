"use client";

import React, { use, useState, useEffect, useMemo, Suspense } from "react";
import "./report-problem.css";
import { Camera, Info, Check, Upload, X } from "lucide-react";
import { repairService } from "../../../../../../../services/repairs";
import { useRouter } from "next/navigation";
import Link from "next/link";
import TecNurxLoader from "@/components/TecNurxLoader";

function ReportProblemContent({ params }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const repairId = resolvedParams?.id || "";

  const [repair, setRepair] = useState(null);
  const [loading, setLoading] = useState(true);

  const [problemType, setProblemType] = useState("The same fault is back");
  const [description, setDescription] = useState("");
  const [photos, setPhotos] = useState([null, null, null]);
  const [isSubmitting, setIsSubmitting] = useState(false);

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
        console.warn("Could not fetch repair details:", err);
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

  const deliveredDate = useMemo(() => {
    if (repair?.deliveredAt) {
      return new Date(repair.deliveredAt).toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
    }
    return "20 Nov 2026";
  }, [repair]);

  const warrantyValidDate = useMemo(() => {
    const target = new Date();
    target.setDate(target.getDate() + 90);
    return target.toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  }, []);

  const handlePhotoUpload = (index, e) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setPhotos((prev) => {
        const next = [...prev];
        next[index] = url;
        return next;
      });
    }
  };

  const handleRemovePhoto = (index, e) => {
    e.stopPropagation();
    setPhotos((prev) => {
      const next = [...prev];
      next[index] = null;
      return next;
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      const isMyOrders =
        typeof window !== "undefined" &&
        window.location.pathname.includes("/my-orders/");
      const targetUrl = isMyOrders
        ? `/dashboard/my-orders/${repairId}/report`
        : `/dashboard/repairs/${repairId}/report`;
      router.push(targetUrl);
    }, 600);
  };

  const handleCancel = () => {
    router.back();
  };

  if (loading) {
    return <TecNurxLoader minHeight="65vh" size="lg" />;
  }

  return (
    <div className="report-problem-page">
      {/* Top Header */}
      <div className="report-page-header">
        <h1 className="report-page-title">Report a problem</h1>
        <p className="report-page-subtitle">
          Repair #{displayId} · {deviceName} · Delivered {deliveredDate}
        </p>
      </div>

      {/* Main 2-Column Grid */}
      <div className="report-page-grid">
        {/* Left Column: Form Card */}
        <div className="report-left-col">
          <form className="report-card form-card" onSubmit={handleSubmit}>
            <h2 className="section-label">What is the problem?</h2>

            {/* Radio Options */}
            <div className="problem-options-list">
              {[
                "The same fault is back",
                "A new fault since the repair",
                "My device was damaged",
                "Something else",
              ].map((opt) => (
                <div
                  key={opt}
                  className={`problem-option-card ${
                    problemType === opt ? "selected" : ""
                  }`}
                  onClick={() => setProblemType(opt)}
                  role="button"
                  tabIndex={0}
                >
                  <div className="problem-radio-circle">
                    {problemType === opt && (
                      <div className="problem-radio-dot" />
                    )}
                  </div>
                  <span className="problem-option-text">{opt}</span>
                </div>
              ))}
            </div>

            {/* Tell us more */}
            <div className="report-field-group">
              <label className="section-label" htmlFor="problem-desc">
                Tell us more
              </label>
              <textarea
                id="problem-desc"
                className="report-textarea"
                rows={4}
                placeholder="What happened, and when did you notice it?"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            {/* Photos Upload */}
            <div className="report-field-group">
              <label className="section-label">Photos</label>
              <div className="report-photos-grid">
                {[0, 1, 2].map((idx) => (
                  <label key={idx} className="report-photo-box">
                    <input
                      type="file"
                      accept="image/*"
                      className="photo-file-input"
                      onChange={(e) => handlePhotoUpload(idx, e)}
                    />
                    {photos[idx] ? (
                      <div className="photo-preview-wrap">
                        <img
                          src={photos[idx]}
                          alt={`Uploaded Photo ${idx + 1}`}
                          className="photo-preview-img"
                        />
                        <button
                          type="button"
                          className="btn-remove-photo"
                          onClick={(e) => handleRemovePhoto(idx, e)}
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ) : (
                      <div className="photo-placeholder-content">
                        <Camera size={22} className="photo-camera-icon" />
                        <span className="photo-box-label">Photo {idx + 1}</span>
                      </div>
                    )}
                  </label>
                ))}
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="report-actions-row">
              <button
                type="button"
                className="btn-report-cancel"
                onClick={handleCancel}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn-report-submit"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Submitting..." : "Submit report"}
              </button>
            </div>
          </form>
        </div>

        {/* Right Column: Warranty Card */}
        <div className="report-right-col">
          <div className="report-card warranty-sidebar-card">
            <div className="warranty-card-header">
              <h2 className="warranty-title">Repair warranty</h2>
              <span className="warranty-active-badge">
                <span className="active-badge-dot">●</span>
                Active
              </span>
            </div>

            <div className="warranty-valid-row">
              <span className="valid-label">Valid until</span>
              <span className="valid-value">{warrantyValidDate}</span>
            </div>

            <div className="warranty-terms-notice">
              <Info size={16} className="terms-info-icon" />
              <span>
                Warranty terms: Covers replaced parts and technical labour for 90 days.
                Does not cover subsequent accidental impact, unauthorized opening, or liquid ingress.
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ReportProblemPage({ params }) {
  return (
    <Suspense fallback={<TecNurxLoader minHeight="65vh" size="lg" />}>
      <ReportProblemContent params={params} />
    </Suspense>
  );
}
