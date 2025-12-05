import axios from "../lib/axios";

export const authService = {
  signup: async (userData) => {
    const response = await axios.post("/users/signupUser", userData);
    return response.data;
  },

  login: async (credentials) => {
    const response = await axios.post("/users/loginUser", credentials);
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

  logout: async () => {
    try {
      await axios.post("/logout");
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

  getCurrentUser: () => {
    if (typeof window === "undefined") return null;
    const user = localStorage.getItem("user");
    return user ? JSON.parse(user) : null;
  },

  isAuthenticated: () => {
    if (typeof window === "undefined") return false;
    return !!localStorage.getItem("token");
  },

  verifyEmail: async ({ email, verificationToken }) => {
    const response = await axios.post("/users/verify-email", {
      email,
      verificationToken,
    });
    return response.data;
  },
};
