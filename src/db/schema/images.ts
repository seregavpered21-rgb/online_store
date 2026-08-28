import { integer, pgTable, text, uuid, varchar } from "drizzle-orm/pg-core";

import { products } from "./products";

export const productImages = pgTable("product_images", {
  id: uuid("id").defaultRandom().primaryKey(),
  productId: uuid("product_id").notNull().references(() => products.id, { onDelete: "cascade" }),
  url: text("url").notNull(),
  altText: varchar("alt_text", { length: 240 }).notNull(),
  position: integer("position").default(0).notNull(),
});