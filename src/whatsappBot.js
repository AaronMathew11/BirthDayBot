const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const BirthdayManager = require('./birthdayManager');

class WhatsAppBot {
    constructor() {
        this.client = new Client({
            authStrategy: new LocalAuth(),
            puppeteer: {
                executablePath: process.env.CHROMIUM_PATH || '/usr/bin/chromium-browser',
                args: [
                    '--no-sandbox',
                    '--disable-setuid-sandbox',
                    '--disable-dev-shm-usage',
                    '--disable-accelerated-2d-canvas',
                    '--no-first-run',
                    '--no-zygote',
                    '--single-process',
                    '--disable-gpu'
                ]
            }
        });
        this.isReady = false;
        this.groupId = null;
        this.birthdayManager = new BirthdayManager();
        
        this.setupEventListeners();
    }

    setupEventListeners() {
        this.client.on('qr', (qr) => {
            console.log('Scan the QR code below with WhatsApp:');
            qrcode.generate(qr, { small: true });
        });

        this.client.on('ready', () => {
            console.log('WhatsApp bot is ready!');
            this.isReady = true;
        });

        this.client.on('authenticated', () => {
            console.log('WhatsApp authenticated successfully');
        });

        this.client.on('auth_failure', () => {
            console.log('WhatsApp authentication failed');
        });

        this.client.on('disconnected', (reason) => {
            console.log('WhatsApp disconnected:', reason);
            this.isReady = false;
            
            // Auto-reconnect after disconnect
            console.log('Attempting to reconnect in 5 seconds...');
            setTimeout(async () => {
                try {
                    await this.initialize();
                } catch (error) {
                    console.error('Reconnection failed:', error);
                }
            }, 5000);
        });

        this.client.on('message', async (message) => {
            try {
                console.log('🎯 MESSAGE EVENT TRIGGERED!');
                await this.handleMessage(message);
            } catch (error) {
                console.error('❌ Error handling message:', error);
            }
        });

        this.client.on('message_create', async (message) => {
            try {
                console.log('📝 MESSAGE CREATE EVENT TRIGGERED!');
                await this.handleMessage(message);
            } catch (error) {
                console.error('❌ Error handling message_create:', error);
            }
        });
    }

    async handleMessage(message) {
        console.log(`🔄 handleMessage called`);
        console.log(`📱 Message object:`, {
            body: message.body,
            from: message.from,
            type: message.type,
            hasQuotedMsg: message.hasQuotedMsg
        });

        if (!message.body) {
            console.log(`⚠️ Message has no body, skipping...`);
            return;
        }

        const messageBody = message.body.toLowerCase().trim();
        const isGroup = message.from.includes('@g.us') || message.from.includes('@lid');

        console.log(`📨 Received message: "${message.body}"`);
        console.log(`📍 From: ${message.from}`);
        console.log(`👥 Is Group: ${isGroup}`);
        console.log(`🔍 Processed: "${messageBody}"`);

        if (messageBody === '!setgroup' && isGroup) {
            console.log(`🎯 Setgroup command detected!`);
            this.groupId = message.from;
            await message.reply('✅ This group has been set as the birthday reminder group!');
            console.log(`✅ Group ID set to: ${this.groupId}`);
        }
        else if (messageBody === '!thisweek' && isGroup && this.groupId === message.from) {
            await this.handleThisWeekCommand(message);
        }
        else if (messageBody === '!nextweek' && isGroup && this.groupId === message.from) {
            await this.handleNextWeekCommand(message);
        }
        else if (messageBody === '!help' && isGroup && this.groupId === message.from) {
            await this.handleHelpCommand(message);
        }
        else if (messageBody === '!commands' && isGroup && this.groupId === message.from) {
            await this.handleHelpCommand(message);
        }
    }

    async handleThisWeekCommand(message) {
        try {
            const birthdays = await this.birthdayManager.loadBirthdays();
            const thisWeekBirthdays = this.birthdayManager.getThisWeeksBirthdays(birthdays);
            const responseMessage = this.birthdayManager.formatWeeklyBirthdayMessage(thisWeekBirthdays, 'This Week\'s Birthdays');
            await message.reply(responseMessage);
            console.log('This week command executed successfully');
        } catch (error) {
            console.error('Error handling thisweek command:', error);
            await message.reply('❌ Sorry, I couldn\'t retrieve this week\'s birthdays. Please try again later.');
        }
    }

    async handleNextWeekCommand(message) {
        try {
            const birthdays = await this.birthdayManager.loadBirthdays();
            const nextWeekBirthdays = this.birthdayManager.getNextWeeksBirthdays(birthdays);
            const responseMessage = this.birthdayManager.formatWeeklyBirthdayMessage(nextWeekBirthdays, 'Next Week\'s Birthdays');
            await message.reply(responseMessage);
            console.log('Next week command executed successfully');
        } catch (error) {
            console.error('Error handling nextweek command:', error);
            await message.reply('❌ Sorry, I couldn\'t retrieve next week\'s birthdays. Please try again later.');
        }
    }

    async handleHelpCommand(message) {
        const helpMessage = `🤖 *Birthday Bot Commands* 🤖\n\n` +
                          `📋 Available commands:\n\n` +
                          `• *!setgroup* - Set this group for birthday reminders\n` +
                          `• *!thisweek* - Show birthdays coming up this week\n` +
                          `• *!nextweek* - Show birthdays coming up next week\n` +
                          `• *!help* or *!commands* - Show this help message\n\n` +
                          `🎂 The bot automatically sends reminders one day before each birthday at 9:00 AM!`;
        
        await message.reply(helpMessage);
        console.log('Help command executed successfully');
    }

    async initialize() {
        try {
            await this.client.initialize();
            console.log('WhatsApp client initialized');
        } catch (error) {
            console.error('Error initializing WhatsApp client:', error);
        }
    }

    async sendMessage(message) {
        if (!this.isReady) {
            console.log('Bot is not ready yet');
            return false;
        }

        if (!this.groupId) {
            console.log('Group ID not set. Send "!setgroup" in the target group first.');
            return false;
        }

        try {
            await this.client.sendMessage(this.groupId, message);
            console.log('Birthday reminder sent successfully');
            return true;
        } catch (error) {
            console.error('Error sending message:', error);
            return false;
        }
    }

    async getGroups() {
        if (!this.isReady) return [];
        
        try {
            const chats = await this.client.getChats();
            return chats.filter(chat => chat.isGroup);
        } catch (error) {
            console.error('Error getting groups:', error);
            return [];
        }
    }
}

module.exports = WhatsAppBot;