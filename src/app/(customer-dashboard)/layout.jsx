"use client";
import "@/app/globals.css";
import DashboardNav from "@/components/dashboard/DashboardNav";
import Sidebar from "@/components/sidebar/Sidebar";
import { Plus_Jakarta_Sans } from "next/font/google";
import { SidebarProvider } from "../../../context/SidebarContext";
import Chatbox from "@/components/chatbox/Chatbox";
import CustomToast from "@/components/CustomToast";
import AuthHandler from "@/components/auth/AuthHandler";
import { useRouter } from "next/navigation";
import { useEffect, Suspense } from "react";

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
});

export default function DashboardLayout({ children }) {
  const router = useRouter();

  useEffect(() => {
    const userJson = localStorage.getItem("user");

    if (!userJson) {
      router.replace("/login");
      return;
    }

    try {
      const user = JSON.parse(userJson);
      const role = user.role?.toLowerCase();

      if (!["user"].includes(role)) {
        router.replace("/resolve-role");
      }
    } catch (error) {
      console.log("Invalid user data in localStorage");
      router.replace("/");
    }
  }, [router]);
  return (
    <div className={plusJakartaSans.className}>
      <main>
        {/* Add this → only renders on client, handles token when present */}
        {/* This is the only part that uses useSearchParams → wrap in Suspense */}
        <Suspense fallback={null}>
          <AuthHandler />
        </Suspense>
        <SidebarProvider>
          <header className="dashboard-nav-fixed">
            <DashboardNav />
          </header>

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
