import { db } from "../db";
import { userRanks } from "@shared/schema";
import { eq } from "drizzle-orm";
import axios from "axios";

// Rank structure with divisions
export interface RankDivision {
  name: string;
  divisions: string[];
}

// Complete 10-rank system with divisions
export const RANK_DIVISIONS: Record<string, RankDivision> = {
  "Warrior": { name: "Warrior", divisions: ["III", "II", "I"] },
  "Elite": { name: "Elite", divisions: ["III", "II", "I"] },
  "Master": { name: "Master", divisions: ["IV", "III", "II", "I"] },
  "Grandmaster": { name: "Grandmaster", divisions: ["V", "IV", "III", "II", "I"] },
  "Epic": { name: "Epic", divisions: ["V", "IV", "III", "II", "I"] },
  "Legend": { name: "Legend", divisions: ["V", "IV", "III", "II", "I"] },
  "Mythic": { name: "Mythic", divisions: ["Base Mythic (0-24 stars)"] },
  "Mythical Honor": { name: "Mythical Honor", divisions: ["25-49 stars"] },
  "Mythical Glory": { name: "Mythical Glory", divisions: ["50-99 stars"] },
  "Mythical Immortal": { name: "Mythical Immortal", divisions: ["100+ stars"] },
};

// Role mapping with all 10 ranks
export const ROLE_MAP: Record<string, string> = {
  "Warrior": "1452232717339983914",
  "Elite": "1452232985712787497",
  "Master": "1452233028209348660",
  "Grandmaster": "1452233083431555115",
  "Epic": "1452233113609441310",
  "Legend": "1452233142986342420",
  "Mythic": "1452233677839794228",
  "Mythical Honor": "1452988440340861180",
  "Mythical Glory": "1452233176570269719",
  "Mythical Immortal": "1452987922285596853",
};

// Discord emoji IDs for each rank
export const RANK_EMOJIS: Record<string, string> = {
  "Warrior": "<:Warrior:1452990245011460226>",
  "Elite": "<:Elite:1452990207677694164>",
  "Master": "<:Master:1452990272920096809>",
  "Grandmaster": "<:Grandmaster:1452990299872690216>",
  "Epic": "<:Epic:1452990342206062774>",
  "Legend": "<:Legend:1452990366394617867>",
  "Mythic": "<:Mythic:1452990402113175562>",
  "Mythical Honor": "<:Mythical_Honor:1452990429376020591>",
  "Mythical Glory": "<:Mythical_Glory:1452990449412477080>",
  "Mythical Immortal": "<:Mythical_Immortal:1452990476494831706>",
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
    if (stars >= 100) {
      return { rank: "Mythical Immortal", stars, points };
    } else if (stars >= 50) {
      return { rank: "Mythical Glory", stars, points };
    } else if (stars >= 25) {
      return { rank: "Mythical Honor", stars, points };
    }
    return { rank: "Mythic", stars, points };
  }

  return { rank: "Warrior", stars, points };
}

/**
 * Fetch MLBB player rank from API
 * Note: Returns null since no public API provides rank data.
 * Users set rank manually via /rank command instead.
 */
export async function fetchMLBBRank(mlbbId: string, serverId: string): Promise<PlayerRankData | null> {
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
  points: number,
  division?: string
): Promise<void> {
  const existing = await db.select().from(userRanks).where(eq(userRanks.userId, userId));

  const roleId = ROLE_MAP[rank] || "";
  const rankDisplay = division ? `${rank} ${division}` : rank;

  if (existing.length > 0) {
    const previousRank = existing[0].currentRank;
    const rankChanged = previousRank !== rank;

    await db
      .update(userRanks)
      .set({
        currentRank: rank,
        division: division || null,
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
      division: division || null,
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
