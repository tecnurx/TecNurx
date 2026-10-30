import axios from "../../lib/axios";

export const adminAuthService = {
  login: async (credentials) => {
    let response;
    try {
      response = await axios.post("/staff/login", credentials);
    } catch (err) {
      if (err.response?.status === 404) {
        response = await axios.post("/users/loginAdmin", credentials);
      } else {
        throw err;
      }
    }

    const token = response.data?.token || response.data?.data?.token;
    const staff =
      response.data?.data?.staff ||
      response.data?.staff ||
      response.data?.data?.user ||
      response.data?.user;

    if (token) {
      localStorage.setItem("staff_token", token);
      localStorage.setItem("token", token);
      if (staff) {
        localStorage.setItem("staff", JSON.stringify(staff));
        localStorage.setItem("user", JSON.stringify(staff));
      }
      localStorage.setItem("loginTime", Date.now().toString());

      const secureFlag = process.env.NODE_ENV === "production" ? "Secure;" : "";
      document.cookie = `staff_jwt=${token}; path=/; max-age=604800; SameSite=Lax; ${secureFlag}`;
      document.cookie = `token=${token}; path=/; max-age=604800; SameSite=Lax; ${secureFlag}`;
    }

    return response.data;
  },

  logout: async () => {
    try {
      await axios.post("/staff/logout");
    } catch (err) {
      try {
        await axios.post("/users/logout");
      } catch (e) {
        console.error("Logout API failed (continuing client-side cleanup)", e);
      }
    }

    if (typeof window !== "undefined") {
      localStorage.removeItem("staff_token");
      localStorage.removeItem("staff");
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      localStorage.removeItem("loginTime");
      localStorage.removeItem("pendingVerificationEmail");
      document.cookie = "staff_jwt=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
      document.cookie = "token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    }
  },

  getMe: async () => {
    const response = await axios.get("/staff/me");
    return response.data;
  },

  updateMyPassword: async ({ passwordCurrent, password, passwordConfirm }) => {
    const response = await axios.patch("/staff/updateMyPassword", {
      passwordCurrent,
      password,
      passwordConfirm,
    });

    const resToken = response.data?.token || response.data?.data?.token;
    if (resToken && typeof window !== "undefined") {
      localStorage.setItem("staff_token", resToken);
      localStorage.setItem("token", resToken);
    }

    return response.data;
  },

  forgotPassword: async (email) => {
    const response = await axios.post("/staff/forgotPassword", { email });
    return response.data;
  },

  resetPassword: async (token, { password, passwordConfirm }) => {
    const response = await axios.patch(`/staff/resetPassword/${token}`, {
      password,
      passwordConfirm,
    });

    const resToken = response.data?.token || response.data?.data?.token;
    const staff =
      response.data?.data?.staff ||
      response.data?.staff ||
      response.data?.data?.user ||
      response.data?.user;

    if (resToken) {
      localStorage.setItem("staff_token", resToken);
      localStorage.setItem("token", resToken);
      if (staff) {
        localStorage.setItem("staff", JSON.stringify(staff));
        localStorage.setItem("user", JSON.stringify(staff));
      }
      localStorage.setItem("loginTime", Date.now().toString());

      const secureFlag = process.env.NODE_ENV === "production" ? "Secure;" : "";
      document.cookie = `staff_jwt=${resToken}; path=/; max-age=604800; SameSite=Lax; ${secureFlag}`;
      document.cookie = `token=${resToken}; path=/; max-age=604800; SameSite=Lax; ${secureFlag}`;
    }

    return response.data;
  },
};
