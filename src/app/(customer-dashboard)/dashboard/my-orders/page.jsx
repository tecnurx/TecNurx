"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function MyOrdersRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/dashboard/repairs");
  }, [router]);

  return (
    <div style={{ padding: "40px 24px", textAlign: "center", color: "#6b7280" }}>
      Redirecting to Repairs...
    </div>
  );
}
