const puppeteer = require('puppeteer');
const fs = require('fs');

(async () => {
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  
  await page.goto('https://kriparth.in/login', { waitUntil: 'networkidle2' });
  await page.type('input[type="email"]', 'admin@kriparth.com');
  await page.type('input[type="password"]', 'admin123');
  
  await Promise.all([
    page.click('button[type="submit"]'),
    page.waitForNavigation({ waitUntil: 'networkidle0' }),
  ]);
  
  await new Promise(r => setTimeout(r, 2000));
  
  const html = await page.evaluate(() => {
    return document.body.innerHTML;
  });
  
  fs.writeFileSync('body_html.txt', html);
  await browser.close();
  console.log('HTML saved.');
})();
