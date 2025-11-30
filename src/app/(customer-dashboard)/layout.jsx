import "@/app/globals.css";
import DashboardNav from "@/components/dashboard/DashboardNav";
import Sidebar from "@/components/sidebar/Sidebar";
import { Plus_Jakarta_Sans } from "next/font/google";

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["200", "300", "400", "500", "600", "700", "800"], // optional
});

export const metadata = {
  title: "Dashboard | TecNurx",
  description: "Fast, reliable device repair and insurance",
  icons: {
    icon: "/favicon.png",
    apple: "/favicon.png",
    shortcut: "/favicon.png",
  },
};

export default function DashboardLayout({ children }) {
  return (
    <html lang="en" className={plusJakartaSans.className}>
      <body>
        <div className="side-layout">
          <Sidebar />
          <div className="children">{children}</div>
        </div>
        <div className="nav-layout">
          <DashboardNav />
        </div>
      </body>
    </html>
  );
}
