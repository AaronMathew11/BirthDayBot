const cron = require('node-cron');
const http = require('http');
const QRCode = require('qrcode');
const WhatsAppBot = require('./whatsappBot');
const BirthdayChecker = require('./birthdayChecker');

class BirthdayReminderBot {
    constructor() {
        this.whatsappBot = new WhatsAppBot();
        this.birthdayChecker = new BirthdayChecker(this.whatsappBot);
        this.isInitialized = false;
    }

    async initialize() {
        console.log('Starting Birthday Reminder Bot...');
        
        try {
            await this.whatsappBot.initialize();
            this.setupScheduler();
            this.isInitialized = true;
            console.log('Bot initialized successfully!');
        } catch (error) {
            console.error('Failed to initialize bot:', error);
        }
    }

    setupScheduler() {
        // Run every day at 9:00 AM
        cron.schedule('0 9 * * *', async () => {
            console.log('Running daily birthday check...');
            await this.birthdayChecker.checkAndSendReminders();
        });

        // Optional: Run a test check every hour (you can remove this in production)
        cron.schedule('0 * * * *', () => {
            console.log('Hourly check - Bot is running...');
        });

        console.log('Scheduler set up - will check for birthdays daily at 9:00 AM');
    }

    async testBirthdayCheck() {
        console.log('Running test birthday check...');
        await this.birthdayChecker.testBirthdayCheck();
    }

    async manualCheck() {
        console.log('Running manual birthday check...');
        await this.birthdayChecker.checkAndSendReminders();
    }
}

// Handle graceful shutdown
process.on('SIGINT', () => {
    console.log('\nShutting down Birthday Reminder Bot...');
    process.exit(0);
});

process.on('SIGTERM', () => {
    console.log('\nShutting down Birthday Reminder Bot...');
    process.exit(0);
});

// HTTP server with keep-alive for Render
const server = http.createServer((req, res) => {
    if (req.url === '/health') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ 
            status: 'ok', 
            timestamp: new Date().toISOString(),
            uptime: process.uptime(),
            whatsappReady: bot ? bot.whatsappBot.isReady : false
        }));
    } else if (req.url === '/wake') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: 'Bot is awake!', timestamp: new Date().toISOString() }));
    } else if (req.url === '/qr') {
        if (bot && bot.whatsappBot && bot.whatsappBot.lastQR) {
            try {
                QRCode.toDataURL(bot.whatsappBot.lastQR, (err, url) => {
                    if (err) {
                        res.writeHead(200, { 'Content-Type': 'text/plain' });
                        res.end(`QR Code Error: ${err.message}`);
                    } else {
                        res.writeHead(200, { 'Content-Type': 'text/html' });
                        res.end(`
                            <html>
                                <body style="text-align: center; padding: 20px;">
                                    <h1>WhatsApp QR Code</h1>
                                    <p>Scan this QR code with WhatsApp:</p>
                                    <img src="${url}" alt="WhatsApp QR Code" style="max-width: 400px;">
                                    <p>The QR code will disappear once you scan it successfully.</p>
                                </body>
                            </html>
                        `);
                    }
                });
            } catch (error) {
                res.writeHead(200, { 'Content-Type': 'text/plain' });
                res.end(`QR Code Generation Error: ${error.message}`);
            }
        } else {
            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.end(`
                <html>
                    <body style="text-align: center; padding: 20px;">
                        <h1>WhatsApp QR Code</h1>
                        <p>No QR code available yet.</p>
                        <p>Please wait for the bot to generate a new QR code or try refreshing.</p>
                        <a href="/qr">Refresh</a>
                    </body>
                </html>
            `);
        }
    } else if (req.url === '/status') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
            whatsappReady: bot ? bot.whatsappBot.isReady : false,
            hasQR: bot ? !!bot.whatsappBot.lastQR : false,
            uptime: process.uptime(),
            timestamp: new Date().toISOString()
        }));
    } else {
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(`
            <html>
                <body>
                    <h1>Birthday Reminder Bot</h1>
                    <p>Status: Running ✅</p>
                    <p>Time: ${new Date().toISOString()}</p>
                    <p>Uptime: ${Math.floor(process.uptime())} seconds</p>
                    <a href="/health">Health Check</a>
                </body>
            </html>
        `);
    }
});

// Self-ping to prevent Render from sleeping (ping every 14 minutes)
if (process.env.NODE_ENV === 'production' && process.env.RENDER) {
    const RENDER_URL = process.env.RENDER_EXTERNAL_URL;
    if (RENDER_URL) {
        setInterval(() => {
            const https = require('https');
            const http = require('http');
            const client = RENDER_URL.startsWith('https') ? https : http;
            
            client.get(`${RENDER_URL}/wake`, (res) => {
                console.log(`Keep-alive ping: ${res.statusCode}`);
            }).on('error', (err) => {
                console.log('Keep-alive ping failed:', err.message);
            });
        }, 14 * 60 * 1000); // 14 minutes
    }
}

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Health check server running on port ${PORT}`);
});

// Start the bot
const bot = new BirthdayReminderBot();

async function main() {
    await bot.initialize();
    
    console.log('\n=================================');
    console.log('Birthday Reminder Bot is running!');
    console.log('=================================');
    console.log('Instructions:');
    console.log('1. Scan the QR code with WhatsApp');
    console.log('2. Send "!setgroup" in your church group');
    console.log('3. The bot will check daily at 9:00 AM');
    console.log('4. Bot health: http://localhost:' + PORT + '/health');
}

main().catch(console.error);