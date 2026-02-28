import { chromium, FullConfig } from '@playwright/test';
import * as dotenv from 'dotenv';
import * as path from 'path';
import * as fs from 'fs';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

/**
 * Global Setup - Performs login once and saves storage state.
 * This bypasses the need for UI login in every test.
 *
 * Usage:
 *   npx ts-node src/config/global-setup.ts
 */
async function globalSetup(_config?: FullConfig): Promise<void> {
  const baseUrl = process.env.BASE_URL || 'https://trade.multibank.io/';
  const email = process.env.LOGIN_EMAIL || '';
  const password = process.env.LOGIN_PASSWORD || '';
  const storagePath = path.resolve(
    process.cwd(),
    process.env.STORAGE_STATE_PATH || 'storage/auth.json',
  );

  // Ensure storage directory exists
  const storageDir = path.dirname(storagePath);
  if (!fs.existsSync(storageDir)) {
    fs.mkdirSync(storageDir, { recursive: true });
  }

  console.log('🔐 Starting global setup — performing login...');
  console.log(`   Base URL: ${baseUrl}`);
  console.log(`   Email: ${email}`);

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    ignoreHTTPSErrors: true,
    viewport: { width: 1920, height: 1080 },
  });
  const page = await context.newPage();

  try {
    // Navigate to the trading platform
    await page.goto(baseUrl, { waitUntil: 'domcontentloaded', timeout: 60000 });

    // Look for login/sign-in button or link
    const loginSelectors = [
      'a:has-text("Login")',
      'a:has-text("Sign In")',
      'a:has-text("Log In")',
      'button:has-text("Login")',
      'button:has-text("Sign In")',
      '[class*="login"]',
      '[class*="sign-in"]',
      '[href*="login"]',
      '[href*="signin"]',
    ];

    let loginClicked = false;
    for (const selector of loginSelectors) {
      try {
        const element = page.locator(selector).first();
        if (await element.isVisible({ timeout: 3000 })) {
          await element.click();
          loginClicked = true;
          console.log(`   Clicked login element: ${selector}`);
          break;
        }
      } catch {
        // Try next selector
      }
    }

    if (!loginClicked) {
      console.log(
        '   No login button found — page may already be authenticated or uses different flow',
      );
    }

    // Wait for potential login form
    await page.waitForTimeout(3000);

    // Try to fill login credentials
    const emailSelectors = [
      'input[type="email"]',
      'input[name="email"]',
      'input[placeholder*="email" i]',
      'input[placeholder*="Email" i]',
      'input[name="username"]',
      'input[type="text"]',
    ];

    for (const selector of emailSelectors) {
      try {
        const emailInput = page.locator(selector).first();
        if (await emailInput.isVisible({ timeout: 3000 })) {
          await emailInput.fill(email);
          console.log(`   Filled email using: ${selector}`);
          break;
        }
      } catch {
        // Try next selector
      }
    }

    const passwordSelectors = [
      'input[type="password"]',
      'input[name="password"]',
      'input[placeholder*="password" i]',
    ];

    for (const selector of passwordSelectors) {
      try {
        const passwordInput = page.locator(selector).first();
        if (await passwordInput.isVisible({ timeout: 3000 })) {
          await passwordInput.fill(password);
          console.log(`   Filled password using: ${selector}`);
          break;
        }
      } catch {
        // Try next selector
      }
    }

    // Submit login
    const submitSelectors = [
      'button[type="submit"]',
      'button:has-text("Login")',
      'button:has-text("Sign In")',
      'button:has-text("Log In")',
      'button:has-text("Submit")',
      'input[type="submit"]',
    ];

    for (const selector of submitSelectors) {
      try {
        const submitBtn = page.locator(selector).first();
        if (await submitBtn.isVisible({ timeout: 3000 })) {
          await submitBtn.click();
          console.log(`   Clicked submit: ${selector}`);
          break;
        }
      } catch {
        // Try next selector
      }
    }

    // Wait for login to complete
    await page.waitForTimeout(5000);
    await page.waitForLoadState('domcontentloaded');

    // Save storage state
    await context.storageState({ path: storagePath });
    console.log(`✅ Storage state saved to: ${storagePath}`);
  } catch (error) {
    console.error('❌ Global setup failed:', error);

    // Save storage state even if login fails (captures cookies from initial page load)
    try {
      await context.storageState({ path: storagePath });
      console.log(`⚠️  Partial storage state saved to: ${storagePath}`);
    } catch (saveError) {
      console.error('Failed to save storage state:', saveError);
    }
  } finally {
    await browser.close();
    console.log('🔐 Global setup completed');
  }
}

// Allow running directly with ts-node
globalSetup().catch(console.error);

export default globalSetup;
