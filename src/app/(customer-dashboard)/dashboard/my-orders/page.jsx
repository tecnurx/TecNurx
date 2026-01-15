"use client";
import React, { useEffect, useState } from "react";
import "./orders.css";
import { Calendar, Wrench, Package, Clock, MapPin, User } from "lucide-react";
import { repairService } from "../../../../../services/repairs";
import { TrackRepairModal } from './../../../(landing-page)/track-repair/TrackModal';
import Link from "next/link";

const MyOrders = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [trackData, setTrackData] = useState(null); // Real timeline from API
  const [loadingTrack, setLoadingTrack] = useState(false);
  const [orders, setOrders] = useState([]);  
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserRepairs = async () => {
      try {
        const res = await repairService.getUserRepairs();
        setOrders(res.data.repairs || []);
      } catch (err) {
        console.error("Failed to fetch user repairs:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchUserRepairs();
  }, []);

  const openTrackingModal = async (order) => {
    setSelectedOrder(order);
    setLoadingTrack(true);
    setIsModalOpen(true);

    try {
      const res = await repairService.trackRepair(order._id);
      setTrackData(res.data); // { currentStatus, timeline, engineer }
    } catch (err) {
      console.error("Failed to fetch tracking data:", err);
      setTrackData(null);
    } finally {
      setLoadingTrack(false);
    }
  };

  const formatDeviceName = (device) => {
    if (!device) return "Unknown Device";
    const brand = (device.brand || "").charAt(0).toUpperCase() + (device.brand || "").slice(1);
    const model = device.model || "";
    return `${brand} ${model}`.trim();
  };

  const formatEngineerName = (engineer) => {
    if (!engineer) return "Not assigned";
    return `${engineer.fname} ${engineer.lname}`;
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const getStatusInfo = (status) => {
    switch (status) {
      case "engineer_assigned":
        return { color: "#3b82f6", label: "Engineer Assigned" };
      case "in_progress":
      case "in_repair":
        return { color: "#f59e0b", label: "In Progress" };
      case "completed":
        return { color: "#10b981", label: "Completed" };
      default:
        return { color: "#6b7280", label: "Pending" };
    }
  };

  if (loading) {
    return (
      <div className="resolve-wrap">
        <p>Loading...</p>
        <div className="respinner"></div>
      </div>
    );
  }

  return (
    <>
      <div className="orders-page">
        <div className="orders-header">
          <h1>My Orders</h1>
          <p>Track and manage all your repair requests</p>
        </div>

        {orders.length === 0 ? (
          <div className="empty-orders">
            <Wrench size={64} color="#9ca3af" />
            <p>No repair orders yet.</p>
            <Link href='/dashboard/book-repair' className="request-repair-btn">Request a Repair</Link>
          </div>
        ) : (
          <div className="orders-list">
            {orders.map((item) => {
              const statusInfo = getStatusInfo(item.status);

              return (
                <div key={item._id} className="order-card">
                  <div className="order-main">
                    <div className="order-id-date">
                      <strong className="order-id">
                        {item._id.slice(-8).toUpperCase()}
                      </strong>
                      <span className="order-date">
                        <Calendar size={14} />
                        {formatDate(item.createdAt)}
                      </span>
                    </div>

                    <div className="order-details">
                      <h3>{formatDeviceName(item.device)}</h3>
                      <p className="service">{item.issueDescription}</p>

                      <div className="order-meta">
                        <span>
                          <Clock size={14} />
                          Assigned: {formatDate(item.assignedAt)}
                        </span>
                      </div>
                    </div>

                    <div className="order-status">
                      <span
                        className="status-badge"
                        style={{
                          backgroundColor: statusInfo.color + "20",
                          color: statusInfo.color,
                        }}
                      >
                        {statusInfo.label}
                      </span>
                    </div>
                  </div>

                  <div className="order-actions">
                    <button
                      onClick={() => openTrackingModal(item)}
                      className="track-btn"
                      disabled={loadingTrack}
                    >
                      <Package size={18} />
                      {loadingTrack ? "Loading..." : "Track Repair"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Pass both original order + real track data */}
      <TrackRepairModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setTrackData(null);
        }}
        repairOrder={selectedOrder}
        trackData={trackData}
        loading={loadingTrack}
      />
    </>
  );
};

export default MyOrders;