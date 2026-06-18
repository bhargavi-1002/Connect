import { pgTable, serial, integer, boolean, text, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { usersTable } from "./users";

export const conversationsTable = pgTable("conversations", {
  id: serial("id").primaryKey(),
  user1Id: integer("user1_id").notNull().references(() => usersTable.id),
  user2Id: integer("user2_id").notNull().references(() => usersTable.id),
  isPinnedByUser1: boolean("is_pinned_by_user1").notNull().default(false),
  isPinnedByUser2: boolean("is_pinned_by_user2").notNull().default(false),
  wallpaperByUser1: text("wallpaper_by_user1"),
  wallpaperByUser2: text("wallpaper_by_user2"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertConversationSchema = createInsertSchema(conversationsTable).omit({ id: true, createdAt: true });
export type InsertConversation = z.infer<typeof insertConversationSchema>;
export type Conversation = typeof conversationsTable.$inferSelect;
