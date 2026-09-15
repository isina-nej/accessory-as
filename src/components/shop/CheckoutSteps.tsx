import { cn } from "@/lib/cn";
import { toFa } from "@/lib/fa";

const STEPS = ["سبد خرید", "آدرس شما", "روش ارسال", "پرداخت"];

export function CheckoutSteps({ step }: { step: number }) {
  return (
    <ol className="flex items-center gap-1 text-xs md:gap-2 md:text-sm">
      {STEPS.map((s, i) => {
        const n = i + 1;
        const active = n === step;
        const done = n < step;
        return (
          <li key={s} className="flex flex-1 items-center gap-1 md:gap-2">
            <span
              className={cn(
                "flex h-7 w-7 shrink-0 items-center justify-center rounded-full border font-bold",
                active
                  ? "border-(--color-brand) bg-(--color-brand) text-white"
                  : done
                    ? "border-(--color-brand) text-(--color-brand)"
                    : "border-black/15 text-(--color-muted-fg)",
              )}
            >
              {toFa(n)}
            </span>
            <span className={cn(active ? "font-bold" : "text-(--color-muted-fg)", "whitespace-nowrap")}>{s}</span>
            {n < STEPS.length && <span className="mx-1 h-px flex-1 bg-black/10" />}
          </li>
        );
      })}
    </ol>
  );
}
