import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  testMatch: '**/*.spec.js',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: 0,
  workers: process.env.CI ? 2 : undefined,
  timeout: 60000,
  expect: { timeout: 10000 },
  reporter: [['list'], ['html', { open: 'never' }], ['json', { outputFile: 'test-results/results.json' }]],
  use: {
    baseURL: 'http://127.0.0.1:4180',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  webServer: {
    command: 'python3 -m http.server 4180 --bind 127.0.0.1',
    url: 'http://127.0.0.1:4180',
    reuseExistingServer: !process.env.CI,
  },
  projects: [
    { name: 'chromium-desktop', use: { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 900 } } },
    { name: 'firefox-desktop', use: { ...devices['Desktop Firefox'], viewport: { width: 1440, height: 900 } } },
    { name: 'webkit-desktop', use: { ...devices['Desktop Safari'], viewport: { width: 1440, height: 900 } } },
    { name: 'chromium-android-emulation', use: { ...devices['Pixel 7'] } },
    { name: 'webkit-iphone-emulation', use: { ...devices['iPhone 13'] } },
    { name: 'webkit-ipad-emulation', use: { ...devices['iPad (gen 7)'] } },
    { name: 'webkit-narrow', use: { browserName: 'webkit', viewport: { width: 320, height: 740 }, isMobile: true, hasTouch: true } },
    { name: 'webkit-landscape', use: { ...devices['iPhone 13 landscape'] } },
  ],
});
