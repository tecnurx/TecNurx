"use client";

import { useEffect, use } from "react";
import { useRouter } from "next/navigation";

export default function MyOrderDetailRedirect({ params }) {
  const router = useRouter();
  const unwrappedParams = use(params);
  const id = unwrappedParams?.id;

  useEffect(() => {
    if (id) {
      router.replace(`/dashboard/repairs/${id}`);
    } else {
      router.replace("/dashboard/repairs");
    }
  }, [router, id]);

  return (
    <div style={{ padding: "40px 24px", textAlign: "center", color: "#6b7280" }}>
      Redirecting to Repair details...
    </div>
  );
}
