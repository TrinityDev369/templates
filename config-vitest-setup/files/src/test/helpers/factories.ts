// =============================================================================
// Test Data Factories
// =============================================================================
// Factory functions produce realistic test data with sensible defaults.
// Every field can be overridden via Partial<T> for targeted test scenarios.
//
// Usage:
//   const user = createUser();                          // all defaults
//   const admin = createUser({ role: 'admin' });        // override role
//   const items = Array.from({ length: 5 }, () => createItem()); // bulk
// =============================================================================

// -----------------------------------------------------------------------------
// Auto-incrementing ID generator
// -----------------------------------------------------------------------------

let nextId = 1;

/** Reset the ID counter — call this in beforeEach if you need deterministic IDs */
export function resetIdCounter(start = 1): void {
  nextId = start;
}

/** Get the next unique integer ID */
function getNextId(): number {
  return nextId++;
}

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------

export interface User {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'user' | 'viewer';
  avatarUrl: string | null;
  createdAt: string;
}

export interface Item {
  id: number;
  title: string;
  description: string;
  status: 'draft' | 'published' | 'archived';
  ownerId: number;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface ApiResponse<T> {
  data: T;
  meta: {
    requestId: string;
    timestamp: string;
  };
  errors: Array<{ code: string; message: string }>;
}

// -----------------------------------------------------------------------------
// Factory: User
// -----------------------------------------------------------------------------

/**
 * Create a test user with sensible defaults.
 * Every field can be overridden.
 */
export function createUser(overrides?: Partial<User>): User {
  const id = overrides?.id ?? getNextId();

  return {
    id,
    name: `User ${id}`,
    email: `user-${id}@example.com`,
    role: 'user',
    avatarUrl: null,
    createdAt: new Date().toISOString(),
    ...overrides,
  };
}

// -----------------------------------------------------------------------------
// Factory: Item
// -----------------------------------------------------------------------------

/**
 * Create a test item with sensible defaults.
 */
export function createItem(overrides?: Partial<Item>): Item {
  const id = overrides?.id ?? getNextId();

  return {
    id,
    title: `Item ${id}`,
    description: `This is the description for item ${id}.`,
    status: 'draft',
    ownerId: 1,
    tags: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...overrides,
  };
}

// -----------------------------------------------------------------------------
// Factory: API Response wrapper
// -----------------------------------------------------------------------------

/**
 * Wrap any data value in a standard API response envelope.
 * Useful for testing API integration layers.
 */
export function createApiResponse<T>(
  data: T,
  overrides?: Partial<Omit<ApiResponse<T>, 'data'>>,
): ApiResponse<T> {
  return {
    data,
    meta: {
      requestId: `req-${getNextId()}`,
      timestamp: new Date().toISOString(),
      ...overrides?.meta,
    },
    errors: [],
    ...overrides,
  };
}

// -----------------------------------------------------------------------------
// Factory: Bulk helpers
// -----------------------------------------------------------------------------

/**
 * Create an array of users.
 */
export function createUsers(
  count: number,
  overrides?: Partial<User>,
): User[] {
  return Array.from({ length: count }, () => createUser(overrides));
}

/**
 * Create an array of items.
 */
export function createItems(
  count: number,
  overrides?: Partial<Item>,
): Item[] {
  return Array.from({ length: count }, () => createItem(overrides));
}
