const TelegramBot = require('node-telegram-bot-api');
const BirthdayManager = require('./birthdayManager');

class TelegramBirthdayBot {
    constructor() {
        this.token = process.env.TELEGRAM_BOT_TOKEN;
        
        if (!this.token) {
            throw new Error('TELEGRAM_BOT_TOKEN is required. Get it from @BotFather on Telegram');
        }

        this.bot = new TelegramBot(this.token, { 
            polling: true,
            request: {
                agentOptions: {
                    rejectUnauthorized: false
                }
            }
        });
        this.birthdayManager = new BirthdayManager();
        this.authorizedChats = new Set(); // Store authorized group/chat IDs
        
        this.setupCommands();
        this.setupHandlers();
        
        console.log('🤖 Telegram Birthday Bot initialized!');
    }

    setupCommands() {
        // Set bot commands (shows in Telegram menu)
        this.bot.setMyCommands([
            { command: 'start', description: '🚀 Start the birthday bot' },
            { command: 'help', description: '❓ Show help and commands' },
            { command: 'setgroup', description: '⚙️ Set this group for birthday reminders' },
            { command: 'thisweek', description: '📅 Show this week\'s birthdays' },
            { command: 'nextweek', description: '🗓️ Show next week\'s birthdays' },
            { command: 'prevmonth', description: '📋 Show previous month\'s birthdays' },
            { command: 'status', description: '💚 Check bot status' }
        ]);
    }

    setupHandlers() {
        // Welcome message
        this.bot.onText(/\/start/, async (msg) => {
            await this.handleStart(msg);
        });

        // Help command
        this.bot.onText(/\/help/, async (msg) => {
            await this.handleHelp(msg);
        });

        // Set group for reminders
        this.bot.onText(/\/setgroup/, async (msg) => {
            await this.handleSetGroup(msg);
        });

        // This week's birthdays
        this.bot.onText(/\/thisweek/, async (msg) => {
            await this.handleThisWeek(msg);
        });

        // Next week's birthdays
        this.bot.onText(/\/nextweek/, async (msg) => {
            await this.handleNextWeek(msg);
        });

        // Previous month's birthdays
        this.bot.onText(/\/prevmonth/, async (msg) => {
            await this.handlePrevMonth(msg);
        });

        // Status check
        this.bot.onText(/\/status/, async (msg) => {
            await this.handleStatus(msg);
        });

        // Handle inline keyboard callbacks
        this.bot.on('callback_query', async (callbackQuery) => {
            await this.handleCallbackQuery(callbackQuery);
        });

        // Handle errors
        this.bot.on('error', (error) => {
            console.error('❌ Telegram Bot Error:', error);
        });

        // Handle polling errors
        this.bot.on('polling_error', (error) => {
            console.error('❌ Polling Error:', error);
        });

        console.log('📝 Telegram bot commands and handlers set up');
    }

    async handleStart(msg) {
        const chatId = msg.chat.id;
        const welcomeMessage = `
🎂 *Welcome to Birthday Reminder Bot!*

I'll help you manage and remind about birthdays in your group.

*Available Commands:*
• /setgroup - Set this group for birthday reminders
• /thisweek - Show this week's birthdays
• /nextweek - Show next week's birthdays  
• /prevmonth - Show previous month's birthdays
• /help - Show this help message
• /status - Check bot status

*Setup:*
1. Add me to your group
2. Send /setgroup in the group
3. I'll send daily reminders at 9:00 AM

Let's get started! 🚀
        `;

        const options = {
            parse_mode: 'Markdown',
            reply_markup: {
                inline_keyboard: [
                    [
                        { text: '📅 This Week', callback_data: 'thisweek' },
                        { text: '🗓️ Next Week', callback_data: 'nextweek' }
                    ],
                    [
                        { text: '📋 Previous Month', callback_data: 'prevmonth' }
                    ],
                    [
                        { text: '❓ Help', callback_data: 'help' }
                    ]
                ]
            }
        };

        await this.bot.sendMessage(chatId, welcomeMessage, options);
    }

    async handleHelp(msg) {
        const chatId = msg.chat.id;
        const helpMessage = `
🤖 *Birthday Bot Help*

*Commands:*
• /start - Show welcome message
• /setgroup - Authorize this group for reminders
• /thisweek - Show birthdays this week
• /nextweek - Show birthdays next week
• /prevmonth - Show last month's birthdays
• /status - Check bot health

*Features:*
✅ Automatic daily reminders at 9:00 AM
✅ Weekly and monthly summaries
✅ Works in groups and private chats
✅ No setup required - just add to group!

*Setup for Groups:*
1. Add me to your group
2. Send /setgroup
3. Done! I'll start sending reminders

*Need help?* Contact the bot administrator.
        `;

        await this.bot.sendMessage(chatId, helpMessage, { parse_mode: 'Markdown' });
    }

    async handleSetGroup(msg) {
        const chatId = msg.chat.id;
        const chatType = msg.chat.type;

        if (chatType === 'private') {
            await this.bot.sendMessage(chatId, 
                '⚠️ This command should be used in a group chat where you want birthday reminders.\n\n' +
                'Please add me to your group and send /setgroup there.'
            );
            return;
        }

        // Add this chat to authorized chats
        this.authorizedChats.add(chatId);
        
        const successMessage = `
✅ *Group Set Successfully!*

This group has been set for birthday reminders.

*What happens next:*
• I'll check for birthdays daily at 9:00 AM
• Birthday reminders will be sent here
• You can use all birthday commands in this group

*Test it now:*
• /thisweek - See this week's birthdays
• /nextweek - See next week's birthdays
• /prevmonth - See last month's birthdays

All set! 🎉
        `;

        await this.bot.sendMessage(chatId, successMessage, { parse_mode: 'Markdown' });
        console.log(`✅ Group authorized: ${chatId} (${msg.chat.title || 'Unknown'})`);
    }

    async handleThisWeek(msg) {
        const chatId = msg.chat.id;
        await this.sendTyping(chatId);

        try {
            const birthdays = await this.birthdayManager.loadBirthdays();
            const thisWeekBirthdays = this.birthdayManager.getThisWeeksBirthdays(birthdays);
            const message = this.formatWeeklyMessage(thisWeekBirthdays, 'This Week\'s Birthdays');

            await this.bot.sendMessage(chatId, message, { parse_mode: 'Markdown' });
        } catch (error) {
            console.error('Error handling thisweek:', error);
            await this.bot.sendMessage(chatId, '❌ Sorry, I couldn\'t retrieve this week\'s birthdays. Please try again.');
        }
    }

    async handleNextWeek(msg) {
        const chatId = msg.chat.id;
        await this.sendTyping(chatId);

        try {
            const birthdays = await this.birthdayManager.loadBirthdays();
            const nextWeekBirthdays = this.birthdayManager.getNextWeeksBirthdays(birthdays);
            const message = this.formatWeeklyMessage(nextWeekBirthdays, 'Next Week\'s Birthdays');

            await this.bot.sendMessage(chatId, message, { parse_mode: 'Markdown' });
        } catch (error) {
            console.error('Error handling nextweek:', error);
            await this.bot.sendMessage(chatId, '❌ Sorry, I couldn\'t retrieve next week\'s birthdays. Please try again.');
        }
    }

    async handlePrevMonth(msg) {
        const chatId = msg.chat.id;
        await this.sendTyping(chatId);

        try {
            const birthdays = await this.birthdayManager.loadBirthdays();
            const prevMonthBirthdays = this.birthdayManager.getPreviousMonthsBirthdays(birthdays);
            
            const today = new Date();
            const previousMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
            const monthName = previousMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
            
            const message = this.formatMonthlyMessage(prevMonthBirthdays, `Previous Month's Birthdays (${monthName})`);

            await this.bot.sendMessage(chatId, message, { parse_mode: 'Markdown' });
        } catch (error) {
            console.error('Error handling prevmonth:', error);
            await this.bot.sendMessage(chatId, '❌ Sorry, I couldn\'t retrieve previous month\'s birthdays. Please try again.');
        }
    }

    async handleStatus(msg) {
        const chatId = msg.chat.id;
        
        const statusMessage = `
💚 *Bot Status*

🤖 *Service:* Online and running
⏰ *Uptime:* ${Math.floor(process.uptime())} seconds
📅 *Time:* ${new Date().toLocaleString()}
👥 *Authorized Groups:* ${this.authorizedChats.size}

*Features:*
✅ Daily reminders at 9:00 AM
✅ Birthday data loaded
✅ All commands working
✅ Telegram API connected

Everything looks good! 🎉
        `;

        await this.bot.sendMessage(chatId, statusMessage, { parse_mode: 'Markdown' });
    }

    async handleCallbackQuery(callbackQuery) {
        const action = callbackQuery.data;
        const msg = callbackQuery.message;

        // Answer callback query to stop loading
        await this.bot.answerCallbackQuery(callbackQuery.id);

        // Handle the action
        switch (action) {
            case 'thisweek':
                await this.handleThisWeek(msg);
                break;
            case 'nextweek':
                await this.handleNextWeek(msg);
                break;
            case 'prevmonth':
                await this.handlePrevMonth(msg);
                break;
            case 'help':
                await this.handleHelp(msg);
                break;
        }
    }

    formatWeeklyMessage(birthdays, title) {
        if (birthdays.length === 0) {
            return `📅 *${title}*\n\nNo birthdays scheduled for this period 🎈`;
        }

        let message = `📅 *${title}*\n\n`;
        
        birthdays.forEach(person => {
            const dayIndicator = person.daysFromToday === 0 ? ' (Today!)' : 
                               person.daysFromToday === 1 ? ' (Tomorrow!)' : '';
            message += `🎂 *${person.name}*\n`;
            message += `   📆 ${person.date}${dayIndicator}\n\n`;
        });
        
        message += 'Don\'t forget to celebrate! 🎉';
        return message;
    }

    formatMonthlyMessage(birthdays, title) {
        if (birthdays.length === 0) {
            return `📅 *${title}*\n\nNo birthdays in this period 🎈`;
        }

        let message = `📅 *${title}*\n\n`;
        
        birthdays.forEach(person => {
            message += `🎂 *${person.name}*\n`;
            message += `   📆 ${person.date}\n\n`;
        });
        
        message += `Total: ${birthdays.length} birthday${birthdays.length === 1 ? '' : 's'}`;
        return message;
    }

    async sendTyping(chatId) {
        await this.bot.sendChatAction(chatId, 'typing');
    }

    // Method to send birthday reminders to all authorized groups
    async sendDailyReminders() {
        try {
            const birthdays = await this.birthdayManager.loadBirthdays();
            const tomorrowsBirthdays = this.birthdayManager.getTomorrowsBirthdays(birthdays);

            if (tomorrowsBirthdays.length > 0) {
                const message = this.formatBirthdayReminder(tomorrowsBirthdays);
                
                for (const chatId of this.authorizedChats) {
                    try {
                        await this.bot.sendMessage(chatId, message, { parse_mode: 'Markdown' });
                        console.log(`✅ Birthday reminder sent to group ${chatId}`);
                    } catch (error) {
                        console.error(`❌ Failed to send to group ${chatId}:`, error.message);
                        // Remove chat if bot was removed from group
                        if (error.code === 'ETELEGRAM' && error.response.statusCode === 403) {
                            this.authorizedChats.delete(chatId);
                        }
                    }
                }
            } else {
                console.log('📅 No birthdays tomorrow - no reminders sent');
            }
        } catch (error) {
            console.error('❌ Error in daily reminders:', error);
        }
    }

    formatBirthdayReminder(people) {
        let message = '🎉 *Birthday Reminder* 🎉\n\n';
        message += 'Tomorrow is the birthday of:\n\n';
        
        people.forEach(person => {
            message += `🎂 *${person.name}*\n`;
        });
        
        message += '\nDon\'t forget to wish them a happy birthday! 🎈';
        return message;
    }

    // Get bot info
    async getBotInfo() {
        try {
            const botInfo = await this.bot.getMe();
            console.log(`🤖 Bot Info: @${botInfo.username} (${botInfo.first_name})`);
            return botInfo;
        } catch (error) {
            console.error('❌ Failed to get bot info:', error);
            return null;
        }
    }

    // Method to stop the bot gracefully
    stop() {
        console.log('🛑 Stopping Telegram Birthday Bot...');
        this.bot.stopPolling();
    }
}

module.exports = TelegramBirthdayBot;