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
} from "lucide-react";
import "./repair.css"; // plain CSS file
import { engService } from "../../../../../services/eng/eng";

const RepairDetailsPage = () => {
  const params = useParams();
  const router = useRouter();
  const repairId = params.repairId;

  const [repair, setRepair] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRepair = async () => {
      try {
        setLoading(true);
        const response = await engService.getRepairbyId(repairId);
        setRepair(response.data?.repair || response.repair || response.data);
      } catch (err) {
        setError("Failed to load repair details");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchRepair();
  }, [repairId]);

  if (loading) {
    return (
      <div className="resolve-wrap">
        <p>Loading...</p>
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

      {/* Status Bar */}
      <div className="status-card">
        <div className="status-info">
          <span className="status-badge status-engineer_assigned">
            {repair.status?.replace(/_/g, " ").toUpperCase()}
          </span>
          <div className="status-date">
            <Clock size={16} />
            Assigned: {new Date(repair.assignedAt).toLocaleString()}
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

      {/* Cost & Warranty */}
      <div className="detail-card cost-card">
        <h2 className="card-title">
          <Banknote size={22} /> Cost & Warranty
        </h2>

        <div className="cost-grid">
          <div className="cost-item">
            <span>Parts Cost</span>
            <strong>₦{repair.estimatedCost?.partsCost?.toLocaleString() || "0"}</strong>
          </div>
          <div className="cost-item">
            <span>Labor Cost</span>
            <strong>₦{repair.estimatedCost?.laborCost?.toLocaleString() || "0"}</strong>
          </div>
          <div className="cost-item total">
            <span>Total Cost</span>
            <strong className="total-amount">
              ₦{repair.estimatedCost?.totalCost?.toLocaleString() || "0"}
            </strong>
          </div>
        </div>

        {repair.warranty?.hasWarranty && (
          <div className="warranty-info">
            <Battery size={20} />
            <div>
              <strong>90-Day Warranty Included</strong>
              <p>Repair is covered under warranty for 90 days</p>
            </div>
          </div>
        )}

        <div className="payment-status">
          <span>Payment Status:</span>
          <strong className="status-paid">{repair.paymentStatus.toUpperCase()}</strong>
        </div>
      </div>
    </div>
  );
};

export default RepairDetailsPage;