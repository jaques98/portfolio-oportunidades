import { defineConfig } from '@playwright/test';

const automatic = !!process.env.CI || process.env.E2E_START === '1';
const apiPort = process.env.E2E_API_PORT || '3001';
const webPort = process.env.E2E_WEB_PORT || '5173';
export default defineConfig({
  testDir: './e2e',
  fullyParallel: false,
  workers: 1,
  use: {
    baseURL: 'http://localhost:' + webPort,
    channel: process.env.PLAYWRIGHT_CHANNEL || (process.env.CI ? 'chromium' : 'msedge'),
    headless: true,
  },
  webServer: automatic ? [
    {
      command: 'npm --prefix ../server run seed && npm --prefix ../server start',
      url: 'http://127.0.0.1:' + apiPort + '/api/health',
      env: { PORT: apiPort },
      reuseExistingServer: false,
      timeout: 30000,
    },
    {
      command: 'npm run dev -- --port ' + webPort,
      url: 'http://localhost:' + webPort,
      env: { PORTFOLIO_API_URL: 'http://127.0.0.1:' + apiPort },
      reuseExistingServer: false,
      timeout: 30000,
    },
  ] : undefined,
});
