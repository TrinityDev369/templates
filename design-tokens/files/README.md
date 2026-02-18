# Design Tokens

A universal design token system built on CSS custom properties. Uses shadcn/ui defaults as the starting point, providing a consistent foundation for colors, typography, spacing, radius, shadows, motion, and layout primitives.

## Quick Start

### 1. Import the token stylesheet

Add `tokens.css` to your global stylesheet (e.g., `globals.css` or your app's entry CSS):

```css
@import "./design-system/tokens.css";
```

### 2. Extend your Tailwind config

In your project's `tailwind.config.ts`, import and spread the design tokens:

```typescript
import type { Config } from "tailwindcss";
import { designTokens } from "./src/design-system/tailwind.config";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    ...designTokens,
    extend: {
      ...designTokens?.extend,
      // your additional overrides here
    },
  },
  plugins: [],
};

export default config;
```

### 3. Use tokens in your code

Tailwind utility classes map directly to the CSS custom properties:

```html
<div class="bg-background text-foreground rounded-lg shadow-md">
  <h1 class="text-primary font-semibold">Hello</h1>
  <p class="text-muted-foreground">Styled with design tokens.</p>
</div>
```

You can also reference tokens directly in CSS:

```css
.custom-element {
  background: hsl(var(--primary));
  padding: var(--space-4);
  border-radius: var(--radius);
  transition: all var(--duration-normal) var(--ease-default);
}
```

## Customization

Override any CSS custom property in your own stylesheet to re-theme the entire application. All color tokens use raw HSL values (without the `hsl()` wrapper) so they compose naturally with Tailwind's opacity modifiers.

```css
:root {
  --primary: 221 83% 53%;        /* blue instead of near-black */
  --primary-foreground: 0 0% 100%; /* white text on blue */
  --radius: 0.75rem;               /* rounder corners */
}
```

### Dark mode

The `.dark` class on a parent element (typically `<html>`) activates the dark theme. Override dark tokens the same way:

```css
.dark {
  --primary: 217 91% 60%;
  --background: 222 47% 11%;
}
```

## Token Categories

| Category       | Prefix / Pattern     | Description                                      |
|----------------|----------------------|--------------------------------------------------|
| Colors         | `--background`, `--primary`, etc. | Semantic color pairs (base + foreground)  |
| Radius         | `--radius`           | Base border radius, with `lg`/`md`/`sm` derived  |
| Typography     | `--font-*`, `--text-*`, `--leading-*`, `--tracking-*` | Font families, sizes, line heights, letter spacing, weights |
| Spacing        | `--space-*`          | 4px base grid from 0 to 64 (16rem)               |
| Shadows        | `--shadow-*`         | Box shadows from `sm` to `2xl` plus `inner`       |
| Motion         | `--duration-*`, `--ease-*` | Animation durations and easing curves       |
| Breakpoints    | `--screen-*`         | Reference values (use Tailwind responsive classes) |
| Z-Index        | `--z-*`              | Layering scale from dropdown (50) to tooltip (600) |

## shadcn/ui Compatibility

These tokens are a direct match for shadcn/ui's default theme variables. Any shadcn/ui component will work out of the box when `tokens.css` is loaded. The Tailwind config extension maps the same color names (`primary`, `secondary`, `destructive`, `muted`, `accent`, `popover`, `card`) that shadcn/ui components expect.

## Requirements

- Tailwind CSS 3 or later
- A CSS environment that supports custom properties (all modern browsers)
