import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { serveStatic } from "./static";
import { createServer } from "http";
import session from "express-session";
import { Client, GatewayIntentBits, Partials, EmbedBuilder, ActionRowBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, StringSelectMenuBuilder, REST, Routes } from 'discord.js';
import { validasi } from "./lib/validasi";
import { db } from "./db";
import { userRanks } from "@shared/schema";
import { eq } from "drizzle-orm";
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
  RANK_DIVISIONS,
  RANK_EMOJIS,
} from "./lib/rankManagement";
import { startRankCheckTask } from "./lib/backgroundTasks";
import { generateAccountDetailsCard } from "./lib/imageGenerator";

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
    // Legacy function - kept for backward compatibility
    return CHARACTER_IMAGES[Math.floor(Math.random() * CHARACTER_IMAGES.length)];
}

async function startDiscordBot() {
    if (!BOT_CONFIG.BOT_TOKEN) {
        console.warn('⚠️ [Discord Bot] Bot token not configured. Skipping bot startup.');
        return;
    }

    const commands = [
        { name: 'verify', description: 'Verify your Mobile Legends account with Game ID and Server ID' },
        { name: 'rank', description: 'Update your MLBB rank - Select from Warrior to Mythical Glory' },
        { name: 'profile', description: 'View your verified MLBB profile and rank details' },
        { name: 'help', description: 'Get help - View all available bot commands' },
        { name: 'stats', description: 'View your verification statistics and account details' }
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

    async function completeVerification(interaction: any, profile: any, rank: string, division: string | undefined, guildId: string) {
        try {
            await updateUserRank(
                interaction.user.id,
                guildId,
                profile.mlbbId,
                profile.serverId,
                rank,
                0,
                0,
                division
            );

            const rankRoleId = ROLE_MAP[rank];
            if (rankRoleId && interaction.guild) {
                try {
                    const member = await interaction.guild.members.fetch(interaction.user.id);
                    
                    if (BOT_CONFIG.ROLE_VERIFIED_ID) {
                        await member.roles.add(BOT_CONFIG.ROLE_VERIFIED_ID);
                    }
                    
                    const rolesToRemove = RANK_ROLE_IDS
                        .map((roleId) => interaction.guild!.roles.cache.get(roleId))
                        .filter((role): role is NonNullable<typeof role> => role !== undefined && member.roles.cache.has(role.id));

                    if (rolesToRemove.length > 0) {
                        await member.roles.remove(rolesToRemove);
                    }

                    const rankRole = interaction.guild.roles.cache.get(rankRoleId);
                    if (rankRole) {
                        await member.roles.add(rankRole);
                        console.log(`✅ [Discord Bot] Verified and Rank role (${rank}) assigned to ${interaction.user.tag}`);
                    }
                } catch (roleError) {
                    console.warn(`⚠️ [Discord Bot] Could not assign roles:`, roleError instanceof Error ? roleError.message : String(roleError));
                    // Continue anyway - database record was created
                }
            }

            const rankDisplay = division ? `${rank} ${division}` : rank;
            const successEmbed = new EmbedBuilder()
                .setTitle('✅ Verification Complete!')
                .setColor('Green')
                .setDescription('Your account has been verified and roles have been assigned.')
                .addFields(
                    { name: '🎮 Game ID', value: profile.mlbbId, inline: true },
                    { name: '🌐 Server', value: profile.serverId, inline: true },
                    { name: '⭐ Rank', value: rankDisplay, inline: true },
                    { name: '🎊 Access', value: 'You now have full server access!', inline: false }
                )
                .setFooter({ text: 'IPEORG MLBB Bot' })
                .setTimestamp();

            await interaction.editReply({ embeds: [successEmbed] });

            const guild = interaction.guild;
            const adminChannel = guild ? guild.channels.cache.get(BOT_CONFIG.CHANNEL_ADMIN_DASHBOARD_ID) : null;

            if (adminChannel && adminChannel.isTextBased()) {
                const adminEmbed = new EmbedBuilder()
                    .setTitle('✅ New Verification Complete')
                    .setColor('Green')
                    .addFields(
                        { name: 'User', value: `<@${interaction.user.id}>`, inline: true },
                        { name: 'Discord Tag', value: interaction.user.tag, inline: true },
                        { name: 'Game ID', value: profile.mlbbId, inline: true },
                        { name: 'Server', value: profile.serverId, inline: true },
                        { name: 'Rank Selected', value: rankDisplay, inline: true },
                        { name: 'Timestamp', value: new Date().toLocaleString(), inline: false }
                    )
                    .setFooter({ text: 'IPEORG MLBB Bot' });

                await adminChannel.send({ embeds: [adminEmbed] });
            }
        } catch (error) {
            console.error('[Discord Bot] Error:', error);
            const errorEmbed = new EmbedBuilder()
                .setTitle('❌ Error')
                .setColor('Red')
                .setDescription('Failed to complete verification.')
                .setFooter({ text: 'IPEORG MLBB Bot' });
            
            await interaction.editReply({ embeds: [errorEmbed] });
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
                
                const ranks = Object.keys(RANK_DIVISIONS);
                const selectMenu = new ActionRowBuilder<StringSelectMenuBuilder>()
                    .addComponents(
                        new StringSelectMenuBuilder()
                            .setCustomId('rankSelect')
                            .setPlaceholder('Select your MLBB rank...')
                            .addOptions(
                                ranks.map(rank => ({
                                    label: rank,
                                    value: rank,
                                    emoji: RANK_EMOJIS[rank] || '⭐'
                                }))
                            )
                    );

                await interaction.reply({
                    content: '📱 **Select Your MLBB Rank**\n\n*Since Moonton doesn\'t provide a public rank API, please select your current rank:*',
                    components: [selectMenu],
                    flags: ['Ephemeral']
                });
            }

            // Handle rank selection from /rank command
            if (interaction.isStringSelectMenu() && interaction.customId === 'rankSelect') {
                const selectedRank = interaction.values[0];
                const guildId = interaction.guildId || BOT_CONFIG.GUILD_ID;
                const divisions = RANK_DIVISIONS[selectedRank]?.divisions || [];

                await interaction.deferReply({ flags: ['Ephemeral'] });

                try {
                    // If rank has divisions, show division selection
                    if (divisions.length > 1) {
                        // Use custom star emoji for Legend divisions
                        const getDivisionEmoji = (rank: string, division: string) => {
                            if (rank === 'Legend') {
                                return '<:star:1453294022629130332>'; // Custom star emoji for Legend
                            }
                            return '📊';
                        };

                        const divisionMenu = new ActionRowBuilder<StringSelectMenuBuilder>()
                            .addComponents(
                                new StringSelectMenuBuilder()
                                    .setCustomId(`divisionSelect_${interaction.user.id}`)
                                    .setPlaceholder(`Select your ${selectedRank} division...`)
                                    .addOptions(
                                        divisions.map(div => ({
                                            label: div,
                                            value: div,
                                            emoji: getDivisionEmoji(selectedRank, div)
                                        }))
                                    )
                            );

                        const divisionPrompt = new EmbedBuilder()
                            .setTitle(`⭐ Select ${selectedRank} Division`)
                            .setColor('#FFA500')
                            .setDescription(`Choose your current division for ${selectedRank}`);

                        return await interaction.editReply({
                            embeds: [divisionPrompt],
                            components: [divisionMenu]
                        });
                    }

                    // No divisions, directly update rank
                    await updateUserRank(
                        interaction.user.id,
                        guildId,
                        'manual-submission',
                        '0',
                        selectedRank,
                        0,
                        0,
                        divisions[0]
                    );

                    const rankRoleId = ROLE_MAP[selectedRank];
                    if (rankRoleId && interaction.guild) {
                        const member = await interaction.guild.members.fetch(interaction.user.id);
                        const rolesToRemove = RANK_ROLE_IDS
                            .map((roleId) => interaction.guild!.roles.cache.get(roleId))
                            .filter((role): role is NonNullable<typeof role> => role !== undefined && member.roles.cache.has(role.id));

                        if (rolesToRemove.length > 0) {
                            await member.roles.remove(rolesToRemove);
                        }

                        const rankRole = interaction.guild.roles.cache.get(rankRoleId);
                        if (rankRole) {
                            await member.roles.add(rankRole);
                        }
                    }

                    const rankEmbed = new EmbedBuilder()
                        .setTitle('✅ Rank Updated!')
                        .setColor('Green')
                        .setDescription(`Your rank has been set to **${selectedRank}**`)
                        .setFooter({ text: 'IPEORG MLBB Bot - Great play! 🏆' });
                    
                    await interaction.editReply({
                        embeds: [rankEmbed]
                    });
                } catch (error) {
                    const errorEmbed = new EmbedBuilder()
                        .setTitle('❌ Rank Update Failed')
                        .setColor('Red')
                        .setDescription('Failed to update your rank.')
                        .setFooter({ text: 'IPEORG MLBB Bot' });
                    
                    await interaction.editReply({
                        embeds: [errorEmbed]
                    });
                }
            }

            // Handle division selection
            if (interaction.isStringSelectMenu() && interaction.customId.startsWith('divisionSelect_')) {
                const selectedDivision = interaction.values[0];
                const userId = interaction.customId.split('_')[1];
                const guildId = interaction.guildId || BOT_CONFIG.GUILD_ID;

                if (userId !== interaction.user.id) return;

                await interaction.deferReply({ flags: ['Ephemeral'] });

                try {
                    const userRecord = await db.select().from(userRanks).where(eq(userRanks.userId, interaction.user.id));
                    const currentRank = userRecord[0]?.currentRank || '';

                    await updateUserRank(
                        interaction.user.id,
                        guildId,
                        userRecord[0]?.mlbbId || 'manual-submission',
                        userRecord[0]?.serverId || '0',
                        currentRank,
                        0,
                        0,
                        selectedDivision
                    );

                    const rankRoleId = ROLE_MAP[currentRank];
                    if (rankRoleId && interaction.guild) {
                        const member = await interaction.guild.members.fetch(interaction.user.id);
                        const rolesToRemove = RANK_ROLE_IDS
                            .map((roleId) => interaction.guild!.roles.cache.get(roleId))
                            .filter((role): role is NonNullable<typeof role> => role !== undefined && member.roles.cache.has(role.id));

                        if (rolesToRemove.length > 0) {
                            await member.roles.remove(rolesToRemove);
                        }

                        const rankRole = interaction.guild.roles.cache.get(rankRoleId);
                        if (rankRole) {
                            await member.roles.add(rankRole);
                        }
                    }

                    const embed = new EmbedBuilder()
                        .setTitle('✅ Division Set!')
                        .setColor('Green')
                        .setDescription(`${currentRank} **${selectedDivision}** assigned!`)
                        .setFooter({ text: 'IPEORG MLBB Bot' });
                    
                    await interaction.editReply({
                        embeds: [embed]
                    });
                } catch (error) {
                    const errorEmbed = new EmbedBuilder()
                        .setTitle('❌ Error')
                        .setColor('Red')
                        .setDescription('Failed to set division.')
                        .setFooter({ text: 'IPEORG MLBB Bot' });
                    
                    await interaction.editReply({
                        embeds: [errorEmbed]
                    });
                }
            }

            // Handle rank selection from /verify command
            if (interaction.isStringSelectMenu() && interaction.customId.startsWith('rankSelect_') && !interaction.customId.includes('division')) {
                const selectedRank = interaction.values[0];
                const guildId = interaction.guildId || '';
                const divisions = RANK_DIVISIONS[selectedRank]?.divisions || [];

                await interaction.deferReply({ flags: ['Ephemeral'] });

                try {
                    const userRecord = await db.select().from(userRanks).where(eq(userRanks.userId, interaction.user.id));

                    if (userRecord.length === 0) {
                        const errorEmbed = new EmbedBuilder()
                            .setTitle('❌ Session Expired')
                            .setColor('Red')
                            .setDescription('Your verification session has expired. Please run /verify again.')
                            .setFooter({ text: 'IPEORG MLBB Bot' });
                        
                        return await interaction.editReply({ embeds: [errorEmbed] });
                    }

                    const profile = userRecord[0];

                    // If rank has multiple divisions, show division picker
                    if (divisions.length > 1) {
                        // Use custom star emoji for Legend divisions
                        const getDivisionEmoji = (rank: string) => {
                            if (rank === 'Legend') {
                                return '<:star:1453294022629130332>'; // Custom star emoji for Legend
                            }
                            return '📊';
                        };

                        const divisionMenu = new ActionRowBuilder<StringSelectMenuBuilder>()
                            .addComponents(
                                new StringSelectMenuBuilder()
                                    .setCustomId(`rankSelectDivision_${interaction.user.id}`)
                                    .setPlaceholder(`Select your ${selectedRank} division...`)
                                    .addOptions(
                                        divisions.map(div => ({
                                            label: div,
                                            value: div,
                                            emoji: getDivisionEmoji(selectedRank)
                                        }))
                                    )
                            );

                        const divisionPrompt = new EmbedBuilder()
                            .setTitle(`📊 Select ${selectedRank} Division`)
                            .setColor('#FFA500')
                            .setDescription(`Choose your division within ${selectedRank}`);

                        return await interaction.editReply({
                            embeds: [divisionPrompt],
                            components: [divisionMenu]
                        });
                    }

                    // No divisions - complete verification
                    await completeVerification(interaction, profile, selectedRank, divisions[0], guildId);
                } catch (error) {
                    const errorEmbed = new EmbedBuilder()
                        .setTitle('❌ Verification Failed')
                        .setColor('Red')
                        .setDescription('An error occurred.')
                        .setFooter({ text: 'IPEORG MLBB Bot' });
                    
                    await interaction.editReply({ embeds: [errorEmbed] });
                }
            }

            // Handle division selection from verify
            if (interaction.isStringSelectMenu() && interaction.customId.startsWith('rankSelectDivision_')) {
                const selectedDivision = interaction.values[0];
                const userId = interaction.customId.split('_')[1];
                const guildId = interaction.guildId || '';

                if (userId !== interaction.user.id) return;

                await interaction.deferReply({ flags: ['Ephemeral'] });

                try {
                    const userRecord = await db.select().from(userRanks).where(eq(userRanks.userId, interaction.user.id));
                    if (!userRecord[0]) throw new Error('User not found');

                    const profile = userRecord[0];
                    const selectedRank = profile.currentRank || 'Warrior';

                    await completeVerification(interaction, profile, selectedRank, selectedDivision, guildId);
                } catch (error) {
                    const errorEmbed = new EmbedBuilder()
                        .setTitle('❌ Error')
                        .setColor('Red')
                        .setDescription('Failed to complete verification.')
                        .setFooter({ text: 'IPEORG MLBB Bot' });
                    
                    await interaction.editReply({ embeds: [errorEmbed] });
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
                    const characterImagePath = getRandomCharacterImage();
                    
                    // Generate the account details card image
                    const cardImage = await generateAccountDetailsCard(characterImagePath, {
                        gameId: profile.mlbbId,
                        server: profile.serverId,
                        gameName: 'Verified Player',
                        region: profile.serverId,
                        rank: profile.currentRank || 'Unranked',
                        level: 'Available',
                        status: 'Verified'
                    });
                    
                    // Send as image attachment
                    await interaction.reply({
                        files: [{
                            attachment: cardImage,
                            name: 'account-details.png'
                        }],
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

            if (interaction.isChatInputCommand() && interaction.commandName === 'help') {
                console.log(`❓ [Discord Bot] /help command from ${interaction.user.tag}`);
                
                const helpEmbed = new EmbedBuilder()
                    .setTitle('📖 IPEORG MLBB Bot - Help')
                    .setColor('#00D4FF')
                    .setDescription('Complete guide to all available bot commands')
                    .addFields(
                        { name: '✅ /verify', value: 'Verify your Mobile Legends account\nEnter your Game ID (8-10 digits) and Server ID to get started.', inline: false },
                        { name: '⭐ /rank', value: 'Update your MLBB rank\nSelect your current rank from Warrior to Mythical Glory.', inline: false },
                        { name: '👤 /profile', value: 'View your verified profile\nDisplay your account details, rank, and verification status.', inline: false },
                        { name: '📊 /stats', value: 'View your statistics\nCheck your verification date, rank history, and account info.', inline: false },
                        { name: '❓ /help', value: 'Show this help message\nGet information about all available commands.', inline: false },
                        { name: '\u200B', value: '\u200B' },
                        { name: '💡 Tips', value: '• Game ID format: 8-10 digits only\n• Server ID: Required for verification\n• Cooldown: 1 minute between /verify commands\n• Commands work in verification channels only', inline: false }
                    )
                    .setFooter({ text: 'IPEORG MLBB Bot - Advanced Discord Automation' })
                    .setTimestamp();
                
                await interaction.reply({
                    embeds: [helpEmbed],
                    flags: ['Ephemeral']
                });
            }

            if (interaction.isChatInputCommand() && interaction.commandName === 'stats') {
                console.log(`📊 [Discord Bot] /stats command from ${interaction.user.tag}`);
                
                try {
                    const userRecord = await db.select().from(userRanks).where(eq(userRanks.userId, interaction.user.id));
                    
                    if (userRecord.length === 0) {
                        const embed = new EmbedBuilder()
                            .setTitle('📊 Your Statistics')
                            .setColor('Yellow')
                            .setDescription('No verification data found')
                            .addFields(
                                { name: 'Status', value: '❌ Not Verified', inline: true },
                                { name: 'Verifications', value: '0', inline: true },
                                { name: 'Action', value: 'Use `/verify` to verify your account', inline: false }
                            )
                            .setFooter({ text: 'IPEORG MLBB Bot' });
                        
                        return await interaction.reply({
                            embeds: [embed],
                            flags: ['Ephemeral']
                        });
                    }
                    
                    const profile = userRecord[0];
                    const characterImagePath = getRandomCharacterImage();
                    
                    // Generate the stats card image
                    const daysVerified = Math.floor((Date.now() - (profile.createdAt ? new Date(profile.createdAt).getTime() : 0)) / (1000 * 60 * 60 * 24));
                    const statsCardImage = await generateAccountDetailsCard(characterImagePath, {
                        gameId: profile.mlbbId,
                        server: profile.serverId,
                        gameName: profile.currentRank || 'Unranked',
                        region: new Date(profile.createdAt || 0).toLocaleDateString(),
                        rank: profile.currentRank || 'Unranked',
                        level: `${daysVerified} Days`,
                        status: 'Active'
                    });
                    
                    // Send as image attachment
                    await interaction.reply({
                        files: [{
                            attachment: statsCardImage,
                            name: 'verification-stats.png'
                        }],
                        flags: ['Ephemeral']
                    });
                } catch (error) {
                    console.error('[Discord Bot] Error fetching stats:', error instanceof Error ? error.message : String(error));
                    const errorEmbed = new EmbedBuilder()
                        .setTitle('❌ Error')
                        .setColor('Red')
                        .setDescription('Failed to load your statistics. Please try again.')
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
                    .setLabel('Game ID (8-10 digits)')
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
                    if (!/^\d{8,10}$/.test(gameId)) {
                        const errorEmbed = new EmbedBuilder()
                            .setTitle('❌ Invalid Game ID')
                            .setColor('Red')
                            .setDescription('Game ID must be 8-10 digits (e.g., 123456789). Please try again.')
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
                    const ipHash = hashIp('discord-bot');
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
                      'discord-bot'
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

                    console.log(`✅ [Discord Bot] Account verified: ${playerName}`);

                    // IMPORTANT: Create user record in database immediately after verification
                    // This prevents "session expired" errors when user selects rank
                    try {
                        await updateUserRank(
                            interaction.user.id,
                            guildId,
                            gameId,
                            serverId,
                            'Warrior', // Default rank until user selects
                            0,
                            0,
                            undefined
                        );
                    } catch (dbError) {
                        console.error('Error creating user record:', dbError);
                        // Continue anyway - user can still select rank
                    }

                    // Assign verified role (with error handling)
                    try {
                        if (interaction.guild && BOT_CONFIG.ROLE_VERIFIED_ID) {
                            const member = await interaction.guild.members.fetch(interaction.user.id);
                            await member.roles.add(BOT_CONFIG.ROLE_VERIFIED_ID);
                            console.log(`✅ [Discord Bot] Verified role assigned to ${interaction.user.tag}`);
                        }
                    } catch (roleError) {
                        console.warn(`⚠️ [Discord Bot] Could not assign verified role:`, roleError instanceof Error ? roleError.message : String(roleError));
                        // Continue anyway - user can still select rank
                    }

                    // Show rank selection menu (optional)
                    const ranks = Object.keys(RANK_DIVISIONS);
                    const rankSelectMenu = new ActionRowBuilder<StringSelectMenuBuilder>()
                        .addComponents(
                            new StringSelectMenuBuilder()
                                .setCustomId(`rankSelect_${interaction.user.id}`)
                                .setPlaceholder('Select your MLBB rank (optional)...')
                                .addOptions(
                                    ranks.map(rank => ({
                                        label: rank,
                                        value: rank,
                                        emoji: RANK_EMOJIS[rank] || '⭐'
                                    }))
                                )
                        );

                    const rankPrompt = new EmbedBuilder()
                        .setTitle('⭐ Select Your MLBB Rank (Optional)')
                        .setColor('#FFA500')
                        .setDescription('Your account has been verified! Optionally select your current MLBB rank. You can always update it later with /rank.')
                        .addFields(
                            { name: 'Game ID', value: gameId, inline: true },
                            { name: 'Player Name', value: playerName, inline: true }
                        )
                        .setFooter({ text: 'IPEORG MLBB Bot' });

                    await interaction.editReply({
                        embeds: [rankPrompt],
                        components: [rankSelectMenu]
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
