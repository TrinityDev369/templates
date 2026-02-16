---
name: accessibility
description: WCAG compliance and accessibility audit skill. Use when reviewing code for accessibility issues, implementing ARIA patterns, auditing pages for WCAG 2.2 compliance, fixing a11y violations, or adding screen reader support. Triggers on "accessibility", "a11y", "WCAG", "screen reader", "ARIA".
---

# Accessibility Audit

Audit and fix accessibility issues to meet WCAG 2.2 AA compliance.

## Quick Audit Checklist

Run through these checks on any component or page:

### Perceivable
- [ ] All images have meaningful `alt` text (or `alt=""` for decorative)
- [ ] Color contrast meets 4.5:1 for normal text, 3:1 for large text
- [ ] No information conveyed by color alone
- [ ] Text resizes to 200% without loss of content
- [ ] Captions/transcripts for audio/video content

### Operable
- [ ] All interactive elements reachable via keyboard (Tab/Shift+Tab)
- [ ] Visible focus indicator on all focusable elements
- [ ] No keyboard traps
- [ ] Skip navigation link present
- [ ] No content flashes more than 3 times per second

### Understandable
- [ ] `lang` attribute on `<html>`
- [ ] Form inputs have associated `<label>` elements
- [ ] Error messages are descriptive and linked to fields
- [ ] Consistent navigation across pages

### Robust
- [ ] Valid, semantic HTML (headings in order, landmarks used)
- [ ] ARIA roles/attributes used correctly
- [ ] Works with screen readers (VoiceOver, NVDA)

## Common ARIA Patterns

### Buttons with icons only
```tsx
<button aria-label="Close dialog">
  <XIcon aria-hidden="true" />
</button>
```

### Toggle buttons
```tsx
<button aria-pressed={isActive} onClick={toggle}>
  {isActive ? "On" : "Off"}
</button>
```

### Modal dialogs
```tsx
<div role="dialog" aria-modal="true" aria-labelledby="dialog-title">
  <h2 id="dialog-title">Confirm Action</h2>
  {/* Focus trap: Tab cycles within dialog */}
</div>
```

### Live regions (dynamic content)
```tsx
<div aria-live="polite" aria-atomic="true">
  {statusMessage}
</div>
```

### Navigation landmarks
```tsx
<nav aria-label="Main navigation">...</nav>
<main>...</main>
<aside aria-label="Sidebar">...</aside>
<footer>...</footer>
```

### Form validation
```tsx
<label htmlFor="email">Email</label>
<input
  id="email"
  type="email"
  aria-invalid={!!error}
  aria-describedby={error ? "email-error" : undefined}
/>
{error && <span id="email-error" role="alert">{error}</span>}
```

### Tabs
```tsx
<div role="tablist" aria-label="Settings">
  <button role="tab" aria-selected={active === 0} aria-controls="panel-0">General</button>
  <button role="tab" aria-selected={active === 1} aria-controls="panel-1">Security</button>
</div>
<div role="tabpanel" id="panel-0" aria-labelledby="tab-0">...</div>
```

## Contrast Checking

Minimum ratios (WCAG 2.2 AA):

| Element | Ratio |
|---------|-------|
| Normal text (<18px) | 4.5:1 |
| Large text (>=18px bold or >=24px) | 3:1 |
| UI components & graphical objects | 3:1 |

Quick formula (relative luminance):
```
L = 0.2126 * R + 0.7152 * G + 0.0722 * B
ratio = (L1 + 0.05) / (L2 + 0.05)  // L1 = lighter
```

## Semantic HTML Reference

Prefer native HTML over ARIA when possible:

| Instead of | Use |
|-----------|-----|
| `<div role="button">` | `<button>` |
| `<div role="link">` | `<a href>` |
| `<div role="heading">` | `<h1>`-`<h6>` |
| `<div role="list">` | `<ul>` / `<ol>` |
| `<div role="navigation">` | `<nav>` |
| `<span role="checkbox">` | `<input type="checkbox">` |

## Audit Workflow

1. **Automated scan** — run axe-core or Lighthouse accessibility audit
2. **Keyboard test** — tab through entire page, verify focus order and visibility
3. **Screen reader test** — navigate with VoiceOver/NVDA, verify announcements
4. **Visual check** — zoom to 200%, check reflow; verify contrast ratios
5. **Fix** — address violations by severity (critical > serious > moderate)
6. **Document** — note any intentional exceptions with justification
