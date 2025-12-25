import {
    Client,
    GatewayIntentBits,
    Partials,
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    REST,
    Routes,
    ChannelType,
    ModalBuilder,
    TextInputBuilder,
    TextInputStyle,
    SelectMenuBuilder,
    StringSelectMenuBuilder,
} from "discord.js";
import axios from "axios";

// --- CONFIGURATION ---
const CONFIG = {
    BOT_TOKEN: "",
    CLIENT_ID: "1451482666271772754",
    GUILD_ID: "1439165596725022753",

    // Channels
    CHANNEL_VERIFY_ID: "1439165986564477038",
    CHANNEL_ADMIN_DASHBOARD_ID: "1451840744703787008",

    // Roles
    ROLE_VERIFIED_ID: "1451490702348259409",

    // Admin user
    ADMIN_USER_ID: "1130709463721050142",

    // MLBB Servers
    MLBB_SERVERS: ["SERVER ID"],
};

// MLBB Rank Configuration
const MLBB_RANKS = {
    Warrior: ["Warrior III", "Warrior II", "Warrior I"],
    Elite: ["Elite IV", "Elite III", "Elite II", "Elite I"],
    Master: ["Master IV", "Master III", "Master II", "Master I"],
    Grandmaster: ["Grandmaster V", "Grandmaster IV", "Grandmaster III", "Grandmaster II", "Grandmaster I"],
    Epic: ["Epic V", "Epic IV", "Epic III", "Epic II", "Epic I"],
    Legend: ["Legend V", "Legend IV", "Legend III", "Legend II", "Legend I"],
    Mythic: ["Mythic (0-24 stars)"],
    "Mythic Honor": ["Mythic Honor (25 stars)"],
    "Mythic Glory": ["Mythic Glory (50 stars)"],
    "Mythic Immortal": ["Mythic Immortal (100 stars)"],
};

// --- CLIENT SETUP ---
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.DirectMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers,
    ],
    partials: [Partials.Channel],
});

// --- COMMANDS ---
const commands = [
    {
        name: "verify",
        description: "Verify your Mobile Legends account",
    },
];

const rest = new REST({ version: "10" }).setToken(CONFIG.BOT_TOKEN);

async function registerCommands() {
    try {
        console.log("🔄 Registering commands...");
        await rest.put(
            Routes.applicationGuildCommands(CONFIG.CLIENT_ID, CONFIG.GUILD_ID),
            { body: commands },
        );
        console.log("✅ Commands registered");
    } catch (error) {
        console.error("❌ Error registering commands:", error);
    }
}

// MLBB Verification Function using moogold.com
async function verifyMLBBAccount(gameId, serverId) {
    try {
        const data = await axios.post(
            "https://moogold.com/wp-content/plugins/id-validation-new/id-validation-ajax.php",
            new URLSearchParams({
                attribute_amount: "Weekly Pass",
                "text-5f6f144f8ffee": gameId,
                "text-1601115253775": serverId,
                quantity: 1,
                "add-to-cart": 15145,
                product_id: 15145,
                variation_id: 4690783,
            }),
            {
                headers: {
                    Referer: "https://moogold.com/product/mobile-legends/",
                    Origin: "https://moogold.com",
                },
            },
        );

        const { message } = data.data;
        if (!message) throw new Error("Invalid ID or Server");

        // Parse response
        const lines = message.split("\n");
        const result = {};
        lines.forEach((line) => {
            const [key, value] = line.split(":");
            if (key && value) {
                result[key.trim().toLowerCase().replace(/ /g, "-")] =
                    value.trim();
            }
        });

        return result;
    } catch (error) {
        throw new Error("Verification failed: " + error.message);
    }
}

// --- EVENTS ---

client.once("ready", async () => {
    console.log(`✅ Bot logged in as ${client.user.tag}`);
    await registerCommands();
});

// Interaction Handler
client.on("interactionCreate", async (interaction) => {
    try {
        // Handle /verify command
        if (
            interaction.isChatInputCommand() &&
            interaction.commandName === "verify"
        ) {
            console.log(`📝 /verify command from ${interaction.user.tag}`);

            // Check if command is in allowed channel
            const isAllowedChannel =
                interaction.channelId === CONFIG.CHANNEL_VERIFY_ID ||
                !interaction.guild;
            if (!isAllowedChannel) {
                return await interaction.reply({
                    content: `❌ This command can only be used in <#${CONFIG.CHANNEL_VERIFY_ID}>`,
                    ephemeral: true,
                });
            }

            // Show modal with Game ID, Server, Rank, and Division
            const gameIdRow = new ActionRowBuilder().addComponents(
                new TextInputBuilder()
                    .setCustomId("gameIdInput")
                    .setLabel("Game ID (9-10 digits)")
                    .setStyle(TextInputStyle.Short)
                    .setRequired(true)
            );

            const serverRow = new ActionRowBuilder().addComponents(
                new TextInputBuilder()
                    .setCustomId("serverInput")
                    .setLabel("Server ID")
                    .setPlaceholder("e.g., 2083")
                    .setStyle(TextInputStyle.Short)
                    .setRequired(true)
            );

            const rankRow = new ActionRowBuilder().addComponents(
                new TextInputBuilder()
                    .setCustomId("rankInput")
                    .setLabel("Rank")
                    .setPlaceholder("Warrior, Elite, Master, Grandmaster, Epic, Legend, Mythic")
                    .setStyle(TextInputStyle.Short)
                    .setRequired(true)
            );

            const divisionRow = new ActionRowBuilder().addComponents(
                new TextInputBuilder()
                    .setCustomId("divisionInput")
                    .setLabel("Division")
                    .setPlaceholder("e.g., Elite III, Master I, Mythic (50 stars)")
                    .setStyle(TextInputStyle.Short)
                    .setRequired(true)
            );

            const modal = new ModalBuilder()
                .setCustomId("mlbbVerifyModal")
                .setTitle("Mobile Legends Verification")
                .addComponents(gameIdRow, serverRow, rankRow, divisionRow);

            await interaction.showModal(modal);
        }

        // Handle modal submission - All fields
        if (
            interaction.isModalSubmit() &&
            interaction.customId === "mlbbVerifyModal"
        ) {
            console.log(`📋 Modal submitted by ${interaction.user.tag}`);

            const gameId = interaction.fields.getTextInputValue("gameIdInput");
            const serverId =
                interaction.fields.getTextInputValue("serverInput");
            const selectedRank = interaction.fields.getTextInputValue("rankInput");
            const selectedDivision = interaction.fields.getTextInputValue("divisionInput");

            // Defer reply as verification might take time
            await interaction.deferReply({ ephemeral: true });

            try {
                // Verify account
                console.log(
                    `🔍 Verifying Game ID: ${gameId}, Server: ${serverId}`,
                );
                const playerData = await verifyMLBBAccount(gameId, serverId);

                const playerName = playerData["player-name"] || "Unknown";
                const playerLevel = playerData["level"] || "?";
                const playerRegion = playerData["region"] || serverId;

                console.log(`✅ Account verified: ${playerName}`);

                // Create verification embed
                const verificationEmbed = new EmbedBuilder()
                    .setTitle("✅ Verification Complete")
                    .setColor("Green")
                    .setThumbnail(interaction.user.displayAvatarURL())
                    .addFields(
                        {
                            name: "User",
                            value: `${interaction.user.tag}`,
                            inline: true,
                        },
                        { name: "Game ID", value: gameId, inline: true },
                        { name: "Server", value: serverId, inline: true },
                        {
                            name: "Player Name",
                            value: playerName,
                            inline: true,
                        },
                        { name: "Level", value: playerLevel, inline: true },
                        { name: "Rank", value: selectedDivision, inline: true },
                        {
                            name: "Timestamp",
                            value: new Date().toLocaleString(),
                            inline: false,
                        },
                    )
                    .setFooter({
                        text: `Verified automatically via moogold.com`,
                    });

                // 1. Send DM congratulation
                try {
                    await interaction.user.send({
                        embeds: [verificationEmbed],
                        content: `✅ **Congratulations!**\n\nYour Mobile Legends account **${playerName}** (Level ${playerLevel}, ${playerRegion}) has been verified with rank **${selectedDivision}**!\n\nYou now have access to all server channels. Welcome to IPEORG! 🎮`,
                    });
                } catch (e) {
                    console.error("Failed to send DM:", e.message);
                }

                // 2. Send admin transcript
                const guild = interaction.guild;
                const adminChannel = guild
                    ? guild.channels.cache.get(
                          CONFIG.CHANNEL_ADMIN_DASHBOARD_ID,
                      )
                    : null;

                if (adminChannel) {
                    const adminEmbed = new EmbedBuilder()
                        .setTitle("✅ New Verification")
                        .setColor("Green")
                        .addFields(
                            {
                                name: "User",
                                value: `<@${interaction.user.id}>`,
                                inline: true,
                            },
                            {
                                name: "Discord Tag",
                                value: interaction.user.tag,
                                inline: true,
                            },
                            { name: "Game ID", value: gameId, inline: true },
                            { name: "Server", value: serverId, inline: true },
                            {
                                name: "Player Name",
                                value: playerName,
                                inline: true,
                            },
                            { name: "Level", value: playerLevel, inline: true },
                            {
                                name: "Rank",
                                value: selectedDivision,
                                inline: true,
                            },
                            {
                                name: "Timestamp",
                                value: new Date().toLocaleString(),
                                inline: false,
                            },
                        )
                        .setFooter({
                            text: `Verified automatically via moogold.com`,
                        });

                    await adminChannel.send({ embeds: [adminEmbed] });
                    console.log(`📤 Admin transcript sent`);
                }

                // 3. Assign verified role
                if (guild) {
                    try {
                        const member = await guild.members.fetch(
                            interaction.user.id,
                        );
                        await member.roles.add(CONFIG.ROLE_VERIFIED_ID);
                        console.log(
                            `✅ Verified role assigned to ${interaction.user.tag}`,
                        );
                    } catch (e) {
                        console.error("Failed to assign role:", e.message);
                    }
                }

                // 4. Reply to user with final message
                await interaction.followUp({
                    embeds: [verificationEmbed],
                    content: `✅ **Verification Successful!**\n\n✓ Player: **${playerName}**\n✓ Rank: **${selectedDivision}**\n✓ Check your DMs for confirmation\n✓ Verified role has been assigned\n✓ Enjoy full server access! 🎮`,
                    ephemeral: true,
                });
            } catch (error) {
                console.error(`❌ Verification failed:`, error.message);
                await interaction.followUp({
                    content: `❌ **Verification Failed**\n\n${error.message}\n\nPlease make sure your Game ID and Server are correct.`,
                    ephemeral: true,
                });
            }
        }
    } catch (error) {
        console.error(`❌ Error:`, error);
        try {
            if (
                interaction.isRepliable() &&
                !interaction.replied &&
                !interaction.deferred
            ) {
                await interaction.reply({
                    content: "❌ An error occurred. Please try again.",
                    ephemeral: true,
                });
            }
        } catch (e) {
            console.error("Failed to reply:", e.message);
        }
    }
});

// Login
client.login(CONFIG.BOT_TOKEN);
console.log("🚀 Bot starting...");
