// app/admin/users/[userId]/page.tsx
"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import {
  ArrowLeft,
  User,
  Mail,
  Phone,
  Calendar,
  ShieldCheck,
  Clock,
  AlertCircle,
  Loader2,
} from "lucide-react";
import "./userid.css"; // we'll define this below
import { adminService } from "../../../../../../services/admin/admin";

const UserDetailsPage = () => {
  const { userId } = useParams();
  const router = useRouter();

  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        setLoading(true);
        const response = await adminService.getUserbyId(userId);
        setUserData(response.data);
      } catch (err) {
        setError("Failed to load user details. Please try again.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [userId]);

  if (loading) {
    return (
      <div className="resolve-wrap">
        <p>Loading...</p>
        <div className="respinner"></div>
      </div>
    );
  }

  if (error || !userData) {
    return (
      <div className="error-container">
        <AlertCircle size={64} className="error-icon" />
        <h2>{error || "User not found"}</h2>
        <button onClick={() => router.back()} className="btn-back">
          Go Back
        </button>
      </div>
    );
  }

  const { user, stats } = userData;

  return (
    <div className="user-details-container">
      {/* Header */}
      <div className="page-header">
        <button onClick={() => router.back()} className="btn-back">
          <ArrowLeft size={20} /> Back to Users
        </button>
        <h1>User Profile</h1>
      </div>

      <div className="user-profile-card">
        <div className="user-avatar-section">
          <div className="avatar-wrapper">
            {user.photo && user.photo !== "default.jpg" ? (
              <Image
                src={user.photo}
                alt={`${user.fname} ${user.lname}`}
                width={120}
                height={120}
                className="user-avatar"
              />
            ) : (
              <div className="default-avatar">
                <User size={60} />
              </div>
            )}
          </div>
          <h2 className="user-name">
            {user.fname} {user.lname}
          </h2>
          <span className="user-role">{user.role.toUpperCase()}</span>
        </div>

        <div className="user-info-grid">
          <div className="info-item">
            <Mail size={20} />
            <div>
              <label>Email</label>
              <p>{user.email}</p>
            </div>
          </div>

          <div className="info-item">
            <Phone size={20} />
            <div>
              <label>Phone Number</label>
              <p>{user.phoneNumber || "Not provided"}</p>
            </div>
          </div>

          <div className="info-item">
            <Calendar size={20} />
            <div>
              <label>Date of Birth</label>
              <p>
                {user.dateOfBirth
                  ? new Date(user.dateOfBirth).toLocaleDateString("en-NG", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })
                  : "Not provided"}
              </p>
            </div>
          </div>

          <div className="info-item">
            <User size={20} />
            <div>
              <label>Gender</label>
              <p className="capitalize">{user.gender || "Not specified"}</p>
            </div>
          </div>

          <div className="info-item">
            <ShieldCheck size={20} />
            <div>
              <label>Verification Status</label>
              <p className={user.isVerified ? "verified" : "not-verified"}>
                {user.isVerified ? "Verified" : "Not Verified"}
              </p>
            </div>
          </div>

          <div className="info-item">
            <Clock size={20} />
            <div>
              <label>Joined</label>
              <p>{user.createdAt}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Card */}
      <div className="stats-card">
        <h3>User Activity Summary</h3>
        <div className="stats-grid">
          <div className="stat-box">
            <h4>Total Devices</h4>
            <p className="stat-value">{stats?.totalDevices}</p>
          </div>
          <div className="stat-box">
            <h4>Total Repairs</h4>
            <p className="stat-value">{stats?.totalRepairs}</p>
          </div>
          <div className="stat-box">
            <h4>Completed</h4>
            <p className="stat-value completed">{stats?.completedRepairs}</p>
          </div>
          <div className="stat-box">
            <h4>Pending</h4>
            <p className="stat-value pending">{stats?.pendingRepairs}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDetailsPage;