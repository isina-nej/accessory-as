import { type ShopProduct } from "@/lib/products";
import { ProductCard } from "./ProductCard";

export function ProductGrid({ items }: { items: ShopProduct[] }) {
  if (items.length === 0) {
    return (
      <div className="rounded-[10px] border border-[#D6DBDE] bg-white p-10 text-center text-[#8A9398]">
        محصولی با این فیلترها پیدا نشد. فیلترها را کم کن.
      </div>
    );
  }
  return (
    <div className="grid grid-cols-2 overflow-hidden rounded-[10px] border border-b-0 border-[#D6DBDE] bg-white sm:grid-cols-3 xl:grid-cols-4">
      {items.map((p) => (
        <ProductCard key={p.id} p={p} />
      ))}
    </div>
  );
}
