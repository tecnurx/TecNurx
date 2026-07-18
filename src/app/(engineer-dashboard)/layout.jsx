//(engineer-dashboard)/layout.jsx
"use client";

import { useContext, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import Sidebar from "./components/engsidebar/Sidebar";
import EngNav from "./components/EngNav";
import { SidebarProvider } from "../../../context/SidebarContext";
import CustomToast from "@/components/CustomToast";

export default function EngineerDashboardLayout({ children }) {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const userJson = localStorage.getItem("user");

    if (!userJson) {
      router.replace("/login");
      return;
    }

    try {
      const user = JSON.parse(userJson);
      const role = user.role?.toLowerCase();

      if (!["engineer", "service partner", "service-partner", "eng"].includes(role)) {
        router.replace("/resolve-role");
        return;
      }

      if (user.hasServicePartnerProfile === false && !pathname.includes("/complete-profile")) {
        router.replace("/engineer-dashboard/complete-profile");
      }
    } catch (error) {
      console.log("Invalid user data in localStorage");
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
      </main>
    </div>
  );
}
