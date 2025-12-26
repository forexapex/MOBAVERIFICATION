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
  getUserRank,
  ROLE_MAP,
  RANK_ROLE_IDS,
  RANK_DIVISIONS,
  RANK_EMOJIS,
} from "./lib/rankManagement.ts";
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
const COOLDOWN_DURATION = 3600 * 1000; // 1 hour in milliseconds

// Available character images - 135+ MLBB characters
    const CHARACTER_IMAGES = [
        'https://raw.githubusercontent.com/forexapex/MOBAVERIFICATION/main/Skin%20PNG/Akai%20Imperial%20Assassin.png',
        'https://raw.githubusercontent.com/forexapex/MOBAVERIFICATION/main/Skin%20PNG/Akai5234523.png',
        'https://raw.githubusercontent.com/forexapex/MOBAVERIFICATION/main/Skin%20PNG/Aldous%20Blazing%20Force.png',
        'https://raw.githubusercontent.com/forexapex/MOBAVERIFICATION/main/Skin%20PNG/Aldous%20Deathh.png',
        'https://raw.githubusercontent.com/forexapex/MOBAVERIFICATION/main/Skin%20PNG/Aldous%20King%20Of%20Supremacy.png',
        'https://raw.githubusercontent.com/forexapex/MOBAVERIFICATION/main/Skin%20PNG/Aldous%20Red%20Mantle.png',
        'https://raw.githubusercontent.com/forexapex/MOBAVERIFICATION/main/Skin%20PNG/Aldous%20The%20Insentient.png',
        'https://raw.githubusercontent.com/forexapex/MOBAVERIFICATION/main/Skin%20PNG/Aldouss.png',
        'https://raw.githubusercontent.com/forexapex/MOBAVERIFICATION/main/Skin%20PNG/Alice%20Classic.png',
        'https://raw.githubusercontent.com/forexapex/MOBAVERIFICATION/main/Skin%20PNG/Alice%20Divine%20Owl.png',
        'https://raw.githubusercontent.com/forexapex/MOBAVERIFICATION/main/Skin%20PNG/Alice%20Steam%20Glinder.png',
        'https://raw.githubusercontent.com/forexapex/MOBAVERIFICATION/main/Skin%20PNG/Alice%20Wizardy%20Teacher.png',
        'https://raw.githubusercontent.com/forexapex/MOBAVERIFICATION/main/Skin%20PNG/Alice4325.png',
        'https://raw.githubusercontent.com/forexapex/MOBAVERIFICATION/main/Skin%20PNG/Alucard%20Fiery%20Inferno.png',
        'https://raw.githubusercontent.com/forexapex/MOBAVERIFICATION/main/Skin%20PNG/Alucard%20Lightborn%20Striker.png',
        'https://raw.githubusercontent.com/forexapex/MOBAVERIFICATION/main/Skin%20PNG/Alucard%20Lone%20Hero.png',
        'https://raw.githubusercontent.com/forexapex/MOBAVERIFICATION/main/Skin%20PNG/Alucard%20Romantic%20Fantasy.png',
        'https://raw.githubusercontent.com/forexapex/MOBAVERIFICATION/main/Skin%20PNG/Alucard%20Viscount%20.png',
        'https://raw.githubusercontent.com/forexapex/MOBAVERIFICATION/main/Skin%20PNG/Alucard3294.png',
        'https://raw.githubusercontent.com/forexapex/MOBAVERIFICATION/main/Skin%20PNG/Angela%20Shanghai%20Maiden.png',
        'https://raw.githubusercontent.com/forexapex/MOBAVERIFICATION/main/Skin%20PNG/Angela%20Special.png',
        'https://raw.githubusercontent.com/forexapex/MOBAVERIFICATION/main/Skin%20PNG/Angela%20Summer%20Vibes.png',
        'https://raw.githubusercontent.com/forexapex/MOBAVERIFICATION/main/Skin%20PNG/Angela%20V.E.N.O.M%20Vespid.png',
        'https://raw.githubusercontent.com/forexapex/MOBAVERIFICATION/main/Skin%20PNG/Angela3425.png',
        'https://raw.githubusercontent.com/forexapex/MOBAVERIFICATION/main/Skin%20PNG/Angela4325.png',
        'https://raw.githubusercontent.com/forexapex/MOBAVERIFICATION/main/Skin%20PNG/Argus%20Catastrope.png',
        'https://raw.githubusercontent.com/forexapex/MOBAVERIFICATION/main/Skin%20PNG/Argus%20Dark%20Draconic.png',
        'https://raw.githubusercontent.com/forexapex/MOBAVERIFICATION/main/Skin%20PNG/Argus%20Light%20of%20Dawn.png',
        'https://raw.githubusercontent.com/forexapex/MOBAVERIFICATION/main/Skin%20PNG/Atlas32499.png',
        'https://raw.githubusercontent.com/forexapex/MOBAVERIFICATION/main/Skin%20PNG/Auroraa.png',
        'https://raw.githubusercontent.com/forexapex/MOBAVERIFICATION/main/Skin%20PNG/Badang%20Fist%20of%20Zen.png',
        'https://raw.githubusercontent.com/forexapex/MOBAVERIFICATION/main/Skin%20PNG/Badang%20Ironfists.png',
        'https://raw.githubusercontent.com/forexapex/MOBAVERIFICATION/main/Skin%20PNG/Badang%20Leo%20Edited.png',
        'https://raw.githubusercontent.com/forexapex/MOBAVERIFICATION/main/Skin%20PNG/Badang%20Leo.png',
        'https://raw.githubusercontent.com/forexapex/MOBAVERIFICATION/main/Skin%20PNG/Badang%20Susanoo.png',
        'https://raw.githubusercontent.com/forexapex/MOBAVERIFICATION/main/Skin%20PNG/Balmond%20Ghoul\'s%20Fury.png',
        'https://raw.githubusercontent.com/forexapex/MOBAVERIFICATION/main/Skin%20PNG/Balmond%20Pointguard.png',
        'https://raw.githubusercontent.com/forexapex/MOBAVERIFICATION/main/Skin%20PNG/Balmond%20Savage%20Hunter.png',
        'https://raw.githubusercontent.com/forexapex/MOBAVERIFICATION/main/Skin%20PNG/Bane%20Count%20Dracula.png',
        'https://raw.githubusercontent.com/forexapex/MOBAVERIFICATION/main/Skin%20PNG/X%20Borg%20Grafity%20Fashion.png',
        'https://raw.githubusercontent.com/forexapex/MOBAVERIFICATION/main/Skin%20PNG/Xborg283458.png',
        'https://raw.githubusercontent.com/forexapex/MOBAVERIFICATION/main/Skin%20PNG/Xborg93428.png',
        'https://raw.githubusercontent.com/forexapex/MOBAVERIFICATION/main/Skin%20PNG/Yena%20Mercenary.png',
        'https://raw.githubusercontent.com/forexapex/MOBAVERIFICATION/main/Skin%20PNG/Yi%20Sun%20Shin.png',
        'https://raw.githubusercontent.com/forexapex/MOBAVERIFICATION/main/Skin%20PNG/Yi%20Sun-shin%20%20Roguish%20Ranger.png',
        'https://raw.githubusercontent.com/forexapex/MOBAVERIFICATION/main/Skin%20PNG/Yi%20Sun-shin%20Apocalypse%20Agent.png',
        'https://raw.githubusercontent.com/forexapex/MOBAVERIFICATION/main/Skin%20PNG/Yi%20Sun-shin%20v3.png',
        'https://raw.githubusercontent.com/forexapex/MOBAVERIFICATION/main/Skin%20PNG/Yisun%2023485283.png',
        'https://raw.githubusercontent.com/forexapex/MOBAVERIFICATION/main/Skin%20PNG/Yisun48785432.png',
        'https://raw.githubusercontent.com/forexapex/MOBAVERIFICATION/main/Skin%20PNG/Yu%20Zhong%20Biohazard%20Edited.png',
        'https://raw.githubusercontent.com/forexapex/MOBAVERIFICATION/main/Skin%20PNG/Yu%20Zhong%20Biohazard%20Orj.png',
        'https://raw.githubusercontent.com/forexapex/MOBAVERIFICATION/main/Skin%20PNG/Yu%20Zhong.png',
        'https://raw.githubusercontent.com/forexapex/MOBAVERIFICATION/main/Skin%20PNG/YuZhong%20PNG.png',
        'https://raw.githubusercontent.com/forexapex/MOBAVERIFICATION/main/Skin%20PNG/Yve%20Edited%204k%20PNG.png',
        'https://raw.githubusercontent.com/forexapex/MOBAVERIFICATION/main/Skin%20PNG/Yve%20Orj%204k%20PNG.png',
        'https://raw.githubusercontent.com/forexapex/MOBAVERIFICATION/main/Skin%20PNG/Zhask%20Bone%20Flamen.png',
        'https://raw.githubusercontent.com/forexapex/MOBAVERIFICATION/main/Skin%20PNG/Zhask%20Cancer.png',
        'https://raw.githubusercontent.com/forexapex/MOBAVERIFICATION/main/Skin%20PNG/Zhask%20Crystallized%20Predator.png',
        'https://raw.githubusercontent.com/forexapex/MOBAVERIFICATION/main/Skin%20PNG/Zhask%20Extraterretial.png',
        'https://raw.githubusercontent.com/forexapex/MOBAVERIFICATION/main/Skin%20PNG/Zhask%20Transparent.png',
        'https://raw.githubusercontent.com/forexapex/MOBAVERIFICATION/main/Skin%20PNG/Zhask.png',
        'https://raw.githubusercontent.com/forexapex/MOBAVERIFICATION/main/Skin%20PNG/Zilong%20Changbanpo%20Commander.png',
        'https://raw.githubusercontent.com/forexapex/MOBAVERIFICATION/main/Skin%20PNG/Zilong%20Class.png',
        'https://raw.githubusercontent.com/forexapex/MOBAVERIFICATION/main/Skin%20PNG/Zilong%20Easten%20Warrior.png',
        'https://raw.githubusercontent.com/forexapex/MOBAVERIFICATION/main/Skin%20PNG/Zilong%20Elite%20Warrior.png',
        'https://raw.githubusercontent.com/forexapex/MOBAVERIFICATION/main/Skin%20PNG/Zilong%20Glorious%20Genera2l.png',
        'https://raw.githubusercontent.com/forexapex/MOBAVERIFICATION/main/Skin%20PNG/Zilong%20Glorious%20General.png',
        'https://raw.githubusercontent.com/forexapex/MOBAVERIFICATION/main/Skin%20PNG/Zilong%20Shining%20Knight.png',
        'https://raw.githubusercontent.com/forexapex/MOBAVERIFICATION/main/Skin%20PNG/balmond325432.png',
        'https://raw.githubusercontent.com/forexapex/MOBAVERIFICATION/main/Skin%20PNG/clintpngg.png',
        'https://raw.githubusercontent.com/forexapex/MOBAVERIFICATION/main/Skin%20PNG/de5sewv-f1790c8b-7b7b-4fa4-8891-625f97462e11.png',
        'https://raw.githubusercontent.com/forexapex/MOBAVERIFICATION/main/Skin%20PNG/gusion%20venom%20skin%20transparant.png',
        'https://raw.githubusercontent.com/forexapex/MOBAVERIFICATION/main/Skin%20PNG/harley23544.png',
        'https://raw.githubusercontent.com/forexapex/MOBAVERIFICATION/main/Skin%20PNG/harley324.png',
        'https://raw.githubusercontent.com/forexapex/MOBAVERIFICATION/main/Skin%20PNG/helcurt342525.png',
        'https://raw.githubusercontent.com/forexapex/MOBAVERIFICATION/main/Skin%20PNG/silvana___pure_heroin_png_by_dechunf_de6wpyj-fullview.png',
        'https://raw.githubusercontent.com/forexapex/MOBAVERIFICATION/main/Skin%20PNG/skin_hayabusa_epic_mlbb_png_by_dechunf_ddrax87-pre.png'
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
    // Read token fresh from environment (in case it was loaded after server start)
    const token = process.env.DISCORD_BOT_TOKEN || BOT_CONFIG.BOT_TOKEN;
    console.log('[Discord Bot] Token check:', token ? 'Token found ✓' : 'No token (will skip)');
    if (!token) {
        console.warn('⚠️ [Discord Bot] Bot token not configured. Skipping bot startup.');
        return;
    }

    const commands = [
        { name: 'verify', description: 'Verify your Mobile Legends account with Game ID and Server ID' },
        { name: 'unverify', description: 'Remove a user\'s verification data (Admin Only)' },
        { name: 'rank', description: 'Update your MLBB rank - Select from Warrior to Mythical Glory' },
        { name: 'profile', description: 'View your verified MLBB profile and rank details' },
        { name: 'help', description: 'Get help - View all available bot commands' },
        { name: 'unverify', description: 'Remove verification data (Admin Only)', options: [{
            name: 'user',
            type: 6, // USER type
            description: 'The user to unverify',
            required: true
        }] },
        { name: 'stats', description: 'View your performance statistics with radar chart (Admin Only)' }
    ];
    const rest = new REST({ version: '10' }).setToken(token);

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
            try {
                // Try guild-specific commands first
                await rest.put(
                    Routes.applicationGuildCommands(BOT_CONFIG.CLIENT_ID, BOT_CONFIG.GUILD_ID),
                    { body: commands },
                );
                console.log('✅ [Discord Bot] Commands registered (guild-specific)');
            } catch (guildError: any) {
                // If guild registration fails (permissions), try global commands
                if (guildError.code === 50001) {
                    console.log('⚠️ [Discord Bot] Guild command registration failed, trying global commands...');
                    await rest.put(
                        Routes.applicationCommands(BOT_CONFIG.CLIENT_ID),
                        { body: commands },
                    );
                    console.log('✅ [Discord Bot] Commands registered (globally)');
                } else {
                    throw guildError;
                }
            }
        } catch (error) {
            console.warn('⚠️ [Discord Bot] Command registration skipped - commands may not be available');
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
                division,
                profile.playerName // Preserve existing player name from database
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
                .addFields(
                    { name: '🎮 Game ID', value: profile.mlbbId, inline: false },
                    { name: '🌐 Server', value: profile.serverId, inline: false },
                    { name: '👤 Player Name', value: profile.playerName || 'PRIMOIXI', inline: false },
                    { name: '⭐ Rank Selected', value: rankDisplay, inline: false }
                )
                .setFooter({ text: 'Verified automatically via IPEORG' })
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
                        { name: 'Player Name', value: profile.playerName || 'N/A', inline: true },
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
                            .setDescription(`Choose your current division for ${selectedRank}`)
                            .setFooter({ text: 'Verified automatically via IPEORG' });

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
                        .setFooter({ text: 'Verified automatically via IPEORG' });
                    
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
                        selectedDivision,
                        userRecord[0]?.playerName ?? undefined // Preserve stored player name
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
                        .setFooter({ text: 'Verified automatically via IPEORG' });
                    
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

                    // Update the record with the selected rank first, so it's available for division selection
                    await updateUserRank(
                        interaction.user.id,
                        guildId || profile.guildId,
                        profile.mlbbId,
                        profile.serverId,
                        selectedRank,
                        0,
                        0,
                        undefined,
                        profile.playerName || 'PRIMOIXI'
                    );

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
                            .setDescription(`Choose your division within ${selectedRank}`)
                            .setFooter({ text: 'Verified automatically via IPEORG' });

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
                            .setFooter({ text: 'Verified automatically via IPEORG' })
                            .setTimestamp();
                        
                        return await interaction.reply({
                            embeds: [embed],
                            flags: ['Ephemeral']
                        });
                    }
                    
                    const profile = userRecord[0];
                    const rankDisplay = profile.division ? `${profile.currentRank} ${profile.division}` : (profile.currentRank || 'Unranked');
                    
                    // Show profile text embed first
                    const profileEmbed = new EmbedBuilder()
                        .setTitle(`📱 ${profile.playerName || 'MLBB Profile'}`)
                        .setColor('#00D4FF')
                        .addFields(
                            { name: '🎮 Game ID', value: profile.mlbbId, inline: true },
                            { name: '🌐 Server', value: profile.serverId, inline: true },
                            { name: '⭐ Rank', value: rankDisplay, inline: true },
                            { name: '✅ Status', value: 'Verified', inline: true }
                        )
                        .setFooter({ text: 'Verified automatically via IPEORG' })
                        .setTimestamp();
                    
                    // Generate the account details card image for visual display
                    const characterImagePath = getRandomCharacterImage();
                    const cardImage = await generateAccountDetailsCard(characterImagePath, {
                        gameId: profile.mlbbId,
                        server: profile.serverId,
                        gameName: profile.playerName || 'Verified Player',
                        region: profile.serverId,
                        rank: profile.currentRank || 'Unranked',
                        level: 'Available',
                        status: 'Verified'
                    });
                    
                    // Send text embed first, then image
                    await interaction.reply({
                        embeds: [profileEmbed],
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
                        .setFooter({ text: 'Verified automatically via IPEORG' });
                    
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
                        { name: '📊 /stats', value: 'View your performance statistics with radar chart (Admin Only)', inline: false },
                        { name: '🗑️ /unverify', value: 'Remove a user\'s verification data (Admin Only)\nUsage: `/unverify user:@user`', inline: false },
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

            if (interaction.isChatInputCommand() && interaction.commandName === 'unverify') {
                console.log(`🗑️ [Discord Bot] /unverify command from ${interaction.user.tag}`);
                
                // Admin only restriction
                if (interaction.memberPermissions && !interaction.memberPermissions.has('Administrator')) {
                    return await interaction.reply({
                        content: '❌ This command is restricted to **Administrators** only.',
                        flags: ['Ephemeral']
                    });
                }

                const targetUser = interaction.options.getUser('user');
                if (!targetUser) {
                    return await interaction.reply({
                        content: '❌ Please specify a user to unverify.',
                        flags: ['Ephemeral']
                    });
                }

                await interaction.deferReply({ flags: ['Ephemeral'] });

                try {
                    const userRecord = await db.select().from(userRanks).where(eq(userRanks.userId, targetUser.id));
                    
                    if (userRecord.length === 0) {
                        return await interaction.editReply(`❌ User <@${targetUser.id}> is not verified.`);
                    }

                    await db.delete(userRanks).where(eq(userRanks.userId, targetUser.id));
                    
                    // Remove verified role if in guild
                    if (interaction.guild) {
                        try {
                            const member = await interaction.guild.members.fetch(targetUser.id);
                            if (member) {
                                await member.roles.remove(BOT_CONFIG.ROLE_VERIFIED_ID);
                            }
                        } catch (roleError) {
                            console.error('[Discord Bot] Error removing role:', roleError);
                        }
                    }

                    await interaction.editReply(`✅ Successfully unverified <@${targetUser.id}> and removed their data.`);
                } catch (error) {
                    console.error('[Discord Bot] Unverify Error:', error);
                    await interaction.editReply('❌ Failed to unverify user.');
                }
            }

            if (interaction.isChatInputCommand() && interaction.commandName === 'stats') {
                console.log(`📊 [Discord Bot] /stats command from ${interaction.user.tag}`);
                
                // Admin only restriction
                if (interaction.memberPermissions && !interaction.memberPermissions.has('Administrator')) {
                    return await interaction.reply({
                        content: '❌ This command is restricted to **Administrators** only.',
                        flags: ['Ephemeral']
                    });
                }

                await interaction.deferReply();
                try {
                    const userRecord = await getUserRank(interaction.user.id);
                    if (!userRecord) {
                        return interaction.editReply('❌ You are not verified. Use `/verify` first.');
                    }
                    
                    // Generate random stats if not present or older than 7 days
                    let playerStats;
                    const sevenDaysAgo = new Date();
                    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
                    
                    if (!userRecord.stats || !userRecord.lastStatsUpdate || userRecord.lastStatsUpdate < sevenDaysAgo) {
                        playerStats = [
                            { stat: "Push", score: Math.floor(Math.random() * 40) + 60 },
                            { stat: "Damage", score: Math.floor(Math.random() * 40) + 60 },
                            { stat: "KDA", score: Math.floor(Math.random() * 40) + 60 },
                            { stat: "Survival", score: Math.floor(Math.random() * 40) + 60 },
                            { stat: "Farm", score: Math.floor(Math.random() * 40) + 60 },
                            { stat: "Team Fight", score: Math.floor(Math.random() * 40) + 60 },
                        ];
                        await updateUserRank(
                            userRecord.userId,
                            userRecord.guildId,
                            userRecord.mlbbId,
                            userRecord.serverId,
                            userRecord.currentRank || 'Warrior',
                            userRecord.stars || 0,
                            userRecord.points || 0,
                            userRecord.division || undefined,
                            userRecord.playerName || undefined
                        );
                        // Update stats specifically
                        await db.update(userRanks)
                            .set({ 
                                stats: JSON.stringify(playerStats),
                                lastStatsUpdate: new Date()
                            })
                            .where(eq(userRanks.userId, userRecord.userId));
                    } else {
                        playerStats = JSON.parse(userRecord.stats);
                    }
                    
                    const characterImage = `https://raw.githubusercontent.com/forexapex/MOBAVERIFICATION/main/Skin%20PNG/${encodeURIComponent(userRecord.playerName || 'Generic')}.png`;
                    
                    const cardImage = await generateAccountDetailsCard(characterImage, {
                        gameId: userRecord.mlbbId,
                        server: userRecord.serverId,
                        gameName: userRecord.playerName || interaction.user.username,
                        region: userRecord.serverId,
                        rank: `${userRecord.currentRank} ${userRecord.division || ''}`,
                        level: 'Active',
                        status: 'Verified',
                        performanceScores: playerStats
                    });

                    await interaction.editReply({
                        files: [{
                            attachment: cardImage,
                            name: 'stats.png'
                        }]
                    });
                } catch (error) {
                    console.error('[Discord Bot] Stats Error:', error);
                    await interaction.editReply('❌ Failed to fetch statistics.');
                }
            }

            if (interaction.isChatInputCommand() && interaction.commandName === 'verify') {
                console.log(`📝 [Discord Bot] /verify command from ${interaction.user.tag}`);
                
                // Check cooldown
                const cooldownKey = getCooldownKey(interaction.user.id, 'verify');
                const remainingCooldown = getRemainingCooldown(cooldownKey);
                
                if (remainingCooldown) {
                    const minutes = Math.ceil(remainingCooldown / 60000);
                    const hours = Math.floor(minutes / 60);
                    const remainingMins = minutes % 60;
                    
                    let cooldownMsg = `You can verify again in **${minutes}** minute${minutes > 1 ? 's' : ''}.`;
                    if (hours > 0) {
                        cooldownMsg = `You can verify again in **${hours}** hour${hours > 1 ? 's' : ''}${remainingMins > 0 ? ` and **${remainingMins}** minute${remainingMins > 1 ? 's' : ''}` : ''}.`;
                    }

                    const cooldownEmbed = new EmbedBuilder()
                        .setTitle('⏱️ Cooldown Active')
                        .setColor('Red')
                        .setDescription(cooldownMsg)
                        .setFooter({ text: 'Verified automatically via IPEORG' });
                    
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
                        .setFooter({ text: 'Verified automatically via IPEORG' });
                    
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
                    .setLabel('🎮 Game ID (8-10 digits)')
                    .setStyle(TextInputStyle.Short)
                    .setRequired(true)
                    .setPlaceholder('e.g., 123456789');

                const serverInput = new TextInputBuilder()
                    .setCustomId('serverInput')
                    .setLabel('🌐 Server ID')
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
                            .setFooter({ text: 'Verified automatically via IPEORG' });
                        
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
                            .setFooter({ text: 'Verified automatically via IPEORG' });
                        
                        return await interaction.editReply({
                            embeds: [errorEmbed]
                        });
                    }

                    // Create/Update initial record to prevent session expiration
                    await updateUserRank(
                        interaction.user.id,
                        guildId,
                        gameId,
                        serverId,
                        'Warrior', // Default initial rank
                        0,
                        0,
                        undefined,
                        'PRIMOIXI' // Default player name as requested
                    );

                    // Show rank selection BEFORE API call - collect all info first
                    const ranks = Object.keys(RANK_DIVISIONS);
                    const rankSelectMenu = new ActionRowBuilder<StringSelectMenuBuilder>()
                        .addComponents(
                            new StringSelectMenuBuilder()
                                .setCustomId(`rankSelect_${interaction.user.id}_${gameId}_${serverId}`)
                                .setPlaceholder('Select your MLBB rank...')
                                .addOptions(
                                    ranks.map(rank => ({
                                        label: rank,
                                        value: rank,
                                        emoji: RANK_EMOJIS[rank] || '⭐'
                                    }))
                                )
                        );

                    const selectionPrompt = new EmbedBuilder()
                        .setTitle('📋 Complete Your Verification')
                        .setColor('#00D4FF')
                        .setDescription('Your Game ID and Server have been validated. Now select your rank and division.')
                        .addFields(
                            { name: '🎮 Game ID', value: gameId, inline: true },
                            { name: '🌐 Server', value: serverId, inline: true },
                            { name: '⭐ Rank', value: 'Select below...', inline: false },
                            { name: '📊 Division', value: 'Will appear after rank selection', inline: false }
                        )
                        .setFooter({ text: 'Verified automatically via IPEORG' });

                    await interaction.editReply({
                        embeds: [selectionPrompt],
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
        await client.login(token);
        console.log('🚀 [Discord Bot] Bot started successfully!');
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
