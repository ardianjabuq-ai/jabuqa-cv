const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });

  await page.fill('#firstName', 'Catze');
  await page.fill('#lastName', 'Cat');
  await page.fill('#email', 'cat@example.ch');
  await page.fill('#phone', '079 999 99 99');
  await page.fill('#city', '8636 Zürich');
  await page.selectOption('#permit', 'Aufenthaltsbewilligung B');
  await page.fill('#summary', 'Strukturierter und effizienter Lagerist mit hoher Pick-Geschwindigkeit und minimaler Fehlerquote.');
  await page.fill('#skills', 'Wareneingang, Qualitätskontrolle, Kommissionierung, Verpackung, Warenlagerung');
  await page.fill('#languages', 'Deutsch, Englisch');

  await page.click('#btn-add-exp');
  await page.fill('#experience-list .repeater-card:nth-child(1) .exp-title', 'Lagermitarbeiter');
  await page.fill('#experience-list .repeater-card:nth-child(1) .exp-company', 'Muster Logistik AG, Rüti ZH');
  await page.fill('#experience-list .repeater-card:nth-child(1) .exp-period', '2003-2011');
  await page.fill('#experience-list .repeater-card:nth-child(1) .exp-desc', 'Entgegennahme, Entladung und Kontrolle von Lieferungen');

  await page.click('#btn-add-edu');
  await page.fill('#education-list .repeater-card:nth-child(1) .edu-degree', 'Wirtschaftsmittelschule / Handelsschule');
  await page.fill('#education-list .repeater-card:nth-child(1) .edu-inst', 'Wirtschaftsmittelschule');
  await page.fill('#education-list .repeater-card:nth-child(1) .edu-year', '1996');

  await page.click('.niche-item.active');
  await page.click('#generate-btn');
  await page.waitForTimeout(3000);

  await page.pdf({
    path: 'test-cv.pdf',
    format: 'A4',
    printBackground: true,
    margin: { top: '0mm', right: '0mm', bottom: '0mm', left: '0mm' }
  });

  await browser.close();
  console.log('TEST PDF U KRIJUA: test-cv.pdf');
})();

