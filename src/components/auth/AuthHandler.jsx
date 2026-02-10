// components/auth/AuthHandler.tsx
"use client";

import { useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "@/components/CustomToast";
import { authService } from "../../../services/auth";

export default function AuthHandler() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const hasProcessed = useRef(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (hasProcessed.current) return;

    const token = searchParams.get("token");
    if (!token) return;

    hasProcessed.current = true;

    // Clean URL
    window.history.replaceState({}, "", window.location.pathname);

    // Store token
    document.cookie = `token=${token}; path=/; max-age=86400; samesite=lax; secure`;
    localStorage.setItem("token", token);

    const initUser = async () => {
      try {
        const userData = await authService.getCurrentUser(); // ← use correct method name

        if (!userData) throw new Error("No user returned");

        localStorage.setItem("user", JSON.stringify(userData));
        toast.success("Login successful");

        router.replace("/resolve-role");
      } catch (err) {
        console.error("OAuth user fetch failed", err);
        toast.error("Login could not be completed");

        localStorage.removeItem("token");
        localStorage.removeItem("user");
        document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 GMT";

        router.replace("/login");
      }
    };

    initUser();
  }, [searchParams, router]);

  return null; // this component renders nothing
}
