"use client";

import React, { useEffect, useState } from "react";
import "./fees.css";
import { Plus, Trash2, Save, Loader2 } from "lucide-react";
import { adminService } from "../../../../../services/admin/admin";
import { toast } from "@/components/CustomToast";
import TecNurxLoader from "@/components/TecNurxLoader";
import { formatMoneyInput, sanitizeMoneyInput } from "@/lib/formatMoneyInput";

const emptyZone = () => ({
  zone: "",
  label: "",
  state: "",
  citiesText: "",
  isStateDefault: false,
  pickupFee: 2500,
  returnFee: 2500,
});

export default function AdminFeesPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [diagnosticFee, setDiagnosticFee] = useState(5000);
  const [dropoffFee, setDropoffFee] = useState(0);
  const [draftTtlHours, setDraftTtlHours] = useState(24);
  const [currency, setCurrency] = useState("NGN");
  const [chargeReturnLegAtBooking, setChargeReturnLegAtBooking] = useState(true);
  const [chargeDiagnosticFeeOnPayNow, setChargeDiagnosticFeeOnPayNow] = useState(true);
  const [zones, setZones] = useState([]);

  const applyConfigData = (cfg) => {
    if (!cfg) return;
    setDiagnosticFee(cfg.diagnosticFee ?? 5000);
    setDropoffFee(cfg.dropoffFee ?? 0);
    setDraftTtlHours(cfg.draftTtlHours ?? 24);
    setCurrency(cfg.currency || "NGN");
    setChargeReturnLegAtBooking(
      cfg.chargeReturnLegAtBooking !== undefined
        ? Boolean(cfg.chargeReturnLegAtBooking)
        : true
    );
    setChargeDiagnosticFeeOnPayNow(
      cfg.chargeDiagnosticFeeOnPayNow !== undefined
        ? Boolean(cfg.chargeDiagnosticFeeOnPayNow)
        : true
    );
    const list = Array.isArray(cfg.deliveryZones) ? cfg.deliveryZones : [];
    setZones(
      list.map((z) => ({
        zone: z.zone || "",
        label: z.label || "",
        state: z.state || "",
        citiesText: Array.isArray(z.cities) ? z.cities.join(", ") : "",
        isStateDefault: Boolean(z.isStateDefault),
        pickupFee: z.pickupFee ?? 0,
        returnFee: z.returnFee ?? 0,
      }))
    );
  };

  useEffect(() => {
    const fetchFees = async () => {
      try {
        setLoading(true);
        const res = await adminService.getFees();
        const cfg =
          res?.data?.effective ||
          res?.data?.config ||
          res?.data?.fees ||
          res?.effective ||
          res?.data ||
          res;
        applyConfigData(cfg);
      } catch (err) {
        console.error("Failed to load fee config:", err);
        toast.error(err?.response?.data?.message || "Failed to load fee configuration");
      } finally {
        setLoading(false);
      }
    };
    fetchFees();
  }, []);

  const handleZoneChange = (idx, field, value) => {
    setZones((prev) =>
      prev.map((z, i) => (i === idx ? { ...z, [field]: value } : z))
    );
  };

  const handleAddZone = () => {
    setZones((prev) => [...prev, emptyZone()]);
  };

  const handleRemoveZone = (idx) => {
    setZones((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      const payload = {
        diagnosticFee: Number(diagnosticFee) || 0,
        dropoffFee: Number(dropoffFee) || 0,
        chargeReturnLegAtBooking: Boolean(chargeReturnLegAtBooking),
        chargeDiagnosticFeeOnPayNow: Boolean(chargeDiagnosticFeeOnPayNow),
        draftTtlHours: Number(draftTtlHours) || 24,
        currency: currency.trim() || "NGN",
        deliveryZones: zones.map((z) => ({
          zone: z.zone.trim(),
          label: z.label.trim(),
          state: z.state.trim(),
          cities: z.citiesText
            .split(",")
            .map((c) => c.trim())
            .filter(Boolean),
          isStateDefault: Boolean(z.isStateDefault),
          pickupFee: Number(z.pickupFee) || 0,
          returnFee: Number(z.returnFee) || 0,
        })),
      };

      const res = await adminService.updateFees(payload);
      const updated =
        res?.data?.effective ||
        res?.data?.config ||
        res?.data?.fees ||
        res?.data ||
        null;
      if (updated) applyConfigData(updated);
      toast.success("Fee configuration updated and cache cleared!");
    } catch (err) {
      console.error("Failed to update fee config:", err);
      toast.error(err?.response?.data?.message || "Failed to update fee configuration");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <TecNurxLoader minHeight="65vh" size="lg" />;
  }

  return (
    <div className="admin-fees-page">
      <div className="fees-header">
        <div>
          <h1 className="fees-title">Fee Configuration</h1>
          <p className="fees-subtitle">
            Manage global booking fees, draft TTL, and delivery zone pricing.
          </p>
        </div>

        <button
          type="button"
          className="btn-fees-primary"
          disabled={saving}
          onClick={handleSave}
        >
          {saving ? (
            <>
              <Loader2 className="animate-spin" size={16} /> Saving...
            </>
          ) : (
            <>
              <Save size={16} /> Save Changes
            </>
          )}
        </button>
      </div>

      {/* Hero Banner */}
      <div className="admin-hero-banner" style={{ marginBottom: "24px" }}>
        <div className="admin-hero-left">
          <span className="admin-hero-pill">
            <span>●</span>
            <span>Pricing Rules</span>
          </span>
          <h2 className="admin-hero-title">
            {zones.length} active delivery {zones.length === 1 ? "zone" : "zones"}
          </h2>
          <p className="admin-hero-sub">
            Global diagnostic fee: {currency} {Number(diagnosticFee || 0).toLocaleString()} ·
            Office drop-off: {currency} {Number(dropoffFee || 0).toLocaleString()}
          </p>
        </div>
        <div className="admin-hero-actions">
          <button
            type="button"
            className="admin-btn-yellow"
            disabled={saving}
            onClick={handleSave}
          >
            {saving ? (
              <>
                <Loader2 className="animate-spin" size={16} /> Saving...
              </>
            ) : (
              <>
                <Save size={16} /> Save Changes
              </>
            )}
          </button>
        </div>
      </div>

      <form onSubmit={handleSave}>
        {/* Global Settings Card */}
        <div className="fees-card">
          <div className="fees-card-header">
            <h2 className="fees-card-title">Global Fee Settings</h2>
          </div>

          <div className="fees-grid-2">
            <div className="fees-field">
              <label>Diagnostic Fee ({currency})</label>
              <input
                type="text"
                inputMode="numeric"
                value={formatMoneyInput(diagnosticFee)}
                onChange={(e) => setDiagnosticFee(sanitizeMoneyInput(e.target.value))}
              />
            </div>

            <div className="fees-field">
              <label>Office Drop-off Fee ({currency})</label>
              <input
                type="text"
                inputMode="numeric"
                value={formatMoneyInput(dropoffFee)}
                onChange={(e) => setDropoffFee(sanitizeMoneyInput(e.target.value))}
              />
            </div>

            <div className="fees-field">
              <label>Draft TTL (Hours)</label>
              <input
                type="number"
                min="1"
                value={draftTtlHours}
                onChange={(e) => setDraftTtlHours(e.target.value)}
              />
            </div>

            <div className="fees-field">
              <label>Currency</label>
              <input
                type="text"
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
              />
            </div>
          </div>

          <div className="fees-toggles-row">
            <label className="fees-checkbox-label">
              <input
                type="checkbox"
                checked={chargeReturnLegAtBooking}
                onChange={(e) => setChargeReturnLegAtBooking(e.target.checked)}
              />
              <span>Charge return delivery leg at booking</span>
            </label>

            <label className="fees-checkbox-label">
              <input
                type="checkbox"
                checked={chargeDiagnosticFeeOnPayNow}
                onChange={(e) => setChargeDiagnosticFeeOnPayNow(e.target.checked)}
              />
              <span>Charge diagnostic fee on Pay Now bookings</span>
            </label>
          </div>
        </div>

        {/* Delivery Zones Card */}
        <div className="fees-card">
          <div className="fees-card-header">
            <h2 className="fees-card-title">Delivery Zones ({zones.length})</h2>
            <button
              type="button"
              className="btn-fees-outline"
              onClick={handleAddZone}
            >
              <Plus size={15} /> Add Zone
            </button>
          </div>

          {zones.length === 0 ? (
            <p style={{ color: "#64748b", margin: 0, fontSize: "14px" }}>
              No delivery zones configured. Click &ldquo;Add Zone&rdquo; to create one.
            </p>
          ) : (
            zones.map((z, idx) => (
              <div key={idx} className="zone-box">
                <div className="zone-box-top">
                  <h3 className="zone-box-title">
                    {z.label || z.zone || `Zone ${idx + 1}`}
                  </h3>
                  <button
                    type="button"
                    className="btn-fees-danger"
                    onClick={() => handleRemoveZone(idx)}
                  >
                    <Trash2 size={14} /> Remove
                  </button>
                </div>

                <div className="fees-grid-3">
                  <div className="fees-field">
                    <label>Zone Key</label>
                    <input
                      type="text"
                      placeholder="lagos_mainland"
                      value={z.zone}
                      onChange={(e) => handleZoneChange(idx, "zone", e.target.value)}
                    />
                  </div>
                  <div className="fees-field">
                    <label>Label</label>
                    <input
                      type="text"
                      placeholder="Lagos Mainland"
                      value={z.label}
                      onChange={(e) => handleZoneChange(idx, "label", e.target.value)}
                    />
                  </div>
                  <div className="fees-field">
                    <label>State</label>
                    <input
                      type="text"
                      placeholder="Lagos"
                      value={z.state}
                      onChange={(e) => handleZoneChange(idx, "state", e.target.value)}
                    />
                  </div>
                </div>

                <div className="fees-grid-3" style={{ marginTop: "14px" }}>
                  <div className="fees-field">
                    <label>Cities (comma-separated)</label>
                    <input
                      type="text"
                      placeholder="Ikeja, Yaba, Surulere"
                      value={z.citiesText}
                      onChange={(e) =>
                        handleZoneChange(idx, "citiesText", e.target.value)
                      }
                    />
                  </div>
                  <div className="fees-field">
                    <label>Pickup Fee ({currency})</label>
                    <input
                      type="text"
                      inputMode="numeric"
                      value={formatMoneyInput(z.pickupFee)}
                      onChange={(e) =>
                        handleZoneChange(idx, "pickupFee", sanitizeMoneyInput(e.target.value))
                      }
                    />
                  </div>
                  <div className="fees-field">
                    <label>Return Fee ({currency})</label>
                    <input
                      type="text"
                      inputMode="numeric"
                      value={formatMoneyInput(z.returnFee)}
                      onChange={(e) =>
                        handleZoneChange(idx, "returnFee", sanitizeMoneyInput(e.target.value))
                      }
                    />
                  </div>
                </div>

                <div style={{ marginTop: "12px" }}>
                  <label className="fees-checkbox-label">
                    <input
                      type="checkbox"
                      checked={z.isStateDefault}
                      onChange={(e) =>
                        handleZoneChange(idx, "isStateDefault", e.target.checked)
                      }
                    />
                    <span>State default zone (fallback when city does not match)</span>
                  </label>
                </div>
              </div>
            ))
          )}
        </div>
      </form>
    </div>
  );
}
