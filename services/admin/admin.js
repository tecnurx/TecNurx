import axios from "../../lib/axios";

export const adminService = {
  getAllRepairs: async () => {
    const response = await axios.get("/repairs/admin/all");
    return response.data;
  },

  getAllEngineers: async () => {
    const response = await axios.get("/users/admin/engineers");
    return response.data;
  },

  getAllUsers: async () => {
    const response = await axios.get("/users/admin/all");
    return response.data;
  },

  getUserbyId: async (userId) => {
    const response = await axios.get(`/users/admin/${userId}`);
    return response.data;
  },

  createEngineer: async (data) => {
    const response = await axios.post("/admin/engineers", data);
    return response.data;
  },

  createServiceProvider: async (payload) => {
    const response = await axios.post("/service-providers", payload);
    return response.data;
  },

  getEngineerbyId: async (engineerId) => {
    const response = await axios.get(`/admin/engineers/${engineerId}`);
    return response.data;
  },

  verifyEngineer: async (engineerId) => {
    const response = await axios.patch(`/admin/engineers/${engineerId}/verify`);
    return response.data;
  },

  deleteEngineerbyId: async (engineerId) => {
    const response = await axios.delete(`/service-providers/${engineerId}`);
    return response.data;
  },

  getRepairStats: async () => {
    const response = await axios.get("/repairs/admin/engineers/statistics");
    return response.data;
  },

  getAllPayments: async () => {
    const response = await axios.get("/payment/admin/all");
    return response.data;
  },

  getAdminPaymentbyId: async (paymentId) => {
    const response = await axios.get(`/payment/admin/${paymentId}`);
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

  getServicesbyId: async (serviceId) => {
    const response = await axios.get(`/service-offerings/${serviceId}`);
    return response.data;
  },

  getIssues: async () => {
    const response = await axios.get("/repairs/issues");
    return response.data;
  },

  createService: async () => {
    const response = await axios.post("/service-offerings/admin/create");
    return response.data;
  },

  updateService: async (serviceOfferingId) => {
    const response = await axios.patch(
      `/service-offerings/admin/${serviceOfferingId}`,
    );
    return response.data;
  },

  updateServicePrice: async ({ offeringId, serviceId }) => {
    const response = await axios.pacth(
      `/service-offerings/admin/${offeringId}/services/${serviceId}/price`,
    );
    return response.data;
  },
};
