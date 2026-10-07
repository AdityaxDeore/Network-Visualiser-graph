import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';

async function capture() {
  const outputDir = path.resolve(process.cwd(), 'docs', 'screenshots');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  console.log('Launching Microsoft Edge visibly in foreground...');
  const browser = await chromium.launch({
    channel: 'msedge',
    headless: false,
  });

  const context = await browser.newContext({
    viewport: { width: 1440, height: 920 },
    deviceScaleFactor: 2,
  });

  const page = await context.newPage();
  console.log('Navigating to http://localhost:4173...');
  await page.goto('http://localhost:4173', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);

  // 1. Dashboard Overview
  console.log('Capturing 01-dashboard-overview.png...');
  await page.screenshot({ path: path.join(outputDir, '01-dashboard-overview.png') });

  // 2. Full Page Overview
  console.log('Capturing 02-full-page-dashboard.png...');
  await page.screenshot({ path: path.join(outputDir, '02-full-page-dashboard.png'), fullPage: true });

  // 3. Step forward to show active conflict detection & backtracking decision tree
  console.log('Stepping through algorithm to show conflict & backtracking...');
  const stepBtn = page.locator('button.btn-secondary:has-text("Step by Step")');
  if (await stepBtn.isVisible()) {
    for (let i = 0; i < 7; i++) {
      await stepBtn.click();
      await page.waitForTimeout(300);
    }
  }
  await page.waitForTimeout(600);
  console.log('Capturing 03-backtracking-step-execution.png...');
  await page.screenshot({ path: path.join(outputDir, '03-backtracking-step-execution.png') });

  // 4. Scroll down to capture Bottom Metrics and Stats
  console.log('Capturing 04-bottom-metrics-and-stats.png...');
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await page.waitForTimeout(800);
  await page.screenshot({ path: path.join(outputDir, '04-bottom-metrics-and-stats.png') });

  // Scroll back up
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(500);

  // 5. Run to completion to capture optimal allocation
  console.log('Running algorithm to completion...');
  const startBtn = page.locator('button.btn-start-algorithm');
  await startBtn.click();
  await page.waitForTimeout(7000);
  console.log('Capturing 05-optimal-allocation-solution.png...');
  await page.screenshot({ path: path.join(outputDir, '05-optimal-allocation-solution.png') });

  // 6. Theory Modal
  console.log('Opening Theory & Complexity modal...');
  const algoBtn = page.locator('nav button:has-text("Algorithm")');
  await algoBtn.click();
  await page.waitForTimeout(1000);
  console.log('Capturing 06-theory-and-complexity.png...');
  await page.screenshot({ path: path.join(outputDir, '06-theory-and-complexity.png') });
  await page.keyboard.press('Escape');
  await page.waitForTimeout(400);

  await browser.close();
  console.log('All screenshots captured successfully!');
}

capture().catch((err) => {
  console.error('Error during capture:', err);
  process.exit(1);
});
