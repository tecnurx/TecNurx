"use client";

import React, { useState, useEffect } from "react";
import "../engineer.css";
import { engService } from "../../../../../services/eng/eng";
import { engineerAuthService } from "../../../../../services/eng/engineerAuth";
import {
  Wallet,
  ArrowUpRight,
  ArrowDownLeft,
  Banknote,
  Search,
  Clock,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import WithdrawModal from "../../components/WithdrawModal";

const EngineerWallet = () => {
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterTab, setFilterTab] = useState("all");

  // Sample wallet balance state
  const [walletBalance, setWalletBalance] = useState(150000);
  const [totalEarned, setTotalEarned] = useState(450000);
  const [totalWithdrawn, setTotalWithdrawn] = useState(300000);

  // Transactions list
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
        const user = engineerAuthService.getCurrentUser();
        setCurrentUser(user);

        // Fetch payments / stats if available
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

    // Add transaction record
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

  // Filter logic
  const filteredTransactions = transactions.filter((txn) => {
    const matchesFilter =
      filterTab === "all" ||
      (filterTab === "credits" && txn.type === "credit") ||
      (filterTab === "withdrawals" && txn.type === "withdrawal");

    const matchesSearch =
      txn.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      txn.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      txn.ref.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesFilter && matchesSearch;
  });

  if (loading) {
    return (
      <div className="resolve-wrap">
        <p>Loading...</p>
        <div className="respinner"></div>
      </div>
    );
  }

  return (
    <div className="dashboard-overview">
      <div className="engdashboard-header" style={{ marginBottom: "24px" }}>
        <h1>My Wallet</h1>
        <p style={{ color: "#666", fontSize: "15px", marginTop: "4px" }}>
          Track your repair earnings, wallet balance, and withdrawal requests.
        </p>
      </div>

      {/* Stat Cards Grid */}
      <div className="dashboard-cards" style={{ marginBottom: "32px" }}>
        {/* Wallet Balance Card */}
        <div
          className="stat-card"
          style={{
            background: "linear-gradient(135deg, #1e293b, #0f172a)",
            color: "#fff",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
          }}
        >
          <div style={{ gap: "12px" }}>
            <span style={{ color: "#94a3b8", fontSize: "14px" }}>Available Wallet Balance</span>
            <h3 style={{ color: "#fff", fontSize: "32px" }}>
              ₦{walletBalance.toLocaleString()}
            </h3>
          </div>
          <button
            onClick={() => setShowWithdrawModal(true)}
            style={{
              marginTop: "16px",
              padding: "10px 18px",
              background: "#ffc400",
              color: "#000",
              border: "none",
              borderRadius: "30px",
              fontWeight: "700",
              fontSize: "14px",
              cursor: "pointer",
              alignSelf: "flex-start",
            }}
          >
            Withdraw Funds
          </button>
        </div>

        {/* Total Earned */}
        <div className="stat-card">
          <div>
            <span>Total Earned</span>
            <h3>₦{totalEarned.toLocaleString()}</h3>
          </div>
          <Banknote size={24} style={{ color: "#16a34a" }} />
        </div>

        {/* Total Withdrawn */}
        <div className="stat-card">
          <div>
            <span>Total Withdrawn</span>
            <h3>₦{totalWithdrawn.toLocaleString()}</h3>
          </div>
          <ArrowUpRight size={24} style={{ color: "#dc2626" }} />
        </div>

        {/* Pending Payouts */}
        <div className="stat-card">
          <div>
            <span>Pending Payouts</span>
            <h3>₦0</h3>
          </div>
          <Clock size={24} style={{ color: "#ca8a04" }} />
        </div>
      </div>

      {/* Transactions & History Table Section */}
      <div className="engcardd">
        <div
          className="table-split"
          style={{
            flexWrap: "wrap",
            gap: "16px",
            marginBottom: "20px",
            borderBottom: "1px solid #f1f5f9",
            paddingBottom: "16px",
          }}
        >
          <div>
            <h3>Withdrawal & Credit History</h3>
            <p style={{ color: "#666", fontSize: "14px" }}>
              Detailed log of all repair payments and bank withdrawals
            </p>
          </div>

          {/* Filter & Search Controls */}
          <div style={{ display: "flex", gap: "12px", alignItems: "center", flexWrap: "wrap" }}>
            {/* Filter Tabs */}
            <div
              style={{
                display: "flex",
                background: "#f1f5f9",
                borderRadius: "30px",
                padding: "4px",
              }}
            >
              <button
                onClick={() => setFilterTab("all")}
                style={{
                  padding: "8px 16px",
                  borderRadius: "20px",
                  border: "none",
                  background: filterTab === "all" ? "#fff" : "transparent",
                  fontWeight: filterTab === "all" ? "700" : "500",
                  fontSize: "13px",
                  cursor: "pointer",
                  boxShadow: filterTab === "all" ? "0 2px 4px rgba(0,0,0,0.05)" : "none",
                }}
              >
                All
              </button>
              <button
                onClick={() => setFilterTab("credits")}
                style={{
                  padding: "8px 16px",
                  borderRadius: "20px",
                  border: "none",
                  background: filterTab === "credits" ? "#fff" : "transparent",
                  fontWeight: filterTab === "credits" ? "700" : "500",
                  fontSize: "13px",
                  cursor: "pointer",
                  boxShadow: filterTab === "credits" ? "0 2px 4px rgba(0,0,0,0.05)" : "none",
                }}
              >
                Credits
              </button>
              <button
                onClick={() => setFilterTab("withdrawals")}
                style={{
                  padding: "8px 16px",
                  borderRadius: "20px",
                  border: "none",
                  background: filterTab === "withdrawals" ? "#fff" : "transparent",
                  fontWeight: filterTab === "withdrawals" ? "700" : "500",
                  fontSize: "13px",
                  cursor: "pointer",
                  boxShadow: filterTab === "withdrawals" ? "0 2px 4px rgba(0,0,0,0.05)" : "none",
                }}
              >
                Withdrawals
              </button>
            </div>

            {/* Search Input */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                background: "#fff",
                border: "1px solid #e2e8f0",
                borderRadius: "30px",
                padding: "6px 14px",
                width: "240px",
              }}
            >
              <Search size={16} style={{ color: "#94a3b8", marginRight: "8px" }} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search transactions..."
                style={{
                  border: "none",
                  outline: "none",
                  fontSize: "13px",
                  width: "100%",
                }}
              />
            </div>
          </div>
        </div>

        {/* Transactions Table */}
        <div className="table-container">
          {filteredTransactions.length === 0 ? (
            <div className="empty-state" style={{ padding: "40px 0", textAlign: "center" }}>
              <p style={{ color: "#64748b", fontSize: "15px" }}>No transactions found matching your criteria.</p>
            </div>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Transaction ID</th>
                  <th>Date & Time</th>
                  <th>Description / Ref</th>
                  <th>Type</th>
                  <th>Status</th>
                  <th style={{ textAlign: "right" }}>Amount</th>
                </tr>
              </thead>
              <tbody>
                {filteredTransactions.map((txn) => (
                  <tr key={txn.id}>
                    <td style={{ fontWeight: "600" }}>{txn.id}</td>
                    <td style={{ color: "#64748b", fontSize: "14px" }}>{txn.date}</td>
                    <td>
                      <div style={{ display: "flex", flexDirection: "column" }}>
                        <span style={{ fontWeight: "600", color: "#1e293b" }}>{txn.title}</span>
                        <small style={{ color: "#94a3b8", fontSize: "12px" }}>{txn.ref}</small>
                      </div>
                    </td>
                    <td>
                      <span
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "4px",
                          padding: "4px 10px",
                          borderRadius: "20px",
                          fontSize: "12px",
                          fontWeight: "600",
                          background: txn.type === "credit" ? "#dcfce7" : "#fee2e2",
                          color: txn.type === "credit" ? "#166534" : "#991b1b",
                        }}
                      >
                        {txn.type === "credit" ? (
                          <>
                            <ArrowDownLeft size={14} /> Credit
                          </>
                        ) : (
                          <>
                            <ArrowUpRight size={14} /> Withdrawal
                          </>
                        )}
                      </span>
                    </td>
                    <td>
                      <span
                        style={{
                          padding: "4px 10px",
                          borderRadius: "20px",
                          fontSize: "12px",
                          fontWeight: "600",
                          background:
                            txn.status === "completed"
                              ? "#f0fdf4"
                              : txn.status === "pending"
                              ? "#fefce8"
                              : "#fef2f2",
                          color:
                            txn.status === "completed"
                              ? "#15803d"
                              : txn.status === "pending"
                              ? "#a16207"
                              : "#b91c1c",
                          border:
                            txn.status === "completed"
                              ? "1px solid #bbf7d0"
                              : "1px solid #fef08a",
                        }}
                      >
                        {txn.status.charAt(0).toUpperCase() + txn.status.slice(1)}
                      </span>
                    </td>
                    <td
                      style={{
                        textAlign: "right",
                        fontWeight: "700",
                        fontSize: "15px",
                        color: txn.type === "credit" ? "#16a34a" : "#dc2626",
                      }}
                    >
                      {txn.type === "credit" ? "+" : "-"}₦{txn.amount.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

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
