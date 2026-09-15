export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const { db } = await import("@/db");
    const { products } = await import("@/db/schema");
    const rows = await db.select().from(products).limit(24);
    return Response.json({ ok: true, data: rows });
  } catch (e) {
    const err = e as { code?: string; message?: string; name?: string };
    return Response.json(
      { ok: false, error: "DB در دسترس نیست", code: err?.code ?? null, msg: String(err?.message ?? e).slice(0, 200) },
      { status: 503 },
    );
  }
}
