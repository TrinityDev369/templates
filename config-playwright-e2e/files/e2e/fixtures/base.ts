import { test as base, expect, type Page } from '@playwright/test';
import { LoginPage } from '../pages/login.page';

/**
 * Custom test fixtures
 *
 * Fixtures are the Playwright-recommended way to share setup/teardown
 * logic across tests. They are lazy — only created when a test actually
 * uses them — and automatically cleaned up after each test.
 *
 * @see https://playwright.dev/docs/test-fixtures
 */

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

/** Credentials used for authenticated test sessions */
export interface TestUser {
  email: string;
  password: string;
  name: string;
}

/* ------------------------------------------------------------------ */
/*  Fixture type declarations                                          */
/* ------------------------------------------------------------------ */

type CustomFixtures = {
  /** Pre-authenticated page — logs in before the test body runs */
  authenticatedPage: Page;

  /** Test user credentials — override per-test via fixture options */
  testUser: TestUser;
};

/* ------------------------------------------------------------------ */
/*  Fixture implementation                                             */
/* ------------------------------------------------------------------ */

export const test = base.extend<CustomFixtures>({
  /**
   * Provides test user credentials.
   *
   * Reads from environment variables so CI pipelines can inject
   * real test-account credentials without touching code.
   * Falls back to safe defaults for local development.
   */
  testUser: async ({}, use) => {
    const user: TestUser = {
      email: process.env.TEST_USER_EMAIL || 'test@example.com',
      password: process.env.TEST_USER_PASSWORD || 'TestPassword123!',
      name: process.env.TEST_USER_NAME || 'Test User',
    };

    await use(user);
  },

  /**
   * Provides a Page that is already logged in.
   *
   * Uses the LoginPage page-object to perform login, then hands
   * the authenticated page to the test. After the test finishes,
   * the browser context is automatically torn down by Playwright.
   */
  authenticatedPage: async ({ page, testUser }, use) => {
    const loginPage = new LoginPage(page);

    // Navigate to login and authenticate
    await loginPage.goto();
    await loginPage.login(testUser.email, testUser.password);

    // Wait for navigation away from the login page
    await loginPage.expectLoginSuccess();

    // Provide the authenticated page to the test
    await use(page);
  },
});

export { expect };
