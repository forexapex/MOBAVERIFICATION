import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { serveStatic } from "./static";
import { createServer } from "http";
import session from "express-session";
import { Client, GatewayIntentBits, Partials, EmbedBuilder, ActionRowBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, REST, Routes } from 'discord.js';
import { validasi } from "./lib/validasi";
import {
  performFraudCheck,
  logVerificationAttempt,
  flagSuspiciousActivity,
  registerDuplicateGameId,
  updateRateLimitLog,
  hashIp,
} from "./lib/fraudDetection";
import {
  fetchMLBBRank,
  parseRank,
  updateUserRank,
  ROLE_MAP,
  RANK_ROLE_IDS,
} from "./lib/rankManagement";
import { startRankCheckTask } from "./lib/backgroundTasks";

const app = express();
const httpServer = createServer(app);

declare module "http" {
  interface IncomingMessage {
    rawBody: unknown;
  }
}

// Discord Bot Configuration
const BOT_CONFIG = {
    BOT_TOKEN: process.env.DISCORD_BOT_TOKEN || '',
    CLIENT_ID: '1451482666271772754',
    GUILD_ID: '1439165596725022753',
    CHANNEL_VERIFY_ID: '1439165986564477038',
    CHANNEL_ADMIN_DASHBOARD_ID: '1451840744703787008',
    ROLE_VERIFIED_ID: '1451490702348259409',
};


async function startDiscordBot() {
    if (!BOT_CONFIG.BOT_TOKEN) {
        console.warn('⚠️ [Discord Bot] Bot token not configured. Skipping bot startup.');
        return;
    }

    const commands = [{ name: 'verify', description: 'Verify your Mobile Legends account' }];
    const rest = new REST({ version: '10' }).setToken(BOT_CONFIG.BOT_TOKEN);

    const client = new Client({
        intents: [
            GatewayIntentBits.Guilds,
            GatewayIntentBits.GuildMessages,
            GatewayIntentBits.DirectMessages,
            GatewayIntentBits.MessageContent,
            GatewayIntentBits.GuildMembers
        ],
        partials: [Partials.Channel]
    });

    async function registerCommands() {
        try {
            console.log('🤖 [Discord Bot] Registering commands...');
            await rest.put(
                Routes.applicationGuildCommands(BOT_CONFIG.CLIENT_ID, BOT_CONFIG.GUILD_ID),
                { body: commands },
            );
            console.log('✅ [Discord Bot] Commands registered');
        } catch (error) {
            console.error('❌ [Discord Bot] Error registering commands:', error);
        }
    }

    client.once('clientReady', async () => {
        console.log(`✅ [Discord Bot] Logged in as ${client.user?.tag}`);
        await registerCommands();
        // Start background rank checking task
        startRankCheckTask(client);
    });

    client.on('interactionCreate', async interaction => {
        try {
            if (interaction.isChatInputCommand() && interaction.commandName === 'verify') {
                console.log(`📝 [Discord Bot] /verify command from ${interaction.user.tag}`);
                
                const isAllowedChannel = interaction.channelId === BOT_CONFIG.CHANNEL_VERIFY_ID || !interaction.guild;
                if (!isAllowedChannel) {
                    return await interaction.reply({
                        content: `❌ This command can only be used in <#${BOT_CONFIG.CHANNEL_VERIFY_ID}>`,
                        flags: ['Ephemeral']
                    });
                }

                const modal = new ModalBuilder()
                    .setCustomId('mlbbVerifyModal')
                    .setTitle('Mobile Legends Verification');

                const gameIdInput = new TextInputBuilder()
                    .setCustomId('gameIdInput')
                    .setLabel('Game ID (9-10 digits)')
                    .setStyle(TextInputStyle.Short)
                    .setRequired(true)
                    .setPlaceholder('e.g., 123456789');

                const serverInput = new TextInputBuilder()
                    .setCustomId('serverInput')
                    .setLabel('Server ID')
                    .setStyle(TextInputStyle.Short)
                    .setRequired(true)
                    .setPlaceholder('e.g., 20345');

                modal.addComponents(
                    new ActionRowBuilder<TextInputBuilder>().addComponents(gameIdInput),
                    new ActionRowBuilder<TextInputBuilder>().addComponents(serverInput)
                );

                await interaction.showModal(modal);
            }

            if (interaction.isModalSubmit() && interaction.customId === 'mlbbVerifyModal') {
                console.log(`📋 [Discord Bot] Modal submitted by ${interaction.user.tag}`);
                
                const gameId = interaction.fields.getTextInputValue('gameIdInput');
                const serverId = interaction.fields.getTextInputValue('serverInput');
                const guildId = interaction.guildId || '';

                await interaction.deferReply({ flags: ['Ephemeral'] });

                try {
                    // Validate server ID is numeric
                    if (!/^\d+$/.test(serverId)) {
                        return await interaction.editReply({
                            content: `❌ Invalid Server ID. Please enter a numeric server ID (e.g., 20345).`
                        });
                    }

                    console.log(`🔍 [Discord Bot] Verifying Game ID: ${gameId}, Server ID: ${serverId}`);
                    const playerData = await validasi(gameId, serverId);
                    console.log(`📊 [Discord Bot] Player data:`, playerData);

                    // Extract player info
                    const playerName = playerData['username'] || playerData['in-game-nickname'] || playerData['player-name'] || 'Unknown';
                    let playerLevel = playerData['level'] || playerData['user-level'] || playerData['player-level'] || '';
                    if (!playerLevel) {
                      for (const [key, value] of Object.entries(playerData)) {
                        if (key.includes('level') && value && /^\d+$/.test(value)) {
                          playerLevel = value;
                          break;
                        }
                      }
                    }
                    playerLevel = playerLevel || 'Not Available';
                    const playerRegion = playerData['region'] || playerData['zone'] || serverId;

                    // ANTI-FRAUD CHECK
                    const ipHash = hashIp(interaction.ip || 'unknown');
                    const fraudCheck = await performFraudCheck(
                      interaction.user.id,
                      guildId,
                      gameId,
                      serverId,
                      playerData,
                      ipHash
                    );

                    // Log verification attempt
                    await logVerificationAttempt(
                      interaction.user.id,
                      guildId,
                      gameId,
                      serverId,
                      playerData,
                      fraudCheck.isFraudulent ? 'suspicious' : 'success',
                      ipHash,
                      interaction.userAgent
                    );

                    // Update rate limit log
                    await updateRateLimitLog(interaction.user.id, guildId, fraudCheck.isFraudulent);

                    if (fraudCheck.isFraudulent) {
                        console.warn(`⚠️ [Discord Bot] FRAUD ALERT: ${fraudCheck.activityType}`);
                        console.warn(`   Reasons: ${fraudCheck.reasons.join(', ')}`);
                        console.warn(`   Severity: ${fraudCheck.severity}`);

                        // Flag suspicious activity
                        await flagSuspiciousActivity(
                          interaction.user.id,
                          guildId,
                          gameId,
                          fraudCheck.activityType || 'unknown',
                          fraudCheck.reasons.join('; '),
                          fraudCheck.severity
                        );

                        // Register duplicate if applicable
                        if (fraudCheck.activityType === 'duplicate_gameid') {
                          await registerDuplicateGameId(gameId, serverId, interaction.user.id, fraudCheck.severity);
                        }

                        // Alert mod channel if high severity
                        if (fraudCheck.severity === 'high') {
                          const guild = interaction.guild;
                          const adminChannel = guild ? guild.channels.cache.get(BOT_CONFIG.CHANNEL_ADMIN_DASHBOARD_ID) : null;

                          if (adminChannel && adminChannel.isTextBased()) {
                            const alertEmbed = new EmbedBuilder()
                              .setTitle('🚨 FRAUD ALERT - High Severity')
                              .setColor('Red')
                              .addFields(
                                { name: 'User', value: `<@${interaction.user.id}>`, inline: true },
                                { name: 'Discord Tag', value: interaction.user.tag, inline: true },
                                { name: 'Alert Type', value: fraudCheck.activityType || 'unknown', inline: true },
                                { name: 'Game ID', value: gameId, inline: true },
                                { name: 'Server', value: serverId, inline: true },
                                { name: 'Severity', value: fraudCheck.severity, inline: true },
                                { name: 'Reasons', value: fraudCheck.reasons.join('\n'), inline: false },
                                { name: 'Timestamp', value: new Date().toLocaleString(), inline: false }
                              )
                              .setFooter({ text: `Manual review recommended` });

                            await adminChannel.send({ embeds: [alertEmbed] });
                          }
                        }

                        return await interaction.editReply({
                          content: `⚠️ **Verification Flagged**\n\nYour verification has been flagged for manual review due to suspicious activity:\n• ${fraudCheck.reasons.join('\n• ')}\n\nOur moderators will review your account shortly.`
                        });
                    }

                    // RANK MANAGEMENT: Attempt to fetch MLBB rank
                    let assignedRank = "Unranked";
                    let assignedRoleId = "";

                    const rankData = await fetchMLBBRank(gameId, serverId);
                    if (rankData) {
                        const { rank, stars, points } = parseRank({ tier: rankData.tier, stars: rankData.stars, points: rankData.points });
                        assignedRank = rank;
                        assignedRoleId = ROLE_MAP[rank] || "";

                        // Store rank in database
                        await updateUserRank(
                          interaction.user.id,
                          guildId,
                          gameId,
                          serverId,
                          rank,
                          stars,
                          points
                        );

                        console.log(`⭐ [Discord Bot] Rank determined: ${rank} (${stars} stars)`);
                    } else {
                        console.log(`ℹ️  [Discord Bot] Rank data unavailable (API key not configured). User marked as Unranked.`);
                    }

                    console.log(`✅ [Discord Bot] Account verified: ${playerName}`);

                    try {
                        await interaction.user.send(
                            `✅ **Congratulations!**\n\n**Verification Complete**\n\n📱 **Account Details:**\n• Game ID: \`${gameId}\`\n• Server: \`${serverId}\`\n• Nickname: **${playerName}**\n• Level: **${playerLevel}**\n• Region: **${playerRegion}**\n• Rank: **${assignedRank}**\n\nYou now have access to all server channels. Welcome to IPEORG! 🎮`
                        );
                    } catch (e) {
                        console.error('[Discord Bot] Failed to send DM:', e instanceof Error ? e.message : String(e));
                    }

                    const guild = interaction.guild;
                    const adminChannel = guild ? guild.channels.cache.get(BOT_CONFIG.CHANNEL_ADMIN_DASHBOARD_ID) : null;

                    if (adminChannel && adminChannel.isTextBased()) {
                        const embed = new EmbedBuilder()
                            .setTitle('✅ New Verification')
                            .setColor('Green')
                            .addFields(
                                { name: 'User', value: `<@${interaction.user.id}>`, inline: true },
                                { name: 'Discord Tag', value: interaction.user.tag, inline: true },
                                { name: 'Game ID', value: gameId, inline: true },
                                { name: 'Server', value: serverId, inline: true },
                                { name: 'Player Name', value: playerName, inline: true },
                                { name: 'Level', value: playerLevel, inline: true },
                                { name: 'Timestamp', value: new Date().toLocaleString(), inline: false }
                            )
                            .setFooter({ text: `Verified automatically via moogold.com` });

                        await adminChannel.send({ embeds: [embed] });
                        console.log(`📤 [Discord Bot] Admin transcript sent`);
                    }

                    if (guild) {
                        try {
                            const member = await guild.members.fetch(interaction.user.id);
                            await member.roles.add(BOT_CONFIG.ROLE_VERIFIED_ID);
                            console.log(`✅ [Discord Bot] Verified role assigned to ${interaction.user.tag}`);

                            // RANK MANAGEMENT: Add rank role
                            if (assignedRoleId) {
                                const rankRole = guild.roles.cache.get(assignedRoleId);
                                if (rankRole) {
                                    await member.roles.add(rankRole);
                                    console.log(`✅ [Discord Bot] Rank role (${assignedRank}) assigned to ${interaction.user.tag}`);
                                }
                            }
                        } catch (e) {
                            console.error('[Discord Bot] Failed to assign role:', e instanceof Error ? e.message : String(e));
                        }
                    }

                    await interaction.editReply({
                        content: `✅ **Verification Successful!**\n\nYour Mobile Legends account **${playerName}** has been verified.\n✓ Rank: **${assignedRank}**\n✓ Check your DMs for confirmation\n✓ Rank role and verified role assigned\n✓ Enjoy full server access!`
                    });

                } catch (error) {
                    console.error(`❌ [Discord Bot] Verification failed:`, error instanceof Error ? error.message : String(error));
                    await interaction.editReply({
                        content: `❌ **Verification Failed**\n\n${error instanceof Error ? error.message : String(error)}\n\nPlease make sure your Game ID and Server are correct.`
                    });
                }
            }

        } catch (error) {
            console.error(`❌ [Discord Bot] Error:`, error);
            try {
                if (interaction.isRepliable() && !interaction.replied && !interaction.deferred) {
                    await interaction.reply({
                        content: '❌ An error occurred. Please try again.',
                        flags: ['Ephemeral']
                    });
                }
            } catch (e) {
                console.error('[Discord Bot] Failed to reply:', e instanceof Error ? e.message : String(e));
            }
        }
    });

    try {
        await client.login(BOT_CONFIG.BOT_TOKEN);
        console.log('🚀 [Discord Bot] Bot starting...');
    } catch (error) {
        console.error('❌ [Discord Bot] Login failed:', error);
    }
}

// Session middleware
app.use(
  session({
    secret: process.env.SESSION_SECRET || "dev-secret-key",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    },
  })
);

app.use(
  express.json({
    verify: (req, _res, buf) => {
      req.rawBody = buf;
    },
  }),
);

app.use(express.urlencoded({ extended: false }));

export function log(message: string, source = "express") {
  const formattedTime = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  console.log(`${formattedTime} [${source}] ${message}`);
}

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  // Start Discord bot
  startDiscordBot().catch(err => {
    console.error('Failed to start Discord bot:', err);
  });

  await registerRoutes(httpServer, app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (process.env.NODE_ENV === "production") {
    serveStatic(app);
  } else {
    const { setupVite } = await import("./vite");
    await setupVite(httpServer, app);
  }

  // ALWAYS serve the app on the port specified in the environment variable PORT
  // Other ports are firewalled. Default to 5000 if not specified.
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = parseInt(process.env.PORT || "5000", 10);
  httpServer.listen(
    {
      port,
      host: "0.0.0.0",
      reusePort: true,
    },
    () => {
      log(`serving on port ${port}`);
    },
  );
})();
