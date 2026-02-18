---
name: design-system
description: Build, maintain, and iterate on design system components — tokens, primitives, patterns, Storybook stories, and documentation.
triggers:
  - design system
  - design token
  - component library
  - storybook
  - ui primitive
  - theme
  - color system
  - typography scale
---

# Design System Skill

You are a design system engineer. You build, maintain, and evolve a token-based design system that powers all UI across the application.

## Core Principles

1. **Tokens first** -- All visual decisions (color, spacing, typography, shadows, motion) live as CSS custom properties. Components reference tokens, never hardcoded values.
2. **Composition over configuration** -- Build small, focused primitives. Complex UI emerges from composing primitives, not from prop-heavy mega-components.
3. **Accessibility by default** -- Every interactive component must have proper ARIA attributes, keyboard navigation, focus management, and color contrast.
4. **Document as you build** -- Every component gets a Storybook story and a doc page. No undocumented components.

## Token Architecture

The design system uses a layered token system. Raw values exist in exactly one place; everything else references them.

### Layer 1: Primitive Tokens (CSS Custom Properties)

Raw values that define the palette. These are the only place where actual color values, pixel sizes, and font stacks are defined.

```css
:root {
  /* Color primitives */
  --color-blue-500: oklch(55% 0.15 250);
  --color-blue-600: oklch(48% 0.15 250);
  --color-gray-50: oklch(98% 0.003 260);
  --color-gray-100: oklch(95% 0.004 260);
  --color-gray-900: oklch(15% 0.004 260);
  --color-gray-950: oklch(8% 0.003 260);

  /* Spacing primitives */
  --space-1: 0.25rem;
  --space-2: 0.5rem;
  --space-4: 1rem;
  --space-6: 1.5rem;
  --space-8: 2rem;

  /* Radius primitives */
  --radius-sm: 0.25rem;
  --radius-md: 0.375rem;
  --radius-lg: 0.5rem;
  --radius-xl: 0.75rem;
}
```

### Layer 2: Semantic Tokens

Map primitives to meaning. Components use these. Semantic tokens enable theme switching (light/dark) by remapping to different primitives.

```css
:root {
  /* Surfaces */
  --background: var(--color-gray-50);
  --foreground: var(--color-gray-900);
  --card: white;
  --card-foreground: var(--color-gray-900);
  --muted: var(--color-gray-100);
  --muted-foreground: var(--color-gray-500);

  /* Interactive */
  --primary: var(--color-blue-500);
  --primary-foreground: white;
  --ring: var(--color-blue-500);

  /* Borders */
  --border: var(--color-gray-200);

  /* Status */
  --destructive: oklch(60% 0.22 25);
  --destructive-foreground: white;
}

.dark {
  --background: var(--color-gray-950);
  --foreground: var(--color-gray-50);
  --card: var(--color-gray-900);
  --card-foreground: var(--color-gray-50);
  --muted: var(--color-gray-800);
  --muted-foreground: var(--color-gray-500);
  --primary: var(--color-blue-400);
  --border: var(--color-gray-800);
}
```

### Layer 3: Component Tokens

Scoped to individual components for fine-grained theming. Use CSS custom properties with a `_` prefix to indicate private/local scope.

```css
.button {
  --_bg: var(--primary);
  --_fg: var(--primary-foreground);
  --_radius: var(--radius-md);
  --_height: 2.5rem;

  background: var(--_bg);
  color: var(--_fg);
  border-radius: var(--_radius);
  height: var(--_height);
}

.button[data-variant="secondary"] {
  --_bg: var(--muted);
  --_fg: var(--muted-foreground);
}
```

## Component Creation Workflow

When asked to create a new component, follow these steps in order:

### Step 1: Check Existing Tokens

Does the component need new tokens? If so, add them to the appropriate token layer first. Never define raw values inside component files.

**Ask yourself:**
- Does this component introduce a new color? Add to primitive tokens.
- Does it need a new semantic meaning? Add to semantic tokens.
- Does it need component-scoped overrides? Add component tokens.

### Step 2: Write the Component

React + TypeScript. Use CSS modules or Tailwind utility classes. Reference tokens via CSS variables or semantic Tailwind classes.

```tsx
import { forwardRef } from "react";
import { cn } from "@/lib/utils"; // twMerge + clsx

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "destructive";
  size?: "sm" | "md" | "lg";
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center font-medium transition-colors",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
          "disabled:pointer-events-none disabled:opacity-50",
          variantStyles[variant],
          sizeStyles[size],
          className
        )}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";
```

### Step 3: Add Variants

Define variants via props. Map each variant to token overrides. Use a variant map object, not inline conditionals.

```tsx
const variantStyles = {
  primary: "bg-primary text-primary-foreground hover:bg-primary/90",
  secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
  ghost: "hover:bg-accent hover:text-accent-foreground",
  destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
} as const;

const sizeStyles = {
  sm: "h-8 px-3 text-sm rounded-md",
  md: "h-10 px-4 text-base rounded-md",
  lg: "h-12 px-6 text-lg rounded-lg",
} as const;
```

### Step 4: Accessibility Audit

Every interactive component must pass this checklist before it is considered complete:

- [ ] **ARIA role**: Add the appropriate ARIA role if the semantic HTML element is not sufficient (e.g., `role="dialog"`, `role="tablist"`)
- [ ] **Keyboard navigation**: Tab for focus, Enter/Space to activate, Escape to dismiss, Arrow keys for lists/tabs
- [ ] **Screen reader labels**: `aria-label` or `aria-labelledby` on elements without visible text
- [ ] **Focus ring visibility**: `focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2`
- [ ] **Color contrast**: 4.5:1 for normal text, 3:1 for large text (18px+ bold or 24px+ normal)
- [ ] **Touch target size**: Minimum 44x44px for mobile interaction
- [ ] **Focus trap in modals**: Focus must not escape dialogs, sheets, or drawers
- [ ] **Focus restoration**: Return focus to trigger element when overlay closes

### Step 5: Write Storybook Story

Every component gets a story file. Include at minimum: Default, all Variants, and an interactive playground.

### Step 6: Write Documentation

Use the component doc template (see below). Documentation lives alongside the component or in a central docs folder.

## Storybook Patterns

### Basic Story Structure

```tsx
import type { Meta, StoryObj } from "@storybook/react";
import { ComponentName } from "./ComponentName";

const meta: Meta<typeof ComponentName> = {
  title: "Components/ComponentName",
  component: ComponentName,
  tags: ["autodocs"],
  parameters: {
    layout: "centered", // or "fullscreen" for page-level components
  },
  argTypes: {
    variant: {
      control: "select",
      options: ["primary", "secondary", "ghost"],
    },
    size: {
      control: "select",
      options: ["sm", "md", "lg"],
    },
    disabled: {
      control: "boolean",
    },
  },
};

export default meta;
type Story = StoryObj<typeof ComponentName>;

export const Default: Story = {
  args: {
    children: "Click me",
  },
};
```

### Variant Showcase

Show all variants at once so reviewers can compare them side by side.

```tsx
export const AllVariants: Story = {
  render: () => (
    <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", alignItems: "center" }}>
      <ComponentName variant="primary">Primary</ComponentName>
      <ComponentName variant="secondary">Secondary</ComponentName>
      <ComponentName variant="ghost">Ghost</ComponentName>
      <ComponentName variant="destructive">Destructive</ComponentName>
    </div>
  ),
};

export const AllSizes: Story = {
  render: () => (
    <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
      <ComponentName size="sm">Small</ComponentName>
      <ComponentName size="md">Medium</ComponentName>
      <ComponentName size="lg">Large</ComponentName>
    </div>
  ),
};
```

### Interactive State Stories

```tsx
export const Disabled: Story = {
  args: { children: "Disabled", disabled: true },
};

export const Loading: Story = {
  args: { children: "Loading...", disabled: true },
  render: (args) => (
    <ComponentName {...args}>
      <Spinner className="mr-2 h-4 w-4 animate-spin" />
      Loading...
    </ComponentName>
  ),
};
```

### Layout Parameters

| Component type | Layout | When to use |
|---------------|--------|-------------|
| Primitives (Button, Input) | `centered` | Small, self-contained elements |
| Cards, Panels | `centered` | Medium containers |
| Page sections, Headers | `fullscreen` | Full-width layouts |
| Token swatches | `padded` | Documentation pages |

## File Organization

Organize files by atomic design level. Each component gets its own directory with co-located story and styles.

```
src/
  design-system/
    tokens/
      colors.css          # Primitive + semantic color tokens
      typography.css      # Font families, sizes, weights, tracking
      spacing.css         # Spacing scale
      effects.css         # Shadows, blur, borders, animations
      index.css           # Imports all token files

    primitives/
      button/
        button.tsx
        button.stories.tsx
        button.module.css  (optional, if CSS modules)
        index.ts
      input/
        input.tsx
        input.stories.tsx
        index.ts
      card/
        card.tsx
        card.stories.tsx
        index.ts
      ...

    components/
      data-table/
        data-table.tsx
        data-table.stories.tsx
        index.ts
      nav-menu/
        nav-menu.tsx
        nav-menu.stories.tsx
        index.ts
      ...

    compositions/
      hero-section/
        hero-section.tsx
        hero-section.stories.tsx
        index.ts
      pricing-section/
        pricing-section.tsx
        pricing-section.stories.tsx
        index.ts
      ...

    lib/
      utils.ts            # cn() utility (twMerge + clsx)

    index.ts              # Barrel exports
```

### Naming Conventions

| Item | Convention | Example |
|------|-----------|---------|
| Directory | kebab-case | `date-picker/` |
| Component file | kebab-case | `date-picker.tsx` |
| Component name | PascalCase | `DatePicker` |
| Story file | kebab-case + `.stories` | `date-picker.stories.tsx` |
| CSS module | kebab-case + `.module` | `date-picker.module.css` |
| Token file | kebab-case | `colors.css` |
| Barrel export | `index.ts` | `export { DatePicker } from "./date-picker"` |

## Quality Checklist

Before considering a component done, verify every item:

### Tokens and Theming
- [ ] Uses design tokens -- no hardcoded colors, spacing, or font values
- [ ] Supports light and dark mode via CSS variable switching
- [ ] New tokens (if any) are added to the appropriate layer

### TypeScript
- [ ] All props have TypeScript types
- [ ] Exported types for consumers (`ButtonProps`, etc.)
- [ ] Generic types where appropriate (e.g., `Select<T>`)
- [ ] `forwardRef` with proper ref typing for DOM-wrapping components

### Exports
- [ ] Has both a default export and a named export
- [ ] Barrel `index.ts` re-exports the component
- [ ] Props type is exported alongside the component

### Storybook
- [ ] Has at least a Default story
- [ ] All variants shown in a Showcase story
- [ ] Interactive controls via argTypes
- [ ] `tags: ["autodocs"]` for auto-generated docs

### Accessibility
- [ ] Appropriate ARIA roles and attributes
- [ ] Keyboard navigation (Tab, Enter, Space, Escape, Arrow keys as needed)
- [ ] Focus ring visible on keyboard interaction
- [ ] Color contrast passes WCAG AA (4.5:1 normal, 3:1 large)
- [ ] Touch target minimum 44x44px on interactive elements

### States
- [ ] Handles loading state where applicable
- [ ] Handles error state where applicable
- [ ] Handles empty/no-data state where applicable
- [ ] Handles disabled state
- [ ] Hover, active, and focus states are styled

### Responsiveness
- [ ] Works on mobile (320px minimum)
- [ ] Works on tablet and desktop
- [ ] No horizontal scrolling at any breakpoint
- [ ] Text remains readable at all sizes

### Code Quality
- [ ] No runtime errors or console warnings
- [ ] `className` prop accepted for composition
- [ ] `ref` forwarded for DOM access
- [ ] No unnecessary re-renders (memoize if needed)

## Common Patterns

### The `cn()` Utility

Every project needs a class name merge utility. Combine `clsx` (conditional classes) with `tailwind-merge` (deduplication).

```tsx
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

### Variant Mapping with CVA

Use `class-variance-authority` for complex variant logic.

```tsx
import { cva, type VariantProps } from "class-variance-authority";

const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        primary: "bg-primary text-primary-foreground hover:bg-primary/90",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline: "border border-border bg-background hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        sm: "h-8 px-3 text-sm",
        md: "h-10 px-4 text-base",
        lg: "h-12 px-6 text-lg",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  }
);

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  };
```

### Composable `className` Prop

Every component must accept a `className` prop so consumers can extend styles.

```tsx
interface Props {
  className?: string;
  children: React.ReactNode;
}

function Card({ className, children, ...props }: Props) {
  return (
    <div
      className={cn(
        "rounded-lg border border-border bg-card p-6 text-card-foreground shadow-sm",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
```

### Polymorphic `as` Prop

Allow consumers to change the rendered element.

```tsx
type PolymorphicProps<E extends React.ElementType> = {
  as?: E;
} & Omit<React.ComponentPropsWithoutRef<E>, "as">;

function Text<E extends React.ElementType = "p">({
  as,
  className,
  ...props
}: PolymorphicProps<E>) {
  const Component = as || "p";
  return <Component className={cn("text-foreground", className)} {...props} />;
}

// Usage:
// <Text>paragraph</Text>
// <Text as="span">inline</Text>
// <Text as="label" htmlFor="name">label</Text>
```

### Slot Pattern for Composition

Use a render slot to let consumers control the rendered element without `as` prop complexity.

```tsx
import { Slot } from "@radix-ui/react-slot";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ asChild = false, className, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return <Comp ref={ref} className={cn(buttonVariants(), className)} {...props} />;
  }
);

// Usage:
// <Button asChild><a href="/next">Continue</a></Button>
```

## When Modifying Tokens

Changing tokens affects the entire system. Follow this protocol:

1. **Impact analysis** -- Search the codebase for all references to the token being changed. List every component that will be affected.
2. **Dark mode verification** -- If changing a semantic token, verify both light and dark mode resolve correctly.
3. **Visual regression** -- Run visual regression tests if available. Otherwise, manually check the 3 most-used components that reference the changed token.
4. **Documentation update** -- If the token's name or semantic meaning changed, update the token documentation.
5. **Storybook check** -- Open Storybook and visually verify affected components.

## Component Documentation Template

Use this structure for documenting each component:

```markdown
# ComponentName

Brief description of what this component does and when to use it.

## Usage

\`\`\`tsx
import { ComponentName } from "@/components/component-name";

<ComponentName variant="primary" size="md">
  Label
</ComponentName>
\`\`\`

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| variant | "primary" \| "secondary" \| "ghost" | "primary" | Visual style |
| size | "sm" \| "md" \| "lg" | "md" | Size of the component |
| disabled | boolean | false | Disables interaction |
| className | string | - | Additional CSS classes |

## Variants

Description and visual reference for each variant.

## Accessibility

- Keyboard: Tab to focus, Enter/Space to activate
- Screen reader: Announces as button with label text
- ARIA: No additional attributes required (semantic HTML)

## Examples

### With icon
\`\`\`tsx
<ComponentName>
  <Icon className="mr-2 h-4 w-4" />
  With Icon
</ComponentName>
\`\`\`

### As link
\`\`\`tsx
<ComponentName asChild>
  <a href="/page">Navigate</a>
</ComponentName>
\`\`\`
```

## Anti-Patterns to Avoid

| Do Not | Do Instead | Why |
|--------|-----------|-----|
| Hardcode `#3369B6` or any hex value | Use `var(--primary)` or `bg-primary` | Tokens enable theming and consistency |
| Use `style={{ fontFamily: "..." }}` | Use `className="font-heading"` or `font-body` | Font stacks are managed via tokens |
| Use `bg-white dark:bg-gray-900` | Use `bg-background` | Semantic tokens handle theme switching |
| Use `text-gray-500` for muted text | Use `text-muted-foreground` | Semantic tokens survive theme changes |
| Redefine `cn()` utility locally | Import from `@/lib/utils` | Single source of truth for class merging |
| Build raw HTML for existing primitives | Import the primitive component | Duplicating primitives causes drift |
| Pass config objects to sections | Define explicit prop interfaces | Props-driven is more composable and type-safe |
| Skip heading levels (h1 then h3) | Use headings in sequential order | Assistive technology relies on heading hierarchy |
| Use fixed px sizes for typography | Use token-based responsive sizes | Tokens ensure consistent, responsive scaling |
| Forget the `className` prop | Always accept and forward `className` | Consumers need to extend component styles |
| Inline complex conditional styles | Use a variant map or CVA | Maps are readable, testable, and extensible |
