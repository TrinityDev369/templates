# trinity-signature

Animated triangle signature easter-egg for client sites. Hidden behind the page — revealed on overscroll bounce.

## Install

```bash
npx @trinity/use trinity-signature
```

This installs 5 files into `components/trinity-signature/`.

## Usage

```tsx
import { TrinitySignature } from "./components/trinity-signature/trinity-signature";
import { OverscrollReveal } from "./components/trinity-signature/overscroll-reveal";

export default function Layout({ children }) {
  return (
    <OverscrollReveal
      background={<TrinitySignature accentColor="#00C9DB" />}
    >
      {children}
    </OverscrollReveal>
  );
}
```

## Props

### TrinitySignature

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `accentColor` | `string` | `"#0099DA"` | Client brand accent color (hex). Metallic shades derived automatically. |
| `href` | `string` | `"https://trinity.agency"` | Link URL |
| `label` | `string` | `"Design + Code by"` | Credit text |
| `agencyName` | `string` | `"Trinity Agency"` | Agency name |
| `height` | `number` | `300` | Height in px |
| `animation` | `string` | `"flow"` | `"swarm"` `"wave"` `"pulse"` `"vortex"` `"breathe"` `"flow"` |
| `speed` | `number` | `0.5` | Animation speed |
| `intensity` | `number` | `0.4` | Animation intensity |

### OverscrollReveal

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `background` | `ReactNode` | — | Content revealed on overscroll |
| `children` | `ReactNode` | — | Page content |
| `revealHeight` | `number` | `300` | Height of hidden layer |
| `contentBackground` | `string` | `"oklch(8% 0.003 260)"` | Page wrapper background |
| `peek` | `number` | `0` | Pixels visible before scroll |

## Peer Dependencies

- React >= 18
