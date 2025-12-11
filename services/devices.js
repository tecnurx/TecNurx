import axios from "../lib/axios";

export const deviceService = {
  getAllUserDevices: async () => {
    const response = await axios.get("/devices");
    return response.data;
  },

  addDevice: async (payload) => {
    const response = await axios.post("/devices", payload, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  },

  getDevicesbyId: async ({ deviceId }) => {
    const response = await axios.get(`/devices/${deviceId}`);
    return response.data;
  },

  updateDevice: async ({ deviceId }) => {
    const response = await axios.patch(`/devices/${deviceId}`);
    return response.data;
  },

  deleteDevice: async ({ deviceId }) => {
    const response = await axios.delete(`/devices/${deviceId}`);
    return response.data;
  },

  getDeviceRepairHistory: async ({ deviceId }) => {
    const response = await axios.get(`/devices/${deviceId}/repairs-history`);
    return response.data;
  },

  getDeviceInsurance: async ({ deviceId }) => {
    const response = await axios.get(`/devices/${deviceId}/insurance`);
    return response.data;
  },

  renewDeviceInsurance: async ({ deviceId }) => {
    const response = await axios.post(`/devices/${deviceId}/renew-insurance`, {
      deviceId,
    });
    return response.data;
  },
};
