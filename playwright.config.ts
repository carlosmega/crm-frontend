import { defineConfig, devices } from '@playwright/test'

/**
 * Playwright Test Configuration for CRM Sales Application
 *
 * Uses auth setup project to login once, then reuses session for all tests.
 */
export default defineConfig({
  testDir: './e2e',
  fullyParallel: false, // Run tests sequentially to avoid server overload
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1, // Single worker for dev server stability
  timeout: 60000, // 60 seconds per test
  reporter: [
    ['html', { open: 'never' }],
    ['list']
  ],

  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'on-first-retry',
    actionTimeout: 15000, // 15 seconds for actions
    navigationTimeout: 30000, // 30 seconds for navigation
  },

  projects: [
    // Setup project: authenticates once and saves state
    {
      name: 'setup',
      testMatch: /auth\.setup\.ts/,
      testDir: './e2e/fixtures',
    },
    // Main tests: reuse authenticated state
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        storageState: 'e2e/.auth/user.json',
      },
      dependencies: ['setup'],
    },
  ],

  // Start dev server before running tests
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: true, // Always reuse if server is already running
    timeout: 120000,
  },
})
