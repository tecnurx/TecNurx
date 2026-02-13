// app/(customer-dashboard)/layout.jsx
"use client";
import "@/app/globals.css";
import DashboardNav from "@/components/dashboard/DashboardNav";
import Sidebar from "@/components/sidebar/Sidebar";
import { Plus_Jakarta_Sans } from "next/font/google";
import { SidebarProvider } from "../../../context/SidebarContext";
import Chatbox from "@/components/chatbox/Chatbox";
import CustomToast from "@/components/CustomToast";
import { useEffect, useState, React, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
});

function LayoutContent({ children }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isValidating, setIsValidating] = useState(true);

  useEffect(() => {
    // Check if there's a token in the URL (Google OAuth redirect)
    const urlToken = searchParams.get("token");

    if (urlToken) {
      // Allow the page to load - the Dashboard component will handle token storage
      setIsValidating(false);
      return;
    }

    const userJson = localStorage.getItem("user");

    if (!userJson) {
      router.replace("/login");
      return;
    }

    try {
      const user = JSON.parse(userJson);
      const role = user.role?.toLowerCase();

      if (!["user", "customer"].includes(role)) {
        router.replace("/resolve-role");
      } else {
        setIsValidating(false);
      }
    } catch (error) {
      console.log("Invalid user data in localStorage");
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
