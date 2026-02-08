"use client";

import React, { useState, useEffect } from "react";
import {
  UserCog,
  User,
  CircleCheck,
  CreditCard,
  ShieldCheck,
  ShieldAlert,
} from "lucide-react";
import "./aduser.css";
import { adminService } from "../../../../../services/admin/admin";
import Link from "next/link";

const AdminUsers = () => {
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);
  const [userStat, setUserStat] = useState([]);

  // Fetch  data
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch users
        const res = await adminService.getAllUsers();
        console.log("Users:", res);
        setUsers(res?.data.users);
        setUserStat(res?.stats);
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
      title: "Total Users",
      value: userStat?.total,
      icon: <CreditCard size={24} />,
    },
    {
      id: 2,
      title: "Verified Users",
      value: userStat?.verified,
      icon: <ShieldCheck size={24} />,
    },
    {
      id: 3,
      title: "Unverified Users",
      value: userStat?.unverified,
      icon: <ShieldAlert size={24} />,
    },
    {
      id: 4,
      title: "Admin",
      value: userStat?.byRole?.admin,
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
                <th>Full Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Gender</th>
                <th>Created At</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user, index) => (
                <tr key={index}>
                  <td>
                    {user.fname} {user.lname}
                  </td>
                  <td>{user.email}</td>
                  <td>{user.phoneNumber}</td>
                  <td>{user.gender}</td>
                  <td>{user.createdAt}</td>
                  <td>
                    <Link
                      href={`/admin-dashboard/users/${user._id}`}
                      className="view-repair"
                    >
                      View
                    </Link>
                  </td>
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
