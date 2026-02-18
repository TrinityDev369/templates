/**
 * Test Data Helpers
 *
 * Factory functions and constants for generating test data.
 * Keeps spec files clean by centralizing data creation here.
 *
 * All factories produce unique data using timestamps to avoid
 * collisions when tests run in parallel.
 */

/* ------------------------------------------------------------------ */
/*  Interfaces                                                         */
/* ------------------------------------------------------------------ */

/** Credentials and profile info for a test user */
export interface TestUserData {
  email: string;
  password: string;
  name: string;
  role: 'admin' | 'member' | 'viewer';
}

/** A project entity used in dashboard / CRUD tests */
export interface TestProjectData {
  name: string;
  description: string;
  slug: string;
  isPublic: boolean;
}

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */

/** Well-known test routes — update if your app structure changes */
export const TEST_URLS = {
  login: '/login',
  dashboard: '/dashboard',
  settings: '/dashboard/settings',
  analytics: '/dashboard/analytics',
  profile: '/dashboard/profile',
} as const;

/**
 * Common timeouts (in milliseconds).
 * Use these instead of magic numbers in specs.
 */
export const TIMEOUTS = {
  /** Time to wait for a page transition to complete */
  navigation: 10_000,

  /** Time to wait for a toast / notification to appear */
  toast: 5_000,

  /** Time to wait for a long-running API call */
  api: 15_000,
} as const;

/* ------------------------------------------------------------------ */
/*  Factories                                                          */
/* ------------------------------------------------------------------ */

/**
 * Generate a unique test user.
 * Each call produces a different email to avoid account conflicts.
 *
 * @param overrides - Partial fields to override defaults
 */
export function createTestUser(
  overrides: Partial<TestUserData> = {},
): TestUserData {
  const id = Date.now();

  return {
    email: `test-user-${id}@example.com`,
    password: 'TestPassword123!',
    name: `Test User ${id}`,
    role: 'member',
    ...overrides,
  };
}

/**
 * Generate a unique test project.
 *
 * @param overrides - Partial fields to override defaults
 */
export function createTestProject(
  overrides: Partial<TestProjectData> = {},
): TestProjectData {
  const id = Date.now();

  return {
    name: `Test Project ${id}`,
    description: `Automatically generated test project (${id})`,
    slug: `test-project-${id}`,
    isPublic: false,
    ...overrides,
  };
}
