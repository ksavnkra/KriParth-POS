const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800 });
  
  console.log('Navigating to login...');
  await page.goto('https://kriparth.in/login', { waitUntil: 'networkidle2' });
  
  console.log('Typing credentials...');
  await page.type('input[type="email"]', 'admin@kriparth.com');
  await page.type('input[type="password"]', 'admin123');
  
  console.log('Clicking login...');
  await Promise.all([
    page.click('button[type="submit"]'),
    page.waitForNavigation({ waitUntil: 'networkidle0' }),
  ]);
  
  console.log('Waiting 3 seconds for content to load...');
  await new Promise(r => setTimeout(r, 3000));
  
  console.log('Taking screenshot...');
  await page.screenshot({ path: 'kriparth_dashboard2.png', fullPage: true });
  await browser.close();
  console.log('Done.');
})();
