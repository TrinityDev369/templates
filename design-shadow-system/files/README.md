# Design Shadow System

Layered elevation shadow tokens for consistent depth perception across your UI. Each shadow level uses multiple box-shadow layers to produce realistic, soft shadows that mimic natural light behavior. The system provides CSS custom properties, semantic elevation classes, colored shadow variants, and a Tailwind CSS integration module.

## Quick Start

1. Import `shadows.css` in your global stylesheet (e.g., `globals.css`):

```css
@import "./design-system/shadows.css";
```

2. Apply shadows using utility classes or CSS variables:

```html
<!-- Utility class -->
<div class="shadow-md">Card with medium shadow</div>

<!-- CSS variable -->
<div style="box-shadow: var(--shadow-lg);">Card with large shadow</div>
```

3. For Tailwind projects, extend your config with the shadow tokens:

```ts
// tailwind.config.ts
import { shadowTokens } from "./src/design-system/tailwind.shadows";

export default {
  theme: {
    ...shadowTokens,
  },
};
```

## Elevation Levels

The system defines eight shadow levels, from no shadow to maximum depth. Each level (except `xs`, `2xl`, and `inner`) uses two shadow layers -- a larger diffuse layer and a tighter near-surface layer -- to create realistic depth.

| Token          | Layers | Description                                   |
|----------------|--------|-----------------------------------------------|
| `--shadow-xs`  | 1      | Barely visible lift. Subtle dividers, badges.  |
| `--shadow-sm`  | 2      | Light surface lift. Cards, list items.          |
| `--shadow-md`  | 2      | Medium depth. Dropdowns, floating toolbars.     |
| `--shadow-lg`  | 2      | Pronounced depth. Modals, dialogs.              |
| `--shadow-xl`  | 2      | High elevation. Popovers, toast notifications.  |
| `--shadow-2xl` | 1      | Maximum depth. Full-screen overlays.            |
| `--shadow-inner` | 1    | Inset shadow. Pressed buttons, input fields.    |
| `--shadow-none` | --     | Removes all shadows.                            |

### Why Multiple Layers

A single box-shadow produces a flat, artificial look. By combining a large diffuse shadow (ambient occlusion) with a smaller, sharper shadow (direct light), the result closely approximates how objects cast shadows under overhead lighting. This two-layer approach is the same technique used by Material Design and other modern design systems.

## Semantic Elevation Classes

For component-level usage where you want to communicate intent rather than size, use the numbered elevation classes:

| Class          | Maps To         | Use Case                        |
|----------------|-----------------|----------------------------------|
| `.elevation-0` | `--shadow-none` | Flat surfaces, disabled states   |
| `.elevation-1` | `--shadow-xs`   | Subtle lift, badges, chips       |
| `.elevation-2` | `--shadow-sm`   | Cards, list items                |
| `.elevation-3` | `--shadow-md`   | Dropdowns, menus                 |
| `.elevation-4` | `--shadow-lg`   | Modals, dialogs                  |
| `.elevation-5` | `--shadow-xl`   | Popovers, floating panels        |

```html
<div class="elevation-2">Standard card</div>
<div class="elevation-4">Modal dialog</div>
```

## Dark Mode

Dark mode activates automatically when the `.dark` class is present on an ancestor element (typically `<html>`). Two adjustments are made:

- **Shadow color** shifts from a neutral gray (`240 3.8% 46.1%`) to near-black (`240 5% 5%`), preventing washed-out shadows on dark surfaces.
- **Shadow strength** increases from `0.1` to `0.25`, compensating for the reduced contrast between dark surfaces and their shadows.

```html
<!-- Light mode (default) -->
<html>
  <body>
    <div class="shadow-md">Soft gray shadow</div>
  </body>
</html>

<!-- Dark mode -->
<html class="dark">
  <body>
    <div class="shadow-md">Stronger, darker shadow</div>
  </body>
</html>
```

No additional configuration is required. All shadow tokens reference `--shadow-color` and `--shadow-strength`, so the dark mode override propagates to every level automatically.

## Customization

### Adjusting Shadow Color

Override `--shadow-color` to tint shadows to match your brand or surface color. The value uses HSL format without the `hsl()` wrapper.

```css
:root {
  /* Warm shadow tint */
  --shadow-color: 30 10% 40%;
}
```

### Adjusting Shadow Strength

Override `--shadow-strength` to make shadows globally softer or harder.

```css
:root {
  /* Softer shadows */
  --shadow-strength: 0.06;
}

.dark {
  /* Slightly stronger in dark mode */
  --shadow-strength: 0.18;
}
```

### Per-Component Overrides

Since all tokens are CSS custom properties, you can scope overrides to specific containers:

```css
.glass-card {
  --shadow-color: 210 50% 60%;
  --shadow-strength: 0.15;
  box-shadow: var(--shadow-lg);
}
```

## Colored Shadows

Three colored shadow utilities are provided for semantic emphasis. Each uses the corresponding color token from the design system (with fallback values) at 25% opacity.

| Class                | Color Source      | Use Case                          |
|----------------------|-------------------|-----------------------------------|
| `.shadow-primary`    | `--primary`       | Primary action cards, CTAs        |
| `.shadow-destructive`| `--destructive`   | Error states, delete confirmations|
| `.shadow-success`    | `--success`       | Success cards, completion states  |

```html
<button class="shadow-primary">Submit</button>
<div class="shadow-destructive">Error panel</div>
<div class="shadow-success">Payment confirmed</div>
```

To add custom colored shadows, follow the same pattern:

```css
.shadow-warning {
  box-shadow: 0 4px 14px 0 hsl(var(--warning, 38 92% 50%) / 0.25);
}
```

## Interactive Shadow Transitions

The `.shadow-interactive` class adds smooth shadow transitions for hover and active states. This creates a "lift on hover, press on click" effect.

```html
<div class="shadow-sm shadow-interactive">
  Hover to lift, click to press
</div>
```

Behavior:
- **Default**: Inherits whatever shadow is already applied.
- **Hover**: Transitions to `--shadow-lg` (lifts the element).
- **Active**: Transitions to `--shadow-sm` (presses the element down).
- **Timing**: 200ms with `cubic-bezier(0.4, 0, 0.2, 1)` easing for natural motion.

Combine with an initial shadow level for the full effect:

```html
<div class="shadow-md shadow-interactive">
  Starts at md, lifts to lg on hover, drops to sm on click
</div>
```

## Ring Shadow (Focus States)

The system includes ring variables for consistent focus indicators:

| Variable              | Default                        | Purpose                   |
|-----------------------|--------------------------------|---------------------------|
| `--ring-offset-width` | `2px`                          | Gap between element and ring |
| `--ring-offset-color` | `hsl(var(--background))`       | Color of the offset gap   |
| `--ring-width`        | `2px`                          | Width of the focus ring   |
| `--ring-color`        | `hsl(var(--ring) / 0.5)`       | Color and opacity of ring |

These integrate with Tailwind's `ring-*` utilities and can be customized per-component.

## Tailwind Integration

The `tailwind.shadows.ts` module maps all shadow tokens to Tailwind's `boxShadow` theme. After importing, standard Tailwind shadow utilities (`shadow-sm`, `shadow-md`, etc.) will use the CSS custom property values instead of Tailwind defaults.

```ts
// tailwind.config.ts
import { shadowTokens } from "./src/design-system/tailwind.shadows";

export default {
  theme: {
    ...shadowTokens,
  },
};
```

This gives you:
- `shadow-xs` through `shadow-2xl` utilities backed by CSS variables.
- `shadow` (default) maps to `--shadow-sm`.
- `shadow-inner` and `shadow-none` work as expected.
- Dark mode changes propagate automatically since Tailwind outputs the variable references, not static values.

## Token Format

All shadow values are defined as complete `box-shadow` shorthand strings using `hsl()` with CSS custom property references for color. The HSL values in `--shadow-color` follow the same unwrapped format (`H S% L%`) used by the color system, enabling consistency across design tokens.
