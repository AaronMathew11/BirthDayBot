const fs = require('fs').promises;
const path = require('path');

class BirthdayManager {
    constructor() {
        this.birthdaysFile = path.join(__dirname, '../data/birthdays.json');
    }

    async loadBirthdays() {
        try {
            const data = await fs.readFile(this.birthdaysFile, 'utf8');
            return JSON.parse(data);
        } catch (error) {
            console.error('Error loading birthdays:', error);
            return [];
        }
    }

    async saveBirthdays(birthdays) {
        try {
            await fs.writeFile(this.birthdaysFile, JSON.stringify(birthdays, null, 2));
            return true;
        } catch (error) {
            console.error('Error saving birthdays:', error);
            return false;
        }
    }

    async addBirthday(name, birthday, phone) {
        const birthdays = await this.loadBirthdays();
        birthdays.push({ name, birthday, phone });
        return await this.saveBirthdays(birthdays);
    }

    getTomorrowsBirthdays(birthdays) {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        
        const tomorrowMonth = String(tomorrow.getMonth() + 1).padStart(2, '0');
        const tomorrowDay = String(tomorrow.getDate()).padStart(2, '0');
        const tomorrowDateStr = `${tomorrowMonth}-${tomorrowDay}`;
        
        return birthdays.filter(person => person.birthday === tomorrowDateStr);
    }

    getThisWeeksBirthdays(birthdays) {
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
                    date: checkDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' }),
                    daysFromToday: i
                });
            });
        }
        
        return thisWeekBirthdays.sort((a, b) => a.daysFromToday - b.daysFromToday);
    }

    getNextWeeksBirthdays(birthdays) {
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
                    date: checkDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' }),
                    daysFromToday: i
                });
            });
        }
        
        return nextWeekBirthdays.sort((a, b) => a.daysFromToday - b.daysFromToday);
    }

    getPreviousMonthsBirthdays(birthdays) {
        const today = new Date();
        const previousMonthBirthdays = [];
        
        // Get the previous month
        const previousMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
        const previousMonthNumber = String(previousMonth.getMonth() + 1).padStart(2, '0');
        
        // Get all days in the previous month
        const daysInPrevMonth = new Date(previousMonth.getFullYear(), previousMonth.getMonth() + 1, 0).getDate();
        
        for (let day = 1; day <= daysInPrevMonth; day++) {
            const dayStr = String(day).padStart(2, '0');
            const dateStr = `${previousMonthNumber}-${dayStr}`;
            
            const dayBirthdays = birthdays.filter(person => person.birthday === dateStr);
            dayBirthdays.forEach(person => {
                const birthdayDate = new Date(previousMonth.getFullYear(), previousMonth.getMonth(), day);
                previousMonthBirthdays.push({
                    ...person,
                    date: birthdayDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' }),
                    actualDate: birthdayDate
                });
            });
        }
        
        return previousMonthBirthdays.sort((a, b) => a.actualDate - b.actualDate);
    }

    formatBirthdayMessage(people) {
        if (people.length === 0) return null;
        
        let message = '🎉 *Birthday Reminder* 🎉\n\n';
        message += 'Tomorrow is the birthday of:\n\n';
        
        people.forEach(person => {
            message += `🎂 *${person.name}*\n`;
        });
        
        message += '\nDon\'t forget to wish them a happy birthday! 🎈';
        return message;
    }

    formatWeeklyBirthdayMessage(people, weekTitle) {
        if (people.length === 0) {
            return `📅 *${weekTitle}*\n\nNo birthdays scheduled for ${weekTitle.toLowerCase()} 🎈`;
        }
        
        let message = `📅 *${weekTitle}*\n\n`;
        
        people.forEach(person => {
            const dayIndicator = person.daysFromToday === 0 ? ' (Today!)' : 
                                 person.daysFromToday === 1 ? ' (Tomorrow!)' : '';
            message += `🎂 *${person.name}*\n`;
            message += `   📆 ${person.date}${dayIndicator}\n\n`;
        });
        
        message += 'Don\'t forget to have the posters posted out by tomorrow 10 AM!';
        return message;
    }

    formatMonthlyBirthdayMessage(people, monthTitle) {
        if (people.length === 0) {
            return `📅 *${monthTitle}*\n\nNo birthdays in ${monthTitle.toLowerCase()} 🎈`;
        }
        
        let message = `📅 *${monthTitle}*\n\n`;
        
        people.forEach(person => {
            message += `🎂 *${person.name}*\n`;
            message += `   📆 ${person.date}\n\n`;
        });
        
        message += `Total: ${people.length} birthday${people.length === 1 ? '' : 's'} in ${monthTitle.toLowerCase()}`;
        return message;
    }
}

module.exports = BirthdayManager;