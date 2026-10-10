//(engineer-dashboard)/layout.jsx
"use client";

import { useContext, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import Sidebar from "./components/engsidebar/Sidebar";
import EngNav from "./components/EngNav";
import { SidebarProvider } from "../../../context/SidebarContext";
import CustomToast from "@/components/CustomToast";
import SessionExpiry from "@/components/SessionExpiry";
import { extractUserRole } from "@/lib/roleUtils";

export default function EngineerDashboardLayout({ children }) {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const userJson = localStorage.getItem("user");
    const token = localStorage.getItem("token");

    if (!userJson || !token) {
      router.replace("/not-engineer-login");
      return;
    }

    // Keep cookie in sync with localStorage token
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

      if (userRole !== "engineer") {
        router.replace("/resolve-role");
        return;
      }

      if (
        user.hasServicePartnerProfile === false &&
        !pathname.includes("/complete-profile")
      ) {
        router.replace("/engineer-dashboard/complete-profile");
      }
    } catch (error) {
      console.log("Invalid user data in localStorage", error);
      router.replace("/");
    }
  }, [router, pathname]);

  return (
    <div>
      <main>
        <SidebarProvider>
          {/* Navbar - Fixed Top */}
          <header className="dashboard-nav-fixed">
            <EngNav />
          </header>
          {/* Sidebar + Main Content */}
          <div className="dashboard-body">
            <Sidebar />
            <main className="main-content">{children}</main>
          </div>
        </SidebarProvider>
        <CustomToast />
        <SessionExpiry />
      </main>
    </div>
  );
}
