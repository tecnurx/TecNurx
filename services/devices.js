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

  updateDevice: async (arg1, arg2) => {
    if (arg1 && typeof arg1 === "object" && arg1.deviceId) {
      const { deviceId, ...rest } = arg1;
      const data = arg2 !== undefined ? arg2 : rest;
      const response = await axios.patch(`/devices/${deviceId}`, data);
      return response.data;
    }
    const response = await axios.patch(`/devices/${arg1}`, arg2);
    return response.data;
  },

  deleteDevice: async ({ deviceId }) => {
    const response = await axios.post(`/devices/${deviceId}/remove`);
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
