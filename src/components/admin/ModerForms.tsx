"use client";

import { useRouter } from "next/navigation";
import { ConfirmBtn } from "@/components/admin/Forms";
import { deleteReview, markMessage, setReviewVerified } from "@/server/admin-content";

export function MsgBtn({ id, read }: { id: string; read: boolean }) {
  const router = useRouter();
  return (
    <button
      className="text-xs text-(--color-brand)"
      onClick={async () => {
        await markMessage(id, !read);
        router.refresh();
      }}
    >
      {read ? "نخوانده کن" : "خوانده شد"}
    </button>
  );
}

export function ReviewBtns({ id, verified }: { id: string; verified: boolean }) {
  const router = useRouter();
  return (
    <span className="flex gap-2">
      <button
        className="text-xs text-(--color-brand)"
        onClick={async () => {
          await setReviewVerified(id, !verified);
          router.refresh();
        }}
      >
        {verified ? "لغو تأیید" : "تأیید"}
      </button>
      <ConfirmBtn label="حذف" onConfirm={() => deleteReview(id).then((r) => { if (r.ok) router.refresh(); return r; })} />
    </span>
  );
}
