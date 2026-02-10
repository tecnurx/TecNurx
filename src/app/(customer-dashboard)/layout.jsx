"use client";
import "@/app/globals.css";
import DashboardNav from "@/components/dashboard/DashboardNav";
import Sidebar from "@/components/sidebar/Sidebar";
import { Plus_Jakarta_Sans } from "next/font/google";
import { SidebarProvider } from "../../../context/SidebarContext";
import Chatbox from "@/components/chatbox/Chatbox";
import CustomToast from "@/components/CustomToast";
import { useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { authService } from "../../../services/auth";
import { toast } from "@/components/CustomToast";

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
});

export default function DashboardLayout({ children }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const hasProcessedToken = useRef(false); // ← prevents running twice

  useEffect(() => {
    // Prevent running in SSR / during build
    if (typeof window === "undefined") return;

    // 1. Handle OAuth callback token from URL
    const urlToken = searchParams.get("token");

    if (urlToken && !hasProcessedToken.current) {
      hasProcessedToken.current = true;

      // Clean URL immediately (remove ?token=...)
      const cleanUrl = window.location.pathname;
      window.history.replaceState({}, "", cleanUrl);

      // Store token
      document.cookie = `token=${urlToken}; path=/; max-age=86400; samesite=lax; secure`;
      localStorage.setItem("token", urlToken);

      // Fetch and store current user
      const fetchAndStoreUser = async () => {
        try {
          const userData = await authService.getCurrentUser(); // ← use correct method

          if (!userData) {
            throw new Error("No user data returned");
          }

          // Store user data
          localStorage.setItem("user", JSON.stringify(userData));

          toast.success("Login successful! Redirecting...");

          // Go to role resolver
          router.replace("/resolve-role");
        } catch (err) {
          console.error("Failed to fetch user after OAuth:", err);
          toast.error("Could not complete login. Please try again.");

          // Clean up invalid data
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          document.cookie =
            "token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";

          router.replace("/login");
        }
      };

      fetchAndStoreUser();
      return;
    }

    // 2. Normal client-side auth check (only if no token was just processed)
    if (hasProcessedToken.current) return;

    const userJson = localStorage.getItem("user");
    const token = localStorage.getItem("token");

    if (!userJson || !token) {
      router.replace("/login");
      return;
    }

    try {
      const user = JSON.parse(userJson);
      const role = user.role?.toLowerCase()?.trim();

      if (!["user", "customer"].includes(role)) {
        router.replace("/resolve-role");
      }
      // If role is valid → do nothing, just show the dashboard
    } catch (err) {
      console.error("Invalid user data in localStorage:", err);
      localStorage.removeItem("user");
      localStorage.removeItem("token");
      router.replace("/login");
    }
  }, [router, searchParams]);

  return (
    <div className={plusJakartaSans.className}>
      <main>
        <SidebarProvider>
          {/* Navbar - Fixed Top */}
          <header className="dashboard-nav-fixed">
            <DashboardNav />
          </header>

          {/* Sidebar + Main Content */}
          <div className="dashboard-body">
            <Sidebar />
            <main className="main-content">{children}</main>
          </div>
        </SidebarProvider>

        <Chatbox />
        <CustomToast />
      </main>
    </div>
  );
}
