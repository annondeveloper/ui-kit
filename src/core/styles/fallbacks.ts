import { css } from './css-tag'

/**
 * RGB fallback values for browsers that don't support OKLCH color syntax.
 * Applied via @supports not (color: oklch(0% 0 0)) so modern browsers skip this entirely.
 */
export const oklchFallbackStyles = css`
  /* RGB fallbacks for browsers without OKLCH support */
  @supports not (color: oklch(0% 0 0)) {
    :root {
      /* Brand */
      --brand: #6366f1;
      --brand-light: #818cf8;
      --brand-dark: #4f46e5;
      --brand-subtle: rgba(99, 102, 241, 0.08);
      --brand-glow: rgba(99, 102, 241, 0.15);

      /* Surfaces */
      --bg-base: #141418;
      --bg-surface: #1e1e24;
      --bg-elevated: #28282f;
      --bg-overlay: rgba(10, 10, 14, 0.85);

      /* Borders */
      --border-subtle: rgba(255, 255, 255, 0.04);
      --border-default: rgba(255, 255, 255, 0.08);
      --border-strong: rgba(255, 255, 255, 0.14);
      --border-glow: rgba(99, 102, 241, 0.2);

      /* Interactive surfaces */
      --bg-hover: rgba(255, 255, 255, 0.06);
      --bg-active: rgba(255, 255, 255, 0.08);
      --surface-default: #28282f;

      /* Text */
      --text-primary: #f5f5f5;
      --text-secondary: #a0a0a0;
      --text-tertiary: #666666;
      --text-disabled: #404040;
      --text-on-brand: #ffffff;

      /* Status */
      --status-ok: #22c55e;
      --status-warning: #eab308;
      --status-critical: #ef4444;
      --status-info: #3b82f6;

      /* Aurora ambient */
      --aurora-1: rgba(99, 80, 200, 0.06);
      --aurora-2: rgba(200, 80, 180, 0.04);

      /* Shadows */
      --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.3);
      --shadow-md: 0 4px 12px rgba(0, 0, 0, 0.3);
      --shadow-lg: 0 24px 80px rgba(0, 0, 0, 0.4);
      --shadow-glow: 0 0 16px rgba(99, 102, 241, 0.3);
    }

    html.light {
      /* Surfaces */
      --bg-base: #fafafa;
      --bg-surface: #ffffff;
      --bg-elevated: #f5f5f7;
      --bg-overlay: rgba(30, 30, 40, 0.4);

      /* Borders */
      --border-subtle: rgba(0, 0, 0, 0.06);
      --border-default: rgba(0, 0, 0, 0.1);
      --border-strong: rgba(0, 0, 0, 0.18);

      /* Interactive surfaces */
      --bg-hover: rgba(0, 0, 0, 0.04);
      --bg-active: rgba(0, 0, 0, 0.07);
      --surface-default: #f5f5f7;

      /* Text */
      --text-primary: #1a1a2e;
      --text-secondary: #555555;
      --text-tertiary: #777777;
      --text-disabled: #bbbbbb;
      --text-on-brand: #ffffff;

      /* Status */
      --status-ok: #16a34a;
      --status-warning: #b45309;
      --status-critical: #dc2626;
      --status-info: #2563eb;

      /* Aurora */
      --aurora-1: rgba(99, 80, 200, 0.04);
      --aurora-2: rgba(200, 80, 180, 0.03);

      /* Shadows */
      --shadow-sm: 0 1px 3px rgba(0, 0, 0, 0.06);
      --shadow-md: 0 4px 12px rgba(0, 0, 0, 0.08);
      --shadow-lg: 0 12px 40px rgba(0, 0, 0, 0.1);
    }
  }
`
