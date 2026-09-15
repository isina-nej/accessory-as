export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const { db } = await import("@/db");
    const { products } = await import("@/db/schema");
    const rows = await db.select().from(products).limit(24);
    return Response.json({ ok: true, data: rows });
  } catch {
    return Response.json({ ok: false, error: "DB در دسترس نیست (MySQL لوکال را بالا بیاور)" }, { status: 503 });
  }
}
