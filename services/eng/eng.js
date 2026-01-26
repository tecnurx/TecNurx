import axios from "../../lib/axios";

export const engService = {
  getEngineerRepairs: async () => {
    const response = await axios.get("/repairs/engineer/assigned");
    return response.data;
  },

  getRepairbyId: async (repairId) => {
    const response = await axios.get(`/repairs/engineer/${repairId}`);
    return response.data;
  },

  updateRepairStatus: async (repairId) => {
    const response = await axios.patch(`/repairs/engineer/${repairId}`);
    return response.data;
  },

  getEngineerPayments: async () => {
    const response = await axios.get("/payment/engineer/payments");
    return response.data;
  },
};
