// =============================================================================
// MSW Request Handlers
// =============================================================================
// Default request handlers that apply to every test. Individual tests can
// override these by calling `server.use(...)` with replacement handlers.
//
// All handlers return well-typed JSON responses matching the shapes used by
// the application. Keep response data minimal but realistic.
// =============================================================================

import { http, HttpResponse } from 'msw';

// -----------------------------------------------------------------------------
// Types — mirrors of the API response shapes used by the app
// -----------------------------------------------------------------------------

interface User {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'user' | 'viewer';
  avatarUrl: string | null;
}

interface LoginRequest {
  email: string;
  password: string;
}

interface LoginResponse {
  token: string;
  user: User;
}

interface Item {
  id: number;
  title: string;
  description: string;
  status: 'draft' | 'published' | 'archived';
  createdAt: string;
}

interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
}

// -----------------------------------------------------------------------------
// Handlers
// -----------------------------------------------------------------------------

export const handlers = [
  // GET /api/user — return the currently authenticated user
  http.get('/api/user', () => {
    const user: User = {
      id: 1,
      name: 'Test User',
      email: 'test@example.com',
      role: 'admin',
      avatarUrl: null,
    };

    return HttpResponse.json(user);
  }),

  // POST /api/login — authenticate with email + password
  http.post('/api/login', async ({ request }) => {
    const body = (await request.json()) as LoginRequest;

    // Simulate invalid credentials
    if (body.email !== 'test@example.com' || body.password !== 'password123') {
      return HttpResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 },
      );
    }

    const response: LoginResponse = {
      token: 'mock-jwt-token-xyz',
      user: {
        id: 1,
        name: 'Test User',
        email: body.email,
        role: 'admin',
        avatarUrl: null,
      },
    };

    return HttpResponse.json(response);
  }),

  // GET /api/items — return a paginated list of items
  http.get('/api/items', ({ request }) => {
    const url = new URL(request.url);
    const page = Number(url.searchParams.get('page') ?? '1');
    const pageSize = Number(url.searchParams.get('pageSize') ?? '10');

    const items: Item[] = Array.from({ length: pageSize }, (_, i) => ({
      id: (page - 1) * pageSize + i + 1,
      title: `Item ${(page - 1) * pageSize + i + 1}`,
      description: `Description for item ${(page - 1) * pageSize + i + 1}`,
      status: 'published',
      createdAt: new Date().toISOString(),
    }));

    const response: PaginatedResponse<Item> = {
      data: items,
      total: 42,
      page,
      pageSize,
    };

    return HttpResponse.json(response);
  }),
];
