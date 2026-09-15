"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { inputCls } from "@/components/admin/ui";
import { Button } from "@/components/ui/button";

export function AdminForm<T extends Record<string, unknown>>({
  initial, onSave, children, submitLabel = "ذخیره",
}: {
  initial: T;
  onSave: (v: T) => Promise<{ ok: true } | { ok: false; error: string }>;
  children: (v: T, set: (p: Partial<T>) => void) => React.ReactNode;
  submitLabel?: string;
}) {
  const router = useRouter();
  const [v, setV] = useState<T>(initial);
  const [msg, setMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const set = (p: Partial<T>) => setV((old) => ({ ...old, ...p }));
  return (
    <form
      className="space-y-3"
      onSubmit={async (e) => {
        e.preventDefault();
        setBusy(true);
        setMsg(null);
        const r = await onSave(v);
        setBusy(false);
        if (!r.ok) setMsg(r.error);
        else router.refresh();
      }}
    >
      {children(v, set)}
      {msg && <p className="text-sm text-(--color-wine)">{msg}</p>}
      <Button disabled={busy}>{busy ? "…" : submitLabel}</Button>
    </form>
  );
}

export function ConfirmBtn({ label, onConfirm }: { label: string; onConfirm: () => Promise<{ ok: true } | { ok: false; error: string }> }) {
  const router = useRouter();
  const [msg, setMsg] = useState<string | null>(null);
  return (
    <span className="inline-flex items-center gap-2">
      <button
        className="text-xs text-(--color-wine) hover:underline"
        onClick={async () => {
          if (!confirm("مطمئنی؟")) return;
          const r = await onConfirm();
          if (!r.ok) setMsg(r.error);
          else router.refresh();
        }}
        type="button"
      >
        {label}
      </button>
      {msg && <span className="text-xs text-(--color-wine)">{msg}</span>}
    </span>
  );
}
