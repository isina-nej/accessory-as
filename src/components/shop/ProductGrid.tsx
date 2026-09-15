import { type ShopProduct } from "@/lib/products";
import { ProductCard } from "./ProductCard";

export function ProductGrid({ items }: { items: ShopProduct[] }) {
  if (items.length === 0) {
    return (
      <div className="rounded-2xl border bg-white p-10 text-center text-(--color-muted-fg)">
        محصولی با این فیلترها پیدا نشد. فیلترها را کم کن.
      </div>
    );
  }
  return (
    <div className="grid grid-cols-2 gap-3 xl:grid-cols-3">
      {items.map((p) => (
        <ProductCard key={p.id} p={p} />
      ))}
    </div>
  );
}
