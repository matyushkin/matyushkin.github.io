import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL || 'https://matyushkin.github.io',
  },
  projects: [
    // Use the Chrome already installed on the machine: Playwright's own browser
    // download stalls on this network, and the site is plain static HTML.
    { name: 'chromium', use: { browserName: 'chromium', channel: 'chrome' } },
  ],
});
