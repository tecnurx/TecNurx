"use client";

import React, { useState, useEffect, useMemo } from "react";
import "../engineer.css";
import { engService } from "../../../../../services/eng/eng";
import Link from "next/link";
import {
  Banknote,
  CheckCircle2,
  Clock,
  ArrowLeftRight,
  Search,
  ArrowRight,
  CreditCard,
} from "lucide-react";
import TecNurxLoader from "@/components/TecNurxLoader";

const formatTxnId = (p) => {
  if (p.transactionId) return p.transactionId;
  if (p._id) return String(p._id).slice(-8).toUpperCase();
  return "N/A";
};

const getPaymentBadge = (statusRaw) => {
  const s = (statusRaw || "pending").toLowerCase();
  if (s === "paid" || s === "completed" || s === "success") {
    return { label: s, className: "success" };
  }
  if (s === "failed" || s === "cancelled") {
    return { label: s, className: "danger" };
  }
  return { label: s, className: "warning" };
};

const PaymentPage = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [payments, setPayments] = useState([]);
  const [activeFilter, setActiveFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        setLoading(true);
        setError(null);

        const paymentResponse = await engService.getEngineerPayments();
        const data =
          paymentResponse.data?.payments ||
          paymentResponse.payments ||
          (Array.isArray(paymentResponse.data) ? paymentResponse.data : []);
        setPayments(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Failed to load payments:", err);
        setError(err.message || "Failed to load your payments.");
      } finally {
        setLoading(false);
      }
    };

    fetchPayments();
  }, []);

  const filteredPayments = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();

    return payments.filter((p) => {
      const s = (p.status || "pending").toLowerCase();
      if (activeFilter === "completed") {
        if (s !== "paid" && s !== "completed" && s !== "success") return false;
      } else if (activeFilter === "pending") {
        if (s !== "pending") return false;
      }

      if (!q) return true;
      const haystack = [
        p.transactionId,
        p._id,
        p.status,
        p.repairId?.issueCategory,
        p.repairId?.device?.brand,
        p.repairId?.device?.model,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return haystack.includes(q);
    });
  }, [payments, activeFilter, searchTerm]);

  const totalItems = filteredPayments.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));
  const displayedPayments = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredPayments.slice(start, start + itemsPerPage);
  }, [filteredPayments, currentPage]);

  const startIndex = totalItems === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;
  const endIndex = Math.min(totalItems, currentPage * itemsPerPage);

  const completedEarnings = payments
    .filter((p) => {
      const s = (p.status || "").toLowerCase();
      return s === "completed" || s === "paid" || s === "success";
    })
    .reduce((sum, p) => {
      const amt =
        p.amount !== undefined
          ? p.amount
          : p.repairId?.estimatedCost?.totalCost || 0;
      return sum + Number(amt || 0);
    }, 0);

  const completedCount = payments.filter((p) => {
    const s = (p.status || "").toLowerCase();
    return s === "completed" || s === "paid" || s === "success";
  }).length;

  const pendingCount = payments.filter((p) => {
    const s = (p.status || "").toLowerCase();
    return s === "pending";
  }).length;

  if (loading) {
    return <TecNurxLoader minHeight="65vh" size="lg" />;
  }

  return (
    <div className="eng-page">
      <div className="eng-page-header">
        <div>
          <h1 className="eng-page-title">My Payments</h1>
          <p className="eng-page-subtitle">
            Track repair payouts and transaction receipts.
          </p>
        </div>

        <span className="eng-workspace-tag">
          <Banknote size={14} />
          <span>Payout History</span>
        </span>
      </div>

      {/* Stat Cards Grid */}
      <div className="eng-stats-grid">
        <div className="eng-stat-card">
          <div className="eng-stat-info">
            <span className="eng-stat-label">Total Earnings</span>
            <h3 className="eng-stat-value">₦{completedEarnings.toLocaleString()}</h3>
          </div>
          <div className="eng-stat-icon">
            <Banknote size={20} />
          </div>
        </div>

        <div className="eng-stat-card">
          <div className="eng-stat-info">
            <span className="eng-stat-label">Completed</span>
            <h3 className="eng-stat-value">{completedCount}</h3>
          </div>
          <div className="eng-stat-icon">
            <CheckCircle2 size={20} />
          </div>
        </div>

        <div className="eng-stat-card">
          <div className="eng-stat-info">
            <span className="eng-stat-label">Pending</span>
            <h3 className="eng-stat-value">{pendingCount}</h3>
          </div>
          <div className="eng-stat-icon">
            <Clock size={20} />
          </div>
        </div>

        <div className="eng-stat-card">
          <div className="eng-stat-info">
            <span className="eng-stat-label">Transactions</span>
            <h3 className="eng-stat-value">{payments.length}</h3>
          </div>
          <div className="eng-stat-icon">
            <ArrowLeftRight size={20} />
          </div>
        </div>
      </div>

      {/* Toolbar: Filter Pills + Search */}
      <div className="eng-toolbar">
        <div className="eng-filter-row">
          {[
            { key: "all", label: "All" },
            { key: "completed", label: "Completed" },
            { key: "pending", label: "Pending" },
          ].map((tab) => (
            <button
              key={tab.key}
              type="button"
              className={`eng-filter-pill ${activeFilter === tab.key ? "active" : ""}`}
              onClick={() => {
                setActiveFilter(tab.key);
                setCurrentPage(1);
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="eng-search-box">
          <Search size={16} className="eng-search-icon" />
          <input
            type="text"
            className="eng-search-input"
            placeholder="Search txn ID, device, or fault..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
          />
        </div>
      </div>

      {error && (
        <div
          className="eng-card"
          style={{
            padding: "14px 18px",
            marginBottom: "18px",
            background: "#fef2f2",
            borderColor: "#fecaca",
            color: "#991b1b",
            fontSize: "14px",
          }}
        >
          {error}
        </div>
      )}

      {/* Customer-Style Payment History Card */}
      <div className="eng-list-card">
        {displayedPayments.length === 0 ? (
          <div className="eng-empty-state">
            <CreditCard size={30} color="#94a3b8" style={{ margin: "0 auto" }} />
            <h3>No payment records found</h3>
            <p>
              {searchTerm
                ? "Try clearing your search filter."
                : "Your completed repair payouts will appear here."}
            </p>
          </div>
        ) : (
          displayedPayments.map((p) => {
            const badge = getPaymentBadge(p.status);
            const brand = p.repairId?.device?.brand || "";
            const model = p.repairId?.device?.model || "";
            const issue = p.repairId?.issueCategory
              ? p.repairId.issueCategory.replace(/_/g, " ")
              : "Repair Service";
            const rawDate = p.dateInitiated || p.createdAt;
            const amt =
              p.amount !== undefined
                ? p.amount
                : p.repairId?.estimatedCost?.totalCost || 0;

            return (
              <div key={p._id} className="eng-item-row">
                <div className="eng-item-left">
                  <div className="eng-list-icon">
                    <CreditCard size={18} />
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <h3 className="eng-list-title">
                      #{formatTxnId(p)}
                      {brand || model ? ` · ${brand} ${model}` : ""}
                    </h3>
                    <p className="eng-list-sub" style={{ textTransform: "capitalize" }}>
                      {issue} ·{" "}
                      {rawDate ? new Date(rawDate).toLocaleDateString() : "Recent"}
                    </p>
                  </div>
                </div>

                <div className="eng-item-right">
                  <span className={`eng-status-pill ${badge.className}`}>
                    {badge.label}
                  </span>
                  <span className="eng-item-amount">
                    ₦{Number(amt).toLocaleString()}
                  </span>
                  <Link
                    href={`/engineer-dashboard/payments/${p._id}`}
                    className="eng-btn-primary"
                    style={{ padding: "8px 16px", fontSize: "13px" }}
                  >
                    <span>Receipt</span>
                    <ArrowRight size={14} />
                  </Link>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Pagination */}
      {totalItems > 0 && (
        <div className="eng-pagination-footer">
          <span className="eng-pagination-count">
            Showing {startIndex} to {endIndex} of {totalItems} transactions
          </span>

          {totalPages > 1 && (
            <div className="eng-pagination-btns">
              <button
                type="button"
                className="eng-page-btn"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              >
                Previous
              </button>
              {Array.from({ length: totalPages }).map((_, idx) => {
                const pageNum = idx + 1;
                return (
                  <button
                    key={pageNum}
                    type="button"
                    className={`eng-page-btn ${currentPage === pageNum ? "active" : ""}`}
                    onClick={() => setCurrentPage(pageNum)}
                  >
                    {pageNum}
                  </button>
                );
              })}
              <button
                type="button"
                className="eng-page-btn"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              >
                Next
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default PaymentPage;
