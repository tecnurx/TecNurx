// lib/axios.js
import Axios from "axios";

const axios = Axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request Interceptor – Add token for authenticated endpoints
axios.interceptors.request.use(
  (config) => {
    const publicEndpoints = [
      "/users/login",
      "/users/loginEng",
      "/users/signup",
      "/users/register",
      "/users/verify-email",
      "/users/forgotPassword",
      "/users/resetPassword",
      "/staff/login",
      "/staff/forgotPassword",
      "/staff/resetPassword",
      "/service-offerings/calculate-payback",
      "/service-offerings/issues",
    ];

    const isPublic = publicEndpoints.some((endpoint) =>
      config.url?.includes(endpoint)
    );

    if (!isPublic && typeof window !== "undefined") {
      let token = null;
      const staffToken = localStorage.getItem("staff_token");
      const defaultToken = localStorage.getItem("token");

      if (config.url?.includes("/admin/") || config.url?.includes("/staff/")) {
        token = staffToken || defaultToken;
      } else {
        token = defaultToken || staffToken;
      }

      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor – Handle 401 intelligently
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const url = error.config?.url || "";
      const errorMessage = (
        error.response?.data?.message ||
        error.response?.data?.error?.message ||
        ""
      ).toLowerCase();

      // Non-session endpoints or operational messages that should NEVER trigger a logout:
      const nonSessionEndpoints = [
        "/users/login",
        "/users/loginEng",
        "/users/signup",
        "/users/register",
        "/users/forgotPassword",
        "/users/resetPassword",
        "/service-providers",
        "/staff/login",
        "/staff/forgotPassword",
        "/staff/resetPassword",
        "/staff/updateMyPassword",
        "updateMyPassword",
        "/service-offerings",
      ];

      const isNonSessionEndpoint = nonSessionEndpoints.some((endpoint) =>
        url.includes(endpoint)
      );

      // Operational 401 messages that mean permission/route mismatch or wrong password, NOT an expired session
      const isOperationalOrAccessError =
        errorMessage.includes("current password") ||
        errorMessage.includes("password is wrong") ||
        errorMessage.includes("staff accounts cannot access") ||
        errorMessage.includes("permission") ||
        errorMessage.includes("not authorized");

      const currentPath =
        typeof window !== "undefined" ? window.location.pathname : "";
      const isOnAdminDashboard = currentPath.startsWith("/admin-dashboard");

      // For admin dashboard: ONLY log out if the core session check (/staff/me) failed,
      // or if the token is genuinely expired/malformed. Never log out on a feature endpoint 401!
      const isTokenExpired =
        errorMessage.includes("jwt expired") ||
        errorMessage.includes("invalid token") ||
        errorMessage.includes("jwt malformed") ||
        errorMessage.includes("user recently changed password");

      const shouldLogoutAdmin =
        isOnAdminDashboard &&
        (url.includes("/staff/me") || isTokenExpired) &&
        !isOperationalOrAccessError;

      const shouldLogoutOther =
        !isOnAdminDashboard &&
        !isNonSessionEndpoint &&
        !isOperationalOrAccessError;

      if (typeof window !== "undefined" && (shouldLogoutAdmin || shouldLogoutOther)) {
        // Clear invalid auth data
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        localStorage.removeItem("staff_token");
        localStorage.removeItem("staff");

        const redirectPath = isOnAdminDashboard
          ? "/not-even-admin-login"
          : currentPath.startsWith("/engineer-dashboard")
          ? "/not-engineer-login"
          : "/login";

        const redirectUrl = new URL(redirectPath, window.location.origin);
        redirectUrl.searchParams.set("redirect", currentPath);
        window.location.href = redirectUrl.toString();
      }
    }

    return Promise.reject(error);
  }
);

export default axios;
