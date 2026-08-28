import { text, timestamp, varchar } from "drizzle-orm/pg-core";

import { pgTable } from "drizzle-orm/pg-core";

export const categories = pgTable("categories", {
  id: varchar("id", { length: 36 }).primaryKey(),
  slug: varchar("slug", { length: 120 }).notNull().unique(),
  title: varchar("title", { length: 160 }).notNull(),
  description: text("description"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});