const fs = require('fs').promises;
const path = require('path');

class CSVConverter {
    constructor() {
        this.csvFile = path.join(__dirname, '../NFC South - Tech_Media Team Data - memberInfo.csv');
        this.birthdaysFile = path.join(__dirname, '../data/birthdays.json');
    }

    async convertCSVToJSON() {
        try {
            const csvData = await fs.readFile(this.csvFile, 'utf8');
            const lines = csvData.split('\n');
            const headers = lines[0].split(',');
            
            const birthdays = [];
            
            for (let i = 1; i < lines.length; i++) {
                const line = lines[i].trim();
                if (!line) continue;
                
                const values = this.parseCSVLine(line);
                if (values.length < headers.length) continue;
                
                const fullName = values[2]?.trim();
                const dob = values[3]?.trim();
                const phoneNumber = values[6]?.trim();
                
                if (fullName && dob && this.isValidDate(dob)) {
                    const birthday = this.formatBirthday(dob);
                    if (birthday) {
                        birthdays.push({
                            name: fullName,
                            birthday: birthday,
                            phone: phoneNumber || 'N/A'
                        });
                    }
                }
            }
            
            await fs.writeFile(this.birthdaysFile, JSON.stringify(birthdays, null, 2));
            console.log(`✅ Successfully converted ${birthdays.length} birthdays from CSV to JSON`);
            return birthdays;
            
        } catch (error) {
            console.error('Error converting CSV:', error);
            return [];
        }
    }

    parseCSVLine(line) {
        const values = [];
        let current = '';
        let inQuotes = false;
        
        for (let i = 0; i < line.length; i++) {
            const char = line[i];
            
            if (char === '"') {
                inQuotes = !inQuotes;
            } else if (char === ',' && !inQuotes) {
                values.push(current);
                current = '';
            } else {
                current += char;
            }
        }
        values.push(current);
        
        return values;
    }

    isValidDate(dateStr) {
        if (!dateStr || dateStr === 'N/A' || dateStr.trim() === '') return false;
        
        const date = new Date(dateStr);
        return date instanceof Date && !isNaN(date);
    }

    formatBirthday(dateStr) {
        try {
            const date = new Date(dateStr);
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            return `${month}-${day}`;
        } catch (error) {
            console.log(`Could not format date: ${dateStr}`);
            return null;
        }
    }

    async displayConvertedData() {
        try {
            const birthdays = await this.convertCSVToJSON();
            console.log('\n=== Converted Birthday Data ===');
            birthdays.forEach(person => {
                console.log(`${person.name} - ${person.birthday} - ${person.phone}`);
            });
            console.log(`\nTotal: ${birthdays.length} birthdays converted`);
            return birthdays;
        } catch (error) {
            console.error('Error displaying converted data:', error);
            return [];
        }
    }
}

module.exports = CSVConverter;

if (require.main === module) {
    const converter = new CSVConverter();
    converter.displayConvertedData();
}