"use client";

import React, { useState, useEffect } from "react";
import "./engineer.css";
import { engService } from "../../../../services/eng/eng";
import {
  Banknote,
  CheckCircle2,
  Clock,
  Wrench,
  AlertCircle,
  Calendar,
  Smartphone,
  User,
  Wallet,
  XCircleIcon,
  X,
  Search,
  ArrowRight,
  ArrowUpRight,
  Eye,
} from "lucide-react";
import { engineerAuthService } from "../../../../services/eng/engineerAuth";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "@/components/CustomToast";
import WithdrawModal from "../components/WithdrawModal";
import DataTable from "@/components/DataTable";

const EngineerDashboard = () => {
  const router = useRouter();
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

  const walletBalance = 150000; // Mock balance

  // Fetch initial data
  useEffect(() => {
    const fetchRepairs = async () => {
      try {
        setLoading(true);
        setError(null);

        // Get current user
        const user = engineerAuthService.getCurrentUser();
        setCurrentUser(user);

        // Fetch repairs
        const res = await engService.getEngineerRepairs();
        const data = res.data?.repairs || res.repairs || [];
        setRepairs(data);

        // Fetch engineer stats
        const stats = await engService.getEngineerStats();
        setEngStats(stats?.data?.stats || {});

        // Fetch payments
        const paymentResponse = await engService.getEngineerPayments();
        setPayments(paymentResponse.data?.payments || []);
        setPaymentStats(paymentResponse.stats || {});
      } catch (err) {
        console.error("Failed to load repairs:", err);
        setError(err.message || "Failed to load your repairs.");
      } finally {
        setLoading(false);
      }
    };

    fetchRepairs();
  }, []);

  // Search Repair Handler
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

  const totalEarnings = paymentStats?.completedAmount;

  const stats = [
    {
      id: 1,
      title: "Total Earnings",
      value: `₦${(totalEarnings || 0).toLocaleString()}`,
      icon: <Banknote size={24} />,
    },
    {
      id: 2,
      title: "Active Repairs",
      value: engStats?.activeRepairs || "0",
      icon: <Wrench size={24} />,
    },
    {
      id: 3,
      title: "Completed Repairs",
      value: engStats?.completedRepairs || "0",
      icon: <CheckCircle2 size={24} />,
    },
    {
      id: 4,
      title: "Cancelled Repairs",
      value: engStats?.cancelledRepairs || "0",
      icon: <XCircleIcon size={24} />,
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
      <div className="engdashboard-header">
        <h1>Welcome, {currentUser?.fname || "Engineer"}!</h1>
      </div>

      {/* Stats Cards */}
      <div className="dashboard-cards">
        {stats.map((item) => (
          <div key={item.id} className="stat-card">
            <div>
              <span>{item.title}</span>
              <h3>{item.value}</h3>
            </div>
            {item.icon}
          </div>
        ))}
      </div>

      {/* Redesigned Wallet & Search Hero Area */}
      <div className="dashboard-hero-section">
        {/* Wallet Balance Card */}
        <div className="hero-wallet-card">
          <div className="hero-card-header">
            <div className="hero-card-title">
              <span className="hero-badge">Engineer Wallet</span>
              <h3>Available Balance</h3>
            </div>
            <div className="hero-card-icon">
              <Wallet size={22} />
            </div>
          </div>

          <div className="hero-wallet-body">
            <div className="hero-balance-value">
              ₦{walletBalance.toLocaleString()}
            </div>
            <span className="hero-balance-sub">Ready for withdrawal to your bank account</span>
          </div>

          <div className="hero-wallet-actions">
            <button
              className="hero-btn-withdraw"
              onClick={() => setShowWithdrawModal(true)}
            >
              <ArrowUpRight size={16} /> Withdraw Funds
            </button>
            <Link href="/engineer-dashboard/wallet" className="hero-btn-secondary">
              View History
            </Link>
          </div>
        </div>

        {/* Quick Repair Search Card */}
        <div className="hero-search-card">
          <div className="hero-card-header">
            <div className="hero-card-title">
              <span className="hero-badge search-badge">Quick Lookup</span>
              <h3>Find Assigned Repair</h3>
            </div>
            <div className="hero-card-icon">
              <Search size={22} />
            </div>
          </div>

          <p className="hero-search-desc">
            Instantly search any repair order by ID to update progress, log diagnostic parts, or inspect details.
          </p>

          <form onSubmit={handleSearchRepair} className="hero-search-form">
            <div className="hero-input-wrapper">
              <Search size={18} className="hero-input-icon" />
              <input
                type="text"
                value={searchId}
                onChange={(e) => setSearchId(e.target.value)}
                placeholder="Enter repair ID or order #..."
              />
            </div>
            <button type="submit" className="hero-btn-search">
              Search
            </button>
          </form>
        </div>
      </div>

      {/* Main Sections */}
      <div className="sections-grid" style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
        {/* Recent Repairs */}
        <DataTable
          title="Recent Repairs"
          subtitle={`Latest assigned repair orders (${repairs.length} total)`}
          data={repairs}
          columns={[
            {
              header: "Order No.",
              accessor: "_id",
              sortable: true,
              render: (r) => (
                <span style={{ fontWeight: "700", color: "#0f172a" }}>
                  #{r._id ? r._id.slice(-8) : "N/A"}
                </span>
              ),
            },
            {
              header: "Date Assigned",
              accessor: "assignedAt",
              sortable: true,
              render: (r) => {
                const rawDate = r.assignedAt || r.createdAt;
                return (
                  <span style={{ color: "#64748b", fontSize: "13px" }}>
                    {rawDate ? new Date(rawDate).toLocaleDateString() : "—"}
                  </span>
                );
              },
            },
            {
              header: "Fault Fixed",
              accessor: "issueCategory",
              render: (r) => (
                <span>
                  <strong>{r.device?.brand?.toUpperCase()} {r.device?.model}</strong>{" "}
                  - {r.issueCategory?.replace(/_/g, " ")}
                </span>
              ),
            },
            {
              header: "Repair Status",
              accessor: "status",
              sortable: true,
              render: (r) => {
                const status = (r.status || "pending").toLowerCase();
                const isCompleted = status === "completed" || status === "fixed";
                const isInProgress = status.includes("progress") || status === "diagnosing";
                const isCancelled = status === "cancelled";
                return (
                  <span
                    style={{
                      padding: "3px 9px",
                      borderRadius: "12px",
                      fontSize: "12px",
                      fontWeight: "600",
                      textTransform: "capitalize",
                      background: isCompleted ? "#dcfce7" : isInProgress ? "#e0f2fe" : isCancelled ? "#fee2e2" : "#fef3c7",
                      color: isCompleted ? "#15803d" : isInProgress ? "#0369a1" : isCancelled ? "#b91c1c" : "#b45309",
                    }}
                  >
                    {r.status?.replace(/_/g, " ") || "Pending"}
                  </span>
                );
              },
            },
            {
              header: "Amount",
              accessor: "estimatedCost.totalCost",
              sortable: true,
              render: (r) => (
                <span style={{ fontWeight: "700", color: "#0f172a" }}>
                  ₦{(r.estimatedCost?.totalCost || 0).toLocaleString()}
                </span>
              ),
            },
            {
              header: "Action",
              align: "center",
              render: (r) => (
                <Link
                  href={`/engineer-dashboard/repairs/${r._id}`}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "4px",
                    padding: "4px 10px",
                    background: "#0f172a",
                    color: "#ffffff",
                    borderRadius: "6px",
                    fontSize: "12px",
                    fontWeight: "600",
                    textDecoration: "none",
                  }}
                >
                  <Eye size={12} />
                  <span>View</span>
                </Link>
              ),
            },
          ]}
          actions={
            <Link
              href="/engineer-dashboard/repairs"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                padding: "6px 12px",
                background: "#f1f5f9",
                color: "#0f172a",
                borderRadius: "6px",
                fontSize: "13px",
                fontWeight: "600",
                textDecoration: "none",
              }}
            >
              <span>View All</span>
              <ArrowRight size={13} />
            </Link>
          }
          initialPageSize={5}
          pageSizeOptions={[5, 10, 20]}
          searchPlaceholder="Filter recent repairs..."
          searchKeys={["_id", "status", "issueCategory", "device.brand", "device.model"]}
          emptyMessage="No repairs assigned yet."
        />

        {/* Recent Payments */}
        <DataTable
          title="Recent Payments"
          subtitle={`Latest payouts and settlement activities (${payments.length} total)`}
          data={payments}
          columns={[
            {
              header: "Order / Txn ID",
              accessor: "transactionId",
              sortable: true,
              render: (p) => (
                <span style={{ fontWeight: "700", color: "#0f172a" }}>
                  #{p.transactionId || (p._id ? p._id.slice(-8) : "N/A")}
                </span>
              ),
            },
            {
              header: "Fault Fixed",
              accessor: "repairId.issueCategory",
              render: (p) => (
                <span>
                  <strong>{p.repairId?.device?.brand} {p.repairId?.device?.model}</strong>{" "}
                  - {p.repairId?.issueCategory?.replace(/_/g, " ")}
                </span>
              ),
            },
            {
              header: "Date Initiated",
              accessor: "dateInitiated",
              sortable: true,
              render: (p) => (
                <span style={{ color: "#64748b", fontSize: "13px" }}>
                  {p.dateInitiated ? new Date(p.dateInitiated).toLocaleString() : "—"}
                </span>
              ),
            },
            {
              header: "Payment Status",
              accessor: "status",
              sortable: true,
              render: (p) => {
                const status = (p.status || "pending").toLowerCase();
                const isSuccess = status === "paid" || status === "completed" || status === "success";
                const isFailed = status === "failed";
                return (
                  <span
                    style={{
                      padding: "3px 9px",
                      borderRadius: "12px",
                      fontSize: "12px",
                      fontWeight: "600",
                      textTransform: "capitalize",
                      background: isSuccess ? "#dcfce7" : isFailed ? "#fee2e2" : "#fef3c7",
                      color: isSuccess ? "#15803d" : isFailed ? "#b91c1c" : "#b45309",
                    }}
                  >
                    {p.status || "Pending"}
                  </span>
                );
              },
            },
            {
              header: "Amount",
              accessor: "amount",
              sortable: true,
              render: (p) => (
                <span style={{ fontWeight: "700", color: "#0f172a" }}>
                  ₦{(p.repairId?.estimatedCost?.totalCost || p.amount || 0).toLocaleString()}
                </span>
              ),
            },
          ]}
          actions={
            <Link
              href="/engineer-dashboard/payments"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                padding: "6px 12px",
                background: "#f1f5f9",
                color: "#0f172a",
                borderRadius: "6px",
                fontSize: "13px",
                fontWeight: "600",
                textDecoration: "none",
              }}
            >
              <span>View All</span>
              <ArrowRight size={13} />
            </Link>
          }
          initialPageSize={5}
          pageSizeOptions={[5, 10, 20]}
          searchPlaceholder="Filter recent payments..."
          searchKeys={["transactionId", "_id", "status", "repairId.issueCategory"]}
          emptyMessage="No payments yet."
        />
      </div>

      {/* Shared Withdraw Modal */}
      <WithdrawModal
        isOpen={showWithdrawModal}
        onClose={() => setShowWithdrawModal(false)}
        walletBalance={walletBalance}
      />

      {/* Search Repair Modal */}
      {showSearchModal && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0,0,0,0.6)",
            backdropFilter: "blur(4px)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 1000,
            padding: "20px",
          }}
        >
          <div
            style={{
              background: "#fff",
              padding: "32px",
              borderRadius: "24px",
              width: "100%",
              maxWidth: "520px",
              boxShadow: "0 20px 40px rgba(0,0,0,0.2)",
              display: "flex",
              flexDirection: "column",
              gap: "20px",
              position: "relative",
              fontFamily: "Plus Jakarta Sans, sans-serif",
            }}
          >
            {/* Close Button */}
            <button
              onClick={() => setShowSearchModal(false)}
              style={{
                position: "absolute",
                top: "20px",
                right: "20px",
                background: "#f1f5f9",
                border: "none",
                borderRadius: "50%",
                width: "36px",
                height: "36px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                color: "#64748b",
              }}
            >
              <X size={20} />
            </button>

            {/* Loading State */}
            {isSearching ? (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  padding: "36px 0",
                  gap: "16px",
                }}
              >
                <div className="respinner"></div>
                <h3
                  style={{ fontSize: "18px", fontWeight: "700", color: "#111" }}
                >
                  Searching...
                </h3>
                <p style={{ color: "#64748b", fontSize: "14px" }}>
                  Fetching repair details for #{searchId}...
                </p>
              </div>
            ) : searchError ? (
              /* Error State */
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  padding: "20px 0",
                  gap: "16px",
                  textAlign: "center",
                }}
              >
                <div
                  style={{
                    width: "56px",
                    height: "56px",
                    borderRadius: "50%",
                    background: "#fef2f2",
                    color: "#dc2626",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <AlertCircle size={32} />
                </div>
                <div>
                  <h3
                    style={{
                      fontSize: "20px",
                      fontWeight: "700",
                      color: "#111",
                      marginBottom: "6px",
                    }}
                  >
                    Repair Not Found
                  </h3>
                  <p
                    style={{
                      color: "#64748b",
                      fontSize: "14px",
                      lineHeight: "1.5",
                    }}
                  >
                    {searchError}
                  </p>
                </div>
                <button
                  onClick={() => setShowSearchModal(false)}
                  style={{
                    width: "100%",
                    padding: "14px",
                    background: "#000",
                    color: "#fff",
                    border: "none",
                    borderRadius: "60px",
                    fontWeight: "600",
                    fontSize: "15px",
                    cursor: "pointer",
                    marginTop: "8px",
                  }}
                >
                  Close & Try Again
                </button>
              </div>
            ) : searchResult ? (
              /* Success State */
              <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    borderBottom: "1px solid #f1f5f9",
                    paddingBottom: "16px",
                  }}
                >
                  <div
                    style={{
                      width: "48px",
                      height: "48px",
                      borderRadius: "14px",
                      background: "#fffbe6",
                      border: "1.5px solid #ffc400",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Wrench size={24} style={{ color: "#000" }} />
                  </div>
                  <div>
                    <h2
                      style={{ fontSize: "20px", fontWeight: "700", color: "#111" }}
                    >
                      Repair Details
                    </h2>
                    <span style={{ fontSize: "13px", color: "#64748b" }}>
                      ID: #{searchResult._id || searchResult.id}
                    </span>
                  </div>
                </div>

                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "12px",
                    background: "#f8fafc",
                    padding: "18px",
                    borderRadius: "16px",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <span style={{ color: "#64748b", fontSize: "14px" }}>
                      Device
                    </span>
                    <strong style={{ color: "#000", fontSize: "14px" }}>
                      {searchResult.device?.brand?.toUpperCase()}{" "}
                      {searchResult.device?.model}
                    </strong>
                  </div>

                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <span style={{ color: "#64748b", fontSize: "14px" }}>
                      Fault / Issue
                    </span>
                    <strong style={{ color: "#000", fontSize: "14px" }}>
                      {searchResult.issueCategory?.replace(/_/g, " ")}
                    </strong>
                  </div>

                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <span style={{ color: "#64748b", fontSize: "14px" }}>
                      Status
                    </span>
                    <span
                      style={{
                        padding: "4px 12px",
                        borderRadius: "20px",
                        fontSize: "13px",
                        fontWeight: "600",
                        background: "#dcfce7",
                        color: "#166534",
                      }}
                    >
                      {searchResult.status?.replace(/_/g, " ")}
                    </span>
                  </div>

                  {searchResult.user && (
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <span style={{ color: "#64748b", fontSize: "14px" }}>
                        Customer
                      </span>
                      <strong style={{ color: "#000", fontSize: "14px" }}>
                        {searchResult.user.fname} {searchResult.user.lname}
                      </strong>
                    </div>
                  )}

                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <span style={{ color: "#64748b", fontSize: "14px" }}>
                      Estimated Cost
                    </span>
                    <strong style={{ color: "#000", fontSize: "16px" }}>
                      ₦
                      {(
                        searchResult.estimatedCost?.totalCost ||
                        searchResult.cost ||
                        0
                      ).toLocaleString()}
                    </strong>
                  </div>
                </div>

                <div style={{ display: "flex", gap: "12px", marginTop: "8px" }}>
                  <button
                    onClick={() => setShowSearchModal(false)}
                    style={{
                      flex: 1,
                      padding: "14px",
                      background: "#f1f5f9",
                      border: "none",
                      borderRadius: "60px",
                      fontWeight: "600",
                      fontSize: "14px",
                      color: "#475569",
                      cursor: "pointer",
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      setShowSearchModal(false);
                      router.push(
                        `/engineer-dashboard/repairs/${
                          searchResult._id || searchResult.id
                        }`
                      );
                    }}
                    style={{
                      flex: 1,
                      padding: "14px",
                      background: "#000",
                      color: "#fff",
                      border: "none",
                      borderRadius: "60px",
                      fontWeight: "600",
                      fontSize: "14px",
                      cursor: "pointer",
                    }}
                  >
                    View Full Repair
                  </button>
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
