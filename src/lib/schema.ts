import { pgTable, serial, text, integer, timestamp } from "drizzle-orm/pg-core";

export const medicines = pgTable("medicines", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  stock: integer("stock").notNull(),
  weeklyRequirement: integer("weekly_requirement").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});
