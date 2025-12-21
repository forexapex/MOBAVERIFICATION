# IPEORG MLBB Discord Automation - Complete Installation Guide

## 📋 Table of Contents
1. [Overview](#overview)
2. [Requirements](#requirements)
3. [Installation Steps](#installation-steps)
4. [Windows Installation](#windows-installation)
5. [Linux Installation](#linux-installation)
6. [Discord Bot Setup](#discord-bot-setup)
7. [Running the Bot](#running-the-bot)
8. [Verification Process Guide](#verification-process-guide)
9. [Troubleshooting](#troubleshooting)

---

## Overview

**IPEORG MLBB Discord Automation** is a sophisticated Discord bot designed for the IPEORG (India Premier Esports Organization) MLBB community. It provides:

✅ Automated user verification system  
✅ Role-based access control  
✅ OTP-based security  
✅ Admin approval workflows  
✅ Welcome automation  
✅ Audit logging  

**Bot Status:** Production Ready  
**Version:** 1.0  
**Language:** JavaScript (Node.js)  

---

## Requirements

### Minimum Requirements
- Node.js v16.9.0 or higher
- Discord account with server admin access
- Bot Token from Discord Developer Portal
- ~50MB disk space

### Recommended
- Node.js v20.0.0+
- 100MB+ RAM
- Stable internet connection

---

## Installation Steps

### Step 1: Create Discord Bot (if not already done)

1. Go to [Discord Developer Portal](https://discord.com/developers/applications)
2. Click **"New Application"** and name it "IPEORG MLBB Bot"
3. Go to **"Bot"** tab → Click **"Add Bot"**
4. Under **TOKEN**, click **"Copy"** and save it somewhere safe
5. Enable these **Privileged Intents**:
   - ✅ Message Content Intent
   - ✅ Server Members Intent

### Step 2: Set Bot Permissions

1. Go to **OAuth2** → **URL Generator**
2. Select scopes:
   - ✅ bot
   - ✅ applications.commands
3. Select permissions:
   - ✅ Send Messages
   - ✅ Manage Roles
   - ✅ Read Message History
   - ✅ Mention @everyone, @here, and All Roles
4. Copy the generated URL and open it in browser
5. Select your server and authorize

### Step 3: Prepare Your Discord Server

Create these channels in your Discord server:
- `/verify` - User verification channel
- `/admindashboard` - Admin approval dashboard (staff only)
- `/stafflogs` - Audit logs (staff only)

---

## Windows Installation

### Method 1: Using Command Prompt (Recommended)

**Step 1: Install Node.js**
1. Download from [nodejs.org](https://nodejs.org/)
2. Run the installer (.msi file)
3. Check "Add to PATH" during installation
4. Restart your computer

**Step 2: Download Bot Files**
1. Download the bot project folder
2. Extract to a location like `C:\Users\YourName\Documents\ipeorg-bot`

**Step 3: Install Bot Dependencies**
1. Open Command Prompt (press `Win + R`, type `cmd`)
2. Navigate to bot folder:
   ```cmd
   cd C:\Users\YourName\Documents\ipeorg-bot
   ```
3. Install dependencies:
   ```cmd
   npm install
   ```

**Step 4: Configure Bot**
1. Open `index.js` with Notepad
2. Update the CONFIG section at the top:
   ```javascript
   const CONFIG = {
       BOT_TOKEN: 'YOUR_BOT_TOKEN_HERE',
       CLIENT_ID: 'YOUR_CLIENT_ID_HERE',
       GUILD_ID: 'YOUR_SERVER_ID_HERE',
       // ... rest of config
   };
   ```
3. Save the file

**Step 5: Run the Bot**
1. In Command Prompt (in bot folder):
   ```cmd
   node index.js
   ```
2. Wait for message: "Logged in as BotName#0000!"
3. Bot is now running ✅

**Step 6: Keep Bot Running (Optional)**

To keep bot running even after closing Command Prompt:

**Option A: Use Task Scheduler**
1. Press `Win + R`, type `taskschd.msc`
2. Create Basic Task
3. Trigger: At startup
4. Action: Start program `node.exe` with argument `C:\path\to\index.js`

**Option B: Use Screen or PM2 (Advanced)**
```cmd
npm install -g pm2
pm2 start index.js --name "IPEORG-Bot"
pm2 startup
pm2 save
```

---

## Linux Installation

### Step 1: Install Node.js

**Ubuntu/Debian:**
```bash
sudo apt update
sudo apt install nodejs npm
node --version  # Verify installation
```

**CentOS/RHEL:**
```bash
sudo yum install nodejs npm
```

**Fedora:**
```bash
sudo dnf install nodejs npm
```

### Step 2: Download & Setup Bot

1. Download bot project
2. Extract to desired location (e.g., `/home/username/ipeorg-bot`)

```bash
cd ~/ipeorg-bot
npm install
```

### Step 3: Configure Bot

Edit `index.js`:
```bash
nano index.js
```

Update CONFIG with your tokens. Save with `Ctrl + X`, then `Y`, then `Enter`.

### Step 4: Run the Bot

```bash
node index.js
```

You should see:
```
Started refreshing application (/) commands.
Successfully reloaded application (/) commands.
Logged in as BotName#1234!
```

### Step 5: Run Bot as Background Service (Recommended)

**Using PM2 (Recommended):**
```bash
npm install -g pm2

# Start bot
pm2 start index.js --name "ipeorg-bot"

# Make it start on boot
pm2 startup
pm2 save

# Monitor
pm2 logs ipeorg-bot
```

**Using Systemd:**
1. Create service file:
```bash
sudo nano /etc/systemd/system/ipeorg-bot.service
```

2. Add content:
```ini
[Unit]
Description=IPEORG MLBB Bot
After=network.target

[Service]
Type=simple
User=your_username
WorkingDirectory=/home/your_username/ipeorg-bot
ExecStart=/usr/bin/node /home/your_username/ipeorg-bot/index.js
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

3. Enable and start:
```bash
sudo systemctl enable ipeorg-bot
sudo systemctl start ipeorg-bot
sudo systemctl status ipeorg-bot
```

---

## Discord Bot Setup

### Obtain Required IDs

**Get Bot Token:**
- Discord Developer Portal → Bot → TOKEN → Copy

**Get Client ID:**
- Discord Developer Portal → General Information → Application ID

**Get Guild ID (Server ID):**
1. Enable Developer Mode in Discord (User Settings → Advanced → Developer Mode)
2. Right-click server name → "Copy Guild ID"

**Get Role IDs:**
1. Right-click role → "Copy Role ID"
2. Get both Verified and Pending role IDs

### Update Configuration

Edit `index.js` CONFIG section:
```javascript
const CONFIG = {
    BOT_TOKEN: '',
    CLIENT_ID: '1451482666271772754',
    GUILD_ID: '1439165596725022753',
    ROLE_VERIFIED_ID: '1439165896806498425',
    ROLE_PENDING_ID: '1451490702348259409',
    CHANNEL_VERIFY_NAME: '/verify',
    CHANNEL_ADMIN_DASHBOARD_NAME: '/admindashboard',
    CHANNEL_LOGS_NAME: '/stafflogs',
    SEND_WELCOME_DM: true
};
```

---

## Running the Bot

### Windows
```cmd
node index.js
```

### Linux/Mac
```bash
node index.js
```

### Replit (Online)
```bash
node index.js
```

**Expected Output:**
```
Started refreshing application (/) commands.
Successfully reloaded application (/) commands.
Logged in as IPEORG-Bot#0000!
```

---

## Verification Process Guide

### User Verification Flow

**Step 1: User initiates verification**
- User goes to `/verify` channel
- Types `/verify` command
- Bot shows modal popup

**Step 2: Submit Game ID**
- User enters 9-digit MLBB Game ID
- Bot sends OTP to DM

**Step 3: Enter OTP**
- User checks Discord DM
- Receives 6-digit code
- Replies to DM with code
- Has 5 minutes before code expires

**Step 4: Admin Approval**
- Request appears in `/admindashboard`
- Shows: User mention, Game ID, timestamp
- Admin clicks ✅ **Approve** or ❌ **Deny**

**Step 5: User Receives Result**
- If Approved:
  - User gets Verified role
  - Receives success DM with Game ID
  - Gets access to main channels
- If Denied:
  - Remains unverified
  - Receives denial DM with reason

### Admin Actions

1. Open `/admindashboard`
2. Find pending verification request
3. Click button:
   - ✅ Approve → Assigns Verified role, sends success DM
   - ❌ Deny → Sends denial DM
4. Action logged in `/stafflogs` for audit

---

## Troubleshooting

### Bot doesn't appear online

**Solution:**
- ✅ Restart bot: Stop and run `node index.js` again
- ✅ Check bot token is correct in `index.js`
- ✅ Ensure bot is in the server (check member list)
- ✅ Check Privileged Intents are enabled in Developer Portal

### `/verify` command doesn't appear

**Solution:**
- ✅ Restart bot (this registers commands)
- ✅ Wait 30 seconds for command to sync
- ✅ Check Message Content Intent is enabled
- ✅ Right-click bot role → Ensure it has permission

### Bot can't send DMs

**Solution:**
- ✅ Check user has DMs open
- ✅ Verify bot has permission to Send Messages
- ✅ User hasn't blocked bot

### Bot can't assign roles

**Solution:**
- ✅ Check bot's role is HIGHER than target roles (Server Settings → Roles)
- ✅ Verify role IDs are correct in CONFIG
- ✅ Ensure bot has "Manage Roles" permission
- ✅ Target role is not "Administrator"

### Channels not found

**Solution:**
- ✅ Ensure channels exist: `/verify`, `/admindashboard`, `/stafflogs`
- ✅ Channel names match exactly (case-sensitive)
- ✅ Update CONFIG if channel names are different

### OTP not received in DM

**Solution:**
- ✅ Check user's DM settings are open
- ✅ Look in spam folder
- ✅ Restart bot and try again
- ✅ Check bot has Message Send permission

### Bot crashes or stops responding

**Solution:**
- ✅ Check console for error messages
- ✅ Restart bot: Stop (Ctrl + C) → Run `node index.js`
- ✅ Check internet connection
- ✅ Update Node.js to latest version

### Permission denied on Linux

**Solution:**
```bash
# Give execute permission
chmod +x index.js

# Or run with explicit node
node index.js
```

### Port/Address in use

**Solution:**
```bash
# Find process using port
netstat -tulpn | grep 5000

# Kill process
kill -9 <PID>
```

---

## Support & Logs

### Check Bot Logs

**Windows:**
- Logs appear in Command Prompt window

**Linux:**
```bash
# If using PM2
pm2 logs ipeorg-bot

# If using Systemd
sudo journalctl -u ipeorg-bot -f
```

### Common Log Messages

```
✅ "Successfully reloaded application (/) commands"
   → Bot commands are registered

✅ "Logged in as IPEORG-Bot#1234!"
   → Bot is connected to Discord

✅ "New member joined: username#1234"
   → New user joined, welcome DM sent

✅ "OTP Verified!"
   → User verified OTP code

❌ "Failed to add pending role"
   → Bot doesn't have permission to assign role
```

---

## Advanced Features

### Auto-Restart on Crash (Linux)

```bash
while true; do
    node index.js
    sleep 5
done
```

### Multiple Server Support

Duplicate bot and create separate instances with different GUILD_IDs in CONFIG.

### Custom Welcome Message

Edit the welcome message in `guildMemberAdd` event in `index.js`.

---

## Security Best Practices

1. **Never share bot token** - Keep it private
2. **Use environment variables** (advanced):
   ```bash
   export BOT_TOKEN=your_token_here
   ```
3. **Regular backups** of channel logs
4. **Review audit logs** regularly (`/stafflogs`)
5. **Keep Node.js updated** for security patches

---

## Version Info

- **Bot Name:** IPEORG MLBB Discord Automation
- **Version:** 1.0
- **Author:** IPEORG Development Team
- **Last Updated:** December 2025

---

**Need help? Check Discord Developer Portal docs or contact IPEORG support.**
