"use client";
import React, { useState } from "react";
import "./devices.css";
import {
  Smartphone,
  Laptop,
  Watch,
  Tablet,
  Shield,
  Wrench,
  Trash2,
  Calendar,
  X,
} from "lucide-react";

const MyDevices = () => {
  const [selectedDevice, setSelectedDevice] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Sample user devices
  const devices = [
    {
      id: 1,
      name: "iPhone 15 Pro",
      type: "smartphone",
      serial: "F2MKP123456789",
      status: "active",
      statusLabel: "Active",
      thumbnail: "smartphone",
      brand: "Apple",
      model: "iPhone 15 Pro",
      purchaseDate: "Oct 12, 2024",
      insuredUntil: "Oct 12, 2026",
      repairHistory: [
        { date: "Jul 5, 2025", issue: "Screen replacement", cost: "$179" },
        { date: "Mar 18, 2025", issue: "Battery replacement", cost: "$99" },
      ],
    },
    {
      id: 2,
      name: 'MacBook Pro 14"',
      type: "laptop",
      serial: "C02ZJ9ABLVCF",
      status: "repair",
      statusLabel: "Under Repair",
      thumbnail: "laptop",
      brand: "Apple",
      model: "MacBook Pro M3",
      purchaseDate: "Jan 20, 2025",
      insuredUntil: "Jan 20, 2027",
      repairHistory: [
        {
          date: "Nov 18, 2025",
          issue: "Keyboard replacement",
          cost: "In progress",
        },
      ],
    },
    {
      id: 3,
      name: "Galaxy Fold 6",
      type: "Fold",
      serial: "R3X7N9012345",
      status: "insured",
      statusLabel: "Insured",
      thumbnail: "smartphone",
      brand: "Samsung",
      model: "Galaxy Fold 6 Classic",
      purchaseDate: "Aug 3, 2025",
      insuredUntil: "Aug 3, 2026",
      repairHistory: [],
    },
    {
      id: 4,
      name: "iPad Air (5th Gen)",
      type: "tablet",
      serial: "MP123ABC456D",
      status: "active",
      statusLabel: "Active",
      thumbnail: "tablet",
      brand: "Apple",
      model: 'iPad Air 11"',
      purchaseDate: "Apr 10, 2025",
      insuredUntil: null,
      repairHistory: [],
    },
  ];

  const openModal = (device) => {
    setSelectedDevice(device);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedDevice(null);
  };

  const getDeviceIcon = (type) => {
    switch (type) {
      case "smartphone":
        return <Smartphone size={42} />;
      case "laptop":
        return <Laptop size={42} />;
      case "watch":
        return <Watch size={42} />;
      case "tablet":
        return <Tablet size={42} />;
      default:
        return <Smartphone size={42} />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "active":
        return "#10b981";
      case "repair":
        return "#f59e0b";
      case "insured":
        return "#3b82f6";
      default:
        return "#6b7280";
    }
  };

  return (
    <>
      <div className="mydevices-page">
        <div className="page-header">
          <h1>My Devices</h1>
          <p>Manage all your registered gadgets in one place</p>
        </div>

        <div className="devices-grid">
          {devices.map((device) => (
            <div key={device.id} className="device-card">
              <div className="device-thumbnail">
                <div className="thumbnail-icon" style={{ color: "#FFC400" }}>
                  {getDeviceIcon(device.type)}
                </div>
              </div>

              <div className="device-info">
                <h3>{device.name}</h3>
                <p className="serial">SN: {device.serial}</p>

                <div className="device-status">
                  <span
                    className="status-badge"
                    style={{
                      backgroundColor: getStatusColor(device.status) + "20",
                      color: getStatusColor(device.status),
                    }}
                  >
                    {device.statusLabel}
                  </span>
                </div>
              </div>

              <button
                onClick={() => openModal(device)}
                className="view-details-btn"
              >
                View Details →
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Device Details Modal */}
      {isModalOpen && selectedDevice && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={closeModal}>
              <X size={24} />
            </button>

            <div className="modal-header">
              <div className="modal-thumbnail">
                {getDeviceIcon(selectedDevice.type)}
              </div>
              <div>
                <h2>{selectedDevice.name}</h2>
                <p className="modal-subtitle">
                  {selectedDevice.brand} • {selectedDevice.model}
                </p>
              </div>
            </div>

            <div className="modal-body">
              <div className="info-grid">
                <div>
                  <span>Serial Number</span>
                  <p>{selectedDevice.serial}</p>
                </div>
                <div>
                  <span>Purchase Date</span>
                  <p>{selectedDevice.purchaseDate}</p>
                </div>
                <div>
                  <span>Insurance Coverage</span>
                  <p>
                    {selectedDevice.insuredUntil ? (
                      <span style={{ color: "#10b981" }}>
                        <Shield
                          size={16}
                          style={{ display: "inline", marginRight: 6 }}
                        />
                        Active until {selectedDevice.insuredUntil}
                      </span>
                    ) : (
                      <span style={{ color: "#ef4444" }}>Not insured</span>
                    )}
                  </p>
                </div>
              </div>

              <div className="repair-history">
                <h3>
                  <Wrench size={18} /> Repair History
                </h3>
                {selectedDevice.repairHistory.length > 0 ? (
                  <ul>
                    {selectedDevice.repairHistory.map((repair, i) => (
                      <li key={i}>
                        <div>
                          <strong>{repair.date}</strong> – {repair.issue}
                        </div>
                        <span className="repair-cost">{repair.cost}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p>No repairs recorded yet.</p>
                )}
              </div>
            </div>

            <div className="modal-actions">
              <button className="action-btn primary">
                <Wrench size={18} /> Book New Repair
              </button>
              {selectedDevice.insuredUntil ? (
                <button className="action-btn secondary">
                  <Shield size={18} /> Renew Insurance
                </button>
              ) : (
                <button className="action-btn secondary">
                  <Shield size={18} /> Add Insurance
                </button>
              )}
              <button className="action-btn danger">
                <Trash2 size={18} /> Remove Device
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default MyDevices;
