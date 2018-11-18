const puppeteer = require('puppeteer');
const fs = require('fs');
base64Img = require('base64-img');

(async() => {
    const browser = await puppeteer.launch({
        headless: false,
        args: [
            '--headless',
            '--hide-scrollbars',
            '--mute-audio',
            '--no-sandbox'
        ]
    });
    const page = await browser.newPage();
    page.goto('http://localhost:8080');
    await page.exposeFunction('savebase64', (base64) => {
        base64Img.imgSync(base64, __dirname, 'out');
        console.log(base64);
    });
})();
