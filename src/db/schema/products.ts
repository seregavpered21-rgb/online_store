import { integer, text, timestamp, varchar } from "drizzle-orm/pg-core";

import { pgTable } from "drizzle-orm/pg-core";

export const products = pgTable("products", {
  id: varchar("id", { length: 36 }).primaryKey(),
  slug: varchar("slug", { length: 160 }).notNull().unique(),
  title: varchar("title", { length: 200 }).notNull(),
  description: text("description"),
  priceInRubles: integer("price_in_rubles").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});