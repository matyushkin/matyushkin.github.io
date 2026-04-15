import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  use: {
    baseURL: 'https://matyushkin.github.io',
  },
  projects: [
    { name: 'chromium', use: { browserName: 'chromium' } },
  ],
});
