export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const { db } = await import("@/db");
    const { products } = await import("@/db/schema");
    const rows = await db.select().from(products).limit(24);
    return Response.json({ ok: true, data: rows });
  } catch (e) {
    const msg = e instanceof Error ? `${e.name}: ${e.message}`.slice(0, 300) : String(e).slice(0, 300);
    return Response.json(
      {
        ok: false,
        error: "DB در دسترس نیست (MySQL لوکال را بالا بیاور)",
        debug: msg,
        hasDb: !!process.env.DATABASE_URL,
        hasCa: !!process.env.MYSQL_SSL_CA,
        caLen: (process.env.MYSQL_SSL_CA ?? "").length,
      },
      { status: 503 },
    );
  }
}
