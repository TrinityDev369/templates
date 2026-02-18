# Spacing & Grid System

A drop-in spacing foundation built on a 4px base grid. Provides CSS custom properties, semantic tokens, layout primitives, and Tailwind CSS integration for consistent spatial rhythm across any project.

## Philosophy

All spacing derives from a 4px base unit. This creates a predictable visual rhythm where every margin, padding, and gap aligns to the grid. The 4px base was chosen because it divides cleanly into common screen densities and pairs naturally with an 8px component grid (every even step lands on 8px).

- 4px for fine adjustments (inline elements, icon padding)
- 8px as the standard component spacing unit
- 16px and above for section-level separation

## Spacing Scale

The full scale maps to CSS custom properties under `--space-*`:

| Token          | Value      | Pixels |
|----------------|------------|--------|
| `--space-0`    | 0          | 0      |
| `--space-px`   | 1px        | 1      |
| `--space-0-5`  | 0.125rem   | 2      |
| `--space-1`    | 0.25rem    | 4      |
| `--space-1-5`  | 0.375rem   | 6      |
| `--space-2`    | 0.5rem     | 8      |
| `--space-2-5`  | 0.625rem   | 10     |
| `--space-3`    | 0.75rem    | 12     |
| `--space-3-5`  | 0.875rem   | 14     |
| `--space-4`    | 1rem       | 16     |
| `--space-5`    | 1.25rem    | 20     |
| `--space-6`    | 1.5rem     | 24     |
| `--space-7`    | 1.75rem    | 28     |
| `--space-8`    | 2rem       | 32     |
| `--space-9`    | 2.25rem    | 36     |
| `--space-10`   | 2.5rem     | 40     |
| `--space-11`   | 2.75rem    | 44     |
| `--space-12`   | 3rem       | 48     |
| `--space-14`   | 3.5rem     | 56     |
| `--space-16`   | 4rem       | 64     |
| `--space-20`   | 5rem       | 80     |
| `--space-24`   | 6rem       | 96     |
| `--space-28`   | 7rem       | 112    |
| `--space-32`   | 8rem       | 128    |
| `--space-36`   | 9rem       | 144    |
| `--space-40`   | 10rem      | 160    |
| `--space-44`   | 11rem      | 176    |
| `--space-48`   | 12rem      | 192    |
| `--space-52`   | 13rem      | 208    |
| `--space-56`   | 14rem      | 224    |
| `--space-60`   | 15rem      | 240    |
| `--space-64`   | 16rem      | 256    |
| `--space-72`   | 18rem      | 288    |
| `--space-80`   | 20rem      | 320    |
| `--space-96`   | 24rem      | 384    |

## Semantic Spacing Tokens

Four intent-based aliases map to the numeric scale. Use these instead of raw numbers whenever possible -- they communicate purpose and can be re-themed without touching every callsite.

| Token                | Default         | Use Case                              |
|----------------------|-----------------|---------------------------------------|
| `--space-section`    | `--space-16`    | Between major page sections           |
| `--space-component`  | `--space-8`     | Between sibling components            |
| `--space-element`    | `--space-4`     | Between elements inside a component   |
| `--space-inline`     | `--space-2`     | Between inline items (icon + label)   |

Example:

```css
.card-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-component);
}

.card-list .card-body > * + * {
  margin-top: var(--space-element);
}
```

## Layout Primitives

### Stack

Vertical flow with consistent spacing between children. The base `.stack` class uses `--space-element` (16px). Size variants override the gap.

```html
<div class="stack">
  <h2>Title</h2>
  <p>Paragraph with default element spacing above.</p>
</div>

<div class="stack">
  <div class="stack-lg">
    <p>First item</p>
    <p>32px gap above this item</p>
  </div>
</div>
```

| Class       | Gap              |
|-------------|------------------|
| `.stack`    | `--space-element` (16px) |
| `.stack-sm` | `--space-2` (8px)  |
| `.stack-md` | `--space-4` (16px) |
| `.stack-lg` | `--space-8` (32px) |
| `.stack-xl` | `--space-12` (48px)|

### Cluster

Horizontal wrapping flow. Items wrap naturally and maintain consistent gaps.

```html
<div class="cluster">
  <span class="tag">Design</span>
  <span class="tag">System</span>
  <span class="tag">Spacing</span>
</div>
```

| Class         | Gap              |
|---------------|------------------|
| `.cluster`    | `--space-element` (16px) |
| `.cluster-sm` | `--space-2` (8px)  |
| `.cluster-md` | `--space-4` (16px) |
| `.cluster-lg` | `--space-8` (32px) |

### Center

Constrains content to `--container-xl` (1280px) with horizontal auto-margins and padding.

```html
<div class="center">
  <p>Content is horizontally centered with padding on narrow viewports.</p>
</div>
```

### Grid Auto

Responsive grid that auto-fills columns with a 300px minimum. Uses `--space-component` as the gap.

```html
<div class="grid-auto">
  <div class="card">Card 1</div>
  <div class="card">Card 2</div>
  <div class="card">Card 3</div>
</div>
```

## Container System

Five container width tokens for constraining layouts:

| Token              | Width  |
|--------------------|--------|
| `--container-sm`   | 640px  |
| `--container-md`   | 768px  |
| `--container-lg`   | 1024px |
| `--container-xl`   | 1280px |
| `--container-2xl`  | 1400px |

Container padding tokens:

| Token               | Default         |
|----------------------|-----------------|
| `--container-pad`    | `--space-4` (16px) |
| `--container-pad-lg` | `--space-8` (32px) |

## Gap and Padding Utility Classes

Quick-access utility classes that reference the spacing scale:

**Gap classes** (for flex/grid containers):
`.gap-0`, `.gap-1`, `.gap-2`, `.gap-3`, `.gap-4`, `.gap-5`, `.gap-6`, `.gap-8`, `.gap-10`, `.gap-12`, `.gap-16`

**Padding classes**:
`.pad-0`, `.pad-1`, `.pad-2`, `.pad-3`, `.pad-4`, `.pad-6`, `.pad-8`, `.pad-12`, `.pad-16`

## Tailwind CSS Integration

The `tailwind.spacing.ts` file maps every spacing token to its CSS custom property. Import and spread it into your Tailwind config:

```typescript
// tailwind.config.ts
import { spacingTokens } from "./src/design-system/tailwind.spacing";

export default {
  theme: {
    ...spacingTokens,
  },
  // ...
} satisfies Config;
```

This lets you use standard Tailwind spacing utilities (`p-4`, `gap-8`, `m-section`) while the actual values resolve through CSS custom properties. Changing a token in `spacing.css` updates every Tailwind utility that references it -- no rebuild required for runtime theming.

The Tailwind integration also exposes semantic tokens as spacing utilities:

- `p-section`, `m-section`, `gap-section` -- section-level spacing
- `p-component`, `m-component`, `gap-component` -- component-level spacing
- `p-element`, `m-element`, `gap-element` -- element-level spacing
- `p-inline`, `m-inline`, `gap-inline` -- inline-level spacing

And container max-width utilities:

- `max-w-container-sm` through `max-w-container-2xl`

## Setup

1. Copy `spacing.css` and `tailwind.spacing.ts` into your project (default: `src/design-system/`).
2. Import `spacing.css` in your global stylesheet or entry point:

```css
/* globals.css */
@import "./design-system/spacing.css";
```

3. If using Tailwind, merge the spacing tokens into your config as shown above.
4. Use `--space-*` custom properties in your CSS or the utility classes in your markup.
