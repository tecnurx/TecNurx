"use client";

import React, { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
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
  Search,
  Filter,
  Info,
  Calendar,
  X,
  Plus,
  Trash2,
  AlertCircle,
  Save,
} from "lucide-react";
import { toast } from "@/components/CustomToast";
import { adminService } from "../../../../../../services/admin/admin";
import "./service.css";

const getDeviceIcon = (deviceType) => {
  const type = (deviceType || "").toLowerCase();
  if (type.includes("phone")) return <Smartphone size={28} />;
  if (type.includes("laptop")) return <Laptop size={28} />;
  if (type.includes("tablet") || type.includes("pad")) return <Tablet size={28} />;
  return <Package size={28} />;
};

const formatCurrency = (amount, currency = "NGN") => {
  if (amount === undefined || amount === null || isNaN(amount) || amount === 0) return "—";
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: currency || "NGN",
    maximumFractionDigits: 0,
  }).format(amount);
};

const ServiceOfferingCreate = () => {
  const router = useRouter();

  const [issueCategories, setIssueCategories] = useState([]);
  const [formData, setFormData] = useState({
    deviceType: "phone",
    brand: "",
    model: "",
    variant: "",
    releaseYear: new Date().getFullYear(),
    notes: "",
    services: [],
  });

  const [loading, setLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [error, setError] = useState(null);

  // Search and filter for the services list
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const createInitialService = (issueCategory) => ({
    issueType:
      issueCategory?.code ||
      issueCategory?.category ||
      issueCategory?.issueType ||
      "other",
    issueName: issueCategory?.name || issueCategory?.label || "",
    description: issueCategory?.description || "",
    pricing: {
      basePrice: 0,
      discountedPrice: undefined,
      currency: "NGN",
    },
    isAvailable: true,
    estimatedRepairTime: 1,
    warrantyPeriod: 30,
    partsRequired: [],
  });

  // Fetch issue categories once
  useEffect(() => {
    const fetchIssues = async () => {
      try {
        setLoading(true);
        const res = await adminService.getIssues();
        const issues =
          res.data?.issueTypes ||
          res.issueTypes ||
          res.data?.issues ||
          res.issues ||
          (Array.isArray(res.data) ? res.data : []) ||
          (Array.isArray(res) ? res : []);

        setIssueCategories(issues);

        // Initialize one service per issue category with pre-filled name & description
        const initialServices = issues.map((cat) => createInitialService(cat));

        setFormData((prev) => ({
          ...prev,
          services: initialServices,
        }));
      } catch (err) {
        console.error(err);
        toast.error("Failed to load issue categories from server.");
      } finally {
        setLoading(false);
      }
    };

    fetchIssues();
  }, []);

  const handleDeviceChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "releaseYear" ? Number(value) : value,
    }));
  };

  const handleServiceChange = (index, field, value) => {
    setFormData((prev) => {
      const newServices = [...prev.services];
      if (field === "pricing") {
        newServices[index] = {
          ...newServices[index],
          pricing: { ...newServices[index].pricing, ...value },
        };
      } else {
        newServices[index] = { ...newServices[index], [field]: value };
      }
      return { ...prev, services: newServices };
    });
  };

  const handlePartChange = (serviceIndex, partIndex, field, value) => {
    setFormData((prev) => {
      const newServices = [...prev.services];
      const parts = [...newServices[serviceIndex].partsRequired];
      parts[partIndex] = { ...parts[partIndex], [field]: value };
      newServices[serviceIndex].partsRequired = parts;
      return { ...prev, services: newServices };
    });
  };

  const addPart = (serviceIndex) => {
    setFormData((prev) => {
      const newServices = [...prev.services];
      newServices[serviceIndex].partsRequired.push({
        partName: "",
        partNumber: "",
        cost: 0,
      });
      return { ...prev, services: newServices };
    });
  };

  const removePart = (serviceIndex, partIndex) => {
    setFormData((prev) => {
      const newServices = [...prev.services];
      newServices[serviceIndex].partsRequired = newServices[
        serviceIndex
      ].partsRequired.filter((_, i) => i !== partIndex);
      return { ...prev, services: newServices };
    });
  };

  // Bulk quick actions
  const setAllAvailability = (isAvailable) => {
    setFormData((prev) => ({
      ...prev,
      services: prev.services.map((s) => ({ ...s, isAvailable })),
    }));
    toast.info(`Marked all issues as ${isAvailable ? "Available" : "Unavailable"}`);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitLoading(true);
    setError(null);

    // Validate device specs
    if (!formData.brand.trim() || !formData.model.trim()) {
      setError("Please provide both Brand and Model name.");
      toast.error("Brand and Model are required.");
      setSubmitLoading(false);
      return;
    }

    // Validate that available services have a positive basePrice
    const missingPrice = formData.services.some(
      (s) => s.isAvailable && (!s.issueName.trim() || Number(s.pricing.basePrice) <= 0)
    );

    if (missingPrice) {
      setError(
        "Please provide a Base Price (> ₦0) for all available issues, or toggle off non-applicable ones."
      );
      toast.error("Some available issues are missing base price (> ₦0).");
      setSubmitLoading(false);
      return;
    }

    try {
      const payload = {
        deviceType: formData.deviceType,
        brand: formData.brand.trim(),
        model: formData.model.trim(),
        variant: formData.variant ? formData.variant.trim() : undefined,
        releaseYear: Number(formData.releaseYear) || new Date().getFullYear(),
        notes: formData.notes ? formData.notes.trim() : undefined,
        services: formData.services.map((s) => ({
          issueType: s.issueType,
          issueName: s.issueName.trim(),
          description: s.description ? s.description.trim() : undefined,
          isAvailable: s.isAvailable !== false,
          estimatedRepairTime: Number(s.estimatedRepairTime) || 1,
          warrantyPeriod: Number(s.warrantyPeriod) || 30,
          pricing: {
            basePrice: Number(s.pricing.basePrice) || 0,
            discountedPrice: s.pricing.discountedPrice
              ? Number(s.pricing.discountedPrice)
              : undefined,
            currency: s.pricing.currency || "NGN",
          },
          partsRequired: (s.partsRequired || []).filter((p) => p.partName?.trim()),
        })),
      };

      await adminService.createService(payload);

      toast.success("Service offering created successfully!");
      router.push("/admin-dashboard/gadgets");
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to create service offering";
      setError(msg);
      toast.error(msg);
      console.error(err);
    } finally {
      setSubmitLoading(false);
    }
  };

  // Filtered Services List
  const filteredServicesWithIndices = useMemo(() => {
    return formData.services
      .map((service, index) => ({ service, index }))
      .filter(({ service }) => {
        const q = searchQuery.toLowerCase().trim();
        const matchesSearch =
          !q ||
          (service.issueName || "").toLowerCase().includes(q) ||
          (service.issueType || "").toLowerCase().includes(q) ||
          (service.description || "").toLowerCase().includes(q);

        const isAvail = service.isAvailable !== false;
        const isPriced = Number(service.pricing?.basePrice) > 0;

        let matchesStatus = true;
        if (statusFilter === "available") matchesStatus = isAvail;
        if (statusFilter === "unavailable") matchesStatus = !isAvail;
        if (statusFilter === "priced") matchesStatus = isPriced;
        if (statusFilter === "unpriced") matchesStatus = !isPriced && isAvail;

        return matchesSearch && matchesStatus;
      });
  }, [formData.services, searchQuery, statusFilter]);

  if (loading) {
    return (
      <div className="resolve-wrap">
        <p>Loading issue catalog specifications...</p>
        <div className="respinner"></div>
      </div>
    );
  }

  // Summary Metrics
  const totalCount = formData.services.length;
  const availableCount = formData.services.filter((s) => s.isAvailable !== false).length;
  const pricedCount = formData.services.filter(
    (s) => s.isAvailable && Number(s.pricing?.basePrice) > 0
  ).length;

  const validPrices = formData.services
    .filter((s) => s.isAvailable && Number(s.pricing?.basePrice) > 0)
    .map((s) => Number(s.pricing.basePrice));
  const minPrice = validPrices.length > 0 ? Math.min(...validPrices) : 0;
  const maxPrice = validPrices.length > 0 ? Math.max(...validPrices) : 0;

  const previewTitle =
    formData.brand || formData.model
      ? `${formData.brand} ${formData.model}`.trim()
      : "New Device Offering";

  return (
    <div className="serv-create-container">
      {/* Back Link */}
      <Link href="/admin-dashboard/gadgets" className="serv-back-link">
        <ArrowLeft size={16} /> Back to Gadget Catalog
      </Link>

      {/* Header Banner - Matching Edit Page */}
      <div className="serv-header-card">
        <div className="serv-device-info">
          <div className="serv-device-icon">
            {getDeviceIcon(formData.deviceType)}
          </div>
          <div className="serv-title-area">
            <h1>{previewTitle}</h1>
            <p>
              Configure device specifications and define repair issue pricing for the customer catalog.
            </p>
            <div className="serv-badges-row">
              <span className="serv-badge serv-badge-type">
                {formData.deviceType || "Device"}
              </span>
              <span className="serv-badge serv-badge-year">
                <Calendar size={12} /> {formData.releaseYear || new Date().getFullYear()}
              </span>
              <span className="serv-badge serv-badge-draft">
                Draft Creation Mode
              </span>
            </div>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        {/* Device Information Section */}
        <div className="serv-section-card">
          <div className="serv-section-header">
            <h2>Device Specifications</h2>
          </div>

          <div className="serv-spec-grid">
            <div className="serv-form-group">
              <label>Device Type *</label>
              <select
                name="deviceType"
                value={formData.deviceType}
                onChange={handleDeviceChange}
                required
              >
                <option value="phone">Phone</option>
                <option value="laptop">Laptop</option>
                <option value="tablet">Tablet</option>
                <option value="other">Other Gadget</option>
              </select>
            </div>

            <div className="serv-form-group">
              <label>Brand *</label>
              <input
                type="text"
                name="brand"
                value={formData.brand}
                onChange={handleDeviceChange}
                placeholder="e.g. GOOGLE, APPLE, SAMSUNG"
                required
              />
            </div>

            <div className="serv-form-group">
              <label>Model Name *</label>
              <input
                type="text"
                name="model"
                value={formData.model}
                onChange={handleDeviceChange}
                placeholder="e.g. Pixel 8a, iPhone 15 Pro"
                required
              />
            </div>

            <div className="serv-form-group">
              <label>Variant / Memory</label>
              <input
                type="text"
                name="variant"
                value={formData.variant}
                onChange={handleDeviceChange}
                placeholder="e.g. 128GB / 256GB"
              />
            </div>

            <div className="serv-form-group">
              <label>Release Year *</label>
              <input
                type="number"
                name="releaseYear"
                value={formData.releaseYear}
                onChange={handleDeviceChange}
                min="2000"
                max={new Date().getFullYear() + 2}
                required
              />
            </div>

            <div className="serv-form-group full-width">
              <label>Notes / Catalog Guidelines</label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleDeviceChange}
                rows={2}
                placeholder="e.g. Seeded repair estimate catalogue for Nigerian market. Prices subject to diagnosis."
              />
            </div>
          </div>
        </div>

        {/* Stats Row - Matching Edit Page */}
        <div className="serv-stats-grid">
          <div className="serv-stat-card">
            <div>
              <div className="stat-label">Total Issue Types</div>
              <div className="stat-val">{totalCount} Issues</div>
            </div>
            <div className="serv-stat-icon">
              <Wrench size={22} />
            </div>
          </div>

          <div className="serv-stat-card">
            <div>
              <div className="stat-label">Applicable Services</div>
              <div className="stat-val" style={{ color: "#15803d" }}>
                {availableCount} Active
              </div>
            </div>
            <div className="serv-stat-icon" style={{ background: "#dcfce7", color: "#15803d" }}>
              <CheckCircle2 size={22} />
            </div>
          </div>

          <div className="serv-stat-card">
            <div>
              <div className="stat-label">Priced Services</div>
              <div className="stat-val" style={{ color: pricedCount === availableCount ? "#15803d" : "#d97706" }}>
                {pricedCount} of {availableCount}
              </div>
            </div>
            <div className="serv-stat-icon" style={{ background: "#fef3c7", color: "#b45309" }}>
              <Tag size={22} />
            </div>
          </div>

          <div className="serv-stat-card">
            <div>
              <div className="stat-label">Base Price Range</div>
              <div className="stat-val" style={{ fontSize: "16px" }}>
                {validPrices.length > 0
                  ? `${formatCurrency(minPrice)} – ${formatCurrency(maxPrice)}`
                  : "—"}
              </div>
            </div>
            <div className="serv-stat-icon" style={{ background: "#e0e7ff", color: "#4338ca" }}>
              <Info size={22} />
            </div>
          </div>
        </div>

        {/* Error Callout */}
        {error && (
          <div
            style={{
              padding: "14px 18px",
              background: "#fef2f2",
              border: "1px solid #fecaca",
              borderRadius: "12px",
              marginBottom: "20px",
              display: "flex",
              alignItems: "center",
              gap: "10px",
              color: "#991b1b",
              fontSize: "14px",
            }}
          >
            <AlertCircle size={20} style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        {/* Issue Types & Pricing Management Card */}
        <div className="serv-list-card">
          <div className="serv-toolbar">
            <div className="serv-toolbar-title">
              Issue Types & Repair Pricing ({filteredServicesWithIndices.length})
            </div>

            <div className="serv-toolbar-controls">
              {/* Search Box */}
              <div className="serv-search-box">
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

              {/* Status Filter */}
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="serv-select-filter"
              >
                <option value="all">All Issues ({totalCount})</option>
                <option value="available">Available Only ({availableCount})</option>
                <option value="unavailable">Not Applicable Only ({totalCount - availableCount})</option>
                <option value="unpriced">Needs Pricing ({availableCount - pricedCount})</option>
              </select>

              {/* Quick toggle helpers */}
              <div style={{ display: "flex", gap: "6px" }}>
                <button
                  type="button"
                  onClick={() => setAllAvailability(true)}
                  style={{
                    padding: "6px 10px",
                    fontSize: "12px",
                    fontWeight: "600",
                    background: "#f1f5f9",
                    border: "1px solid #cbd5e1",
                    borderRadius: "6px",
                    cursor: "pointer",
                    color: "#334155",
                  }}
                  title="Mark all 43 issues as available"
                >
                  Enable All
                </button>
              </div>
            </div>
          </div>

          {/* List of Issue Form Blocks */}
          <div className="serv-items-container">
            {filteredServicesWithIndices.length === 0 ? (
              <div style={{ padding: "40px 20px", textAlign: "center", color: "#64748b" }}>
                <p style={{ margin: 0, fontSize: "14px" }}>
                  No issues match the search or filter criteria.
                </p>
              </div>
            ) : (
              filteredServicesWithIndices.map(({ service, index }) => {
                const isAvailable = service.isAvailable !== false;

                return (
                  <div
                    key={service.issueType || index}
                    className={`serv-item-block ${!isAvailable ? "disabled-block" : ""}`}
                  >
                    <div className="serv-item-header">
                      <div className="serv-item-title-group">
                        <h3>{service.issueName || service.issueType}</h3>
                        <span className="serv-item-slug">{service.issueType}</span>
                      </div>

                      <div
                        onClick={() => handleServiceChange(index, "isAvailable", !isAvailable)}
                        className={`serv-item-toggle ${isAvailable ? "active" : ""}`}
                      >
                        {isAvailable ? (
                          <>
                            <CheckCircle2 size={13} /> Applicable & Active
                          </>
                        ) : (
                          <>
                            <XCircle size={13} /> Not Applicable / Disabled
                          </>
                        )}
                      </div>
                    </div>

                    <div className="serv-item-grid">
                      <div className="serv-field">
                        <label>Service Display Name *</label>
                        <input
                          type="text"
                          value={service.issueName}
                          onChange={(e) =>
                            handleServiceChange(index, "issueName", e.target.value)
                          }
                          placeholder="e.g. Screen / display replacement"
                          required={isAvailable}
                        />
                      </div>

                      <div className="serv-field">
                        <label>Base Price (₦) *</label>
                        <input
                          type="number"
                          min="0"
                          step="100"
                          value={service.pricing.basePrice || ""}
                          onChange={(e) =>
                            handleServiceChange(index, "pricing", {
                              basePrice: Number(e.target.value),
                            })
                          }
                          placeholder="e.g. 35000"
                          required={isAvailable}
                        />
                      </div>

                      <div className="serv-field">
                        <label>Est. Repair Time (hrs) *</label>
                        <input
                          type="number"
                          step="0.5"
                          min="0.1"
                          value={service.estimatedRepairTime}
                          onChange={(e) =>
                            handleServiceChange(
                              index,
                              "estimatedRepairTime",
                              Number(e.target.value)
                            )
                          }
                          required={isAvailable}
                        />
                      </div>

                      <div className="serv-field">
                        <label>Warranty (days) *</label>
                        <input
                          type="number"
                          min="0"
                          value={service.warrantyPeriod}
                          onChange={(e) =>
                            handleServiceChange(
                              index,
                              "warrantyPeriod",
                              Number(e.target.value)
                            )
                          }
                          required={isAvailable}
                        />
                      </div>
                    </div>

                    <div style={{ marginTop: "10px" }} className="serv-field">
                      <label>Diagnosis / Price Estimate Note</label>
                      <input
                        type="text"
                        value={service.description}
                        onChange={(e) =>
                          handleServiceChange(index, "description", e.target.value)
                        }
                        placeholder="e.g. Estimated ₦79,000–₦168,000 (confidence: Medium). Final price confirmed after engineer diagnosis."
                      />
                    </div>

                    {/* Parts Required Section */}
                    <div className="serv-parts-wrap">
                      <div className="serv-parts-top">
                        <h4>Required Parts ({service.partsRequired?.length || 0})</h4>
                        <button
                          type="button"
                          className="serv-btn-add-part"
                          onClick={() => addPart(index)}
                        >
                          + Add Part
                        </button>
                      </div>

                      {service.partsRequired && service.partsRequired.length > 0 && (
                        <div>
                          {service.partsRequired.map((part, pIdx) => (
                            <div key={pIdx} className="serv-part-row">
                              <input
                                type="text"
                                value={part.partName}
                                onChange={(e) =>
                                  handlePartChange(index, pIdx, "partName", e.target.value)
                                }
                                placeholder="Part name (e.g. OLED Display Assembly)"
                                style={{ flex: 2 }}
                              />
                              <input
                                type="text"
                                value={part.partNumber || ""}
                                onChange={(e) =>
                                  handlePartChange(index, pIdx, "partNumber", e.target.value)
                                }
                                placeholder="Part # / SKU"
                                style={{ flex: 1 }}
                              />
                              <input
                                type="number"
                                min="0"
                                value={part.cost || ""}
                                onChange={(e) =>
                                  handlePartChange(index, pIdx, "cost", Number(e.target.value))
                                }
                                placeholder="Cost (₦)"
                                style={{ flex: 1 }}
                              />
                              <button
                                type="button"
                                className="serv-btn-del-part"
                                onClick={() => removePart(index, pIdx)}
                                title="Remove Part"
                              >
                                <Trash2 size={13} />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Sticky Bottom Action Bar */}
        <div className="serv-bottom-bar">
          <Link href="/admin-dashboard/gadgets" className="serv-btn-cancel">
            Cancel
          </Link>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <span style={{ fontSize: "13px", color: "#64748b" }}>
              {availableCount} of {totalCount} issues enabled
            </span>
            <button
              type="submit"
              className="serv-btn-submit"
              disabled={submitLoading}
            >
              <Save size={16} />
              {submitLoading ? "Creating Offering..." : "Create Service Offering"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default ServiceOfferingCreate;
