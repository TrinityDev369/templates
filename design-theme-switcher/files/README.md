# Design Theme Switcher

Light/dark/system theme toggle with React context, localStorage persistence, and CSS variable switching. Zero dependencies beyond React.

## What It Does

- Provides a `ThemeProvider` React context that manages light, dark, and system theme states
- Persists the user's theme choice to `localStorage` across sessions
- Automatically tracks OS-level color scheme changes when set to "system"
- Sets `class` or `data-theme` attribute on `<html>` for CSS-based theming
- Sets `color-scheme` CSS property on `<html>` for native browser dark mode support
- Includes a `ThemeToggle` button component with inline SVG icons (no icon library needed)
- Prevents flash of wrong theme (FOUC) via an inline `<head>` script

## Setup

### 1. Wrap your app with ThemeProvider

```tsx
import { ThemeProvider } from "./components/design-theme-switcher/ThemeProvider";

export default function App({ children }) {
  return (
    <ThemeProvider>
      {children}
    </ThemeProvider>
  );
}
```

### 2. Add ThemeToggle anywhere in your layout

```tsx
import { ThemeToggle } from "./components/design-theme-switcher/ThemeToggle";

function Header() {
  return (
    <header>
      <nav>{/* ... */}</nav>
      <ThemeToggle className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800" />
    </header>
  );
}
```

### 3. Add the flash prevention script to your HTML head

To prevent a flash of the wrong theme on page load, add this inline script to your HTML `<head>` before any stylesheets:

```html
<script>
  (function() {
    var t = localStorage.getItem('theme');
    var d = document.documentElement;
    if (t === 'dark' || (!t && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      d.classList.add('dark');
    } else {
      d.classList.add('light');
    }
    d.style.colorScheme = d.classList.contains('dark') ? 'dark' : 'light';
  })();
</script>
```

For Next.js, place this in your root `layout.tsx` using a `<Script>` tag with `strategy="beforeInteractive"`, or embed it directly in a custom `_document.tsx`.

### 4. Import theme.css (optional)

Import `theme.css` in your global stylesheet for smooth theme transition styles:

```css
@import "./components/design-theme-switcher/theme.css";
```

## useTheme Hook API

```tsx
import { useTheme } from "./components/design-theme-switcher/useTheme";

function MyComponent() {
  const { theme, resolvedTheme, setTheme } = useTheme();

  // theme: "light" | "dark" | "system" — the user's explicit choice
  // resolvedTheme: "light" | "dark" — the actual applied theme (resolves "system")
  // setTheme: (theme: Theme) => void — update the theme and persist to localStorage
}
```

### Return Values

| Property        | Type                          | Description                                                  |
|-----------------|-------------------------------|--------------------------------------------------------------|
| `theme`         | `"light" \| "dark" \| "system"` | The user's stored preference                                 |
| `resolvedTheme` | `"light" \| "dark"`           | The actual theme applied (resolves "system" to light or dark) |
| `setTheme`      | `(theme: Theme) => void`      | Updates theme, persists to localStorage, applies to DOM       |

## Configuration Options

`ThemeProvider` accepts the following props:

| Prop           | Type                      | Default    | Description                                      |
|----------------|---------------------------|------------|--------------------------------------------------|
| `defaultTheme` | `"light" \| "dark" \| "system"` | `"system"` | Theme used when nothing is stored in localStorage |
| `storageKey`   | `string`                  | `"theme"`  | The localStorage key for persisting the theme     |
| `attribute`    | `"class" \| "data-theme"` | `"class"`  | HTML attribute set on the `<html>` element        |

### Examples

```tsx
// Default: system theme, class attribute, "theme" storage key
<ThemeProvider>

// Start in dark mode, use data-theme attribute
<ThemeProvider defaultTheme="dark" attribute="data-theme">

// Custom storage key (useful for multi-app setups)
<ThemeProvider storageKey="my-app-theme">
```

## CSS Integration

This component works with any CSS variable-based color system. The provider sets a `class` (or `data-theme` attribute) on the root `<html>` element. Use that in your styles:

### With Tailwind CSS

Tailwind's `dark:` variant works out of the box when `darkMode: "class"` is set in your Tailwind config:

```js
// tailwind.config.js
module.exports = {
  darkMode: "class",
  // ...
};
```

Then use dark variants in your markup:

```html
<div class="bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
  Content adapts to theme automatically.
</div>
```

### With CSS Custom Properties

```css
:root {
  --bg: #ffffff;
  --text: #111827;
}

html.dark {
  --bg: #0f172a;
  --text: #f1f5f9;
}

body {
  background-color: var(--bg);
  color: var(--text);
}
```

### With data-theme attribute

If using `attribute="data-theme"`:

```css
[data-theme="light"] {
  --bg: #ffffff;
  --text: #111827;
}

[data-theme="dark"] {
  --bg: #0f172a;
  --text: #f1f5f9;
}
```

## Server-Side Rendering

The provider safely handles SSR:
- `getSystemTheme()` returns `"light"` when `window` is not available
- State initialization falls back to `defaultTheme` on the server
- The inline `<head>` script runs before React hydration, preventing mismatch

## File Overview

| File               | Purpose                                           |
|--------------------|---------------------------------------------------|
| `ThemeProvider.tsx` | React context provider with persistence and DOM sync |
| `ThemeToggle.tsx`   | Cycle button with inline SVG icons                |
| `useTheme.ts`       | Hook to access theme state from any component     |
| `theme.css`         | Transition styles and FOUC prevention docs        |
