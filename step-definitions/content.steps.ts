import { Given, When, Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { HomePage } from '../src/pages/HomePage';
import { AboutPage } from '../src/pages/AboutPage';
import { DataLoader } from '../src/utils/dataLoader';
import { PlaywrightManager } from '../src/utils/playwrightManager';
import { logger } from '../src/utils/logger';

interface ContentData {
  downloadSection: {
    downloadAppLink: {
      shouldExist: boolean;
      hrefContains: string;
    };
    appStoreLink: {
      shouldExist: boolean;
      hrefContains: string;
    };
    googlePlayLink: {
      shouldExist: boolean;
      hrefContains: string;
    };
  };
  marketingBanners: {
    minimumBannersAtBottom: number;
  };
  homePage: {
    expectedSectionHeaders: string[];
    expectedParagraphContent: string[];
    visualComponents: {
      minimumImages: number;
    };
  };
  footer: {
    shouldBeVisible: boolean;
    expectedLinks: string[];
  };
  marketData: {
    minimumTickers: number;
  };
}

let homePage: HomePage;
let aboutPage: AboutPage;
let contentData: ContentData;

function initPages() {
  const page = PlaywrightManager.getPage();
  homePage = new HomePage(page);
  aboutPage = new AboutPage(page);
  contentData = DataLoader.load<ContentData>('contentValidation');
}

Given('I am on the company page', async function () {
  initPages();
  const page = PlaywrightManager.getPage();
  await aboutPage.open();
  await page.waitForLoadState('domcontentloaded');
  logger.info('Navigated to company page');
});

Then('the company page heading should be visible', async function () {
  const page = PlaywrightManager.getPage();
  const heading = page.getByRole('heading', { level: 1 }).first();
  const isVisible = await heading.isVisible();
  expect(isVisible).toBeTruthy();
  const text = await heading.textContent();
  logger.info('Company page heading: ' + text);
});

Then('the hero section should display crypto heading', async function () {
  initPages();
  const isVisible = await homePage.isHeroSectionVisible();
  expect(isVisible).toBeTruthy();
  logger.info('Hero section with crypto heading is visible');
});

Then('the page should have feature sections', async function () {
  const page = PlaywrightManager.getPage();
  // Check for feature-related headings
  const headings = await page.locator('h1, h2, h3, h4, h5').allTextContents();
  const filtered = headings.filter((h) => h.trim().length > 0);
  logger.info('Found ' + filtered.length + ' headings on the page');
  expect(filtered.length).toBeGreaterThan(0);
});

Then('the Download App link should be visible', async function () {
  initPages();
  const isVisible = await homePage.isDownloadAppLinkVisible();
  expect(isVisible).toBeTruthy();
  logger.info('Download App link is visible');
});

Then('the Download App link should contain a valid href', async function () {
  const href = await homePage.getDownloadAppHref();
  logger.info('Download App href: ' + href);
  expect(href).toBeTruthy();
  if (href) {
    expect(href.toLowerCase()).toContain(
      contentData.downloadSection.downloadAppLink.hrefContains.toLowerCase(),
    );
  }
});

Then('marketing banners should be visible at page bottom', async function () {
  initPages();
  const bannerCount = await homePage.getMarketingBannerCountAtBottom();
  logger.info('Bottom marketing banners found: ' + bannerCount);
  expect(bannerCount).toBeGreaterThanOrEqual(contentData.marketingBanners.minimumBannersAtBottom);
});

When('I scroll to the market data section', async function () {
  initPages();
  await homePage.scrollToBottom();
  logger.info('Scrolled to market data section');
});

Then('crypto ticker links should be displayed', async function () {
  const count = await homePage.getCryptoTickerCount();
  logger.info('Found ' + count + ' crypto ticker links');
  expect(count).toBeGreaterThanOrEqual(contentData.marketData.minimumTickers);
});

Then('section headers should be present on the page', async function () {
  if (!aboutPage) initPages();
  const headers = await aboutPage.getSectionHeaders();
  logger.info('Section headers found: ' + headers.slice(0, 10).join(', '));
  expect(headers.length).toBeGreaterThan(0);
});

Then('paragraph content should be present on the page', async function () {
  if (!aboutPage) initPages();
  const paragraphs = await aboutPage.getParagraphTexts();
  logger.info('Found ' + paragraphs.length + ' paragraphs');
  expect(paragraphs.length).toBeGreaterThan(0);
});

Then('visual components should be present on the page', async function () {
  if (!aboutPage) initPages();
  const count = await aboutPage.getVisualComponentCount();
  logger.info('Visual components found: ' + count);
  expect(count).toBeGreaterThanOrEqual(contentData.homePage.visualComponents.minimumImages);
});

When('I scroll to the bottom of the page', async function () {
  initPages();
  await homePage.scrollToBottom();
  logger.info('Scrolled to bottom of page');
});

Then('footer links should be present', async function () {
  const links = await homePage.getFooterLinkTexts();
  logger.info('Footer links: ' + links.join(', '));
  expect(links.length).toBeGreaterThan(0);
});
