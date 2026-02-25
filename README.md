# Birthday Reminder WhatsApp Bot

A WhatsApp bot that automatically sends birthday reminders to your church group one day before members' birthdays.

## Features

- Automatically checks for upcoming birthdays daily
- Sends reminders to WhatsApp groups one day before birthdays
- Interactive commands to check upcoming birthdays
- Easy management of birthday data through JSON file
- Scheduled daily checks at 9:00 AM
- Simple setup with QR code authentication

## Setup Instructions

### 1. Install Dependencies
```bash
npm install
```

### 2. Add Birthday Data
Edit `data/birthdays.json` with your church members' information:
```json
[
  {
    "name": "John Doe",
    "birthday": "03-15",
    "phone": "+1234567890"
  }
]
```
**Note:** Use MM-DD format for birthdays (e.g., "03-15" for March 15th)

### 3. Run the Bot
```bash
npm start
```

### 4. Setup WhatsApp
1. Scan the QR code with your WhatsApp
2. Go to your church WhatsApp group
3. Send the message: `!setgroup`
4. The bot will confirm the group is set for reminders

### 5. The Bot is Now Active!
- Checks for birthdays daily at 9:00 AM
- Automatically sends reminders one day before birthdays
- Keep the bot running continuously for automatic reminders

## Commands

All commands work only in the group that has been set with `!setgroup`:

- `!setgroup` - Set the current group as the birthday reminder group
- `!thisweek` - Show all birthdays coming up this week (next 7 days)
- `!nextweek` - Show all birthdays coming up next week (days 8-14)
- `!help` or `!commands` - Show available commands

### Example Usage:
- Type `!thisweek` in your church group to see who has birthdays coming up
- Type `!nextweek` to plan ahead for next week's celebrations
- The bot will respond with formatted birthday information including dates

## File Structure

- `src/index.js` - Main application entry point
- `src/whatsappBot.js` - WhatsApp integration
- `src/birthdayManager.js` - Birthday data management
- `src/birthdayChecker.js` - Birthday checking logic
- `data/birthdays.json` - Birthday data storage

## Development

Run in development mode with auto-restart:
```bash
npm run dev
```

## Notes

- The bot needs to stay running to send automatic reminders
- Birthday data is stored locally in `data/birthdays.json`
- Authentication session is saved locally for reconnection
- The bot checks for birthdays every day at 9:00 AM