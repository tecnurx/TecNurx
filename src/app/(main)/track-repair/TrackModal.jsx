"use client";

import { useState, useEffect } from "react";
import "./track.css";

export function TrackRepairModal({
  isOpen,
  onClose,
  trackingNumber = "THS4343894",
  totalTime = "00:40:00",
  repairTime = "00:00:00",
  steps = [
    {
      id: "1",
      label: "Order Received",
      timestamp: "08/08/2025 09:03 am",
      completed: true,
    },
    {
      id: "2",
      label: "Order Picked Up",
      timestamp: "08/08/2025 09:03 am",
      completed: true,
    },
    {
      id: "3",
      label: "Repair Started",
      timestamp: "08/08/2025 09:03 am",
      completed: false,
    },
    {
      id: "4",
      label: "Repair Completed",
      timestamp: "08/08/2025 09:03 am",
      completed: false,
    },
  ],
}) {
  const [isVisible, setIsVisible] = useState(isOpen);

  useEffect(() => {
    setIsVisible(isOpen);
  }, [isOpen]);

  const handleClose = () => {
    setIsVisible(false);
    onClose();
  };

  const firstIncompleteIndex = steps.findIndex((step) => !step.completed);

  const getLineClass = (index) => {
    const currentCompleted = steps[index].completed;
    const nextCompleted =
      index < steps.length - 1 ? steps[index + 1].completed : true;

    // If current is completed and next is incomplete: split gradient (half yellow, half ash)
    if (currentCompleted && !nextCompleted) {
      return "line-split";
    }
    // If current is incomplete and next is also incomplete: full ash
    if (!currentCompleted && !nextCompleted) {
      return "line-ash";
    }
    // If current is completed and next is completed: full yellow
    if (currentCompleted && nextCompleted) {
      return "line-completed";
    }
    // Last incomplete step has ash line
    return "line-ash";
  };

  if (!isVisible) return null;

  return (
    <div className="overlay" onClick={handleClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="modalheader">
          <h2>
            Track <span>Repair</span>
          </h2>
          <div className="timersContainer">
            <div>
              <h3>Total Time</h3>
              <p>{totalTime}</p>
              <h5>From receipt of order</h5>
            </div>
            <div>
              <h3>Repair Time</h3>
              <p>{repairTime}</p>
              <h5>From start of repair</h5>
            </div>
          </div>
        </div>

        {/* Timeline */}
        <div className="timelineContainer">
          <div className="line1"></div>
          {steps.map((step, index) => (
            <div key={step.id} className="timelineItem">
              {step.timestamp && <p className="timestamp">{step.timestamp}</p>}

              <div
                className={`circle ${step.completed ? "completed" : ""}`}
              ></div>

              {index < steps.length - 1 &&  (
                <div className={`line ${getLineClass(index)}`}></div>
              )}

              {/* Content */}
              <div className="content">
                <p className="step-label">{step.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Close button */}
        <div className="close-wrap">
          <button className="closeButton" onClick={handleClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
