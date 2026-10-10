"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { extractUserRole } from "@/lib/roleUtils";

export default function SessionExpiry() {
  const router = useRouter();

  useEffect(() => {
    const checkExpiry = () => {
      const token = localStorage.getItem("token");
      const userJson = localStorage.getItem("user");

      // If user is not logged in, no session expiry check needed
      if (!token || !userJson) return;

      let loginTimeStr = localStorage.getItem("loginTime");

      // If loginTime is missing or invalid, initialize it now
      if (!loginTimeStr || isNaN(parseInt(loginTimeStr, 10))) {
        localStorage.setItem("loginTime", Date.now().toString());
        return;
      }

      const loginTime = parseInt(loginTimeStr, 10);
      const elapsed = Date.now() - loginTime;
      const EXPIRY_TIME = 6 * 60 * 60 * 1000; // 6 hours in ms

      if (elapsed >= EXPIRY_TIME) {
        // Determine role before clearing storage
        let redirectPath = "/login";
        try {
          const user = JSON.parse(userJson);
          const role = extractUserRole(user);

          if (role === "engineer") {
            redirectPath = "/not-engineer-login";
          } else if (role === "admin") {
            redirectPath = "/not-even-admin-login";
          }
        } catch (e) {
          console.error("SessionExpiry role parsing error:", e);
        }

        // Clear all session data safely
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        localStorage.removeItem("loginTime");
        document.cookie = "token=; path=/; max-age=0;";

        // Single clean redirect to appropriate login portal
        router.replace(redirectPath);
      }
    };

    // Check on mount
    checkExpiry();

    // Check periodically
    const interval = setInterval(checkExpiry, 10000);
    return () => clearInterval(interval);
  }, [router]);

  return null;
}
