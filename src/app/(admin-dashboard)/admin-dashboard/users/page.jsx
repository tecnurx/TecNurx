"use client";

import React, { useState, useEffect } from "react";
import {
  UserCog,
  User,
  CircleCheck,
  CreditCard,
  Eye,
  AlertCircle,
} from "lucide-react";
import "./aduser.css";
import { adminService } from "../../../../../services/admin/admin";
import Link from "next/link";
import AdminTable from "@/components/AdminTable";

const AdminUsers = () => {
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);
  const [userStat, setUserStat] = useState({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await adminService.getAllUsers();
        const userList =
          res?.data?.users ||
          res?.users ||
          (Array.isArray(res?.data) ? res.data : []);
        setUsers(userList);
        setUserStat(res?.stats || res?.data?.stats || {});
      } catch (err) {
        console.error("Failed to load users:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const stats = [
    {
      id: 1,
      title: "Total Users",
      value: userStat?.totalUsers ?? users.length,
      icon: <User size={24} />,
    },
    {
      id: 2,
      title: "Active Users",
      value: userStat?.activeUsers ?? users.filter((u) => u.isActive !== false).length,
      icon: <CircleCheck size={24} />,
    },
    {
      id: 3,
      title: "Verified Users",
      value: userStat?.verifiedUsers ?? users.filter((u) => u.isVerified).length,
      icon: <CircleCheck size={24} />,
    },
    {
      id: 4,
      title: "Engineers",
      value: userStat?.engineers ?? users.filter((u) => u.role === "engineer").length,
      icon: <UserCog size={24} />,
    },
  ];

  const columns = [
    {
      header: "Full Name",
      accessor: "fname",
      sortable: true,
      render: (u) => (
        <span style={{ fontWeight: "600", color: "#0f172a" }}>
          {u.fname || u.lname
            ? `${u.fname || ""} ${u.lname || ""}`.trim()
            : u.name || "User"}
        </span>
      ),
    },
    {
      header: "Email",
      accessor: "email",
      sortable: true,
      render: (u) => <span style={{ color: "#475569" }}>{u.email}</span>,
    },
    {
      header: "Phone",
      accessor: "phoneNumber",
      render: (u) => u.phoneNumber || u.phone || "—",
    },
    {
      header: "Role",
      accessor: "role",
      sortable: true,
      render: (u) => (
        <span
          style={{
            padding: "3px 8px",
            borderRadius: "10px",
            fontSize: "12px",
            fontWeight: "600",
            textTransform: "capitalize",
            background: u.role === "admin" ? "#fef3c7" : u.role === "engineer" ? "#e0f2fe" : "#f1f5f9",
            color: u.role === "admin" ? "#b45309" : u.role === "engineer" ? "#0369a1" : "#475569",
          }}
        >
          {u.role || "Customer"}
        </span>
      ),
    },
    {
      header: "Gender",
      accessor: "gender",
      render: (u) => (
        <span style={{ textTransform: "capitalize" }}>{u.gender || "—"}</span>
      ),
    },
    {
      header: "Created At",
      accessor: "createdAt",
      sortable: true,
      render: (u) => (
        <span style={{ color: "#64748b", fontSize: "13px" }}>
          {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : "—"}
        </span>
      ),
    },
    {
      header: "Action",
      align: "center",
      render: (u) => (
        <Link
          href={`/admin-dashboard/users/${u._id || u.id}`}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "4px",
            padding: "6px 12px",
            background: "#f1f5f9",
            border: "1px solid #cbd5e1",
            borderRadius: "6px",
            fontSize: "12px",
            fontWeight: "600",
            color: "#0f172a",
            textDecoration: "none",
          }}
        >
          <Eye size={13} /> View
        </Link>
      ),
    },
  ];

  const tableFilters = [
    {
      key: "role",
      label: "All Roles",
      options: [
        { value: "customer", label: "Customer" },
        { value: "engineer", label: "Engineer" },
        { value: "admin", label: "Admin" },
      ],
    },
  ];

  if (loading && users.length === 0) {
    return (
      <div className="resolve-wrap">
        <p>Loading users...</p>
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

      {/* Responsive Users Table */}
      <AdminTable
        title={`Registered Users (${users.length})`}
        subtitle="Manage customer, engineer, and administrator profiles"
        data={users}
        columns={columns}
        filters={tableFilters}
        searchPlaceholder="Search by name, email, phone..."
        initialPageSize={10}
        emptyMessage="No users found matching your search."
      />
    </div>
  );
};

export default AdminUsers;
