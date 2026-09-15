"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { deleteProduct } from "@/server/admin-products";

export function ProductDel({ id }: { id: string }) {
  const router = useRouter();
  const [msg, setMsg] = useState<string | null>(null);
  return (
    <span className="inline-flex items-center gap-2">
      <button
        className="text-xs text-(--color-wine) hover:underline"
        type="button"
        onClick={async () => {
          if (!confirm("مطمئنی؟")) return;
          const r = await deleteProduct(id);
          if (!r.ok) setMsg(r.error);
          else router.refresh();
        }}
      >
        حذف
      </button>
      {msg && <span className="text-xs text-(--color-wine)">{msg}</span>}
    </span>
  );
}
