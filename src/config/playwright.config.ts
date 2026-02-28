import { PlaywrightTestConfig } from '@playwright/test';
import { ENV } from './env';

const config: PlaywrightTestConfig = {
  testDir: '../features',
  timeout: ENV.DEFAULT_TIMEOUT,
  retries: ENV.RETRY_COUNT,
  workers: 3,
  fullyParallel: true,

  use: {
    baseURL: ENV.BASE_URL,
    storageState: ENV.STORAGE_STATE_PATH,
    headless: ENV.HEADLESS,
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    trace: 'retain-on-failure',
    viewport: { width: 1920, height: 1080 },
    actionTimeout: ENV.DEFAULT_TIMEOUT,
    navigationTimeout: ENV.NAVIGATION_TIMEOUT,
  },

  projects: [
    {
      name: 'chromium',
      use: {
        browserName: 'chromium',
        channel: 'chrome',
      },
    },
    {
      name: 'firefox',
      use: {
        browserName: 'firefox',
      },
    },
    {
      name: 'webkit',
      use: {
        browserName: 'webkit',
      },
    },
  ],

  reporter: [
    ['html', { open: 'never' }],
    ['allure-playwright', { outputFolder: 'allure-results' }],
    ['list'],
  ],
};

export default config;
