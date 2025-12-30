import axios from "../lib/axios";

export const engineerAuthService = {
  login: async (credentials) => {
    const response = await axios.post("/users/loginEng", credentials);
    const { token } = response.data;
    const { user } = response.data?.data;

    if (token) {
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));
    }

    document.cookie = `token=${token}; path=/; max-age=604800; SameSite=Lax; ${
      process.env.NODE_ENV === "production" ? "Secure;" : ""
    }`;

    return response.data;
  },
  signup: async (payload) => {
    const response = await axios.post("/service-providers", payload);
    return response.data;
  },
};
