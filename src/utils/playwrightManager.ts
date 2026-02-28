import {
  Browser,
  BrowserContext,
  Page,
  chromium,
  firefox,
  webkit,
  LaunchOptions,
} from '@playwright/test';
import { ENV } from '../config/env';
import { logger } from './logger';
import * as fs from 'fs';
import * as path from 'path';

/**
 * PlaywrightManager - Singleton manager for browser lifecycle.
 * Handles browser launch, context creation, and page management.
 */
export class PlaywrightManager {
  private static browser: Browser | null = null;
  private static context: BrowserContext | null = null;
  private static page: Page | null = null;

  /**
   * Launch a browser instance based on environment configuration.
   */
  static async launchBrowser(): Promise<Browser> {
    if (this.browser) {
      return this.browser;
    }

    const launchOptions: LaunchOptions = {
      headless: ENV.HEADLESS,
      slowMo: ENV.SLOW_MO,
    };

    const browserType = ENV.BROWSER.toLowerCase();
    logger.info(`Launching browser: ${browserType}`);

    switch (browserType) {
      case 'firefox':
        this.browser = await firefox.launch(launchOptions);
        break;
      case 'webkit':
        this.browser = await webkit.launch(launchOptions);
        break;
      case 'chromium':
      default:
        this.browser = await chromium.launch(launchOptions);
        break;
    }

    return this.browser;
  }

  /**
   * Create a new browser context with storage state if available.
   */
  static async createContext(): Promise<BrowserContext> {
    if (!this.browser) {
      await this.launchBrowser();
    }

    const contextOptions: Record<string, unknown> = {
      viewport: { width: 1920, height: 1080 },
      ignoreHTTPSErrors: true,
      acceptDownloads: true,
    };

    // Apply storage state if auth.json exists
    const storagePath = path.resolve(process.cwd(), ENV.STORAGE_STATE_PATH);
    if (fs.existsSync(storagePath)) {
      contextOptions.storageState = storagePath;
      logger.info('Using stored authentication state');
    } else {
      logger.warn('No storage state found — proceeding without authentication');
    }

    if (ENV.VIDEO_ON_FAILURE) {
      contextOptions.recordVideo = {
        dir: 'test-results/videos/',
        size: { width: 1920, height: 1080 },
      };
    }

    this.context = await this.browser!.newContext(contextOptions);
    this.context.setDefaultTimeout(ENV.DEFAULT_TIMEOUT);
    this.context.setDefaultNavigationTimeout(ENV.NAVIGATION_TIMEOUT);

    // Start tracing if enabled
    if (ENV.TRACE_ON_FAILURE) {
      await this.context.tracing.start({
        screenshots: true,
        snapshots: true,
        sources: true,
      });
    }

    return this.context;
  }

  /**
   * Create a new page in the current browser context.
   */
  static async createPage(): Promise<Page> {
    if (!this.context) {
      await this.createContext();
    }

    this.page = await this.context!.newPage();
    logger.info('New page created');
    return this.page;
  }

  /**
   * Get the current page instance.
   */
  static getPage(): Page {
    if (!this.page) {
      throw new Error('Page has not been initialized. Call createPage() first.');
    }
    return this.page;
  }

  /**
   * Get the current browser context.
   */
  static getContext(): BrowserContext {
    if (!this.context) {
      throw new Error('Context has not been initialized. Call createContext() first.');
    }
    return this.context;
  }

  /**
   * Get the current browser instance.
   */
  static getBrowser(): Browser {
    if (!this.browser) {
      throw new Error('Browser has not been initialized. Call launchBrowser() first.');
    }
    return this.browser;
  }

  /**
   * Take a screenshot and return the buffer.
   */
  static async takeScreenshot(name?: string): Promise<Buffer> {
    if (!this.page) {
      throw new Error('Page is not available for screenshot');
    }

    const screenshotBuffer = await this.page.screenshot({
      fullPage: true,
      type: 'png',
    });

    if (name) {
      const screenshotDir = 'test-results/screenshots';
      if (!fs.existsSync(screenshotDir)) {
        fs.mkdirSync(screenshotDir, { recursive: true });
      }
      fs.writeFileSync(path.join(screenshotDir, `${name}.png`), screenshotBuffer);
    }

    return screenshotBuffer;
  }

  /**
   * Save trace for the current scenario context.
   */
  static async saveTrace(scenarioName: string): Promise<string | null> {
    if (!this.context || !ENV.TRACE_ON_FAILURE) {
      return null;
    }

    const traceDir = 'test-results/traces';
    if (!fs.existsSync(traceDir)) {
      fs.mkdirSync(traceDir, { recursive: true });
    }

    const safeScenarioName = scenarioName
      .replace(/[^a-zA-Z0-9_-]+/g, '_')
      .replace(/_+/g, '_')
      .replace(/^_|_$/g, '');
    const tracePath = path.join(
      traceDir,
      `${safeScenarioName || 'scenario'}_${process.pid}_${Date.now()}.zip`,
    );
    await this.context.tracing.stop({ path: tracePath });
    logger.info(`Trace saved: ${tracePath}`);
    return tracePath;
  }

  /**
   * Close the current page.
   */
  static async closePage(): Promise<void> {
    if (this.page) {
      await this.page.close();
      this.page = null;
      logger.info('Page closed');
    }
  }

  /**
   * Close the current context.
   */
  static async closeContext(): Promise<void> {
    if (this.context) {
      await this.context.close();
      this.context = null;
      logger.info('Context closed');
    }
  }

  /**
   * Close the browser and clean up all resources.
   */
  static async closeBrowser(): Promise<void> {
    await this.closePage();
    await this.closeContext();

    if (this.browser) {
      await this.browser.close();
      this.browser = null;
      logger.info('Browser closed');
    }
  }

  /**
   * Full cleanup — close everything.
   */
  static async cleanup(): Promise<void> {
    await this.closeBrowser();
  }
}
