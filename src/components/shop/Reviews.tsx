import { Star } from "lucide-react";
import { toFa } from "@/lib/fa";
import type { ProductReview } from "@/lib/get-products";

function faDate(d: Date | string): string {
  const dt = d instanceof Date ? d : new Date(d);
  try {
    return toFa(new Intl.DateTimeFormat("fa-IR", { year: "numeric", month: "2-digit", day: "2-digit" }).format(dt));
  } catch {
    return toFa(dt.toISOString().slice(0, 10));
  }
}

export function RatingBadge({ avg, count }: { avg: number; count: number }) {
  const shown = count > 0 ? toFa(avg.toFixed(1)) : toFa("—");
  return (
    <div className="flex items-center gap-2 text-sm">
      <span className="flex items-center gap-1 rounded-lg bg-amber-100 px-2 py-1 font-bold text-amber-600">
        <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
        {shown}
      </span>
      <span className="text-(--color-muted-fg)">
        {count > 0 ? `(${toFa(count)} دیدگاه)` : "(بدون دیدگاه)"}
      </span>
    </div>
  );
}

export function ReviewList({ items }: { items: ProductReview[] }) {
  if (items.length === 0) {
    return (
      <div className="rounded-2xl border bg-white p-6 text-center text-sm text-(--color-muted-fg)">
        هنوز دیدگاهی ثبت نشده. اولین نفر باش!
      </div>
    );
  }
  return (
    <div className="space-y-3">
      {items.map((r) => (
        <article key={r.id} className="space-y-2 rounded-2xl border bg-white p-4">
          <div className="flex items-center justify-between gap-2">
            <p className="text-sm font-bold">{r.author}</p>
            <span className="flex items-center gap-1 text-sm font-bold">
              <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
              {toFa(r.rating)}{" "}
              <span className="font-normal text-(--color-muted-fg)">از {toFa(5)}</span>
            </span>
          </div>
          <p className="text-sm leading-7">{r.body}</p>
          <p className="text-xs text-(--color-muted-fg)">{faDate(r.createdAt)}</p>
        </article>
      ))}
    </div>
  );
}
