import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { serveStatic } from "./static";
import { createServer } from "http";
import session from "express-session";
import { Client, GatewayIntentBits, Partials, EmbedBuilder, ActionRowBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, StringSelectMenuBuilder, REST, Routes } from 'discord.js';
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

// Command cooldown tracking (in memory, resets on bot restart)
const cooldowns = new Map<string, number>();
const COOLDOWN_DURATION = 60 * 1000; // 1 minute in milliseconds

// Available character images - 135+ MLBB characters
const CHARACTER_IMAGES = [
    'attached_assets/aamon.png',
    'attached_assets/akai.png',
    'attached_assets/aldous.png',
    'attached_assets/alice.png',
    'attached_assets/alpha.png',
    'attached_assets/alucard.png',
    'attached_assets/angela.png',
    'attached_assets/argus.png',
    'attached_assets/arlot.png',
    'attached_assets/atlas.png',
    'attached_assets/aulus.png',
    'attached_assets/aurora.png',
    'attached_assets/badang.png',
    'attached_assets/balmond.png',
    'attached_assets/bane.png',
    'attached_assets/barats.png',
    'attached_assets/baxia.png',
    'attached_assets/beatrix.png',
    'attached_assets/beleric.png',
    'attached_assets/benedetta.png',
    'attached_assets/brody.png',
    'attached_assets/bruno.png',
    'attached_assets/carmila.png',
    'attached_assets/cecilion.png',
    'attached_assets/chang_e.png',
    'attached_assets/chip.png',
    'attached_assets/chou.png',
    'attached_assets/cici.png',
    'attached_assets/claude.png',
    'attached_assets/clint.png',
    'attached_assets/cyclops.png',
    'attached_assets/diggie.png',
    'attached_assets/dyroth.png',
    'attached_assets/edith.png',
    'attached_assets/esmeralda.png',
    'attached_assets/estes.png',
    'attached_assets/eudora.png',
    'attached_assets/fanny.png',
    'attached_assets/faramis.png',
    'attached_assets/floryn.png',
    'attached_assets/franco.png',
    'attached_assets/fredrin.png',
    'attached_assets/freya.png',
    'attached_assets/gatotkaca.png',
    'attached_assets/gloo.png',
    'attached_assets/gord.png',
    'attached_assets/granger.png',
    'attached_assets/grock.png',
    'attached_assets/guinevere.png',
    'attached_assets/gusion.png',
    'attached_assets/hanabi.png',
    'attached_assets/hanzo.png',
    'attached_assets/harith.png',
    'attached_assets/harley.png',
    'attached_assets/hayabusa.png',
    'attached_assets/helcurt.png',
    'attached_assets/hilda.png',
    'attached_assets/hylos.png',
    'attached_assets/idle.png',
    'attached_assets/irithel.png',
    'attached_assets/ixia.png',
    'attached_assets/jawhead.png',
    'attached_assets/johnson.png',
    'attached_assets/joy.png',
    'attached_assets/julian.png',
    'attached_assets/kadita.png',
    'attached_assets/kagura.png',
    'attached_assets/kaja.png',
    'attached_assets/kalea.png',
    'attached_assets/karina.png',
    'attached_assets/karrie.png',
    'attached_assets/khaleed.png',
    'attached_assets/khufra.png',
    'attached_assets/kimmy.png',
    'attached_assets/lancelot.png',
    'attached_assets/lapulapu.png',
    'attached_assets/layla.png',
    'attached_assets/leomord.png',
    'attached_assets/lesley.png',
    'attached_assets/ling.png',
    'attached_assets/lolita.png',
    'attached_assets/lukas.png',
    'attached_assets/lunox.png',
    'attached_assets/luoyi.png',
    'attached_assets/lylia.png',
    'attached_assets/martis.png',
    'attached_assets/masha.png',
    'attached_assets/mathilda.png',
    'attached_assets/melissa.png',
    'attached_assets/minotour.png',
    'attached_assets/minsitthar.png',
    'attached_assets/miya.png',
    'attached_assets/moskov.png',
    'attached_assets/nana.png',
    'attached_assets/natalia.png',
    'attached_assets/natan.png',
    'attached_assets/nolan.png',
    'attached_assets/novaria.png',
    'attached_assets/obsidia.png',
    'attached_assets/odette.png',
    'attached_assets/paquito.png',
    'attached_assets/pharsa.png',
    'attached_assets/phoveus.png',
    'attached_assets/popolandkupa.png',
    'attached_assets/rafaela.png',
    'attached_assets/roger.png',
    'attached_assets/ruby.png',
    'attached_assets/saber.png',
    'attached_assets/selena.png',
    'attached_assets/silvanna.png',
    'attached_assets/sun.png',
    'attached_assets/suyou.png',
    'attached_assets/terizla.png',
    'attached_assets/thamuz.png',
    'attached_assets/tigreal.png',
    'attached_assets/uranus.png',
    'attached_assets/valentina.png',
    'attached_assets/vale.png',
    'attached_assets/valir.png',
    'attached_assets/vexana.png',
    'attached_assets/wanwan.png',
    'attached_assets/xavier.png',
    'attached_assets/xborg.png',
    'attached_assets/yin.png',
    'attached_assets/yisunshin.png',
    'attached_assets/yuzhong.png',
    'attached_assets/yve.png',
    'attached_assets/zetian.png',
    'attached_assets/zhask.png',
    'attached_assets/zhuxin.png',
    'attached_assets/zilong.png',
    'attached_assets/IPEORGBADGE_1766133873456.png',
    'attached_assets/IPEORGBADGE_1766134329796.png',
    'attached_assets/image_1766216788907.png',
    'attached_assets/image_1766217135488.png'
];

function getCooldownKey(userId: string, command: string): string {
    return `${userId}-${command}`;
}

function getRemainingCooldown(cooldownKey: string): number | null {
    const lastUsed = cooldowns.get(cooldownKey);
    if (!lastUsed) return null;
    
    const remaining = COOLDOWN_DURATION - (Date.now() - lastUsed);
    return remaining > 0 ? remaining : null;
}

function getRandomCharacterImage(): string {
    return CHARACTER_IMAGES[Math.floor(Math.random() * CHARACTER_IMAGES.length)];
}

async function startDiscordBot() {
    if (!BOT_CONFIG.BOT_TOKEN) {
        console.warn('⚠️ [Discord Bot] Bot token not configured. Skipping bot startup.');
        return;
    }

    const commands = [
        { name: 'verify', description: 'Verify your Mobile Legends account' },
        { name: 'rank', description: 'Set your MLBB rank manually' },
        { name: 'profile', description: 'View your verification status' }
    ];
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
            if (interaction.isChatInputCommand() && interaction.commandName === 'rank') {
                console.log(`📊 [Discord Bot] /rank command from ${interaction.user.tag}`);
                
                const ranks = ['Warrior', 'Elite', 'Master', 'Grandmaster', 'Epic', 'Legend', 'Mythic', 'Mythical Glory'];
                const selectMenu = new ActionRowBuilder<StringSelectMenuBuilder>()
                    .addComponents(
                        new StringSelectMenuBuilder()
                            .setCustomId('rankSelect')
                            .setPlaceholder('Select your MLBB rank...')
                            .addOptions(
                                ranks.map(rank => ({
                                    label: rank,
                                    value: rank,
                                    emoji: rank === 'Mythical Glory' ? '👑' : '⭐'
                                }))
                            )
                    );

                await interaction.reply({
                    content: '📱 **Select Your MLBB Rank**\n\n*Since Moonton doesn\'t provide a public rank API, please select your current rank:*',
                    components: [selectMenu],
                    flags: ['Ephemeral']
                });
            }

            if (interaction.isStringSelectMenu() && interaction.customId === 'rankSelect') {
                const selectedRank = interaction.values[0];
                const guildId = interaction.guildId || BOT_CONFIG.GUILD_ID;
                
                try {
                    // Update rank in database
                    await updateUserRank(
                        interaction.user.id,
                        guildId,
                        'manual-submission',
                        '0',
                        selectedRank,
                        0,
                        0
                    );

                    // Get rank role ID
                    const rankRoleId = ROLE_MAP[selectedRank];
                    if (rankRoleId && interaction.guild) {
                        const member = await interaction.guild.members.fetch(interaction.user.id);
                        
                        // Remove old rank roles
                        const rolesToRemove = RANK_ROLE_IDS
                            .map((roleId) => interaction.guild!.roles.cache.get(roleId))
                            .filter((role): role is NonNullable<typeof role> => role !== undefined && member.roles.cache.has(role.id));

                        if (rolesToRemove.length > 0) {
                            await member.roles.remove(rolesToRemove);
                        }

                        // Add new rank role
                        const rankRole = interaction.guild.roles.cache.get(rankRoleId);
                        if (rankRole) {
                            await member.roles.add(rankRole);
                            console.log(`✅ [Discord Bot] Rank role (${selectedRank}) assigned to ${interaction.user.tag}`);
                        }
                    }

                    const rankEmbed = new EmbedBuilder()
                        .setTitle('✅ Rank Updated!')
                        .setColor('Green')
                        .setDescription(`Your rank has been set to **${selectedRank}**`)
                        .addFields(
                            { name: '🎮 Rank', value: selectedRank, inline: true },
                            { name: '✨ Role', value: 'Discord role assigned', inline: true }
                        )
                        .setFooter({ text: 'IPEORG MLBB Bot - Great play! 🏆' });
                    
                    await interaction.reply({
                        embeds: [rankEmbed],
                        flags: ['Ephemeral']
                    });
                } catch (error) {
                    console.error('[Discord Bot] Error updating rank:', error instanceof Error ? error.message : String(error));
                    
                    const errorEmbed = new EmbedBuilder()
                        .setTitle('❌ Rank Update Failed')
                        .setColor('Red')
                        .setDescription('Failed to update your rank.')
                        .addFields(
                            { name: 'Error', value: error instanceof Error ? error.message : 'Unknown error', inline: false }
                        )
                        .setFooter({ text: 'IPEORG MLBB Bot' });
                    
                    await interaction.reply({
                        embeds: [errorEmbed],
                        flags: ['Ephemeral']
                    });
                }
            }

            if (interaction.isChatInputCommand() && interaction.commandName === 'profile') {
                console.log(`📊 [Discord Bot] /profile command from ${interaction.user.tag}`);
                
                try {
                    const userRecord = await db.select().from(userRanks).where(eq(userRanks.userId, interaction.user.id));
                    
                    if (userRecord.length === 0) {
                        const embed = new EmbedBuilder()
                            .setTitle('📱 Your MLBB Profile')
                            .setColor('Yellow')
                            .setDescription('You haven\'t verified your account yet.')
                            .addFields(
                                { name: 'Status', value: '❌ Not Verified', inline: true },
                                { name: 'Action', value: 'Use `/verify` command to get started', inline: false }
                            )
                            .setFooter({ text: 'IPEORG MLBB Bot' })
                            .setTimestamp();
                        
                        return await interaction.reply({
                            embeds: [embed],
                            flags: ['Ephemeral']
                        });
                    }
                    
                    const profile = userRecord[0];
                    const verifiedDate = new Date(profile.createdAt || 0).toLocaleDateString();
                    const characterImage = getRandomCharacterImage();
                    
                    const embed = new EmbedBuilder()
                        .setTitle('ACCOUNT DETAILS')
                        .setColor('#00D4FF')
                        .setThumbnail(`attachment://${characterImage.split('/').pop()}`)
                        .addFields(
                            { name: 'Game ID', value: profile.mlbbId, inline: false },
                            { name: 'Server', value: profile.serverId, inline: false },
                            { name: 'In Game Name', value: 'Verified Player', inline: false },
                            { name: 'Region', value: profile.serverId, inline: false },
                            { name: '\u200B', value: '\u200B' },
                            { name: '⭐ Rank', value: profile.currentRank || 'Unranked', inline: true },
                            { name: '📊 Stars', value: `${profile.stars || 0}`, inline: true },
                            { name: '📅 Verified Date', value: verifiedDate, inline: true }
                        )
                        .setFooter({ text: 'IPEORG MLBB Bot' })
                        .setTimestamp();
                    
                    await interaction.reply({
                        embeds: [embed],
                        files: [characterImage],
                        flags: ['Ephemeral']
                    });
                } catch (error) {
                    console.error('[Discord Bot] Error fetching profile:', error instanceof Error ? error.message : String(error));
                    const errorEmbed = new EmbedBuilder()
                        .setTitle('❌ Error')
                        .setColor('Red')
                        .setDescription('Failed to load your profile. Please try again.')
                        .setFooter({ text: 'IPEORG MLBB Bot' });
                    
                    await interaction.reply({
                        embeds: [errorEmbed],
                        flags: ['Ephemeral']
                    });
                }
            }

            if (interaction.isChatInputCommand() && interaction.commandName === 'verify') {
                console.log(`📝 [Discord Bot] /verify command from ${interaction.user.tag}`);
                
                // Check cooldown
                const cooldownKey = getCooldownKey(interaction.user.id, 'verify');
                const remainingCooldown = getRemainingCooldown(cooldownKey);
                
                if (remainingCooldown) {
                    const minutes = Math.ceil(remainingCooldown / 60000);
                    const cooldownEmbed = new EmbedBuilder()
                        .setTitle('⏱️ Cooldown Active')
                        .setColor('Red')
                        .setDescription(`You can verify again in **${minutes}** minute${minutes > 1 ? 's' : ''}.`)
                        .setFooter({ text: 'IPEORG MLBB Bot' });
                    
                    return await interaction.reply({
                        embeds: [cooldownEmbed],
                        flags: ['Ephemeral']
                    });
                }
                
                const isAllowedChannel = interaction.channelId === BOT_CONFIG.CHANNEL_VERIFY_ID || interaction.channelId === BOT_CONFIG.CHANNEL_ADMIN_DASHBOARD_ID || !interaction.guild;
                if (!isAllowedChannel) {
                    const channelEmbed = new EmbedBuilder()
                        .setTitle('❌ Wrong Channel')
                        .setColor('Red')
                        .setDescription(`This command can only be used in <#${BOT_CONFIG.CHANNEL_VERIFY_ID}> or <#${BOT_CONFIG.CHANNEL_ADMIN_DASHBOARD_ID}>`)
                        .setFooter({ text: 'IPEORG MLBB Bot' });
                    
                    return await interaction.reply({
                        embeds: [channelEmbed],
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
                    // Set cooldown
                    const cooldownKey = getCooldownKey(interaction.user.id, 'verify');
                    cooldowns.set(cooldownKey, Date.now());
                    
                    // Validate server ID is numeric
                    if (!/^\d+$/.test(serverId)) {
                        const errorEmbed = new EmbedBuilder()
                            .setTitle('❌ Invalid Server ID')
                            .setColor('Red')
                            .setDescription('Server ID must be numeric (e.g., 20345). Please try again.')
                            .setFooter({ text: 'IPEORG MLBB Bot' });
                        
                        return await interaction.editReply({
                            embeds: [errorEmbed]
                        });
                    }
                    
                    // Validate Game ID format
                    if (!/^\d{9,10}$/.test(gameId)) {
                        const errorEmbed = new EmbedBuilder()
                            .setTitle('❌ Invalid Game ID')
                            .setColor('Red')
                            .setDescription('Game ID must be 9-10 digits (e.g., 123456789). Please try again.')
                            .setFooter({ text: 'IPEORG MLBB Bot' });
                        
                        return await interaction.editReply({
                            embeds: [errorEmbed]
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

                        const flaggedEmbed = new EmbedBuilder()
                            .setTitle('⚠️ Verification Flagged')
                            .setColor('Orange')
                            .setDescription('Your verification has been flagged for manual review.')
                            .addFields(
                                { name: 'Reason', value: fraudCheck.reasons.join('\n'), inline: false },
                                { name: 'Next Steps', value: 'Our moderators will review your account shortly and contact you.', inline: false }
                            )
                            .setFooter({ text: 'IPEORG MLBB Bot' });
                        
                        return await interaction.editReply({
                            embeds: [flaggedEmbed]
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
                        const dmCharacterImage = getRandomCharacterImage();
                        const dmCharacterFileName = dmCharacterImage.split('/').pop() || 'character.png';
                        
                        const dmEmbed = new EmbedBuilder()
                            .setTitle('ACCOUNT DETAILS')
                            .setColor('#00D4FF')
                            .setDescription('✅ **Congratulations! Verification Complete**')
                            .setThumbnail(`attachment://${dmCharacterFileName}`)
                            .addFields(
                                { name: 'Game ID', value: gameId, inline: false },
                                { name: 'Server', value: serverId, inline: false },
                                { name: 'In Game Name', value: playerName, inline: false },
                                { name: 'Region', value: playerRegion, inline: false },
                                { name: '\u200B', value: '\u200B' },
                                { name: '⭐ Rank', value: assignedRank, inline: true },
                                { name: '📊 Level', value: playerLevel, inline: true },
                                { name: '✨ Status', value: 'Verified', inline: true },
                                { name: '\u200B', value: '\u200B' },
                                { name: '🎮 Server Access', value: 'You now have full access to all server channels. Welcome to IPEORG!', inline: false }
                            )
                            .setFooter({ text: 'IPEORG MLBB Bot' })
                            .setTimestamp();
                        
                        await interaction.user.send({
                            embeds: [dmEmbed],
                            files: [dmCharacterImage]
                        });
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

                    const characterImage = getRandomCharacterImage();
                    const characterFileName = characterImage.split('/').pop() || 'character.png';
                    
                    const successEmbed = new EmbedBuilder()
                        .setTitle('ACCOUNT DETAILS')
                        .setColor('#00D4FF')
                        .setDescription('✅ **Verification Successful!**')
                        .setThumbnail(`attachment://${characterFileName}`)
                        .addFields(
                            { name: 'Game ID', value: gameId, inline: false },
                            { name: 'Server', value: serverId, inline: false },
                            { name: 'In Game Name', value: playerName, inline: false },
                            { name: 'Region', value: playerRegion, inline: false },
                            { name: '\u200B', value: '\u200B' },
                            { name: '⭐ Rank', value: assignedRank, inline: true },
                            { name: '✅ Status', value: 'Verified', inline: true },
                            { name: '📱 Access', value: 'Full Server Access', inline: true }
                        )
                        .setFooter({ text: 'IPEORG MLBB Bot' })
                        .setTimestamp();
                    
                    await interaction.editReply({
                        embeds: [successEmbed],
                        files: [characterImage]
                    });

                } catch (error) {
                    console.error(`❌ [Discord Bot] Verification failed:`, error instanceof Error ? error.message : String(error));
                    
                    const errorEmbed = new EmbedBuilder()
                        .setTitle('❌ Verification Failed')
                        .setColor('Red')
                        .setDescription('Something went wrong during verification.')
                        .addFields(
                            { name: 'Error', value: error instanceof Error ? error.message : 'Unknown error. Please contact support.', inline: false },
                            { name: 'Troubleshooting', value: '• Check your Game ID is correct (9-10 digits)\n• Check your Server ID is numeric\n• Try again in a few moments', inline: false }
                        )
                        .setFooter({ text: 'IPEORG MLBB Bot' });
                    
                    await interaction.editReply({
                        embeds: [errorEmbed]
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
