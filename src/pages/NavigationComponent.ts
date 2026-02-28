import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';
import { logger } from '../utils/logger';

/**
 * NavigationComponent - Represents the top navigation/header component
 * on the mb.io marketing site.
 */
export class NavigationComponent extends BasePage {
  // ─── Locators ─────────────────────────────────────────────────────

  private get navBar(): Locator {
    return this.page.locator('[role="banner"], header, nav').first();
  }

  private get navLinks(): Locator {
    return this.page.locator('[role="banner"] a, header a, nav a');
  }

  private get logo(): Locator {
    return this.page.locator('header a[href="/"], [role="banner"] a[href="/"]').first();
  }

  private get signInButton(): Locator {
    return this.page.getByRole('link', { name: 'Sign in' }).first();
  }

  private get signUpButton(): Locator {
    return this.page.getByRole('link', { name: 'Sign up' }).first();
  }

  private get homeLink(): Locator {
    return this.page.getByRole('link', { name: 'Home' }).first();
  }

  constructor(page: Page) {
    super(page);
  }

  // ─── Actions ──────────────────────────────────────────────────────

  async isNavBarVisible(): Promise<boolean> {
    return this.isVisible(this.navBar);
  }

  async getMenuItemTexts(): Promise<string[]> {
    await this.waitUtils.waitForVisible(this.navBar);
    const allItems = await this.navLinks.allTextContents();
    return allItems.map((text) => text.trim()).filter((text) => text.length > 0);
  }

  async getMenuItemCount(): Promise<number> {
    return this.getElementCount(this.navLinks);
  }

  async clickMenuItem(menuText: string): Promise<void> {
    logger.info(`Clicking navigation item: "${menuText}"`);
    const menuItem = this.page.getByRole('link', { name: menuText }).first();
    await this.click(menuItem);
  }

  async isMenuItemVisible(menuText: string): Promise<boolean> {
    const menuItem = this.page.getByRole('link', { name: menuText }).first();
    return this.isVisible(menuItem);
  }

  async getMenuItemHref(menuText: string): Promise<string | null> {
    const menuItem = this.page.getByRole('link', { name: menuText }).first();
    return this.getAttribute(menuItem, 'href');
  }

  async clickLogo(): Promise<void> {
    logger.info('Clicking logo');
    await this.click(this.logo);
  }

  async isLogoVisible(): Promise<boolean> {
    try {
      await this.logo.waitFor({ state: 'visible', timeout: 10000 });
      return true;
    } catch {
      return false;
    }
  }

  async isSignInVisible(): Promise<boolean> {
    return this.isVisible(this.signInButton);
  }

  async isSignUpVisible(): Promise<boolean> {
    return this.isVisible(this.signUpButton);
  }

  async clickSignIn(): Promise<void> {
    logger.info('Clicking Sign In');
    await this.click(this.signInButton);
  }

  async clickSignUp(): Promise<void> {
    logger.info('Clicking Sign Up');
    await this.click(this.signUpButton);
  }

  async assertNavBarVisible(): Promise<void> {
    await this.assertVisible(this.navBar);
  }
}
