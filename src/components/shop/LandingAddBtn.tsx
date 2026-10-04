"use client";
import { Icon } from "@/components/ui/Icon";
import { useCart } from "@/stores/cart";
export function LandingAddBtn({ id, title }: { id: string; title: string }) {
  const add = useCart((s) => s.add);
  return (
    <button
      type="button"
      onClick={() => add(id)}
      aria-label={`افزودن ${title} به سبد`}
      className="flex h-7 w-7 items-center justify-center rounded-full bg-[#0A5A55] text-white transition hover:bg-[#084A46] active:scale-95"
    >
      <Icon name="icons-20--add-to-cart-button" className="h-4 w-4 brightness-0 invert" alt="" />
    </button>
  );
}
