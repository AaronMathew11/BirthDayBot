const cron = require('node-cron');
const http = require('http');
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

// Simple HTTP server for Railway health checks
const server = http.createServer((req, res) => {
    if (req.url === '/health') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ status: 'ok', timestamp: new Date().toISOString() }));
    } else {
        res.writeHead(200, { 'Content-Type': 'text/plain' });
        res.end('Birthday Reminder Bot is running!');
    }
});

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