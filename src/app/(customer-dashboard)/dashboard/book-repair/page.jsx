"use client";

import { useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function BookRepairRedirect() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const query = searchParams ? searchParams.toString() : "";
    const target = query ? `/dashboard/repairs/book?${query}` : "/dashboard/repairs/book";
    router.replace(target);
  }, [router, searchParams]);

  return (
    <div style={{ padding: "40px 24px", textAlign: "center", color: "#6b7280" }}>
      Redirecting to Book a Repair...
    </div>
  );
}

export default function BookRepairPage() {
  return (
    <Suspense fallback={<div style={{ padding: "40px", textAlign: "center" }}>Loading...</div>}>
      <BookRepairRedirect />
    </Suspense>
  );
}
