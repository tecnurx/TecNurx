import axios from "../../lib/axios";

export const staffService = {
  getAllStaff: async (params = {}) => {
    const response = await axios.get("/staff", { params });
    return response.data;
  },

  getStaffById: async (id) => {
    const response = await axios.get(`/staff/${id}`);
    return response.data;
  },

  createStaff: async (payload) => {
    const response = await axios.post("/staff", payload);
    return response.data;
  },

  updateStaff: async (id, payload) => {
    const response = await axios.patch(`/staff/${id}`, payload);
    return response.data;
  },

  deleteStaff: async (id) => {
    const response = await axios.delete(`/staff/${id}`);
    return response.data;
  },

  resendInvite: async (id) => {
    const response = await axios.post(`/staff/${id}/resendInvite`);
    return response.data;
  },
};
