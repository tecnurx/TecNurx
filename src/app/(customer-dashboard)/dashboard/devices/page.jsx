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
  AlertCircle,
  MonitorSmartphone,
} from "lucide-react";
import { deviceService } from "../../../../../services/devices";
import { toast } from "@/components/CustomToast"; // Import toast

const MyDevices = () => {
  const [devices, setDevices] = useState([]);
  const [selectedDevice, setSelectedDevice] = useState(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingDeviceId, setEditingDeviceId] = useState(null);

  // Form state
  const [formData, setFormData] = useState({
    deviceType: "phone",
    brand: "",
    model: "",
    serialNumber: "",
    purchaseDate: "",
    condition: "good",
    notes: "",
  });

  const [photos, setPhotos] = useState([]);
  const [receipt, setReceipt] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [loading, setLoading] = useState(true);

  // Fetch devices on mount
  useEffect(() => {
    const fetchDevices = async () => {
      try {
        const res = await deviceService.getAllUserDevices();
        setDevices(res?.data?.devices || []);
      } catch (err) {
        toast.error("Failed to load devices");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchDevices();
  }, []);

  // Open device details + fetch extra data
  const openDetails = async (device) => {
    if (!device?.id) return;

    setSelectedDevice(device);
    setIsDetailsModalOpen(true);

    try {
      const [repairRes] = await Promise.all([
        deviceService.getDeviceRepairHistory({ deviceId: device.id }),
        deviceService
          .getDeviceInsurance({ deviceId: device.id })
          .catch(() => ({ data: null })),
      ]);

      setSelectedDevice((prev) => ({
        ...prev,
        repairHistory: repairRes?.data?.repairs || [],
      }));
    } catch (error) {
      toast.error("Failed to load device details");
      setSelectedDevice((prev) => ({ ...prev, repairHistory: [] }));
    }
  };

  // Open edit modal (reuses add modal)
  const openEditModal = (device) => {
    setIsEditMode(true);
    setEditingDeviceId(device.id);

    setFormData({
      deviceType: device.deviceType || "phone",
      brand: device.brand || "",
      model: device.model || "",
      serialNumber: device.serialNumber || "",
      purchaseDate: device.purchaseDate
        ? device.purchaseDate.split("T")[0]
        : "",
      condition: device.condition || "good",
      notes: device.notes || "",
    });

    setPhotos([]);
    setReceipt(null);
    setIsAddModalOpen(true);
    setIsDetailsModalOpen(false); // Close details modal
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      deviceType: "phone",
      brand: "",
      model: "",
      serialNumber: "",
      purchaseDate: "",
      condition: "good",
      notes: "",
    });
    setPhotos([]);
    setReceipt(null);
    setIsEditMode(false);
    setEditingDeviceId(null);
    setSubmitError("");
    setSubmitSuccess(false);
  };

  // Handle Add or Update Device
  const handleSubmitDevice = async (e) => {
    e.preventDefault();
    setSubmitError("");
    setSubmitSuccess(false);

    if (!formData.brand || !formData.model || !formData.serialNumber) {
      setSubmitError("Please fill in all required fields");
      return;
    }

    setIsSubmitting(true);

    try {
      if (isEditMode) {
        // UPDATE DEVICE
        await deviceService.updateDevice({ deviceId: editingDeviceId });
        toast.success("Device updated successfully!");
      } else {
        // ADD NEW DEVICE
        const payload = new FormData();
        payload.append("deviceType", formData.deviceType);
        payload.append("brand", formData.brand);
        payload.append("model", formData.model);
        payload.append("serialNumber", formData.serialNumber);
        payload.append("purchaseDate", formData.purchaseDate);
        payload.append("condition", formData.condition);
        if (formData.notes) payload.append("notes", formData.notes);

        photos.forEach((photo) => payload.append("photos", photo));
        if (receipt) payload.append("purchaseReceipt", receipt);

        await deviceService.addDevice(payload);
        toast.success("Device added successfully!");
      }

      // Refresh device list
      const res = await deviceService.getAllUserDevices();
      setDevices(res?.data?.devices || []);

      // Close modal after short delay
      setTimeout(() => {
        setIsAddModalOpen(false);
        resetForm();
      }, 1000);
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        (isEditMode ? "Failed to update device" : "Failed to add device");
      setSubmitError(msg);
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Close modals
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
    return map[type?.toLowerCase()] || <Smartphone size={42} />;
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
      <div className="mydevices-page">
        <div className="device-header">
          <div className="page-header">
            <h1>My Devices</h1>
            <p>Manage all your registered gadgets in one place</p>
          </div>
          <button
            onClick={() => {
              resetForm();
              setIsAddModalOpen(true);
            }}
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
                    {getDeviceIcon(device.deviceType)}
                  </div>
                </div>
                <div className="device-info">
                  <h3>{`${device.brand} ${device.model}`}</h3>
                  <p className="serial">SN: {device.serialNumber}</p>
                  <div className="device-status">
                    <span
                      className="status-badge"
                      style={{ backgroundColor: "#10b98120", color: "#10b981" }}
                    >
                      Active
                    </span>
                  </div>
                </div>
                <button
                  className="view-details-btnn"
                  onClick={(e) => {
                    e.stopPropagation();
                    openDetails(device);
                  }}
                >
                  View Details
                </button>
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
              <X size={24} color="black" />
            </button>

            <div className="modal-header">
              <div className="modal-thumbnail">
                {getDeviceIcon(selectedDevice.deviceType)}
              </div>
              <div>
                <h2>{`${selectedDevice.brand} ${selectedDevice.model}`}</h2>
                <p className="modal-subtitle">{selectedDevice.deviceType}</p>
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
                  {selectedDevice.purchaseDate && (
                    <p>
                      {new Date(selectedDevice.purchaseDate).toLocaleDateString(
                        "en-US",
                        {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        }
                      )}
                    </p>
                  )}
                </div>
                <div>
                  <span>Insurance Coverage</span>
                  <p>
                    {selectedDevice.insuranceStatus?.isInsured ? (
                      <span style={{ color: "#10b981" }}>
                        <Shield
                          size={16}
                          style={{ display: "inline", marginRight: 6 }}
                        />
                        Insured
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
                {selectedDevice.repairHistory?.length > 0 ? (
                  <ul>
                    {selectedDevice.repairHistory.map((repair, i) => (
                      <li key={i}>
                        <div>
                          <strong>
                            {new Date(repair.assignedAt).toLocaleDateString(
                              "en-US",
                              {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              }
                            )}
                          </strong>{" "}
                          – {repair.issueDescription}
                        </div>
                        <span className="repair-cost">
                          {repair.paymentStatus || "Pending"}
                        </span>
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

              <button
                className="action-btn secondary"
                onClick={() => openEditModal(selectedDevice)}
              >
                Edit Device
              </button>

              {selectedDevice.insuranceStatus?.isInsured ? (
                <button className="action-btn secondary">
                  <Shield size={18} /> Renew Insurance
                </button>
              ) : (
                <button className="action-btn secondary">
                  <Shield size={18} /> Add Insurance
                </button>
              )}

              <button
                className="action-btn danger"
                onClick={async () => {
                  if (
                    !confirm(
                      "Are you sure you want to remove this device permanently?"
                    )
                  )
                    return;

                  try {
                    await deviceService.deleteDevice({
                      deviceId: selectedDevice.id,
                    });
                    setDevices(
                      devices.filter((d) => d.id !== selectedDevice.id)
                    );
                    closeModal();
                    toast.success("Device removed successfully");
                  } catch (err) {
                    toast.error(
                      err.response?.data?.message || "Failed to remove device"
                    );
                  }
                }}
              >
                <Trash2 size={18} /> Remove Device
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Device Modal */}
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
              <X size={24} color="black" />
            </button>
            <div className="modal-header modal-head2">
              <h2>{isEditMode ? "Edit Device" : "Add New Device"}</h2>
              <p>
                {isEditMode
                  ? "Update your device information"
                  : "Register your device for repairs & insurance"}
              </p>
            </div>

            <form onSubmit={handleSubmitDevice} className="add-device-form">
              {submitError && (
                <div className="alert error">
                  <AlertCircle size={18} />
                  {submitError}
                </div>
              )}

              <div className="form-grid">
                {/* All your form fields remain the same */}
                <div className="form-grouup">
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

                <div className="form-grouup">
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

                <div className="form-grouup">
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

                <div className="form-grouup">
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

                <div className="form-grouup">
                  <label>Purchase Date</label>
                  <input
                    type="date"
                    value={formData.purchaseDate}
                    onChange={(e) =>
                      setFormData({ ...formData, purchaseDate: e.target.value })
                    }
                  />
                </div>

                <div className="form-grouup full">
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

                <div className="form-grouup full">
                  <label>Photos {!isEditMode && "(min. 2 required)"}</label>
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

                <div className="form-grouup full">
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

                <div className="form-grouup full">
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
                  {isSubmitting
                    ? "Saving..."
                    : isEditMode
                    ? "Update Device"
                    : "Add Device"}
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
