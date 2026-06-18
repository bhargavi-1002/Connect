import { pgTable, serial, integer, text, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { usersTable } from "./users";

export const devicesTable = pgTable("devices", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => usersTable.id),
  deviceType: text("device_type", { enum: ["android", "laptop", "desktop", "tablet", "phone"] }).notNull().default("laptop"),
  deviceName: text("device_name").notNull(),
  browser: text("browser").notNull(),
  isActive: boolean("is_active").notNull().default(true),
  isCurrent: boolean("is_current").notNull().default(false),
  lastSeen: timestamp("last_seen", { withTimezone: true }).notNull().defaultNow(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertDeviceSchema = createInsertSchema(devicesTable).omit({ id: true, createdAt: true });
export type InsertDevice = z.infer<typeof insertDeviceSchema>;
export type Device = typeof devicesTable.$inferSelect;
