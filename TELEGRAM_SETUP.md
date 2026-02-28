# 🤖 Telegram Birthday Bot Setup Guide

## ✅ Why Telegram Bot?
- **Super reliable** - No browser automation issues
- **Easy deployment** - Works on Vercel, Railway, Heroku, GCP, etc.
- **Free hosting** - Deploy on free tiers
- **No WhatsApp Business Account** needed
- **Rich features** - Inline keyboards, commands, etc.

## 🚀 Quick Setup (5 minutes)

### Step 1: Create Telegram Bot
1. Open Telegram and find **@BotFather**
2. Send `/newbot`
3. Choose a name: `Birthday Reminder Bot`
4. Choose a username: `yourname_birthday_bot`
5. **Save the bot token** - you'll need it!

### Step 2: Configure Environment
Create `.env` file:
```env
TELEGRAM_BOT_TOKEN=your_bot_token_from_botfather
BOT_USERNAME=your_bot_username
PORT=3000
```

### Step 3: Install Dependencies
```bash
# Copy the Telegram package.json
cp package-telegram.json package.json

# Install dependencies
npm install
```

### Step 4: Run Locally
```bash
npm start
```

### Step 5: Add to Your Group
1. Find your bot on Telegram
2. Add it to your group
3. Send `/setgroup` in the group
4. Done! 🎉

## 🌐 Deploy to Cloud (Choose One)

### Option A: Vercel (Recommended for beginners)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Set environment variables in Vercel dashboard:
# TELEGRAM_BOT_TOKEN = your_bot_token
# BOT_USERNAME = your_bot_username
```

### Option B: Railway
```bash
# Install Railway CLI
npm i -g @railway/cli

# Login and deploy
railway login
railway link
railway up

# Set environment variables:
railway variables set TELEGRAM_BOT_TOKEN=your_token
railway variables set BOT_USERNAME=your_username
```

### Option C: Heroku
```bash
# Create Procfile
echo "web: node src/telegramBirthdayApp.js" > Procfile

# Deploy to Heroku
heroku create your-birthday-bot
heroku config:set TELEGRAM_BOT_TOKEN=your_token
heroku config:set BOT_USERNAME=your_username
git push heroku main
```

### Option D: Google Cloud Platform
```bash
# Use existing app.yaml, just change the start command:
gcloud app deploy
```

## 📱 Bot Commands

| Command | Description |
|---------|-------------|
| `/start` | Welcome message and quick buttons |
| `/setgroup` | Set this group for reminders |
| `/thisweek` | Show this week's birthdays |
| `/nextweek` | Show next week's birthdays |
| `/prevmonth` | Show previous month's birthdays |
| `/help` | Show help and commands |
| `/status` | Check bot status |

## 🎯 Features

### ✅ What Works
- **Daily reminders** at 9:00 AM automatically
- **Interactive buttons** for easy navigation
- **Group management** - multiple groups supported
- **Rich formatting** with emojis and markdown
- **Error handling** - bot removes itself from deleted groups
- **Health monitoring** - `/health` endpoint for monitoring

### 🔧 Advanced Features
- **Webhook support** for production deployments
- **Graceful shutdown** handling
- **Keep-alive** for free hosting platforms
- **Manual triggers** via web endpoints

## 🐛 Troubleshooting

### Bot not responding?
```bash
# Check bot token
curl https://api.telegram.org/bot<YOUR_TOKEN>/getMe
```

### Can't send messages to group?
1. Make sure bot is admin in the group
2. Check if bot was removed from group
3. Send `/setgroup` again

### Deployment issues?
- **Vercel**: Make sure environment variables are set
- **Railway**: Check build logs for errors
- **Heroku**: Ensure `Procfile` exists

## 📊 Monitoring

### Health Check
Visit: `https://your-app.vercel.app/health`

### Bot Info
Visit: `https://your-app.vercel.app/bot-info`

### Manual Trigger (Testing)
```bash
curl -X POST https://your-app.vercel.app/send-reminders
```

## 🔄 File Structure
```
src/
├── telegramBot.js          # Main bot logic
├── telegramBirthdayApp.js  # Express app + scheduler
├── birthdayManager.js      # Birthday data management
└── data/
    └── birthdays.json      # Birthday data

package-telegram.json       # Telegram-specific dependencies
vercel.json                # Vercel deployment config
railway-telegram.json      # Railway deployment config
.env.telegram             # Environment variables template
```

## 💡 Pro Tips

1. **Test locally first** - Always test with `npm start` before deploying
2. **Use webhooks in production** - More reliable than polling
3. **Monitor with health checks** - Set up uptime monitoring
4. **Backup your data** - Keep `birthdays.json` backed up
5. **Use environment variables** - Never hardcode tokens

## 🎉 You're Done!

Your Telegram Birthday Bot is now running and will:
- ✅ Send daily reminders at 9:00 AM
- ✅ Respond to commands in groups
- ✅ Work reliably on any hosting platform
- ✅ Handle multiple groups
- ✅ Provide rich, interactive experience

Enjoy your automated birthday reminders! 🎂