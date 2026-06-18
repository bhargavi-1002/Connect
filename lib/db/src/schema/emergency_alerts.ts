import { pgTable, serial, integer, text, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { usersTable } from "./users";

export const emergencyAlertsTable = pgTable("emergency_alerts", {
  id: serial("id").primaryKey(),
  fromUserId: integer("from_user_id").notNull().references(() => usersTable.id),
  toUserId: integer("to_user_id").notNull().references(() => usersTable.id),
  message: text("message").notNull(),
  isResolved: boolean("is_resolved").notNull().default(false),
  sentAt: timestamp("sent_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertEmergencyAlertSchema = createInsertSchema(emergencyAlertsTable).omit({ id: true, sentAt: true });
export type InsertEmergencyAlert = z.infer<typeof insertEmergencyAlertSchema>;
export type EmergencyAlert = typeof emergencyAlertsTable.$inferSelect;
