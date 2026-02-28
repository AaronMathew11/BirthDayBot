require('dotenv').config();
const TelegramBirthdayApp = require('../src/telegramBirthdayApp');

// Create the app instance
let app = null;
let telegramApp = null;

async function initializeApp() {
    if (!telegramApp) {
        telegramApp = new TelegramBirthdayApp();
        const initialized = await telegramApp.initialize();
        if (initialized) {
            app = telegramApp.app;
            console.log('✅ Telegram Birthday App initialized for Vercel');
        } else {
            console.error('❌ Failed to initialize Telegram app');
            throw new Error('Failed to initialize Telegram app');
        }
    }
    return app;
}

// Vercel serverless function handler
module.exports = async (req, res) => {
    try {
        // Initialize app if not already done
        const expressApp = await initializeApp();
        
        // Handle the request with Express app
        return expressApp(req, res);
    } catch (error) {
        console.error('❌ Vercel handler error:', error);
        res.status(500).json({
            error: 'Internal server error',
            message: error.message,
            timestamp: new Date().toISOString()
        });
    }
};