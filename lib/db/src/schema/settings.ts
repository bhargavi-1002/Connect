import { pgTable, serial, integer, text, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { usersTable } from "./users";

export const userSettingsTable = pgTable("user_settings", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().unique().references(() => usersTable.id),
  activeTheme: text("active_theme").notNull().default("midnight"),
  autoLogoutEnabled: boolean("auto_logout_enabled").notNull().default(true),
  autoLogoutMinutes: integer("auto_logout_minutes").notNull().default(15),
  notificationsEnabled: boolean("notifications_enabled").notNull().default(true),
  emergencyEmailEnabled: boolean("emergency_email_enabled").notNull().default(true),
  emergencySmsEnabled: boolean("emergency_sms_enabled").notNull().default(false),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertUserSettingsSchema = createInsertSchema(userSettingsTable).omit({ id: true, updatedAt: true });
export type InsertUserSettings = z.infer<typeof insertUserSettingsSchema>;
export type UserSettings = typeof userSettingsTable.$inferSelect;
