"use client";

import { useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import TecNurxLoader from "@/components/TecNurxLoader";

function BookRepairRedirect() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const query = searchParams ? searchParams.toString() : "";
    const target = query ? `/dashboard/repairs/book?${query}` : "/dashboard/repairs/book";
    router.replace(target);
  }, [router, searchParams]);

  return <TecNurxLoader minHeight="60vh" size="lg" />;
}

export default function BookRepairPage() {
  return (
    <Suspense fallback={<TecNurxLoader minHeight="60vh" size="lg" />}>
      <BookRepairRedirect />
    </Suspense>
  );
}
