// src/app/(admin-dashboard)/layout.jsx
"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { SidebarProvider } from "../../../context/SidebarContext";
import AdNav from "./components/AdNav";
import AdSidebar from "./components/sidebar/AdSidebar";
import "./adminall.css";
import SessionExpiry from "@/components/SessionExpiry";
import {
  hasAdminAccess,
  getAdminType,
} from "../../../config/adminPermissions";
import { extractUserRole } from "@/lib/roleUtils";
import { ShieldAlert } from "lucide-react";

export default function AdminDashboardLayout({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const userJson = localStorage.getItem("user");
    const token = localStorage.getItem("token");

    if (!userJson || !token) {
      router.replace("/not-even-admin-login");
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
      const parsedUser = JSON.parse(userJson);
      const userRole = extractUserRole(parsedUser);

      if (userRole !== "admin") {
        router.replace("/resolve-role");
        return;
      }

      setUser(parsedUser);
    } catch (error) {
      console.log("Invalid user data in localStorage", error);
      router.replace("/");
    } finally {
      setLoading(false);
    }
  }, [router]);

  // Determine route authorization
  const isAuthorized = user ? hasAdminAccess(user, pathname) : true;

  if (loading) {
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
            <AdNav />
          </header>
          {/* Sidebar + Main Content */}
          <div className="dashboard-body">
            <AdSidebar />
            <main className="main-content">
              {isAuthorized ? (
                children
              ) : (
                <div
                  style={{
                    padding: "60px 20px",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    textAlign: "center",
                    fontFamily: "Plus Jakarta Sans, sans-serif",
                    background: "#fff",
                    borderRadius: "16px",
                    margin: "24px",
                    boxShadow: "0 4px 20px rgba(0,0,0,0.06)",
                  }}
                >
                  <div
                    style={{
                      width: "64px",
                      height: "64px",
                      borderRadius: "50%",
                      background: "#fef2f2",
                      color: "#dc2626",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      marginBottom: "16px",
                    }}
                  >
                    <ShieldAlert size={36} />
                  </div>
                  <h2
                    style={{
                      fontSize: "24px",
                      fontWeight: "700",
                      color: "#111",
                      marginBottom: "8px",
                    }}
                  >
                    Access Restricted
                  </h2>
                  <p
                    style={{
                      color: "#64748b",
                      maxWidth: "420px",
                      fontSize: "15px",
                      lineHeight: "1.5",
                      marginBottom: "24px",
                    }}
                  >
                    Your assigned admin role (
                    <strong>{getAdminType(user)}</strong>) does not have permission
                    to access this page ({pathname}).
                  </p>
                  <button
                    onClick={() => router.push("/admin-dashboard")}
                    style={{
                      padding: "14px 28px",
                      background: "#000",
                      color: "#fff",
                      border: "none",
                      borderRadius: "60px",
                      fontWeight: "600",
                      fontSize: "14px",
                      cursor: "pointer",
                    }}
                  >
                    Return to Main Dashboard
                  </button>
                </div>
              )}
            </main>
          </div>
        </SidebarProvider>
        <SessionExpiry />
      </main>
    </div>
  );
}
