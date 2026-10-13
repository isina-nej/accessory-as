"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { ConfirmBtn } from "@/components/admin/Forms";
import { deleteMessage, deleteReview, markMessage, setReviewVerified } from "@/server/admin-content";

export function MsgBtn({ id, read }: { id: string; read: boolean }) {
  const router = useRouter();
  const [msg, setMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  return (
    <span className="inline-flex flex-wrap items-center gap-2">
      <button
        type="button"
        disabled={busy}
        className="text-xs text-(--color-brand) disabled:opacity-50"
        onClick={async () => {
          setBusy(true);
          const r = await markMessage(id, !read);
          setBusy(false);
          if (!r.ok) setMsg(r.error);
          else router.refresh();
        }}
      >
        {read ? "نخوانده کن" : "خوانده شد"}
      </button>
      <ConfirmBtn label="حذف" onConfirm={() => deleteMessage(id).then((r) => { if (r.ok) router.refresh(); return r; })} />
      {msg && <span className="text-[11px] text-(--color-wine)">{msg}</span>}
    </span>
  );
}

export function ReviewBtns({ id, verified }: { id: string; verified: boolean }) {
  const router = useRouter();
  const [msg, setMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  return (
    <span className="inline-flex flex-wrap items-center gap-2">
      <button
        type="button"
        disabled={busy}
        className="text-xs text-(--color-brand) disabled:opacity-50"
        onClick={async () => {
          setBusy(true);
          const r = await setReviewVerified(id, !verified);
          setBusy(false);
          if (!r.ok) setMsg(r.error);
          else {
            setMsg(null);
            router.refresh();
          }
        }}
      >
        {verified ? "لغو تأیید" : "تأیید"}
      </button>
      <ConfirmBtn label="حذف" onConfirm={() => deleteReview(id).then((r) => { if (r.ok) router.refresh(); return r; })} />
      {msg && <span className="text-[11px] text-(--color-wine)">{msg}</span>}
    </span>
  );
}