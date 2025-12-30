import axios from "../../lib/axios";

export const adminAuthService = {
  login: async (credentials) => {
    const response = await axios.post("/admin/loginEng", credentials);
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
};
