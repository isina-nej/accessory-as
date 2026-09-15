"use server";

import { revalidatePath } from "next/cache";
import { desc, eq, like, sql } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { staffRoles, user } from "@/db/schema";
import type { ActionRes } from "../lib/address-actions";
import { ROLE_FA, STAFF_ROLES, requireStaff, type StaffRole } from "./staff";

export async function listAdminUsers(q: string, page: number) {
  const gate = await requireStaff("admin");
  if (!gate.ok) return { items: [], total: 0 };
  const where = q ? like(user.email, `%${q}%`) : undefined;
  const [{ n }] = await db.select({ n: sql<number>`count(*)` }).from(user).where(where);
  const rows = await db.select().from(user).where(where).orderBy(desc(user.createdAt)).limit(20).offset(Math.max(0, page - 1) * 20);
  const roles = await db.select().from(staffRoles);
  const byUser = new Map<string, string[]>();
  for (const r of roles) {
    const arr = byUser.get(r.userId) ?? [];
    arr.push(r.role);
    byUser.set(r.userId, arr);
  }
  return { items: rows.map((u) => ({ ...u, roles: (byUser.get(u.id) ?? []).map((r) => ROLE_FA[r as StaffRole] ?? r).join("، ") })), total: Number(n) };
}

const roleSchema = z.object({ role: z.enum(["admin", "content", "support"]) });

export async function grantRole(userId: string, role: StaffRole): Promise<ActionRes<null>> {
  const gate = await requireStaff("admin");
  if (!gate.ok) return gate;
  const parsed = roleSchema.safeParse({ role });
  if (!parsed.success) return { ok: false, error: "نقش نامعتبر" };
  if (!STAFF_ROLES.includes(parsed.data.role)) return { ok: false, error: "نقش نامعتبر" };
  try {
    await db.insert(staffRoles).values({ userId, role: parsed.data.role }).onDuplicateKeyUpdate({ set: { role: parsed.data.role } });
    revalidatePath("/admin/users");
    return { ok: true, data: null };
  } catch {
    return { ok: false, error: "ناموفق بود" };
  }
}

export async function revokeRole(userId: string, role: StaffRole): Promise<ActionRes<null>> {
  const gate = await requireStaff("admin");
  if (!gate.ok) return gate;
  try {
    const { and } = await import("drizzle-orm");
    if (userId === gate.userId && role === "admin") {
      const rows = await db.select().from(staffRoles).where(eq(staffRoles.role, "admin"));
      if (rows.length <= 1) return { ok: false, error: "آخرین ادمین را نمی‌شود حذف کرد" };
    }
    await db.delete(staffRoles).where(and(eq(staffRoles.userId, userId), eq(staffRoles.role, role)));
    revalidatePath("/admin/users");
    return { ok: true, data: null };
  } catch {
    return { ok: false, error: "ناموفق بود" };
  }
}
