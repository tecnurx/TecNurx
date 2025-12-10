// app/dashboard/layout.jsx
import "@/app/globals.css";
import DashboardNav from "@/components/dashboard/DashboardNav";
import Sidebar from "@/components/sidebar/Sidebar";
import { Plus_Jakarta_Sans } from "next/font/google";
import { SidebarProvider } from "../../../context/SidebarContext";

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
});

export const metadata = {
  title: "Dashboard | TecNurx",
  description: "Fast, reliable device repair and insurance",
  icons: {
    icon: "/favicon.png",
  },
};

export default function DashboardLayout({ children }) {
  return (
    <html lang="en" className={plusJakartaSans.className}>
      <body>
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
      </body>
    </html>
  );
}
