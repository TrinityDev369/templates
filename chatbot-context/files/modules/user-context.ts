/**
 * @trinity369/use chatbot-context — User Context module
 *
 * Context module that injects authenticated user information into the
 * system prompt. When the user is anonymous (no userId), the module
 * returns an empty string and consumes no budget.
 *
 * Usage:
 * ```ts
 * import { createUserContextModule } from './modules/user-context';
 *
 * const userModule = createUserContextModule(
 *   async (userId) => {
 *     const user = await db.user.findUnique({ where: { id: userId } });
 *     if (!user) return null;
 *     return {
 *       name: user.name,
 *       plan: user.subscription?.plan,
 *       history: user.recentActions.map(a => a.description),
 *     };
 *   },
 *   currentUserId, // or undefined for anonymous
 * );
 * ```
 */

import type { ContextModule } from '../types';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface UserInfo {
  /** User's display name */
  name: string;
  /** Subscription plan or tier (e.g. "Pro", "Free", "Enterprise") */
  plan?: string;
  /** Recent activity descriptions for continuity context */
  history?: string[];
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/** Max number of history items to include in the context */
const MAX_HISTORY_ITEMS = 10;

/**
 * Estimated tokens for user context block.
 * Name + plan + history items, roughly 15 tokens base + 10 per history item.
 */
const BASE_TOKEN_ESTIMATE = 15;
const TOKENS_PER_HISTORY_ITEM = 10;

// ---------------------------------------------------------------------------
// Module factory
// ---------------------------------------------------------------------------

/**
 * Create a user context module.
 *
 * @param fetchUser - Async function that fetches user info by ID.
 *   Should return null if the user is not found.
 * @param userId - The authenticated user's ID, or undefined for anonymous users.
 * @returns A ContextModule that formats user info for prompt injection.
 */
export function createUserContextModule(
  fetchUser: (userId: string) => Promise<UserInfo | null>,
  userId?: string,
): ContextModule {
  return {
    name: 'user-context',
    description: 'Authenticated user information and recent activity',

    estimateTokens(): number {
      if (!userId) return 0;
      // Conservative estimate: base + some history items
      return BASE_TOKEN_ESTIMATE + MAX_HISTORY_ITEMS * TOKENS_PER_HISTORY_ITEM;
    },

    async build(_userMessage?: string): Promise<string> {
      if (!userId) return '';

      const user = await fetchUser(userId);
      if (!user) return '';

      const lines: string[] = ['## Current User'];
      lines.push('');
      lines.push(`The person you are speaking with is **${user.name}**.`);

      if (user.plan) {
        lines.push(`They are on the **${user.plan}** plan.`);
      }

      if (user.history && user.history.length > 0) {
        const recentItems = user.history.slice(0, MAX_HISTORY_ITEMS);
        lines.push('');
        lines.push('Recent activity:');
        for (const item of recentItems) {
          lines.push(`- ${item}`);
        }
      }

      return lines.join('\n');
    },
  };
}
