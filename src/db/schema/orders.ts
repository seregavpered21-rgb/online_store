import { integer, pgEnum, pgTable, text, timestamp, uuid, varchar } from "drizzle-orm/pg-core";

import { customers } from "./customers";
import { productVariants } from "./variants";

export const orderStatus = pgEnum("order_status", ["new", "confirmed", "fulfilled", "cancelled"]);
export const paymentMethod = pgEnum("payment_method", ["cash_on_delivery"]);

export const orders = pgTable("orders", {
  id: uuid("id").defaultRandom().primaryKey(),
  orderNumber: varchar("order_number", { length: 32 }).notNull().unique(),
  customerId: uuid("customer_id").references(() => customers.id, { onDelete: "set null" }),
  email: varchar("email", { length: 320 }).notNull(),
  status: orderStatus("status").default("new").notNull(),
  paymentMethod: paymentMethod("payment_method").default("cash_on_delivery").notNull(),
  totalInCents: integer("total_in_cents").notNull(),
  deliveryAddress: text("delivery_address").notNull(),
  adminNote: text("admin_note"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const orderItems = pgTable("order_items", {
  id: uuid("id").defaultRandom().primaryKey(),
  orderId: uuid("order_id").notNull().references(() => orders.id, { onDelete: "cascade" }),
  variantId: uuid("variant_id").references(() => productVariants.id, { onDelete: "set null" }),
  productTitle: varchar("product_title", { length: 200 }).notNull(),
  variantTitle: varchar("variant_title", { length: 160 }).notNull(),
  unitPriceInCents: integer("unit_price_in_cents").notNull(),
  quantity: integer("quantity").notNull(),
});