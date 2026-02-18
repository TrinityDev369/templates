# Responsive Breakpoints

A mobile-first breakpoint system with container query support, responsive utilities, and Tailwind CSS integration. Works as a universal design system foundation -- not tied to any specific project.

## Mobile-First Approach

All styles default to the smallest screen size. Media queries layer on overrides as the viewport grows. This means base CSS targets phones, and each breakpoint adds or adjusts rules for progressively larger screens.

Write your base styles for mobile, then use `sm:`, `md:`, `lg:`, `xl:`, or `2xl:` prefixed classes to adapt at wider viewports.

## Breakpoint Scale

| Token   | Width    | Devices                      |
|---------|----------|------------------------------|
| (base)  | 0--639px | Phones                       |
| `sm`    | 640px+   | Large phones, small tablets  |
| `md`    | 768px+   | Tablets                      |
| `lg`    | 1024px+  | Small laptops                |
| `xl`    | 1280px+  | Desktops                     |
| `2xl`   | 1400px+  | Large desktops               |

CSS custom properties are available on `:root` for use in custom stylesheets:

```css
var(--screen-sm)   /* 640px */
var(--screen-md)   /* 768px */
var(--screen-lg)   /* 1024px */
var(--screen-xl)   /* 1280px */
var(--screen-2xl)  /* 1400px */
```

Content width tokens map to the same values and include a prose width (65ch):

```css
var(--content-prose) /* 65ch */
var(--content-full)  /* 100% */
```

## Container Queries

Container queries let child elements respond to a **parent's** width rather than the viewport. This is ideal for reusable components that may appear in sidebars, modals, or cards where viewport width is irrelevant.

### How to Use the `.cq` Wrapper

1. Add the `.cq` class to the container element:

```html
<div class="cq">
  <div class="cq:md:grid-cols-2">
    <!-- Children respond to the parent's inline size -->
  </div>
</div>
```

2. Use `cq:` prefixed utility classes on children:

| Class prefix | Triggers at container width |
|--------------|----------------------------|
| `cq:sm:`     | 320px+                     |
| `cq:md:`     | 480px+                     |
| `cq:lg:`     | 640px+                     |

Available container-query utilities: `block`, `flex`, `grid`, `grid-cols-2`, `grid-cols-3`, `grid-cols-4`, `hidden`.

### Container vs Media Queries -- When to Use Which

Use **media queries** (`sm:`, `md:`, etc.) when:
- Layout depends on the full viewport width.
- You are building page-level structure (headers, hero sections, page grids).

Use **container queries** (`cq:sm:`, `cq:md:`, etc.) when:
- A component needs to adapt based on the space it actually occupies.
- The same component appears in different contexts (main content area vs sidebar vs modal).
- You are building reusable design system components.

## Responsive Visibility Helpers

Three semantic classes control element visibility by device class:

```css
.mobile-only   /* Visible below 768px */
.tablet-only   /* Visible 768px -- 1023px */
.desktop-only  /* Visible 1024px+ */
```

These use `display: block` / `display: none` toggling. Override with your own display value if needed.

## Responsive Typography Classes

Fluid type scaling using `clamp()`. No JavaScript required -- sizes interpolate smoothly between viewport bounds.

| Class                | Min    | Preferred         | Max    |
|----------------------|--------|-------------------|--------|
| `.responsive-text`   | 1rem   | 0.5rem + 2.5vw   | 1.5rem |
| `.responsive-heading`| 1.5rem | 1rem + 3vw       | 3rem   |
| `.responsive-display`| 2rem   | 1rem + 5vw       | 4.5rem |

```html
<h1 class="responsive-display">Hero Title</h1>
<h2 class="responsive-heading">Section Heading</h2>
<p class="responsive-text">Body copy that scales smoothly.</p>
```

## Aspect Ratio Utilities

Fixed aspect ratio classes for media containers:

| Class              | Ratio  | Use case            |
|--------------------|--------|---------------------|
| `.aspect-square`   | 1:1    | Avatars, thumbnails |
| `.aspect-video`    | 16:9   | Video embeds        |
| `.aspect-portrait` | 3:4    | Portrait photos     |
| `.aspect-wide`     | 21:9   | Cinematic banners   |

```html
<div class="aspect-video">
  <iframe src="..." />
</div>
```

## Tailwind Integration

Import the breakpoint tokens into your Tailwind config:

```typescript
// tailwind.config.ts
import { breakpointTokens } from "./src/design-system/tailwind.breakpoints";

export default {
  theme: {
    ...breakpointTokens,
  },
  // ...
};
```

This sets the `screens` config to match the CSS breakpoints and adds:
- Container query sizes (`containers` key for the `@tailwindcss/container-queries` plugin).
- `maxWidth` utilities referencing the CSS custom properties (`max-w-prose`, `max-w-screen-sm`, etc.).

### Container Queries Plugin

To use the Tailwind `containers` config, install the official plugin:

```bash
npm install @tailwindcss/container-queries
```

Then add it to your Tailwind config:

```typescript
import containerQueries from "@tailwindcss/container-queries";

export default {
  plugins: [containerQueries],
};
```

## Setup

1. Import `breakpoints.css` in your global stylesheet:

```css
@import "./design-system/breakpoints.css";
```

2. Optionally extend your Tailwind config with `tailwind.breakpoints.ts`.

3. Start using the utility classes, container queries, and responsive typography in your markup.
