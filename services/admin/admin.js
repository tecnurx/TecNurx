import axios from "../../lib/axios";

export const adminService = {
  getAllRepairs: async () => {
    const response = await axios.get("/repairs/admin/all");
    return response.data;
  },

  getAllEngineers: async () => {
    const response = await axios.get("/users/admin/engineers");
    //todo: test again!
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

  getAllPayments: async () => {
    const response = await axios.get("/payment/admin/all");
    return response.data;
  },

  getPaymentAnalytics: async () => {
    const response = await axios.get("/payment/admin/analytics");
    return response.data;
  },

  getAllServices: async () => {
    const response = await axios.get("/service-offerings/");
    return response.data;
  },

  createService: async () => {
    const response = await axios.post("/service-offerings/admin/create");
    return response.data;
  },

  updateServicePrice: async () => {
    const response = await axios.post(`/service-offerings/admin/{offeringId}/services/{serviceId}/price");
    return response.data;
  },
};
