// =============================================================================
// MSW Server (Node)
// =============================================================================
// Creates an MSW server instance for Node.js test environments.
// The server is started/stopped in setup.ts via beforeAll/afterAll hooks.
//
// To override a handler in a specific test:
//   import { server } from '@/test/mocks/server';
//   import { http, HttpResponse } from 'msw';
//
//   server.use(
//     http.get('/api/user', () => {
//       return HttpResponse.json({ error: 'Unauthorized' }, { status: 401 });
//     }),
//   );
// =============================================================================

import { setupServer } from 'msw/node';
import { handlers } from './handlers';

// Create server with the default handlers — exported for use in setup.ts
// and for per-test overrides via server.use(...)
export const server = setupServer(...handlers);
