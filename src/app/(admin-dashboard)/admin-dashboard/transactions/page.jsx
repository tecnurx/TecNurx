"use client";

import React, { useState, useEffect } from "react";
import "./adtran.css";
import { adminService } from "../../../../../services/admin/admin";
import { RotateCcw, CreditCard, CircleCheck } from "lucide-react";

const AdminTransactions = () => {
  const [loading, setLoading] = useState(true);
  const [payments, setPayments] = useState([]);
  const [payStats, setPayStats] = useState({});

  // Fetch  data
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch transactions
        const res = await adminService.getAllPayments();

        setPayStats(res.stats);
        setPayments(res.data.payments);

        console.log("Payments :", res.data.payments);
      } catch (err) {
        console.error("Failed to load data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const stats = [
    {
      id: 1,
      title: "Total Transaction",
      value: "₦" + payStats?.totalRevenue?.toLocaleString(),
      icon: <CreditCard size={24} />,
    },
    {
      id: 2,
      title: "Completed Payments",
      value: payStats?.completed,
      icon: <CircleCheck size={24} />,
    },
    {
      id: 3,
      title: "Pending Payments",
      value: payStats?.pending,
      icon: <RotateCcw size={24} />,
    },
    {
      id: 4,
      title: "Pending Amount",
      value: "₦" + payStats?.pendingAmount?.toLocaleString(),
      icon: <RotateCcw size={24} />,
    },
  ];

  if (loading) {
    return (
      <div className="resolve-wrap">
        <p>Loading...</p>
        <div className="respinner"></div>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      {/* Stats Cards */}
      <div className="dashboard-cards">
        {stats.map((item) => (
          <div key={item.id} className="stat-card">
            <div>
              <span>{item.title}</span>
              <h3>{item.value}</h3>
            </div>
            {item.icon}
          </div>
        ))}
      </div>

      <div className="dashboard-header">
        <h1>Transactions ({payments.length})</h1>
      </div>
      <div className="adcard">
        <div className="adtable-container">
          <table className="addata-table">
            <thead>
              <tr>
                <th>Order No.</th>
                <th>Type</th>
                <th>Amount</th>
                <th>Date</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {payments.map((transaction, index) => (
                <tr key={index}>
                  <td>{transaction._id}</td>
                  <td>
                    {transaction.repairId?.issueCategory.replace(/_/g, " ")}
                  </td>
                  <td>{transaction?.amount.toLocaleString()}</td>
                  <td>
                    {new Date(transaction.dateInitiated).toLocaleString()}
                  </td>
                  <td>{transaction.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminTransactions;
