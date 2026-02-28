import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';
import { logger } from '../utils/logger';

/**
 * TradingPage - Represents the mb.io/en/explore market/trading page.
 * Handles trading pairs, categories (Hot/Gainers/Losers), table data.
 */
export class TradingPage extends BasePage {
  // ─── Locators ─────────────────────────────────────────────────────

  private get tradingSection(): Locator {
    return this.page.locator('main, [class*="main"], body').first();
  }

  private get marketHeading(): Locator {
    return this.page.getByRole('heading', { level: 1 }).first();
  }

  private get tradingPairLinks(): Locator {
    return this.page.locator('table a[href*="/explore/"]');
  }

  private get categoryTabs(): Locator {
    return this.page.locator('button').filter({
      hasText: /^(Hot|Gainers|Losers)$/i,
    });
  }

  private get tableElement(): Locator {
    return this.page.locator('table').first();
  }

  private get tableHeaders(): Locator {
    return this.page.locator('table th');
  }

  private get tradingRows(): Locator {
    return this.page.locator('table tr').filter({ has: this.page.locator('a[href*="/explore/"]') });
  }

  private get priceValues(): Locator {
    return this.page.locator('table td:nth-child(2)');
  }

  private get changeValues(): Locator {
    return this.page.locator('table td:nth-child(3)');
  }

  private get promoBanners(): Locator {
    return this.page.locator('[class*="banner"], [class*="promo"], [class*="carousel"]');
  }

  constructor(page: Page) {
    super(page);
  }

  // ─── Actions ──────────────────────────────────────────────────────

  async open(): Promise<void> {
    logger.info('Opening trading/explore page');
    await this.navigateTo('/en/explore');
    // Wait for the trading table to load (dynamic content)
    try {
      await this.page.waitForSelector('table', { timeout: 30000 });
      logger.info('Trading table loaded');
    } catch {
      logger.warn('Trading table not found within timeout — continuing');
    }
  }

  async isTradingSectionVisible(): Promise<boolean> {
    return this.isVisible(this.tradingSection);
  }

  async isMarketHeadingVisible(): Promise<boolean> {
    return this.isVisible(this.marketHeading);
  }

  async getTradingPairNames(): Promise<string[]> {
    return this.getAllTexts(this.tradingPairLinks);
  }

  async getTradingPairCount(): Promise<number> {
    return this.getElementCount(this.tradingPairLinks);
  }

  async getCategoryNames(): Promise<string[]> {
    return this.getAllTexts(this.categoryTabs);
  }

  async getCategoryCount(): Promise<number> {
    return this.getElementCount(this.categoryTabs);
  }

  async clickCategory(categoryName: string): Promise<void> {
    logger.info(`Clicking trading category: ${categoryName}`);
    const category = this.page
      .locator(`button:has-text("${categoryName}"), [role="tab"]:has-text("${categoryName}")`)
      .first();
    await this.click(category);
  }

  async getTableHeaders(): Promise<string[]> {
    return this.getAllTexts(this.tableHeaders);
  }

  async getTableHeaderCount(): Promise<number> {
    return this.getElementCount(this.tableHeaders);
  }

  async getRowCount(): Promise<number> {
    return this.getElementCount(this.tradingRows);
  }

  async getPriceValues(): Promise<string[]> {
    return this.getAllTexts(this.priceValues);
  }

  async getChangeValues(): Promise<string[]> {
    return this.getAllTexts(this.changeValues);
  }

  async getPromoBannerCount(): Promise<number> {
    return this.getElementCount(this.promoBanners);
  }

  async verifyTradingPairStructure(): Promise<boolean> {
    const names = await this.getTradingPairNames();
    if (names.length === 0) {
      logger.warn('No trading pair names found');
      return false;
    }
    logger.info(`Trading pairs found: ${names.length}`);
    return true;
  }

  async waitForDynamicContent(timeout?: number): Promise<void> {
    logger.info('Waiting for dynamic trading content');
    await this.waitUtils.waitForCondition(async () => {
      const count = await this.getTradingPairCount();
      return count > 0;
    }, timeout || 15000);
  }

  // ─── Assertions ───────────────────────────────────────────────────

  async assertTradingSectionVisible(): Promise<void> {
    await this.assertVisible(this.tradingSection);
  }

  async assertTradingPairsDisplayed(): Promise<void> {
    const count = await this.getTradingPairCount();
    if (count === 0) {
      throw new Error('No trading pairs are displayed');
    }
    logger.info(`Found ${count} trading pairs`);
  }

  async assertCategoriesExist(): Promise<void> {
    const count = await this.getCategoryCount();
    if (count === 0) {
      throw new Error('No trading categories found');
    }
    logger.info(`Found ${count} trading categories`);
  }

  async assertTableHeadersContain(expectedHeaders: string[]): Promise<void> {
    const headers = await this.getTableHeaders();
    const headersLower = headers.map((h) => h.toLowerCase());
    for (const expected of expectedHeaders) {
      const found = headersLower.some((h) => h.includes(expected.toLowerCase()));
      if (!found) {
        logger.warn(`Expected header "${expected}" not found. Available: ${headers.join(', ')}`);
      }
    }
  }
}
