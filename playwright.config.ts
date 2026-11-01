import { defineConfig, devices } from '@playwright/test';

const PORT = Number(process.env.PORT ?? 3000);
const baseURL = process.env.E2E_BASE_URL ?? `http://localhost:${PORT}`;

/**
 * Playwright configuration for the end-to-end smoke suite.
 *
 * The suite is intentionally hermetic: it runs against the local dev server and
 * points the app at a non-routable API base URL so authentication requests fail
 * fast instead of hitting a deployed environment.
 */
export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 1 : undefined,
  timeout: 60_000,
  expect: { timeout: 10_000 },
  reporter: [
    ['list'],
    ['html', { outputFolder: 'playwright-report', open: 'never' }],
    ['junit', { outputFile: 'test-results/results.xml' }],
  ],
  use: {
    baseURL,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'off',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: {
    command: 'npm run start',
    url: baseURL,
    reuseExistingServer: true,
    timeout: 180_000,
    env: {
      BROWSER: 'none',
      PORT: String(PORT),
      REACT_APP_API_BASE_URL: process.env.REACT_APP_API_BASE_URL ?? 'http://localhost:8080/api',
    },
  },
});
