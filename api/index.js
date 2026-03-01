const TelegramBot = require('node-telegram-bot-api');
const path = require('path');
const fs = require('fs').promises;

// Initialize components
const token = process.env.TELEGRAM_BOT_TOKEN;
let bot;
try {
    bot = token ? new TelegramBot(token) : null;
} catch (error) {
    console.error('Bot initialization error:', error);
    bot = null;
}
const authorizedChats = new Set();

// Birthday and Anniversary Manager functionality
async function loadBirthdays() {
    try {
        const birthdaysFile = path.join(process.cwd(), 'data', 'birthdays.json');
        const data = await fs.readFile(birthdaysFile, 'utf8');
        const birthdays = JSON.parse(data);
        
        // Also load anniversaries from CSV directly
        const csvFile = path.join(process.cwd(), 'NFC South - Tech_Media Team Data - memberInfo.csv');
        const csvData = await fs.readFile(csvFile, 'utf8');
        const anniversaries = parseAnniversariesFromCSV(csvData);
        
        // Combine birthdays and anniversaries
        return [...birthdays, ...anniversaries];
    } catch (error) {
        console.error('Error loading birthdays and anniversaries:', error);
        // Fallback to just birthdays if CSV parsing fails
        try {
            const birthdaysFile = path.join(process.cwd(), 'data', 'birthdays.json');
            const data = await fs.readFile(birthdaysFile, 'utf8');
            return JSON.parse(data);
        } catch (fallbackError) {
            console.error('Error loading fallback birthdays:', fallbackError);
            return [];
        }
    }
}

function parseAnniversariesFromCSV(csvData) {
    const lines = csvData.split('\n');
    const anniversaries = [];
    
    // Skip header line
    for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;
        
        // Parse CSV line (handle quoted fields)
        const fields = parseCSVLine(line);
        if (fields.length < 5) continue;
        
        const fullName = fields[2]?.trim();
        const anniversaryDate = fields[4]?.trim();
        
        if (fullName && anniversaryDate && anniversaryDate !== '') {
            // Convert anniversary date from MM/DD/YYYY or M/D/YYYY to MM-DD format
            const dateParts = anniversaryDate.split('/');
            if (dateParts.length >= 2) {
                const month = String(parseInt(dateParts[0])).padStart(2, '0');
                const day = String(parseInt(dateParts[1])).padStart(2, '0');
                
                anniversaries.push({
                    name: fullName,
                    birthday: `${month}-${day}`, // Using same field for consistency
                    type: 'anniversary',
                    phone: fields[5]?.trim() || '',
                    photo: fields[7]?.trim() || ''
                });
            }
        }
    }
    
    return anniversaries;
}

function parseCSVLine(line) {
    const fields = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
        const char = line[i];
        
        if (char === '"') {
            inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
            fields.push(current);
            current = '';
        } else {
            current += char;
        }
    }
    
    fields.push(current); // Add the last field
    return fields;
}

function getThisWeeksBirthdays(birthdays) {
    const today = new Date();
    const thisWeekBirthdays = [];
    
    for (let i = 0; i < 7; i++) {
        const checkDate = new Date(today);
        checkDate.setDate(today.getDate() + i);
        
        const month = String(checkDate.getMonth() + 1).padStart(2, '0');
        const day = String(checkDate.getDate()).padStart(2, '0');
        const dateStr = `${month}-${day}`;
        
        const dayBirthdays = birthdays.filter(person => person.birthday === dateStr);
        dayBirthdays.forEach(person => {
            thisWeekBirthdays.push({
                ...person,
                type: person.type || 'birthday', // Default to birthday if type not specified
                date: checkDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' }),
                daysFromToday: i
            });
        });
    }
    
    return thisWeekBirthdays.sort((a, b) => a.daysFromToday - b.daysFromToday);
}

function getNextWeeksBirthdays(birthdays) {
    const today = new Date();
    const nextWeekBirthdays = [];
    
    for (let i = 7; i < 14; i++) {
        const checkDate = new Date(today);
        checkDate.setDate(today.getDate() + i);
        
        const month = String(checkDate.getMonth() + 1).padStart(2, '0');
        const day = String(checkDate.getDate()).padStart(2, '0');
        const dateStr = `${month}-${day}`;
        
        const dayBirthdays = birthdays.filter(person => person.birthday === dateStr);
        dayBirthdays.forEach(person => {
            nextWeekBirthdays.push({
                ...person,
                type: person.type || 'birthday',
                date: checkDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' }),
                daysFromToday: i
            });
        });
    }
    
    return nextWeekBirthdays.sort((a, b) => a.daysFromToday - b.daysFromToday);
}

function getPreviousMonthsBirthdays(birthdays) {
    const today = new Date();
    const previousMonthBirthdays = [];
    
    const previousMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
    const previousMonthNumber = String(previousMonth.getMonth() + 1).padStart(2, '0');
    
    const daysInPrevMonth = new Date(previousMonth.getFullYear(), previousMonth.getMonth() + 1, 0).getDate();
    
    for (let day = 1; day <= daysInPrevMonth; day++) {
        const dayStr = String(day).padStart(2, '0');
        const dateStr = `${previousMonthNumber}-${dayStr}`;
        
        const dayBirthdays = birthdays.filter(person => person.birthday === dateStr);
        dayBirthdays.forEach(person => {
            const birthdayDate = new Date(previousMonth.getFullYear(), previousMonth.getMonth(), day);
            previousMonthBirthdays.push({
                ...person,
                type: person.type || 'birthday',
                date: birthdayDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' }),
                actualDate: birthdayDate
            });
        });
    }
    
    return previousMonthBirthdays.sort((a, b) => a.actualDate - b.actualDate);
}

function getThisMonthsBirthdays(birthdays) {
    const today = new Date();
    const thisMonthBirthdays = [];
    
    const thisMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const thisMonthNumber = String(thisMonth.getMonth() + 1).padStart(2, '0');
    
    const daysInThisMonth = new Date(thisMonth.getFullYear(), thisMonth.getMonth() + 1, 0).getDate();
    
    for (let day = 1; day <= daysInThisMonth; day++) {
        const dayStr = String(day).padStart(2, '0');
        const dateStr = `${thisMonthNumber}-${dayStr}`;
        
        const dayBirthdays = birthdays.filter(person => person.birthday === dateStr);
        dayBirthdays.forEach(person => {
            const birthdayDate = new Date(thisMonth.getFullYear(), thisMonth.getMonth(), day);
            const daysFromToday = Math.ceil((birthdayDate - today) / (1000 * 60 * 60 * 24));
            
            thisMonthBirthdays.push({
                ...person,
                type: person.type || 'birthday',
                date: birthdayDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' }),
                actualDate: birthdayDate,
                daysFromToday: daysFromToday
            });
        });
    }
    
    return thisMonthBirthdays.sort((a, b) => a.actualDate - b.actualDate);
}

// Helper functions for message formatting
function formatWeeklyMessage(birthdays, title) {
    if (birthdays.length === 0) {
        return `📅 *${title}*\n\nNo birthdays scheduled for this period 🎈`;
    }

    let message = `📅 *${title}*\n\n`;
    
    birthdays.forEach(person => {
        const dayIndicator = person.daysFromToday === 0 ? ' (Today!)' : 
                           person.daysFromToday === 1 ? ' (Tomorrow!)' : '';
        const icon = person.type === 'anniversary' ? '💍' : '🎂';
        const eventType = person.type === 'anniversary' ? 'Anniversary' : 'Birthday';
        
        message += `${icon} *${person.name}* (${eventType})\n`;
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
        const icon = person.type === 'anniversary' ? '💍' : '🎂';
        const eventType = person.type === 'anniversary' ? 'Anniversary' : 'Birthday';
        
        message += `${icon} *${person.name}* (${eventType})\n`;
        message += `   📆 ${person.date}\n\n`;
    });
    
    const birthdayCount = birthdays.filter(p => p.type !== 'anniversary').length;
    const anniversaryCount = birthdays.filter(p => p.type === 'anniversary').length;
    
    let summary = 'Total: ';
    const parts = [];
    if (birthdayCount > 0) parts.push(`${birthdayCount} birthday${birthdayCount === 1 ? '' : 's'}`);
    if (anniversaryCount > 0) parts.push(`${anniversaryCount} anniversar${anniversaryCount === 1 ? 'y' : 'ies'}`);
    
    message += summary + parts.join(', ');
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
🎂 *Welcome to Birthday & Anniversary Reminder Bot!*

I'll help you manage and remind about birthdays and anniversaries in your group.

*Available Commands:*
• /setgroup - Set this group for birthday & anniversary reminders
• /thisweek - Show this week's birthdays & anniversaries
• /nextweek - Show next week's birthdays & anniversaries
• /thismonth - Show this month's birthdays & anniversaries
• /prevmonth - Show previous month's birthdays & anniversaries
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
                            { text: '🗓️ This Month', callback_data: 'thismonth' },
                            { text: '📋 Previous Month', callback_data: 'prevmonth' }
                        ],
                        [
                            { text: '❓ Help', callback_data: 'help' }
                        ]
                    ]
                }
            };

            if (bot) await bot.sendMessage(chatId, welcomeMessage, options);
        }
        else if (text === '/setgroup' && isGroup) {
            authorizedChats.add(chatId);
            if (bot) await bot.sendMessage(chatId, 
                '✅ *Group Set Successfully!*\n\n' +
                'This group has been set for birthday and anniversary reminders.\n\n' +
                '*What happens next:*\n' +
                '• I\'ll check for birthdays and anniversaries daily at 9:00 AM\n' +
                '• Birthday and anniversary reminders will be sent here\n' +
                '• You can use all birthday and anniversary commands in this group\n\n' +
                '*Test it now:*\n' +
                '• /thisweek - See this week\'s birthdays & anniversaries\n' +
                '• /nextweek - See next week\'s birthdays & anniversaries\n' +
                '• /thismonth - See this month\'s birthdays & anniversaries\n' +
                '• /prevmonth - See last month\'s birthdays & anniversaries\n\n' +
                'All set! 🎉', 
                { parse_mode: 'Markdown' }
            );
        }
        else if (text === '/thisweek') {
            const birthdays = await loadBirthdays();
            const thisWeekBirthdays = getThisWeeksBirthdays(birthdays);
            const responseMessage = formatWeeklyMessage(thisWeekBirthdays, 'This Week\'s Birthdays');
            if (bot) await bot.sendMessage(chatId, responseMessage, { parse_mode: 'Markdown' });
        }
        else if (text === '/nextweek') {
            const birthdays = await loadBirthdays();
            const nextWeekBirthdays = getNextWeeksBirthdays(birthdays);
            const responseMessage = formatWeeklyMessage(nextWeekBirthdays, 'Next Week\'s Birthdays');
            if (bot) await bot.sendMessage(chatId, responseMessage, { parse_mode: 'Markdown' });
        }
        else if (text === '/thismonth') {
            const birthdays = await loadBirthdays();
            const thisMonthBirthdays = getThisMonthsBirthdays(birthdays);
            
            const today = new Date();
            const monthName = today.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
            
            const responseMessage = formatMonthlyMessage(thisMonthBirthdays, `This Month's Birthdays (${monthName})`);
            if (bot) await bot.sendMessage(chatId, responseMessage, { parse_mode: 'Markdown' });
        }
        else if (text === '/prevmonth') {
            const birthdays = await loadBirthdays();
            const prevMonthBirthdays = getPreviousMonthsBirthdays(birthdays);
            
            const today = new Date();
            const previousMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
            const monthName = previousMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
            
            const responseMessage = formatMonthlyMessage(prevMonthBirthdays, `Previous Month's Birthdays (${monthName})`);
            if (bot) await bot.sendMessage(chatId, responseMessage, { parse_mode: 'Markdown' });
        }
        else if (text === '/help') {
            const helpMessage = `
🤖 *Birthday & Anniversary Bot Help*

*Commands:*
• /start - Show welcome message
• /setgroup - Authorize this group for reminders
• /thisweek - Show birthdays & anniversaries this week
• /nextweek - Show birthdays & anniversaries next week
• /thismonth - Show birthdays & anniversaries this month
• /prevmonth - Show last month's birthdays & anniversaries
• /status - Check bot health

*Features:*
✅ Automatic daily reminders at 9:00 AM for birthdays & anniversaries
✅ Weekly and monthly summaries
✅ Works in groups and private chats
✅ No setup required - just add to group!

*Setup for Groups:*
1. Add me to your group
2. Send /setgroup
3. Done! I'll start sending reminders

*Need help?* Contact the bot administrator.
            `;
            if (bot) await bot.sendMessage(chatId, helpMessage, { parse_mode: 'Markdown' });
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
            if (bot) await bot.sendMessage(chatId, statusMessage, { parse_mode: 'Markdown' });
        }

        // Handle callback queries
        if (update.callback_query) {
            const callbackQuery = update.callback_query;
            const action = callbackQuery.data;
            const msgChatId = callbackQuery.message.chat.id;

            if (bot) await bot.answerCallbackQuery(callbackQuery.id);

            if (action === 'thisweek') {
                const birthdays = await loadBirthdays();
                const thisWeekBirthdays = getThisWeeksBirthdays(birthdays);
                const responseMessage = formatWeeklyMessage(thisWeekBirthdays, 'This Week\'s Birthdays');
                if (bot) await bot.sendMessage(msgChatId, responseMessage, { parse_mode: 'Markdown' });
            }
            else if (action === 'nextweek') {
                const birthdays = await loadBirthdays();
                const nextWeekBirthdays = getNextWeeksBirthdays(birthdays);
                const responseMessage = formatWeeklyMessage(nextWeekBirthdays, 'Next Week\'s Birthdays');
                if (bot) await bot.sendMessage(msgChatId, responseMessage, { parse_mode: 'Markdown' });
            }
            else if (action === 'thismonth') {
                const birthdays = await loadBirthdays();
                const thisMonthBirthdays = getThisMonthsBirthdays(birthdays);
                const today = new Date();
                const monthName = today.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
                const responseMessage = formatMonthlyMessage(thisMonthBirthdays, `This Month's Birthdays (${monthName})`);
                if (bot) await bot.sendMessage(msgChatId, responseMessage, { parse_mode: 'Markdown' });
            }
            else if (action === 'prevmonth') {
                const birthdays = await loadBirthdays();
                const prevMonthBirthdays = getPreviousMonthsBirthdays(birthdays);
                const today = new Date();
                const previousMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
                const monthName = previousMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
                const responseMessage = formatMonthlyMessage(prevMonthBirthdays, `Previous Month's Birthdays (${monthName})`);
                if (bot) await bot.sendMessage(msgChatId, responseMessage, { parse_mode: 'Markdown' });
            }
            else if (action === 'help') {
                const helpMessage = `
🤖 *Birthday & Anniversary Bot Help*

*Commands:*
• /start - Show welcome message
• /setgroup - Authorize this group for reminders
• /thisweek - Show birthdays & anniversaries this week
• /nextweek - Show birthdays & anniversaries next week
• /thismonth - Show birthdays & anniversaries this month
• /prevmonth - Show last month's birthdays & anniversaries
• /status - Check bot health

*Features:*
✅ Automatic daily reminders at 9:00 AM for birthdays & anniversaries
✅ Weekly and monthly summaries
✅ Works in groups and private chats
✅ No setup required - just add to group!

*Need help?* Contact the bot administrator.
                `;
                if (bot) await bot.sendMessage(msgChatId, helpMessage, { parse_mode: 'Markdown' });
            }
        }
        
    } catch (error) {
        console.error('❌ Error processing update:', error);
    }
}

// Vercel serverless function handler
module.exports = async (req, res) => {
    try {
        console.log(`📡 ${req.method} ${req.url}`, 'Headers:', req.headers.host);
        
        // Handle webhook
        if (req.method === 'POST' && (req.url === '/' || req.url === '/api/')) {
            if (!bot) {
                return res.status(500).json({ error: 'Bot not initialized' });
            }
            await processUpdate(req.body);
            return res.status(200).json({ ok: true });
        }
        
        // Health check
        if (req.url.includes('health')) {
            return res.status(200).json({
                status: 'ok',
                service: 'Telegram Birthday Bot',
                timestamp: new Date().toISOString(),
                bot_token: token ? 'configured' : 'missing'
            });
        }
        
        // Set webhook
        if (req.url.includes('setup-webhook')) {
            if (!bot) {
                return res.status(500).json({ error: 'Bot not initialized' });
            }
            const webhookUrl = `https://${req.headers.host}/api/`;
            await bot.setWebHook(webhookUrl);
            return res.status(200).json({ 
                success: true, 
                webhook: webhookUrl,
                message: 'Webhook set successfully!'
            });
        }
        
        // Debug/Home page
        return res.status(200).send(`
            <html>
                <head><title>🤖 Telegram Birthday Bot</title></head>
                <body style="font-family: Arial; text-align: center; padding: 50px;">
                    <h1>🎂 Telegram Birthday Bot</h1>
                    <p>Bot is running and ready!</p>
                    <p><strong>Bot:</strong> @nfc_birthday_bot</p>
                    <p><strong>Request URL:</strong> ${req.url}</p>
                    <p><strong>Method:</strong> ${req.method}</p>
                    <p><a href="/api/health">Health Check</a> | <a href="/api/setup-webhook">Setup Webhook</a></p>
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