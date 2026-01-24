import axios from "../../lib/axios";

export const adminService = {
  getAllRepairs: async () => {
    const response = await axios.get("/repairs/admin/all");
    return response.data;
  },

  getAllEngineers: async () => {
    const response = await axios.get("/service-providers");
    return response.data;
  },

  getAllUsers: async () => {
    const response = await axios.get("/users/admin/all");
    return response.data;
  },

  getEngineerbyId: async ({ id }) => {
    const response = await axios.get(`/service-providers/${id}`);
    return response.data;
  },

  getEngineerStatistics: async () => {
    const response = await axios.get("/repairs/admin/engineers/statistics");
    return response.data;
  },

  getAllServices: async () => {
    const response = await axios.get("/service-offerings/");
    return response.data;
  },
  
};
