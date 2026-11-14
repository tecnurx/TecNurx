import "@/app/globals.css";
import Navbar from "@/components/navbar/Navbar";
import ScrollToTopButton from "@/components/ScrollToTopButton";

export const metadata = {
  title: "TecNurx",
  description: "Fast, reliable device repair and insurance",
  icons: {
    icon: "/favicon.png",
    apple: "/favicon.png",
    shortcut: "/favicon.png",
  },
};

export default function LandingLayout({ children }) {
  return (
    <div className="layout-wrapper">
      <Navbar />
      <main>{children}</main>
      <ScrollToTopButton />
    </div>
  );
}
