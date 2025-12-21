import { db } from "../db";
import { verificationAuditLog, duplicateGameIds, suspiciousActivities, rateLimitLog } from "@shared/schema";
import { and, eq, gte, lte, desc } from "drizzle-orm";
import crypto from "crypto";

export interface FraudCheckResult {
  isFraudulent: boolean;
  severity: "low" | "medium" | "high";
  reasons: string[];
  activityType?: string;
}

/**
 * Hash IP address for privacy
 */
export function hashIp(ip: string): string {
  return crypto.createHash("sha256").update(ip).digest("hex").substring(0, 16);
}

/**
 * Check for duplicate MLBB Game IDs
 */
export async function checkDuplicateGameId(
  gameId: string,
  serverId: string,
  userId: string
): Promise<FraudCheckResult> {
  const existing = await db
    .select()
    .from(duplicateGameIds)
    .where(eq(duplicateGameIds.gameId, gameId));

  if (existing.length > 0) {
    const record = existing[0];
    if (record.primaryUserId !== userId) {
      return {
        isFraudulent: true,
        severity: record.severity as "low" | "medium" | "high",
        reasons: [
          `Game ID ${gameId} already registered to another user (${record.primaryUserId})`,
        ],
        activityType: "duplicate_gameid",
      };
    }
  }

  return { isFraudulent: false, severity: "low", reasons: [] };
}

/**
 * Detect rapid verification attempts (rate limiting)
 */
export async function checkRapidVerification(
  userId: string,
  guildId: string
): Promise<FraudCheckResult> {
  const now = new Date();
  const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000);

  const recentAttempts = await db
    .select()
    .from(rateLimitLog)
    .where(
      and(
        eq(rateLimitLog.userId, userId),
        eq(rateLimitLog.guildId, guildId),
        gte(rateLimitLog.createdAt, fiveMinutesAgo)
      )
    );

  if (recentAttempts.length > 0) {
    const totalAttempts = recentAttempts.reduce(
      (sum, log) => sum + log.attemptCount,
      0
    );

    if (totalAttempts >= 3) {
      return {
        isFraudulent: true,
        severity: totalAttempts >= 5 ? "high" : "medium",
        reasons: [
          `Rapid verification attempts detected: ${totalAttempts} attempts in 5 minutes`,
        ],
        activityType: "rapid_verify",
      };
    }
  }

  return { isFraudulent: false, severity: "low", reasons: [] };
}

/**
 * Detect suspicious stat patterns (impossible win streaks, etc)
 */
export async function checkStatAnomalies(playerData: Record<string, string>): Promise<FraudCheckResult> {
  const reasons: string[] = [];
  let severity: "low" | "medium" | "high" = "low";

  // Check for impossibly high level relative to account age
  const level = parseInt(playerData["level"] || "0");
  if (level > 50) {
    reasons.push(`Unusually high player level: ${level}`);
    severity = "low";
  }

  // Check for suspicious win rate patterns if available
  if (playerData["win_rate"]) {
    const winRate = parseFloat(playerData["win_rate"]);
    if (winRate > 75) {
      reasons.push(`Suspicious win rate: ${winRate}% (statistically improbable)`);
      severity = "medium";
    }
  }

  // Check for account age anomalies
  if (playerData["account_age"]) {
    const daysOld = parseInt(playerData["account_age"]);
    if (daysOld < 7 && level > 30) {
      reasons.push(`New account with suspiciously high level (${level})`);
      severity = "medium";
    }
  }

  return {
    isFraudulent: reasons.length > 0,
    severity,
    reasons,
    activityType: "stat_anomaly",
  };
}

/**
 * Log verification attempt for audit trail
 */
export async function logVerificationAttempt(
  userId: string,
  guildId: string,
  gameId: string,
  serverId: string,
  playerData: Record<string, string>,
  status: "success" | "failed" | "suspicious",
  ipHash?: string,
  userAgent?: string
): Promise<void> {
  await db.insert(verificationAuditLog).values({
    userId,
    guildId,
    gameId,
    serverId,
    username: playerData["username"] || playerData["in-game-nickname"],
    level: playerData["level"],
    zone: playerData["zone"] || playerData["region"],
    country: playerData["country"],
    status,
    ipHash,
    userAgent,
  });
}

/**
 * Flag a suspicious activity
 */
export async function flagSuspiciousActivity(
  userId: string,
  guildId: string,
  gameId: string,
  activityType: string,
  reason: string,
  severity: "low" | "medium" | "high"
): Promise<void> {
  await db.insert(suspiciousActivities).values({
    userId,
    guildId,
    gameId,
    activityType,
    reason,
    severity,
    alertSent: false,
  });
}

/**
 * Register duplicate game ID
 */
export async function registerDuplicateGameId(
  gameId: string,
  serverId: string,
  userId: string,
  severity: "low" | "medium" | "high"
): Promise<void> {
  const existing = await db
    .select()
    .from(duplicateGameIds)
    .where(eq(duplicateGameIds.gameId, gameId));

  if (existing.length === 0) {
    await db.insert(duplicateGameIds).values({
      gameId,
      serverId,
      primaryUserId: userId,
      severity,
    });
  } else {
    // Update alternate user IDs
    const record = existing[0];
    const alternates = record.alternateUserIds
      ? JSON.parse(record.alternateUserIds)
      : [];

    if (!alternates.includes(userId)) {
      alternates.push(userId);
    }

    await db
      .update(duplicateGameIds)
      .set({
        alternateUserIds: JSON.stringify(alternates),
        severity,
      })
      .where(eq(duplicateGameIds.gameId, gameId));
  }
}

/**
 * Update rate limit log
 */
export async function updateRateLimitLog(
  userId: string,
  guildId: string,
  flagged: boolean = false
): Promise<void> {
  const now = new Date();
  const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000);

  const existingLog = await db
    .select()
    .from(rateLimitLog)
    .where(
      and(
        eq(rateLimitLog.userId, userId),
        eq(rateLimitLog.guildId, guildId),
        gte(rateLimitLog.createdAt, fiveMinutesAgo)
      )
    );

  if (existingLog.length > 0) {
    const log = existingLog[0];
    await db
      .update(rateLimitLog)
      .set({
        attemptCount: log.attemptCount + 1,
        flagged,
      })
      .where(eq(rateLimitLog.id, log.id));
  } else {
    await db.insert(rateLimitLog).values({
      userId,
      guildId,
      attemptCount: 1,
      windowStart: fiveMinutesAgo,
      windowEnd: new Date(now.getTime() + 5 * 60 * 1000),
      flagged,
    });
  }
}

/**
 * Perform comprehensive fraud check
 */
export async function performFraudCheck(
  userId: string,
  guildId: string,
  gameId: string,
  serverId: string,
  playerData: Record<string, string>,
  ipHash?: string
): Promise<FraudCheckResult> {
  const checks = await Promise.all([
    checkDuplicateGameId(gameId, serverId, userId),
    checkRapidVerification(userId, guildId),
    checkStatAnomalies(playerData),
  ]);

  const allReasons = checks.flatMap((c) => c.reasons);
  const maxSeverity = checks.reduce((max, c) => {
    const severityLevel = { low: 1, medium: 2, high: 3 };
    return severityLevel[c.severity] > severityLevel[max]
      ? c.severity
      : max;
  }, "low" as "low" | "medium" | "high");

  const isFraudulent = checks.some((c) => c.isFraudulent);

  return {
    isFraudulent,
    severity: maxSeverity,
    reasons: allReasons,
    activityType: checks
      .find((c) => c.activityType)
      ?.activityType || "multiple_factors",
  };
}
