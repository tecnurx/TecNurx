"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import "./payment.css";
import { toast } from "@/components/CustomToast";
import TecNurxLoader from "@/components/TecNurxLoader";
import { repairService } from "../../../../../services/repairs";

const PURPOSE_FILTERS = [
  { key: "", label: "All" },
  { key: "booking_charge", label: "Booking" },
  { key: "repair_cost", label: "Repair" },
  { key: "additional_work", label: "Additional" },
];

const formatPurposeLabel = (purpose) => {
  switch ((purpose || "").toLowerCase()) {
    case "booking_charge":
      return "Booking fee";
    case "repair_cost":
      return "Repair payment";
    case "additional_work":
      return "Additional work";
    default:
      return purpose ? purpose.replace(/_/g, " ") : "Payment";
  }
};

const formatStatusMeta = (status) => {
  const s = (status || "").toLowerCase();
  if (s === "paid" || s === "success" || s === "completed" || s === "settled") {
    return { label: "Paid", className: "status-pill-paid" };
  }
  if (s === "pending" || s === "initiated") {
    return { label: "Pending", className: "status-pill-pending" };
  }
  if (s === "failed" || s === "cancelled" || s === "expired" || s === "abandoned") {
    return {
      label: s.charAt(0).toUpperCase() + s.slice(1),
      className: "status-pill-failed",
    };
  }
  return {
    label: status ? status.charAt(0).toUpperCase() + status.slice(1) : "Unknown",
    className: "status-pill-pending",
  };
};

const Payments = () => {
  const router = useRouter();
  const [drafts, setDrafts] = useState([]);
  const [resumingDraftId, setResumingDraftId] = useState(null);
  const [confirmingDiscardId, setConfirmingDiscardId] = useState(null);
  const [discardingDraftId, setDiscardingDraftId] = useState(null);

  // My Payments (History) state
  const [payments, setPayments] = useState([]);
  const [paymentsLoading, setPaymentsLoading] = useState(true);
  const [purposeFilter, setPurposeFilter] = useState("");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [summary, setSummary] = useState(null);

  const fetchPayments = useCallback(async (activePurpose = purposeFilter, activePage = page) => {
    try {
      setPaymentsLoading(true);
      const limit = 8;
      const res = await repairService.getMyPayments({
        purpose: activePurpose || undefined,
        page: activePage,
        limit,
      });
      const payload = res?.data || res || {};
      const list = Array.isArray(payload.payments)
        ? payload.payments
        : Array.isArray(payload)
        ? payload
        : [];
      setPayments(list);
      setSummary(res?.summary || payload.summary || null);
      const pag = payload.pagination || res?.pagination || {};
      const total = res?.totalCount ?? payload.totalCount ?? pag.total ?? list.length;
      const totalPages = pag.totalPages || pag.pages || Math.max(1, Math.ceil(total / limit));
      setPagination({
        page: pag.page || activePage,
        totalPages,
        total,
      });
    } catch (err) {
      console.warn("Could not load payment history:", err);
      setPayments([]);
    } finally {
      setPaymentsLoading(false);
    }
  }, [purposeFilter, page]);

  useEffect(() => {
    const fetchDrafts = async () => {
      try {
        const res = await repairService.getDrafts();
        const list = res?.data?.drafts || res?.drafts || res?.data || [];
        setDrafts(Array.isArray(list) ? list : []);
      } catch (err) {
        console.warn("Could not load unpaid booking drafts:", err);
      }
    };
    fetchDrafts();
  }, []);

  useEffect(() => {
    fetchPayments(purposeFilter, page);
  }, [purposeFilter, page, fetchPayments]);

  const handleResumeDraft = async (draftId) => {
    try {
      setResumingDraftId(draftId);
      const res = await repairService.initiateBookingPayment(draftId);
      const data = res?.data || res;
      if (data?.paymentLink) {
        if (typeof window !== "undefined") {
          sessionStorage.setItem("pending_booking_repair_id", draftId);
          if (data.reference) {
            sessionStorage.setItem("pending_booking_reference", data.reference);
          }
          window.location.href = data.paymentLink;
        }
      } else {
        router.push(`/dashboard/repairs/book?repairId=${draftId}`);
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || "Could not resume draft payment.");
    } finally {
      setResumingDraftId(null);
    }
  };

  const handleDiscardDraft = async (draftId) => {
    try {
      setDiscardingDraftId(draftId);
      await repairService.deleteDraft(draftId);
      setDrafts((prev) => prev.filter((d) => (d._id || d.id) !== draftId));
      setConfirmingDiscardId(null);
      toast.success("Draft discarded");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Could not discard draft.");
    } finally {
      setDiscardingDraftId(null);
    }
  };

  return (
    <div className="payments-page">
      {/* Header */}
      <div className="payments-header">
        <h1 className="payments-title">Payments</h1>
        <p className="payments-subtitle">Instalments and payment receipts.</p>
      </div>

      {/* 2-Column Grid */}
      <div className="payments-grid">
        {/* Left Column: Active Instalment & History */}
        <div className="payments-left-col">
          {/* Card 1: Active Instalment (Pay Later) */}
          <div className="payment-card active-instalment-card">
            <div className="instalment-banner-bar">
              <span className="instalment-dot">●</span>
              <span>Pay Later</span>
            </div>

            <h2 className="instalment-title" style={{ marginBottom: "8px" }}>
              No current payment plan
            </h2>
            <p
              className="instalment-due-date"
              style={{ marginBottom: 0, lineHeight: 1.5 }}
            >
              You don&apos;t have any active instalment plans right now. When
              you split a repair payment with <b>"Repair Now, Pay Later"</b>; your
              schedule will appear here.
            </p>
          </div>

          {/* Card 2: History */}
          <div className="payment-card history-card">
            <div className="history-card-top">
              <h2 className="payment-card-title" style={{ marginBottom: 0 }}>
                History
              </h2>
              {summary && (
                <span className="history-summary-pill">
                  Total paid: ₦
                  {Number(
                    summary.totalPaid ??
                      summary.paidAmount ??
                      summary.totalAmount ??
                      0,
                  ).toLocaleString()}
                </span>
              )}
            </div>

            {/* Purpose Filters */}
            <div className="history-filter-row">
              {PURPOSE_FILTERS.map((f) => (
                <button
                  key={f.key || "all"}
                  type="button"
                  className={`history-filter-pill ${
                    purposeFilter === f.key ? "active" : ""
                  }`}
                  onClick={() => {
                    setPurposeFilter(f.key);
                    setPage(1);
                  }}
                >
                  {f.label}
                </button>
              ))}
            </div>

            {paymentsLoading ? (
              <TecNurxLoader
                minHeight="180px"
                size="md"
                text="Loading payments..."
              />
            ) : payments.length === 0 ? (
              <div className="history-empty-state">
                No payments found
                {purposeFilter
                  ? ` for ${formatPurposeLabel(purposeFilter).toLowerCase()}`
                  : ""}
                .
              </div>
            ) : (
              <div className="history-list">
                {payments.map((item) => {
                  const pId = item._id || item.id || item.paymentId;
                  const repairObj =
                    typeof item.repair === "object" ? item.repair : null;
                  const repairId =
                    repairObj?._id ||
                    repairObj?.id ||
                    item.repair ||
                    item.repairId;
                  const shortRepair = repairId
                    ? String(repairId).slice(-6).toUpperCase()
                    : String(pId || "")
                        .slice(-6)
                        .toUpperCase();
                  const devName = [
                    repairObj?.device?.brand,
                    repairObj?.device?.model,
                  ]
                    .filter(Boolean)
                    .join(" ");
                  const purposeLabel = formatPurposeLabel(item.purpose);
                  const amount = Number(item.amount ?? 0);
                  const dateValue =
                    item.paidAt || item.initiatedAt || item.createdAt;
                  const dateLabel = dateValue
                    ? new Date(dateValue).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })
                    : "—";
                  const statusMeta = formatStatusMeta(item.status);
                  const isPending =
                    (item.status || "").toLowerCase() === "pending";

                  return (
                    <div
                      key={pId}
                      className="history-item-row history-item-clickable"
                      onClick={() => router.push(`/dashboard/payments/${pId}`)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          router.push(`/dashboard/payments/${pId}`);
                        }
                      }}
                    >
                      <div className="history-item-info">
                        <h3 className="history-item-title">
                          {purposeLabel} · #{shortRepair}
                          {devName ? ` (${devName})` : ""}
                        </h3>
                        <p className="history-item-sub">
                          ₦{amount.toLocaleString()} · {dateLabel}
                        </p>
                      </div>

                      <div
                        className="history-item-right"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {isPending && item.paymentLink && (
                          <a
                            href={item.paymentLink}
                            className="btn-history-resume"
                          >
                            Resume
                          </a>
                        )}
                        <span className={statusMeta.className}>
                          <span className="status-dot">●</span>
                          <span>{statusMeta.label}</span>
                        </span>
                        <Link
                          href={`/dashboard/payments/${pId}`}
                          className="btn-history-details"
                        >
                          View details
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {pagination.totalPages > 1 && (
              <div className="history-pagination">
                <button
                  type="button"
                  className="history-page-btn"
                  disabled={page <= 1 || paymentsLoading}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                >
                  Previous
                </button>
                <span className="history-page-info">
                  Page {pagination.page} of {pagination.totalPages}
                </span>
                <button
                  type="button"
                  className="history-page-btn"
                  disabled={page >= pagination.totalPages || paymentsLoading}
                  onClick={() => setPage((p) => p + 1)}
                >
                  Next
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Pending Booking Payments (Drafts) */}
        <div className="payments-right-col">
          <div className="payment-card pending-drafts-card">
            <h2 className="payment-card-title">Pending booking payments</h2>

            {drafts.length === 0 ? (
              <div className="history-empty-state">
                No pending booking payments.
              </div>
            ) : (
              <div className="drafts-list">
                {drafts.map((draft) => {
                  const dId = draft._id || draft.id;
                  const shortId =
                    String(dId).length > 8
                      ? String(dId).slice(-8).toUpperCase()
                      : String(dId).toUpperCase();
                  const devName =
                    [draft.device?.brand, draft.device?.model]
                      .filter(Boolean)
                      .join(" ") || "Device";
                  const rawIssue = (draft.issueCategory || "Repair").replace(
                    /_/g,
                    " ",
                  );
                  const issueName =
                    rawIssue.charAt(0).toUpperCase() + rawIssue.slice(1);
                  const total = draft?.bookingCharge?.total ?? 0;
                  const expiryText = draft?.draftExpiresAt
                    ? new Date(draft.draftExpiresAt).toLocaleDateString(
                        "en-US",
                        {
                          month: "short",
                          day: "numeric",
                        },
                      )
                    : null;

                  return (
                    <div key={dId} className="draft-item-row">
                      <div className="draft-item-info">
                        <h3 className="draft-item-title">
                          {devName} · {issueName}
                        </h3>
                        <p className="draft-item-sub">
                          #{shortId}
                          {expiryText ? ` · Expires ${expiryText}` : ""}
                        </p>
                      </div>

                      <div className="draft-item-actions">
                        {confirmingDiscardId === dId ? (
                          <>
                            <button
                              type="button"
                              className="btn-draft-discard"
                              disabled={discardingDraftId === dId}
                              onClick={() => setConfirmingDiscardId(null)}
                            >
                              Cancel
                            </button>
                            <button
                              type="button"
                              className="btn-draft-confirm-discard"
                              disabled={discardingDraftId === dId}
                              onClick={() => handleDiscardDraft(dId)}
                            >
                              {discardingDraftId === dId
                                ? "Discarding..."
                                : "Confirm discard"}
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              type="button"
                              className="btn-draft-discard"
                              disabled={resumingDraftId === dId}
                              onClick={() => setConfirmingDiscardId(dId)}
                            >
                              Discard
                            </button>
                            <button
                              type="button"
                              className="btn-draft-pay"
                              disabled={resumingDraftId === dId}
                              onClick={() => handleResumeDraft(dId)}
                            >
                              {resumingDraftId === dId
                                ? "Loading..."
                                : `Pay ₦${Number(total).toLocaleString()}`}
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Payments;
