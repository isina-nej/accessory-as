export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const { db } = await import("@/db");
    const { products } = await import("@/db/schema");
    const rows = await db.select().from(products).limit(24);
    return Response.json({ ok: true, data: rows });
  } catch (e) {
    const raw = process.env.DATABASE_URL ?? "";
    let host = "", user = "", passLen = 0, dbName = "";
    try {
      const u = new URL(raw);
      host = u.hostname;
      user = u.username;
      passLen = u.password.length;
      dbName = u.pathname;
    } catch { /* ignore */ }
    const err = e as { message?: string; cause?: { code?: string; message?: string } };
    return Response.json(
      {
        ok: false,
        error: "DB در دسترس نیست",
        env: { dbLen: raw.length, host, user, passLen, dbName, caLen: (process.env.MYSQL_SSL_CA ?? "").length },
        cause: err?.cause ? { code: err.cause.code ?? null, msg: String(err.cause.message ?? "").slice(0, 120) } : String(err?.message ?? e).slice(0, 200),
      },
      { status: 503 },
    );
  }
}
