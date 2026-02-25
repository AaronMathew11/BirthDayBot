const BirthdayManager = require('./birthdayManager');

class BirthdayChecker {
    constructor(whatsappBot) {
        this.birthdayManager = new BirthdayManager();
        this.whatsappBot = whatsappBot;
    }

    async checkAndSendReminders() {
        console.log('Checking for upcoming birthdays...');
        
        try {
            const birthdays = await this.birthdayManager.loadBirthdays();
            const tomorrowsBirthdays = this.birthdayManager.getTomorrowsBirthdays(birthdays);
            
            if (tomorrowsBirthdays.length > 0) {
                const message = this.birthdayManager.formatBirthdayMessage(tomorrowsBirthdays);
                console.log(`Found ${tomorrowsBirthdays.length} birthday(s) tomorrow`);
                
                const success = await this.whatsappBot.sendMessage(message);
                if (success) {
                    console.log('Birthday reminder sent successfully');
                } else {
                    console.log('Failed to send birthday reminder');
                }
            } else {
                console.log('No birthdays tomorrow');
            }
        } catch (error) {
            console.error('Error checking birthdays:', error);
        }
    }

    async testBirthdayCheck() {
        const birthdays = await this.birthdayManager.loadBirthdays();
        const tomorrowsBirthdays = this.birthdayManager.getTomorrowsBirthdays(birthdays);
        
        console.log('Current birthdays:', birthdays);
        console.log('Tomorrow\'s birthdays:', tomorrowsBirthdays);
        
        if (tomorrowsBirthdays.length > 0) {
            const message = this.birthdayManager.formatBirthdayMessage(tomorrowsBirthdays);
            console.log('Generated message:');
            console.log(message);
        }
    }
}

module.exports = BirthdayChecker;