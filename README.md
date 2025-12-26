# IPEORG MLBB Discord Automation

Advanced Discord bot and web dashboard for Mobile Legends: Bang Bang (MLBB) community management.

## 🎮 Features
- **User Verification**: OTP-based security for MLBB accounts via `/verify`.
- **Admin Tools**: 
  - `/unverify`: Remove user data and roles (Admin Only).
  - `/stats`: View performance radar charts (Admin Only).
- **Auto-Role Management**: Automatic assignment of "Verified" and Rank-specific roles.
- **Auto-Demote**: 24-hour background task that checks ranks and notifies users of demotions.

---

## 🚀 Hosting on AWS/Google Cloud (Linux VPS)

### 1. Server Preparation
1.  **Launch Instance**:
    - **AWS**: EC2 Instance (Ubuntu 22.04 or Debian).
    - **GCP**: Compute Engine VM (Ubuntu 22.04 or Debian).
2.  **Security Groups / Firewall**:
    - Open Port **5000** (for the web dashboard).
    - Open Port **22** (for SSH).
3.  **SSH into your server**:
    ```bash
    ssh -i your-key.pem ubuntu@your-ip-address
    ```

### 2. Install Dependencies
Run these commands to set up the environment:
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js (v20+)
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Verify installation
node -v
npm -v
```

### 3. Project Setup
1.  **Upload Files**:
    Transfer your project files to the server using SCP, SFTP, or Git.
2.  **Install NPM Packages**:
    ```bash
    cd mlbb-bot
    npm install
    ```
3.  **Environment Variables**:
    Create a `.env` file in the root directory:
    ```env
    DATABASE_URL=your_postgres_url
    DISCORD_BOT_TOKEN=your_bot_token
    DISCORD_CLIENT_ID=your_client_id
    DISCORD_CLIENT_SECRET=your_client_secret
    DISCORD_REDIRECT_URI=http://your-server-ip:5000/api/auth/callback
    SESSION_SECRET=a_random_secure_string
    ```

### 4. Build and Run
1.  **Build the project**:
    ```bash
    npm run build
    ```
2.  **Install PM2 (Process Manager)**:
    PM2 keeps your bot running 24/7 and restarts it if it crashes.
    ```bash
    sudo npm install -g pm2
    pm2 start dist/index.js --name "ipeorg-bot"
    pm2 save
    pm2 startup
    ```

---

## 🔄 Update Steps
When you make changes to the code, update your server like this:
1.  **Upload latest files** to the server.
2.  **Install new dependencies**: `npm install`
3.  **Rebuild the project**: `npm run build`
4.  **Restart the bot**: `pm2 restart ipeorg-bot`

---

## 🛠️ Discord Developer Portal Configuration
- **Privileged Gateway Intents**: Enable `Server Members Intent` and `Message Content Intent`.
- **OAuth2**: Add `http://your-server-ip:5000/api/auth/callback` to the Redirects list.
- **Bot Permissions**: Ensure the bot has "Manage Roles" and its role is moved **ABOVE** the rank roles in the server hierarchy.
