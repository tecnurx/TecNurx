"use client";

import { useState, useEffect } from "react";
import "./track.css";
import { Package } from "lucide-react";

export function TrackRepairModal({
  isOpen,
  onClose,
  repairOrder, // Full repair object — available on MyOrders page
  trackData, // From /repairs/{id}/track API — available on both pages
  loading = false,
}) {
  const [isVisible, setIsVisible] = useState(isOpen);

  useEffect(() => {
    setIsVisible(isOpen);
  }, [isOpen]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onClose, 300);
  };

  if (!isVisible) return null;

  // Use real timeline from API if available, otherwise fallback to static
  const apiSteps = trackData?.timeline || [];

  const steps =
    apiSteps.length > 0
      ? apiSteps.map((step, index) => ({
          id: `step-${index}`,
          label: step.label,
          completed: step.completed,
          engineer: step.engineer, // Only present on engineer_assigned step
        }))
      : [
          { id: "1", label: "Quote Requested", completed: true },
          { id: "2", label: "Quote Provided", completed: true },
          { id: "3", label: "Repair Scheduled", completed: true },
          { id: "4", label: "Engineer Assigned", completed: false },
          { id: "5", label: "Repair In Progress", completed: false },
          { id: "6", label: "Repair Completed", completed: false },
        ];

  // Find current active step
  const activeIndex = steps.findIndex((step) => !step.completed);

  const formatDeviceName = (device) => {
    if (!device) return "Unknown Device";
    const brand =
      (device.brand || "").charAt(0).toUpperCase() +
      (device.brand || "").slice(1);
    const model = device.model || "";
    return `${brand} ${model}`.trim();
  };

  // Engineer from trackData (preferred) or fallback to repairOrder
  const engineer = trackData?.engineer || repairOrder?.engineer;
  const engineerName = engineer ? `${engineer.fname} ${engineer.lname}` : null;

  // Line class logic — unchanged from your original
  const getLineClass = (index) => {
    if (index >= steps.length - 1) return "";

    const currentCompleted = steps[index].completed;
    const nextCompleted = steps[index + 1].completed;

    if (currentCompleted && !nextCompleted) return "line-split";
    if (!currentCompleted && !nextCompleted) return "line-ash";
    if (currentCompleted && nextCompleted) return "line-completed";
    return "line-ash";
  };

  return (
    <div className="overlay" onClick={handleClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="modalheader">
          <div>
            <h2>
              Track <span>Repair</span>
            </h2>
            {/* <p
              className="tracking-id"
              style={{ margin: "12px 0 0", fontSize: "14px", color: "#333" }}
            >
              <Package size={16} style={{ marginRight: "6px" }} />
              Order ID:{" "}
              <strong>{repairOrder._id.slice(-8).toUpperCase()}</strong>
            </p> */}
          </div>

          <div className="timersContainer">
            <div>
              <h3>Device</h3>
              <p>{formatDeviceName(repairOrder?.device)}</p>
              <h5>Registered device</h5>
            </div>
            <div>
              <h3>Issue</h3>
              <p>{repairOrder?.issueDescription || "N/A"}</p>
              <h5>Reported problem</h5>
            </div>
          </div>
        </div>

        {/* Engineer Info — only show if we have engineer data */}
        {/* {engineerName && (
          <div
            style={{
              padding: "16px 24px",
              background: "#f9f9f9",
              borderBottom: "1px solid #eee",
              display: "flex",
              alignItems: "center",
              gap: "10px",
              fontSize: "14px",
            }}
          >
            <span>Engineer:</span>
            <strong>{engineerName}</strong>
          </div>
        )} */}

        {/* Timeline */}
        <div className="timelineContainer">
          <div className="line1"></div>
          {steps.map((step, index) => (
            <div key={step.id} className="timelineItem">
              {/* Static timestamp as requested */}
              <p className="timestamp">08/08/2025 09:03 am</p>

              <div
                className={`circle ${
                  step.completed
                    ? "completed"
                    : index === activeIndex
                    ? "active"
                    : ""
                }`}
              >
                {/* Optional: add checkmark or pulse animation later */}
              </div>

              {index < steps.length - 1 && (
                <div className={`line ${getLineClass(index)}`}></div>
              )}

              <div className="content">
                <p className="step-label">{step.label}</p>
                {/* {step.engineer && (
                  <p
                    style={{
                      fontSize: "12px",
                      color: "#666",
                      marginTop: "4px",
                    }}
                  >
                    Assigned to: {step.engineer.fname} {step.engineer.lname}
                  </p>
                )} */}
              </div>
            </div>
          ))}
        </div>

        {/* Close Button */}
        <div className="close-wrap">
          <button
            className="closeButton"
            onClick={handleClose}
            disabled={loading}
          >
            {loading ? "Loading..." : "Close"}
          </button>
        </div>
      </div>
    </div>
  );
}
