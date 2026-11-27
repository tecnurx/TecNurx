import axios from "../../lib/axios";

export const engService = {
  getEngineerStats: async () => {
    const response = await axios.get("/engineer/dashboard");
    return response.data;
  },

  getEngineerRepairs: async () => {
    const response = await axios.get("/engineer/repairs");
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
    const response = await axios.patch(`/engineer/repairs/${repairId}/parts`, {
      parts,
    });
    return response.data;
  },

  updateRepairCost: async (repairId, cost) => {
    const response = await axios.patch(
      `/engineer/repairs/${repairId}/cost`,
      cost,
    );
    return response.data;
  },

  sendQuote: async (repairId, { parts, labour, findings }) => {
    const response = await axios.patch(`/repairs/engineer/${repairId}/quote`, {
      parts,
      labour,
      findings,
    });
    return response.data;
  },

  raiseAdditionalWork: async (repairId, { note, parts = 0, labour = 0, photos = [] }) => {
    const formData = new FormData();
    formData.append("note", note);
    formData.append("parts", String(Number(parts || 0)));
    formData.append("labour", String(Number(labour || 0)));
    if (Array.isArray(photos)) {
      photos.slice(0, 4).forEach((file) => {
        if (file) {
          formData.append("photos", file);
        }
      });
    }
    const response = await axios.post(
      `/repairs/engineer/${repairId}/additional-work`,
      formData,
      {
        headers: { "Content-Type": "multipart/form-data" },
      },
    );
    return response.data;
  },

  getEngineerPayments: async () => {
    const response = await axios.get("/payment/engineer/payments");
    return response.data;
  },

  getEngineerPaymentsbyId: async (paymentId) => {
    const response = await axios.get(`/payment/engineer/${paymentId}`);
    return response.data;
  },

};
