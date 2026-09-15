export const dynamic = "force-dynamic";

async function handler(req: Request) {
  const { auth } = await import("@/lib/auth");
  const { toNextJsHandler } = await import("better-auth/next-js");
  const { GET, POST } = toNextJsHandler(auth);
  return req.method === "POST" ? POST(req) : GET(req);
}

export const GET = handler;
export const POST = handler;
