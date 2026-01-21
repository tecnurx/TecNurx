import axios from "../../lib/axios";

export const engService = {
  getAllEngineers: async () => {
    const response = await axios.get("/service-providers");
    return response.data;
  },

  getEngineerRepairs: async () => {
    const response = await axios.get("/repairs/engineer/assigned");
    return response.data;
  },
};
