"use client";

import React, { useState, useEffect } from "react";
import { UserCog, User, CircleCheck, CreditCard } from "lucide-react";
import "./aduser.css";
import { adminService } from "../../../../../services/admin/admin";

const AdminUsers = () => {
  const [loading, setLoading] = useState(true);

  // Fetch  data
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch users
        const res = await adminService.getAllUsers();
        console.log("Users:", res);
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
      value: "₦900,000",
      icon: <CreditCard size={24} />,
    },
    {
      id: 2,
      title: "Completed Repairs",
      value: "41",
      icon: <CircleCheck size={24} />,
    },
    {
      id: 3,
      title: "Users",
      value: "1000",
      icon: <User size={24} />,
    },
    {
      id: 4,
      title: "Engineers",
      value: "10",
      icon: <UserCog size={24} />,
    },
  ];

  const recentTransactions = [
    {
      orderNo: "#ORDER12345",
      reference: "100004250321004101294447195544",
      type: "Credit",
      amount: "₦15,000",
      date: "23/05/2025, 11:59:05",
      status: "Completed",
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
      <div className="dashboard-header">
        <h1>Users</h1>
      </div>
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

      {/* Recent Transactions */}
      <div className="adcard">
        <div className="adtable-container">
          <table className="addata-table">
            <thead>
              <tr>
                <th>Order No.</th>
                <th>Reference</th>
                <th>Type</th>
                <th>Amount</th>
                <th>Date</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {recentTransactions.map((transaction, index) => (
                <tr key={index}>
                  <td>{transaction.orderNo}</td>
                  <td>{transaction.reference}</td>
                  <td>{transaction.type}</td>
                  <td>{transaction.amount}</td>
                  <td>{transaction.date}</td>
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

export default AdminUsers;
