import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL || 'https://matyushkin.github.io',
  },
  projects: [
    { name: 'chromium', use: { browserName: 'chromium' } },
  ],
});
