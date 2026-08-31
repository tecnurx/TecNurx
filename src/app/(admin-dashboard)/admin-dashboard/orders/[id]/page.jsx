"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { adminService } from "../../../../../../services/admin/admin";
import { repairService } from "../../../../../../services/repairs";
import { AlertCircle, ArrowLeft, RefreshCw, User, Wrench, Smartphone } from "lucide-react";

export default function OrderDetails() {
  const { id } = useParams();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [repair, setRepair] = useState(null);
  const [engineers, setEngineers] = useState([]);
  const [selectedEngineerId, setSelectedEngineerId] = useState("");
  
  const [reassigning, setReassigning] = useState(false);
  const [reassignSuccess, setReassignSuccess] = useState("");

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      setReassignSuccess("");
      const res = await adminService.getAvailableEngineersForRepair(id);
      const data = res.data || res;
      
      setRepair(data);
      setEngineers(data.engineers || []);
      
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || err.message || "Failed to load repair details.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchData();
    }
  }, [id]);

  const handleReassign = async () => {
    if (!selectedEngineerId) return;
    
    try {
      setReassigning(true);
      setReassignSuccess("");
      
      await adminService.reassignRepair(id, selectedEngineerId);
      setReassignSuccess("Repair successfully reassigned.");
      
      // Refresh the repair data
      await fetchData();
      setSelectedEngineerId("");
      
    } catch (err) {
      setError(err.response?.data?.message || "Failed to reassign repair.");
    } finally {
      setReassigning(false);
    }
  };

  if (loading) {
    return (
      <div className="resolve-wrap" style={{ padding: "40px" }}>
        <p>Loading repair details...</p>
        <div className="respinner"></div>
      </div>
    );
  }

  if (error && !repair) {
    return (
      <div className="resolve-wrap error" style={{ padding: "40px" }}>
        <AlertCircle size={32} color="#ef4444" />
        <p>{error}</p>
        <button onClick={fetchData} style={{ padding: "8px 16px", marginTop: "12px", cursor: "pointer" }}>Retry</button>
      </div>
    );
  }

  return (
    <div className="admin-dashboard" style={{ padding: "24px" }}>
      <button 
        onClick={() => router.back()} 
        style={{ display: "flex", alignItems: "center", gap: "8px", background: "none", border: "none", cursor: "pointer", color: "#64748b", marginBottom: "12px", fontWeight: "600" }}
      >
        <ArrowLeft size={18} /> Back to Orders
      </button>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
        <h1 style={{ fontSize: "24px", margin: 0 }}>Repair Order #{id.slice(-8)}</h1>
        <span style={{ padding: "6px 12px", borderRadius: "20px", fontSize: "14px", fontWeight: "600", textTransform: "uppercase", background: "#f1f5f9" }}>
          {repair?.serviceLocation?.type || "Repair Request"}
        </span>
      </div>

      {reassignSuccess && (
        <div style={{ background: "#dcfce7", color: "#166534", padding: "12px 16px", borderRadius: "8px", marginBottom: "24px", display: "flex", alignItems: "center", gap: "8px" }}>
          <AlertCircle size={18} /> {reassignSuccess}
        </div>
      )}
      
      {error && repair && (
        <div style={{ background: "#fee2e2", color: "#991b1b", padding: "12px 16px", borderRadius: "8px", marginBottom: "24px", display: "flex", alignItems: "center", gap: "8px" }}>
          <AlertCircle size={18} /> {error}
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "24px" }}>
        {/* Service Location Info */}
        <div style={{ background: "white", padding: "24px", borderRadius: "12px", border: "1px solid #e2e8f0" }}>
          <h2 style={{ fontSize: "18px", marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
            <User size={20} /> Service Location Details
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "32px" }}>
            <div>
              <p style={{ color: "#64748b", fontSize: "13px", margin: "0 0 4px 0" }}>Label</p>
              <p style={{ fontWeight: "500", margin: 0 }}>{repair?.serviceLocation?.label || "N/A"}</p>
            </div>
            <div>
              <p style={{ color: "#64748b", fontSize: "13px", margin: "0 0 4px 0" }}>Type</p>
              <p style={{ fontWeight: "500", margin: 0, textTransform: "capitalize" }}>{repair?.serviceLocation?.type || "N/A"}</p>
            </div>
            <div style={{ gridColumn: "span 2" }}>
              <p style={{ color: "#64748b", fontSize: "13px", margin: "0 0 4px 0" }}>Street Address</p>
              <p style={{ margin: 0, background: "#f8fafc", padding: "12px", borderRadius: "8px", fontSize: "14px" }}>
                {repair?.serviceLocation?.streetAddress || "No street address provided."}
              </p>
            </div>
            <div style={{ gridColumn: "span 2" }}>
              <p style={{ color: "#64748b", fontSize: "13px", margin: "0 0 4px 0" }}>Formatted Address</p>
              <p style={{ margin: 0, background: "#f8fafc", padding: "12px", borderRadius: "8px", fontSize: "14px" }}>
                {repair?.serviceLocation?.formattedAddress || "N/A"}
              </p>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "16px" }}>
            <div>
              <p style={{ color: "#64748b", fontSize: "13px", margin: "0 0 4px 0" }}>City</p>
              <p style={{ fontWeight: "500", margin: 0 }}>{repair?.serviceLocation?.city || "N/A"}</p>
            </div>
            <div>
              <p style={{ color: "#64748b", fontSize: "13px", margin: "0 0 4px 0" }}>State</p>
              <p style={{ fontWeight: "500", margin: 0 }}>{repair?.serviceLocation?.state || "N/A"}</p>
            </div>
            <div>
              <p style={{ color: "#64748b", fontSize: "13px", margin: "0 0 4px 0" }}>Postal Code</p>
              <p style={{ fontWeight: "500", margin: 0 }}>{repair?.serviceLocation?.postalCode || "N/A"}</p>
            </div>
          </div>
        </div>

        {/* Engineer Assignment */}
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          <div style={{ background: "white", padding: "24px", borderRadius: "12px", border: "1px solid #e2e8f0" }}>
            <h2 style={{ fontSize: "18px", marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
              <Wrench size={20} /> Current Engineer
            </h2>
            <p style={{ color: "#94a3b8", fontStyle: "italic", margin: 0 }}>Information unavailable in this view.</p>
          </div>

          <div style={{ background: "white", padding: "24px", borderRadius: "12px", border: "1px solid #e2e8f0" }}>
            <h2 style={{ fontSize: "18px", marginBottom: "16px" }}>Reassign Repair</h2>
            <p style={{ fontSize: "13px", color: "#64748b", marginBottom: "16px" }}>Select an available engineer to reassign this repair task.</p>
            
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <select 
                value={selectedEngineerId} 
                onChange={(e) => setSelectedEngineerId(e.target.value)}
                style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #cbd5e1", outline: "none" }}
              >
                <option value="">-- Select Engineer --</option>
                {engineers.map(eng => (
                  <option key={eng._id} value={eng._id}>
                    {eng.fname} {eng.lname} ({eng.email})
                  </option>
                ))}
              </select>

              <button 
                onClick={handleReassign}
                disabled={!selectedEngineerId || reassigning}
                style={{ 
                  width: "100%", 
                  padding: "12px", 
                  background: !selectedEngineerId || reassigning ? "#94a3b8" : "#0f172a", 
                  color: "white", 
                  border: "none", 
                  borderRadius: "8px", 
                  fontWeight: "600", 
                  cursor: !selectedEngineerId || reassigning ? "not-allowed" : "pointer",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  gap: "8px"
                }}
              >
                {reassigning && <RefreshCw size={16} className="spin-animation" />}
                {reassigning ? "Reassigning..." : "Reassign Engineer"}
              </button>
            </div>
            
            {engineers.length === 0 && (
              <p style={{ fontSize: "12px", color: "#ef4444", marginTop: "12px" }}>
                No available engineers found.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
