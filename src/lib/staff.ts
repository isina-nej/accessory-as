import { eq } from "drizzle-orm";
import { db } from "@/db";
import { staffRoles } from "@/db/schema";
import { getSessionUser, getUserId } from "@/lib/session";

import { hasStaffPermission, ROLE_FA, STAFF_ROLES } from "./roles";
import type { AdminPermission, StaffRole } from "./roles";
export { hasStaffPermission, ROLE_FA, STAFF_ROLES };
export type { AdminPermission, StaffRole };

export type StaffGate = { ok: true; userId: string; roles: StaffRole[] } | { ok: false; error: string };

export function canAccess(roles: readonly StaffRole[], permission: AdminPermission): boolean {
  return hasStaffPermission(roles, permission);
}

export async function getMyRoles(): Promise<StaffRole[]> {
  const uid = await getUserId();
  if (!uid) return [];
  try {
    const rows = await db.select().from(staffRoles).where(eq(staffRoles.userId, uid));
    return rows.map((r) => r.role as StaffRole).filter((r) => (STAFF_ROLES as string[]).includes(r));
  } catch (e) {
    console.error("getMyRoles failed", e);
    return [];
  }
}

export async function requirePermission(permission: AdminPermission): Promise<StaffGate> {
  const user = await getSessionUser();
  if (!user) return { ok: false, error: "وارد شو" };
  const roles = await getMyRoles();
  if (!canAccess(roles, permission)) return { ok: false, error: "دسترسی نداری" };
  return { ok: true, userId: user.id, roles };
}

export async function requireAnyPermission(...permissions: AdminPermission[]): Promise<StaffGate> {
  const user = await getSessionUser();
  if (!user) return { ok: false, error: "وارد شو" };
  const roles = await getMyRoles();
  if (!permissions.some((permission) => canAccess(roles, permission))) return { ok: false, error: "دسترسی نداری" };
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
