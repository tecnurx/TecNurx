// src/app/(admin-dashboard)/layout.jsx
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { SidebarProvider } from "../../../context/SidebarContext";
import AdNav from "./components/AdNav";
import AdSidebar from "./components/sidebar/AdSidebar";
import './adminall.css'

export default function AdminDashboardLayout({ children }) {
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

      if (!["admin"].includes(role)) {
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
            <AdNav />
          </header>
          {/* Sidebar + Main Content */}
          <div className="dashboard-body">
            <AdSidebar />
            <main className="main-content">{children}</main>
          </div>
        </SidebarProvider>
      </main>
    </div>
  );
}
