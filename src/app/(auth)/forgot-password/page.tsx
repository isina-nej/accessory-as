import { Suspense } from "react";
import { ForgotFlow } from "@/components/auth/ForgotFlow";

export default function ForgotPage() {
  return (
    <Suspense fallback={<div className="rounded-2xl border bg-white p-6 text-center text-sm">…</div>}>
      <ForgotFlow />
    </Suspense>
  );
}
