# Render Deployment Guide

## Quick Deploy Steps

### 1. Push to GitHub (if not done already)
```bash
cd "/Users/aaronmathew/React js projects/Birthday bot"
git add .
git commit -m "Add Render configuration"
git push origin main
```

### 2. Deploy on Render
1. Go to [render.com](https://render.com) and sign up
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub account
4. Select your repository: `AaronMathew11/BirthDayBot`
5. Configure deployment:
   - **Name**: `birthday-bot`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Plan**: Select **Free**
6. Click **"Create Web Service"**

### 3. Monitor Deployment
- Watch the deployment logs
- Wait for "Deploy live ✅" message
- Your app URL will be: `https://birthday-bot-xxxx.onrender.com`

## After Deployment

### 1. Get WhatsApp QR Code
- Go to your Render dashboard
- Click on your service → **"Logs"**
- Look for the ASCII QR code pattern
- Scan it with WhatsApp on your phone

### 2. Set Up WhatsApp Group
- Go to your church WhatsApp group
- Send: `!setgroup`
- Bot should reply: "✅ This group has been set as the birthday reminder group!"

### 3. Test Commands
- `!thisweek` - Show this week's birthdays
- `!nextweek` - Show next week's birthdays
- `!help` - Show all commands

## Important: Render Free Tier Behavior

### Sleep Mode
- **Sleeps after 15 minutes** of no web traffic
- **Auto-wakes** when WhatsApp messages arrive
- **No data loss** - WhatsApp session persists

### Keep-Alive (Built-in)
- Bot pings itself every 14 minutes
- Prevents most sleeping during active hours
- May still sleep during very quiet periods

### Manual Wake-Up
If bot seems unresponsive:
1. Visit your app URL: `https://your-app.onrender.com`
2. Or visit: `https://your-app.onrender.com/wake`
3. Check logs in Render dashboard

## Monitoring

### Check Bot Status
- **App URL**: Shows bot homepage with status
- **Health Check**: `https://your-app.onrender.com/health`
- **Render Logs**: Real-time logs in dashboard

### Troubleshooting

#### Bot Not Responding
1. Visit your app URL to wake it up
2. Check Render logs for errors
3. Look for "WhatsApp bot is ready!" message
4. Re-scan QR code if authentication failed

#### Authentication Issues
1. Check logs for new QR code
2. Clear browser cache and retry
3. Restart service in Render dashboard

#### WhatsApp Session Lost
1. Check logs for disconnection messages
2. Look for new QR code in logs
3. Bot auto-reconnects, just need to re-scan

## Limitations of Free Tier

### What Works:
✅ 24/7 operation (with occasional sleep)  
✅ WhatsApp message handling  
✅ Daily birthday reminders  
✅ All bot commands  
✅ 750 hours/month (more than enough)  

### Limitations:
⚠️ Sleeps after 15 min of inactivity  
⚠️ Cold start delay (10-30 seconds)  
⚠️ May miss messages during sleep (rare)  

## Upgrading (Optional)

### Paid Plans ($7+/month)
- **No sleep** - always on
- **Faster performance**
- **More resources**

### When to Upgrade:
- Missing important birthday reminders
- Users report bot unresponsiveness
- Need guaranteed uptime

## Support Resources
- **Render Docs**: https://render.com/docs
- **Render Status**: https://status.render.com
- **WhatsApp Web.js**: https://wwebjs.dev

Your birthday bot is now live! 🎉