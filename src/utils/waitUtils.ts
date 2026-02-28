import { Page, Locator } from '@playwright/test';
import { ENV } from '../config/env';
import { logger } from './logger';

/**
 * WaitUtils - Centralized wait strategy with explicit waits.
 * No hard sleeps; all waits are condition-based.
 */
export class WaitUtils {
  private page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  /**
   * Wait for an element to be visible on the page.
   */
  async waitForVisible(locator: Locator, timeout?: number): Promise<void> {
    const waitTimeout = timeout || ENV.DEFAULT_TIMEOUT;
    logger.debug(`Waiting for element to be visible (timeout: ${waitTimeout}ms)`);
    await locator.waitFor({ state: 'visible', timeout: waitTimeout });
  }

  /**
   * Wait for an element to be hidden from the page.
   */
  async waitForHidden(locator: Locator, timeout?: number): Promise<void> {
    const waitTimeout = timeout || ENV.DEFAULT_TIMEOUT;
    logger.debug(`Waiting for element to be hidden (timeout: ${waitTimeout}ms)`);
    await locator.waitFor({ state: 'hidden', timeout: waitTimeout });
  }

  /**
   * Wait for an element to be attached to the DOM.
   */
  async waitForAttached(locator: Locator, timeout?: number): Promise<void> {
    const waitTimeout = timeout || ENV.DEFAULT_TIMEOUT;
    logger.debug(`Waiting for element to be attached (timeout: ${waitTimeout}ms)`);
    await locator.waitFor({ state: 'attached', timeout: waitTimeout });
  }

  /**
   * Wait for an element to be detached from the DOM.
   */
  async waitForDetached(locator: Locator, timeout?: number): Promise<void> {
    const waitTimeout = timeout || ENV.DEFAULT_TIMEOUT;
    logger.debug(`Waiting for element to be detached (timeout: ${waitTimeout}ms)`);
    await locator.waitFor({ state: 'detached', timeout: waitTimeout });
  }

  /**
   * Wait for page navigation to complete.
   */
  async waitForNavigation(timeout?: number): Promise<void> {
    const waitTimeout = timeout || ENV.NAVIGATION_TIMEOUT;
    logger.debug(`Waiting for navigation (timeout: ${waitTimeout}ms)`);
    await this.page.waitForLoadState('networkidle', { timeout: waitTimeout });
  }

  /**
   * Wait for the page to reach a specific load state.
   */
  async waitForLoadState(
    state: 'load' | 'domcontentloaded' | 'networkidle' = 'networkidle',
    timeout?: number,
  ): Promise<void> {
    const waitTimeout = timeout || ENV.NAVIGATION_TIMEOUT;
    logger.debug(`Waiting for load state: ${state} (timeout: ${waitTimeout}ms)`);
    await this.page.waitForLoadState(state, { timeout: waitTimeout });
  }

  /**
   * Wait for a specific URL or URL pattern.
   */
  async waitForUrl(url: string | RegExp, timeout?: number): Promise<void> {
    const waitTimeout = timeout || ENV.NAVIGATION_TIMEOUT;
    logger.debug(`Waiting for URL: ${url} (timeout: ${waitTimeout}ms)`);
    await this.page.waitForURL(url, { timeout: waitTimeout });
  }

  /**
   * Wait for a network response matching a URL pattern.
   */
  async waitForResponse(urlPattern: string | RegExp, timeout?: number): Promise<void> {
    const waitTimeout = timeout || ENV.DEFAULT_TIMEOUT;
    logger.debug(`Waiting for response: ${urlPattern} (timeout: ${waitTimeout}ms)`);
    await this.page.waitForResponse(urlPattern, { timeout: waitTimeout });
  }

  /**
   * Wait until a custom condition is true (polling-based).
   */
  async waitForCondition(
    condition: () => Promise<boolean>,
    timeout?: number,
    interval: number = 500,
  ): Promise<void> {
    const waitTimeout = timeout || ENV.DEFAULT_TIMEOUT;
    const startTime = Date.now();

    while (Date.now() - startTime < waitTimeout) {
      try {
        const result = await condition();
        if (result) return;
      } catch {
        // Condition not yet met, continue polling
      }
      await new Promise((resolve) => setTimeout(resolve, interval));
    }

    throw new Error(`Condition not met within ${waitTimeout}ms`);
  }

  /**
   * Wait for element to have specific text content.
   */
  async waitForText(locator: Locator, expectedText: string, timeout?: number): Promise<void> {
    const waitTimeout = timeout || ENV.DEFAULT_TIMEOUT;
    logger.debug(`Waiting for text "${expectedText}" to appear (timeout: ${waitTimeout}ms)`);
    await this.waitForCondition(async () => {
      const text = await locator.textContent();
      return text?.includes(expectedText) ?? false;
    }, waitTimeout);
  }

  /**
   * Wait for element count to reach a specific number.
   */
  async waitForElementCount(locator: Locator, count: number, timeout?: number): Promise<void> {
    const waitTimeout = timeout || ENV.DEFAULT_TIMEOUT;
    logger.debug(`Waiting for element count: ${count} (timeout: ${waitTimeout}ms)`);
    await this.waitForCondition(async () => {
      const currentCount = await locator.count();
      return currentCount >= count;
    }, waitTimeout);
  }
}
