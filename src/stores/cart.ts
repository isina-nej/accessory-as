"use client";

import { create } from "zustand";

export type CartLine = { id: string; qty: number };

type CartState = {
  lines: CartLine[];
  add: (id: string) => void;
  remove: (id: string) => void;
  clear: () => void;
};

export const useCart = create<CartState>((set) => ({
  lines: [],
  add: (id) =>
    set((s) => ({
      lines: s.lines.some((l) => l.id === id)
        ? s.lines.map((l) => (l.id === id ? { ...l, qty: l.qty + 1 } : l))
        : [...s.lines, { id, qty: 1 }],
    })),
  remove: (id) => set((s) => ({ lines: s.lines.filter((l) => l.id !== id) })),
  clear: () => set({ lines: [] }),
}));
