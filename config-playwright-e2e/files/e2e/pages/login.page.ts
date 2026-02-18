import { type Page, type Locator, expect } from '@playwright/test';

/**
 * Login Page — Page Object Model
 *
 * Encapsulates all interactions with the login page so that spec files
 * remain clean and resilient to UI changes. If the login form markup
 * changes, only this file needs updating.
 *
 * Locator strategy priority (Playwright best practices):
 *   1. getByRole()    — accessible role + name
 *   2. getByLabel()   — form labels
 *   3. getByTestId()  — data-testid fallback
 *
 * @see https://playwright.dev/docs/locators
 * @see https://playwright.dev/docs/pom
 */
export class LoginPage {
  /* ---------------------------------------------------------------- */
  /*  Locators                                                         */
  /* ---------------------------------------------------------------- */

  /** Email address input field */
  readonly emailInput: Locator;

  /** Password input field */
  readonly passwordInput: Locator;

  /** Primary submit / sign-in button */
  readonly submitButton: Locator;

  /** Inline error message shown on failed login */
  readonly errorMessage: Locator;

  /** "Remember me" checkbox */
  readonly rememberMeCheckbox: Locator;

  /* ---------------------------------------------------------------- */
  /*  Constructor                                                      */
  /* ---------------------------------------------------------------- */

  constructor(private readonly page: Page) {
    // Prefer accessible locators — these match real user interactions
    this.emailInput = page.getByLabel('Email');
    this.passwordInput = page.getByLabel('Password');
    this.submitButton = page.getByRole('button', { name: /sign in|log in/i });
    this.errorMessage = page.getByTestId('login-error');
    this.rememberMeCheckbox = page.getByLabel(/remember me/i);
  }

  /* ---------------------------------------------------------------- */
  /*  Actions                                                          */
  /* ---------------------------------------------------------------- */

  /**
   * Navigate to the login page.
   * Uses the baseURL from playwright.config.ts automatically.
   */
  async goto(): Promise<void> {
    await this.page.goto('/login');
  }

  /**
   * Fill credentials and submit the login form.
   *
   * @param email    - User email address
   * @param password - User password
   */
  async login(email: string, password: string): Promise<void> {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.submitButton.click();
  }

  /**
   * Read the current error message text.
   * Returns an empty string if no error is visible.
   */
  async getErrorMessage(): Promise<string> {
    // Wait briefly — error may appear after a network round-trip
    try {
      await this.errorMessage.waitFor({ state: 'visible', timeout: 3_000 });
      return (await this.errorMessage.textContent()) ?? '';
    } catch {
      return '';
    }
  }

  /* ---------------------------------------------------------------- */
  /*  Assertions                                                       */
  /* ---------------------------------------------------------------- */

  /**
   * Assert that login succeeded.
   * After a successful login the user should be redirected away from /login.
   */
  async expectLoginSuccess(): Promise<void> {
    // Wait for the URL to change away from the login page
    await expect(this.page).not.toHaveURL(/\/login/);
  }

  /**
   * Assert that the login error message is visible and optionally
   * matches the expected text.
   *
   * @param expectedText - Optional substring the error should contain
   */
  async expectLoginError(expectedText?: string): Promise<void> {
    await expect(this.errorMessage).toBeVisible();

    if (expectedText) {
      await expect(this.errorMessage).toContainText(expectedText);
    }
  }
}
