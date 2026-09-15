"use client";

import { useState } from "react";
import { Star } from "lucide-react";
import { cn } from "@/lib/cn";
import { toFa } from "@/lib/fa";
import { submitReview } from "@/lib/review-actions";

export function ReviewForm({ slug, onDone }: { slug: string; onDone?: () => void }) {
  const [author, setAuthor] = useState("");
  const [rating, setRating] = useState(5);
  const [body, setBody] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  return (
    <form
      className="space-y-3 rounded-2xl border bg-white p-4"
      onSubmit={async (e) => {
        e.preventDefault();
        setPending(true);
        setMsg(null);
        const r = await submitReview(slug, { author, rating, body });
        setPending(false);
        if (r.ok) {
          setAuthor("");
          setBody("");
          setRating(5);
          setMsg("دیدگاهت ثبت شد، ممنون!");
          onDone?.();
        } else {
          setMsg(r.error);
        }
      }}
    >
      <p className="font-bold">ثبت دیدگاه</p>
      <p className="text-sm text-(--color-muted-fg)">نظر خود را در مورد این کالا با دیگران به اشتراک بگذارید.</p>
      <div className="flex items-center gap-1" role="radiogroup" aria-label="امتیاز">
        {[5, 4, 3, 2, 1].map((s) => (
          <button
            key={s}
            type="button"
            role="radio"
            aria-checked={rating === s}
            aria-label={`امتیاز ${toFa(s)}`}
            onClick={() => setRating(s)}
            className={cn("rounded-lg border p-2", rating === s && "border-(--color-brand) bg-(--color-mist)")}
          >
            <Star className={cn("h-4 w-4", rating >= s ? "fill-amber-400 text-amber-400" : "text-gray-300")} />
          </button>
        ))}
        <span className="mr-2 text-sm text-(--color-muted-fg)">{toFa(rating)} از {toFa(5)}</span>
      </div>
      <input
        value={author}
        onChange={(e) => setAuthor(e.target.value)}
        placeholder="نام شما"
        className="h-10 w-full rounded-lg border bg-white px-3 text-sm"
        maxLength={100}
      />
      <textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        placeholder="نظر شما..."
        rows={4}
        className="w-full rounded-lg border bg-white px-3 py-2 text-sm"
        maxLength={2000}
      />
      <button
        disabled={pending}
        className="h-10 w-full rounded-lg bg-(--color-brand) text-sm font-bold text-white disabled:opacity-50"
      >
        {pending ? "در حال ثبت..." : "ثبت دیدگاه"}
      </button>
      {msg ? <p className="text-sm text-(--color-muted-fg)">{msg}</p> : null}
    </form>
  );
}
