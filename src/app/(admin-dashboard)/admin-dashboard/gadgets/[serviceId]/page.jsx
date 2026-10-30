"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Smartphone,
  Laptop,
  Tablet,
  Package,
  Wrench,
  Tag,
  CheckCircle2,
  XCircle,
  Edit2,
  Search,
  Filter,
  Info,
  Calendar,
  User,
  X,
  AlertCircle,
  Power,
} from "lucide-react";
import { adminService } from "../../../../../../services/admin/admin";
import { useStaffPermissions } from "../../../../../../config/adminPermissions";
import { toast } from "@/components/CustomToast";
import "./servid.css";

const formatCurrency = (amount, currency = "NGN") => {
  if (amount === undefined || amount === null || isNaN(amount)) return "—";
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: currency || "NGN",
    maximumFractionDigits: 0,
  }).format(amount);
};

const getDeviceIcon = (deviceType) => {
  const type = (deviceType || "").toLowerCase();
  if (type.includes("phone")) return <Smartphone size={28} />;
  if (type.includes("laptop")) return <Laptop size={28} />;
  if (type.includes("tablet") || type.includes("pad")) return <Tablet size={28} />;
  return <Package size={28} />;
};

const ServicebyId = () => {
  const params = useParams();
  const router = useRouter();
  const serviceId = params?.serviceId;

  const { can } = useStaffPermissions();
  const canManageCatalog = can("catalog:manage") || can("services:manage");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [offering, setOffering] = useState(null);

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Edit Price Modal state
  const [editingService, setEditingService] = useState(null);
  const [priceInput, setPriceInput] = useState("");
  const [updatingPrice, setUpdatingPrice] = useState(false);

  // Toggle offering active status
  const [updatingStatus, setUpdatingStatus] = useState(false);

  const fetchOfferingDetails = async () => {
    if (!serviceId) return;
    try {
      setLoading(true);
      setError(null);
      const res = await adminService.getServicesbyId(serviceId);

      const data =
        res.data?.serviceOffering ||
        res.serviceOffering ||
        res.data ||
        res;

      if (!data || (!data.brand && !data.model && !data.services)) {
        throw new Error("Service offering not found.");
      }

      setOffering(data);
    } catch (err) {
      console.error("Failed to load service offering details:", err);
      setError(err.response?.data?.message || err.message || "Failed to load service details.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOfferingDetails();
  }, [serviceId]);

  // Price Modal Trigger
  const openPriceModal = (service) => {
    setEditingService(service);
    setPriceInput(service.pricing?.basePrice ?? 0);
  };

  const closePriceModal = () => {
    setEditingService(null);
    setPriceInput("");
  };

  const handleUpdatePrice = async (e) => {
    e.preventDefault();
    if (!editingService) return;

    const numPrice = Number(priceInput);
    if (isNaN(numPrice) || numPrice < 0) {
      toast.error("Please enter a valid base price.");
      return;
    }

    try {
      setUpdatingPrice(true);
      await adminService.updateServicePrice({
        offeringId: serviceId,
        serviceId: editingService._id || editingService.id,
        basePrice: numPrice,
        currency: editingService.pricing?.currency || "NGN",
      });

      // Update local state smoothly
      setOffering((prev) => {
        if (!prev) return prev;
        const updatedServices = (prev.services || []).map((s) => {
          if ((s._id || s.id) === (editingService._id || editingService.id)) {
            return {
              ...s,
              pricing: {
                ...s.pricing,
                basePrice: numPrice,
              },
            };
          }
          return s;
        });
        return { ...prev, services: updatedServices };
      });

      toast.success(`Updated price for "${editingService.issueName}"`);
      closePriceModal();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update price.");
    } finally {
      setUpdatingPrice(false);
    }
  };

  const handleToggleOfferingActive = async () => {
    if (!offering || updatingStatus) return;
    const newStatus = !offering.isActive;

    try {
      setUpdatingStatus(true);
      await adminService.updateService(serviceId, { isActive: newStatus });
      setOffering((prev) => ({ ...prev, isActive: newStatus }));
      toast.success(`Service offering marked as ${newStatus ? "Active" : "Inactive"}`);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update offering status.");
    } finally {
      setUpdatingStatus(false);
    }
  };

  // Filtered Services List
  const filteredServices = useMemo(() => {
    if (!offering?.services) return [];
    return offering.services.filter((s) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        (s.issueName || "").toLowerCase().includes(q) ||
        (s.issueType || "").toLowerCase().includes(q) ||
        (s.description || "").toLowerCase().includes(q);

      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "available" && s.isAvailable !== false) ||
        (statusFilter === "unavailable" && s.isAvailable === false);

      return matchesSearch && matchesStatus;
    });
  }, [offering?.services, searchQuery, statusFilter]);

  if (loading) {
    return (
      <div className="resolve-wrap">
        <p>Loading service offering details...</p>
        <div className="respinner"></div>
      </div>
    );
  }

  if (error || !offering) {
    return (
      <div className="resolve-wrap error">
        <AlertCircle size={36} color="#ef4444" />
        <p>{error || "Service offering not found."}</p>
        <div style={{ display: "flex", gap: "10px", marginTop: "12px" }}>
          <button
            onClick={() => router.push("/admin-dashboard/gadgets")}
            style={{
              padding: "8px 16px",
              background: "#0f172a",
              color: "#fff",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
            }}
          >
            Back to Gadgets
          </button>
          <button
            onClick={fetchOfferingDetails}
            style={{
              padding: "8px 16px",
              background: "#ffffff",
              border: "1px solid #cbd5e1",
              borderRadius: "8px",
              cursor: "pointer",
            }}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const servicesList = offering.services || [];
  const activeCount =
    offering.activeServicesCount ??
    servicesList.filter((s) => s.isAvailable !== false).length;

  const prices = servicesList
    .map((s) => s.pricing?.basePrice)
    .filter((p) => typeof p === "number" && p > 0);
  const minPrice = prices.length > 0 ? Math.min(...prices) : 0;
  const maxPrice = prices.length > 0 ? Math.max(...prices) : 0;

  const creatorName =
    offering.createdBy?.fname || offering.createdBy?.lname
      ? `${offering.createdBy?.fname || ""} ${offering.createdBy?.lname || ""}`.trim()
      : offering.createdBy?.email || "System Admin";

  return (
    <div className="servid-container">
      {/* Back Link */}
      <Link href="/admin-dashboard/gadgets" className="servid-back-link">
        <ArrowLeft size={16} /> Back to Gadget Catalog
      </Link>

      {/* Header Banner */}
      <div className="servid-header-card">
        <div className="servid-device-info">
          <div className="servid-device-icon">
            {getDeviceIcon(offering.deviceType)}
          </div>
          <div className="servid-title-area">
            <h1>
              {offering.brand} {offering.model}
            </h1>
            <div className="servid-badges-row">
              <span className="servid-badge servid-badge-type">
                {offering.deviceType || "Device"}
              </span>
              {offering.releaseYear && (
                <span className="servid-badge servid-badge-year">
                  <Calendar size={12} /> {offering.releaseYear}
                </span>
              )}
              <span
                className={`servid-badge ${
                  offering.isActive ? "servid-badge-active" : "servid-badge-inactive"
                }`}
              >
                {offering.isActive ? (
                  <>
                    <CheckCircle2 size={12} /> Active in Catalog
                  </>
                ) : (
                  <>
                    <XCircle size={12} /> Inactive
                  </>
                )}
              </span>
            </div>
          </div>
        </div>

        {/* Header Actions */}
        {canManageCatalog && (
          <div className="servid-header-actions">
            <button
              onClick={handleToggleOfferingActive}
              disabled={updatingStatus}
              className="servid-btn-toggle"
              title="Toggle device offering catalog visibility"
            >
              <Power size={14} color={offering.isActive ? "#15803d" : "#b91c1c"} />
              {updatingStatus
                ? "Updating..."
                : offering.isActive
                ? "Deactivate Model"
                : "Activate Model"}
            </button>
          </div>
        )}
      </div>

      {/* Stats Cards */}
      <div className="servid-stats-grid">
        <div className="servid-stat-card">
          <div>
            <div className="stat-label">Repair Services</div>
            <div className="stat-val">{servicesList.length} Issues</div>
          </div>
          <div className="servid-stat-icon">
            <Wrench size={22} />
          </div>
        </div>

        <div className="servid-stat-card">
          <div>
            <div className="stat-label">Active Services</div>
            <div className="stat-val" style={{ color: "#15803d" }}>
              {activeCount} Available
            </div>
          </div>
          <div className="servid-stat-icon" style={{ background: "#dcfce7", color: "#15803d" }}>
            <CheckCircle2 size={22} />
          </div>
        </div>

        <div className="servid-stat-card">
          <div>
            <div className="stat-label">Base Price Range</div>
            <div className="stat-val" style={{ fontSize: "16px" }}>
              {prices.length > 0
                ? `${formatCurrency(minPrice)} – ${formatCurrency(maxPrice)}`
                : "—"}
            </div>
          </div>
          <div className="servid-stat-icon" style={{ background: "#fef3c7", color: "#b45309" }}>
            <Tag size={22} />
          </div>
        </div>

        <div className="servid-stat-card">
          <div>
            <div className="stat-label">Catalog Author</div>
            <div className="stat-val" style={{ fontSize: "15px" }}>
              {creatorName}
            </div>
          </div>
          <div className="servid-stat-icon" style={{ background: "#e0e7ff", color: "#4338ca" }}>
            <User size={22} />
          </div>
        </div>
      </div>

      {/* Notes Notice */}
      {offering.notes && (
        <div className="servid-notes-box">
          <Info size={18} style={{ flexShrink: 0, marginTop: "2px" }} />
          <p>
            <strong>Catalog Note:</strong> {offering.notes}
          </p>
        </div>
      )}

      {/* Services List Table */}
      <div className="servid-list-card">
        {/* Toolbar */}
        <div className="servid-toolbar">
          <div className="servid-toolbar-title">
            Issue Types & Repair Pricing ({filteredServices.length})
          </div>

          <div className="servid-toolbar-controls">
            {/* Search Input */}
            <div className="servid-search-box">
              <Search size={14} color="#64748b" />
              <input
                type="text"
                placeholder="Search issue or type..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  style={{ background: "transparent", border: "none", cursor: "pointer", padding: 0 }}
                >
                  <X size={13} color="#94a3b8" />
                </button>
              )}
            </div>

            {/* Filter Dropdown */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="servid-select-filter"
            >
              <option value="all">All Status</option>
              <option value="available">Available Only</option>
              <option value="unavailable">Unavailable Only</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="servid-table-wrap">
          <table className="servid-table">
            <thead>
              <tr>
                <th>Issue / Service</th>
                <th>Base Price</th>
                <th>Est. Repair Time</th>
                <th>Availability</th>
                {canManageCatalog && <th style={{ textAlign: "right" }}>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {filteredServices.length === 0 ? (
                <tr>
                  <td colSpan={canManageCatalog ? 5 : 4} style={{ textAlign: "center", padding: "40px 20px" }}>
                    <p style={{ margin: 0, color: "#64748b", fontSize: "14px" }}>
                      No repair services match the search or filter criteria.
                    </p>
                  </td>
                </tr>
              ) : (
                filteredServices.map((service, idx) => {
                  const sId = service._id || service.id || idx;
                  const price = service.pricing?.basePrice;
                  const currency = service.pricing?.currency || "NGN";
                  const isAvailable = service.isAvailable !== false;

                  return (
                    <tr key={sId}>
                      <td className="servid-issue-cell">
                        <div className="servid-issue-name">{service.issueName}</div>
                        <div className="servid-issue-slug">{service.issueType}</div>
                        {service.description && (
                          <div className="servid-issue-desc">{service.description}</div>
                        )}
                      </td>
                      <td className="servid-price-cell">
                        {price > 0 ? (
                          formatCurrency(price, currency)
                        ) : (
                          <span style={{ color: "#94a3b8", fontSize: "13px" }}>Not Applicable</span>
                        )}
                      </td>
                      <td>
                        {service.estimatedRepairTime ? `${service.estimatedRepairTime} hrs` : "Standard"}
                      </td>
                      <td>
                        <span className={`servid-status-tag ${isAvailable ? "active" : "inactive"}`}>
                          {isAvailable ? (
                            <>
                              <CheckCircle2 size={12} /> Available
                            </>
                          ) : (
                            <>
                              <XCircle size={12} /> Unavailable
                            </>
                          )}
                        </span>
                      </td>
                      {canManageCatalog && (
                        <td style={{ textAlign: "right" }}>
                          <button
                            type="button"
                            onClick={() => openPriceModal(service)}
                            className="servid-action-btn"
                          >
                            <Edit2 size={13} /> Edit Price
                          </button>
                        </td>
                      )}
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Price Modal */}
      {editingService && (
        <div className="servid-modal-backdrop" onClick={closePriceModal}>
          <div className="servid-modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="servid-modal-header">
              <h3>Edit Base Price</h3>
              <button type="button" className="servid-modal-close" onClick={closePriceModal}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleUpdatePrice}>
              <div className="servid-modal-body">
                <p style={{ margin: "0 0 16px", fontSize: "14px", color: "#334155" }}>
                  Set the standard base price for{" "}
                  <strong>{editingService.issueName}</strong> on the{" "}
                  <strong>
                    {offering.brand} {offering.model}
                  </strong>
                  .
                </p>

                <div className="servid-input-group">
                  <label>Base Price ({editingService.pricing?.currency || "NGN"}) *</label>
                  <input
                    type="number"
                    min="0"
                    step="100"
                    required
                    value={priceInput}
                    onChange={(e) => setPriceInput(e.target.value)}
                    placeholder="e.g. 35000"
                    autoFocus
                  />
                  <div className="servid-input-help">
                    Preview: <strong>{formatCurrency(Number(priceInput) || 0)}</strong>
                  </div>
                </div>
              </div>

              <div className="servid-modal-footer">
                <button
                  type="button"
                  className="servid-btn-cancel"
                  onClick={closePriceModal}
                  disabled={updatingPrice}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="servid-btn-save"
                  disabled={updatingPrice}
                >
                  {updatingPrice ? "Saving..." : "Update Price"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ServicebyId;
