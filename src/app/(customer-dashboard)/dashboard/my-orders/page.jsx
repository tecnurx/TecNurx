// MyOrders.jsx
"use client";
import React, { useEffect, useState } from "react";
import "./orders.css";
import { TrackRepairModal } from "@/app/(main)/track-repair/TrackModal";
import { Calendar, Wrench, Package, Clock, MapPin } from "lucide-react";
import { repairService } from "../../../../../services/repairs";

const MyOrders = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);

  useEffect(() => {
    const fetchUserRepairs = async () => {
      try {
        const res = await repairService.getUserRepairs();
        console.log(res);
      } catch (err) {
        console.error("Failed to fetch user repairs:", err);
      }
    };
    fetchUserRepairs();
  }, []);

  // Sample user orders
  const orders = [
    {
      id: "REP-2025-0891",
      device: "iPhone 15 Pro",
      service: "Screen Replacement",
      date: "Dec 15, 2025",
      status: "in_progress",
      statusLabel: "Repair in Progress",
      pickupDate: "Dec 16, 2025",
      estimatedCompletion: "Dec 19, 2025",
      trackingNumber: "TRK8912345",
      totalTime: "72:00:00", // elapsed since pickup
      repairTime: "18:30:00", // time spent in repair stage
      progressStages: [
        {
          name: "Device Picked Up",
          completed: true,
          timestamp: "Dec 16, 2025 – 10:30 AM",
        },
        {
          name: "Diagnosed",
          completed: true,
          timestamp: "Dec 16, 2025 – 2:15 PM",
        },
        {
          name: "Repair in Progress",
          completed: false,
          active: true,
          timestamp: "Dec 18, 2025 – 9:00 AM",
        },
        { name: "Quality Check", completed: false },
        { name: "Out for Delivery", completed: false },
        { name: "Delivered", completed: false },
      ],
    },
    {
      id: "REP-2025-0762",
      device: 'MacBook Pro 14"',
      service: "Battery Replacement",
      date: "Nov 28, 2025",
      status: "completed",
      statusLabel: "Delivered",
      pickupDate: "Nov 29, 2025",
      estimatedCompletion: "Dec 5, 2025",
      trackingNumber: "TRK7621098",
      totalTime: "168:00:00",
      repairTime: "42:10:00",
      progressStages: [
        {
          name: "Device Picked Up",
          completed: true,
          timestamp: "Nov 29, 2025 – 11:00 AM",
        },
        {
          name: "Diagnosed",
          completed: true,
          timestamp: "Nov 30, 2025 – 1:45 PM",
        },
        {
          name: "Repair in Progress",
          completed: true,
          timestamp: "Dec 2, 2025 – 10:00 AM",
        },
        {
          name: "Quality Check",
          completed: true,
          timestamp: "Dec 4, 2025 – 3:20 PM",
        },
        {
          name: "Out for Delivery",
          completed: true,
          timestamp: "Dec 5, 2025 – 9:00 AM",
        },
        {
          name: "Delivered",
          completed: true,
          timestamp: "Dec 5, 2025 – 2:15 PM",
        },
      ],
    },
    {
      id: "REP-2025-1023",
      device: "Galaxy Watch 6",
      service: "Strap & Battery",
      date: "Dec 10, 2025",
      status: "diagnosed",
      statusLabel: "Diagnosed",
      pickupDate: "Dec 11, 2025",
      estimatedCompletion: "Dec 20, 2025",
      trackingNumber: "TRK1023456",
      totalTime: "96:00:00",
      repairTime: "00:00:00",
      progressStages: [
        {
          name: "Device Picked Up",
          completed: true,
          timestamp: "Dec 11, 2025 – 3:30 PM",
        },
        {
          name: "Diagnosed",
          completed: true,
          active: true,
          timestamp: "Dec 12, 2025 – 11:20 AM",
        },
        { name: "Repair in Progress", completed: false },
        { name: "Quality Check", completed: false },
        { name: "Out for Delivery", completed: false },
        { name: "Delivered", completed: false },
      ],
    },
  ];

  const openTrackingModal = (order) => {
    setSelectedOrder(order);
    setIsModalOpen(true);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "completed":
        return "#10b981";
      case "in_progress":
        return "#f59e0b";
      case "diagnosed":
        return "#3b82f6";
      default:
        return "#6b7280";
    }
  };

  return (
    <>
      <div className="orders-page">
        <div className="orders-header">
          <h1>My Orders</h1>
          <p>Track and manage all your repair requests</p>
        </div>

        <div className="orders-list">
          {orders.map((order) => (
            <div key={order.id} className="order-card">
              <div className="order-main">
                <div className="order-id-date">
                  <strong className="order-id">{order.id}</strong>
                  <span className="order-date">
                    <Calendar size={14} />
                    {order.date}
                  </span>
                </div>

                <div className="order-details">
                  <h3>{order.device}</h3>
                  <p className="service">{order.service}</p>

                  <div className="order-meta">
                    <span>
                      <MapPin size={14} />
                      Pickup: {order.pickupDate}
                    </span>
                    <span>
                      <Clock size={14} />
                      Est. Completion: {order.estimatedCompletion}
                    </span>
                  </div>
                </div>

                <div className="order-status">
                  <span
                    className="status-badge"
                    style={{
                      backgroundColor: getStatusColor(order.status) + "20",
                      color: getStatusColor(order.status),
                    }}
                  >
                    {order.statusLabel}
                  </span>
                </div>
              </div>

              <div className="order-actions">
                <button
                  onClick={() => openTrackingModal(order)}
                  className="track-btn"
                >
                  <Package size={18} />
                  Track Repair
                </button>
              </div>
            </div>
          ))}
        </div>

        {orders.length === 0 && (
          <div className="empty-orders">
            <Wrench size={48} />
            <p>No repair orders yet.</p>
            <button className="request-repair-btn">Request a Repair</button>
          </div>
        )}
      </div>

      {/* Track Repair Modal */}
      {selectedOrder && (
        <TrackRepairModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          trackingNumber={selectedOrder.trackingNumber}
          totalTime={selectedOrder.totalTime}
          repairTime={selectedOrder.repairTime}
          //   stages={selectedOrder.progressStages} // assuming your modal accepts stages prop
          device={selectedOrder.device}
          service={selectedOrder.service}
        />
      )}
    </>
  );
};

export default MyOrders;
