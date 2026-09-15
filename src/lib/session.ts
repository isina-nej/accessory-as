import { headers } from "next/headers";
import { auth } from "./auth";

export async function getSessionUser() {
  try {
    const s = await auth.api.getSession({ headers: await headers() });
    return s?.user ?? null;
  } catch {
    return null;
  }
}

export async function getUserId(): Promise<string | null> {
  const u = await getSessionUser();
  return u?.id ?? null;
}
