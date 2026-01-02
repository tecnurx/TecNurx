"use client";

import { useContext, useEffect } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "./components/engsidebar/Sidebar";
import EngNav from "./components/EngNav";
import { SidebarProvider } from "../../../context/SidebarContext";

export default function EngineerDashboardLayout({ children }) {
  const router = useRouter();

  useEffect(() => {
    const userJson = localStorage.getItem("user");

    if (!userJson) {
      router.replace("/not-engineer-login");
      return;
    }

    try {
      const user = JSON.parse(userJson);
      const role = user.role?.toLowerCase();

      if (!["engineer", "service partner", "service-partner"].includes(role)) {
        router.replace("/resolve-role");
      }
    } catch (error) {
      console.log("Invalid user data in localStorage");
      router.replace("/");
    }
  }, [router]);

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
      </main>
    </div>
  );
}
