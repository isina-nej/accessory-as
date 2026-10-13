"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { archiveProduct, deleteProduct } from "@/server/admin-products";

export function ProductDel({ id, title }: { id: string; title?: string }) {
  const router = useRouter();
  const [msg, setMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const label = title ? `محصول «${title}»` : "این محصول";
  return (
    <span className="inline-flex items-center gap-2">
      <button
        className="text-xs text-(--color-muted-fg) hover:underline disabled:opacity-50"
        type="button"
        disabled={busy}
        onClick={async () => {
          if (!confirm(`${label} بایگانی شود؟ از فروشگاه حذف می‌شود اما داده‌هایش می‌ماند.`)) return;
          setBusy(true);
          const r = await archiveProduct(id);
          setBusy(false);
          if (!r.ok) setMsg(r.error);
          else router.refresh();
        }}
      >
        بایگانی
      </button>
      <button
        className="text-xs text-(--color-wine) hover:underline disabled:opacity-50"
        type="button"
        disabled={busy}
        onClick={async () => {
          if (!confirm(`${label} برای همیشه حذف شود؟ این کار برگشت‌پذیر نیست.`)) return;
          setBusy(true);
          const r = await deleteProduct(id);
          setBusy(false);
          if (!r.ok) setMsg(r.error);
          else router.refresh();
        }}
      >
        حذف
      </button>
      {msg && <span className="text-[11px] text-(--color-wine)">{msg}</span>}
    </span>
  );
}