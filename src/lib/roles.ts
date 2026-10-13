export type StaffRole = "admin" | "content" | "support";
export const STAFF_ROLES: StaffRole[] = ["admin", "content", "support"];

export type AdminPermission =
  | "dashboard.read"
  | "products.read"
  | "products.write"
  | "categories.read"
  | "categories.write"
  | "orders.read"
  | "orders.status"
  | "orders.tracking"
  | "users.read"
  | "users.roles"
  | "content.read"
  | "content.write"
  | "marketing.read"
  | "marketing.write"
  | "reviews.read"
  | "reviews.moderate"
  | "messages.read"
  | "messages.manage"
  | "settings.read"
  | "settings.write"
  | "payments.read"
  | "refunds.read"
  | "refunds.write"
  | "attributes.read"
  | "attributes.write";

export const ADMIN_ROLE_PERMISSIONS: Record<StaffRole, readonly AdminPermission[]> = {
  admin: [
    "dashboard.read", "products.read", "products.write", "categories.read", "categories.write",
    "orders.read", "orders.status", "orders.tracking", "users.read", "users.roles",
    "content.read", "content.write", "marketing.read", "marketing.write", "reviews.read",
    "reviews.moderate", "messages.read", "messages.manage", "settings.read", "settings.write",
    "payments.read", "refunds.read", "refunds.write", "attributes.read", "attributes.write",
  ],
  content: [
    "dashboard.read", "products.read", "products.write", "categories.read", "categories.write",
    "content.read", "content.write", "reviews.read", "reviews.moderate",
    "attributes.read", "attributes.write",
  ],
  support: [
    "dashboard.read", "orders.read", "orders.status", "orders.tracking", "reviews.read",
    "reviews.moderate", "messages.read", "messages.manage", "settings.read", "settings.write",
    "payments.read", "refunds.read", "refunds.write",
  ],
};

export function hasStaffPermission(roles: readonly StaffRole[], permission: AdminPermission): boolean {
  return roles.some((role) => ADMIN_ROLE_PERMISSIONS[role].includes(permission));
}

export const ROLE_FA: Record<StaffRole, string> = {
  admin: "ادمین",
  content: "مدیر محتوا",
  support: "پشتیبانی",
};

export const ADMIN_PERMISSION_FA: Record<AdminPermission, string> = {
  "dashboard.read": "مشاهده داشبورد",
  "products.read": "مشاهده محصولات",
  "products.write": "مدیریت محصولات",
  "categories.read": "مشاهده دسته‌ها",
  "categories.write": "مدیریت دسته‌ها",
  "orders.read": "مشاهده سفارش‌ها",
  "orders.status": "تغییر وضعیت سفارش",
  "orders.tracking": "مدیریت کد رهگیری",
  "users.read": "مشاهده کاربران",
  "users.roles": "مدیریت نقش کاربران",
  "content.read": "مشاهده محتوا",
  "content.write": "مدیریت محتوا",
  "marketing.read": "مشاهده بازاریابی",
  "marketing.write": "مدیریت بازاریابی",
  "reviews.read": "مشاهده دیدگاه‌ها",
  "reviews.moderate": "مدیریت دیدگاه‌ها",
  "messages.read": "مشاهده پیام‌ها",
  "messages.manage": "مدیریت پیام‌ها",
  "settings.read": "مشاهده تنظیمات",
  "settings.write": "مدیریت تنظیمات",
  "payments.read": "مشاهده پرداخت‌ها",
  "refunds.read": "مشاهده بازپرداخت‌ها",
  "refunds.write": "مدیریت بازپرداخت‌ها",
  "attributes.read": "مشاهده ویژگی‌ها",
  "attributes.write": "مدیریت ویژگی‌ها",
};
