"use client";
import React, { useState } from "react";
import "./track.css";
import { TrackRepairModal } from "./TrackModal";
import Footer from "@/components/footer/Footer";

const TrackRepair = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [trackingData, setTrackingData] = useState({
    trackingNumber: "",
    totalTime: "00:40:00",
    repairTime: "00:00:00",
  });

  const handleRequestRepair = () => {
    if (!trackingData.trackingNumber.trim()) {
      alert("Please enter your tracking number.");
      return;
    }
    setIsModalOpen(true);
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
              value={trackingData.trackingNumber}
              onChange={(e) =>
                setTrackingData({
                  ...trackingData,
                  trackingNumber: e.target.value,
                })
              }
            />
          </div>
          <button onClick={handleRequestRepair}>Track Repair</button>
        </div>
      </div>

      <TrackRepairModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        trackingNumber={trackingData.trackingNumber}
        totalTime={trackingData.totalTime}
        repairTime={trackingData.repairTime}
      />
      <Footer/>
    </div>
  );
};

export default TrackRepair;
