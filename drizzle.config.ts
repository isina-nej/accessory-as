import fs from "node:fs";
import { defineConfig } from "drizzle-kit";

function loadCa(): string | undefined {
  const direct = process.env.MYSQL_SSL_CA;
  if (direct) {
    return direct.includes("BEGIN CERTIFICATE")
      ? direct
      : Buffer.from(direct, "base64").toString("utf8");
  }
  for (const p of [`${process.cwd()}/certs/aiven-ca.pem`, "./certs/aiven-ca.pem"]) {
    try {
      if (fs.existsSync(p)) return fs.readFileSync(p, "utf8");
    } catch { /* ادامه */ }
  }
  return undefined;
}

function credentials() {
  const url = process.env.DATABASE_URL ?? "";
  const ca = loadCa();
  if (!ca) return { url };
  try {
    const u = new URL(url);
    return {
      host: u.hostname,
      port: Number(u.port || 3306),
      user: decodeURIComponent(u.username),
      password: decodeURIComponent(u.password),
      database: u.pathname.replace(/^\//, ""),
      ssl: { ca },
    };
  } catch {
    return { url };
  }
}

export default defineConfig({
  dialect: "mysql",
  schema: "./src/db/schema.ts",
  out: "./src/db/drizzle",
  dbCredentials: credentials(),
});
