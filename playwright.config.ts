import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  use: {
    baseURL: 'http://127.0.0.1:4200',
    channel: process.platform === 'win32' ? 'msedge' : undefined,
    headless: true,
    screenshot: 'only-on-failure',
  },
  webServer: {
    command: 'pnpm start --host 127.0.0.1 --port 4200',
    url: 'http://127.0.0.1:4200',
    reuseExistingServer: !process.env['CI'],
  },
});
