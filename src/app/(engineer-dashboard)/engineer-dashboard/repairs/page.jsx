"use client";

import React, { useState, useEffect, useMemo } from "react";
import "../engineer.css";
import { engService } from "../../../../../services/eng/eng";
import Link from "next/link";
import {
  Wrench,
  CheckCircle2,
  Banknote,
  Search,
  Smartphone,
  ArrowRight,
} from "lucide-react";
import TecNurxLoader from "@/components/TecNurxLoader";

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

const RepairsPage = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [repairs, setRepairs] = useState([]);
  const [activeFilter, setActiveFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    const fetchRepairs = async () => {
      try {
        setLoading(true);
        setError(null);

        const res = await engService.getEngineerRepairs();
        const data = res.data?.repairs || res.repairs || [];
        setRepairs(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Failed to load repairs:", err);
        setError(err.message || "Failed to load your repairs.");
      } finally {
        setLoading(false);
      }
    };

    fetchRepairs();
  }, []);

  const filteredRepairs = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();

    return repairs.filter((r) => {
      const s = (r.status || "pending").toLowerCase();
      if (activeFilter === "completed") {
        if (s !== "completed" && s !== "fixed" && s !== "delivered") return false;
      } else if (activeFilter === "cancelled") {
        if (s !== "cancelled" && s !== "rejected") return false;
      } else if (activeFilter === "active") {
        if (
          s === "completed" ||
          s === "fixed" ||
          s === "delivered" ||
          s === "cancelled" ||
          s === "rejected"
        ) {
          return false;
        }
      }

      if (!q) return true;
      const haystack = [
        r._id,
        r.status,
        r.issueCategory,
        r.device?.brand,
        r.device?.model,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return haystack.includes(q);
    });
  }, [repairs, activeFilter, searchTerm]);

  const totalItems = filteredRepairs.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));
  const displayedRepairs = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredRepairs.slice(start, start + itemsPerPage);
  }, [filteredRepairs, currentPage]);

  const startIndex = totalItems === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;
  const endIndex = Math.min(totalItems, currentPage * itemsPerPage);

  const totalAssigned = repairs.length;
  const completedRepairs = repairs.filter((r) => {
    const s = (r.status || "").toLowerCase();
    return s === "completed" || s === "fixed" || s === "delivered";
  }).length;
  const totalEstimatedValue = repairs.reduce(
    (sum, r) => sum + (r.estimatedCost?.totalCost || 0),
    0
  );

  if (loading) {
    return <TecNurxLoader minHeight="65vh" size="lg" />;
  }

  return (
    <div className="eng-page">
      <div className="eng-page-header">
        <div>
          <h1 className="eng-page-title">My Repairs</h1>
          <p className="eng-page-subtitle">
            Manage repair orders assigned to your engineering queue.
          </p>
        </div>

        <span className="eng-workspace-tag">
          <Wrench size={14} />
          <span>Repair Queue</span>
        </span>
      </div>

      {/* Stat Cards Grid */}
      <div className="eng-stats-grid cols-3">
        <div className="eng-stat-card">
          <div className="eng-stat-info">
            <span className="eng-stat-label">Total Assigned</span>
            <h3 className="eng-stat-value">{totalAssigned}</h3>
          </div>
          <div className="eng-stat-icon">
            <Wrench size={20} />
          </div>
        </div>

        <div className="eng-stat-card">
          <div className="eng-stat-info">
            <span className="eng-stat-label">Completed Repairs</span>
            <h3 className="eng-stat-value">{completedRepairs}</h3>
          </div>
          <div className="eng-stat-icon">
            <CheckCircle2 size={20} />
          </div>
        </div>

        <div className="eng-stat-card">
          <div className="eng-stat-info">
            <span className="eng-stat-label">Total Estimated Value</span>
            <h3 className="eng-stat-value">₦{totalEstimatedValue.toLocaleString()}</h3>
          </div>
          <div className="eng-stat-icon">
            <Banknote size={20} />
          </div>
        </div>
      </div>

      {/* Toolbar: Filter Pills + Search */}
      <div className="eng-toolbar">
        <div className="eng-filter-row">
          {[
            { key: "all", label: "All" },
            { key: "active", label: "Active" },
            { key: "completed", label: "Completed" },
            { key: "cancelled", label: "Cancelled" },
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
            placeholder="Search order ID, device, or fault..."
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

      {/* Customer-Style Card List */}
      <div className="eng-list-card">
        {displayedRepairs.length === 0 ? (
          <div className="eng-empty-state">
            <Wrench size={30} color="#94a3b8" style={{ margin: "0 auto" }} />
            <h3>No assigned repairs found</h3>
            <p>
              {searchTerm
                ? "Try clearing your search filter."
                : "Repairs assigned to you will appear here."}
            </p>
          </div>
        ) : (
          displayedRepairs.map((r) => {
            const badge = getStatusBadge(r.status);
            const brand = r.device?.brand?.toUpperCase() || "";
            const model = r.device?.model || "Device";
            const issue = r.issueCategory
              ? r.issueCategory.replace(/_/g, " ")
              : "General repair";
            const dateStr = r.assignedAt || r.createdAt;
            const amount = r.estimatedCost?.totalCost || 0;

            return (
              <div key={r._id} className="eng-item-row">
                <div className="eng-item-left">
                  <div className="eng-list-icon">
                    <Smartphone size={18} />
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <h3 className="eng-list-title">
                      {brand} {model}
                    </h3>
                    <p className="eng-list-sub" style={{ textTransform: "capitalize" }}>
                      #{formatOrderId(r._id)} · {issue} ·{" "}
                      {dateStr ? new Date(dateStr).toLocaleDateString() : "Recently"}
                    </p>
                  </div>
                </div>

                <div className="eng-item-right">
                  <span className={`eng-status-pill ${badge.className}`}>
                    {badge.label}
                  </span>
                  <span className="eng-item-amount">
                    ₦{Number(amount).toLocaleString()}
                  </span>
                  <Link
                    href={`/engineer-dashboard/repairs/${r._id}`}
                    className="eng-btn-primary"
                    style={{ padding: "8px 16px", fontSize: "13px" }}
                  >
                    <span>Manage</span>
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
            Showing {startIndex} to {endIndex} of {totalItems} repairs
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

export default RepairsPage;
