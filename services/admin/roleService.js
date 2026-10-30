import axios from "../../lib/axios";

export const roleService = {
  getPermissions: async () => {
    try {
      const response = await axios.get("/roles/permissions");
      return response.data;
    } catch (err) {
      if (err.response?.status === 404) {
        const fallback = await axios.get("/role/permissions");
        return fallback.data;
      }
      throw err;
    }
  },

  getAllRoles: async () => {
    try {
      const response = await axios.get("/roles");
      return response.data;
    } catch (err) {
      if (err.response?.status === 404) {
        const fallback = await axios.get("/role");
        return fallback.data;
      }
      throw err;
    }
  },

  getRoleById: async (id) => {
    try {
      const response = await axios.get(`/roles/${id}`);
      return response.data;
    } catch (err) {
      if (err.response?.status === 404) {
        const fallback = await axios.get(`/role/${id}`);
        return fallback.data;
      }
      throw err;
    }
  },

  createRole: async (payload) => {
    try {
      const response = await axios.post("/roles", payload);
      return response.data;
    } catch (err) {
      if (err.response?.status === 404) {
        const fallback = await axios.post("/role", payload);
        return fallback.data;
      }
      throw err;
    }
  },

  updateRole: async (id, payload) => {
    try {
      const response = await axios.patch(`/roles/${id}`, payload);
      return response.data;
    } catch (err) {
      if (err.response?.status === 404) {
        const fallback = await axios.patch(`/role/${id}`, payload);
        return fallback.data;
      }
      throw err;
    }
  },

  deleteRole: async (id) => {
    try {
      const response = await axios.delete(`/roles/${id}`);
      return response.data;
    } catch (err) {
      if (err.response?.status === 404) {
        const fallback = await axios.delete(`/role/${id}`);
        return fallback.data;
      }
      throw err;
    }
  },
};
