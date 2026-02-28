import { Given, When, Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { HomePage } from '../src/pages/HomePage';
import { NavigationComponent } from '../src/pages/NavigationComponent';
import { DataLoader } from '../src/utils/dataLoader';
import { PlaywrightManager } from '../src/utils/playwrightManager';
import { logger } from '../src/utils/logger';
import { ENV } from '../src/config/env';

interface MenuItem {
  name: string;
  expectedUrl: string;
  shouldBeVisible: boolean;
}

interface NavigationData {
  menuItems: MenuItem[];
  logoShouldBeVisible: boolean;
  layoutValidation: {
    navBarShouldBeVisible: boolean;
    footerShouldBeVisible: boolean;
    heroShouldBeVisible: boolean;
    mainContentShouldBeVisible: boolean;
  };
  urlValidation: {
    baseUrl: string;
    signInUrl: string;
    signUpUrl: string;
  };
}

let homePage: HomePage;
let navigation: NavigationComponent;
let navData: NavigationData;

Given('I am on the MultiBank home page', async function () {
  const page = PlaywrightManager.getPage();
  homePage = new HomePage(page);
  navigation = new NavigationComponent(page);
  navData = DataLoader.load<NavigationData>('navigation');
  await homePage.open();
  // Wait for page to fully load
  await page.waitForLoadState('domcontentloaded');
});

Then('the navigation bar should be visible', async function () {
  const isVisible = await navigation.isNavBarVisible();
  expect(isVisible).toBeTruthy();
  logger.info('Navigation bar is visible');
});

Then('the logo should be visible', async function () {
  const isVisible = await navigation.isLogoVisible();
  expect(isVisible).toBeTruthy();
  logger.info('Logo is visible');
});

Then('the navigation menu should display menu items', async function () {
  const menuTexts = await navigation.getMenuItemTexts();
  logger.info('Found menu items: ' + menuTexts.join(', '));
  expect(menuTexts.length).toBeGreaterThan(0);
});

Then('Sign In button should be visible', async function () {
  const isVisible = await navigation.isSignInVisible();
  expect(isVisible).toBeTruthy();
  logger.info('Sign In button is visible');
});

Then('Sign Up button should be visible', async function () {
  const isVisible = await navigation.isSignUpVisible();
  expect(isVisible).toBeTruthy();
  logger.info('Sign Up button is visible');
});

Then('Sign In link should point to the login page', async function () {
  const href = await navigation.getMenuItemHref('Sign in');
  logger.info('Sign In href: ' + href);
  expect(href).toBeTruthy();
  if (href) {
    expect(href.toLowerCase()).toContain('login');
  }
});

Then('Sign Up link should point to the register page', async function () {
  const href = await navigation.getMenuItemHref('Sign up');
  logger.info('Sign Up href: ' + href);
  expect(href).toBeTruthy();
  if (href) {
    expect(href.toLowerCase()).toContain('register');
  }
});

When('I click the Sign In button', async function () {
  const page = PlaywrightManager.getPage();
  const context = page.context();
  // Sign In link has target="_blank" — opens a new tab
  const [newPage] = await Promise.all([context.waitForEvent('page'), navigation.clickSignIn()]);
  await newPage.waitForLoadState('domcontentloaded');
  (this as any)._signInUrl = newPage.url();
  logger.info('Sign In opened new tab: ' + newPage.url());
});

Then('the URL should contain {string}', async function (expectedUrl: string) {
  const page = PlaywrightManager.getPage();
  const urlToCheck = (this as any)._signInUrl || page.url();
  logger.info('URL to check: ' + urlToCheck + ' (expected to contain: ' + expectedUrl + ')');
  expect(urlToCheck.toLowerCase()).toContain(expectedUrl.toLowerCase());
});

Then('the main content area should be visible', async function () {
  const isVisible = await homePage.isMainContentVisible();
  expect(isVisible).toBeTruthy();
  logger.info('Main content area is visible');
});

Then('the hero section should be visible', async function () {
  const isVisible = await homePage.isHeroSectionVisible();
  expect(isVisible).toBeTruthy();
  logger.info('Hero section is visible');
});

Then('the footer should be visible', async function () {
  const isVisible = await homePage.isFooterVisible();
  expect(isVisible).toBeTruthy();
  logger.info('Footer is visible');
});
