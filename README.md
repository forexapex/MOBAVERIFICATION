# IPEORG MLBB Discord Bot & Dashboard

Advanced Discord automation platform for the IPEORG MLBB (Mobile Legends: Bang Bang) community. Featuring instant game account verification, automated role management, and comprehensive admin dashboard.

## 🎮 Features

### 🤖 Discord Bot
- **Instant Game Verification**: Direct Mobile Legends account verification via moogold.com API
- **Modal-based Interface**: User-friendly `/verify` command with Game ID and Server selection
- **Automatic Role Assignment**: Verified role granted instantly upon successful verification
- **Admin Transcripts**: Complete audit logs of all verifications sent to admin channel
- **Direct Messages**: Verification confirmations sent via Discord DMs
- **Multi-region Support**: SEA, GLOBAL, AMERICAS, EUROPE server regions

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
BOT_TOKEN=your_discord_bot_token
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
Initiates the Mobile Legends account verification process.

**Usage**: Type `/verify` in the configured verification channel or DM

**Modal Fields**:
- Game ID: Your 9-10 digit Mobile Legends account ID
- Server: Choose from SEA, GLOBAL, AMERICAS, or EUROPE

**Response**: 
- ✅ If valid: Role assigned, DM confirmation, admin transcript logged
- ❌ If invalid: Error message with troubleshooting tips

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
│   ├── schema.ts                     # Database schema
│   └── vite.ts                       # Vite setup
├── shared/
│   └── schema.ts                     # Shared TypeScript types
├── README.md
└── package.json
```

## 🔌 API Endpoints

### Authentication
- `GET /auth/discord` - Discord OAuth callback
- `POST /auth/logout` - Logout user

### Users
- `GET /api/users` - Get all verified users
- `GET /api/users/:id` - Get user details

### Verification
- `POST /api/verify` - Submit verification request
- `GET /api/verify/history` - Get verification history

## 🔐 Security Features

- **Discord OAuth2**: Secure authentication for admin dashboard
- **Rate Limiting**: Protection against abuse and brute force
- **Data Encryption**: Secure transmission of sensitive information
- **Audit Logs**: Complete verification history for moderation
- **API Validation**: Zod schema validation for all requests

## 🛠️ Tech Stack

### Frontend
- **React** 18+ with TypeScript
- **Vite** for fast development & building
- **Tailwind CSS** for styling
- **TanStack Query** for server state management
- **Framer Motion** for animations
- **shadcn/ui** for UI components

### Backend
- **Express.js** for HTTP server
- **Discord.js** v14 for Discord integration
- **Drizzle ORM** for database access
- **Zod** for runtime validation
- **PostgreSQL/Neon** for data persistence

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
server      VARCHAR
verified    BOOLEAN
created_at  TIMESTAMP
```

### Verification Logs Table
```sql
id          INT PRIMARY KEY
user_id     INT FOREIGN KEY
status      VARCHAR ('pending', 'verified', 'failed')
game_id     VARCHAR
server      VARCHAR
error       TEXT
created_at  TIMESTAMP
```

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

**Last Updated**: December 21, 2024

**Version**: 1.0.0

For the latest updates and news, follow us on Discord and GitHub!
