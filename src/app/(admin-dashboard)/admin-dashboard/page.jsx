"use client";

import React, { useState, useEffect } from "react";
import "./admin.css";
import { UserCog, User, CircleCheck, CreditCard, ArrowRight } from "lucide-react";
import { adminService } from "../../../../services/admin/admin";
import AdminGraph from "../components/Graph";
import Link from "next/link";
import AdminTable from "@/components/AdminTable";

const AdminDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [payments, setPayments] = useState([]);
  const [payStats, setPayStats] = useState({});
  const [userStats, setUserStats] = useState({});
  const [engStats, setEngStats] = useState({});
  const [completedRepairsCount, setCompletedRepairsCount] = useState(0);

  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [payRes, engRes, userRes, repairRes] = await Promise.allSettled([
          adminService.getAllPayments(),
          adminService.getAllEngineers(),
          adminService.getAllUsers(),
          adminService.getAllRepairs(),
        ]);

        if (payRes.status === "fulfilled") {
          const pData = payRes.value;
          const pList = pData?.data?.payments || pData?.payments || (Array.isArray(pData?.data) ? pData.data : []);
          setPayments(Array.isArray(pList) ? pList : []);
          setPayStats(pData?.stats || pData?.data?.stats || {});
        }

        if (engRes.status === "fulfilled") {
          setEngStats(engRes.value?.stats || engRes.value?.data?.stats || {});
        }

        if (userRes.status === "fulfilled") {
          setUserStats(userRes.value?.stats || userRes.value?.data?.stats || {});
        }

        if (repairRes.status === "fulfilled") {
          const rData = repairRes.value;
          const repairs = rData?.data?.repairs || rData?.repairs || (Array.isArray(rData?.data) ? rData.data : []);
          const completedCount = Array.isArray(repairs)
            ? repairs.filter((r) => r.status === "completed").length
            : rData?.stats?.completed || 0;
          setCompletedRepairsCount(completedCount);
        }
      } catch (err) {
        console.error("Failed to load dashboard data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const totalRevenue = payStats?.totalRevenue ?? 0;
  const userCount = userStats?.byRole?.user ?? userStats?.total ?? "—";
  const engCount = engStats?.total ?? "—";

  const stats = [
    {
      id: 1,
      title: "Total Transaction",
      value: "₦" + Number(totalRevenue).toLocaleString(),
      icon: <CreditCard size={24} />,
    },
    {
      id: 2,
      title: "Completed Repairs",
      value: completedRepairsCount || "0",
      icon: <CircleCheck size={24} />,
    },
    {
      id: 3,
      title: "Users",
      value: userCount,
      icon: <User size={24} />,
    },
    {
      id: 4,
      title: "Engineers",
      value: engCount,
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

      {/* Recent Transactions Table */}
      <AdminTable
        title="Recent Transactions"
        subtitle="Latest platform payments and repair settlement activities"
        data={payments}
        columns={[
          {
            header: "Order No.",
            accessor: "_id",
            sortable: true,
            render: (t) => (
              <span style={{ fontWeight: "700", color: "#0f172a" }}>
                #{t._id ? t._id.slice(-8) : "N/A"}
              </span>
            ),
          },
          {
            header: "Type",
            accessor: "type",
            render: (t) => (
              <span style={{ textTransform: "capitalize", color: "#334155" }}>
                {t.repairId?.issueCategory
                  ? t.repairId.issueCategory.replace(/_/g, " ")
                  : t.type || "Payment"}
              </span>
            ),
          },
          {
            header: "Amount",
            accessor: "amount",
            sortable: true,
            render: (t) => (
              <span style={{ fontWeight: "600", color: "#0f172a" }}>
                ₦{Number(t?.amount || 0).toLocaleString()}
              </span>
            ),
          },
          {
            header: "Date",
            accessor: "dateInitiated",
            sortable: true,
            render: (t) => {
              const rawDate = t.dateInitiated || t.createdAt;
              return (
                <span style={{ color: "#64748b", fontSize: "13px" }}>
                  {rawDate ? new Date(rawDate).toLocaleDateString() : "—"}
                </span>
              );
            },
          },
          {
            header: "Status",
            accessor: "status",
            sortable: true,
            render: (t) => {
              const status = (t.status || "completed").toLowerCase();
              const isSuccess = status === "success" || status === "completed" || status === "paid";
              const isFailed = status === "failed";
              return (
                <span
                  style={{
                    padding: "3px 9px",
                    borderRadius: "12px",
                    fontSize: "12px",
                    fontWeight: "600",
                    textTransform: "capitalize",
                    background: isSuccess ? "#dcfce7" : isFailed ? "#fee2e2" : "#fef3c7",
                    color: isSuccess ? "#15803d" : isFailed ? "#b91c1c" : "#b45309",
                  }}
                >
                  {t.status || "Completed"}
                </span>
              );
            },
          },
        ]}
        actions={
          <Link
            href="/admin-dashboard/transactions"
            className="view-all-tx-btn"
          >
            <span>View All Transactions</span>
            <ArrowRight size={14} />
          </Link>
        }
        initialPageSize={5}
        pageSizeOptions={[5, 10, 20]}
        searchPlaceholder="Filter recent transactions..."
        emptyMessage="No recent transactions found."
      />
    </div>
  );
};

export default AdminDashboard;
