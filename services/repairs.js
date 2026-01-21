import axios from "../lib/axios";

export const repairService = {
  getIssues: async () => {
    const response = await axios.get("/service-offerings/issues");
    return response.data;
  },

  bookRepair: async (payload) => {
    const response = await axios.post("/repairs/book", payload);
    return response.data;
  },

  getUserRepairs: async () => {
    const response = await axios.get("/repairs");
    return response.data;
  },

  getRepairDetails: async (repairId) => {
    const response = await axios.get(`/repairs/${repairId}`);
    return response.data;
  },

  trackRepair: async (trackingId) => {
    const response = await axios.get(`/repairs/${trackingId}/track`);
    return response.data;
  },
};
