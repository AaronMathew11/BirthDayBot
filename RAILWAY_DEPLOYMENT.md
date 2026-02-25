# Railway Deployment Guide

## Prerequisites
1. Create a [Railway](https://railway.app) account
2. Install Railway CLI (optional): `npm install -g @railway/cli`
3. Have your project ready on GitHub

## Deployment Steps

### Method 1: GitHub Integration (Recommended)

1. **Push to GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin YOUR_GITHUB_REPO_URL
   git push -u origin main
   ```

2. **Deploy on Railway**
   - Go to [railway.app](https://railway.app)
   - Click "Start a New Project"
   - Select "Deploy from GitHub repo"
   - Choose your repository
   - Railway will auto-detect it's a Node.js project

3. **Configure Environment**
   - In Railway dashboard, go to your project
   - Click "Variables" tab
   - Add if needed: `PORT=3000` (Railway usually sets this automatically)

4. **Monitor Deployment**
   - Check "Deployments" tab for build logs
   - Look for "WhatsApp bot is ready!" in logs

### Method 2: Railway CLI

1. **Login to Railway**
   ```bash
   railway login
   ```

2. **Initialize Project**
   ```bash
   railway init
   ```

3. **Deploy**
   ```bash
   railway up
   ```

## After Deployment

### 1. Get QR Code for WhatsApp Authentication
- Go to Railway dashboard → your project → "Logs"
- Look for the QR code in ASCII art format
- Scan with WhatsApp on your phone

### 2. Configure WhatsApp Group
- Send `!setgroup` in your church WhatsApp group
- Bot should reply confirming the group is set

### 3. Test Commands
- `!thisweek` - Show this week's birthdays
- `!nextweek` - Show next week's birthdays
- `!help` - Show available commands

### 4. Monitor Health
- Your Railway app URL will show "Birthday Reminder Bot is running!"
- Health check endpoint: `YOUR_APP_URL/health`

## Important Notes

### WhatsApp Session Persistence
- **First deployment**: You'll need to scan QR code
- **Subsequent deployments**: WhatsApp session should persist
- **If authentication fails**: Check deployment logs for new QR code

### Costs
- **Free tier**: $5/month in credits (usually sufficient)
- **Pro plan**: $20/month for unlimited usage

### Auto-Restart
- Railway automatically restarts if the bot crashes
- Built-in reconnection logic handles WhatsApp disconnections

### Monitoring
- Check Railway dashboard for logs
- Health check endpoint to verify bot is running
- WhatsApp messages in your group to confirm functionality

## Troubleshooting

### Bot Not Responding
1. Check Railway logs for errors
2. Verify WhatsApp session is authenticated
3. Ensure group is set with `!setgroup`

### Authentication Fails
1. Look for new QR code in Railway logs
2. Re-scan with WhatsApp
3. Restart deployment if needed

### Deployment Fails
1. Check Railway build logs
2. Ensure all dependencies are in package.json
3. Verify Node.js version compatibility

## Support
- Railway docs: https://docs.railway.app
- WhatsApp Web.js docs: https://wwebjs.dev