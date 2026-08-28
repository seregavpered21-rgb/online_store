import { integer, pgTable, timestamp, uuid } from "drizzle-orm/pg-core";

import { customers } from "./customers";
import { productVariants } from "./variants";

export const carts = pgTable("carts", {
  id: uuid("id").defaultRandom().primaryKey(),
  customerId: uuid("customer_id").references(() => customers.id, { onDelete: "set null" }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const cartItems = pgTable("cart_items", {
  id: uuid("id").defaultRandom().primaryKey(),
  cartId: uuid("cart_id").notNull().references(() => carts.id, { onDelete: "cascade" }),
  variantId: uuid("variant_id").notNull().references(() => productVariants.id, { onDelete: "restrict" }),
  quantity: integer("quantity").notNull(),
  priceSnapshotInCents: integer("price_snapshot_in_cents").notNull(),
});