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

// Verification audit log for tracking attempts and stats
export const verificationAuditLog = pgTable("verification_audit_log", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull(),
  guildId: text("guild_id").notNull(),
  gameId: text("game_id").notNull(),
  serverId: text("server_id").notNull(),
  username: text("username"),
  level: text("level"),
  zone: text("zone"),
  country: text("country"),
  status: text("status").notNull(), // success, failed, suspicious
  ipHash: text("ip_hash"), // hashed IP for tracking
  userAgent: text("user_agent"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Track duplicate game IDs
export const duplicateGameIds = pgTable("duplicate_game_ids", {
  id: serial("id").primaryKey(),
  gameId: text("game_id").notNull().unique(),
  serverId: text("server_id").notNull(),
  primaryUserId: text("primary_user_id").notNull(),
  alternateUserIds: text("alternate_user_ids"), // JSON array of other user IDs using this gameID
  flaggedAt: timestamp("flagged_at").notNull().defaultNow(),
  severity: text("severity").notNull().default("low"), // low, medium, high
});

// Suspicious activities flagged for manual review
export const suspiciousActivities = pgTable("suspicious_activities", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull(),
  guildId: text("guild_id").notNull(),
  gameId: text("game_id"),
  activityType: text("activity_type").notNull(), // duplicate_gameid, rapid_verify, stat_anomaly
  reason: text("reason").notNull(),
  severity: text("severity").notNull(), // low, medium, high
  alertSent: boolean("alert_sent").notNull().default(false),
  alertChannelId: text("alert_channel_id"),
  resolvedAt: timestamp("resolved_at"),
  notes: text("notes"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Rate limit tracking for rapid verification detection
export const rateLimitLog = pgTable("rate_limit_log", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull(),
  guildId: text("guild_id").notNull(),
  attemptCount: integer("attempt_count").notNull().default(1),
  windowStart: timestamp("window_start").notNull(),
  windowEnd: timestamp("window_end").notNull(),
  flagged: boolean("flagged").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertBotStatusSchema = createInsertSchema(botStatus);
export type InsertBotStatus = z.infer<typeof insertBotStatusSchema>;
export type BotStatus = typeof botStatus.$inferSelect;

export const insertVerificationRequestSchema = createInsertSchema(verificationRequests).omit({ id: true, createdAt: true, approvedAt: true });
export type InsertVerificationRequest = z.infer<typeof insertVerificationRequestSchema>;
export type VerificationRequest = typeof verificationRequests.$inferSelect;

export const insertVerificationAuditLogSchema = createInsertSchema(verificationAuditLog).omit({ id: true, createdAt: true });
export type InsertVerificationAuditLog = z.infer<typeof insertVerificationAuditLogSchema>;
export type VerificationAuditLog = typeof verificationAuditLog.$inferSelect;

export const insertDuplicateGameIdSchema = createInsertSchema(duplicateGameIds).omit({ id: true, flaggedAt: true });
export type InsertDuplicateGameId = z.infer<typeof insertDuplicateGameIdSchema>;
export type DuplicateGameId = typeof duplicateGameIds.$inferSelect;

export const insertSuspiciousActivitySchema = createInsertSchema(suspiciousActivities).omit({ id: true, createdAt: true });
export type InsertSuspiciousActivity = z.infer<typeof insertSuspiciousActivitySchema>;
export type SuspiciousActivity = typeof suspiciousActivities.$inferSelect;

export const insertRateLimitLogSchema = createInsertSchema(rateLimitLog).omit({ id: true, createdAt: true });
export type InsertRateLimitLog = z.infer<typeof insertRateLimitLogSchema>;
export type RateLimitLog = typeof rateLimitLog.$inferSelect;

// User rank tracking for role management
export const userRanks = pgTable("user_ranks", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull().unique(),
  guildId: text("guild_id").notNull(),
  mlbbId: text("mlbb_id").notNull(),
  serverId: text("server_id").notNull(),
  playerName: text("player_name"), // In-game player name from API
  currentRank: text("current_rank"), // Warrior, Elite, Master, etc.
  division: text("division"), // Optional division/tier (e.g., "III", "25-49 stars")
  previousRank: text("previous_rank"),
  stars: integer("stars").default(0),
  points: integer("points").default(0),
  roleId: text("role_id"), // Current role ID assigned
  // New Stats Fields
  stats: text("stats"), // JSON string of performance stats
  lastStatsUpdate: timestamp("last_stats_update"),
  lastChecked: timestamp("last_checked"),
  rankChangedAt: timestamp("rank_changed_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertUserRanksSchema = createInsertSchema(userRanks).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertUserRanks = z.infer<typeof insertUserRanksSchema>;
export type UserRanks = typeof userRanks.$inferSelect;
