import { eq } from "drizzle-orm";
import { db } from "@/db";
import { staffRoles } from "@/db/schema";
import { getSessionUser, getUserId } from "@/lib/session";

import { ROLE_FA, STAFF_ROLES } from "../lib/roles";
import type { StaffRole } from "../lib/roles";
export { ROLE_FA, STAFF_ROLES };
export type { StaffRole };

export async function getMyRoles(): Promise<StaffRole[]> {
  const uid = await getUserId();
  if (!uid) return [];
  try {
    const rows = await db.select().from(staffRoles).where(eq(staffRoles.userId, uid));
    return rows.map((r) => r.role as StaffRole).filter((r) => (STAFF_ROLES as string[]).includes(r));
  } catch {
    return [];
  }
}

export async function isStaff(role?: StaffRole): Promise<boolean> {
  const roles = await getMyRoles();
  if (roles.length === 0) return false;
  if (!role) return true;
  if (roles.includes("admin")) return true;
  return roles.includes(role);
}

export async function requireStaff(role?: StaffRole): Promise<{ ok: true; userId: string; roles: StaffRole[] } | { ok: false; error: string }> {
  const user = await getSessionUser();
  if (!user) return { ok: false, error: "وارد شو" };
  const roles = await getMyRoles();
  if (roles.length === 0) return { ok: false, error: "دسترسی نداری" };
  if (role && !roles.includes("admin") && !roles.includes(role)) return { ok: false, error: "دسترسی نداری" };
  return { ok: true, userId: user.id, roles };
}

// ponytail: بوت‌استرپ ادمین با ADMIN_EMAIL — بعد از اولین ورود حذفش کن
export async function bootstrapAdmin(): Promise<boolean> {
  const email = (process.env.ADMIN_EMAIL ?? "").trim().toLowerCase();
  if (!email) return false;
  const user = await getSessionUser();
  if (!user || (user.email ?? "").toLowerCase() !== email) return false;
  try {
    const existing = await db.select().from(staffRoles).where(eq(staffRoles.userId, user.id));
    if (existing.length > 0) return true;
    await db.insert(staffRoles).values({ userId: user.id, role: "admin" });
    return true;
  } catch {
    return false;
  }
}
