// Renders tools/financial-summary.html to /financial-summary.pdf (Letter, 0.6in margins, background graphics).
// Usage: npm i playwright && node tools/build-pdf.mjs
import { chromium } from 'playwright';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const browser = await chromium.launch({ ...(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {}), ...(process.env.HTTPS_PROXY ? { proxy: { server: process.env.HTTPS_PROXY } } : {}) });
const page = await (await browser.newContext({ ignoreHTTPSErrors: !!process.env.HTTPS_PROXY })).newPage();
await page.goto('file://' + path.join(root, 'tools/financial-summary.html'), { waitUntil: 'networkidle' });
await page.evaluate(() => document.fonts.ready);
const f = 'font-family:Manrope,Arial,sans-serif;font-size:8px;font-weight:600;letter-spacing:.08em;text-transform:uppercase;color:#44586B;width:100%;padding:0 0.6in;display:flex;justify-content:space-between;';
await page.pdf({
  path: path.join(root, 'financial-summary.pdf'), format: 'Letter', printBackground: true, scale: 0.92,
  margin: { top: '0.6in', bottom: '0.75in', left: '0.6in', right: '0.6in' },
  displayHeaderFooter: true, headerTemplate: '<span></span>',
  footerTemplate: `<div style="${f}"><span>Utah Public Ski Area Coalition</span><span>Financial Summary · Version 15 · September 2026 · <span class="pageNumber"></span></span></div>`,
});
await browser.close();
