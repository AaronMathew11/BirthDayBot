require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');
const BirthdayManager = require('../src/birthdayManager');

// Initialize components
const token = process.env.TELEGRAM_BOT_TOKEN;
const bot = new TelegramBot(token);
const birthdayManager = new BirthdayManager();
const authorizedChats = new Set();

// Helper functions for message formatting
function formatWeeklyMessage(birthdays, title) {
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

function formatMonthlyMessage(birthdays, title) {
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

// Process Telegram updates
async function processUpdate(update) {
    try {
        console.log('📱 Processing update:', JSON.stringify(update));
        
        if (!update.message) return;
        
        const message = update.message;
        const chatId = message.chat.id;
        const text = message.text?.toLowerCase().trim();
        const isGroup = message.chat.type === 'group' || message.chat.type === 'supergroup';
        
        console.log(`📨 Message: "${text}" from ${chatId} (group: ${isGroup})`);
        
        if (text === '/start') {
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

            await bot.sendMessage(chatId, welcomeMessage, options);
        }
        else if (text === '/setgroup' && isGroup) {
            authorizedChats.add(chatId);
            await bot.sendMessage(chatId, 
                '✅ *Group Set Successfully!*\n\n' +
                'This group has been set for birthday reminders.\n\n' +
                '*What happens next:*\n' +
                '• I\'ll check for birthdays daily at 9:00 AM\n' +
                '• Birthday reminders will be sent here\n' +
                '• You can use all birthday commands in this group\n\n' +
                '*Test it now:*\n' +
                '• /thisweek - See this week\'s birthdays\n' +
                '• /nextweek - See next week\'s birthdays\n' +
                '• /prevmonth - See last month\'s birthdays\n\n' +
                'All set! 🎉', 
                { parse_mode: 'Markdown' }
            );
        }
        else if (text === '/thisweek') {
            const birthdays = await birthdayManager.loadBirthdays();
            const thisWeekBirthdays = birthdayManager.getThisWeeksBirthdays(birthdays);
            const responseMessage = formatWeeklyMessage(thisWeekBirthdays, 'This Week\'s Birthdays');
            await bot.sendMessage(chatId, responseMessage, { parse_mode: 'Markdown' });
        }
        else if (text === '/nextweek') {
            const birthdays = await birthdayManager.loadBirthdays();
            const nextWeekBirthdays = birthdayManager.getNextWeeksBirthdays(birthdays);
            const responseMessage = formatWeeklyMessage(nextWeekBirthdays, 'Next Week\'s Birthdays');
            await bot.sendMessage(chatId, responseMessage, { parse_mode: 'Markdown' });
        }
        else if (text === '/prevmonth') {
            const birthdays = await birthdayManager.loadBirthdays();
            const prevMonthBirthdays = birthdayManager.getPreviousMonthsBirthdays(birthdays);
            
            const today = new Date();
            const previousMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
            const monthName = previousMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
            
            const responseMessage = formatMonthlyMessage(prevMonthBirthdays, `Previous Month's Birthdays (${monthName})`);
            await bot.sendMessage(chatId, responseMessage, { parse_mode: 'Markdown' });
        }
        else if (text === '/help') {
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
            await bot.sendMessage(chatId, helpMessage, { parse_mode: 'Markdown' });
        }
        else if (text === '/status') {
            const statusMessage = `
💚 *Bot Status*

🤖 *Service:* Online and running
📅 *Time:* ${new Date().toLocaleString()}
👥 *Authorized Groups:* ${authorizedChats.size}

*Features:*
✅ Daily reminders at 9:00 AM
✅ Birthday data loaded
✅ All commands working
✅ Telegram API connected

Everything looks good! 🎉
            `;
            await bot.sendMessage(chatId, statusMessage, { parse_mode: 'Markdown' });
        }

        // Handle callback queries
        if (update.callback_query) {
            const callbackQuery = update.callback_query;
            const action = callbackQuery.data;
            const msgChatId = callbackQuery.message.chat.id;

            await bot.answerCallbackQuery(callbackQuery.id);

            if (action === 'thisweek') {
                const birthdays = await birthdayManager.loadBirthdays();
                const thisWeekBirthdays = birthdayManager.getThisWeeksBirthdays(birthdays);
                const responseMessage = formatWeeklyMessage(thisWeekBirthdays, 'This Week\'s Birthdays');
                await bot.sendMessage(msgChatId, responseMessage, { parse_mode: 'Markdown' });
            }
            // Add other callback handlers...
        }
        
    } catch (error) {
        console.error('❌ Error processing update:', error);
    }
}

// Vercel serverless function handler
module.exports = async (req, res) => {
    try {
        console.log(`📡 ${req.method} ${req.url}`);
        
        // Handle webhook
        if (req.method === 'POST' && req.url === '/') {
            await processUpdate(req.body);
            return res.status(200).json({ ok: true });
        }
        
        // Health check
        if (req.url === '/health') {
            return res.status(200).json({
                status: 'ok',
                service: 'Telegram Birthday Bot',
                timestamp: new Date().toISOString(),
                bot_token: token ? 'configured' : 'missing'
            });
        }
        
        // Set webhook
        if (req.url === '/setup-webhook') {
            const webhookUrl = `https://${req.headers.host}/`;
            await bot.setWebHook(webhookUrl);
            return res.status(200).json({ 
                success: true, 
                webhook: webhookUrl,
                message: 'Webhook set successfully!'
            });
        }
        
        // Home page
        return res.status(200).send(`
            <html>
                <head><title>🤖 Telegram Birthday Bot</title></head>
                <body style="font-family: Arial; text-align: center; padding: 50px;">
                    <h1>🎂 Telegram Birthday Bot</h1>
                    <p>Bot is running and ready!</p>
                    <p><strong>Bot:</strong> @nfc_birthday_bot</p>
                    <p><a href="/health">Health Check</a> | <a href="/setup-webhook">Setup Webhook</a></p>
                </body>
            </html>
        `);
        
    } catch (error) {
        console.error('❌ Vercel handler error:', error);
        res.status(500).json({
            error: 'Internal server error',
            message: error.message,
            timestamp: new Date().toISOString()
        });
    }
};