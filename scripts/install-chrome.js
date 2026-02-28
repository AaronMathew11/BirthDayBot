const { execSync } = require('child_process');
const fs = require('fs');

// Check if running in production (GCP)
const isProduction = process.env.NODE_ENV === 'production';
const isGCP = process.env.GAE_SERVICE || process.env.GOOGLE_CLOUD_PROJECT;

if (isProduction && isGCP) {
    console.log('Installing Chrome for GCP App Engine...');
    
    try {
        // Install puppeteer with Chromium
        execSync('npm install puppeteer --no-save', { stdio: 'inherit' });
        console.log('✅ Chrome installation completed');
        
        // Set environment variable for Puppeteer executable path
        const chromiumPath = require('puppeteer').executablePath();
        console.log(`Chrome path: ${chromiumPath}`);
        
    } catch (error) {
        console.error('❌ Chrome installation failed:', error.message);
        console.log('Continuing without Chrome installation...');
    }
} else {
    console.log('Skipping Chrome installation (not in GCP production environment)');
}