export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const ids = (searchParams.get("ids") ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 50);
  try {
    const { getCartLines } = await import("@/lib/menu");
    const data = await getCartLines(ids);
    return Response.json({ ok: true, data });
  } catch {
    return Response.json({ ok: false, error: "خطا در دریافت سبد" }, { status: 503 });
  }
}
