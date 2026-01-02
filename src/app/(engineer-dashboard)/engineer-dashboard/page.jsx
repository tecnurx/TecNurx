"use client";

import React, { useState, useEffect } from "react";
import "./engineer.css";

const EngineerDashboard = () => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <div className="resolve-wrap">
        <p>Loading...</p>
        <div className="respinner"></div>
      </div>
    );
  }

  return (
    <div className="dashboard-overview">
      {/* Wallet Balance Card */}
      <div className="balance-card">
        <h2>Wallet Balance</h2>
        <div className="balance-amount">₦300,000</div>
        <button className="btn-primary">Withdraw</button>

        <div className="search-bar">
          <input type="text" placeholder="Search by order number" />
          <button className="btn-search">Search</button>
        </div>
      </div>

      {/* Main Sections */}
      <div className="sections-grid">
        {/* My Repairs */}
        <div className="card">
          <h3>My Repairs</h3>
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Order No.</th>
                  <th>Date Received</th>
                  <th>Date Released</th>
                  <th>Fault Fixed</th>
                  <th>Repair Status</th>
                  <th>Amount</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>00000000</td>
                  <td>02-13-2025</td>
                  <td>03-13-2025</td>
                  <td>iPhone 13 Screen Replacement</td>
                  <td>Satisfactory</td>
                  <td>₦15,000</td>
                </tr>
                {/* Add more rows dynamically in real app */}
              </tbody>
            </table>
          </div>
        </div>

        {/* My Payments */}
        <div className="card">
          <h3>My Payments</h3>
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Order No.</th>
                  <th>Fault Fixed</th>
                  <th>Payment Status</th>
                  <th>Amount</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>00000000</td>
                  <td>iPhone 13 Screen Replacement</td>
                  <td>Full Payment</td>
                  <td>₦15,000</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* My Transactions - Full Width */}
        <div className="card transactions-card">
          <h3>My Transactions</h3>
          <div className="transaction-list">
            <div className="transaction-item">
              <span className="date">05-05-2025</span>
              <div className="details">
                <span className="icon withdrawal">Withdrawal</span>
                <span className="ref">Ref: xxxxxxxxxxxx</span>
              </div>
              <span className="amount withdrawal">-₦25,000</span>
            </div>
            <div className="transaction-item">
              <span className="date">05-05-2025</span>
              <div className="details">
                <span className="icon topup">Wallet Top Up</span>
                <span className="ref">Ref: xxxxxxxxxxxx</span>
              </div>
              <span className="amount topup">+₦120,000</span>
            </div>
            <div className="transaction-item">
              <span className="date">06-05-2025</span>
              <div className="details">
                <span className="icon withdrawal">Withdrawal</span>
                <span className="ref">Ref: xxxxxxxxxxxx</span>
              </div>
              <span className="amount withdrawal">-₦100,000</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EngineerDashboard;
