# IPEORG MLBB Discord Bot & Dashboard

Advanced Discord automation platform for the IPEORG MLBB (Mobile Legends: Bang Bang) community. Featuring instant game account verification, automated role management, and comprehensive admin dashboard.

## 🎮 Features

### 🤖 Discord Bot
- **Instant Game Verification**: Direct Mobile Legends account verification via moogold.com API
- **Modal-based Interface**: User-friendly `/verify` command with Game ID and Server ID input
- **Automatic Role Assignment**: Verified role granted instantly upon successful verification
- **Admin Transcripts**: Complete audit logs of all verifications sent to admin channel
- **Direct Messages**: Verification confirmations sent via Discord DMs
- **Server ID Support**: Numeric server IDs (e.g., 20345) for accurate region verification
- **Real-time Player Data**: Displays player username, level, and region information

### 📊 Admin Dashboard
- **User Management**: View and manage verified users
- **Verification History**: Complete audit trail of all verification attempts
- **Role Management**: Control verified roles and permissions
- **Server Settings**: Customize bot behavior per server
- **Authentication**: Discord OAuth2 for secure admin access

### 🌐 Website
- **Professional Landing Page**: Modern hero section with feature highlights
- **How It Works Guide**: Step-by-step verification process explanation
- **Contact Page**: Multiple contact options (Discord, Email, Direct Message)
- **Privacy Policy**: Comprehensive data privacy information
- **Terms & Conditions**: Complete terms of service

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL database (or use in-memory storage)
- Discord Server with Administrator permissions
- Discord Bot Token from [Discord Developer Portal](https://discord.com/developers/applications)

### Environment Variables

```env
# Discord Bot
DISCORD_BOT_TOKEN=your_discord_bot_token
CLIENT_ID=your_discord_client_id
GUILD_ID=your_discord_server_id

# Channels
CHANNEL_VERIFY_ID=channel_id_for_verify_command
CHANNEL_ADMIN_DASHBOARD_ID=channel_id_for_admin_logs

# Roles
ROLE_VERIFIED_ID=verified_role_id

# Session
SESSION_SECRET=your_session_secret_key

# Database (optional)
DATABASE_URL=postgresql://user:password@host/dbname
```

### Installation

1. Clone the repository
```bash
git clone https://github.com/IPEORG/mlbb-bot.git
cd mlbb-bot
```

2. Install dependencies
```bash
npm install
```

3. Set up environment variables
```bash
cp .env.example .env
# Edit .env with your configuration
```

4. Run the development server
```bash
npm run dev
```

The application will start on port 5000:
- Frontend: http://localhost:5000
- API: http://localhost:5000/api
- Discord Bot: Connected to your configured server

## 📝 Commands

### `/verify`
Initiates the Mobile Legends account verification process (requires Game ID + Server ID).

**Usage**: Type `/verify` in the configured verification channel or DM

**Modal Fields**:
- Game ID: Your 9-10 digit Mobile Legends account ID (e.g., 123456789)
- Server ID: Your numeric server ID (e.g., 20345)

**Response**: 
- ✅ If valid: Role assigned, DM confirmation, admin transcript logged
- ❌ If invalid: Error message with troubleshooting tips

**Example DM Response**:
```
✅ Congratulations!

Verification Complete

📱 Account Details:
• Game ID: `123456789`
• Server: `20345`
• Nickname: PlayerName
• Level: Not Available
• Region: SEA
• Rank: Unranked

You now have access to all server channels. Welcome to IPEORG! 🎮
```

### `/rank`
Manually set your MLBB rank (since Moonton doesn't provide a public rank API).

**Usage**: Type `/rank` anywhere in the server

**How it works**:
- Select your current MLBB rank from dropdown
- Discord role is automatically assigned to match your rank
- Updates your rank in the system

**Available Ranks**:
- Warrior
- Elite
- Master
- Grandmaster
- Epic
- Legend
- Mythic
- Mythical Glory

**Why manual?** Since Moonton doesn't provide a public API for player ranks, users submit their own rank to get the correct Discord role. Mods can verify accuracy.

## 🏗️ Project Structure

```
.
├── client/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Home.tsx              # Landing page
│   │   │   ├── Contact.tsx           # Contact & FAQ
│   │   │   ├── Privacy.tsx           # Privacy policy
│   │   │   ├── Terms.tsx             # Terms & conditions
│   │   │   ├── Dashboard.tsx         # Admin dashboard
│   │   │   ├── Documentation.tsx     # API docs
│   │   │   ├── Login.tsx             # Discord OAuth
│   │   │   └── not-found.tsx         # 404 page
│   │   ├── components/
│   │   ├── lib/
│   │   └── App.tsx                   # Main app routing
│   ├── vite.config.ts
│   └── package.json
├── server/
│   ├── index.ts                      # Express server & Discord bot
│   ├── routes.ts                     # API endpoints
│   ├── storage.ts                    # Data persistence
│   ├── lib/
│   │   ├── validasi.ts               # MLBB verification library
│   │   └── util.ts                   # Utility functions
│   ├── schema.ts                     # Database schema
│   └── vite.ts                       # Vite setup
├── shared/
│   └── schema.ts                     # Shared TypeScript types
├── README.md
└── package.json
```

## 🔌 API Endpoints

### Verification
- `GET /api/mlbb/verify?id=123456789&serverid=20345` - Verify MLBB account

**Success Response**:
```json
{
  "status": "success",
  "result": {
    "gameId": "123456789",
    "serverId": "20345",
    "nickname": "PlayerName",
    "level": "45",
    "zone": "SEA",
    "country": "Philippines"
  }
}
```

**Error Response**:
```json
{
  "status": "failed",
  "message": "Invalid ID Player or Server ID"
}
```

### Authentication
- `GET /api/callback` - Discord OAuth callback
- `POST /api/logout` - Logout user
- `GET /api/user/guilds` - Get user guilds (admin only)

### Admin
- `GET /api/guilds/:guildId/verifications` - Get guild verifications
- `POST /api/verifications/:id/approve` - Approve verification
- `POST /api/verifications/:id/deny` - Deny verification

## 🔐 Security Features

- **Discord OAuth2**: Secure authentication for admin dashboard
- **Rate Limiting**: Protection against abuse and brute force
- **Data Encryption**: Secure transmission of sensitive information
- **Audit Logs**: Complete verification history for moderation
- **API Validation**: Zod schema validation for all requests
- **Input Validation**: Server ID format validation (numeric only)

## 🛠️ Tech Stack

### Frontend
- **React** 18+ with TypeScript
- **Vite** for fast development & building
- **Tailwind CSS** for styling
- **TanStack Query** for server state management
- **Framer Motion** for animations
- **shadcn/ui** for UI components
- **Wouter** for lightweight routing

### Backend
- **Express.js** for HTTP server
- **Discord.js** v14 for Discord integration
- **Drizzle ORM** for database access
- **Zod** for runtime validation
- **PostgreSQL/Neon** for data persistence
- **Axios** for HTTP requests

### Infrastructure
- **Node.js** runtime
- **Replit** for hosting
- **moogold.com API** for MLBB verification

## 📊 Database Schema

### Users Table
```sql
id          INT PRIMARY KEY
discord_id  BIGINT UNIQUE
username    VARCHAR
game_id     VARCHAR
server_id   VARCHAR
level       INT
verified    BOOLEAN
created_at  TIMESTAMP
updated_at  TIMESTAMP
```

### Verification Logs Table
```sql
id          INT PRIMARY KEY
user_id     INT FOREIGN KEY
status      VARCHAR ('pending', 'verified', 'failed')
game_id     VARCHAR
server_id   VARCHAR
error       TEXT
created_at  TIMESTAMP
```

## 🎯 Feature Roadmap - What You Can Add

### 1. **User Profiles**
   - Personal verification history
   - Account statistics (games played, wins, etc.)
   - Badge/achievement system for verified users
   - Profile customization options

### 2. **Advanced Analytics Dashboard**
   - Verification statistics and trends
   - Server-wide player level distribution
   - Top verified players leaderboard
   - Real-time verification metrics

### 3. **Automated Role Management**
   - Multiple verification tiers (Verified, Diamond, Legend, etc.)
   - Auto-demote users if they drop levels
   - Role-based channel access
   - Custom role assignments per region

### 4. **Notification System**
   - Discord notifications for milestone achievements
   - Weekly/monthly leaderboard updates
   - New member verification alerts
   - Admin moderation notifications

### 5. **API Documentation Portal**
   - Interactive API explorer
   - Code examples in multiple languages
   - Webhook support for external integrations
   - Rate limit documentation

### 6. **Anti-Fraud System**
   - Duplicate account detection
   - Suspicious activity alerts
   - Account linking restrictions
   - Manual review queue for edge cases

### 7. **Community Features**
   - Clan/team creation and management
   - Team verification (verify all members)
   - Community events and tournaments
   - Team statistics and rankings

### 8. **Integration Features**
   - Streaming notifications (Twitch/YouTube)
   - Match result auto-logging
   - Stat sync with MLBB API
   - External tournament support

### 9. **Moderation Tools**
   - Custom warning system
   - Temporary/permanent bans
   - Appeal process for rejected verifications
   - Verification recheck mechanism

### 10. **Mobile App**
   - iOS/Android app for verification
   - Push notifications
   - Quick access to player stats
   - Native platform integration

### 11. **Multi-Language Support**
   - Bot responses in multiple languages
   - Regional language preferences
   - Localized UI

### 12. **Economy System**
   - In-server currency for verified players
   - Shop for cosmetics/perks
   - Reward system for participation
   - Points-based achievements

## ⚠️ Known Issues & Limitations

### 1. **"Level Not Available" in Verification Response**
**What's Happening**: Player level shows as "Not Available" when users verify.

**Why**: The moogold.com validation API (used for verification) only returns:
- Game ID
- Server ID
- In-game Nickname
- Country

It does **NOT** provide player level, rank, or any game statistics.

**Is This Normal?** Yes. This is a limitation of the validation API itself, not our bot.

**Current Workaround**: Players see "Level Not Available" but verification still succeeds. The bot still assigns roles based on MLBB rank (if RapidAPI key is configured).

### 2. **"Rank: Unranked" - No Rank API Available**
**What's Happening**: All verified users show as "Unranked" because rank data cannot be fetched.

**Why**: ⚠️ **This is not a bot bug - Moonton does NOT provide a public API for player rank data**

**The Reality:**
- Moonton has NO official API that returns player rank/tier/stars
- All RapidAPI MLBB endpoints (id-game-checker, True ID, etc.) only return:
  - Account ID
  - Username
  - Region/Country
  - Shop events
- **They do NOT return rank, tier, or stars data**
- This is intentional by Moonton (they don't expose competitive rank data publicly)

**Is This Normal?** Yes. No MLBB bot can currently fetch real player ranks from any public API.

**Workarounds** (Not yet implemented):
1. **Manual Rank Entry** - Users tell the bot their rank with a command
2. **Screenshot OCR** - Bot parses screenshots to detect rank visually
3. **Manual Admin Assignment** - Moderators verify and assign ranks manually

**For Now:**
- Verification works perfectly without rank
- All users show as "Unranked" (this is expected)
- Server admins can manually verify players are who they claim

### 3. **Discord Role Not Being Assigned**
**What's Happening**: Verification succeeds but user doesn't get the rank role.

**Why**: Usually one of these reasons:

**Reason A: Bot Missing Permissions**
- Bot must have "Manage Roles" permission
- Fix: Check Discord Server Settings → Roles → Bot role has permission enabled

**Reason B: Bot Role Below Rank Roles**
- Bot role must be ABOVE all rank roles in hierarchy
- Fix: Drag bot role above rank roles in Discord role settings

**Reason C: Wrong Role IDs in Code**
- Role IDs in code don't match server
- Fix: Check `server/lib/rankManagement.ts` has correct role IDs

**Check Your Bot Permissions:**
```
Discord Server → Settings → Roles → [Bot Role]
✅ Manage Roles
✅ Read Messages/View Channels
✅ Send Messages
✅ Read Message History
```

## 🔧 Troubleshooting Guide

### Problem: "⚠️ Could not fetch rank, defaulting to Warrior"
**Solution**: Set `RAPIDAPI_KEY` environment variable with a valid API key

### Problem: "[Rank Management] Error fetching rank: Request failed with status code 401"
**Solution**: Check your RapidAPI key is valid and not expired. Regenerate if needed.

### Problem: "[Discord Bot] Failed to assign role: Missing Permissions"
**Solution**: Bot needs "Manage Roles" permission and must be above the rank role in hierarchy

### Problem: User level shows "Not Available"
**Solution**: This is expected - the validation API doesn't provide level data. This is not a bug.

### Problem: Background rank check says "Rank check completed" but no updates happen
**Solution**: Likely because RAPIDAPI_KEY is not set. Add it to enable rank fetching.

## 📋 Quick Checklist

- [ ] Bot has Discord Token set
- [ ] Bot has "Manage Roles" permission in server
- [ ] Bot role is above all rank roles in role hierarchy
- [ ] Database is initialized (`npm run db:push`)
- [ ] Account verification works (users can verify with Game ID + Server ID)
- [ ] Users receive DM confirmations after verifying

**Note on Ranks:** Player rank features cannot be implemented because Moonton does not provide a public rank API. See "Known Issues" section above.

## 🤝 Contributing

Contributions are welcome! Please follow these guidelines:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 📞 Support

- **Discord**: Join our community Discord server
- **Email**: support@ipeorg.com
- **GitHub Issues**: Report bugs and request features
- **Documentation**: Check the `/docs` page for detailed guides

## 🔗 Links

- **Website**: https://ipeorg-mlbb.replit.dev
- **Discord Server**: https://discord.gg/ipeorg
- **GitHub**: https://github.com/IPEORG
- **Mobile Legends**: https://mobilelegends.com

## ⚠️ Disclaimer

This project is not affiliated with or endorsed by Moonton Games or Mobile Legends: Bang Bang. All trademarks are property of their respective owners.

---

**Last Updated**: December 21, 2025

**Version**: 1.2.0 - Updated with known issues documentation and troubleshooting guide

For the latest updates and news, follow us on Discord and GitHub!
