# Design Animation Library

Reusable animation primitives built on framer-motion. Drop-in components for common animation patterns with automatic reduced-motion support.

## Requirements

- React 18+
- framer-motion 10+

## Components

### AnimateIn

Animate children into view using preset or custom animations.

```tsx
import { AnimateIn } from "./AnimateIn";

// Basic fade up (default)
<AnimateIn>
  <h1>Hello</h1>
</AnimateIn>

// With a specific preset
<AnimateIn animation="scaleIn" delay={0.2} duration={0.3}>
  <Card />
</AnimateIn>

// Viewport-triggered (animates when scrolled into view)
<AnimateIn animation="fadeUp" viewport once>
  <Section />
</AnimateIn>

// Custom variants
<AnimateIn animation={{ hidden: { rotate: -10 }, visible: { rotate: 0 } }}>
  <Icon />
</AnimateIn>

// Render as a different element
<AnimateIn as="span" animation="fade">
  <Text />
</AnimateIn>
```

**Available presets:** `fade`, `fadeUp`, `fadeDown`, `fadeLeft`, `fadeRight`, `scaleIn`, `blurIn`

**Props:**

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `animation` | `string \| Variants` | `"fadeUp"` | Preset name or custom framer-motion variants |
| `delay` | `number` | `0` | Delay in seconds before animation starts |
| `duration` | `number` | `0.25` | Animation duration in seconds |
| `viewport` | `boolean` | `false` | Trigger animation on viewport entry |
| `once` | `boolean` | `true` | Only animate once when using viewport trigger |
| `className` | `string` | — | CSS class for the wrapper element |
| `style` | `CSSProperties` | — | Inline styles for the wrapper element |
| `as` | `keyof typeof motion` | `"div"` | HTML element to render |

### AnimatedPresence

Wrapper around framer-motion's AnimatePresence for enter/exit transitions. Change the `id` prop to trigger exit of the old child and entry of the new one.

```tsx
import { AnimatedPresence } from "./AnimatePresence";

// Tab switching
<AnimatedPresence id={currentTab}>
  <TabContent />
</AnimatedPresence>

// Custom animation
import { scaleIn } from "./presets";

<AnimatedPresence id={step} animation={scaleIn} duration={0.3}>
  <StepContent />
</AnimatedPresence>

// Sync mode (no wait between exit and enter)
<AnimatedPresence id={page} mode="sync">
  <PageContent />
</AnimatedPresence>
```

**Props:**

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `id` | `string \| number` | (required) | Unique key for the current child |
| `animation` | `Variants` | fade + slide | Custom framer-motion variants with hidden/visible/exit states |
| `duration` | `number` | `0.2` | Animation duration in seconds |
| `mode` | `"sync" \| "wait" \| "popLayout"` | `"wait"` | Transition mode between children |
| `className` | `string` | — | CSS class for the animated wrapper |

### Stagger

Animate children in sequence with a configurable delay between each.

```tsx
import { Stagger } from "./Stagger";

// Basic staggered list
<Stagger>
  <Card title="First" />
  <Card title="Second" />
  <Card title="Third" />
</Stagger>

// Custom timing
<Stagger staggerDelay={0.1} delayChildren={0.2}>
  <ListItem />
  <ListItem />
  <ListItem />
</Stagger>

// Viewport-triggered stagger
<Stagger viewport once staggerDelay={0.08}>
  <Feature />
  <Feature />
  <Feature />
</Stagger>

// Custom child animation
import { scaleIn } from "./presets";

<Stagger childVariants={scaleIn}>
  <Icon />
  <Icon />
  <Icon />
</Stagger>
```

**Props:**

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `staggerDelay` | `number` | `0.05` | Delay in seconds between each child |
| `delayChildren` | `number` | `0.1` | Initial delay before the first child animates |
| `childVariants` | `Variants` | fade + slide up | Variants applied to each child wrapper |
| `viewport` | `boolean` | `false` | Trigger stagger on viewport entry |
| `once` | `boolean` | `true` | Only animate once when using viewport trigger |
| `className` | `string` | — | CSS class for the container |
| `style` | `CSSProperties` | — | Inline styles for the container |

## Presets

The `presets.ts` file exports reusable transitions and variant objects.

### Transitions

```tsx
import { transitions } from "./presets";

// Use with motion components directly
<motion.div
  animate={{ x: 100 }}
  transition={transitions.spring}
/>
```

| Name | Type | Description |
|------|------|-------------|
| `transitions.fast` | Tween | 0.15s with ease-out curve |
| `transitions.normal` | Tween | 0.25s with ease-out curve |
| `transitions.slow` | Tween | 0.35s with ease-out curve |
| `transitions.spring` | Spring | Stiff, low bounce (400/30) |
| `transitions.springBouncy` | Spring | Medium stiffness, visible bounce (300/15) |
| `transitions.springGentle` | Spring | Soft, no overshoot (200/20) |

### Variant Objects

All variants use `hidden`, `visible`, and `exit` states (compatible with AnimatePresence).

```tsx
import { fadeUp, blurIn, staggerContainer, staggerItem } from "./presets";

// Use with motion components
<motion.div variants={fadeUp} initial="hidden" animate="visible" />

// Stagger pattern (manual)
<motion.ul variants={staggerContainer} initial="hidden" animate="visible">
  <motion.li variants={staggerItem}>Item 1</motion.li>
  <motion.li variants={staggerItem}>Item 2</motion.li>
</motion.ul>
```

| Name | Description |
|------|-------------|
| `fade` | Opacity only |
| `fadeUp` | Opacity + translate Y (up) |
| `fadeDown` | Opacity + translate Y (down) |
| `fadeLeft` | Opacity + translate X (from right) |
| `fadeRight` | Opacity + translate X (from left) |
| `scaleIn` | Opacity + scale from 0.9 |
| `scaleUp` | Opacity + scale from 0.5 |
| `blurIn` | Opacity + blur filter |
| `staggerContainer` | Parent variant for staggered lists |
| `staggerItem` | Child variant for staggered lists |

## Reduced Motion

All components call `useReducedMotion()` from framer-motion. When the user has enabled the `prefers-reduced-motion` media query in their operating system or browser, animations are completely disabled and children render immediately inside a plain `<div>`. No configuration is needed.

## Custom Variants

Pass a custom `Variants` object to any component instead of a preset string:

```tsx
const customAnimation: Variants = {
  hidden: { opacity: 0, rotate: -5, scale: 0.95 },
  visible: { opacity: 1, rotate: 0, scale: 1 },
  exit: { opacity: 0, rotate: 5, scale: 0.95 },
};

<AnimateIn animation={customAnimation}>
  <Widget />
</AnimateIn>

<AnimatedPresence id={key} animation={customAnimation}>
  <Content />
</AnimatedPresence>

<Stagger childVariants={customAnimation}>
  <Item />
  <Item />
</Stagger>
```

The `exit` state is used by `AnimatedPresence` when a child unmounts. For `AnimateIn` and `Stagger`, only `hidden` and `visible` states are required.
