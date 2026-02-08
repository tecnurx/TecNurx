// src/app/resolve-role/page.tsx
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import "./resolve.css";

export default function ResolveRole() {
  const router = useRouter();

  useEffect(() => {
    const userJson = localStorage.getItem("user");
    if (!userJson) {
      router.replace("/login");
      return;
    }

    try {
      const user = JSON.parse(userJson);
      role = user.role?.toLowerCase(); // e.g., "user", "engineer", "admin"
    } catch (err) {
      router.replace("/");
      return;
    }

    const roleMap = {
      user: "/dashboard", // Customer
      customer: "/dashboard",
      engineer: "/engineer-dashboard",
      eng: "/engineer-dashboard", // if backend uses this
      "service partner": "/engineer-dashboard", // if backend uses this
      admin: "/admin-dashboard",
    };

    const destination = roleMap[role] || "/dashboard";
    router.replace(destination);
  }, [router]);

  return (
    <div className="resolve-wrap">
      <p>Redirecting to your dashboard...</p>
      <div className="respinner"></div>
    </div>
  );
}
