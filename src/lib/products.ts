import { z } from "zod";

export const SORTS = ["new", "cheap", "popular", "expensive", "all"] as const;
export type SortKey = (typeof SORTS)[number];
export const SORT_LABELS: Record<SortKey, string> = {
  all: "همه",
  new: "جدیدترین",
  cheap: "ارزان‌ترین",
  popular: "پرفروش‌ترین",
  expensive: "گران‌ترین",
};

export const shopQuerySchema = z.object({
  sort: z.enum(SORTS).default("all"),
  q: z.string().max(100).default(""),
  cat: z.string().max(100).default(""),
  color: z.string().max(50).default(""),
  size: z.string().max(10).default(""),
  inStock: z.coerce.boolean().default(false),
  min: z.coerce.number().nonnegative().default(250000),
  max: z.coerce.number().positive().default(25050000),
  page: z.coerce.number().int().min(1).default(1),
});

export type ShopQuery = z.infer<typeof shopQuerySchema>;
export const PAGE_SIZE = 12;

export type ShopProduct = {
  id: string;
  slug: string;
  title: string;
  categoryId: string | null;
  priceToman: number;
  oldPriceToman: number | null;
  discountPct: number | null;
  stock: number;
  image: string | null;
};
