export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const { testConnection } = await import("@/db");
    await testConnection();
    const { db } = await import("@/db");
    const { products } = await import("@/db/schema");
    const rows = await db.select().from(products).limit(24);
    return Response.json({ ok: true, data: rows });
  } catch (e) {
    const err = e as { code?: string; message?: string; cause?: { code?: string; message?: string } };
    return Response.json(
      {
        ok: false,
        stage: "connect",
        code: err?.code ?? null,
        msg: String(err?.message ?? e).slice(0, 200),
        cause: err?.cause ? `${err.cause.code ?? ""}: ${String(err.cause.message ?? "").slice(0, 150)}` : null,
      },
      { status: 503 },
    );
  }
}
