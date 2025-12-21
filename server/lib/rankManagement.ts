import { db } from "../db";
import { userRanks } from "@shared/schema";
import { eq } from "drizzle-orm";
import axios from "axios";

// Role mapping based on user-provided Discord role IDs
export const ROLE_MAP: Record<string, string> = {
  "Warrior": "1452232717339983914",
  "Elite": "1452232985712787497",
  "Master": "1452233028209348660",
  "Grandmaster": "1452233083431555115",
  "Epic": "1452233113609441310",
  "Legend": "1452233142986342420",
  "Mythic": "1452233677839794228",
  "Mythical Glory": "1452233176570269719",
};

export const RANK_ROLE_IDS = Object.values(ROLE_MAP);

export interface PlayerRankData {
  tier: string;
  stars: number;
  points?: number;
}

/**
 * Parse MLBB rank from API response
 */
export function parseRank(playerData: Record<string, any>): { rank: string; stars: number; points: number } {
  const tier = (playerData.tier || playerData.rank || "").toLowerCase();
  const stars = playerData.stars || 0;
  const points = playerData.points || 0;

  // Map to rank tiers
  if (tier.includes("warrior")) {
    return { rank: "Warrior", stars, points };
  } else if (tier.includes("elite")) {
    return { rank: "Elite", stars, points };
  } else if (tier.includes("master")) {
    return { rank: "Master", stars, points };
  } else if (tier.includes("grandmaster")) {
    return { rank: "Grandmaster", stars, points };
  } else if (tier.includes("epic")) {
    return { rank: "Epic", stars, points };
  } else if (tier.includes("legend")) {
    return { rank: "Legend", stars, points };
  } else if (tier.includes("mythic")) {
    // Mythic sub-tiers based on stars
    if (stars >= 50) {
      return { rank: "Mythical Glory", stars, points };
    }
    return { rank: "Mythic", stars, points };
  }

  return { rank: "Warrior", stars, points };
}

/**
 * Fetch MLBB player rank from API
 * 
 * ⚠️ IMPORTANT: Moonton does NOT provide a public API for player rank data
 * All RapidAPI MLBB endpoints only return account info/shop data, NOT rank/tier/stars
 * This function returns null since no working rank API exists
 * 
 * TODO: Manual rank input or screenshot-based detection could be implemented as alternative
 */
export async function fetchMLBBRank(mlbbId: string, serverId: string): Promise<PlayerRankData | null> {
  console.log("[Rank Management] Player rank data is not available from any public MLBB API. Moonton does not provide rank/tier/stars endpoints.");
  return null;
}

/**
 * Store or update user rank in database
 */
export async function updateUserRank(
  userId: string,
  guildId: string,
  mlbbId: string,
  serverId: string,
  rank: string,
  stars: number,
  points: number
): Promise<void> {
  const existing = await db.select().from(userRanks).where(eq(userRanks.userId, userId));

  const roleId = ROLE_MAP[rank] || "";

  if (existing.length > 0) {
    const previousRank = existing[0].currentRank;
    const rankChanged = previousRank !== rank;

    await db
      .update(userRanks)
      .set({
        currentRank: rank,
        previousRank: rankChanged ? previousRank : undefined,
        stars,
        points,
        roleId,
        lastChecked: new Date(),
        rankChangedAt: rankChanged ? new Date() : undefined,
        updatedAt: new Date(),
      })
      .where(eq(userRanks.userId, userId));
  } else {
    await db.insert(userRanks).values({
      userId,
      guildId,
      mlbbId,
      serverId,
      currentRank: rank,
      stars,
      points,
      roleId,
      lastChecked: new Date(),
      updatedAt: new Date(),
    });
  }
}

/**
 * Get user's current rank from database
 */
export async function getUserRank(userId: string) {
  const records = await db.select().from(userRanks).where(eq(userRanks.userId, userId));
  return records.length > 0 ? records[0] : null;
}

/**
 * Get all users for rank checking
 */
export async function getAllUserRanks() {
  return await db.select().from(userRanks);
}
