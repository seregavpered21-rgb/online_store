import { boolean, integer, pgEnum, pgTable, text, timestamp, uuid, varchar } from "drizzle-orm/pg-core";

export const productStatus = pgEnum("product_status", ["draft", "active", "archived"]);

export const products = pgTable("products", {
  id: uuid("id").defaultRandom().primaryKey(),
  slug: varchar("slug", { length: 160 }).notNull().unique(),
  title: varchar("title", { length: 200 }).notNull(),
  description: text("description"),
  status: productStatus("status").default("draft").notNull(),
  isFeatured: boolean("is_featured").default(false).notNull(),
  priceInCents: integer("price_in_cents").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});