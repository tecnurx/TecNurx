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
import "./engid.css"; // plain CSS file
import { adminService } from "../../../../../../services/admin/admin";

const EngineerDetailsPage = () => {
  const params = useParams();
  const router = useRouter();
  const engineerId = params.engineerId;

  const [engineer, setEngineer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchEngineer = async () => {
      try {
        setLoading(true);
        const response = await adminService.getEngineerbyId(engineerId);
        setResetEngineerpair(response.data);
      } catch (err) {
        setError("Failed to load engineer details");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchEngineer();
  }, [engineerId]);

  if (loading) {
    return (
      <div className="resolve-wrap">
        <p>Loading...</p>
        <div className="respinner"></div>
      </div>
    );
  }

  if (error || !engineer) {
    return (
      <div className="repair-error">
        <AlertCircle size={64} />
        <h2>{error || "Engineer not found"}</h2>
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
      </div>
    </div>
  );
};

export default EngineerDetailsPage;
