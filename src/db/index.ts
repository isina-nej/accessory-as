import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import * as schema from "./schema";

// لیزی: ایمپورت ماژول در بیلد نترکد؛ خطا فقط موقع کوئری واقعی.
let pool: mysql.Pool | undefined;

export function getPool(): mysql.Pool {
  if (!pool) {
    const url = process.env.DATABASE_URL;
    if (!url) throw new Error("DATABASE_URL تنظیم نشده (.env.example را ببین)");
    pool = mysql.createPool(url);
  }
  return pool;
}

export const db = drizzle(
  new Proxy({} as mysql.Pool, {
    get: (_t, prop) => {
      const p = getPool() as unknown as Record<string | symbol, unknown>;
      const v = p[prop as string];
      return typeof v === "function" ? (v as (...a: unknown[]) => unknown).bind(p) : v;
    },
  }),
  { schema, mode: "default" },
);
