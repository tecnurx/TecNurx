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

  updateRepairStatus: async (repairId, status) => {
    const response = await axios.patch(`/engineer/repairs/${repairId}/status`, {
      status,
    });
    return response.data;
  },

  addorUpdateRepairNote: async (repairId, notes) => {
    const response = await axios.patch(`/engineer/repairs/${repairId}/notes`, {
      notes,
    });
    return response.data;
  },

  addPartsUsedInRepair: async (repairId, parts) => {
    const response = await axios.post(`/engineer/repairs/${repairId}/parts`, {
      parts,
    });
    return response.data;
  },

  updateRepairCost: async (repairId, cost) => {
    const response = await axios.post(
      `/engineer/repairs/${repairId}/cost`,
      cost,
    );
    return response.data;
  },

  getEngineerPayments: async () => {
    const response = await axios.get("/payment/engineer/payments");
    return response.data;
  },
};
