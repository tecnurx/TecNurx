import axios from "../lib/axios";

export const authService = {
  signup: async (userData) => {
    const response = await axios.post("/users/signupUser", userData);
    return response.data;
  },

  resendToken: async (payload) => {
    const response = await axios.post("/users/resend-token", payload);
    return response.data;
  },

  partnerSignup: async (userData) => {
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

  UpdateCurrentUser: async () => {
    const response = await axios.get("/users/me");
    return response.data;
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

  forgotPassword: async ({ email }) => {
    const response = await axios.post("/users/forgotPassword", { email });
    return response.data;
  },

  resetPassword: async ({ password, passwordConfirm, token }) => {
    const response = await axios.patch(`/users/resetPassword/${token}`, {
      password,
      passwordConfirm,
    });
    return response.data;
  },

  updatePassword: async ({ password, passwordCurrent }) => {
    const response = await axios.patch("/users/updateMyPassword", {
      password,
      passwordCurrent,
      passwordConfirm: password,
    });
    return response.data;
  },

  updateMe: async ({ lname, fname, email, phoneNumber, photo }) => {
    const response = await axios.patch("/users/updateMe", {
      lname,
      fname,
      email,
      phoneNumber,
      photo,
    });
    return response.data;
  },

  googleOauth: async () => {
    const response = await axios.get("/users/auth/google");
    return response.data;
  },

  googleOauthCallback: async () => {
    const response = await axios.get("/users/auth/google/callback");
    return response.data;
  },
};
