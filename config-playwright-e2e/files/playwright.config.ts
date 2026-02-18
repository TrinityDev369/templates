import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright Configuration
 *
 * Handles multi-browser E2E testing with sensible defaults.
 * CI-aware: adjusts retries, workers, and reporters based on environment.
 *
 * @see https://playwright.dev/docs/test-configuration
 */

const isCI = !!process.env.CI;

export default defineConfig({
  /* ---------- Test discovery ---------- */

  /** Directory containing test spec files */
  testDir: './e2e/specs',

  /** Pattern for test files — defaults to *.spec.ts */
  testMatch: '**/*.spec.ts',

  /* ---------- Execution ---------- */

  /**
   * Run tests within each file in parallel.
   * Set to false if tests in a file depend on shared state.
   */
  fullyParallel: true,

  /**
   * Fail the build on CI if test.only is accidentally committed.
   * Locally this is allowed for focused debugging.
   */
  forbidOnly: isCI,

  /**
   * Retry flaky tests on CI to reduce false negatives.
   * No retries locally — flakes should be investigated immediately.
   */
  retries: isCI ? 2 : 0,

  /**
   * Limit parallel workers on CI to avoid resource contention.
   * Locally, use 50% of available CPU cores for speed.
   */
  workers: isCI ? 1 : undefined,

  /* ---------- Reporting ---------- */

  reporter: isCI
    ? [
        ['html', { open: 'never' }],
        ['json', { outputFile: 'test-results/results.json' }],
      ]
    : [['html', { open: 'on-failure' }]],

  /** Shared output directory for test artifacts */
  outputDir: 'test-results',

  /* ---------- Shared settings for all projects ---------- */

  use: {
    /**
     * Base URL for all page.goto() calls.
     * Override via PLAYWRIGHT_BASE_URL environment variable.
     */
    baseURL: process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3000',

    /**
     * Capture a screenshot when a test fails.
     * Helps diagnose failures without re-running.
     */
    screenshot: 'only-on-failure',

    /**
     * Record video on the first retry attempt.
     * Balances storage cost vs. debugging value.
     */
    video: 'on-first-retry',

    /**
     * Collect a trace on the first retry.
     * Traces include DOM snapshots, network, and console — invaluable for CI debugging.
     * View with: npx playwright show-trace trace.zip
     */
    trace: 'on-first-retry',

    /** Default timeout for each individual action (click, fill, etc.) */
    actionTimeout: 10_000,
  },

  /* ---------- Timeouts ---------- */

  /** Global timeout per test (including setup/teardown) */
  timeout: 30_000,

  /** Timeout for expect() assertions */
  expect: {
    timeout: 5_000,
  },

  /* ---------- Browser projects ---------- */

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },

    /* Uncomment to add mobile Chrome testing */
    // {
    //   name: 'mobile-chrome',
    //   use: { ...devices['Pixel 7'] },
    // },
  ],

  /* ---------- Dev server ---------- */

  /**
   * Uncomment to auto-start your app before tests run.
   * Playwright will wait for the server to be ready before executing tests.
   *
   * Adjust the command and port to match your project setup.
   */
  // webServer: {
  //   command: 'npm run dev',
  //   url: 'http://localhost:3000',
  //   reuseExistingServer: !isCI,
  //   timeout: 120_000,
  // },
});
