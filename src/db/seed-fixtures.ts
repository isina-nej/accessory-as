import { and, eq } from "drizzle-orm";
import { pathToFileURL } from "node:url";
import {
  addresses,
  favorites,
  orderEvents,
  orderItems,
  orders,
  payments,
  products,
  user,
} from "./schema";
import { assertFixtureMatch, assertFixturesSeedAllowed, describeDatabaseTarget, insertIfMissing } from "./seed-guards";

const FIXTURE_USER_ID = "00000000-0000-4000-8000-000000000001";
const FIXTURE_ORDER_ID = "00000000-0000-4000-8000-000000000002";
const FIXTURE_ADDRESS_ID = "00000000-0000-4000-8000-000000000003";
const FIXTURE_EMAIL = "fixture-customer@accessory-as.invalid";
const FIXTURE_ORDER_MARKER = "FIXTURE-ACCESSORY-AS-0001";

export async function runFixtureSeed(db: typeof import("./index").db): Promise<void> {
  const [product] = await db.select().from(products).where(eq(products.slug, "minimal-steel-ring")).limit(1);
  if (!product) throw new Error("Run the base seed first; fixture product minimal-steel-ring is missing.");

  await insertIfMissing(
    async () => {
      const [existing] = await db.select().from(user).where(eq(user.id, FIXTURE_USER_ID)).limit(1);
      return assertFixtureMatch(
        existing,
        (row) => row.email === FIXTURE_EMAIL && row.name === "مشتری آزمایشی (غیرقابل ورود)" && row.emailVerified === false && row.phoneNumber === null,
        "Fixture user ID has different data; refusing to modify it.",
      );
    },
    async () => {
      const [emailOwner] = await db.select().from(user).where(eq(user.email, FIXTURE_EMAIL)).limit(1);
      if (emailOwner) throw new Error("Fixture email is already used by a non-fixture account; refusing to modify it.");
      await db.insert(user).values({
        id: FIXTURE_USER_ID,
        name: "مشتری آزمایشی (غیرقابل ورود)",
        email: FIXTURE_EMAIL,
        emailVerified: false,
        phoneNumber: null,
      });
    },
  );

  await insertIfMissing(
    async () => {
      const [existing] = await db.select().from(addresses).where(eq(addresses.id, FIXTURE_ADDRESS_ID)).limit(1);
      return assertFixtureMatch(
        existing,
        (row) => row.userId === FIXTURE_USER_ID && row.label === "آدرس آزمایشی" && row.recipient === "مشتری آزمایشی" &&
          row.province === "خوزستان" && row.city === "رامهرمز" && row.detail === "آدرس ساختگی برای تست؛ برای ارسال واقعی استفاده نشود." &&
          row.postal === "0000000000" && row.phone === "0000000000" && row.isDefault === true,
        "Fixture address ID has different data; refusing to modify it.",
      );
    },
    async () => {
      await db.insert(addresses).values({
        id: FIXTURE_ADDRESS_ID,
        userId: FIXTURE_USER_ID,
        label: "آدرس آزمایشی",
        recipient: "مشتری آزمایشی",
        province: "خوزستان",
        city: "رامهرمز",
        detail: "آدرس ساختگی برای تست؛ برای ارسال واقعی استفاده نشود.",
        postal: "0000000000",
        phone: "0000000000",
        isDefault: true,
      });
    },
  );

  const [existingOrder] = await db.select().from(orders).where(eq(orders.id, FIXTURE_ORDER_ID)).limit(1);
  const fixtureOrder = assertFixtureMatch(
    existingOrder,
    (row) => row.userId === FIXTURE_USER_ID && row.status === "pending" && row.discountToman === 0 &&
      row.shippingFeeToman === 0 && row.shippingSlug === null && row.couponCode === FIXTURE_ORDER_MARKER &&
      row.addressId === FIXTURE_ADDRESS_ID && row.trackingCode === null,
    "Fixture order ID has different data; refusing to modify it.",
  );
  if (!fixtureOrder) {
    await db.insert(orders).values({
      id: FIXTURE_ORDER_ID,
      userId: FIXTURE_USER_ID,
      status: "pending",
      totalToman: product.priceToman,
      discountToman: 0,
      shippingFeeToman: 0,
      shippingSlug: null,
      couponCode: FIXTURE_ORDER_MARKER,
      addressId: FIXTURE_ADDRESS_ID,
    });
  }
  const fixturePriceToman = fixtureOrder?.totalToman ?? product.priceToman;

  const fixtureItemId = "00000000-0000-4000-8000-000000000004";
  await insertIfMissing(
    async () => {
      const [existing] = await db.select().from(orderItems).where(eq(orderItems.id, fixtureItemId)).limit(1);
      return assertFixtureMatch(
        existing,
        (row) => row.orderId === FIXTURE_ORDER_ID && row.productId === product.id && row.qty === 1 && row.unitToman === fixturePriceToman,
        "Fixture item ID has different data; refusing to modify it.",
      );
    },
    async () => {
      await db.insert(orderItems).values({ id: fixtureItemId, orderId: FIXTURE_ORDER_ID, productId: product.id, qty: 1, unitToman: fixturePriceToman });
    },
  );

  const fixtureEventId = "00000000-0000-4000-8000-000000000005";
  await insertIfMissing(
    async () => {
      const [existing] = await db.select().from(orderEvents).where(eq(orderEvents.id, fixtureEventId)).limit(1);
      return assertFixtureMatch(
        existing,
        (row) => row.orderId === FIXTURE_ORDER_ID && row.status === "pending",
        "Fixture event ID has different data; refusing to modify it.",
      );
    },
    async () => { await db.insert(orderEvents).values({ id: fixtureEventId, orderId: FIXTURE_ORDER_ID, status: "pending" }); },
  );

  await insertIfMissing(
    async () => {
      const [existing] = await db.select().from(payments).where(eq(payments.orderId, FIXTURE_ORDER_ID)).limit(1);
      return assertFixtureMatch(
        existing,
        (row) => row.id === "00000000-0000-4000-8000-000000000006" && row.provider === "mock" &&
          row.authority === FIXTURE_ORDER_MARKER && row.amountRial === fixturePriceToman * 10 &&
          row.status === "initiated" && row.refId === null && row.verifiedAt === null &&
          typeof row.raw === "object" && row.raw !== null && "fixture" in row.raw && row.raw.fixture === true &&
          "warning" in row.raw && row.raw.warning === "Not a real gateway transaction; not paid",
        "Fixture order payment has different data; refusing to modify it.",
      );
    },
    async () => {
      const [idOwner] = await db.select().from(payments).where(eq(payments.id, "00000000-0000-4000-8000-000000000006")).limit(1);
      if (idOwner) throw new Error("Fixture payment ID belongs to another payment; refusing to modify it.");
      await db.insert(payments).values({
        id: "00000000-0000-4000-8000-000000000006",
        orderId: FIXTURE_ORDER_ID,
        provider: "mock",
        authority: FIXTURE_ORDER_MARKER,
        amountRial: fixturePriceToman * 10,
        status: "initiated",
        raw: { fixture: true, warning: "Not a real gateway transaction; not paid" },
      });
    },
  );

  const [favorite] = await db.select().from(favorites).where(and(eq(favorites.userId, FIXTURE_USER_ID), eq(favorites.productId, product.id))).limit(1);
  if (!favorite) await db.insert(favorites).values({ userId: FIXTURE_USER_ID, productId: product.id });

  console.log(`fixture seed ok: ${FIXTURE_EMAIL}; order marker ${FIXTURE_ORDER_MARKER}; no login credentials created`);
}

async function main() {
  assertFixturesSeedAllowed(process.env.NODE_ENV, process.env.SEED_FIXTURES, process.env.DATABASE_URL, process.env.SEED_ALLOW_REMOTE_HOSTS);
  console.log(`fixture seed target: ${describeDatabaseTarget(process.env.DATABASE_URL)}`);
  const { db } = await import("./index");
  await runFixtureSeed(db);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main()
    .then(() => process.exit(0))
    .catch((error: unknown) => {
      console.error("fixture seed failed:", error instanceof Error ? error.message : error);
      process.exit(1);
    });
}
