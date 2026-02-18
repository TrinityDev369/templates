# Accessibility Primitives

A collection of CSS utilities and React components for building accessible interfaces. Covers focus management, screen reader support, skip navigation, focus trapping, reduced motion, high contrast mode, and touch target sizing.

## What's Included

| File | Type | Purpose |
|---|---|---|
| `a11y.css` | CSS | Focus rings, sr-only, skip link styles, reduced motion, high contrast, touch targets |
| `VisuallyHidden.tsx` | React | Hide content visually while keeping it accessible to screen readers |
| `SkipLink.tsx` | React | Skip-to-content link for keyboard navigation |
| `FocusTrap.tsx` | React | Trap focus within a container (modals, dialogs, drawers) |

## Setup

Import the CSS file in your global stylesheet or layout entry point:

```css
@import "./design-system/a11y.css";
```

Add the `SkipLink` component as the first child of your layout:

```tsx
import { SkipLink } from "./design-system/SkipLink";

export default function Layout({ children }) {
  return (
    <>
      <SkipLink />
      <nav>{/* navigation */}</nav>
      <main id="main-content">
        {children}
      </main>
    </>
  );
}
```

## Focus Ring System

The focus ring system provides consistent, visible focus indicators across all interactive elements. It uses `:focus-visible` so focus rings only appear for keyboard navigation, not mouse clicks.

### CSS Custom Properties

Override these variables to customize the focus ring appearance:

```css
:root {
  --focus-ring-color: hsl(240 5.9% 10% / 0.5);
  --focus-ring-width: 2px;
  --focus-ring-offset: 2px;
  --focus-ring-offset-color: hsl(0 0% 100%);
}
```

The `.dark` class automatically adjusts for dark backgrounds.

### Utility Classes

- `.focus-ring` -- Adds a focus ring with a smooth transition on `:focus-visible`.
- `.focus-ring-inset` -- Moves the focus ring inward (useful for elements against page edges).

### Automatic Behavior

All focusable elements receive a `:focus-visible` outline by default. Mouse-only focus (`:focus:not(:focus-visible)`) produces no outline.

## VisuallyHidden Component

Renders content that is invisible to sighted users but remains in the accessibility tree for screen readers.

```tsx
import { VisuallyHidden } from "./design-system/VisuallyHidden";

<button>
  <IconSearch />
  <VisuallyHidden>Search</VisuallyHidden>
</button>
```

### Props

| Prop | Type | Default | Description |
|---|---|---|---|
| `children` | `ReactNode` | required | Content to hide visually |
| `focusable` | `boolean` | `false` | When true, content becomes visible on focus |

The `focusable` variant uses the `.sr-only-focusable` CSS class, which reveals the content when it or a child receives focus.

## SkipLink Component

A fixed-position link that appears when focused via keyboard, allowing users to jump past navigation directly to the main content area.

```tsx
import { SkipLink } from "./design-system/SkipLink";

<SkipLink />
// Or with custom target and label:
<SkipLink targetId="content-area" label="Skip to content" />
```

### Props

| Prop | Type | Default | Description |
|---|---|---|---|
| `targetId` | `string` | `"main-content"` | The `id` of the element to skip to |
| `label` | `string` | `"Skip to main content"` | Visible link text |

The target element must have a matching `id` attribute:

```html
<main id="main-content">...</main>
```

## FocusTrap Component

Constrains keyboard focus within a container. When active, Tab and Shift+Tab cycle through focusable elements inside the trap without escaping to the rest of the page.

```tsx
import { FocusTrap } from "./design-system/FocusTrap";

function Modal({ open, onClose, children }) {
  if (!open) return null;

  return (
    <FocusTrap active={open} onEscape={onClose} restoreFocus>
      <div role="dialog" aria-modal="true">
        {children}
        <button onClick={onClose}>Close</button>
      </div>
    </FocusTrap>
  );
}
```

### Props

| Prop | Type | Default | Description |
|---|---|---|---|
| `children` | `ReactNode` | required | Content to trap focus within |
| `active` | `boolean` | `true` | Whether the trap is currently active |
| `onEscape` | `() => void` | -- | Callback when Escape key is pressed |
| `restoreFocus` | `boolean` | `true` | Return focus to the previously focused element on deactivation |

### Focusable Element Detection

The trap recognizes these elements as focusable:

- `a[href]`
- `button:not([disabled])`
- `input:not([disabled])`
- `select:not([disabled])`
- `textarea:not([disabled])`
- `[tabindex]:not([tabindex="-1"])`
- `[contenteditable]`

## Reduced Motion Support

The `prefers-reduced-motion: reduce` media query disables animations and transitions globally:

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

To opt a specific element back into motion (for animations that convey meaning, not decoration):

```html
<div class="motion-safe">
  <!-- This element keeps its animations even with reduced motion enabled -->
</div>
```

## High Contrast / Forced Colors

When the user has forced colors enabled (Windows High Contrast Mode), the browser overrides most colors. Use these utility classes to control behavior:

- `.forced-color-adjust-none` -- Opts out of forced color adjustment for elements that rely on specific colors (charts, status indicators).
- `.forced-color-adjust-auto` -- Restores default forced color behavior on a child element.

```html
<div class="forced-color-adjust-none">
  <span style="color: red;">Critical</span>
  <span style="color: green;">Healthy</span>
</div>
```

Use sparingly. Most UI elements should respect forced colors.

## Touch Target Sizing

WCAG 2.5.8 (Level AAA) requires interactive elements to have a minimum touch target size of 44x44 CSS pixels.

```html
<button class="touch-target">
  <IconMenu />
</button>

<!-- 48x48 variant for primary actions on mobile -->
<button class="touch-target-lg">
  Submit
</button>
```

Both classes set `min-width`, `min-height`, and use `inline-flex` with centering.

## Screen Reader Only (CSS)

The `.sr-only` class can be used directly in HTML without the React component:

```html
<label for="search" class="sr-only">Search</label>
<input type="search" id="search" placeholder="Search..." />
```

The `.sr-only-focusable` variant reveals the element when focused -- used internally by the skip link.

## Selection Styling

Text selection uses the `--primary` CSS variable for background color, providing consistent selection appearance across the application.

## Browser Support

- Focus-visible: All modern browsers (Chrome 86+, Firefox 85+, Safari 15.4+)
- Forced colors: Chromium-based browsers and Firefox
- Prefers-reduced-motion: All modern browsers
- Touch target sizing: All browsers (pure CSS sizing)
