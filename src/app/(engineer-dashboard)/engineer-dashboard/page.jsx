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
} from "lucide-react";
import { engineerAuthService } from "../../../../services/eng/engineerAuth";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "@/components/CustomToast";
import WithdrawModal from "../components/WithdrawModal";

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
      icon: <XCircleIcon size={24} />,
    },
    {
      id: 4,
      title: "Cancelled Repairs",
      value: engStats?.cancelledRepairs || "0",
      icon: <CheckCircle2 size={24} />,
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

      {/* Wallet Balance & Search Card */}
      <div className="balance-card">
        <h2>Wallet Balance</h2>
        <div className="balance-amount">₦{walletBalance.toLocaleString()}</div>
        <button
          className="btn-primary"
          onClick={() => setShowWithdrawModal(true)}
        >
          Withdraw
        </button>

        {/* Search Repair By ID Form */}
        <form onSubmit={handleSearchRepair} className="search-bar">
          <input
            type="text"
            value={searchId}
            onChange={(e) => setSearchId(e.target.value)}
            placeholder="Search repair by ID or order number"
          />
          <button type="submit" className="btn-search">
            Search
          </button>
        </form>
      </div>

      {/* Main Sections */}
      <div className="sections-grid">
        {/* Recent Repairs */}
        <div className="engcardd">
          <div className="table-split">
            <h3>Recent Repairs ({repairs.length})</h3>
            <Link href="/engineer-dashboard/repairs">View all</Link>
          </div>
          <div className="table-container">
            {repairs.length === 0 ? (
              <p className="empty-state">No repairs assigned yet.</p>
            ) : (
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Order No.</th>
                    <th>Date Assigned</th>
                    <th>Fault Fixed</th>
                    <th>Repair Status</th>
                    <th>Amount</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {repairs.slice(0, 4).map((repair) => (
                    <tr key={repair._id}>
                      <td>#{repair._id.slice(-8)}</td>
                      <td>
                        {new Date(
                          repair.assignedAt || repair.createdAt
                        ).toLocaleDateString()}
                      </td>
                      <td>
                        {repair.device?.brand?.toUpperCase()}{" "}
                        {repair.device?.model} -{" "}
                        {repair.issueCategory?.replace(/_/g, " ")}
                      </td>
                      <td>{repair.status?.replace(/_/g, " ")}</td>
                      <td>
                        ₦
                        {(
                          repair.estimatedCost?.totalCost || 0
                        ).toLocaleString()}
                      </td>
                      <td>
                        <Link
                          href={`/engineer-dashboard/repairs/${repair._id}`}
                          className="view-repair"
                        >
                          View
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Recent Payments */}
        <div className="engcardd">
          <div className="table-split">
            <h3>Recent Payments ({payments.length})</h3>
            <Link href="/engineer-dashboard/payments">View all</Link>
          </div>
          <div className="table-container">
            {payments.length === 0 ? (
              <p className="empty-state">No payments yet.</p>
            ) : (
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Order No.</th>
                    <th>Fault Fixed</th>
                    <th>Date Initiated</th>
                    <th>Payment Status</th>
                    <th>Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {payments.slice(0, 4).map((payment) => (
                    <tr key={payment.transactionId || payment._id}>
                      <td>#{payment.transactionId || payment._id?.slice(-8)}</td>
                      <td>
                        {payment.repairId?.device?.brand}{" "}
                        {payment.repairId?.device?.model} -{" "}
                        {payment.repairId?.issueCategory?.replace(/_/g, " ")}
                      </td>
                      <td>
                        {new Date(payment.dateInitiated).toLocaleString()}
                      </td>
                      <td className={`payment-${payment.status}`}>
                        {payment.status}
                      </td>
                      <td>
                        ₦
                        {(
                          payment.repairId?.estimatedCost?.totalCost || 0
                        ).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
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
