import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

export const ENV = {
  BASE_URL: process.env.BASE_URL || 'https://mb.io/',
  TRADE_URL: process.env.TRADE_URL || 'https://trade.mb.io/',
  BROWSER: process.env.BROWSER || 'chromium',
  HEADLESS: process.env.HEADLESS === 'true',
  SLOW_MO: parseInt(process.env.SLOW_MO || '0', 10),
  DEFAULT_TIMEOUT: parseInt(process.env.DEFAULT_TIMEOUT || '30000', 10),
  NAVIGATION_TIMEOUT: parseInt(process.env.NAVIGATION_TIMEOUT || '60000', 10),
  EXPECT_TIMEOUT: parseInt(process.env.EXPECT_TIMEOUT || '10000', 10),

  // Login
  LOGIN_EMAIL: process.env.LOGIN_EMAIL || '',
  LOGIN_PASSWORD: process.env.LOGIN_PASSWORD || '',

  // Storage
  STORAGE_STATE_PATH: process.env.STORAGE_STATE_PATH || 'storage/auth.json',

  // Reporting
  SCREENSHOT_ON_FAILURE: process.env.SCREENSHOT_ON_FAILURE === 'true',
  SCREENSHOT_EACH_STEP: process.env.SCREENSHOT_EACH_STEP !== 'false',
  VIDEO_ON_FAILURE: process.env.VIDEO_ON_FAILURE === 'true',
  TRACE_ON_FAILURE: process.env.TRACE_ON_FAILURE === 'true',

  // Retry
  RETRY_COUNT: parseInt(process.env.RETRY_COUNT || '2', 10),
};
