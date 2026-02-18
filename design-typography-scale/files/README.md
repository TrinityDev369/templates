# Typography Scale

A fluid typography system built on CSS custom properties and `clamp()` functions. All sizes scale smoothly between 320px and 1280px viewports with no breakpoints required.

## What Is Included

- **Fluid type scale** (text-xs through text-6xl) using `clamp()` for viewport-responsive sizing
- **Font stack variables** (sans, serif, mono) defaulting to system fonts
- **Heading styles** (h1-h6) with proper weight, tracking, and line-height hierarchy
- **Prose container** for long-form content with comfortable reading width and spacing
- **Utility classes** for common text patterns (small, caption, overline, label, lead, mono)
- **Tailwind integration** file that maps CSS variables into Tailwind's theme system

## Fluid Scaling

Every size token uses CSS `clamp(min, preferred, max)` to interpolate between a minimum value (at 320px viewport) and a maximum value (at 1280px viewport). The browser calculates the exact size for any viewport width in between.

```
--text-base: clamp(0.9375rem, 0.9rem + 0.19vw, 1rem);  /* 15px at 320px -> 16px at 1280px */
--text-5xl:  clamp(2.25rem, 1.75rem + 2.5vw, 3rem);     /* 36px at 320px -> 48px at 1280px */
```

No media queries needed. Sizes transition continuously as the viewport changes.

## Heading Hierarchy

| Level | Size Token | Weight    | Line Height | Tracking |
|-------|-----------|-----------|-------------|----------|
| h1    | text-5xl  | extrabold | tight (1.25)| tight    |
| h2    | text-4xl  | bold      | tight (1.25)| tight    |
| h3    | text-3xl  | semibold  | snug (1.375)|          |
| h4    | text-2xl  | semibold  | snug (1.375)|          |
| h5    | text-xl   | medium    | normal (1.5)|          |
| h6    | text-lg   | medium    | normal (1.5)|          |

Both semantic elements (`h1`) and class selectors (`.h1`) are supported.

## Prose Styles

The `.prose` class sets up a reading-optimized container:

- Max width of 65ch (approximately 65 characters per line)
- Relaxed line height (1.625)
- Paragraph spacing with bottom margin
- Heading spacing with top and bottom margins
- Underlined links with offset
- Styled blockquotes with left border
- Code and pre blocks using the mono font stack
- List indentation and item spacing

```html
<article class="prose">
  <h2>Article Title</h2>
  <p>Body text with comfortable reading width and line height.</p>
  <blockquote>A styled quotation.</blockquote>
  <pre><code>console.log("formatted code block");</code></pre>
</article>
```

## Utility Classes

| Class      | Purpose                                              |
|------------|------------------------------------------------------|
| `.small`   | Secondary text (text-sm, normal line height)         |
| `.caption` | Image captions, footnotes (text-xs, wide tracking)   |
| `.overline`| Section labels (text-xs, semibold, uppercase, widest tracking) |
| `.label`   | Form labels, tags (text-sm, medium weight, tight line height) |
| `.lead`    | Introductory paragraphs (text-xl, relaxed line height)|
| `.mono`    | Monospace text without changing size                  |

Size utility classes (`.text-xs` through `.text-6xl`) are also provided for direct size control.

## Font Customization

The system uses system font stacks by default. Override the CSS custom properties to use custom fonts:

```css
:root {
  --font-sans: "Inter", ui-sans-serif, system-ui, sans-serif;
  --font-serif: "Lora", ui-serif, Georgia, serif;
  --font-mono: "JetBrains Mono", ui-monospace, monospace;
}
```

All heading, body, prose, and utility styles reference these variables, so a single override propagates everywhere.

## Installation

1. Copy `typography.css` into your design system directory.
2. Import it in your global stylesheet:

```css
@import "./design-system/typography.css";
```

## Tailwind Integration

The `tailwind.typography.ts` file exports a token object that maps CSS variables into Tailwind's theme. Spread it into your Tailwind config:

```typescript
// tailwind.config.ts
import { typographyTokens } from "./src/design-system/tailwind.typography";

export default {
  theme: {
    ...typographyTokens,
  },
  // ... rest of config
};
```

This lets you use Tailwind classes like `text-xl`, `font-sans`, `leading-relaxed`, and `tracking-tight` while they resolve to the fluid CSS custom properties defined in `typography.css`.

## Overriding Sizes

All size tokens are CSS custom properties. Override any of them to adjust the scale:

```css
:root {
  --text-base: 1.125rem;           /* bump base size to 18px */
  --text-5xl: clamp(3rem, 2.5rem + 3vw, 4rem);  /* larger h1 */
  --prose-width: 72ch;             /* wider reading column */
}
```
