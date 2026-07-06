"use client";
import "./servid.css";
import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { adminService } from "../../../../../../services/admin/admin";

const ServicebyId = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
    const params = useParams();
    const router = useRouter();
    const serviceId = params.serviceId;

  useEffect(() => {
    const fetchServices = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await adminService.getServicesbyId(serviceId);

        // Adjust according to actual response shape
        const data = res.data?.serviceOfferings || res.serviceOfferings || [];
      } catch (err) {
        console.error("Failed to load service offerings:", err);
        setError(err.message || "Failed to load gadget services.");
      } finally {
        setLoading(false);
      }
    };

    fetchServices();
  }, []);

  if (loading) {
    return (
      <div className="resolve-wrap">
        <p>Loading service details...</p>
        <div className="respinner"></div>
      </div>
    );
  }

  return <div>ServicebyId</div>;
};

export default ServicebyId;
