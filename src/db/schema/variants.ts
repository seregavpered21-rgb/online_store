import { integer, jsonb, pgTable, uuid, varchar } from "drizzle-orm/pg-core";

import { products } from "./products";

export const productVariants = pgTable("product_variants", {
  id: uuid("id").defaultRandom().primaryKey(),
  productId: uuid("product_id").notNull().references(() => products.id, { onDelete: "cascade" }),
  sku: varchar("sku", { length: 80 }).notNull().unique(),
  title: varchar("title", { length: 160 }).notNull(),
  attributes: jsonb("attributes").$type<Record<string, string>>().default({}).notNull(),
  priceInCents: integer("price_in_cents").notNull(),
  stockQuantity: integer("stock_quantity").default(0).notNull(),
});