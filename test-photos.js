const WhatsAppBot = require('./src/whatsappBot');

async function testPhotoDownload() {
    console.log('Testing photo download functionality...');
    
    const bot = new WhatsAppBot();
    
    // Test with one of the Google Drive URLs from the data
    const testUrl = 'https://drive.google.com/open?id=1FdvWptZJkJPtZHazO0ymFDcqtRLw3V7-';
    
    console.log('Original URL:', testUrl);
    
    const convertedUrl = bot.convertGoogleDriveUrl(testUrl);
    console.log('Converted URL:', convertedUrl);
    
    try {
        console.log('Attempting to download photo...');
        const media = await bot.downloadPhoto(testUrl);
        
        if (media) {
            console.log('✅ Photo download successful!');
            console.log('Media type:', media.mimetype);
            console.log('Data size:', media.data.length, 'characters');
        } else {
            console.log('❌ Photo download failed');
        }
    } catch (error) {
        console.log('❌ Error:', error.message);
    }
}

testPhotoDownload();