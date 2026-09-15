"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export type CartLine = { id: string; qty: number };

const MAX_QTY = 99;

type CartState = {
  lines: CartLine[];
  add: (id: string, qty?: number) => void;
  setQty: (id: string, qty: number) => void;
  remove: (id: string) => void;
  clear: () => void;
};

export const useCart = create<CartState>()(
  persist(
    (set) => ({
      lines: [],
      add: (id, qty = 1) =>
        set((s) => ({
          lines: s.lines.some((l) => l.id === id)
            ? s.lines.map((l) =>
                l.id === id ? { ...l, qty: Math.min(MAX_QTY, l.qty + qty) } : l,
              )
            : [...s.lines, { id, qty: Math.max(1, Math.min(MAX_QTY, qty)) }],
        })),
      setQty: (id, qty) =>
        set((s) =>
          qty <= 0
            ? { lines: s.lines.filter((l) => l.id !== id) }
            : {
                lines: s.lines.map((l) =>
                  l.id === id ? { ...l, qty: Math.min(MAX_QTY, qty) } : l,
                ),
              },
        ),
      remove: (id) => set((s) => ({ lines: s.lines.filter((l) => l.id !== id) })),
      clear: () => set({ lines: [] }),
    }),
    { name: "as-cart", version: 1 },
  ),
);

export function cartCount(lines: CartLine[]): number {
  return lines.reduce((n, l) => n + l.qty, 0);
}
