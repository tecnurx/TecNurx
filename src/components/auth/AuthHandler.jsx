// components/auth/AuthHandler.tsx
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "@/components/CustomToast";
import { authService } from './../../../services/auth';

export default function AuthHandler() {
  const router = useRouter();

  useEffect(() => {
    const initializeUser = async () => {
      try {
        const user = await authService.UpdateCurrentUser(); // or getCurrentUser()
        if (user) {
          localStorage.setItem("user", JSON.stringify(user));

          const role = user.role?.toLowerCase?.() || "";

          if (role === "user" || role === "customer") {
            // already on /dashboard — good
          } else if (role === "engineer" || role === "servicepartner") {
            router.replace("/");
          } else if (role === "admin") {
            router.replace("/");
          } else {
            router.replace("/resolve-role");
          }
        }
      } catch (err) {
        console.error("Failed to load current user", err);
        // Do NOT redirect here — middleware already protected the route
        // Just show a toast or something
        toast.error("Session issue — please login again");
      }
    };

    initializeUser();
  }, [router]);

  return null;
}
