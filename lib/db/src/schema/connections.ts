import { pgTable, serial, integer, text, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { usersTable } from "./users";

export const connectionsTable = pgTable("connections", {
  id: serial("id").primaryKey(),
  requesterId: integer("requester_id").notNull().references(() => usersTable.id),
  receiverId: integer("receiver_id").notNull().references(() => usersTable.id),
  status: text("status", { enum: ["pending", "accepted", "rejected", "blocked"] }).notNull().default("pending"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertConnectionSchema = createInsertSchema(connectionsTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertConnection = z.infer<typeof insertConnectionSchema>;
export type Connection = typeof connectionsTable.$inferSelect;
