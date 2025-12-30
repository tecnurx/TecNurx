"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

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
    <div lang="en" className="">
      <div className="">
        <body className="">{children}</body>
      </div>
    </div>
  );
}
