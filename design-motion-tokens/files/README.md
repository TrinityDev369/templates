# Motion Tokens

A complete motion token system providing duration scales, easing curves, keyframe
animations, and utility classes as CSS custom properties. Designed for consistent,
purposeful animation across any application.

## Philosophy

Animation should communicate, not decorate. Every transition serves a purpose:
guiding attention, confirming actions, or revealing spatial relationships. When
motion is consistent and predictable, interfaces feel responsive and trustworthy.
When it is random or excessive, interfaces feel chaotic and slow.

This system encodes that philosophy into tokens. Use the duration scale to match
timing to intent. Use the easing curves to match physics to context. Use the
reduced-motion media query to respect user preferences unconditionally.

## Duration Scale

The duration scale moves from instant feedback to deliberate emphasis. Choose
based on the perceived complexity of the change, not the visual distance traveled.

| Token                  | Value   | Use Case                                          |
|------------------------|---------|---------------------------------------------------|
| `--duration-instant`   | 0ms     | Immediate state changes with no visible transition |
| `--duration-fastest`   | 50ms    | Micro-interactions: checkbox toggles, icon swaps   |
| `--duration-faster`    | 100ms   | Button hover/active states, color shifts           |
| `--duration-fast`      | 150ms   | Hover transitions, focus rings, small reveals      |
| `--duration-normal`    | 250ms   | Enter/exit animations, dropdown opens, modals      |
| `--duration-slow`      | 350ms   | Panel slides, expanding sections, layout shifts    |
| `--duration-slower`    | 500ms   | Page transitions, large content reveals            |
| `--duration-slowest`   | 700ms   | Complex orchestrated sequences, onboarding steps   |
| `--duration-deliberate`| 1000ms  | Emphasis animations, celebration moments           |

**Rule of thumb**: if the user initiated the action, keep it fast (100-250ms).
If the system is presenting new content, take slightly longer (250-500ms) so the
user can track the change.

## Easing Curves

### Standard Curves

These are the workhorses. Use them for the vast majority of transitions.

- **`--ease-default`** `cubic-bezier(0.4, 0, 0.2, 1)` -- Standard Material
  easing. Starts quickly, decelerates smoothly. The default for most transitions.
- **`--ease-in`** `cubic-bezier(0.4, 0, 1, 1)` -- Accelerates from rest. Use
  for elements leaving the viewport or being dismissed.
- **`--ease-out`** `cubic-bezier(0, 0, 0.2, 1)` -- Decelerates into rest. Use
  for elements entering the viewport or appearing.
- **`--ease-in-out`** `cubic-bezier(0.4, 0, 0.2, 1)` -- Symmetric
  acceleration and deceleration. Use for elements that move within the viewport
  (repositioning, resizing).
- **`--ease-linear`** `linear` -- No acceleration. Use for progress bars,
  continuous rotation, or opacity fades where constant speed feels natural.

### Expressive Curves

Use sparingly. These curves add personality and should be reserved for moments
that benefit from extra emphasis.

- **`--ease-emphasized`** `cubic-bezier(0.2, 0, 0, 1)` -- Aggressive
  deceleration with a quick start. Good for hero entrances or primary CTAs.
- **`--ease-spring`** `cubic-bezier(0.175, 0.885, 0.32, 1.275)` -- Slight
  overshoot simulating spring physics. Good for scale-in animations, tooltips,
  and popovers.
- **`--ease-bounce`** `cubic-bezier(0.68, -0.55, 0.265, 1.55)` -- Pronounced
  elastic overshoot. Use for playful interactions like drag-and-drop landing or
  success confirmations.
- **`--ease-snappy`** `cubic-bezier(0.5, 0, 0.1, 1)` -- Fast initial movement
  with a crisp stop. Good for navigation transitions and tab switches.

### Enter/Exit Pairs

Use these as matched pairs for elements that appear and disappear. The enter
curve decelerates into view; the exit curve accelerates out of view.

- **`--ease-enter`** `cubic-bezier(0, 0, 0.2, 1)` -- Decelerate into position.
- **`--ease-exit`** `cubic-bezier(0.4, 0, 1, 1)` -- Accelerate out of position.

Pair them with asymmetric durations: enter animations should be slightly longer
than exit animations so the user can track what appeared, but dismissals feel
snappy.

## Keyframe Animations

Pre-built keyframe animations for common patterns. Each animation utility class
pairs a keyframe with an appropriate duration and easing from the token system.

### Fade

- `.animate-fade-in` -- Fades from transparent to opaque.
- `.animate-fade-out` -- Fades from opaque to transparent.

### Slide

- `.animate-slide-in-up` -- Slides up 8px while fading in. Use for dropdowns,
  tooltips, and content appearing below its trigger.
- `.animate-slide-in-down` -- Slides down 8px while fading in. Use for content
  appearing above its trigger.
- `.animate-slide-in-left` -- Slides right 8px while fading in. Use for
  side-panel content.
- `.animate-slide-in-right` -- Slides left 8px while fading in.

### Scale

- `.animate-scale-in` -- Scales from 95% to 100% while fading in. Uses the
  spring easing for a subtle overshoot. Good for modals and popovers.

### Continuous

- `.animate-spin` -- Continuous 360-degree rotation at 1s per revolution.
  Use for loading indicators.
- `.animate-pulse` -- Continuous opacity pulse. Use for skeleton loaders
  or placeholder content.
- `.animate-bounce` -- Continuous vertical bounce. Use for scroll indicators
  or attention-drawing elements.

## Stagger Children

Apply `.stagger-children` to a parent element to automatically stagger the
`animation-delay` of its first 10 children by 50ms increments. Each child
must have an animation applied independently.

```html
<ul class="stagger-children">
  <li class="animate-slide-in-up">First (0ms delay)</li>
  <li class="animate-slide-in-up">Second (50ms delay)</li>
  <li class="animate-slide-in-up">Third (100ms delay)</li>
</ul>
```

The 50ms increment is chosen to be fast enough that the stagger feels like a
wave rather than a sequence of independent events, while being slow enough that
each item is perceptibly distinct.

## Reduced Motion

The system includes an automatic `prefers-reduced-motion: reduce` media query
that applies globally. When active:

- All animation durations collapse to 0.01ms (effectively instant).
- All animation iteration counts are set to 1 (no looping).
- All transition durations collapse to 0.01ms.
- Scroll behavior is set to `auto` (no smooth scrolling).

This is applied with `!important` to override any inline styles or specificity
conflicts. You do not need to write any additional reduced-motion handling in
your components -- it is handled at the token level.

Elements still reach their final state (thanks to `animation-fill-mode: both`
on utility classes), so layout and visibility are preserved. The user simply
does not see the intermediate animation frames.

## Tailwind Integration

The `tailwind.motion.ts` file exports a theme extension object that maps all
motion tokens to Tailwind utilities.

### Setup

```typescript
// tailwind.config.ts
import type { Config } from "tailwindcss";
import { motionTokens } from "./src/design-system/tailwind.motion";

export default {
  theme: {
    ...motionTokens,
  },
} satisfies Config;
```

### Available Utilities

**Duration** -- `duration-{token}`:
```html
<button class="transition-colors duration-fast">Hover me</button>
<div class="transition-opacity duration-slower">Fade content</div>
```

**Easing** -- `ease-{token}`:
```html
<div class="transition-transform ease-spring">Spring effect</div>
<div class="transition-all ease-snappy">Snappy transition</div>
```

**Animation** -- `animate-{name}`:
```html
<div class="animate-fade-in">Appears with fade</div>
<div class="animate-slide-in-up">Slides up into view</div>
<div class="animate-scale-in">Scales in with spring</div>
```

All Tailwind utilities reference the same CSS custom properties as the raw
classes, so they stay in sync automatically. Changing `--duration-fast` in your
`:root` updates every component using `duration-fast` in Tailwind.

## CSS Custom Property Usage

You can use the tokens directly in your CSS without the utility classes:

```css
.my-component {
  transition: transform var(--duration-normal) var(--ease-spring),
              opacity var(--duration-fast) var(--ease-default);
}

.my-component.entering {
  animation: slide-in-up var(--duration-slow) var(--ease-enter) both;
}
```

This is the recommended approach for complex, multi-property transitions where
combining utility classes becomes unwieldy.
