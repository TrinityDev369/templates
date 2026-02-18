# Codebase Graph

Map your codebase structure into the context graph for architectural awareness.

## What Gets Mapped

```
my-project/
├── packages/           → Module entities
│   ├── design-system/  → Module: @my-org/design-system
│   │   └── Button.tsx  → File: Button.tsx
│   │       └── Button  → Component: Button
│   └── mcp-core/       → Module: @my-org/mcp-core
├── apps/               → Module entities
│   ├── web/            → Module: apps/web
│   └── admin/          → Module: apps/admin
└── specs/              → Document entities
```

## Relationship Mapping

### Import Analysis

```typescript
// src/components/Button.tsx
import { cva } from 'class-variance-authority';  // File IMPORTS cva
import { cn } from '@/lib/utils';                // File IMPORTS cn
export function Button() { ... }                  // File EXPORTS Button
```

Creates:
- `Button.tsx` IMPORTS `class-variance-authority`
- `Button.tsx` IMPORTS `utils.ts`
- `Button.tsx` EXPORTS `Button` (Component)

### Function Calls

```typescript
function validateUser(token: string) {
  const decoded = decodeJWT(token);  // validateUser CALLS decodeJWT
  return checkPermissions(decoded);   // validateUser CALLS checkPermissions
}
```

Creates:
- `validateUser` CALLS `decodeJWT`
- `validateUser` CALLS `checkPermissions`

## Population Strategies

### Manual (Recommended for key areas)

Add important files and their relationships manually:

```bash
# Add key module
kg add "design-system" --type=Module --description="Component library with CVA patterns"

# Add key component
kg add "Button" --type=Component --description="Primary action button with variants"

# Connect them
kg connect <module-id> <component-id> --type=CONTAINS --project=codebase
```

### Script-Based (For bulk population)

Use AST parsing to extract structure automatically.

**TypeScript/JavaScript:**
```bash
# Future: scripts/extract-ts-graph.ts
bun run scripts/extract-ts-graph.ts packages/design-system/src
```

**Python:**
```bash
# Future: scripts/extract-py-graph.py
python scripts/extract-py-graph.py apps/mcp_factory
```

## Recommended Graph Structure

### Module Level

```
Module: @my-org/design-system
  ├── CONTAINS → File: Button.tsx
  ├── CONTAINS → File: Input.tsx
  ├── DEPENDS_ON → Module: class-variance-authority
  └── DEPENDS_ON → Module: tailwindcss
```

### Component Level

```
Component: Button
  ├── USES → DesignToken: color-primary
  ├── USES → DesignToken: spacing-md
  ├── IMPLEMENTS → Concept: CVA Variant Pattern
  └── CREATED_BY → Person: Georg
```

### Function Level

```
Function: validateUser
  ├── CALLS → Function: decodeJWT
  ├── CALLS → Function: checkPermissions
  ├── DEFINED_BY → File: auth.ts
  └── IMPLEMENTS → Concept: JWT Auth Pattern
```

## Querying the Codebase Graph

```bash
# Find all components in design-system
kg search "design-system components" --mode=graph

# Explore Button's dependencies
kg focus <button-id> --depth=2

# Find all files that import a module
kg search "imports class-variance-authority"

# List all Functions
kg list --type=Function
```

## Areas of Your Project

Map logical areas for quick navigation:

| Area | Module | Key Files |
|------|--------|-----------|
| Design System | `packages/design-system` | components/, tokens/ |
| MCP Factory | `apps/mcp_factory` | adapters/, tools/ |
| Web Frontend | `apps/web` | pages/, components/ |
| Admin Dashboard | `apps/admin` | components/, api/ |
| CLI | `packages/my-cli` | commands/, lib/ |
| Knowledge Graph | `packages/knowledge-graph` | api/, services/ |

## Future: Auto-Population

Planned features:
1. `kg ingest <path>` - Auto-populate from directory
2. `kg watch` - Live sync on file changes
3. `kg visualize` - Open graph in admin UI
