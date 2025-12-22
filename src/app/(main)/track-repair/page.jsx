"use client";
import React, { useState } from "react";
import "./track.css";
import { TrackRepairModal } from "./TrackModal";
import Footer from "@/components/footer/Footer";
import { Loader2 } from "lucide-react";
import { repairService } from "../../../../services/repairs";

const TrackRepair = () => {
  const [trackingNumber, setTrackingNumber] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [repairData, setRepairData] = useState(null); // Will hold real data from API
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const trackRepair = async () => {
    const trimmed = trackingNumber.trim();

    if (!trimmed) {
      setError("Please enter your tracking number.");
      return;
    }

    setError("");
    setLoading(true);

    try {
      const response = await repairService.trackRepair(trimmed);

      // Assuming API returns something like:
      // { repair: { ... }, timeline: [...], totalTime, repairTime, ... }
      setRepairData(response.data || response); // Adjust based on your actual response shape
      console.log(response)

      setIsModalOpen(true); // Open modal with real data
    } catch (err) {
      const message =
        err.response?.data?.message ||
        err.message ||
        "Tracking number not found. Please check and try again.";

      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !loading) {
      trackRepair();
    }
  };

  return (
    <div>
      <div className="section-wrap">
        <div className="header">
          <h1>
            Track your <span>repair</span>
          </h1>
          <p>
            Follow your device's journey every step of the way, so you're always
            in the loop.
          </p>
        </div>

        <div className="track-form">
          <div className="form-wrap">
            <div>
              <label>Tracking Number</label>
              <p>
                Enter your tracking number below to see your repair progress
              </p>
            </div>
            <input
              type="text"
              placeholder="E.g. THS4343894"
              value={trackingNumber}
              onChange={(e) => setTrackingNumber(e.target.value.toUpperCase())} // Optional: force uppercase
              onKeyPress={handleKeyPress}
              disabled={loading}
            />
          </div>

          <button
            onClick={trackRepair}
            disabled={loading}
            className="track-btn"
          >
            {loading ? (
              <>
                <Loader2 size={18} className="spin" />
                Tracking...
              </>
            ) : (
              "Track Repair"
            )}
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div
            className="alertt error"
            style={{ marginTop: "20px", textAlign: "center" }}
          >
            {error}
          </div>
        )}
      </div>

      {/* Pass real repair data to modal */}
      <TrackRepairModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setRepairData(null); // Optional: clean up
        }}
        repairData={repairData} // ← Now using real API data
      />

      <Footer />
    </div>
  );
};

export default TrackRepair;
