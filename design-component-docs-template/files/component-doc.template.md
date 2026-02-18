# {ComponentName}

> {One-line description of what this component does}

## Overview

{2-3 sentences explaining the component's purpose, when to use it, and where it fits in the design system hierarchy.}

## Import

```tsx
import { {ComponentName} } from "@/components/{component-path}";
```

## Usage

### Basic

```tsx
<{ComponentName} />
```

### With Props

```tsx
<{ComponentName}
  variant="primary"
  size="md"
/>
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `variant` | `"primary" \| "secondary" \| "ghost"` | `"primary"` | Visual style variant |
| `size` | `"sm" \| "md" \| "lg"` | `"md"` | Component size |
| `disabled` | `boolean` | `false` | Disables interaction |
| `className` | `string` | `""` | Additional CSS classes |

## Variants

### Primary
{Description of primary variant and when to use it.}

### Secondary
{Description of secondary variant.}

### Ghost
{Description of ghost variant.}

## Sizes

| Size | Dimensions | Use Case |
|------|-----------|----------|
| `sm` | 32px height | Compact UI, tables |
| `md` | 40px height | Default, forms |
| `lg` | 48px height | Hero sections, CTAs |

## Accessibility

- **Role**: {ARIA role if applicable}
- **Keyboard**: {Tab, Enter, Space, Escape behavior}
- **Screen reader**: {What gets announced}
- **Focus**: {Focus ring behavior}

## Design Tokens

| Token | Value | Usage |
|-------|-------|-------|
| `--component-bg` | `var(--primary)` | Background color |
| `--component-fg` | `var(--primary-foreground)` | Text color |
| `--component-radius` | `var(--radius)` | Border radius |

## Composition

```tsx
{/* Example of composing with other components */}
<Card>
  <CardHeader>
    <{ComponentName} variant="ghost" />
  </CardHeader>
</Card>
```

## Do / Don't

| Do | Don't |
|----|-------|
| {Good usage pattern} | {Anti-pattern to avoid} |
| {Another good pattern} | {Another anti-pattern} |

## Related

- [{RelatedComponent1}](./{related1}.md) - {Why it's related}
- [{RelatedComponent2}](./{related2}.md) - {Why it's related}

## Changelog

| Version | Change |
|---------|--------|
| 1.0.0 | Initial release |
