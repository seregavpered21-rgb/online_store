import { pgEnum, pgTable, timestamp, uuid, varchar } from "drizzle-orm/pg-core";

export const customerRole = pgEnum("customer_role", ["customer", "admin"]);

export const customers = pgTable("customers", {
  id: uuid("id").defaultRandom().primaryKey(),
  email: varchar("email", { length: 320 }).notNull().unique(),
  firstName: varchar("first_name", { length: 120 }),
  lastName: varchar("last_name", { length: 120 }),
  phone: varchar("phone", { length: 40 }),
  role: customerRole("role").default("customer").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});