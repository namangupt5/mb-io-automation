import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';
import { NavigationComponent } from './NavigationComponent';
import { logger } from '../utils/logger';

/**
 * HomePage - Represents the mb.io marketing home page.
 * Contains locators for hero, features, download, footer sections.
 */
export class HomePage extends BasePage {
  public navigation: NavigationComponent;

  // ─── Locators ─────────────────────────────────────────────────────

  private get mainContent(): Locator {
    return this.page.locator('main, [class*="main"], #__next, #app, body').first();
  }

  private get heroSection(): Locator {
    return this.page
      .locator('h1, h2, h3')
      .filter({ hasText: /crypto/i })
      .first();
  }

  private get downloadAppLink(): Locator {
    return this.page.locator('a:has-text("Download the app"), a[href*="go.link"]').first();
  }

  private get openAccountLink(): Locator {
    return this.page.locator('a:has-text("Open an account"), a:has-text("Sign up")').first();
  }

  private get footerSection(): Locator {
    return this.page.locator('footer').first();
  }

  private get footerLinks(): Locator {
    return this.page.locator('footer a');
  }

  private get cryptoTickers(): Locator {
    return this.page.locator('a[href*="/explore/"]');
  }

  private get topGainersSection(): Locator {
    return this.page.locator('text=Top Gainers').first();
  }

  private get trendingSection(): Locator {
    return this.page.locator('text=Trending').first();
  }

  private get marketDataRows(): Locator {
    return this.page.locator('a[href*="/explore/"]');
  }

  private get paymentIcons(): Locator {
    return this.page.locator('footer img');
  }

  private get marketingBannersAtBottom(): Locator {
    return this.page.locator(
      'section:has(a:has-text("Download")) img, section:has(a:has-text("App Store"), a:has-text("Google Play")) img, [class*="banner"]:near(footer)',
    );
  }

  constructor(page: Page) {
    super(page);
    this.navigation = new NavigationComponent(page);
  }

  // ─── Actions ──────────────────────────────────────────────────────

  async open(): Promise<void> {
    logger.info('Opening home page');
    await this.navigateTo('/');
  }

  async isMainContentVisible(): Promise<boolean> {
    return this.isVisible(this.mainContent);
  }

  async isHeroSectionVisible(): Promise<boolean> {
    return this.isVisible(this.heroSection);
  }

  async isDownloadAppLinkVisible(): Promise<boolean> {
    return this.isVisible(this.downloadAppLink);
  }

  async getDownloadAppHref(): Promise<string | null> {
    return this.getAttribute(this.downloadAppLink, 'href');
  }

  async clickDownloadApp(): Promise<void> {
    logger.info('Clicking Download the app');
    await this.scrollIntoView(this.downloadAppLink);
    await this.click(this.downloadAppLink);
  }

  async isFooterVisible(): Promise<boolean> {
    await this.scrollToBottom();
    return this.isVisible(this.footerSection);
  }

  async getFooterLinkTexts(): Promise<string[]> {
    await this.scrollToBottom();
    return this.getAllTexts(this.footerLinks);
  }

  async getCryptoTickerCount(): Promise<number> {
    // Wait for crypto tickers to load (dynamic JS content)
    try {
      await this.page.waitForSelector('a[href*="/explore/"]', { timeout: 15000 });
    } catch {
      logger.warn('No crypto tickers appeared within timeout');
    }
    return this.getElementCount(this.cryptoTickers);
  }

  async isTopGainersVisible(): Promise<boolean> {
    await this.scrollToBottom();
    return this.isVisible(this.topGainersSection);
  }

  async isTrendingVisible(): Promise<boolean> {
    return this.isVisible(this.trendingSection);
  }

  async getMarketDataCount(): Promise<number> {
    return this.getElementCount(this.marketDataRows);
  }

  async getPaymentIconCount(): Promise<number> {
    await this.scrollToBottom();
    return this.getElementCount(this.paymentIcons);
  }

  async getMarketingBannerCountAtBottom(): Promise<number> {
    await this.scrollToBottom();
    return this.getElementCount(this.marketingBannersAtBottom);
  }

  async assertPageLoaded(): Promise<void> {
    await this.assertVisible(this.mainContent);
    logger.info('Home page loaded successfully');
  }
}
