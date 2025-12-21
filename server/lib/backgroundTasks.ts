import { Client } from "discord.js";
import { fetchMLBBRank, parseRank, ROLE_MAP, RANK_ROLE_IDS, getAllUserRanks, updateUserRank } from "./rankManagement";

let rankCheckInterval: NodeJS.Timeout | null = null;

/**
 * Start background rank checking task
 * Runs every 1 hour to check for rank changes
 */
export function startRankCheckTask(client: Client): void {
  if (rankCheckInterval) {
    console.log("[Background Tasks] Rank check already running");
    return;
  }

  console.log("[Background Tasks] Starting rank check background task (every 1 hour)");

  // Run immediately first
  performRankCheck(client);

  // Then every hour
  rankCheckInterval = setInterval(() => {
    performRankCheck(client);
  }, 60 * 60 * 1000); // 1 hour
}

/**
 * Stop background rank checking task
 */
export function stopRankCheckTask(): void {
  if (rankCheckInterval) {
    clearInterval(rankCheckInterval);
    rankCheckInterval = null;
    console.log("[Background Tasks] Rank check task stopped");
  }
}

/**
 * Perform rank check for all users
 */
async function performRankCheck(client: Client): Promise<void> {
  console.log("[Background Tasks] Running rank check...");

  try {
    const allUsers = await getAllUserRanks();

    for (const userRecord of allUsers) {
      try {
        const rankData = await fetchMLBBRank(userRecord.mlbbId, userRecord.serverId);

        if (!rankData) {
          console.warn(`[Background Tasks] Failed to fetch rank for user ${userRecord.userId}`);
          continue;
        }

        const { rank: newRank, stars, points } = parseRank({ tier: rankData.tier, stars: rankData.stars, points: rankData.points });
        const oldRank = userRecord.currentRank;

        // Update database
        await updateUserRank(
          userRecord.userId,
          userRecord.guildId,
          userRecord.mlbbId,
          userRecord.serverId,
          newRank,
          stars,
          points
        );

        // If rank changed, update Discord role
        if (oldRank !== newRank) {
          console.log(`[Background Tasks] Rank changed for ${userRecord.userId}: ${oldRank} -> ${newRank}`);

          const guild = await client.guilds.fetch(userRecord.guildId);
          const member = await guild.members.fetch(userRecord.userId);

          if (member) {
            // Remove all rank roles
            const rolesToRemove = RANK_ROLE_IDS
              .map((roleId) => guild.roles.cache.get(roleId))
              .filter((role): role is NonNullable<typeof role> => role !== undefined && member.roles.cache.has(role.id));

            if (rolesToRemove.length > 0) {
              await member.roles.remove(rolesToRemove);
            }

            // Add new role
            const newRoleId = ROLE_MAP[newRank];
            if (newRoleId) {
              const newRole = guild.roles.cache.get(newRoleId);
              if (newRole) {
                await member.roles.add(newRole);
              }
            }

            // Try to notify user
            try {
              await member.send(
                `🎮 **Rank Update**\n\n**Account:** ${userRecord.mlbbId} (${userRecord.serverId})\n**Rank Changed:** ${oldRank} → ${newRank}\n**Region:** (${userRecord.serverId})\n\nYour Discord role has been automatically updated. Great job on the climb! 🏆`
              );
            } catch (e) {
              console.log(`[Background Tasks] Could not DM user ${userRecord.userId}`);
            }
          }
        }
      } catch (error) {
        console.error(`[Background Tasks] Error checking rank for user ${userRecord.userId}:`, error instanceof Error ? error.message : String(error));
      }
    }

    console.log("[Background Tasks] Rank check completed");
  } catch (error) {
    console.error("[Background Tasks] Error in rank check task:", error instanceof Error ? error.message : String(error));
  }
}
