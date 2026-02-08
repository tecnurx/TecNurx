// app/admin/service-offerings/create/page.jsx
"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import "./service.css";
import { toast } from "@/components/CustomToast";
import { adminService } from "../../../../../../services/admin/admin";

const initialService = {
  issueType: "",
  issueName: "",
  description: "",
  pricing: {
    basePrice: 0,
    discountedPrice: undefined,
    currency: "NGN",
  },
  isAvailable: true,
  estimatedRepairTime: 1,
  warrantyPeriod: 30,
  partsRequired: [],
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
    modelImage: "",
    notes: "",
    services: [], // will be filled after fetching issues
  });

  const [loading, setLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [error, setError] = useState(null);

  const createInitialService = (issueCategory) => ({
    issueType: issueCategory?.category || "other",
    issueName: "",
    description: "",
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
        const issues = res.data?.issues || [];
        setIssueCategories(issues);

        // Initialize one service per issue category
        const initialServices = issues.map((cat) => createInitialService(cat));

        setFormData((prev) => ({
          ...prev,
          services: initialServices,
        }));
      } catch (err) {
        console.error(err);
        toast.error("Failed to load issue categories");
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
      parts[partIndex] = {
        ...parts[partIndex],
        [field]: field === "quantity" ? Number(value) : value,
      };
      newServices[serviceIndex].partsRequired = parts;
      return { ...prev, services: newServices };
    });
  };

  const addPart = (serviceIndex) => {
    setFormData((prev) => {
      const newServices = [...prev.services];
      newServices[serviceIndex].partsRequired.push({
        partName: "",
        quantity: 1,
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitLoading(true);
    setError(null);

    // Basic validation - all services must have name & base price
    const missing = formData.services.some(
      (s) => !s.issueName.trim() || s.pricing.basePrice <= 0,
    );

    if (missing) {
      setError(
        "Please fill in Service Name and Base Price for every issue type.",
      );
      setSubmitLoading(false);
      return;
    }

    try {
      const payload = {
        ...formData,
        services: formData.services.map((s) => ({
          ...s,
          pricing: {
            ...s.pricing,
            discountedPrice: s.pricing.discountedPrice || undefined,
          },
        })),
      };

      await axios.post("/service-offerings/admin/create", payload);
      // or: await adminService.createServiceOffering(payload);

      toast.success("Service offering created successfully!");
      router.push("/admin-dashboard/service-offerings");
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to create service offering",
      );
      console.error(err);
    } finally {
      setSubmitLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="resolve-wrap">
        <p>Loading...</p>
        <div className="respinner"></div>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      <div className="dashboard-header">
        <h1>Create New Service Offering</h1>
      </div>

      <form onSubmit={handleSubmit} className="service-form">
        {/* Device Information */}
        <section className="form-section">
          <h2>Device Information</h2>
          <div className="form-grid">
            <div className="form-group">
              <label>Device Type</label>
              <select
                name="deviceType"
                value={formData.deviceType}
                onChange={handleDeviceChange}
              >
                <option value="phone">Phone</option>
                <option value="tablet">Tablet</option>
                <option value="laptop">Laptop</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div className="form-group">
              <label>Brand *</label>
              <input
                type="text"
                name="brand"
                value={formData.brand}
                onChange={handleDeviceChange}
                placeholder="e.g. Samsung"
                required
              />
            </div>

            <div className="form-group">
              <label>Model *</label>
              <input
                type="text"
                name="model"
                value={formData.model}
                onChange={handleDeviceChange}
                placeholder="e.g. Galaxy S23 Ultra"
                required
              />
            </div>

            <div className="form-group">
              <label>Variant</label>
              <input
                type="text"
                name="variant"
                value={formData.variant}
                onChange={handleDeviceChange}
                placeholder="e.g. 512GB / 1TB"
              />
            </div>

            <div className="form-group">
              <label>Release Year *</label>
              <input
                type="number"
                name="releaseYear"
                value={formData.releaseYear}
                onChange={handleDeviceChange}
                min="2000"
                max={new Date().getFullYear() + 1}
                required
              />
            </div>

            <div className="form-group full-width">
              <label>Model Image</label>
              <input
                type="file"
                name="modelImage"
                value={formData.modelImage}
                onChange={handleDeviceChange}
              />
            </div>

            <div className="form-group full-width">
              <label>Notes / Special Requirements</label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleDeviceChange}
                placeholder="e.g. Flagship device with premium components..."
                rows={3}
              />
            </div>
          </div>
        </section>

        {/* ── Repair Services ── */}
        <section className="form-section">
          <h2>Repair Services (one per issue category)</h2>
          <p className="hint">
            You must provide pricing and name for every category.
          </p>

          {formData.services.map((service, index) => {
            const categoryInfo = issueCategories.find(
              (c) => c.category === service.issueType,
            ) || { label: "Other", description: "" };

            return (
              <div key={index} className="service-block required-service">
                <div className="service-header">
                  <div>
                    <h3>{categoryInfo.label}</h3>
                    <small className="category-slug">{service.issueType}</small>
                  </div>
                </div>

                <div className="form-grid">
                  <div className="form-group">
                    <label>Service Name *</label>
                    <input
                      type="text"
                      value={service.issueName}
                      onChange={(e) =>
                        handleServiceChange(index, "issueName", e.target.value)
                      }
                      placeholder={`e.g. ${categoryInfo.label} Repair`}
                      required
                    />
                  </div>

                  <div className="form-group full-width">
                    <label>Description</label>
                    <textarea
                      value={service.description}
                      onChange={(e) =>
                        handleServiceChange(
                          index,
                          "description",
                          e.target.value,
                        )
                      }
                      placeholder={
                        categoryInfo.description || "Describe the repair..."
                      }
                      rows={2}
                    />
                  </div>

                  <div className="form-group">
                    <label>Base Price (₦) *</label>
                    <input
                      type="number"
                      value={service.pricing.basePrice}
                      onChange={(e) =>
                        handleServiceChange(index, "pricing", {
                          basePrice: Number(e.target.value),
                        })
                      }
                      min="0"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Discounted Price (₦)</label>
                    <input
                      type="number"
                      value={service.pricing.discountedPrice ?? ""}
                      onChange={(e) =>
                        handleServiceChange(index, "pricing", {
                          discountedPrice: e.target.value
                            ? Number(e.target.value)
                            : undefined,
                        })
                      }
                      min="0"
                    />
                  </div>

                  <div className="form-group">
                    <label>Est. Time (hours) *</label>
                    <input
                      type="number"
                      step="0.5"
                      value={service.estimatedRepairTime}
                      onChange={(e) =>
                        handleServiceChange(
                          index,
                          "estimatedRepairTime",
                          Number(e.target.value),
                        )
                      }
                      min="0.1"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Warranty (days) *</label>
                    <input
                      type="number"
                      value={service.warrantyPeriod}
                      onChange={(e) =>
                        handleServiceChange(
                          index,
                          "warrantyPeriod",
                          Number(e.target.value),
                        )
                      }
                      min="0"
                      required
                    />
                  </div>
                </div>

                {/* Parts */}
                <div className="parts-section">
                  <div className="parts-header">
                    <h4>Required Parts</h4>
                    <button
                      type="button"
                      className="btn-add-small"
                      onClick={() => addPart(index)}
                    >
                      + Add Part
                    </button>
                  </div>
                  {service.partsRequired.map((part, pIdx) => (
                    <div key={pIdx} className="part-row">
                      <input
                        type="text"
                        value={part.partName}
                        onChange={(e) =>
                          handlePartChange(
                            index,
                            pIdx,
                            "partName",
                            e.target.value,
                          )
                        }
                        placeholder="e.g. AMOLED Display Assembly"
                      />
                      <input
                        type="number"
                        value={part.quantity}
                        onChange={(e) =>
                          handlePartChange(
                            index,
                            pIdx,
                            "quantity",
                            e.target.value,
                          )
                        }
                        min="1"
                        style={{ width: "80px" }}
                      />
                      <button
                        type="button"
                        className="btn-remove-small"
                        onClick={() => removePart(index, pIdx)}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </section>

        {error && <div className="form-error">{error}</div>}

        <div className="form-actions">
          <button
            type="button"
            className="btn-cancel"
            onClick={() => router.back()}
          >
            Cancel
          </button>
          <button type="submit" className="btn-submit" disabled={submitLoading}>
            {submitLoading ? "Creating..." : "Create Service Offering"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ServiceOfferingCreate;
