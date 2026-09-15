export type StaffRole = "admin" | "content" | "support";
export const STAFF_ROLES: StaffRole[] = ["admin", "content", "support"];

export const ROLE_FA: Record<StaffRole, string> = {
  admin: "ادمین",
  content: "مدیر محتوا",
  support: "پشتیبانی",
};
