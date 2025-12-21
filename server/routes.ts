import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
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
  app.get("/api/mlbb/verify/:gameId", async (req, res) => {
    try {
      const gameId = req.params.gameId;
      
      // Validate game ID format (should be numeric)
      if (!/^\d+$/.test(gameId)) {
        return res.status(400).json({ valid: false, error: "Invalid Game ID format" });
      }

      // Mock MLBB API response - in real world, you'd call actual MLBB API
      // For now, we accept numeric IDs as valid
      res.json({
        valid: true,
        gameId: gameId,
        nickname: `Player_${gameId.slice(-4)}`, // Mock nickname
        level: Math.floor(Math.random() * 50) + 1,
        zone: gameId.length === 9 ? "SEA" : "GLOBAL",
        lastUpdated: new Date().toISOString()
      });
    } catch (error) {
      res.status(500).json({ valid: false, error: "Verification failed" });
    }
  });

  // Logout
  app.post("/api/logout", (req, res) => {
    (req.session as any).accessToken = null;
    res.json({ success: true });
  });

  return httpServer;
}
