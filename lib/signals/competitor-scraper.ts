import type { Signal, SignalSource } from './types';

const COMPETITOR_URLS: string[] = [
  // Add competitor blog index URLs here, e.g.
  // 'https://competitor.com/blog',
];

export const competitorScraperSource: SignalSource = {
  name: 'competitor-scraper',
  enabled: COMPETITOR_URLS.length > 0,
  async fetch(): Promise<Signal[]> {
    // STUB: Playwright-based scraper for competitor blog indices.
    // Returns [] until COMPETITOR_URLS is populated and Playwright is wired up.
    //
    // Implementation hint:
    //   import { chromium } from 'playwright';
    //   const browser = await chromium.launch();
    //   const page = await browser.newPage();
    //   const signals: Signal[] = [];
    //   for (const url of COMPETITOR_URLS) {
    //     await page.goto(url);
    //     const titles = await page.$$eval('article h2', (els) => els.map((el) => el.textContent));
    //     signals.push(...titles.map((t) => ({ title: t, source: 'competitor-scraper' })));
    //   }
    //   await browser.close();
    //   return signals;
    return [];
  },
};
