export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const { db } = await import("@/db");
    const { products } = await import("@/db/schema");
    const rows = await db.select().from(products).limit(24);
    return Response.json({ ok: true, data: rows });
  } catch (e) {
    const err = e as {
      code?: string; message?: string; errno?: number; sqlState?: string;
      cause?: { code?: string; message?: string };
    };
    return Response.json(
      {
        ok: false,
        error: "DB در دسترس نیست",
        code: err?.code ?? null,
        errno: err?.errno ?? null,
        sqlState: err?.sqlState ?? null,
        msg: String(err?.message ?? e).slice(0, 300),
        cause: err?.cause ? { code: err.cause.code ?? null, msg: String(err.cause.message ?? "").slice(0, 200) } : null,
      },
      { status: 503 },
    );
  }
}
