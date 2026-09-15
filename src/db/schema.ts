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

export const verification = mysqlTable(
  "verification",
  {
    id: varchar("id", { length: 36 }).primaryKey(),
    identifier: text("identifier").notNull(),
    value: text("value").notNull(),
    expiresAt: timestamp("expires_at").notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow().onUpdateNow(),
  },
  (t) => [index("verification_id_idx").on(t.identifier)],
);

// --- Shop (از فیگما 708:439) ---
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
    status: varchar("status", { length: 20 }).notNull().default("active"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (t) => [
    index("products_status_idx").on(t.status),
    index("products_category_idx").on(t.categoryId),
  ],
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
    province: varchar("province", { length: 50 }).notNull(),
    city: varchar("city", { length: 50 }).notNull(),
    detail: text("detail").notNull(),
    postal: varchar("postal", { length: 20 }),
    phone: varchar("phone", { length: 20 }).notNull(),
  },
  (t) => [index("addresses_user_idx").on(t.userId)],
);

export const orders = mysqlTable(
  "orders",
  {
    id: varchar("id", { length: 36 }).primaryKey().$defaultFn(() => crypto.randomUUID()),
    userId: varchar("user_id", { length: 36 }),
    status: varchar("status", { length: 20 }).notNull().default("pending"),
    totalToman: int("total_toman").notNull(),
    addressId: varchar("address_id", { length: 36 }),
    createdAt: timestamp("created_at").notNull().defaultNow(),
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
