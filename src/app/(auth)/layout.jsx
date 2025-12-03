import "@/app/globals.css";
import CustomToast from "@/components/CustomToast";
import { Plus_Jakarta_Sans } from "next/font/google";

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["200", "300", "400", "500", "600", "700", "800"],
});

export const metadata = {
  title: "Auth | TecNurx",
  description: "Fast, reliable device repair and insurance",
  icons: {
    icon: "/favicon.png",
    apple: "/favicon.png",
    shortcut: "/favicon.png",
  },
};

export default function AuthLayout({ children }) {
  return (
    <html lang="en" className={plusJakartaSans.className}>
      <body>{children}</body>
      <CustomToast />
    </html>
  );
}
