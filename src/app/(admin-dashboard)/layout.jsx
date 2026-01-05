"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AdminDashboardLayout({ children }) {
  // const router = useRouter();

  // useEffect(() => {
  //   const userJson = localStorage.getItem("user");

  //   if (!userJson) {
  //     router.replace("/");
  //     return;
  //   }

  //   try {
  //     const user = JSON.parse(userJson);
  //     const role = user.role?.toLowerCase();

  //     if (!["admin"].includes(role)) {
  //       router.replace("/resolve-role");
  //     }
  //   } catch (error) {
  //     console.log("Invalid user data in localStorage");
  //     router.replace("/");
  //   }
  // }, [router]);


  return (
    <div>
      <div className="">
        <main className="">{children}</main>
      </div>
    </div>
  );
}
