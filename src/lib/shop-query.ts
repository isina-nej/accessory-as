import { type ShopQuery } from "./products";

export function toURLSearchParams(q: ShopQuery): string {
  const p = new URLSearchParams();
  if (q.sort !== "all") p.set("sort", q.sort);
  if (q.q) p.set("q", q.q);
  if (q.cat) p.set("cat", q.cat);
  if (q.color) p.set("color", q.color);
  if (q.size) p.set("size", q.size);
  if (q.inStock) p.set("inStock", "true");
  if (q.min !== 250000) p.set("min", String(q.min));
  if (q.max !== 25050000) p.set("max", String(q.max));
  if (q.page > 1) p.set("page", String(q.page));
  return p.toString();
}

export function withQuery(base: string, q: ShopQuery, patch: Partial<ShopQuery>): string {
  const merged = { ...q, ...patch };
  const s = toURLSearchParams(merged);
  return s ? `${base}?${s}` : base;
}
