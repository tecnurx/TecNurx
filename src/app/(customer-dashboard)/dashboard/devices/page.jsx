"use client";
import React, { useEffect, useState } from "react";
import "./devices.css";
import {
  Smartphone,
  Laptop,
  Tablet,
  Watch,
  Shield,
  Wrench,
  Trash2,
  X,
  Plus,
  Upload,
  Calendar,
  AlertCircle,
  SearchX,
  MonitorSmartphone,
} from "lucide-react";
import { deviceService } from "../../../../../services/devices";

const MyDevices = () => {
  const [devices, setDevices] = useState([]);
  const [selectedDevice, setSelectedDevice] = useState(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // // Sample user devices
  // const devices = [
  //   {
  //     id: 1,
  //     name: "iPhone 15 Pro",
  //     type: "smartphone",
  //     serial: "F2MKP123456789",
  //     status: "active",
  //     statusLabel: "Active",
  //     thumbnail: "smartphone",
  //     brand: "Apple",
  //     model: "iPhone 15 Pro",
  //     purchaseDate: "Oct 12, 2024",
  //     insuredUntil: "Oct 12, 2026",
  //     repairHistory: [
  //       { date: "Jul 5, 2025", issue: "Screen replacement", cost: "$179" },
  //       { date: "Mar 18, 2025", issue: "Battery replacement", cost: "$99" },
  //     ],
  //   },
  //   {
  //     id: 2,
  //     name: 'MacBook Pro 14"',
  //     type: "laptop",
  //     serial: "C02ZJ9ABLVCF",
  //     status: "repair",
  //     statusLabel: "Under Repair",
  //     thumbnail: "laptop",
  //     brand: "Apple",
  //     model: "MacBook Pro M3",
  //     purchaseDate: "Jan 20, 2025",
  //     insuredUntil: "Jan 20, 2027",
  //     repairHistory: [
  //       {
  //         date: "Nov 18, 2025",
  //         issue: "Keyboard replacement",
  //         cost: "In progress",
  //       },
  //     ],
  //   },
  //   {
  //     id: 3,
  //     name: "Galaxy Fold 6",
  //     type: "Fold",
  //     serial: "R3X7N9012345",
  //     status: "insured",
  //     statusLabel: "Insured",
  //     thumbnail: "smartphone",
  //     brand: "Samsung",
  //     model: "Galaxy Fold 6 Classic",
  //     purchaseDate: "Aug 3, 2025",
  //     insuredUntil: "Aug 3, 2026",
  //     repairHistory: [],
  //   },
  //   {
  //     id: 4,
  //     name: "iPad Air (5th Gen)",
  //     type: "tablet",
  //     serial: "MP123ABC456D",
  //     status: "active",
  //     statusLabel: "Active",
  //     thumbnail: "tablet",
  //     brand: "Apple",
  //     model: 'iPad Air 11"',
  //     purchaseDate: "Apr 10, 2025",
  //     insuredUntil: null,
  //     repairHistory: [],
  //   },
  // ];

  // Add Device Form State
  const [formData, setFormData] = useState({
    deviceType: "phone",
    brand: "",
    model: "",
    serialNumber: "",
    purchaseDate: "",
    warrantyExpiry: "",
    condition: "good",
    notes: "",
  });

  const [photos, setPhotos] = useState([]);
  const [receipt, setReceipt] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // Fetch devices
  useEffect(() => {
    const fetchDevices = async () => {
      try {
        const res = await deviceService.getAllUserDevices();
        setDevices(res?.data?.devices); // Adjust based on API response
      } catch (err) {
        console.error("Failed to load devices:", err);
      }
    };
    fetchDevices();

    // Fetch repair history for the first device
  }, []);

  // Handle Add Device Submit
  const handleAddDevice = async (e) => {
    e.preventDefault();
    setSubmitError("");
    setSubmitSuccess(false);

    if (!formData.brand || !formData.model || !formData.serialNumber) {
      setSubmitError("Please fill in all required fields");
      return;
    }

    setIsSubmitting(true);

    const payload = new FormData();
    payload.append("deviceType", formData.deviceType);
    payload.append("brand", formData.brand);
    payload.append("model", formData.model);
    payload.append("serialNumber", formData.serialNumber);
    payload.append("purchaseDate", formData.purchaseDate);
    payload.append("warrantyExpiry", formData.warrantyExpiry || "");
    payload.append("condition", formData.condition);
    if (formData.notes) payload.append("notes", formData.notes);

    photos.forEach((photo) => payload.append("photos", photo));
    if (receipt) payload.append("purchaseReceipt", receipt);

    try {
      await deviceService.addDevice(payload);
      setSubmitSuccess(true);
      // setTimeout(() => {
      //   setIsAddModalOpen(false);
      //   // Refresh devices
      //   const res = await deviceService.getAllUserDevices();
      //   setDevices(res.data || res);
      // }, 1500);
    } catch (err) {
      setSubmitError(err.response?.data?.message || "Failed to add device");
      console.log(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const openDetails = async (device) => {
    if (!device?.id) return;

    setSelectedDevice(device);
    setIsDetailsModalOpen(true);

    try {
      // Fetch both in parallel for better performance
      const [repairRes, insuranceRes] = await Promise.all([
        deviceService.getDeviceRepairHistory({ deviceId: device.id }),
        deviceService
          .getDeviceInsurance({ deviceId: device.id })
          .catch(() => ({ data: null })),
      ]);

      setSelectedDevice((prev) => ({
        ...prev,
        repairHistory: repairRes?.data?.repairs || [],
        insurance: insuranceRes?.data?.insurance || null,
      }));
      console.log("Fetched repair details", repairRes);
      console.log("Fetched insurance details", insuranceRes);
    } catch (error) {
      console.error("Error loading device details:", error);
      setSelectedDevice((prev) => ({
        ...prev,
        repairHistory: [],
        insurance: null,
      }));
    }
  };

  const closeModal = () => {
    setIsDetailsModalOpen(false);
    setSelectedDevice(null);
  };

  const getDeviceIcon = (type) => {
    const map = {
      phone: <Smartphone size={42} />,
      laptop: <Laptop size={42} />,
      tablet: <Tablet size={42} />,
      watch: <Watch size={42} />,
    };
    return map[type] || <Smartphone size={42} />;
  };

  return (
    <>
      <div className="mydevices-page">
        <div className="device-header">
          <div className="page-header">
            <h1>My Devices</h1>
            <p>Manage all your registered gadgets in one place</p>
          </div>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="add-device-btn"
          >
            <Plus size={18} /> Add Device
          </button>
        </div>

        <div className="devices-grid">
          {devices.length === 0 ? (
            <div className="no-devices">
              <MonitorSmartphone size={64} color="#9ca3af" />
              <p>No devices yet. Add your first one!</p>
            </div>
          ) : (
            devices.map((device) => (
              <div
                key={device.id}
                className="device-card"
                onClick={() => openDetails(device)}
              >
                <div className="device-thumbnail">
                  <div className="thumbnail-icon" style={{ color: "#FFC400" }}>
                    {getDeviceIcon(device.type || device.deviceType)}
                  </div>
                </div>
                <div className="device-info">
                  <h3>{device.name || `${device.brand} ${device.model}`}</h3>
                  <p className="serial">
                    SN: {device.serialNumber || device.serial}
                  </p>
                  <div className="device-status">
                    <span
                      className="status-badge"
                      style={{
                        backgroundColor: "#10b98120",
                        color: "#10b981",
                      }}
                    >
                      Active
                    </span>
                  </div>
                </div>
                <button className="view-details-btnn">View Details</button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Device Details Modal */}
      {isDetailsModalOpen && selectedDevice && (
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
                  <p>{selectedDevice.serialNumber}</p>
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
                        Active until {selectedDevice.warrantyExpiry}
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
                {selectedDevice?.repairHistory?.length > 0 ? (
                  <ul>
                    {selectedDevice?.repairHistory?.map((repair, i) => (
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

      {/* ADD DEVICE MODAL */}
      {isAddModalOpen && (
        <div className="modal-overlay" onClick={() => setIsAddModalOpen(false)}>
          <div
            className="modal-content add-device-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="modal-close"
              onClick={() => setIsAddModalOpen(false)}
            >
              <X size={24} />
            </button>

            <div className="modal-header modal-head2">
              <h2>Add New Device</h2>
              <p>Register your device for repairs & insurance</p>
            </div>

            <form onSubmit={handleAddDevice} className="add-device-form">
              {submitError && (
                <div className="alert error">
                  <AlertCircle size={18} />
                  {submitError}
                </div>
              )}
              {submitSuccess && (
                <div className="alert success">Device added successfully!</div>
              )}

              <div className="form-grid">
                <div className="form-group">
                  <label>Device Type *</label>
                  <select
                    value={formData.deviceType}
                    onChange={(e) =>
                      setFormData({ ...formData, deviceType: e.target.value })
                    }
                    required
                  >
                    <option value="phone">Phone</option>
                    <option value="laptop">Laptop</option>
                    <option value="tablet">Tablet</option>
                    <option value="camera">Camera</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Brand *</label>
                  <input
                    type="text"
                    placeholder="e.g. Apple, Samsung"
                    value={formData.brand}
                    onChange={(e) =>
                      setFormData({ ...formData, brand: e.target.value })
                    }
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Model *</label>
                  <input
                    type="text"
                    placeholder="e.g. iPhone 15 Pro"
                    value={formData.model}
                    onChange={(e) =>
                      setFormData({ ...formData, model: e.target.value })
                    }
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Serial Number *</label>
                  <input
                    type="text"
                    placeholder="ABC123XYZ"
                    value={formData.serialNumber}
                    onChange={(e) =>
                      setFormData({ ...formData, serialNumber: e.target.value })
                    }
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Purchase Date</label>
                  <input
                    type="date"
                    value={formData.purchaseDate}
                    onChange={(e) =>
                      setFormData({ ...formData, purchaseDate: e.target.value })
                    }
                  />
                </div>

                <div className="form-group">
                  <label>Warranty Expiry</label>
                  <input
                    type="date"
                    value={formData.warrantyExpiry}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        warrantyExpiry: e.target.value,
                      })
                    }
                  />
                </div>

                <div className="form-group full">
                  <label>Condition</label>
                  <select
                    value={formData.condition}
                    onChange={(e) =>
                      setFormData({ ...formData, condition: e.target.value })
                    }
                  >
                    <option value="excellent">Excellent</option>
                    <option value="good">Good</option>
                    <option value="fair">Fair</option>
                    <option value="poor">Poor</option>
                    <option value="not_working">Not Working</option>
                  </select>
                </div>

                <div className="form-group full">
                  <label>Photos (min. of 2 required)</label>
                  <label className="file-upload">
                    <Upload size={20} />
                    Upload Photos ({photos.length})
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={(e) => setPhotos(Array.from(e.target.files))}
                    />
                  </label>
                </div>

                <div className="form-group full">
                  <label>Purchase Receipt (Optional)</label>
                  <label className="file-upload">
                    <Upload size={20} />
                    {receipt ? receipt.name : "Upload Receipt"}
                    <input
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={(e) => setReceipt(e.target.files[0])}
                    />
                  </label>
                </div>

                <div className="form-group full">
                  <label>Notes (Optional)</label>
                  <textarea
                    rows={3}
                    placeholder="Any additional info..."
                    value={formData.notes}
                    onChange={(e) =>
                      setFormData({ ...formData, notes: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  className="action-btn secondary"
                  onClick={() => setIsAddModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="action-btn primary"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Adding..." : "Add Device"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default MyDevices;
