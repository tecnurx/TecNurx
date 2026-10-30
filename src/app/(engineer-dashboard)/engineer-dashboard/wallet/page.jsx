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
  Clock,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import WithdrawModal from "../../components/WithdrawModal";
import DataTable from "@/components/DataTable";

const EngineerWallet = () => {
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);

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

  const columns = [
    {
      header: "Transaction ID",
      accessor: "id",
      sortable: true,
      render: (t) => (
        <span style={{ fontWeight: "700", color: "#0f172a" }}>
          {t.id}
        </span>
      ),
    },
    {
      header: "Date & Time",
      accessor: "date",
      sortable: true,
      render: (t) => (
        <span style={{ color: "#64748b", fontSize: "13px" }}>
          {t.date}
        </span>
      ),
    },
    {
      header: "Description / Ref",
      accessor: "title",
      render: (t) => (
        <div style={{ display: "flex", flexDirection: "column" }}>
          <span style={{ fontWeight: "600", color: "#0f172a" }}>{t.title}</span>
          <small style={{ color: "#94a3b8", fontSize: "12px" }}>{t.ref}</small>
        </div>
      ),
    },
    {
      header: "Type",
      accessor: "type",
      sortable: true,
      render: (t) => (
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "4px",
            padding: "4px 10px",
            borderRadius: "20px",
            fontSize: "12px",
            fontWeight: "600",
            background: t.type === "credit" ? "#dcfce7" : "#fee2e2",
            color: t.type === "credit" ? "#166534" : "#991b1b",
          }}
        >
          {t.type === "credit" ? (
            <>
              <ArrowDownLeft size={13} /> Credit
            </>
          ) : (
            <>
              <ArrowUpRight size={13} /> Withdrawal
            </>
          )}
        </span>
      ),
    },
    {
      header: "Status",
      accessor: "status",
      sortable: true,
      render: (t) => {
        const isCompleted = t.status === "completed";
        const isPending = t.status === "pending";
        return (
          <span
            style={{
              padding: "4px 10px",
              borderRadius: "20px",
              fontSize: "12px",
              fontWeight: "600",
              textTransform: "capitalize",
              background: isCompleted ? "#f0fdf4" : isPending ? "#fefce8" : "#fef2f2",
              color: isCompleted ? "#15803d" : isPending ? "#a16207" : "#b91c1c",
              border: isCompleted
                ? "1px solid #bbf7d0"
                : isPending
                ? "1px solid #fef08a"
                : "1px solid #fecaca",
            }}
          >
            {t.status}
          </span>
        );
      },
    },
    {
      header: "Amount",
      accessor: "amount",
      sortable: true,
      align: "right",
      render: (t) => (
        <span
          style={{
            fontWeight: "700",
            fontSize: "15px",
            color: t.type === "credit" ? "#16a34a" : "#dc2626",
          }}
        >
          {t.type === "credit" ? "+" : "-"}₦{Number(t.amount || 0).toLocaleString()}
        </span>
      ),
    },
  ];

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
      <div
        className="engdashboard-header"
        style={{
          marginBottom: "24px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "16px",
        }}
      >
        <div>
          <h1>My Wallet</h1>
          <p style={{ color: "#666", fontSize: "15px", marginTop: "4px" }}>
            Track your repair earnings, wallet balance, and withdrawal requests.
          </p>
        </div>
        <button
          onClick={() => setShowWithdrawModal(true)}
          style={{
            padding: "10px 20px",
            background: "#ffc400",
            color: "#000",
            border: "none",
            borderRadius: "8px",
            fontWeight: "700",
            fontSize: "14px",
            cursor: "pointer",
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          <ArrowUpRight size={16} /> Request Withdrawal
        </button>
      </div>

      {/* Stat Cards Grid */}
      <div className="dashboard-cards">
        <div className="stat-card">
          <div>
            <span>Available Balance</span>
            <h3>₦{walletBalance.toLocaleString()}</h3>
          </div>
          <Wallet size={24} />
        </div>

        <div className="stat-card">
          <div>
            <span>Total Earned</span>
            <h3>₦{totalEarned.toLocaleString()}</h3>
          </div>
          <Banknote size={24} />
        </div>

        <div className="stat-card">
          <div>
            <span>Total Withdrawn</span>
            <h3>₦{totalWithdrawn.toLocaleString()}</h3>
          </div>
          <ArrowUpRight size={24} />
        </div>

        <div className="stat-card">
          <div>
            <span>Pending Payouts</span>
            <h3>₦0</h3>
          </div>
          <Clock size={24} />
        </div>
      </div>

      {/* Transactions Table Section */}
      <DataTable
        title="Withdrawal & Credit History"
        subtitle="Detailed log of all repair payments and bank withdrawals"
        data={transactions}
        columns={columns}
        filters={[
          {
            key: "type",
            label: "Filter Type",
            options: [
              { value: "credit", label: "Credits" },
              { value: "withdrawal", label: "Withdrawals" },
            ],
            filterFn: (item, val) => item.type === val,
          },
        ]}
        searchPlaceholder="Search transaction ID, description, or ref..."
        searchKeys={["id", "title", "ref"]}
        initialPageSize={10}
        pageSizeOptions={[10, 20, 50]}
        emptyMessage="No wallet transactions found."
      />

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
