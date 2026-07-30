"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function SessionExpiry() {
  const router = useRouter();

  useEffect(() => {
    const checkExpiry = () => {
      const loginTime = localStorage.getItem("loginTime");
      
      // If no loginTime is found, they shouldn't be in the dashboard, but the layout guard handles that.
      if (!loginTime) return;

      const elapsed = Date.now() - parseInt(loginTime, 10);
      const EXPIRY_TIME = 6 * 60 * 60 * 1000; // 6 hours in ms

      if (elapsed >= EXPIRY_TIME) {
        // Determine role BEFORE wiping storage
        const userJson = localStorage.getItem("user");
        let redirectPath = "/login";
        if (userJson) {
          try {
            const user = JSON.parse(userJson);
            const role = user.role?.toLowerCase();
            if (["eng", "engineer", "service partner", "service-partner"].includes(role)) {
              redirectPath = "/not-engineer-login";
            } else if (role === "admin") {
              redirectPath = "/not-even-admin-login";
            }
          } catch (e) {}
        }

        // Clear all session data
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        localStorage.removeItem("loginTime");
        
        // Clear cookie
        document.cookie = "token=; path=/; max-age=0;";
        
        // Redirect to appropriate login
        router.replace(redirectPath);
      }
    };

    // Run check immediately on mount
    checkExpiry();

    // Check every 5 seconds
    const interval = setInterval(checkExpiry, 5000);
    return () => clearInterval(interval);
  }, [router]);

  return null;
}
