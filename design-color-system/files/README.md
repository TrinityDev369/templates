# Design Color System

Semantic color palette built on the shadcn/ui HSL token system. Provides CSS custom properties for light and dark modes, extended status and chart colors, sidebar-specific tokens, and TypeScript utilities for contrast checking and runtime manipulation.

## Quick Start

1. Import `colors.css` in your global stylesheet (e.g., `globals.css`):

```css
@import "./design-system/colors.css";
```

2. Use tokens in your markup via Tailwind utilities or raw CSS:

```html
<!-- Tailwind utility (requires theme extension) -->
<div class="bg-primary text-primary-foreground">...</div>

<!-- Raw CSS -->
<div style="background-color: hsl(var(--primary)); color: hsl(var(--primary-foreground));">...</div>
```

3. For opacity variants, use the HSL slash syntax:

```css
.overlay {
  background-color: hsl(var(--background) / 0.8);
}
```

## Color Categories

### Core

The foundational set of semantic tokens, identical to shadcn/ui defaults. These cover all standard UI surfaces and interactive elements.

| Token                  | Purpose                              |
|------------------------|--------------------------------------|
| `--background`         | Page background                      |
| `--foreground`         | Default text color                   |
| `--card`               | Card surface                         |
| `--card-foreground`    | Text on cards                        |
| `--popover`            | Popover/dropdown surface             |
| `--popover-foreground` | Text in popovers                     |
| `--primary`            | Primary actions and emphasis         |
| `--primary-foreground` | Text on primary backgrounds          |
| `--secondary`          | Secondary actions and surfaces       |
| `--secondary-foreground` | Text on secondary backgrounds      |
| `--muted`              | Muted/subtle backgrounds             |
| `--muted-foreground`   | De-emphasized text                   |
| `--accent`             | Accent highlights                    |
| `--accent-foreground`  | Text on accent backgrounds           |
| `--destructive`        | Destructive/danger actions           |
| `--destructive-foreground` | Text on destructive backgrounds  |
| `--border`             | Default border color                 |
| `--input`              | Input field borders                  |
| `--ring`               | Focus ring color                     |

### Status

Semantic colors for feedback states. Each has a paired `-foreground` token for text on that color.

| Token                   | Purpose                   |
|-------------------------|---------------------------|
| `--success`             | Success states (green)    |
| `--success-foreground`  | Text on success           |
| `--warning`             | Warning states (amber)    |
| `--warning-foreground`  | Text on warning           |
| `--info`                | Informational states (blue) |
| `--info-foreground`     | Text on info              |

### Chart

Five distinct colors for data visualization, optimized for visual separation in both light and dark modes.

| Token       | Light            | Dark             |
|-------------|------------------|------------------|
| `--chart-1` | Warm orange-red  | Blue             |
| `--chart-2` | Teal             | Green            |
| `--chart-3` | Dark blue-gray   | Orange           |
| `--chart-4` | Gold             | Purple           |
| `--chart-5` | Orange           | Pink-red         |

### Sidebar

Dedicated tokens for sidebar components, allowing independent theming of navigation areas.

| Token                          | Purpose                    |
|--------------------------------|----------------------------|
| `--sidebar-background`         | Sidebar surface            |
| `--sidebar-foreground`         | Sidebar text               |
| `--sidebar-primary`            | Active/selected items      |
| `--sidebar-primary-foreground` | Text on active items       |
| `--sidebar-accent`             | Hover/focus backgrounds    |
| `--sidebar-accent-foreground`  | Text on hover/focus        |
| `--sidebar-border`             | Sidebar dividers           |
| `--sidebar-ring`               | Sidebar focus ring         |

## Dark Mode

Dark mode activates automatically when the `.dark` class is present on an ancestor element (typically `<html>`). All tokens are reassigned in the `.dark` selector -- no additional configuration is required.

```html
<!-- Light mode (default) -->
<html>
  <body>...</body>
</html>

<!-- Dark mode -->
<html class="dark">
  <body>...</body>
</html>
```

For system-preference-based switching, toggle the class via JavaScript:

```ts
const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
document.documentElement.classList.toggle("dark", prefersDark);
```

## Customization

Override any token by redefining the CSS custom property. Place overrides after the `colors.css` import so they take precedence.

```css
@import "./design-system/colors.css";

:root {
  /* Brand-specific primary */
  --primary: 220 90% 56%;
  --primary-foreground: 0 0% 100%;
}

.dark {
  --primary: 220 80% 65%;
  --primary-foreground: 0 0% 100%;
}
```

To add entirely new tokens, follow the same HSL format:

```css
:root {
  --brand: 262 83% 58%;
  --brand-foreground: 0 0% 100%;
}
```

Then reference them in Tailwind by extending the theme:

```ts
// tailwind.config.ts
export default {
  theme: {
    extend: {
      colors: {
        brand: "hsl(var(--brand))",
        "brand-foreground": "hsl(var(--brand-foreground))",
      },
    },
  },
};
```

## Contrast Utilities

The `color-utils.ts` module provides functions for working with the token system at runtime.

### Parsing and Formatting

```ts
import { parseHSL, toHSLString } from "./color-utils";

const components = parseHSL("240 10% 3.9%");
// { h: 240, s: 10, l: 3.9 }

const str = toHSLString(240, 10, 3.9);
// "240 10.0% 3.9%"
```

### Runtime Variable Access

```ts
import { getCSSVar, setCSSVar } from "./color-utils";

// Read the current primary color
const primary = getCSSVar("primary");

// Override at runtime
setCSSVar("primary", "220 90% 56%");
```

### WCAG Contrast Checking

```ts
import { contrastRatio, meetsWCAG } from "./color-utils";

const ratio = contrastRatio("240 5.9% 10%", "0 0% 98%");
// ~17.4 (excellent contrast)

meetsWCAG("240 5.9% 10%", "0 0% 98%", "AA");
// true

meetsWCAG("240 5.9% 10%", "0 0% 98%", "AAA");
// true
```

### Alpha Variants

```ts
import { withAlpha } from "./color-utils";

withAlpha("240 5.9% 10%", 0.5);
// "hsl(240 5.9% 10% / 0.5)"
```

## Token Format

All values use the HSL format without the `hsl()` wrapper: `H S% L%`. This allows Tailwind to compose colors with arbitrary opacity using the slash syntax `hsl(var(--token) / alpha)`. When using tokens in raw CSS, always wrap them: `hsl(var(--primary))`.
