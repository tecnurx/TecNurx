// app/(customer-dashboard)/layout.jsx
"use client";
import "@/app/globals.css";
import DashboardNav from "@/components/dashboard/DashboardNav";
import Sidebar from "@/components/sidebar/Sidebar";
import { Plus_Jakarta_Sans } from "next/font/google";
import { SidebarProvider } from "../../../context/SidebarContext";
import Chatbox from "@/components/chatbox/Chatbox";
import CustomToast from "@/components/CustomToast";
import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
});

// export const metadata = {
//   title: "Dashboard | TecNurx",
//   description: "Fast, reliable device repair and insurance",
//   icons: {
//     icon: "/favicon.png",
//     apple: "/favicon.png",
//     shortcut: "/favicon.png",
//   },
// };

export default function DashboardLayout({ children }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const urlToken = searchParams.get("token");

    if (urlToken) {
      // Clean URL immediately
      const cleanUrl = window.location.pathname;
      window.history.replaceState({}, "", cleanUrl);

      // Store token
      document.cookie = `token=${urlToken}; path=/; max-age=3600; samesite=lax; secure`;
      localStorage.setItem("token", urlToken);

      // Optional but strongly recommended: fetch user data
      const fetchAndStoreUser = async () => {
        try {
          const res = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/users/me`,
            {
              headers: { Authorization: `Bearer ${urlToken}` },
              credentials: "include",
            },
          );

          if (!res.ok) throw new Error();

          const user = await res.json();
          localStorage.setItem("user", JSON.stringify(user));

          // Now let normal logic run (or force resolve-role)
          router.replace("/resolve-role");
        } catch (err) {
          console.error("Failed to fetch user after OAuth", err);
          localStorage.clear();
          document.cookie = "token=; expires=Thu, 01 Jan 1970";
          router.replace("/login");
        }
      };

      fetchAndStoreUser();
      return;
    }

    // Normal no-token check
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
      }
    } catch (e) {
      console.log("Invalid user data");
      router.replace("/");
    }
  }, [router, searchParams]);

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
