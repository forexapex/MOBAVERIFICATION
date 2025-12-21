import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { validasi } from "./lib/validasi";
import axios from "axios";
import session from "express-session";

const DISCORD_API = "https://discord.com/api/v10";
const CLIENT_ID = process.env.DISCORD_CLIENT_ID;
const CLIENT_SECRET = process.env.DISCORD_CLIENT_SECRET;
const REDIRECT_URI = process.env.DISCORD_REDIRECT_URI;

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  
  app.get(api.status.get.path, async (req, res) => {
    const status = await storage.getBotStatus();
    res.json(status);
  });

  // Discord OAuth callback
  app.get("/api/callback", async (req, res) => {
    const code = req.query.code as string;
    if (!code) {
      return res.status(400).json({ error: "Missing code" });
    }

    try {
      const tokenResponse = await axios.post(`${DISCORD_API}/oauth2/token`, {
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        grant_type: "authorization_code",
        code,
        redirect_uri: REDIRECT_URI,
      });

      const accessToken = tokenResponse.data.access_token;
      (req.session as any).accessToken = accessToken;

      res.redirect("/dashboard");
    } catch (error) {
      res.status(500).json({ error: "OAuth token exchange failed" });
    }
  });

  // Get user guilds
  app.get("/api/user/guilds", async (req, res) => {
    const accessToken = (req.session as any).accessToken;
    if (!accessToken) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    try {
      const response = await axios.get(`${DISCORD_API}/users/@me/guilds`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      // Filter for admin guilds
      const adminGuilds = response.data.filter(
        (guild: any) => (guild.permissions & 0x8) === 0x8
      );

      res.json(adminGuilds);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch guilds" });
    }
  });

  // Get verification requests for a guild
  app.get("/api/guilds/:guildId/verifications", async (req, res) => {
    const accessToken = (req.session as any).accessToken;
    if (!accessToken) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    try {
      const guildId = req.params.guildId;
      const verifications = await storage.getVerificationRequests(guildId);
      res.json(verifications);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch verifications" });
    }
  });

  // Approve verification
  app.post("/api/verifications/:id/approve", async (req, res) => {
    const accessToken = (req.session as any).accessToken;
    if (!accessToken) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    try {
      const id = parseInt(req.params.id);
      await storage.approveVerification(id, "admin");
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to approve" });
    }
  });

  // Deny verification
  app.post("/api/verifications/:id/deny", async (req, res) => {
    const accessToken = (req.session as any).accessToken;
    if (!accessToken) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    try {
      const id = parseInt(req.params.id);
      await storage.denyVerification(id);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to deny" });
    }
  });

  // MLBB Game ID Verification API
  app.get("/api/mlbb/verify", async (req, res) => {
    try {
      const gameId = req.query.id as string;
      const serverId = req.query.serverid as string;
      
      if (!gameId || !serverId) {
        return res.status(400).json({ status: "failed", message: "Missing id or serverid parameter" });
      }

      // Validate server ID is numeric
      if (!/^\d+$/.test(serverId)) {
        return res.status(400).json({ 
          status: "failed", 
          message: "Invalid Server ID. Please enter a numeric server ID (e.g., 20345)." 
        });
      }

      const playerData = await validasi(gameId, serverId);
      
      // Extract fields with fallback options
      const nickname = playerData['username'] || playerData['in-game-nickname'] || 'Unknown';
      let level = playerData['level'] || playerData['user-level'] || playerData['player-level'] || '';
      // If level is still empty, search for any level field
      if (!level) {
        for (const [key, value] of Object.entries(playerData)) {
          if (key.includes('level') && value && /^\d+$/.test(value)) {
            level = value;
            break;
          }
        }
      }
      level = level || 'Not Available';
      const zone = playerData['zone'] || playerData['region'] || serverId;
      const country = playerData['country'] || 'Unknown';

      res.json({
        status: "success",
        result: {
          gameId: gameId,
          serverId: serverId,
          nickname: nickname,
          level: level,
          zone: zone,
          country: country
        }
      });
    } catch (error) {
      res.status(400).json({ 
        status: "failed",
        message: error instanceof Error ? error.message : "Verification failed" 
      });
    }
  });

  // Get current user profile
  app.get("/api/user/profile", async (req, res) => {
    const accessToken = (req.session as any).accessToken;
    if (!accessToken) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    try {
      const response = await axios.get(`${DISCORD_API}/users/@me`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      res.json(response.data);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch user profile" });
    }
  });

  // Get user rank info (requires userId from query param)
  app.get("/api/user/rank", async (req, res) => {
    const accessToken = (req.session as any).accessToken;
    if (!accessToken) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    try {
      // Get user profile first to get their ID
      const userResponse = await axios.get(`${DISCORD_API}/users/@me`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const userId = userResponse.data.id;

      // Get user rank from database
      const { db } = await import("./db");
      const { userRanks } = await import("@shared/schema");
      const { eq } = await import("drizzle-orm");

      const rankRecord = await db
        .select()
        .from(userRanks)
        .where(eq(userRanks.userId, userId));

      if (rankRecord.length === 0) {
        return res.json({
          verified: false,
          rank: null,
          message: "User not verified yet",
        });
      }

      const record = rankRecord[0];
      res.json({
        verified: true,
        userId: record.userId,
        mlbbId: record.mlbbId,
        serverId: record.serverId,
        currentRank: record.currentRank,
        previousRank: record.previousRank,
        stars: record.stars,
        points: record.points,
        roleId: record.roleId,
        lastChecked: record.lastChecked,
        rankChangedAt: record.rankChangedAt,
        createdAt: record.createdAt,
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch rank" });
    }
  });

  // Logout
  app.post("/api/logout", (req, res) => {
    (req.session as any).accessToken = null;
    res.json({ success: true });
  });

  return httpServer;
}
