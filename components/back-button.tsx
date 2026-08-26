"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

export function BackButton() {
  const router = useRouter();
  return (
    <button onClick={() => router.back()} className="inline-flex items-center gap-1 text-sm text-grey-500 hover:text-grey-900">
      <ArrowLeft className="h-4 w-4" /> Back
    </button>
  );
}
