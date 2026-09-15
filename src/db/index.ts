import fs from "node:fs";
import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import * as schema from "./schema";

// لیزی: ایمپورت ماژول در بیلد نترکد؛ خطا فقط موقع کوئری واقعی.
let pool: mysql.Pool | undefined;

function loadCa(): string | undefined {
  const direct = process.env.MYSQL_SSL_CA;
  if (direct) {
    return direct.includes("BEGIN CERTIFICATE")
      ? direct
      : Buffer.from(direct, "base64").toString("utf8");
  }
  // ponytail: فایل لوکال فقط برای migrate/seed؛ روی ورسل کامیت نمی‌شود (*.pem)
  try {
    const p = `${process.cwd()}/certs/aiven-ca.pem`;
    if (fs.existsSync(p)) return fs.readFileSync(p, "utf8");
  } catch { /* بدون CA: اتصال بدون SSL */ }
  return undefined;
}

export function getPool(): mysql.Pool {
  if (!pool) {
    const raw = process.env.DATABASE_URL;
    if (!raw) throw new Error("DATABASE_URL تنظیم نشده (.env.example را ببین)");
    // ponytail: به‌جای URI string، host/port جدا — هاست Aiven با URI تایم‌اوت می‌خورد
    const u = new URL(raw);
    const ca = loadCa();
    pool = mysql.createPool({
      host: u.hostname,
      port: Number(u.port || 3306),
      user: decodeURIComponent(u.username),
      password: decodeURIComponent(u.password),
      database: u.pathname.replace(/^\//, "").split("?")[0] || undefined,
      connectTimeout: 25000,
      waitForConnections: true,
      queueLimit: 0,
      ...(ca ? { ssl: { ca, rejectUnauthorized: true } } : {}),
    });
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
