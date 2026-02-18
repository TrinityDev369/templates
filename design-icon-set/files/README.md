# Design Icon Set

SVG icon system with a polymorphic `Icon` component, five size variants, and 24 tree-shakeable icon definitions. Built for React 18+.

## Quick Start

```tsx
import { Icon } from "./Icon";
import { Check, ArrowRight } from "./icons";

function Example() {
  return (
    <>
      <Icon icon={Check} size="md" label="Success" />
      <Icon icon={ArrowRight} size={18} className="text-muted-foreground" />
    </>
  );
}
```

## Icon Component API

| Prop        | Type                                        | Default | Description                                                       |
| ----------- | ------------------------------------------- | ------- | ----------------------------------------------------------------- |
| `icon`      | `IconDefinition`                            | --      | Required. The icon definition object to render.                   |
| `size`      | `"xs" \| "sm" \| "md" \| "lg" \| "xl" \| number` | `"md"`  | Named size token or a custom pixel value.                         |
| `label`     | `string`                                    | --      | Accessible label. When omitted the icon is treated as decorative. |
| `className` | `string`                                    | `""`    | CSS class applied to the `<svg>` element.                         |

All standard SVG props (`onClick`, `style`, `data-*`, etc.) are also accepted and spread onto the root `<svg>` element.

## Size Variants

| Token | Pixels | Typical Use            |
| ----- | ------ | ---------------------- |
| `xs`  | 12     | Inline badge indicators |
| `sm`  | 16     | Compact UI, table rows  |
| `md`  | 20     | Default body text icons |
| `lg`  | 24     | Headers, buttons        |
| `xl`  | 32     | Hero sections, empty states |

Pass a number for arbitrary sizing:

```tsx
<Icon icon={Search} size={40} />
```

## Accessibility

The `Icon` component follows WAI-ARIA guidelines for SVG icons:

- **Decorative icons** (no `label` prop): Rendered with `aria-hidden="true"` and no `role`. Screen readers skip these entirely.
- **Meaningful icons** (with `label` prop): Rendered with `role="img"` and `aria-label` set to the label value. Screen readers announce the label.

```tsx
{/* Decorative -- screen readers ignore */}
<Icon icon={ChevronRight} />

{/* Meaningful -- announced as "Next page" */}
<Icon icon={ChevronRight} label="Next page" />
```

When an icon is the only content inside a button, always provide a label:

```tsx
<button>
  <Icon icon={X} label="Close dialog" />
</button>
```

## Available Icons

### Navigation (8)

| Export         | Description           |
| -------------- | --------------------- |
| `ChevronRight` | Right-pointing chevron |
| `ChevronDown`  | Down-pointing chevron  |
| `ChevronLeft`  | Left-pointing chevron  |
| `ChevronUp`    | Up-pointing chevron    |
| `ArrowRight`   | Right arrow with head  |
| `ArrowLeft`    | Left arrow with head   |
| `ExternalLink` | External link indicator |
| `Menu`         | Hamburger menu (three lines) |

### Actions (8)

| Export   | Description               |
| -------- | ------------------------- |
| `X`      | Close / dismiss           |
| `Plus`   | Add / create              |
| `Minus`  | Remove / subtract         |
| `Search` | Search / magnifying glass |
| `Copy`   | Copy to clipboard         |
| `Check`  | Checkmark / confirm       |
| `Edit`   | Edit / pencil             |
| `Trash`  | Delete / remove           |

### Status (4)

| Export        | Description              |
| ------------- | ------------------------ |
| `AlertCircle` | Warning or error alert   |
| `CheckCircle` | Success confirmation     |
| `Info`        | Informational notice     |
| `Loader`      | Loading spinner (static) |

### Media (4)

| Export   | Description         |
| -------- | ------------------- |
| `Sun`    | Light mode / sun    |
| `Moon`   | Dark mode / moon    |
| `Eye`    | Visible / show      |
| `EyeOff` | Hidden / hide       |

## Adding Custom Icons

Define a new `IconDefinition` object with a Lucide-compatible SVG path. All paths should target a `0 0 24 24` viewBox with `stroke` rendering (no fill).

```typescript
import type { IconDefinition } from "./Icon";

export const Heart: IconDefinition = {
  name: "heart",
  viewBox: "0 0 24 24",
  path: "M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z",
};
```

The `IconDefinition` interface:

```typescript
interface IconDefinition {
  name: string;   // Kebab-case identifier (used for debugging, not rendering)
  viewBox: string; // SVG viewBox attribute, typically "0 0 24 24"
  path: string;    // SVG path d attribute (single path, supports M commands)
}
```

Guidelines for custom icons:

- Use a single `<path>` element. Combine multiple shapes using `M` (moveTo) commands within one `d` attribute.
- Design for `stroke` rendering: the component sets `fill="none"`, `stroke="currentColor"`, and `strokeWidth={2}`.
- Keep the viewBox at `0 0 24 24` for consistency with the included set.
- Name the export in PascalCase matching the icon concept.

## Tree-Shaking

Each icon is a named export. Bundlers (webpack, Rollup, esbuild, Vite) will tree-shake unused icons out of the final bundle. Import only what you need:

```typescript
// Good -- only ChevronRight and Check are bundled
import { ChevronRight, Check } from "./icons";

// Avoid -- pulls in all 24 icon definitions
import * as icons from "./icons";
```

Each `IconDefinition` is a plain object (~100 bytes), so even importing all icons has minimal overhead. However, selective imports keep bundles clean and intentions explicit.
