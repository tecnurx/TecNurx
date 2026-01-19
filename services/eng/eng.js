import axios from "../../lib/axios";

export const engService = {
  getAllEngineers: async () => {
    const response = await axios.get("/service-providers");
    return response.data;
  },
};
