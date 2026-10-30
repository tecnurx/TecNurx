import axios from "../../lib/axios";

export const adminService = {
  // Repairs (Admin)
  getAllRepairs: async (params = {}) => {
    const response = await axios.get("/admin/repairs", { params });
    return response.data;
  },

  getRepairStats: async () => {
    const response = await axios.get("/admin/repairs/engineer-statistics");
    return response.data;
  },

  getAvailableEngineersForRepair: async (repairId) => {
    const response = await axios.get(
      `/admin/repairs/${repairId}/available-engineers`
    );
    return response.data;
  },

  reassignRepair: async (repairId, engineerId) => {
    const response = await axios.patch(
      `/admin/repairs/${repairId}/reassign`,
      { engineerId }
    );
    return response.data;
  },

  getRepairById: async (repairId) => {
    try {
      const response = await axios.get(`/admin/repairs/${repairId}`);
      return response.data;
    } catch (err) {
      if (err.response?.status === 404) {
        // Find in all repairs via /admin/repairs without hitting customer /repairs
        try {
          const all = await axios.get("/admin/repairs");
          const list =
            all.data?.data?.repairs ||
            all.data?.repairs ||
            (Array.isArray(all.data) ? all.data : []);
          const found = list.find((r) => (r._id || r.id) === repairId);
          if (found) {
            return { status: "success", data: { repair: found } };
          }
        } catch {
          // Ignore
        }
      }
      throw err;
    }
  },

  // Logistics (Admin)
  getLogistics: async (params = {}) => {
    try {
      const response = await axios.get("/admin/logistics", { params });
      return response.data;
    } catch (err) {
      if (err.response?.status === 404) {
        const fallback = await axios.get("/admin/repairs", { params });
        return fallback.data;
      }
      throw err;
    }
  },

  // Payments (Admin)
  getAllPayments: async (params = {}) => {
    const response = await axios.get("/admin/payments", { params });
    return response.data;
  },

  getAdminPaymentbyId: async (paymentId) => {
    const response = await axios.get(`/admin/payments/${paymentId}`);
    return response.data;
  },

  getPaymentAnalytics: async () => {
    const response = await axios.get("/admin/payments/analytics");
    return response.data;
  },

  // Engineers & Service Partners (Admin)
  getAllEngineers: async (params = {}) => {
    const response = await axios.get("/admin/engineers", { params });
    return response.data;
  },

  getEngineerbyId: async (engineerId) => {
    try {
      const response = await axios.get(`/admin/engineers/${engineerId}`);
      return response.data;
    } catch (err) {
      if (err.response?.status === 404) {
        const fallback = await axios.get(`/admin/service-partners/${engineerId}`);
        return fallback.data;
      }
      throw err;
    }
  },

  createEngineer: async (data) => {
    const response = await axios.post("/admin/engineers", data);
    return response.data;
  },

  verifyEngineer: async (engineerId) => {
    const response = await axios.patch(`/admin/engineers/${engineerId}/verify`);
    return response.data;
  },

  createServiceProvider: async (userId, payload) => {
    if (userId && typeof userId === "object" && !payload) {
      const response = await axios.post("/admin/engineers", userId);
      return response.data;
    }
    const response = await axios.post(
      `/admin/engineers/${userId}/service-partner`,
      payload
    );
    return response.data;
  },

  getAllServicePartners: async (params = {}) => {
    const response = await axios.get("/admin/service-partners", { params });
    return response.data;
  },

  getServicePartnerById: async (id) => {
    const response = await axios.get(`/admin/service-partners/${id}`);
    return response.data;
  },

  deleteEngineerbyId: async (engineerId) => {
    const response = await axios.delete(`/admin/engineers/${engineerId}`);
    return response.data;
  },

  // Users (Admin)
  getAllUsers: async (params = {}) => {
    const response = await axios.get("/admin/users", { params });
    return response.data;
  },

  getUserbyId: async (userId) => {
    const response = await axios.get(`/admin/users/${userId}`);
    return response.data;
  },

  // Services & Offerings (Admin)
  getAllServices: async (params = {}) => {
    try {
      const response = await axios.get("/admin/service-offerings", { params });
      return response.data;
    } catch (err) {
      console.warn(
        "Could not fetch /admin/service-offerings, trying fallback:",
        err?.response?.data?.message || err.message
      );
      if (err.response?.status === 404) {
        try {
          const fallbackRes = await axios.get("/service-offerings", { params });
          return fallbackRes.data;
        } catch {
          // ignore
        }
      }
      throw err;
    }
  },

  getServicesbyId: async (serviceId) => {
    try {
      const response = await axios.get(`/admin/service-offerings/${serviceId}`);
      return response.data;
    } catch (err) {
      console.warn(
        "Could not fetch /admin/service-offerings/:id, trying fallback:",
        err?.response?.data?.message || err.message
      );
      if (err.response?.status === 404) {
        const fallbackRes = await axios.get(`/service-offerings/${serviceId}`);
        return fallbackRes.data;
      }
      throw err;
    }
  },

  getIssues: async () => {
    try {
      const response = await axios.get("/service-offerings/issues");
      return response.data;
    } catch (err) {
      if (err.response?.status === 404 || err.response?.status === 401) {
        const fallbackIssues = await axios.get("/service-offerings/issues");
        return fallbackIssues.data;
      }
      throw err;
    }
  },

  createService: async (payload) => {
    const response = await axios.post("/admin/service-offerings", payload);
    return response.data;
  },

  updateService: async (serviceOfferingId, payload) => {
    const response = await axios.patch(
      `/admin/service-offerings/${serviceOfferingId}`,
      payload
    );
    return response.data;
  },

  updateServicePrice: async ({ offeringId, serviceId, ...payload }) => {
    const response = await axios.patch(
      `/admin/service-offerings/${offeringId}/services/${serviceId}/price`,
      payload
    );
    return response.data;
  },
};
