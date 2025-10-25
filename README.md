# Phoenix PBX Telegram Bot

A powerful Telegram bot for managing your MagnusBilling VoIP/PBX system.

## Features

- 📊 Real-time dashboard statistics
- 📞 Call management and history
- 👥 Customer management
- 📈 Reports (coming soon)
- ⚙️ Settings (coming soon)
- 🔐 Secure authentication with session management
- 📱 Inline button menus for easy navigation

## Prerequisites

- Node.js 16 or higher
- npm or yarn
- MagnusBilling installation with MySQL database
- Telegram Bot Token (from @BotFather)

## Installation

1. **Clone or copy the project:**
```bash
cd phoenix-bot
```

2. **Install dependencies:**
```bash
npm install
```

3. **Configure environment:**
```bash
cp .env.example .env
```

Edit `.env` and add your configuration:
```env
# Telegram Bot Configuration
TELEGRAM_BOT_TOKEN=your_bot_token_here
TELEGRAM_BOT_NAME=YourBotName

# Database Configuration
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=mbillingUser
DB_PASSWORD=O1vL4zav5q2TtvxC
DB_NAME=mbilling

# Session Configuration
SESSION_TIMEOUT=3600000

# Bot Configuration
BOT_VERSION=1.0.0
```

## Getting a Telegram Bot Token

1. Open Telegram and search for [@BotFather](https://t.me/BotFather)
2. Send `/newbot` command
3. Follow the instructions to create your bot
4. Copy the token and paste it in `.env` as `TELEGRAM_BOT_TOKEN`

## Development

Run in development mode with auto-reload:
```bash
npm run dev
```

## Production

1. **Build the project:**
```bash
npm run build
```

2. **Start the bot:**
```bash
npm start
```

## Deployment on Server

### Option 1: Using PM2 (Recommended)

1. **Install PM2 globally:**
```bash
npm install -g pm2
```

2. **Upload the project to your server:**
```bash
# Build locally first
npm run build

# Upload files (example using rsync)
rsync -avz --exclude 'node_modules' ./ root@93.127.206.104:/root/phoenix-bot/
```

3. **On the server, install dependencies:**
```bash
cd /root/phoenix-bot
npm install --production
```

4. **Start with PM2:**
```bash
pm2 start dist/index.js --name phoenix-bot
pm2 save
pm2 startup
```

5. **Manage the bot:**
```bash
pm2 status          # Check status
pm2 logs phoenix-bot # View logs
pm2 restart phoenix-bot # Restart
pm2 stop phoenix-bot    # Stop
```

### Option 2: Using systemd

1. **Create service file:**
```bash
sudo nano /etc/systemd/system/phoenix-bot.service
```

2. **Add this content:**
```ini
[Unit]
Description=Phoenix PBX Telegram Bot
After=network.target

[Service]
Type=simple
User=root
WorkingDirectory=/root/phoenix-bot
ExecStart=/usr/bin/node /root/phoenix-bot/dist/index.js
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

3. **Enable and start:**
```bash
sudo systemctl daemon-reload
sudo systemctl enable phoenix-bot
sudo systemctl start phoenix-bot
sudo systemctl status phoenix-bot
```

## Usage

1. **Start a chat with your bot** on Telegram

2. **Login:**
```
/start
/login your_username your_password
```

3. **Navigate using inline buttons:**
   - Dashboard: View system statistics
   - Calls: View recent calls and call history
   - Customers: Manage customers
   - Reports: Access reports (coming soon)
   - Settings: Configure bot settings (coming soon)

## Commands

- `/start` - Start the bot
- `/login <username> <password>` - Login to your account
- `/menu` - Show main menu
- `/help` - Show help message

## Project Structure

```
phoenix-bot/
├── src/
│   ├── config/
│   │   └── config.ts          # Configuration management
│   ├── database/
│   │   ├── database.ts        # Database connection
│   │   └── models.ts          # TypeScript interfaces
│   ├── handlers/
│   │   ├── callbackHandler.ts # Inline button handlers
│   │   └── commandHandler.ts  # Command handlers
│   ├── menus/
│   │   └── menuBuilder.ts     # Telegram menu builder
│   ├── services/
│   │   ├── authService.ts     # Authentication service
│   │   └── pbxService.ts      # PBX data service
│   ├── utils/
│   │   └── formatter.ts       # Data formatting utilities
│   └── index.ts               # Main entry point
├── .env.example               # Environment template
├── package.json
├── tsconfig.json
└── README.md
```

## Security Notes

- Never commit your `.env` file to version control
- The bot automatically deletes messages containing login credentials
- Sessions expire after the configured timeout (default: 1 hour)
- Passwords are hashed using SHA1 (MagnusBilling standard)

## Troubleshooting

**Bot doesn't respond:**
- Check if the bot is running: `pm2 status`
- View logs: `pm2 logs phoenix-bot`
- Verify bot token in `.env`
- Ensure database credentials are correct

**Authentication fails:**
- Verify database connection
- Check username/password in MagnusBilling
- Ensure `pkg_user` table is accessible

**Database connection errors:**
- Verify MySQL is running
- Check database credentials in `.env`
- Ensure user has proper permissions

## Support

For issues or questions, contact your system administrator.

## License

Proprietary - Phoenix PBX
