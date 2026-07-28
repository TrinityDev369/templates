/**
 * @trinity369/use chatbot-context — Domain Catalog module
 *
 * Context module that injects a product/service/course catalog into the
 * system prompt. The template provides the structure and formatting;
 * the client provides the data-fetching callback.
 *
 * Usage:
 * ```ts
 * import { createDomainCatalogModule } from './modules/domain-catalog';
 *
 * const catalogModule = createDomainCatalogModule(async () => {
 *   const products = await db.product.findMany({ where: { active: true } });
 *   return products.map(p => ({
 *     name: p.name,
 *     description: p.description,
 *     category: p.category,
 *     price: `${p.price} EUR`,
 *   }));
 * });
 * ```
 */

import type { ContextModule } from '../types';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface CatalogItem {
  /** Display name of the product/service/course */
  name: string;
  /** Description — will be truncated to 100 chars for budget efficiency */
  description: string;
  /** Optional category for grouping (e.g. "Yoga", "Meditation", "Retreats") */
  category?: string;
  /** Optional price display string (e.g. "49.00 EUR", "Free", "From 199 EUR/mo") */
  price?: string;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const MAX_DESCRIPTION_LENGTH = 100;
const DEFAULT_CATEGORY = 'General';

/**
 * Estimated tokens per catalog item (name + truncated description + metadata).
 * Roughly 40 tokens per item is a safe upper-bound.
 */
const TOKENS_PER_ITEM_ESTIMATE = 40;

/** Default estimated item count used before the first build. */
const DEFAULT_ITEM_COUNT_ESTIMATE = 20;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Truncate a string to a maximum length, appending ellipsis if truncated.
 */
function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - 3).trimEnd() + '...';
}

/**
 * Group items by category, preserving insertion order within each group.
 */
function groupByCategory(
  items: CatalogItem[],
): Map<string, CatalogItem[]> {
  const groups = new Map<string, CatalogItem[]>();

  for (const item of items) {
    const category = item.category?.trim() || DEFAULT_CATEGORY;
    const group = groups.get(category);
    if (group) {
      group.push(item);
    } else {
      groups.set(category, [item]);
    }
  }

  return groups;
}

// ---------------------------------------------------------------------------
// Module factory
// ---------------------------------------------------------------------------

/**
 * Create a domain catalog context module.
 *
 * @param fetchItems - Async function that returns the catalog items.
 *   This is called every time the module is built (at request time).
 *   The client is responsible for caching if needed.
 * @returns A ContextModule that formats the catalog for prompt injection.
 */
export function createDomainCatalogModule(
  fetchItems: () => Promise<CatalogItem[]>,
): ContextModule {
  let lastItemCount = DEFAULT_ITEM_COUNT_ESTIMATE;

  return {
    name: 'domain-catalog',
    description:
      'Product, service, or course catalog from the domain database',

    estimateTokens(): number {
      return lastItemCount * TOKENS_PER_ITEM_ESTIMATE;
    },

    async build(_userMessage?: string): Promise<string> {
      const items = await fetchItems();

      // Update estimate for future budget calculations
      lastItemCount = items.length || DEFAULT_ITEM_COUNT_ESTIMATE;

      if (items.length === 0) {
        return '';
      }

      const lines: string[] = ['## Catalog'];

      const hasCategories = items.some((item) => item.category?.trim());

      if (hasCategories) {
        // Group by category for structured output
        const groups = groupByCategory(items);

        for (const [category, groupItems] of groups) {
          lines.push('');
          lines.push(`### ${category}`);

          for (const item of groupItems) {
            const desc = truncate(item.description, MAX_DESCRIPTION_LENGTH);
            const price = item.price ? ` — ${item.price}` : '';
            lines.push(`- **${item.name}**${price}: ${desc}`);
          }
        }
      } else {
        // Flat list when no categories are provided
        lines.push('');
        for (const item of items) {
          const desc = truncate(item.description, MAX_DESCRIPTION_LENGTH);
          const price = item.price ? ` — ${item.price}` : '';
          lines.push(`- **${item.name}**${price}: ${desc}`);
        }
      }

      return lines.join('\n');
    },
  };
}
