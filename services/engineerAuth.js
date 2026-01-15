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
  logout: async () => {
      try {
        await axios.post("/users/logout");
      } catch (err) {
        console.error("Logout API failed (continuing client-side cleanup)", err);
      }
  
      // Always clear client-side data
      if (typeof window !== "undefined") {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        localStorage.removeItem("pendingVerificationEmail");
        document.cookie = "token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
      }
    },
};
