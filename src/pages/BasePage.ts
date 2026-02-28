import { Page, Locator, expect } from '@playwright/test';
import { WaitUtils } from '../utils/waitUtils';
import { logger } from '../utils/logger';
import { ENV } from '../config/env';

/**
 * BasePage - Abstract base class for all page objects.
 * Provides reusable methods for navigation, interaction, and assertions.
 * All page objects must extend this class.
 */
export abstract class BasePage {
  protected page: Page;
  protected waitUtils: WaitUtils;

  constructor(page: Page) {
    this.page = page;
    this.waitUtils = new WaitUtils(page);
  }

  // ─── Navigation ───────────────────────────────────────────────────

  /**
   * Navigate to a URL (relative or absolute).
   */
  async navigateTo(url: string): Promise<void> {
    logger.info(`Navigating to: ${url}`);
    const fullUrl = url.startsWith('http') ? url : `${ENV.BASE_URL}${url}`;
    await this.page.goto(fullUrl, { waitUntil: 'domcontentloaded' });
    await this.waitUtils.waitForLoadState('domcontentloaded');
  }

  /**
   * Get the current page URL.
   */
  async getCurrentUrl(): Promise<string> {
    return this.page.url();
  }

  /**
   * Get the current page title.
   */
  async getPageTitle(): Promise<string> {
    return this.page.title();
  }

  /**
   * Reload the current page.
   */
  async reloadPage(): Promise<void> {
    logger.info('Reloading page');
    await this.page.reload({ waitUntil: 'domcontentloaded' });
  }

  // ─── Element Interaction ──────────────────────────────────────────

  /**
   * Click on an element with automatic wait.
   */
  async click(locator: Locator): Promise<void> {
    await this.waitUtils.waitForVisible(locator);
    await locator.click();
    logger.debug('Clicked element');
  }

  /**
   * Double-click on an element.
   */
  async doubleClick(locator: Locator): Promise<void> {
    await this.waitUtils.waitForVisible(locator);
    await locator.dblclick();
  }

  /**
   * Type text into an input element.
   */
  async typeText(locator: Locator, text: string): Promise<void> {
    await this.waitUtils.waitForVisible(locator);
    await locator.clear();
    await locator.fill(text);
    logger.debug(`Typed text: "${text}"`);
  }

  /**
   * Clear an input field.
   */
  async clearInput(locator: Locator): Promise<void> {
    await this.waitUtils.waitForVisible(locator);
    await locator.clear();
  }

  /**
   * Hover over an element.
   */
  async hover(locator: Locator): Promise<void> {
    await this.waitUtils.waitForVisible(locator);
    await locator.hover();
  }

  /**
   * Select an option from a dropdown by value.
   */
  async selectByValue(locator: Locator, value: string): Promise<void> {
    await this.waitUtils.waitForVisible(locator);
    await locator.selectOption({ value });
  }

  /**
   * Select an option from a dropdown by visible text.
   */
  async selectByText(locator: Locator, text: string): Promise<void> {
    await this.waitUtils.waitForVisible(locator);
    await locator.selectOption({ label: text });
  }

  // ─── Element State ────────────────────────────────────────────────

  /**
   * Check if an element is visible.
   */
  async isVisible(locator: Locator): Promise<boolean> {
    try {
      return await locator.isVisible();
    } catch {
      return false;
    }
  }

  /**
   * Check if an element is enabled.
   */
  async isEnabled(locator: Locator): Promise<boolean> {
    try {
      return await locator.isEnabled();
    } catch {
      return false;
    }
  }

  /**
   * Get the text content of an element.
   */
  async getText(locator: Locator): Promise<string> {
    await this.waitUtils.waitForVisible(locator);
    const text = await locator.textContent();
    return text?.trim() || '';
  }

  /**
   * Get the inner text of an element.
   */
  async getInnerText(locator: Locator): Promise<string> {
    await this.waitUtils.waitForVisible(locator);
    const text = await locator.innerText();
    return text?.trim() || '';
  }

  /**
   * Get an attribute value from an element.
   */
  async getAttribute(locator: Locator, attribute: string): Promise<string | null> {
    await this.waitUtils.waitForAttached(locator);
    return locator.getAttribute(attribute);
  }

  /**
   * Get the count of matching elements.
   */
  async getElementCount(locator: Locator): Promise<number> {
    return locator.count();
  }

  /**
   * Get all text contents from a list of elements.
   */
  async getAllTexts(locator: Locator): Promise<string[]> {
    const texts = await locator.allTextContents();
    return texts.map((t) => t.trim()).filter((t) => t.length > 0);
  }

  // ─── Assertions ───────────────────────────────────────────────────

  /**
   * Assert element is visible.
   */
  async assertVisible(locator: Locator): Promise<void> {
    await expect(locator).toBeVisible({ timeout: ENV.EXPECT_TIMEOUT });
  }

  /**
   * Assert element is hidden.
   */
  async assertHidden(locator: Locator): Promise<void> {
    await expect(locator).toBeHidden({ timeout: ENV.EXPECT_TIMEOUT });
  }

  /**
   * Assert element contains expected text.
   */
  async assertContainsText(locator: Locator, expectedText: string): Promise<void> {
    await expect(locator).toContainText(expectedText, { timeout: ENV.EXPECT_TIMEOUT });
  }

  /**
   * Assert element has exact text.
   */
  async assertHasText(locator: Locator, expectedText: string): Promise<void> {
    await expect(locator).toHaveText(expectedText, { timeout: ENV.EXPECT_TIMEOUT });
  }

  /**
   * Assert current URL contains a string.
   */
  async assertUrlContains(substring: string): Promise<void> {
    await expect(this.page).toHaveURL(new RegExp(substring), {
      timeout: ENV.NAVIGATION_TIMEOUT,
    });
  }

  /**
   * Assert page title contains text.
   */
  async assertTitleContains(text: string): Promise<void> {
    const title = await this.getPageTitle();
    expect(title.toLowerCase()).toContain(text.toLowerCase());
  }

  /**
   * Assert element has a specific attribute value.
   */
  async assertAttribute(locator: Locator, attribute: string, expectedValue: string): Promise<void> {
    await expect(locator).toHaveAttribute(attribute, expectedValue, {
      timeout: ENV.EXPECT_TIMEOUT,
    });
  }

  /**
   * Assert element count.
   */
  async assertElementCount(locator: Locator, expectedCount: number): Promise<void> {
    await expect(locator).toHaveCount(expectedCount, { timeout: ENV.EXPECT_TIMEOUT });
  }

  // ─── Scroll ───────────────────────────────────────────────────────

  /**
   * Scroll element into view.
   */
  async scrollIntoView(locator: Locator): Promise<void> {
    await locator.scrollIntoViewIfNeeded();
  }

  /**
   * Scroll to bottom of page.
   */
  async scrollToBottom(): Promise<void> {
    await this.page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  }

  /**
   * Scroll to top of page.
   */
  async scrollToTop(): Promise<void> {
    await this.page.evaluate(() => window.scrollTo(0, 0));
  }

  // ─── Frame & Window ───────────────────────────────────────────────

  /**
   * Switch to a new tab/popup.
   */
  async switchToNewTab(): Promise<Page> {
    const [newPage] = await Promise.all([this.page.context().waitForEvent('page')]);
    await newPage.waitForLoadState('domcontentloaded');
    return newPage;
  }

  /**
   * Accept or dismiss a dialog.
   */
  async handleDialog(accept: boolean = true): Promise<void> {
    this.page.on('dialog', async (dialog) => {
      if (accept) {
        await dialog.accept();
      } else {
        await dialog.dismiss();
      }
    });
  }

  // ─── Error Handling Wrapper ───────────────────────────────────────

  /**
   * Execute an action with error handling and optional retry.
   */
  async safeAction<T>(
    action: () => Promise<T>,
    actionName: string,
    retries: number = 1,
  ): Promise<T> {
    let lastError: Error | null = null;
    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        logger.debug(`Executing: ${actionName} (attempt ${attempt}/${retries})`);
        return await action();
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        logger.warn(`Action "${actionName}" failed (attempt ${attempt}): ${lastError.message}`);
        if (attempt < retries) {
          await new Promise((resolve) => setTimeout(resolve, 1000));
        }
      }
    }
    throw lastError;
  }
}
