const { Client, LocalAuth, MessageMedia } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const https = require('https');
const BirthdayManager = require('./birthdayManager');

class WhatsAppBot {
    constructor() {
        this.client = new Client({
            authStrategy: new LocalAuth(),
            puppeteer: {
                headless: true,
                args: [
                    '--no-sandbox',
                    '--disable-setuid-sandbox',
                    '--disable-dev-shm-usage',
                    '--disable-accelerated-2d-canvas',
                    '--no-first-run',
                    '--no-zygote',
                    '--single-process',
                    '--disable-gpu',
                    '--disable-web-security',
                    '--disable-features=VizDisplayCompositor'
                ]
            }
        });
        this.isReady = false;
        this.groupId = null;
        this.birthdayManager = new BirthdayManager();
        this.lastQR = null;
        
        this.setupEventListeners();
    }

    setupEventListeners() {
        this.client.on('qr', (qr) => {
            console.log('Scan the QR code below with WhatsApp:');
            console.log('QR Code Raw String:', qr);
            console.log('Visit /qr endpoint to get QR code');
            this.lastQR = qr;
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

    async sendBirthdayReminder(people) {
        if (!this.isReady || !this.groupId) {
            console.log('Bot not ready or group not set');
            return false;
        }

        try {
            // Send main message first
            const message = this.birthdayManager.formatBirthdayMessage(people);
            await this.client.sendMessage(this.groupId, message);

            // Send photos for each person (if available)
            for (const person of people) {
                if (person.photo && person.photo !== 'N/A') {
                    try {
                        const media = await this.downloadPhoto(person.photo);
                        if (media) {
                            await this.client.sendMessage(this.groupId, media, {
                                caption: `🎂 ${person.name}'s photo`
                            });
                        }
                    } catch (photoError) {
                        console.log(`Failed to send photo for ${person.name}:`, photoError.message);
                    }
                }
            }

            console.log('Birthday reminder with photos sent successfully');
            return true;
        } catch (error) {
            console.error('Error sending birthday reminder:', error);
            return false;
        }
    }

    async downloadPhoto(photoUrl) {
        return new Promise((resolve) => {
            try {
                // Convert Google Drive sharing URL to direct download URL
                const directUrl = this.convertGoogleDriveUrl(photoUrl);
                
                https.get(directUrl, (response) => {
                    if (response.statusCode !== 200) {
                        console.log(`Photo download failed: ${response.statusCode}`);
                        resolve(null);
                        return;
                    }

                    const chunks = [];
                    response.on('data', (chunk) => chunks.push(chunk));
                    response.on('end', () => {
                        try {
                            const buffer = Buffer.concat(chunks);
                            const contentType = response.headers['content-type'] || 'image/jpeg';
                            const media = new MessageMedia(contentType, buffer.toString('base64'));
                            resolve(media);
                        } catch (error) {
                            console.log('Error creating media:', error.message);
                            resolve(null);
                        }
                    });
                }).on('error', (error) => {
                    console.log('Photo download error:', error.message);
                    resolve(null);
                });
            } catch (error) {
                console.log('Photo URL conversion error:', error.message);
                resolve(null);
            }
        });
    }

    convertGoogleDriveUrl(url) {
        // Convert Google Drive sharing URL to direct download
        // From: https://drive.google.com/open?id=FILE_ID
        // To: https://drive.google.com/uc?export=download&id=FILE_ID
        
        if (url.includes('drive.google.com')) {
            const fileIdMatch = url.match(/id=([a-zA-Z0-9_-]+)/);
            if (fileIdMatch) {
                return `https://drive.google.com/uc?export=download&id=${fileIdMatch[1]}`;
            }
        }
        return url; // Return original if not Google Drive or can't parse
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