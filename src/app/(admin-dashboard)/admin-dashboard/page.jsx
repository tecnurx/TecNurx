"use client";

import React, { useState, useEffect } from "react";
import "./admin.css";
import { UserCog, User, CircleCheck, CreditCard } from "lucide-react";
import { adminService } from "../../../../services/admin/admin";
import AdminGraph from "../components/Graph";

const AdminDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [payments, setPayments] = useState([]);
  const [payStats, setPayStats] = useState({});
  const [userStats, setUserStats] = useState({});
  const [engStats, setEngStats] = useState({});

  // Fetch  data
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch transactions
        const res = await adminService.getAllPayments();
        const engRes = await await adminService.getAllEngineers();
        const userRes = await adminService.getAllUsers();

        setPayments(res.data.payments);
        setPayStats(res.stats);
        setEngStats(engRes.stats);
        setUserStats(userRes.stats)

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
      title: "Completed Repairs",
      value: "41",
      icon: <CircleCheck size={24} />,
    },
    {
      id: 3,
      title: "Users",
      value: userStats?.byRole?.user,
      icon: <User size={24} />,
    },
    {
      id: 4,
      title: "Engineers",
      value: engStats?.total,
      icon: <UserCog size={24} />,
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
        <h1>Welcome, Admin!</h1>
        <p>Here’s a quick summary.</p>
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

      <AdminGraph />

      {/* Recent Transactions */}
      <div className="adcard">
        <h3>Recent Transactions</h3>
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
              {payments.slice(0,5).map((transaction, index) => (
                <tr key={index}>
                  <td>{transaction._id}</td>
                  <td>
                    {transaction.repairId?.issueCategory.replace(/_/g, " ")}
                  </td>
                  <td>{transaction?.amount.toLocaleString()}</td>
                  <td>{new Date(transaction.dateInitiated).toLocaleString()}</td>
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

export default AdminDashboard;
