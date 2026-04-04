---
name: tier-guide
description: Helps choose the right weight tier (Lite/Standard/Premium) based on project requirements. Use when the user asks about bundle size, performance optimization, which tier to use, or import paths.
---

# UI Kit Weight Tier Guide

Help choose the right tier for: $ARGUMENTS

## Decision Matrix

| Question | Lite | Standard | Premium |
|----------|------|----------|---------|
| Bundle size critical? | Yes | Moderate | No |
| Need animations? | No | Yes | Yes (enhanced) |
| Need spring physics? | No | No | Yes |
| Need aurora glow/particles? | No | No | Yes |
| Need form engine? | No | Yes | Yes |
| Need container queries? | No | Yes | Yes |
| Framework? | Any (CSS-only) | React 19 | React 19 |

## Import Paths

```tsx
// Lite — CSS-only wrappers, ~0.3-1.2 KB each
import { Button, Card, Badge } from '@annondeveloper/ui-kit/lite'

// Standard — full features, ~2-5 KB each (DEFAULT)
import { Button, Card, Badge } from '@annondeveloper/ui-kit'

// Premium — aurora effects, ~3-6 KB each
import { Button, Card, Badge } from '@annondeveloper/ui-kit/premium'
```

## Mixing Tiers

You can mix tiers in the same app:

```tsx
import { Button } from '@annondeveloper/ui-kit/premium'    // Hero CTA — premium
import { Card } from '@annondeveloper/ui-kit'               // Cards — standard
import { Badge } from '@annondeveloper/ui-kit/lite'         // Badges — lite (many on page)
```

## Bundle Impact

| Tier | Single Component | Full Library |
|------|-----------------|--------------|
| Lite | 0.3-1.2 KB | ~18 KB |
| Standard | 2-5 KB | ~163 KB |
| Premium | 3-6 KB | ~180 KB |

Tree-shaking works across all tiers — import only what you use.
