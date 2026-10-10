"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { extractUserRole, getDashboardForUser } from "@/lib/roleUtils";
import "./resolve.css";

export default function ResolveRole() {
  const router = useRouter();
  const [isResolving, setIsResolving] = useState(true);

  useEffect(() => {
    const resolveUserRole = async () => {
      try {
        const userJson = localStorage.getItem("user");
        const token = localStorage.getItem("token");

        if (!userJson || !token) {
          console.log("No user data or token found, redirecting to login");
          router.replace("/login");
          return;
        }

        const user = JSON.parse(userJson);
        const destination = getDashboardForUser(user);

        console.log("Resolving user role:", extractUserRole(user), "-> Redirecting to:", destination);

        router.replace(destination);
      } catch (err) {
        console.error("Error resolving role:", err);
        localStorage.removeItem("user");
        localStorage.removeItem("token");
        localStorage.removeItem("loginTime");
        document.cookie =
          "token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
        router.replace("/login");
      } finally {
        setIsResolving(false);
      }
    };

    resolveUserRole();
  }, [router]);

  if (!isResolving) {
    return null;
  }

  return (
    <div className="resolve-wrap">
      <p>Redirecting to your dashboard...</p>
      <div className="respinner"></div>
    </div>
  );
}
