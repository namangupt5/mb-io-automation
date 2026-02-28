import { Given, When, Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { TradingPage } from '../src/pages/TradingPage';
import { DataLoader } from '../src/utils/dataLoader';
import { PlaywrightManager } from '../src/utils/playwrightManager';
import { logger } from '../src/utils/logger';

interface TradingData {
  tradingCategories: string[];
  expectedTableHeaders: string[];
  minimumPairsDisplayed: number;
  dynamicContentTimeout: number;
}

let tradingPage: TradingPage;
let tradingData: TradingData;

Given('I am on the explore page', async function () {
  const page = PlaywrightManager.getPage();
  tradingPage = new TradingPage(page);
  tradingData = DataLoader.load<TradingData>('tradingPairs');
  await tradingPage.open();
  await page.waitForLoadState('domcontentloaded');
  logger.info('Navigated to explore page');
});

Then('the trading section should be visible', async function () {
  const isVisible = await tradingPage.isTradingSectionVisible();
  expect(isVisible).toBeTruthy();
  logger.info('Trading section is visible');
});

Then('trading pairs should be displayed', async function () {
  const pairCount = await tradingPage.getTradingPairCount();
  logger.info('Found ' + pairCount + ' trading pairs');
  expect(pairCount).toBeGreaterThanOrEqual(tradingData.minimumPairsDisplayed);
});

Then('trading category tabs should be displayed', async function () {
  const categories = await tradingPage.getCategoryNames();
  logger.info('Found categories: ' + categories.join(', '));
  expect(categories.length).toBeGreaterThan(0);
});

Then('the category count should be greater than zero', async function () {
  const count = await tradingPage.getCategoryCount();
  logger.info('Category count: ' + count);
  expect(count).toBeGreaterThan(0);
});

When('I wait for dynamic content to load', async function () {
  try {
    await tradingPage.waitForDynamicContent(tradingData.dynamicContentTimeout);
    logger.info('Dynamic content loaded');
  } catch {
    logger.warn('Dynamic content may not have fully loaded — continuing');
  }
});

Then('each trading pair should have valid data structure', async function () {
  const hasValidStructure = await tradingPage.verifyTradingPairStructure();
  logger.info('Trading pair structure valid: ' + hasValidStructure);
  expect(hasValidStructure).toBeTruthy();
});

Then('the market data should display expected column headers', async function () {
  const headers = await tradingPage.getTableHeaders();
  logger.info('Table headers found: ' + headers.join(', '));
  await tradingPage.assertTableHeadersContain(tradingData.expectedTableHeaders);
});

Then('price values should be visible', async function () {
  const prices = await tradingPage.getPriceValues();
  logger.info('Found ' + prices.length + ' price values');
  expect(prices.length).toBeGreaterThan(0);
});
