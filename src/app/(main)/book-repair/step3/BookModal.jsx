"use client";

import { useState, useEffect } from "react";
import "../book.css";

export function BookRepairModal({
  isOpen,
  onClose,
  totalTime = "00:40:00",
  issue = "Screen Replacement",
  pickupAmount = 1200,
  repairAmount = 1200,
  totalAmount = repairAmount + pickupAmount,
}) {
  const [isVisible, setIsVisible] = useState(isOpen);

  useEffect(() => {
    setIsVisible(isOpen);
  }, [isOpen]);

  const handleClose = () => {
    setIsVisible(false);
    onClose();
  };

  if (!isVisible) return null;

  return (
    <div className="overlay" onClick={handleClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="modalheader">
          <h2>Repair Quote</h2>
          <div className="timersContainer">
            <div>
              <h3>Estimated Repair Time</h3>
              <p>{totalTime}</p>
              <h5>
                <span>Days</span> <span>Hours</span> <span>Minutes</span>
              </h5>
            </div>
          </div>
          <div className="modalIssue">
            <h3>Issue</h3>
            <p>{issue}</p>
          </div>
        </div>

        {/* Timeline */}
        <div className="itemContainer">
          <div className="box-wrap">
            <div className="box-left btop">
              <h2>Item</h2>
            </div>
            <div className="box-right btop">
              <h2>Price</h2>
            </div>
            <div className="box-left boxtwo">
              <h3>Pickup</h3>
              <h3>Repair</h3>
            </div>
            <div className="box-right boxtwo">
              <p>₦{pickupAmount}</p>
              <p>₦{repairAmount}</p>
            </div>
            <div className="box-left bbtm">
              <h1>Total</h1>
            </div>
            <div className="box-right bbtm">
              <h1>₦{totalAmount}</h1>
            </div>
          </div>
        </div>

        {/* Close button */}
        <div className="close-wrap">
          <button className="declineButton" onClick={handleClose}>
            Decline
          </button>
          {/* Handle request */}
          <button className="acceptButton" onClick={handleClose}>
            Accept
          </button>
        </div>
      </div>
    </div>
  );
}
