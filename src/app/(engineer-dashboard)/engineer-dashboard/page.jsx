"use client";

import React, { useState, useEffect, useMemo } from "react";
import "./engineer.css";
import { engService } from "../../../../services/eng/eng";
import { engineerAuthService } from "../../../../services/eng/engineerAuth";
import Link from "next/link";
import {
  Banknote,
  CheckCircle2,
  Wrench,
  XCircle,
  Wallet,
  Search,
  ArrowRight,
  Smartphone,
  UserPen,
  AlertCircle,
  X,
} from "lucide-react";
import TecNurxLoader from "@/components/TecNurxLoader";
import { toast } from "@/components/CustomToast";
import WithdrawModal from "../components/WithdrawModal";

const formatNaira = (amount) => {
  return `₦${Number(amount || 0).toLocaleString()}`;
};

const formatOrderId = (id) => {
  if (!id) return "N/A";
  const str = String(id);
  return str.length > 8 ? str.slice(-8).toUpperCase() : str.toUpperCase();
};

const getStatusBadge = (statusRaw) => {
  const s = (statusRaw || "pending").toLowerCase();
  if (s === "completed" || s === "fixed" || s === "delivered") {
    return { label: s.replace(/_/g, " "), className: "success" };
  }
  if (s.includes("progress") || s === "diagnosing" || s === "repairing" || s === "in_repair") {
    return { label: s.replace(/_/g, " "), className: "pending" };
  }
  if (s === "cancelled" || s === "rejected") {
    return { label: s.replace(/_/g, " "), className: "danger" };
  }
  return { label: s.replace(/_/g, " "), className: "warning" };
};

const EngineerDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [repairs, setRepairs] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [payments, setPayments] = useState([]);
  const [engStats, setEngStats] = useState({});
  const [paymentStats, setPaymentStats] = useState({});

  const [showWithdrawModal, setShowWithdrawModal] = useState(false);

  // Search repair by ID state
  const [searchId, setSearchId] = useState("");
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [searchResult, setSearchResult] = useState(null);
  const [searchError, setSearchError] = useState(null);

  const walletBalance = 150000;

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);

        const user = engineerAuthService.getCurrentUser();
        setCurrentUser(user);

        const [repairsRes, statsRes, paymentRes] = await Promise.allSettled([
          engService.getEngineerRepairs(),
          engService.getEngineerStats(),
          engService.getEngineerPayments(),
        ]);

        if (repairsRes.status === "fulfilled") {
          const data = repairsRes.value?.data?.repairs || repairsRes.value?.repairs || [];
          setRepairs(Array.isArray(data) ? data : []);
        }

        if (statsRes.status === "fulfilled") {
          setEngStats(statsRes.value?.data?.stats || {});
        }

        if (paymentRes.status === "fulfilled") {
          setPayments(paymentRes.value?.data?.payments || []);
          setPaymentStats(paymentRes.value?.stats || {});
        }
      } catch (err) {
        console.error("Failed to load engineer dashboard:", err);
        setError(err.message || "Failed to load dashboard data.");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const handleSearchRepair = async (e) => {
    if (e) e.preventDefault();
    const query = searchId.trim();

    if (!query) {
      toast.error("Please enter a repair ID or order number to search.");
      return;
    }

    setShowSearchModal(true);
    setIsSearching(true);
    setSearchError(null);
    setSearchResult(null);

    try {
      const res = await engService.getRepairbyId(query);
      const data = res?.data?.repair || res?.repair || res?.data || res;

      if (data && (data._id || data.id)) {
        setSearchResult(data);
      } else {
        setSearchError(`No repair found with ID "${query}".`);
      }
    } catch (err) {
      console.error("Search repair error:", err);
      const msg =
        err.response?.data?.message ||
        (err.response?.status === 404
          ? `No repair found with ID "${query}".`
          : "Error searching repair details. Please try again.");
      setSearchError(msg);
    } finally {
      setIsSearching(false);
    }
  };

  const activeRepair = useMemo(() => {
    return (
      repairs.find((r) => {
        const s = (r.status || "").toLowerCase();
        return s !== "completed" && s !== "delivered" && s !== "cancelled" && s !== "rejected";
      }) || null
    );
  }, [repairs]);

  const recentRepairs = useMemo(() => repairs.slice(0, 5), [repairs]);
  const recentPayments = useMemo(() => payments.slice(0, 4), [payments]);

  const totalEarnings = paymentStats?.completedAmount || 0;
  const firstName = currentUser?.fname || "Engineer";

  if (loading) {
    return <TecNurxLoader minHeight="65vh" size="lg" />;
  }

  return (
    <div className="eng-page">
      {/* Header */}
      <div className="eng-page-header">
        <div>
          <h1 className="eng-page-title">Welcome back, {firstName}</h1>
          <p className="eng-page-subtitle">
            Manage your assigned repairs, diagnostics, and payouts.
          </p>
        </div>

        <span className="eng-workspace-tag">
          <Wrench size={14} />
          <span>Engineer Workspace</span>
        </span>
      </div>

      {/* Error Notice */}
      {error && (
        <div
          className="eng-card"
          style={{
            marginBottom: "20px",
            borderColor: "#fecaca",
            background: "#fef2f2",
            color: "#b91c1c",
            display: "flex",
            alignItems: "center",
            gap: "10px",
            padding: "16px 20px",
          }}
        >
          <AlertCircle size={18} />
          <span style={{ fontSize: "14px", fontWeight: 600 }}>{error}</span>
        </div>
      )}

      {/* Pitch-Black Hero Banner (Distinctly Engineer: Wallet + Active Workload) */}
      <div className="eng-hero-banner">
        <div className="eng-hero-left">
          <span className="eng-hero-pill">
            <span>●</span>
            <span>Available Payout Balance</span>
          </span>
          <h2 className="eng-hero-title">{formatNaira(walletBalance)} ready to withdraw</h2>
          <p className="eng-hero-sub">
            Total earnings: {formatNaira(totalEarnings)} · {engStats?.activeRepairs || 0} active{" "}
            {Number(engStats?.activeRepairs) === 1 ? "job" : "jobs"} ·{" "}
            {engStats?.completedRepairs || 0} completed
          </p>
        </div>

        <div className="eng-hero-actions">
          <button
            type="button"
            className="eng-btn-yellow"
            onClick={() => setShowWithdrawModal(true)}
          >
            <Wallet size={16} />
            <span>Withdraw funds</span>
          </button>
          <Link href="/engineer-dashboard/repairs" className="eng-btn-dark-outline">
            <span>View repair queue</span>
            <ArrowRight size={15} />
          </Link>
        </div>
      </div>

      {/* 4 Crisp Stat Cards */}
      <div className="eng-stats-grid">
        <div className="eng-stat-card">
          <div className="eng-stat-info">
            <span className="eng-stat-label">Total Earnings</span>
            <h3 className="eng-stat-value">{formatNaira(totalEarnings)}</h3>
          </div>
          <div className="eng-stat-icon">
            <Banknote size={20} />
          </div>
        </div>

        <div className="eng-stat-card">
          <div className="eng-stat-info">
            <span className="eng-stat-label">Active Repairs</span>
            <h3 className="eng-stat-value">{engStats?.activeRepairs || 0}</h3>
          </div>
          <div className="eng-stat-icon">
            <Wrench size={20} />
          </div>
        </div>

        <div className="eng-stat-card">
          <div className="eng-stat-info">
            <span className="eng-stat-label">Completed</span>
            <h3 className="eng-stat-value">{engStats?.completedRepairs || 0}</h3>
          </div>
          <div className="eng-stat-icon">
            <CheckCircle2 size={20} />
          </div>
        </div>

        <div className="eng-stat-card">
          <div className="eng-stat-info">
            <span className="eng-stat-label">Cancelled</span>
            <h3 className="eng-stat-value">{engStats?.cancelledRepairs || 0}</h3>
          </div>
          <div className="eng-stat-icon">
            <XCircle size={20} />
          </div>
        </div>
      </div>

      {/* 2-Column Grid (Matches Customer Dashboard) */}
      <div className="eng-overview-grid">
        {/* Left Column: Active Assignment + Assigned Repairs */}
        <div className="eng-col-left">
          {/* Card 1: Current Active Assignment */}
          <div className="eng-card">
            <div className="eng-card-head">
              <h2 className="eng-card-title">Current assignment</h2>
              <Link href="/engineer-dashboard/repairs" className="eng-card-link">
                View all repairs
              </Link>
            </div>

            {activeRepair ? (
              <>
                <div className="eng-active-job-meta">
                  <div>
                    <h3 className="eng-job-device">
                      {activeRepair.device?.brand?.toUpperCase()}{" "}
                      {activeRepair.device?.model || "Device"}
                    </h3>
                    <p className="eng-job-sub">
                      {activeRepair.issueCategory
                        ? activeRepair.issueCategory.replace(/_/g, " ")
                        : "Diagnostic assessment"}{" "}
                      · Order #{formatOrderId(activeRepair._id)}
                    </p>
                  </div>

                  {(() => {
                    const badge = getStatusBadge(activeRepair.status);
                    return (
                      <span className={`eng-status-pill ${badge.className}`}>
                        <span>●</span>
                        <span>{badge.label}</span>
                      </span>
                    );
                  })()}
                </div>

                <div className="eng-job-footer">
                  <div>
                    <span style={{ fontSize: "12px", color: "#64748b", display: "block" }}>
                      Estimated Quote
                    </span>
                    <strong style={{ fontSize: "16px", color: "#111827" }}>
                      {formatNaira(activeRepair.estimatedCost?.totalCost || 0)}
                    </strong>
                  </div>

                  <Link
                    href={`/engineer-dashboard/repairs/${activeRepair._id}`}
                    className="eng-btn-primary"
                  >
                    <span>Inspect &amp; update</span>
                    <ArrowRight size={15} />
                  </Link>
                </div>
              </>
            ) : (
              <div className="eng-empty-state" style={{ padding: "18px 8px" }}>
                <h3>No active assignment right now</h3>
                <p>New repair jobs assigned to you will appear here.</p>
                <Link href="/engineer-dashboard/repairs" className="eng-btn-outline">
                  Browse repair history
                </Link>
              </div>
            )}
          </div>

          {/* Card 2: Recent Assigned Repairs */}
          <div className="eng-card">
            <div className="eng-card-head">
              <h2 className="eng-card-title">Assigned repairs</h2>
              <Link href="/engineer-dashboard/repairs" className="eng-card-link">
                Manage
              </Link>
            </div>

            {recentRepairs.length > 0 ? (
              <div className="eng-list">
                {recentRepairs.map((r) => {
                  const badge = getStatusBadge(r.status);
                  const deviceName = `${r.device?.brand || ""} ${r.device?.model || "Device"}`.trim();
                  const issue = r.issueCategory
                    ? r.issueCategory.replace(/_/g, " ")
                    : "General repair";

                  return (
                    <div key={r._id} className="eng-list-row">
                      <div className="eng-list-left">
                        <div className="eng-list-icon">
                          <Smartphone size={18} />
                        </div>
                        <div style={{ minWidth: 0 }}>
                          <h4 className="eng-list-title">
                            <Link
                              href={`/engineer-dashboard/repairs/${r._id}`}
                              style={{ color: "inherit", textDecoration: "none" }}
                            >
                              {deviceName}
                            </Link>
                          </h4>
                          <p className="eng-list-sub" style={{ textTransform: "capitalize" }}>
                            #{formatOrderId(r._id)} · {issue}
                          </p>
                        </div>
                      </div>

                      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <span className={`eng-status-pill ${badge.className}`}>
                          {badge.label}
                        </span>
                        <Link
                          href={`/engineer-dashboard/repairs/${r._id}`}
                          className="eng-card-link"
                          style={{ fontSize: "13px" }}
                        >
                          View
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="eng-empty-state" style={{ padding: "18px 8px" }}>
                <p style={{ margin: 0 }}>No repairs assigned yet.</p>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Repair Lookup + Quick Actions + Recent Payouts */}
        <div className="eng-col-right">
          {/* Card 1: Quick Repair Lookup & Actions */}
          <div className="eng-card">
            <h2 className="eng-card-title" style={{ marginBottom: "14px" }}>
              Quick lookup &amp; actions
            </h2>

            <form onSubmit={handleSearchRepair} className="eng-lookup-form">
              <input
                type="text"
                className="eng-lookup-input"
                placeholder="Enter Repair ID..."
                value={searchId}
                onChange={(e) => setSearchId(e.target.value)}
              />
              <button type="submit" className="eng-btn-primary">
                <Search size={15} />
                <span>Find</span>
              </button>
            </form>

            <div className="eng-quick-actions-list">
              <Link href="/engineer-dashboard/repairs" className="eng-quick-action-row">
                <span className="eng-quick-action-left">
                  <Wrench size={17} />
                  <span>Open repair queue</span>
                </span>
                <ArrowRight size={16} />
              </Link>

              <button
                type="button"
                className="eng-quick-action-row"
                onClick={() => setShowWithdrawModal(true)}
              >
                <span className="eng-quick-action-left">
                  <Wallet size={17} />
                  <span>Request withdrawal</span>
                </span>
                <ArrowRight size={16} />
              </button>

              <Link href="/engineer-dashboard/account-setup" className="eng-quick-action-row">
                <span className="eng-quick-action-left">
                  <UserPen size={17} />
                  <span>Account &amp; security</span>
                </span>
                <ArrowRight size={16} />
              </Link>
            </div>
          </div>

          {/* Card 2: Recent Payments */}
          <div className="eng-card">
            <div className="eng-card-head">
              <h2 className="eng-card-title">Recent payouts</h2>
              <Link href="/engineer-dashboard/payments" className="eng-card-link">
                View all
              </Link>
            </div>

            {recentPayments.length > 0 ? (
              <div className="eng-list">
                {recentPayments.map((p) => {
                  const amt =
                    p.amount !== undefined
                      ? p.amount
                      : p.repairId?.estimatedCost?.totalCost || 0;
                  const badge = getStatusBadge(p.status);
                  const dateVal = p.dateInitiated || p.createdAt;
                  return (
                    <div key={p._id} className="eng-list-row">
                      <div style={{ minWidth: 0 }}>
                        <h4 className="eng-list-title">
                          #{p.transactionId || formatOrderId(p._id)}
                        </h4>
                        <p className="eng-list-sub">
                          {dateVal ? new Date(dateVal).toLocaleDateString() : "Recent"}
                        </p>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <div style={{ fontWeight: 700, fontSize: "14px", color: "#111827" }}>
                          {formatNaira(amt)}
                        </div>
                        <span
                          className={`eng-status-pill ${badge.className}`}
                          style={{ padding: "2px 8px", fontSize: "11px", marginTop: "4px" }}
                        >
                          {badge.label}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="eng-empty-state" style={{ padding: "18px 8px" }}>
                <p style={{ margin: 0 }}>No payout records yet.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Withdraw Modal */}
      <WithdrawModal
        isOpen={showWithdrawModal}
        onClose={() => setShowWithdrawModal(false)}
        walletBalance={walletBalance}
      />

      {/* Search Repair Result Modal */}
      {showSearchModal && (
        <div className="eng-modal-backdrop" onClick={() => setShowSearchModal(false)}>
          <div className="eng-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="eng-modal-header">
              <h3 className="eng-modal-title">Repair lookup</h3>
              <button
                type="button"
                className="eng-modal-close"
                onClick={() => setShowSearchModal(false)}
                aria-label="Close modal"
              >
                <X size={16} />
              </button>
            </div>

            {isSearching ? (
              <TecNurxLoader
                minHeight="160px"
                size="md"
                text={`Searching for repair #${searchId}...`}
              />
            ) : searchError ? (
              <div className="eng-empty-state">
                <AlertCircle size={28} color="#ef4444" style={{ margin: "0 auto" }} />
                <h3>Not found</h3>
                <p>{searchError}</p>
              </div>
            ) : searchResult ? (
              <div>
                <div className="eng-active-job-meta">
                  <div>
                    <h4 className="eng-job-device">
                      {searchResult.device?.brand?.toUpperCase()}{" "}
                      {searchResult.device?.model || "Device"}
                    </h4>
                    <p className="eng-job-sub">
                      Order #{formatOrderId(searchResult._id || searchResult.id)}
                    </p>
                  </div>
                  <span
                    className={`eng-status-pill ${getStatusBadge(searchResult.status).className}`}
                  >
                    {getStatusBadge(searchResult.status).label}
                  </span>
                </div>

                <div className="eng-job-footer">
                  <span style={{ fontSize: "13.5px", color: "#64748b" }}>
                    Estimated:{" "}
                    <strong style={{ color: "#111827" }}>
                      {formatNaira(searchResult.estimatedCost?.totalCost || 0)}
                    </strong>
                  </span>

                  <Link
                    href={`/engineer-dashboard/repairs/${searchResult._id || searchResult.id}`}
                    className="eng-btn-primary"
                    onClick={() => setShowSearchModal(false)}
                  >
                    <span>Open repair</span>
                    <ArrowRight size={15} />
                  </Link>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
};

export default EngineerDashboard;
