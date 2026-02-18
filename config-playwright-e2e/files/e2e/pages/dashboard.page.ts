import { type Page, type Locator, expect } from '@playwright/test';

/**
 * Dashboard Page — Page Object Model
 *
 * Encapsulates interactions with the main dashboard layout:
 * sidebar navigation, header bar, user menu, and content area.
 *
 * Locator strategy priority (Playwright best practices):
 *   1. getByRole()    — accessible role + name
 *   2. getByLabel()   — form labels
 *   3. getByTestId()  — data-testid fallback
 *
 * @see https://playwright.dev/docs/pom
 */
export class DashboardPage {
  /* ---------------------------------------------------------------- */
  /*  Locators                                                         */
  /* ---------------------------------------------------------------- */

  /** Sidebar navigation panel */
  readonly sidebarNav: Locator;

  /** Top header / app bar */
  readonly header: Locator;

  /** User avatar / name button that opens the user menu */
  readonly userMenuTrigger: Locator;

  /** Dropdown menu that appears after clicking the user menu trigger */
  readonly userMenuDropdown: Locator;

  /** Main content area where page-specific content renders */
  readonly mainContent: Locator;

  /* ---------------------------------------------------------------- */
  /*  Constructor                                                      */
  /* ---------------------------------------------------------------- */

  constructor(private readonly page: Page) {
    this.sidebarNav = page.getByRole('navigation', { name: /sidebar|main nav/i });
    this.header = page.getByRole('banner');
    this.userMenuTrigger = page.getByTestId('user-menu-trigger');
    this.userMenuDropdown = page.getByTestId('user-menu-dropdown');
    this.mainContent = page.getByRole('main');
  }

  /* ---------------------------------------------------------------- */
  /*  Actions                                                          */
  /* ---------------------------------------------------------------- */

  /**
   * Navigate directly to the dashboard.
   */
  async goto(): Promise<void> {
    await this.page.goto('/dashboard');
  }

  /**
   * Open the user menu dropdown.
   * Waits for the dropdown to become visible before returning.
   */
  async openUserMenu(): Promise<void> {
    await this.userMenuTrigger.click();
    await expect(this.userMenuDropdown).toBeVisible();
  }

  /**
   * Log out via the user menu.
   * Opens the dropdown (if closed), then clicks the logout option.
   */
  async logout(): Promise<void> {
    // Ensure the dropdown is open
    if (!(await this.userMenuDropdown.isVisible())) {
      await this.openUserMenu();
    }

    await this.userMenuDropdown
      .getByRole('menuitem', { name: /log\s?out|sign\s?out/i })
      .click();

    // Wait for redirect back to the login page
    await expect(this.page).toHaveURL(/\/login/);
  }

  /**
   * Navigate to a named section via the sidebar.
   *
   * @param section - The visible link text in the sidebar (e.g. "Settings")
   */
  async navigateTo(section: string): Promise<void> {
    await this.sidebarNav
      .getByRole('link', { name: new RegExp(section, 'i') })
      .click();

    // Wait for navigation to settle
    await this.page.waitForLoadState('domcontentloaded');
  }

  /* ---------------------------------------------------------------- */
  /*  Assertions                                                       */
  /* ---------------------------------------------------------------- */

  /**
   * Assert that the dashboard has fully loaded.
   * Checks for the presence of core layout elements.
   */
  async expectLoaded(): Promise<void> {
    await expect(this.sidebarNav).toBeVisible();
    await expect(this.header).toBeVisible();
    await expect(this.mainContent).toBeVisible();
  }

  /**
   * Assert that a specific content section is visible in the main area.
   *
   * @param name - Heading or label identifying the section
   */
  async expectSectionVisible(name: string): Promise<void> {
    const heading = this.mainContent.getByRole('heading', {
      name: new RegExp(name, 'i'),
    });
    await expect(heading).toBeVisible();
  }
}
