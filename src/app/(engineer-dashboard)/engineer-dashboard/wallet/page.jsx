"use client";

import React, { useState, useEffect, useMemo } from "react";
import "../engineer.css";
import { engService } from "../../../../../services/eng/eng";
import {
  Wallet,
  ArrowUpRight,
  ArrowDownLeft,
  Banknote,
  Clock,
  Search,
} from "lucide-react";
import TecNurxLoader from "@/components/TecNurxLoader";
import WithdrawModal from "../../components/WithdrawModal";

const EngineerWallet = () => {
  const [loading, setLoading] = useState(true);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [activeFilter, setActiveFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const [walletBalance, setWalletBalance] = useState(150000);
  const [totalEarned, setTotalEarned] = useState(450000);
  const [totalWithdrawn, setTotalWithdrawn] = useState(300000);

  const [transactions, setTransactions] = useState([
    {
      id: "TXN-98412",
      type: "credit",
      title: "Repair Fee - iPhone 13 Screen",
      ref: "REF: RPR-849102",
      date: "2026-10-05 14:32",
      amount: 45000,
      status: "completed",
    },
    {
      id: "TXN-98411",
      type: "withdrawal",
      title: "Bank Withdrawal to GTBank",
      ref: "REF: WTH-773910",
      date: "2026-10-03 09:15",
      amount: 100000,
      status: "completed",
    },
    {
      id: "TXN-98410",
      type: "credit",
      title: "Repair Fee - MacBook Air Battery",
      ref: "REF: RPR-772911",
      date: "2026-09-28 11:20",
      amount: 85000,
      status: "completed",
    },
    {
      id: "TXN-98409",
      type: "withdrawal",
      title: "Bank Withdrawal to Access Bank",
      ref: "REF: WTH-662810",
      date: "2026-09-20 16:45",
      amount: 200000,
      status: "completed",
    },
    {
      id: "TXN-98408",
      type: "credit",
      title: "Repair Fee - Samsung S22 Charging Port",
      ref: "REF: RPR-661029",
      date: "2026-09-15 10:05",
      amount: 35000,
      status: "completed",
    },
  ]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const paymentRes = await engService.getEngineerPayments();
        if (paymentRes?.stats?.completedAmount) {
          setTotalEarned(paymentRes.stats.completedAmount);
        }
      } catch (err) {
        console.error("Failed to fetch wallet info:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleWithdrawSuccess = (amount) => {
    setWalletBalance((prev) => Math.max(0, prev - amount));
    setTotalWithdrawn((prev) => prev + amount);

    const newTxn = {
      id: `TXN-${Math.floor(10000 + Math.random() * 90000)}`,
      type: "withdrawal",
      title: "Bank Withdrawal Request",
      ref: `REF: WTH-${Math.floor(100000 + Math.random() * 900000)}`,
      date: new Date().toLocaleString(),
      amount: amount,
      status: "completed",
    };

    setTransactions((prev) => [newTxn, ...prev]);
  };

  const filteredTransactions = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    return transactions.filter((t) => {
      if (activeFilter !== "all" && t.type !== activeFilter) return false;
      if (!q) return true;
      return `${t.id} ${t.title} ${t.ref}`.toLowerCase().includes(q);
    });
  }, [transactions, activeFilter, searchTerm]);

  const totalItems = filteredTransactions.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));
  const displayedTxns = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredTransactions.slice(start, start + itemsPerPage);
  }, [filteredTransactions, currentPage]);

  const startIndex = totalItems === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;
  const endIndex = Math.min(totalItems, currentPage * itemsPerPage);

  if (loading) {
    return <TecNurxLoader minHeight="65vh" size="lg" />;
  }

  return (
    <div className="eng-page">
      <div className="eng-page-header">
        <div>
          <h1 className="eng-page-title">My Wallet</h1>
          <p className="eng-page-subtitle">
            Track your repair earnings, wallet balance, and withdrawal requests.
          </p>
        </div>

        <span className="eng-workspace-tag">
          <Wallet size={14} />
          <span>Engineer Wallet</span>
        </span>
      </div>

      {/* Pitch-Black Wallet Hero Banner */}
      <div className="eng-hero-banner">
        <div className="eng-hero-left">
          <span className="eng-hero-pill">
            <span>●</span>
            <span>Available Balance</span>
          </span>
          <h2 className="eng-hero-title">₦{walletBalance.toLocaleString()}</h2>
          <p className="eng-hero-sub">
            Total earned: ₦{totalEarned.toLocaleString()} · Total withdrawn: ₦
            {totalWithdrawn.toLocaleString()}
          </p>
        </div>

        <div className="eng-hero-actions">
          <button
            type="button"
            className="eng-btn-yellow"
            onClick={() => setShowWithdrawModal(true)}
          >
            <ArrowUpRight size={16} />
            <span>Request Withdrawal</span>
          </button>
        </div>
      </div>

      {/* Stat Cards Grid */}
      <div className="eng-stats-grid cols-3">
        <div className="eng-stat-card">
          <div className="eng-stat-info">
            <span className="eng-stat-label">Total Earned</span>
            <h3 className="eng-stat-value">₦{totalEarned.toLocaleString()}</h3>
          </div>
          <div className="eng-stat-icon">
            <Banknote size={20} />
          </div>
        </div>

        <div className="eng-stat-card">
          <div className="eng-stat-info">
            <span className="eng-stat-label">Total Withdrawn</span>
            <h3 className="eng-stat-value">₦{totalWithdrawn.toLocaleString()}</h3>
          </div>
          <div className="eng-stat-icon">
            <ArrowUpRight size={20} />
          </div>
        </div>

        <div className="eng-stat-card">
          <div className="eng-stat-info">
            <span className="eng-stat-label">Pending Payouts</span>
            <h3 className="eng-stat-value">₦0</h3>
          </div>
          <div className="eng-stat-icon">
            <Clock size={20} />
          </div>
        </div>
      </div>

      {/* Toolbar: Filter Pills + Search */}
      <div className="eng-toolbar">
        <div className="eng-filter-row">
          {[
            { key: "all", label: "All" },
            { key: "credit", label: "Credits" },
            { key: "withdrawal", label: "Withdrawals" },
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
            placeholder="Search transaction ID or description..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
          />
        </div>
      </div>

      {/* Customer-Style Wallet History Card */}
      <div className="eng-list-card">
        {displayedTxns.length === 0 ? (
          <div className="eng-empty-state">
            <Wallet size={30} color="#94a3b8" style={{ margin: "0 auto" }} />
            <h3>No wallet transactions found</h3>
            <p>Your repair credits and bank withdrawals will appear here.</p>
          </div>
        ) : (
          displayedTxns.map((t) => {
            const isCredit = t.type === "credit";
            return (
              <div key={t.id} className="eng-item-row">
                <div className="eng-item-left">
                  <div className="eng-list-icon">
                    {isCredit ? (
                      <ArrowDownLeft size={18} color="#16a34a" />
                    ) : (
                      <ArrowUpRight size={18} color="#dc2626" />
                    )}
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <h3 className="eng-list-title">{t.title}</h3>
                    <p className="eng-list-sub">
                      {t.id} · {t.ref} · {t.date}
                    </p>
                  </div>
                </div>

                <div className="eng-item-right">
                  <span
                    className={`eng-status-pill ${
                      t.status === "completed" ? "success" : "warning"
                    }`}
                  >
                    {t.status}
                  </span>
                  <span
                    className="eng-item-amount"
                    style={{ color: isCredit ? "#16a34a" : "#dc2626" }}
                  >
                    {isCredit ? "+" : "-"}₦{Number(t.amount || 0).toLocaleString()}
                  </span>
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

      {/* Shared Withdrawal Modal */}
      <WithdrawModal
        isOpen={showWithdrawModal}
        onClose={() => setShowWithdrawModal(false)}
        walletBalance={walletBalance}
        onSuccess={handleWithdrawSuccess}
      />
    </div>
  );
};

export default EngineerWallet;
