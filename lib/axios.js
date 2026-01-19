// lib/axios.js
import Axios from "axios";

const axios = Axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request Interceptor – Add token only for non-public endpoints
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
      // "/service-providers",
    ];

    const isPublic = publicEndpoints.some((endpoint) =>
      config.url?.includes(endpoint)
    );

    if (!isPublic && typeof window !== "undefined") {
      const token = localStorage.getItem("token");
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
      const loginEndpoints = [
        "/users/login",
        "/users/loginEng",
        "/users/signup",
        "/users/register",
        "/users/forgotPassword",
        "/users/resetPassword",
        "/service-providers",
      ];

      const isLoginAttempt = loginEndpoints.some((endpoint) =>
        error.config?.url?.includes(endpoint)
      );

      // Only act on 401 if it's NOT a login/signup attempt
      if (typeof window !== "undefined" && !isLoginAttempt) {
        // Clear invalid auth data
        localStorage.removeItem("token");
        localStorage.removeItem("user");

        // Only redirect if user is on a protected dashboard
        const protectedPaths = [
          "/dashboard",
          "/engineer-dashboard",
          "/admin-dashboard",
        ];

        const currentPath = window.location.pathname;
        const isOnProtectedPage = protectedPaths.some((path) =>
          currentPath.startsWith(path)
        );

        if (isOnProtectedPage) {
          // Optional: preserve redirect path
          const redirectUrl = new URL("/login", window.location.origin);
          redirectUrl.searchParams.set("redirect", currentPath);
          window.location.href = redirectUrl.toString();
        }
        // If not on protected page (e.g., public page with stale token), just clear data
      }
    }

    return Promise.reject(error);
  }
);

export default axios;
