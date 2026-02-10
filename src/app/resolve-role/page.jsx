"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import "./resolve.css";

export default function ResolveRole() {
  const router = useRouter();
  const [isResolving, setIsResolving] = useState(true);

  useEffect(() => {
    const resolveUserRole = async () => {
      try {
        // Get user data from localStorage
        const userJson = localStorage.getItem("user");
        const token = localStorage.getItem("token");

        // If no user data or token, redirect to login
        if (!userJson || !token) {
          console.log("No user data found, redirecting to login");
          router.replace("/login");
          return;
        }

        // Parse user data
        const user = JSON.parse(userJson);
        const role = user.role?.toLowerCase()?.trim(); // FIX: Added 'let' and better sanitization

        console.log("Resolving role:", role);

        // Role mapping with all possible variations
        const roleMap = {
          user: "/dashboard",
          customer: "/dashboard",
          engineer: "/engineer-dashboard",
          eng: "/engineer-dashboard",
          servicepartner: "/engineer-dashboard",
          admin: "/admin-dashboard",
        };

        // Get destination or fallback to dashboard
        const destination = roleMap[role] || "/dashboard";

        console.log("Redirecting to:", destination);

        // Use replace to prevent back button issues
        router.replace(destination);
      } catch (err) {
        console.error("Error resolving role:", err);
        // On error, clear invalid data and redirect to login
        localStorage.removeItem("user");
        localStorage.removeItem("token");
        document.cookie =
          "token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
        router.replace("/login");
      } finally {
        setIsResolving(false);
      }
    };

    resolveUserRole();
  }, [router]);

  if (!isResolving) {
    return null; // Don't show anything after redirect
  }

  return (
    <div className="resolve-wrap">
      <p>Redirecting to your dashboard...</p>
      <div className="respinner"></div>
    </div>
  );
}
