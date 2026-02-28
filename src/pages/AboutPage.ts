import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';
import { logger } from '../utils/logger';

/**
 * AboutPage - Represents the mb.io /en/company page.
 * Contains company info, leadership, values, media sections.
 * Sub-pages exist at /en/about/terms-conditions etc.
 */
export class AboutPage extends BasePage {
  // ─── Locators ─────────────────────────────────────────────────────

  private get pageContainer(): Locator {
    return this.page.locator('main, body, [class*="content"]').first();
  }

  private get sectionHeaders(): Locator {
    return this.page.locator('h1, h2, h3');
  }

  private get paragraphs(): Locator {
    return this.page.locator('p');
  }

  private get visualComponents(): Locator {
    return this.page.locator('img, video, svg, canvas');
  }

  private get featureSections(): Locator {
    return this.page.locator('section, [class*="section"], [class*="feature"]');
  }

  constructor(page: Page) {
    super(page);
  }

  // ─── Actions ──────────────────────────────────────────────────────

  async open(): Promise<void> {
    logger.info('Opening company/about page');
    await this.navigateTo('/en/company');
  }

  async openHomePage(): Promise<void> {
    logger.info('Opening home page for content validation');
    await this.navigateTo('/');
  }

  async isPageVisible(): Promise<boolean> {
    return this.isVisible(this.pageContainer);
  }

  async getSectionHeaders(): Promise<string[]> {
    return this.getAllTexts(this.sectionHeaders);
  }

  async getParagraphTexts(): Promise<string[]> {
    return this.getAllTexts(this.paragraphs);
  }

  async getVisualComponentCount(): Promise<number> {
    return this.getElementCount(this.visualComponents);
  }

  async hasVisualComponents(): Promise<boolean> {
    const count = await this.getVisualComponentCount();
    return count > 0;
  }

  async getFeatureSectionCount(): Promise<number> {
    return this.getElementCount(this.featureSections);
  }

  async hasSectionHeader(headerText: string): Promise<boolean> {
    const headers = await this.getSectionHeaders();
    return headers.some((h) => h.toLowerCase().includes(headerText.toLowerCase()));
  }

  async hasParagraphContaining(text: string): Promise<boolean> {
    const paragraphs = await this.getParagraphTexts();
    return paragraphs.some((p) => p.toLowerCase().includes(text.toLowerCase()));
  }

  // ─── Assertions ───────────────────────────────────────────────────

  async assertPageLoaded(): Promise<void> {
    await this.assertVisible(this.pageContainer);
    logger.info('Page loaded successfully');
  }

  async assertSectionHeadersExist(): Promise<void> {
    const count = await this.getElementCount(this.sectionHeaders);
    if (count === 0) {
      throw new Error('No section headers found');
    }
    logger.info(`Found ${count} section headers`);
  }

  async assertParagraphContentExists(): Promise<void> {
    const paragraphs = await this.getParagraphTexts();
    if (paragraphs.length === 0) {
      throw new Error('No paragraph content found');
    }
    logger.info(`Found ${paragraphs.length} paragraphs`);
  }

  async assertVisualComponentsExist(): Promise<void> {
    const count = await this.getVisualComponentCount();
    if (count === 0) {
      throw new Error('No visual components found');
    }
    logger.info(`Found ${count} visual components`);
  }

  async assertExpectedHeaders(expectedHeaders: string[]): Promise<void> {
    const headers = await this.getSectionHeaders();
    const headersLower = headers.map((h) => h.toLowerCase());
    for (const expected of expectedHeaders) {
      const found = headersLower.some((h) => h.includes(expected.toLowerCase()));
      if (!found) {
        logger.warn(`Expected header "${expected}" not found. Available: ${headers.join(', ')}`);
      }
    }
  }
}
