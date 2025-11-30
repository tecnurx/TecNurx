"use client";
import React, { useState } from "react";

const Repairs = () => {
  const [gadgetCost, setGadgetCost] = useState("");
  const [selectedIssue, setSelectedIssue] = useState("Broken Screen");
  const [paybackMonths, setPaybackMonths] = useState(6);

  const issues = [
    "Broken Screen",
    "Battery Replacement",
    "Water Damage",
    "Charging Port",
    "Speaker Issue",
    "Camera Problem",
  ];

  // ✅ Corrected function (was using setValue which doesn’t exist)
  const handleRangeChange = (e) => {
    const newValue = e.target.value;
    setPaybackMonths(newValue);

    // calculate the filled % (for CSS var)
    const percent =
      ((newValue - e.target.min) / (e.target.max - e.target.min)) * 100;
    e.target.style.setProperty("--progress", `${percent}%`);
  };

  const cost = gadgetCost ? Number.parseInt(gadgetCost) : 0;
  const minRepair = Math.round(cost * 0.6);
  const maxRepair = Math.round(cost * 0.9);
  const adjustedMonthlyMin = Math.round((minRepair / paybackMonths) * 1.1);
  const adjustedMonthlyMax = Math.round((maxRepair / paybackMonths) * 1.1);

  return (
    <div className="repairs-wrap">
      <div className="repairs-top">
        <span>Repairs</span>
      </div>

      <div className="repair-header">
        <h1>
          What does it <span>cost?</span>
        </h1>
        <p>
          Get an idea of what it costs to fix your gadget using our{" "}
          <span>fix now, pay later</span> system.
        </p>
      </div>

      <div className="repair-details">
        {/*  Gadget Cost */}
        <div className="repair-grid">
          <h1>How much does your gadget cost?</h1>
          <div className="repair-range">
            <span>₦</span>
            <input
              type="number"
              value={gadgetCost}
              onChange={(e) => setGadgetCost(e.target.value)}
              placeholder="0"
              className="gadget-cost"
            />
          </div>
          <p>You can type in your exact amount in the field above</p>
        </div>

        {/*  Device Issue */}
        <div className="repair-grid">
          <h1>What is wrong with the device?</h1>
          <select
            value={selectedIssue}
            onChange={(e) => setSelectedIssue(e.target.value)}
          >
            {issues.map((issue) => (
              <option key={issue} value={issue}>
                {issue}
              </option>
            ))}
          </select>
          <p>Click on the drop down to select the device issue</p>
        </div>

        {/*  Payback Duration */}
        <div className="repair-grid">
          <h1>How long will it take to pay back</h1>
          <div className="repair-range">
            <input
              type="range"
              min="1"
              max="12"
              className="range"
              value={paybackMonths}
              onChange={handleRangeChange}
            />
            <span>{paybackMonths} months</span>
          </div>
          <p>Drag to select. maximum of 12 months</p>
        </div>
      </div>

      <div className="approx-wrap">
        <h1>Our Approximate</h1>
        <div className="approx-deets">
          <div className="approx-text">
            <h3>
              This is how much it will cost you to fix your{" "}
              <span>{selectedIssue}</span>
            </h3>
            <p>
              ₦{minRepair.toLocaleString()} – ₦{maxRepair.toLocaleString()}
            </p>
          </div>
          <div className="approx-text">
            <h3>
              This is how much you’ll pay monthly for{" "}
              <span>“{paybackMonths} months”</span>
            </h3>
            <p>
              ₦{adjustedMonthlyMin.toLocaleString()} – ₦
              {adjustedMonthlyMax.toLocaleString()}
            </p>
          </div>
        </div>
        <button>Request a repair</button>
      </div>
    </div>
  );
};

export default Repairs;
