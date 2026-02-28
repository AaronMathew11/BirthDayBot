require('dotenv').config();
const express = require('express');
const cron = require('node-cron');
const TelegramBirthdayBot = require('./telegramBot');

class TelegramBirthdayApp {
    constructor() {
        this.app = express();
        this.telegramBot = null;
        
        this.setupMiddleware();
        this.setupRoutes();
        this.setupScheduler();
    }

    async initialize() {
        try {
            console.log('🚀 Initializing Telegram Birthday Bot...');
            
            // Initialize Telegram bot
            this.telegramBot = new TelegramBirthdayBot();
            
            // Get bot info
            const botInfo = await this.telegramBot.getBotInfo();
            if (botInfo) {
                console.log(`✅ Connected to Telegram as @${botInfo.username}`);
            }
            
            console.log('✅ Telegram Birthday App initialized successfully!');
            return true;
        } catch (error) {
            console.error('❌ Failed to initialize app:', error.message);
            console.error('💡 Make sure TELEGRAM_BOT_TOKEN is set in your environment variables');
            return false;
        }
    }

    setupMiddleware() {
        this.app.use(express.json());
        this.app.use(express.urlencoded({ extended: true }));
    }

    setupRoutes() {
        // Health check
        this.app.get('/health', (req, res) => {
            res.json({
                status: 'ok',
                service: 'Telegram Birthday Bot',
                timestamp: new Date().toISOString(),
                uptime: process.uptime(),
                telegram_connected: !!this.telegramBot
            });
        });

        // Home page
        this.app.get('/', (req, res) => {
            res.send(this.getHomePage());
        });

        // Manual trigger for testing
        this.app.post('/send-reminders', async (req, res) => {
            if (this.telegramBot) {
                await this.telegramBot.sendDailyReminders();
                res.json({ success: true, message: 'Birthday reminders sent manually' });
            } else {
                res.status(500).json({ success: false, error: 'Telegram bot not initialized' });
            }
        });

        // Webhook endpoint (for production deployment)
        this.app.post(`/webhook/${process.env.TELEGRAM_BOT_TOKEN}`, (req, res) => {
            if (this.telegramBot) {
                this.telegramBot.bot.processUpdate(req.body);
            }
            res.sendStatus(200);
        });

        // Bot info endpoint
        this.app.get('/bot-info', async (req, res) => {
            if (this.telegramBot) {
                const info = await this.telegramBot.getBotInfo();
                res.json(info);
            } else {
                res.status(500).json({ error: 'Bot not initialized' });
            }
        });
    }

    setupScheduler() {
        // Only set up scheduler if not in serverless environment
        const isServerless = process.env.VERCEL || process.env.LAMBDA_TASK_ROOT;
        
        if (!isServerless) {
            // Daily birthday reminders at 9:00 AM
            cron.schedule('0 9 * * *', async () => {
                console.log('📅 Running daily birthday check...');
                if (this.telegramBot) {
                    await this.telegramBot.sendDailyReminders();
                }
            });

            console.log('⏰ Scheduler set up - birthday reminders at 9:00 AM daily');
        } else {
            console.log('⏰ Serverless environment - scheduler disabled (use external cron service)');
        }
    }

    getHomePage() {
        const botUsername = process.env.BOT_USERNAME || 'your_bot';
        return `
        <!DOCTYPE html>
        <html>
        <head>
            <title>🤖 Telegram Birthday Bot</title>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>
                body { font-family: Arial, sans-serif; max-width: 800px; margin: 50px auto; padding: 20px; background: #f5f5f5; }
                .container { background: white; padding: 40px; border-radius: 15px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
                .header { text-align: center; margin-bottom: 40px; }
                .feature { background: #f8f9fa; padding: 20px; margin: 20px 0; border-radius: 10px; border-left: 4px solid #0088cc; }
                .button { display: inline-block; background: #0088cc; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; margin: 10px; font-weight: bold; }
                .button:hover { background: #006699; }
                .commands { background: #e3f2fd; padding: 20px; border-radius: 10px; margin: 20px 0; }
                .setup-steps { background: #f3e5f5; padding: 20px; border-radius: 10px; margin: 20px 0; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>🎂 Telegram Birthday Bot</h1>
                    <p>Your reliable birthday reminder system on Telegram!</p>
                    <p><strong>✅ Works on any hosting platform</strong></p>
                    <p><strong>✅ No WhatsApp Business Account needed</strong></p>
                </div>

                <div class="setup-steps">
                    <h3>🚀 Quick Setup:</h3>
                    <ol>
                        <li>🔍 Find <strong>@${botUsername}</strong> on Telegram</li>
                        <li>➕ Add the bot to your group</li>
                        <li>⚙️ Send <code>/setgroup</code> in the group</li>
                        <li>✅ Done! Daily reminders will start at 9:00 AM</li>
                    </ol>
                </div>

                <div class="commands">
                    <h3>📋 Available Commands:</h3>
                    <ul>
                        <li><strong>/start</strong> - Welcome message and quick actions</li>
                        <li><strong>/setgroup</strong> - Set group for birthday reminders</li>
                        <li><strong>/thisweek</strong> - Show this week's birthdays</li>
                        <li><strong>/nextweek</strong> - Show next week's birthdays</li>
                        <li><strong>/prevmonth</strong> - Show previous month's birthdays</li>
                        <li><strong>/help</strong> - Show help and commands</li>
                        <li><strong>/status</strong> - Check bot status</li>
                    </ul>
                </div>

                <div class="feature">
                    <h3>✨ Features:</h3>
                    <ul>
                        <li>🔄 Automatic daily reminders at 9:00 AM</li>
                        <li>📅 Weekly and monthly birthday summaries</li>
                        <li>👥 Works in group chats and private messages</li>
                        <li>🎯 Interactive buttons for easy navigation</li>
                        <li>💚 Simple setup - just add to group and send /setgroup</li>
                        <li>🌐 Works on any cloud platform (Vercel, Railway, Heroku, etc.)</li>
                    </ul>
                </div>

                <div style="text-align: center; margin: 30px 0;">
                    <a href="https://t.me/${botUsername}" class="button">🤖 Open Bot in Telegram</a>
                    <a href="/health" class="button">💚 Check Bot Health</a>
                    <a href="/bot-info" class="button">ℹ️ Bot Info</a>
                </div>

                <div style="text-align: center; margin-top: 40px; color: #666; font-size: 14px;">
                    <p>🎂 Telegram Birthday Bot - Keep your community connected!</p>
                    <p>⏰ Server Time: ${new Date().toLocaleString()}</p>
                    <p>⚡ Uptime: ${Math.floor(process.uptime())} seconds</p>
                </div>
            </div>
        </body>
        </html>
        `;
    }

    async start(port = process.env.PORT || 3000) {
        const initialized = await this.initialize();
        
        if (!initialized) {
            console.log('❌ Failed to initialize. Exiting...');
            process.exit(1);
        }

        this.app.listen(port, () => {
            console.log('\n🎉 Telegram Birthday Bot is running!');
            console.log(`📡 Server: http://localhost:${port}`);
            console.log('🤖 Telegram: Bot is polling for messages');
            console.log('⏰ Scheduler: Daily reminders at 9:00 AM');
            console.log('\n📋 Next steps:');
            console.log('1. Find your bot on Telegram');
            console.log('2. Add it to your group');
            console.log('3. Send /setgroup in the group');
            console.log('4. Enjoy automated birthday reminders! 🎂\n');
        });

        // Handle graceful shutdown
        process.on('SIGINT', () => {
            console.log('\n🛑 Shutting down Telegram Birthday Bot...');
            if (this.telegramBot) {
                this.telegramBot.stop();
            }
            process.exit(0);
        });

        process.on('SIGTERM', () => {
            console.log('\n🛑 Shutting down Telegram Birthday Bot...');
            if (this.telegramBot) {
                this.telegramBot.stop();
            }
            process.exit(0);
        });
    }
}

// Start the application
if (require.main === module) {
    const app = new TelegramBirthdayApp();
    app.start();
}

module.exports = TelegramBirthdayApp;