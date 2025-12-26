import "@/app/globals.css";
import Navbar from "@/components/navbar/Navbar";
import { Plus_Jakarta_Sans } from "next/font/google";

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["200", "300", "400", "500", "600", "700", "800"], // optional
});

export const metadata = {
  title: "TecNurx",
  description: "Fast, reliable device repair and insurance",
  icons: {
    icon: "/favicon.png",
    apple: "/favicon.png",
    shortcut: "/favicon.png",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={plusJakartaSans.className}>
      <body>
        <Navbar />
        {children}
      </body>
    </html>
  );
}
