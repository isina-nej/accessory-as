"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ReviewForm } from "./ReviewForm";

export function ReviewModal({ slug }: { slug: string }) {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  return (
    <>
      <button onClick={() => setOpen(true)} className="rounded-lg border px-4 py-2 text-sm">
        ثبت دیدگاه
      </button>
      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={() => setOpen(false)}
          role="dialog"
          aria-modal="true"
          aria-label="ثبت دیدگاه"
        >
          <div className="w-full max-w-md" onClick={(e) => e.stopPropagation()}>
            <ReviewForm
              slug={slug}
              onDone={() => {
                setOpen(false);
                router.refresh();
              }}
            />
            <button onClick={() => setOpen(false)} className="mt-2 w-full text-center text-sm text-white">
              بستن
            </button>
          </div>
        </div>
      )}
    </>
  );
}
