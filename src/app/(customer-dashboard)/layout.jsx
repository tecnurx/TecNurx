// app/(customer-dashboard)/layout.jsx
"use client";
import "@/app/globals.css";
import DashboardNav from "@/components/dashboard/DashboardNav";
import Sidebar from "@/components/sidebar/Sidebar";
import { Plus_Jakarta_Sans } from "next/font/google";
import { SidebarProvider } from "../../../context/SidebarContext";
import Chatbox from "@/components/chatbox/Chatbox";
import CustomToast from "@/components/CustomToast";
import SessionExpiry from "@/components/SessionExpiry";
import { useEffect, useState, React, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { extractUserRole } from "@/lib/roleUtils";

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
});

function LayoutContent({ children }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isValidating, setIsValidating] = useState(true);

  useEffect(() => {
    // Check if there's a token in the URL (e.g. Google OAuth redirect)
    const urlToken = searchParams.get("token");

    if (urlToken) {
      localStorage.setItem("token", urlToken);
      localStorage.setItem("loginTime", Date.now().toString());
      document.cookie = `token=${urlToken}; path=/; max-age=604800; SameSite=Lax; ${
        process.env.NODE_ENV === "production" ? "Secure;" : ""
      }`;
      setIsValidating(false);
      return;
    }

    const userJson = localStorage.getItem("user");
    const token = localStorage.getItem("token");

    if (!userJson || !token) {
      router.replace("/login");
      return;
    }

    // Keep document.cookie in sync with localStorage token so middleware doesn't redirect
    if (!document.cookie.includes("token=")) {
      document.cookie = `token=${token}; path=/; max-age=604800; SameSite=Lax; ${
        process.env.NODE_ENV === "production" ? "Secure;" : ""
      }`;
    }

    // Ensure loginTime is initialized if missing
    if (!localStorage.getItem("loginTime")) {
      localStorage.setItem("loginTime", Date.now().toString());
    }

    try {
      const user = JSON.parse(userJson);
      const userRole = extractUserRole(user);

      if (userRole !== "customer") {
        router.replace("/resolve-role");
      } else {
        setIsValidating(false);
      }
    } catch (error) {
      console.log("Invalid user data in localStorage", error);
      router.replace("/login");
    }
  }, [router, searchParams]);

  if (isValidating) {
    return (
      <div className="resolve-wrap">
        <p>Loading...</p>
        <div className="respinner"></div>
      </div>
    );
  }

  return (
    <div>
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
        <SessionExpiry />
      </main>
    </div>
  );
}

export default function DashboardLayout({ children }) {
  return (
    <Suspense
      fallback={
        <div className="resolve-wrap">
          <p>Loading...</p>
          <div className="respinner"></div>
        </div>
      }
    >
      <LayoutContent>{children}</LayoutContent>
    </Suspense>
  );
}
