"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import {
  ArrowLeft,
  Clock,
  Smartphone,
  User,
  MapPin,
  DollarSign,
  Battery,
  Loader2,
  Banknote,
  AlertCircle,
  Edit,
  Plus,
  Save,
  X,
  Wrench,
  FileText,
} from "lucide-react";
import "./repair.css";
import { engService } from "../../../../../services/eng/eng";
import { toast } from "@/components/CustomToast";

const RepairDetailsPage = () => {
  const params = useParams();
  const router = useRouter();
  const repairId = params.repairId;

  const [repair, setRepair] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Engineer action states
  const [statusLoading, setStatusLoading] = useState(false);
  const [notes, setNotes] = useState("");
  const [noteSaving, setNoteSaving] = useState(false);
  const [parts, setParts] = useState([{ partName: "", quantity: 1, cost: "" }]);
  const [costData, setCostData] = useState({
    laborCost: "",
    partsCost: "",
    additionalCosts: "",
  });
  const [costSaving, setCostSaving] = useState(false);

  // Available statuses (filtered to likely engineer actions)
  const engineerStatuses = [
    "engineer_assigned",
    "in_progress",
    "awaiting_parts",
    "completed",
    "cancelled",
  ];

  useEffect(() => {
    const fetchRepair = async () => {
      try {
        setLoading(true);
        const response = await engService.getRepairbyId(repairId);
        const repairData =
          response.data?.repair || response.repair || response.data;
        setRepair(repairData);

        // Pre-fill costs if already set
        if (repairData?.actualCost || repairData?.estimatedCost) {
          const costs = repairData.actualCost || repairData.estimatedCost;
          setCostData({
            laborCost: costs?.laborCost || "",
            partsCost: costs?.partsCost || "",
            additionalCosts: costs?.additionalCosts || "",
          });
        }

        // Pre-fill latest note if exists
        if (repairData?.engineerNotes) {
          setNotes(repairData.engineerNotes || "");
        }

        if (repairData.partsUsed?.length > 0) {
        setParts(
          repairData.partsUsed.map((p) => ({
            _id: p._id,
            partName: p.partName || "",
            quantity: p.quantity || 1,
            cost: p.cost || 0,
          }))
        );}
      } catch (err) {
        setError("Failed to load repair details");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchRepair();
  }, [repairId]);

  const handleStatusChange = async (newStatus) => {
    // Optional: prevent changing to the same status
    if (repair?.status === newStatus) {
      toast.info("Repair is already in this status");
      return;
    }

    if (!confirm(`Change status to "${newStatus.replace(/_/g, " ")}"?`)) {
      return;
    }

    try {
      setStatusLoading(true);

      const updatedRepair = await engService.updateRepairStatus(
        repairId,
        newStatus,
      );

      setRepair(updatedRepair);

      toast.success(`Status updated to ${newStatus.replace(/_/g, " ")}`);
    } catch (err) {
      console.error("Status update failed:", err);

      const errorMessage =
        err.response?.data?.message ||
        err.message ||
        "Failed to update repair status";

      toast.error(errorMessage);
    } finally {
      setStatusLoading(false);
    }
  };

  const handleSaveNote = async () => {
    if (!notes.trim()) return toast.error("Please enter a note");

    try {
      setNoteSaving(true);
      const updated = await engService.addorUpdateRepairNote(repairId, notes);
      setRepair((prev) => ({ ...prev, ...updated }));
      toast.success("Note saved successfully");
    } catch (err) {
      toast.error("Failed to save note");
      console.error(err);
    } finally {
      setNoteSaving(false);
    }
  };

  const handleAddPart = () => {
    setParts([...parts, { partName: "", quantity: 1, cost: "" }]);
  };

  const handlePartChange = (index, field, value) => {
    const newParts = [...parts];
    newParts[index][field] = value;
    setParts(newParts);
  };

  const handleRemovePart = (index) => {
    setParts(parts.filter((_, i) => i !== index));
  };

  const handleSaveParts = async () => {
    const validParts = parts.filter(
      (p) => p.partName.trim() && p.quantity > 0 && p.cost !== "",
    );

    if (validParts.length === 0)
      return toast.error("Add at least one valid part");

    try {
      const response = await engService.addPartsUsedInRepair(
        repairId,
        validParts,
      );
      setRepair((prev) => ({ ...prev, ...response }));
      toast.success("Parts added successfully");
    } catch (err) {
      toast.error("Failed to add parts");
      console.error(err);
    }
  };

  const handleCostChange = (field, value) => {
    setCostData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSaveCosts = async () => {
    const payload = {
      laborCost: Number(costData.laborCost) || 0,
      partsCost: Number(costData.partsCost) || 0,
      additionalCosts: Number(costData.additionalCosts) || 0,
    };

    try {
      setCostSaving(true);
      const updated = await engService.updateRepairCost(repairId, payload);
      setRepair((prev) => ({ ...prev, ...updated }));
      toast.success("Costs updated successfully");
    } catch (err) {
      toast.error("Failed to update costs");
      console.error(err);
    } finally {
      setCostSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="resolve-wrap">
        <p>Loading repair details...</p>
        <div className="respinner"></div>
      </div>
    );
  }

  if (error || !repair) {
    return (
      <div className="repair-error">
        <AlertCircle size={64} />
        <h2>{error || "Repair not found"}</h2>
        <button onClick={() => router.back()} className="btn-back">
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="repair-details-container">
      {/* Header */}
      <div className="repair-header">
        <button onClick={() => router.back()} className="btn-back">
          <ArrowLeft size={20} /> Back to Dashboard
        </button>
        <h1>Repair #{repair._id?.slice(-8)}</h1>
      </div>

      {/* Status Section with Engineer Controls */}
      <div className="status-card">
        <div className="status-info">
          <span className={`status-badge status-${repair.status}`}>
            {repair.status?.replace(/_/g, " ").toUpperCase()}
          </span>
          <div className="status-date">
            <Clock size={16} />
            Assigned: {new Date(repair.assignedAt).toLocaleString()}
          </div>
        </div>

        {/* Engineer status update controls */}
        <div className="engineer-actions">
          <h3>Update Status</h3>
          <div className="status-buttons">
            {engineerStatuses.map((status) => (
              <button
                key={status}
                onClick={() => handleStatusChange(status)}
                disabled={statusLoading || repair.status === status}
                className={`status-btn ${repair.status === status ? "active" : ""}`}
              >
                {statusLoading ? (
                  <Loader2 className="animate-spin" size={16} />
                ) : (
                  status.replace(/_/g, " ")
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="details-grid">
        {/* Device & Issue */}
        <div className="detail-card">
          <h2 className="card-title">
            <Smartphone size={22} /> Device & Issue
          </h2>
          <div className="detail-row">
            <span>Device:</span>
            <strong>
              {repair.device?.brand} {repair.device?.model}
            </strong>
          </div>
          <div className="detail-row">
            <span>Type:</span>
            <strong className="capitalize">{repair.device?.deviceType}</strong>
          </div>
          <div className="detail-row">
            <span>Issue:</span>
            <strong className="capitalize">
              {repair.issueCategory?.replace(/_/g, " ")}
            </strong>
          </div>
          <div className="detail-row description">
            <span>Description:</span>
            <p>{repair.issueDescription}</p>
          </div>

          {repair.photos?.length > 0 && (
            <div className="photo-section">
              <h3>Issue Photos</h3>
              <div className="photo-grid">
                {repair.photos.map((photo, idx) => (
                  <div key={idx} className="photo-item">
                    <Image
                      src={photo}
                      alt={`Issue photo ${idx + 1}`}
                      width={400}
                      height={400}
                      className="photo-img"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Customer Info */}
        <div className="detail-card">
          <h2 className="card-title">
            <User size={22} /> Customer Information
          </h2>

          <div className="customer-profile">
            {repair.user?.photo && (
              <Image
                src={repair.user.photo}
                alt={`${repair.user.fname} ${repair.user.lname}`}
                width={80}
                height={80}
                className="customer-avatar"
              />
            )}
            <div>
              <h3>
                {repair.user?.fname} {repair.user?.lname}
              </h3>
              <p className="customer-email">{repair.user?.email}</p>
            </div>
          </div>

          <div className="detail-row">
            <span>Phone:</span>
            <strong>{repair.user?.phoneNumber}</strong>
          </div>
          <div className="detail-row">
            <span>Service Type:</span>
            <strong className="capitalize">
              {repair.serviceType?.replace(/_/g, " ")}
            </strong>
          </div>

          {repair.pickupAddress && (
            <div className="address-section">
              <div className="flex-start">
                <MapPin size={18} />
                <div>
                  <strong>{repair.pickupAddress.label}</strong>
                  <p>{repair.pickupAddress.streetAddress}</p>
                  <p>
                    {repair.pickupAddress.city}, {repair.pickupAddress.state}
                  </p>
                  <p className="formatted-address">
                    {repair.pickupAddress.formattedAddress}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Engineer Action Sections */}
      <div className="engineer-section-grid">
        {/* Notes */}
        <div className="detail-card engineer-card">
          <h2 className="card-title">
            <FileText size={22} /> Repair Notes
          </h2>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Enter repair notes, findings, resolution steps..."
            rows={5}
            className="repair-note-textarea"
          />
          <button
            onClick={handleSaveNote}
            disabled={noteSaving || !notes.trim()}
            className="btn-save"
          >
            {noteSaving ? (
              <>
                <Loader2 className="animate-spin" size={16} /> Saving...
              </>
            ) : (
              <>
                <Save size={16} /> Save Note
              </>
            )}
          </button>
        </div>

        {/* Parts Used */}
        <div className="detail-card engineer-card">
          <h2 className="card-title">
            <Wrench size={22} /> Parts Used
          </h2>

          {parts.length === 0 ? (
            <p className="text-gray-500 italic">No parts recorded yet</p>
          ) : (
            parts.map((part, index) => (
              <div
                key={index}
                className="part-row flex gap-3 items-center mb-3"
              >
                <input
                  type="text"
                  placeholder="Part name (e.g. LCD Screen)"
                  value={part.partName}
                  onChange={(e) =>
                    handlePartChange(index, "partName", e.target.value)
                  }
                  className="flex-1"
                />
                <input
                  type="number"
                  placeholder="Qty"
                  min="1"
                  value={part.quantity}
                  onChange={(e) =>
                    handlePartChange(index, "quantity", e.target.value)
                  }
                  className="part-qty"
                />
                <input
                  type="number"
                  placeholder="₦ Cost"
                  min="0"
                  step="100"
                  value={part.cost}
                  onChange={(e) =>
                    handlePartChange(index, "cost", e.target.value)
                  }
                  className="w-28"
                />
                <button
                  onClick={() => handleRemovePart(index)}
                  className="btn-remove p-2"
                  title="Remove part"
                >
                  <X size={18} />
                </button>
              </div>
            ))
          )}

          <div className="flex gap-4 mt-4">
            <button
              onClick={handleAddPart}
              className="btn-add flex items-center gap-1"
            >
              <Plus size={16} /> Add Part
            </button>

            <button
              onClick={handleSaveParts}
              className="btn-save flex items-center gap-1"
              // disabled={/* optional: add loading state if needed */}
            >
              <Save size={16} /> Save Parts
            </button>
          </div>
        </div>

        {/* Final Cost */}
        <div className="detail-card cost-card engineer-card">
          <h2 className="card-title">
            <Banknote size={22} /> Final Cost
          </h2>

          <div className="cost-grid">
            <div className="cost-item">
              <label>Parts Cost</label>
              <input
                type="number"
                value={costData.partsCost}
                onChange={(e) => handleCostChange("partsCost", e.target.value)}
                placeholder="0"
              />
            </div>
            <div className="cost-item">
              <label>Labor Cost</label>
              <input
                type="number"
                value={costData.laborCost}
                onChange={(e) => handleCostChange("laborCost", e.target.value)}
                placeholder="0"
              />
            </div>
            <div className="cost-item">
              <label>Additional Costs</label>
              <input
                type="number"
                value={costData.additionalCosts}
                onChange={(e) =>
                  handleCostChange("additionalCosts", e.target.value)
                }
                placeholder="0"
              />
            </div>
          </div>

          <button
            onClick={handleSaveCosts}
            disabled={costSaving}
            className="btn-save mt-4"
          >
            {costSaving ? (
              <>
                <Loader2 className="animate-spin" size={16} /> Saving...
              </>
            ) : (
              "Update Final Costs"
            )}
          </button>

          <div className="payment-status mt-4">
            <span>Payment Status:</span>
            <strong className="status-paid">
              {repair.paymentStatus?.toUpperCase()}
            </strong>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RepairDetailsPage;
