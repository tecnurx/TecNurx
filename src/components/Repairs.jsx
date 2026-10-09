"use client";
import Link from "next/link";
import React, { useState, useEffect } from "react";
import axios from "../../lib/axios";

const DEFAULT_ISSUES = [
  { category: "cracked_screen", label: "Broken Screen" },
  { category: "battery_replacement", label: "Battery Replacement" },
  { category: "water_damage", label: "Water Damage" },
  { category: "charging_port", label: "Charging Port" },
  { category: "speaker_issue", label: "Speaker Issue" },
  { category: "camera_problem", label: "Camera Problem" },
];

const Repairs = () => {
  const [gadgetCost, setGadgetCost] = useState("");
  const [selectedIssueCategory, setSelectedIssueCategory] = useState("");
  const [paybackMonths, setPaybackMonths] = useState(6);
  const [issueOptions, setIssueOptions] = useState(DEFAULT_ISSUES);

  const [calculationResult, setCalculationResult] = useState(null);
  const [calculating, setCalculating] = useState(false);
  const [calcError, setCalcError] = useState(null);

  // Fetch issue options from backend (/repairs/issues)
  useEffect(() => {
    const fetchIssues = async () => {
      try {
        const response = await axios.get("/repairs/issues");
        const data =
          response.data?.data?.issues ||
          response.data?.issues ||
          response.data?.data ||
          response.data;

        if (Array.isArray(data) && data.length > 0) {
          const formatted = data.map((item) => {
            if (typeof item === "string") {
              return {
                category: item,
                label: item
                  .replace(/_/g, " ")
                  .replace(/\b\w/g, (l) => l.toUpperCase()),
              };
            }
            return {
              category: item.category || item.name || item.value || item.id,
              label: item.label || item.name || item.title || item.category || item.value,
            };
          });
          setIssueOptions(formatted);
          if (formatted[0]?.category) {
            setSelectedIssueCategory(formatted[0].category);
          }
        }
      } catch (err) {
        console.error("Failed to fetch /repairs/issues:", err);
      }
    };
    fetchIssues();
  }, []);

  // Send request after selecting issue or changing payback months
  useEffect(() => {
    if (!selectedIssueCategory) return;

    const calculatePayback = async () => {
      setCalculating(true);
      setCalcError(null);
      try {
        const response = await axios.post("/service-offerings/calculate-payback", {
          issueCategory: selectedIssueCategory,
          paybackMonths: Number(paybackMonths),
        });

        const data = response.data?.data || response.data;
        setCalculationResult(data);
      } catch (err) {
        console.error("Failed to calculate payback:", err);
        setCalcError(err.response?.data?.message || "Failed to calculate payback");
      } finally {
        setCalculating(false);
      }
    };

    calculatePayback();
  }, [selectedIssueCategory, paybackMonths]);

  const handleRangeChange = (e) => {
    const newValue = Number(e.target.value);
    setPaybackMonths(newValue);

    const percent =
      ((newValue - e.target.min) / (e.target.max - e.target.min)) * 100;
    e.target.style.setProperty("--progress", `${percent}%`);
  };

  const currentIssueObj = issueOptions.find(
    (item) => item.category === selectedIssueCategory
  );
  const currentIssueLabel = currentIssueObj
    ? currentIssueObj.label
    : selectedIssueCategory;

  const formatDisplayTotal = () => {
    if (!calculationResult) return null;
    const res = calculationResult;

    if (
      res.repairCost &&
      res.repairCost.min !== undefined &&
      res.repairCost.max !== undefined
    ) {
      return `₦${res.repairCost.min.toLocaleString()} – ₦${res.repairCost.max.toLocaleString()}`;
    }
    if (res.minCost !== undefined && res.maxCost !== undefined) {
      return `₦${res.minCost.toLocaleString()} – ₦${res.maxCost.toLocaleString()}`;
    }
    if (res.minRepair !== undefined && res.maxRepair !== undefined) {
      return `₦${res.minRepair.toLocaleString()} – ₦${res.maxRepair.toLocaleString()}`;
    }

    const single =
      res.totalCost ?? res.estimatedCost ?? res.totalPrice ?? res.cost ?? res.amount;

    if (single !== undefined && single !== null) {
      return `₦${Number(single).toLocaleString()}`;
    }

    return null;
  };

  const formatDisplayMonthly = () => {
    if (!calculationResult) return null;
    const res = calculationResult;

    if (
      res.monthlyPayment &&
      typeof res.monthlyPayment === "object" &&
      res.monthlyPayment.min !== undefined &&
      res.monthlyPayment.max !== undefined
    ) {
      return `₦${res.monthlyPayment.min.toLocaleString()} – ₦${res.monthlyPayment.max.toLocaleString()}`;
    }
    if (res.adjustedMonthlyMin !== undefined && res.adjustedMonthlyMax !== undefined) {
      return `₦${res.adjustedMonthlyMin.toLocaleString()} – ₦${res.adjustedMonthlyMax.toLocaleString()}`;
    }
    if (res.monthlyMin !== undefined && res.monthlyMax !== undefined) {
      return `₦${res.monthlyMin.toLocaleString()} – ₦${res.monthlyMax.toLocaleString()}`;
    }

    const single =
      typeof res.monthlyPayment === "number"
        ? res.monthlyPayment
        : res.monthlyPayback ??
          res.monthlyAmount ??
          res.monthlyInstallment ??
          res.monthlyCost;

    if (single !== undefined && single !== null) {
      return `₦${Number(single).toLocaleString()}`;
    }

    const singleTotal =
      res.totalCost ?? res.estimatedCost ?? res.totalPrice ?? res.cost ?? res.amount;
    if (singleTotal && paybackMonths > 0) {
      const calculated = Math.round(Number(singleTotal) / Number(paybackMonths));
      return `₦${calculated.toLocaleString()}`;
    }

    return null;
  };

  const totalDisplay = formatDisplayTotal();
  const monthlyDisplay = formatDisplayMonthly();

  return (
    <section id="GetQuote" className="GetQuote">
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
          {/* Gadget Cost (Field kept in UI) */}
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

          {/* Device Issue */}
          <div className="repair-grid">
            <h1>What is wrong with the device?</h1>
            <select
              value={selectedIssueCategory}
              onChange={(e) => setSelectedIssueCategory(e.target.value)}
              aria-label="issue"
            >
              {issueOptions.map((issue) => (
                <option key={issue.category} value={issue.category}>
                  {issue.label}
                </option>
              ))}
            </select>
            <p>Click on the drop down to select the device issue</p>
          </div>

          {/* Payback Duration */}
          <div className="repair-grid">
            <h1>How long will it take to pay back</h1>
            <div className="repair-range">
              <input
                type="range"
                aria-label="range"
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
              <h2>
                This is how much it will cost you to fix your{" "}
                <span>{currentIssueLabel}</span>
              </h2>
              <p>
                {calculating
                  ? "Calculating..."
                  : calcError
                  ? "Unable to fetch estimate"
                  : totalDisplay || "₦0"}
              </p>
            </div>
            <div className="approx-text">
              <h3>
                This is how much you’ll pay monthly for{" "}
                <span>“{paybackMonths} months”</span>
              </h3>
              <p>
                {calculating
                  ? "Calculating..."
                  : calcError
                  ? "—"
                  : monthlyDisplay || "₦0"}
              </p>
            </div>
          </div>
          <Link href="/dashboard/book-repair">Request a repair</Link>
        </div>
      </div>
    </section>
  );
};

export default Repairs;
