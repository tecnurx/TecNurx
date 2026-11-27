import axios from "../lib/axios";

export const repairService = {
  getIssues: async () => {
    const response = await axios.get("/service-offerings/issues");
    return response.data;
  },

  getServiceOfferings: async (params = {}) => {
    const response = await axios.get("/service-offerings", { params });
    return response.data;
  },

  previewBookingCharges: async (payload) => {
    const response = await axios.post("/repairs/booking-charges/preview", payload);
    return response.data;
  },

  bookRepair: async (payload) => {
    const isFormData = typeof FormData !== "undefined" && payload instanceof FormData;
    const response = await axios.post("/repairs/book", payload, {
      headers: isFormData ? { "Content-Type": "multipart/form-data" } : undefined,
    });
    return response.data;
  },

  initiateBookingPayment: async (repairId) => {
    const response = await axios.post(`/repairs/${repairId}/booking-payment`);
    return response.data;
  },

  getPaymentStatus: async (repairId, purpose) => {
    const query = purpose ? `?purpose=${encodeURIComponent(purpose)}` : "";
    const response = await axios.get(`/repairs/${repairId}/payment-status${query}`);
    return response.data;
  },

  verifyPayment: async (transactionId) => {
    const response = await axios.get(`/payment/verify/${transactionId}`);
    return response.data;
  },

  getMyPayments: async (params = {}) => {
    const cleanParams = Object.fromEntries(
      Object.entries(params).filter(([, v]) => v !== undefined && v !== null && v !== "")
    );
    const response = await axios.get("/payment/my-payments", { params: cleanParams });
    return response.data;
  },

  getMyPaymentDetails: async (paymentId) => {
    const response = await axios.get(`/payment/my-payments/${paymentId}`);
    return response.data;
  },

  getDrafts: async () => {
    const response = await axios.get("/repairs/drafts");
    return response.data;
  },

  deleteDraft: async (repairId) => {
    const response = await axios.delete(`/repairs/${repairId}/draft`);
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

  getQuote: async (repairId) => {
    const response = await axios.get(`/repairs/${repairId}/quote`);
    return response.data;
  },

  acceptQuote: async (repairId) => {
    const response = await axios.patch(`/repairs/${repairId}/quote/accept`);
    return response.data;
  },

  declineQuote: async (repairId, reason) => {
    const response = await axios.patch(`/repairs/${repairId}/quote/decline`, { reason });
    return response.data;
  },

  initiateRepairPayment: async (repairId) => {
    const response = await axios.post(`/repairs/${repairId}/payment`);
    return response.data;
  },

  submitPayLaterEligibility: async (repairId) => {
    const response = await axios.post(`/repairs/${repairId}/pay-later/eligibility`);
    return response.data;
  },

  getPayLaterApplication: async (repairId) => {
    const response = await axios.get(`/repairs/${repairId}/pay-later/application`);
    return response.data;
  },

  getAdditionalWork: async (repairId) => {
    const response = await axios.get(`/repairs/${repairId}/additional-work`);
    return response.data;
  },

  decideAdditionalWork: async (repairId, entryId, decision) => {
    const response = await axios.patch(
      `/repairs/${repairId}/additional-work/${entryId}`,
      { decision }
    );
    return response.data;
  },

  initiateAdditionalWorkPayment: async (repairId, entryId) => {
    const response = await axios.post(
      `/repairs/${repairId}/additional-work/${entryId}/payment`
    );
    return response.data;
  },

  submitRating: async (repairId, { rating, review }) => {
    const response = await axios.post(`/repairs/${repairId}/rating`, {
      rating,
      review,
    });
    return response.data;
  },

  trackRepair: async (trackingId) => {
    const response = await axios.get(`/repairs/${trackingId}/track`);
    return response.data;
  },
};
