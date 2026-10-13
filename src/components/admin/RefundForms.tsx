"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { setRefundStatus } from "@/server/admin-users";
import { canTransitionRefundStatus, REFUND_STATUSES, REFUND_STATUS_FA } from "@/lib/admin-labels";

export function RefundStatusBtns({ id, status, canWrite }: { id: string; status: string; canWrite: boolean }) {
  const router = useRouter();
  const [msg, setMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  if (!canWrite) return <span className="text-xs text-(--color-muted-fg)">{REFUND_STATUS_FA[status] ?? status}</span>;
  return (
    <span className="inline-flex flex-wrap items-center gap-1">
      {REFUND_STATUSES.map((s) => (
        <button
          key={s}
          type="button"
          disabled={busy || !canTransitionRefundStatus(status, s)}
          onClick={async () => {
            setBusy(true);
            const r = await setRefundStatus(id, s);
            setBusy(false);
            if (!r.ok) setMsg(r.error);
            else {
              setMsg(null);
              router.refresh();
            }
          }}
          className={`rounded-full border px-2 py-0.5 text-[11px] disabled:opacity-40 ${s === status ? "bg-(--color-brand) text-white" : ""}`}
        >
          {REFUND_STATUS_FA[s]}
        </button>
      ))}
      {msg && <span className="text-[11px] text-(--color-wine)">{msg}</span>}
    </span>
  );
}