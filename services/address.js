import axios from "../lib/axios";

export const addressService = {
  getUserAddresses: async () => {
    const response = await axios.get("/addresses");
    return response.data;
  },

  //pickup or dropoff
  getAddressbyType: async (type) => {
    const response = await axios.get(`/addresses/type/${type}`);
    return response.data;
  },

  createAddress: async (payload) => {
    const response = await axios.post("/addresses", payload);
    return response.data;
  },

  updateAddress: async (addressId, payload) => {
    const response = await axios.put(`/addresses/${addressId}`, payload);
    return response.data;
  },

  deleteAddress: async (addressId) => {
    const response = await axios.delete(`/addresses/${addressId}`);
    return response.data;
  },
};
