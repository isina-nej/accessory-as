export async function GET() {
  let dbOk = false;
  let dbError: string | null = null;
  try {
    const { testConnection } = await import("@/db");
    await testConnection();
    dbOk = true;
  } catch (err) {
    dbError = err instanceof Error ? err.message : String(err);
  }
  return Response.json(
    { ok: dbOk, app: "accessory-as", db: dbOk ? "connected" : "disconnected", error: dbError },
    { status: dbOk ? 200 : 503 },
  );
}
