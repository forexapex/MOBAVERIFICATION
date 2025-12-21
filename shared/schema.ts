import { pgTable, text, serial, boolean, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const botStatus = pgTable("bot_status", {
  id: serial("id").primaryKey(),
  status: text("status").notNull(),
  lastUpdated: text("last_updated").notNull(),
});

export const verificationRequests = pgTable("verification_requests", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull(),
  guildId: text("guild_id").notNull(),
  game: text("game").notNull(), // mlbb, bgmi, valo
  gameId: text("game_id").notNull(),
  status: text("status").notNull().default("pending"), // pending, approved, denied
  approvedBy: text("approved_by"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  approvedAt: timestamp("approved_at"),
});

export const insertBotStatusSchema = createInsertSchema(botStatus);
export type InsertBotStatus = z.infer<typeof insertBotStatusSchema>;
export type BotStatus = typeof botStatus.$inferSelect;

export const insertVerificationRequestSchema = createInsertSchema(verificationRequests).omit({ id: true, createdAt: true, approvedAt: true });
export type InsertVerificationRequest = z.infer<typeof insertVerificationRequestSchema>;
export type VerificationRequest = typeof verificationRequests.$inferSelect;
