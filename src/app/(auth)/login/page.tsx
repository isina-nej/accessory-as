import { Suspense } from "react";
import { LoginFlow } from "@/components/auth/LoginFlow";

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="rounded-2xl border bg-white p-6 text-center text-sm">…</div>}>
      <LoginFlow />
    </Suspense>
  );
}
