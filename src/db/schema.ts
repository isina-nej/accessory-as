import {
  boolean,
  index,
  int,
  json,
  mysqlTable,
  primaryKey,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/mysql-core";

// --- Better Auth core (MySQL) ---
export const user = mysqlTable("user", {
  id: varchar("id", { length: 36 }).primaryKey(),
  name: text("name"),
  email: varchar("email", { length: 255 }).notNull().unique(),
  emailVerified: boolean("email_verified").notNull().default(false),
  image: text("image"),
  phoneNumber: varchar("phone_number", { length: 20 }),
  phoneNumberVerified: boolean("phone_number_verified"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow().onUpdateNow(),
});

export const session = mysqlTable(
  "session",
  {
    id: varchar("id", { length: 36 }).primaryKey(),
    userId: varchar("user_id", { length: 36 }).notNull(),
    token: varchar("token", { length: 255 }).notNull().unique(),
    expiresAt: timestamp("expires_at").notNull(),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow().onUpdateNow(),
  },
  (t) => [index("session_user_idx").on(t.userId)],
);

export const account = mysqlTable(
  "account",
  {
    id: varchar("id", { length: 36 }).primaryKey(),
    userId: varchar("user_id", { length: 36 }).notNull(),
    accountId: text("account_id").notNull(),
    providerId: text("provider_id").notNull(),
    accessToken: text("access_token"),
    refreshToken: text("refresh_token"),
    accessTokenExpiresAt: timestamp("access_token_expires_at"),
    refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
    scope: text("scope"),
    idToken: text("id_token"),
    password: text("password"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow().onUpdateNow(),
  },
  (t) => [index("account_user_idx").on(t.userId)],
);

export const verification = mysqlTable("verification", {
  id: varchar("id", { length: 36 }).primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow().onUpdateNow(),
});

// --- Shop (از فیگما) ---
export const categories = mysqlTable("categories", {
  id: varchar("id", { length: 36 }).primaryKey().$defaultFn(() => crypto.randomUUID()),
  slug: varchar("slug", { length: 100 }).notNull().unique(),
  title: varchar("title", { length: 100 }).notNull(),
  parentId: varchar("parent_id", { length: 36 }),
});

export const products = mysqlTable(
  "products",
  {
    id: varchar("id", { length: 36 }).primaryKey().$defaultFn(() => crypto.randomUUID()),
    slug: varchar("slug", { length: 150 }).notNull().unique(),
    title: varchar("title", { length: 200 }).notNull(),
    categoryId: varchar("category_id", { length: 36 }),
    priceToman: int("price_toman").notNull(),
    oldPriceToman: int("old_price_toman"),
    discountPct: int("discount_pct"),
    stock: int("stock").notNull().default(0),
    soldCount: int("sold_count").notNull().default(0),
    status: varchar("status", { length: 20 }).notNull().default("active"),
    sku: varchar("sku", { length: 50 }),
    description: text("description"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (t) => [
    index("products_status_idx").on(t.status),
    index("products_category_idx").on(t.categoryId),
  ],
);

export const reviews = mysqlTable(
  "reviews",
  {
    id: varchar("id", { length: 36 }).primaryKey().$defaultFn(() => crypto.randomUUID()),
    productId: varchar("product_id", { length: 36 }).notNull(),
    author: varchar("author", { length: 100 }).notNull(),
    rating: int("rating").notNull(),
    body: text("body").notNull(),
    verified: boolean("verified").notNull().default(false),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (t) => [index("reviews_product_idx").on(t.productId)],
);

export const productImages = mysqlTable(
  "product_images",
  {
    id: varchar("id", { length: 36 }).primaryKey().$defaultFn(() => crypto.randomUUID()),
    productId: varchar("product_id", { length: 36 }).notNull(),
    url: text("url").notNull(),
    sort: int("sort").notNull().default(0),
  },
  (t) => [index("product_images_product_idx").on(t.productId)],
);

export const attributes = mysqlTable("attributes", {
  id: varchar("id", { length: 36 }).primaryKey().$defaultFn(() => crypto.randomUUID()),
  type: varchar("type", { length: 20 }).notNull(), // color | size | category
  label: varchar("label", { length: 50 }).notNull(),
  value: varchar("value", { length: 50 }).notNull(),
});

export const productAttributes = mysqlTable(
  "product_attributes",
  {
    productId: varchar("product_id", { length: 36 }).notNull(),
    attributeId: varchar("attribute_id", { length: 36 }).notNull(),
  },
  (t) => [primaryKey({ columns: [t.productId, t.attributeId] })],
);

export const addresses = mysqlTable(
  "addresses",
  {
    id: varchar("id", { length: 36 }).primaryKey().$defaultFn(() => crypto.randomUUID()),
    userId: varchar("user_id", { length: 36 }).notNull(),
    label: varchar("label", { length: 50 }),
    recipient: varchar("recipient", { length: 100 }),
    province: varchar("province", { length: 50 }).notNull(),
    city: varchar("city", { length: 50 }).notNull(),
    detail: text("detail").notNull(),
    postal: varchar("postal", { length: 20 }),
    phone: varchar("phone", { length: 20 }).notNull(),
    lat: varchar("lat", { length: 30 }),
    lng: varchar("lng", { length: 30 }),
    isDefault: boolean("is_default").notNull().default(false),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (t) => [index("addresses_user_idx").on(t.userId)],
);

export const orders = mysqlTable(
  "orders",
  {
    id: varchar("id", { length: 36 }).primaryKey().$defaultFn(() => crypto.randomUUID()),
    userId: varchar("user_id", { length: 36 }),
    // pending|paid|preparing|shipped|delivered|failed|cancelled|refunded
    status: varchar("status", { length: 20 }).notNull().default("pending"),
    totalToman: int("total_toman").notNull(),
    discountToman: int("discount_toman").notNull().default(0),
    shippingFeeToman: int("shipping_fee_toman").notNull().default(0),
    shippingSlug: varchar("shipping_slug", { length: 50 }),
    couponCode: varchar("coupon_code", { length: 50 }),
    trackingCode: varchar("tracking_code", { length: 100 }),
    addressId: varchar("address_id", { length: 36 }),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow().onUpdateNow(),
  },
  (t) => [index("orders_user_idx").on(t.userId)],
);

export const orderItems = mysqlTable(
  "order_items",
  {
    id: varchar("id", { length: 36 }).primaryKey().$defaultFn(() => crypto.randomUUID()),
    orderId: varchar("order_id", { length: 36 }).notNull(),
    productId: varchar("product_id", { length: 36 }).notNull(),
    qty: int("qty").notNull(),
    unitToman: int("unit_toman").notNull(),
  },
  (t) => [index("order_items_order_idx").on(t.orderId)],
);

export const orderEvents = mysqlTable(
  "order_events",
  {
    id: varchar("id", { length: 36 }).primaryKey().$defaultFn(() => crypto.randomUUID()),
    orderId: varchar("order_id", { length: 36 }).notNull(),
    status: varchar("status", { length: 20 }).notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (t) => [index("order_events_order_idx").on(t.orderId)],
);

export const payments = mysqlTable("payments", {
  id: varchar("id", { length: 36 }).primaryKey().$defaultFn(() => crypto.randomUUID()),
  orderId: varchar("order_id", { length: 36 }).notNull().unique(),
  provider: varchar("provider", { length: 20 }).notNull(),
  authority: varchar("authority", { length: 100 }),
  amountRial: int("amount_rial").notNull(),
  status: varchar("status", { length: 20 }).notNull().default("initiated"),
  refId: varchar("ref_id", { length: 100 }),
  raw: json("raw"),
  verifiedAt: timestamp("verified_at"),
});

export const favorites = mysqlTable(
  "favorites",
  {
    userId: varchar("user_id", { length: 36 }).notNull(),
    productId: varchar("product_id", { length: 36 }).notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (t) => [primaryKey({ columns: [t.userId, t.productId] })],
);

export const coupons = mysqlTable("coupons", {
  id: varchar("id", { length: 36 }).primaryKey().$defaultFn(() => crypto.randomUUID()),
  code: varchar("code", { length: 50 }).notNull().unique(),
  pct: int("pct").notNull(),
  maxToman: int("max_toman"),
  minToman: int("min_toman"),
  active: boolean("active").notNull().default(true),
  expiresAt: timestamp("expires_at"),
});

export const shippingMethods = mysqlTable("shipping_methods", {
  id: varchar("id", { length: 36 }).primaryKey().$defaultFn(() => crypto.randomUUID()),
  slug: varchar("slug", { length: 50 }).notNull().unique(),
  title: varchar("title", { length: 100 }).notNull(),
  feeToman: int("fee_toman").notNull().default(0),
  freeOverToman: int("free_over_toman"),
});

export const walletRefunds = mysqlTable(
  "wallet_refunds",
  {
    id: varchar("id", { length: 36 }).primaryKey().$defaultFn(() => crypto.randomUUID()),
    userId: varchar("user_id", { length: 36 }).notNull(),
    iban: varchar("iban", { length: 40 }).notNull(),
    status: varchar("status", { length: 20 }).notNull().default("pending"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (t) => [index("wallet_refunds_user_idx").on(t.userId)],
);

// --- CMS: نقش‌ها (admin|content|support) ---
export const staffRoles = mysqlTable(
  "staff_roles",
  {
    userId: varchar("user_id", { length: 36 }).notNull(),
    role: varchar("role", { length: 20 }).notNull(), // admin | content | support
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (t) => [primaryKey({ columns: [t.userId, t.role] }), index("staff_roles_user_idx").on(t.userId)],
);

// --- CMS: بنرها (hero/offers/mid/shine) ---
export const banners = mysqlTable(
  "banners",
  {
    id: varchar("id", { length: 36 }).primaryKey().$defaultFn(() => crypto.randomUUID()),
    slot: varchar("slot", { length: 30 }).notNull(), // hero | offer-side | mid-a | mid-b | shine
    title: varchar("title", { length: 200 }).notNull(),
    subtitle: text("subtitle"),
    ctaLabel: varchar("cta_label", { length: 100 }),
    ctaHref: varchar("cta_href", { length: 300 }),
    imageUrl: text("image_url"),
    sort: int("sort").notNull().default(0),
    active: boolean("active").notNull().default(true),
    startsAt: timestamp("starts_at"),
    endsAt: timestamp("ends_at"),
  },
  (t) => [index("banners_slot_idx").on(t.slot)],
);

// --- CMS: صفحات و سئو ---
export const pages = mysqlTable("pages", {
  id: varchar("id", { length: 36 }).primaryKey().$defaultFn(() => crypto.randomUUID()),
  slug: varchar("slug", { length: 100 }).notNull().unique(), // about | contact | faq | terms | privacy
  title: varchar("title", { length: 200 }).notNull(),
  body: text("body").notNull(),
  seoTitle: varchar("seo_title", { length: 200 }),
  seoDesc: varchar("seo_desc", { length: 300 }),
  updatedAt: timestamp("updated_at").notNull().defaultNow().onUpdateNow(),
});

// --- CMS: سوالات متداول ---
export const faqs = mysqlTable(
  "faqs",
  {
    id: varchar("id", { length: 36 }).primaryKey().$defaultFn(() => crypto.randomUUID()),
    q: varchar("q", { length: 300 }).notNull(),
    a: text("a").notNull(),
    sort: int("sort").notNull().default(0),
    active: boolean("active").notNull().default(true),
  },
  (t) => [index("faqs_sort_idx").on(t.sort)],
);

// --- CMS: تنظیمات سایت (footer/seo/perks) ---
export const settings = mysqlTable("settings", {
  key: varchar("key", { length: 100 }).primaryKey(),
  value: text("value").notNull(),
  updatedAt: timestamp("updated_at").notNull().defaultNow().onUpdateNow(),
});

// --- CMS: پیام‌های تماس ---
export const contactMessages = mysqlTable(
  "contact_messages",
  {
    id: varchar("id", { length: 36 }).primaryKey().$defaultFn(() => crypto.randomUUID()),
    name: varchar("name", { length: 100 }).notNull(),
    phone: varchar("phone", { length: 20 }).notNull(),
    body: text("body").notNull(),
    read: boolean("read").notNull().default(false),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (t) => [index("contact_messages_read_idx").on(t.read)],
);

// --- CMS: کمپین شگفت‌انگیز ---
export const campaigns = mysqlTable("campaigns", {
  id: varchar("id", { length: 36 }).primaryKey().$defaultFn(() => crypto.randomUUID()),
  slug: varchar("slug", { length: 100 }).notNull().unique(), // amazing
  title: varchar("title", { length: 200 }).notNull(),
  active: boolean("active").notNull().default(true),
  endsAt: timestamp("ends_at"),
});
