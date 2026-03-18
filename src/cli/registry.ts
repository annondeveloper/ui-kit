/**
 * Component registry — metadata for every ui-kit component.
 * Used by the CLI to resolve files, npm deps, and internal deps when copying
 * components into a consumer project.
 */

export interface ComponentInfo {
  /** kebab-case component name (matches filename without extension). */
  name: string
  /** Short description shown in `list` output. */
  description: string
  /** Source files to copy, relative to the package's `src/` directory. */
  files: string[]
  /** npm packages the component requires at runtime. */
  dependencies: string[]
  /** Other ui-kit components this one imports. */
  internalDeps: string[]
}

export const registry: ComponentInfo[] = [
  {
    name: 'animated-counter',
    description: 'Smoothly animates between numeric values with easing.',
    files: ['components/animated-counter.tsx'],
    dependencies: ['framer-motion'],
    internalDeps: ['utils'],
  },
  {
    name: 'badge',
    description: 'Themed badge with color presets, optional icon, and custom variant support.',
    files: ['components/badge.tsx'],
    dependencies: ['lucide-react'],
    internalDeps: ['utils'],
  },
  {
    name: 'button',
    description: 'Polymorphic button with variant, size, loading, and icon support.',
    files: ['components/button.tsx'],
    dependencies: ['lucide-react'],
    internalDeps: ['utils'],
  },
  {
    name: 'checkbox',
    description: 'Themed checkbox with indeterminate state support.',
    files: ['components/checkbox.tsx'],
    dependencies: ['lucide-react'],
    internalDeps: ['utils'],
  },
  {
    name: 'confirm-dialog',
    description: 'Accessible confirmation dialog built on Radix AlertDialog.',
    files: ['components/confirm-dialog.tsx'],
    dependencies: ['@radix-ui/react-alert-dialog', 'framer-motion', 'lucide-react'],
    internalDeps: ['utils'],
  },
  {
    name: 'data-table',
    description: 'Full-featured data table with sorting, filtering, pagination, and density control.',
    files: ['components/data-table.tsx'],
    dependencies: ['@tanstack/react-table', 'framer-motion', 'lucide-react'],
    internalDeps: ['utils', 'truncated-text', 'empty-state', 'skeleton'],
  },
  {
    name: 'dropdown-menu',
    description: 'Animated dropdown menu built on Radix DropdownMenu.',
    files: ['components/dropdown-menu.tsx'],
    dependencies: ['@radix-ui/react-dropdown-menu', 'framer-motion', 'lucide-react'],
    internalDeps: ['utils'],
  },
  {
    name: 'empty-state',
    description: 'Decorative empty-state placeholder with icon, title, and optional actions.',
    files: ['components/empty-state.tsx'],
    dependencies: ['lucide-react'],
    internalDeps: ['utils'],
  },
  {
    name: 'filter-pill',
    description: 'Rounded pill-style filter toggle with active state and optional count.',
    files: ['components/filter-pill.tsx'],
    dependencies: [],
    internalDeps: ['utils'],
  },
  {
    name: 'form-input',
    description: 'Themed text input with label, error, and helper text. Exports shared class constants.',
    files: ['components/form-input.tsx'],
    dependencies: [],
    internalDeps: ['utils'],
  },
  {
    name: 'metric-card',
    description: 'KPI card with animated counter, sparkline, and trend indicator.',
    files: ['components/metric-card.tsx'],
    dependencies: ['framer-motion', 'lucide-react'],
    internalDeps: ['utils', 'animated-counter', 'sparkline'],
  },
  {
    name: 'select',
    description: 'Themed select dropdown built on Radix Select.',
    files: ['components/select.tsx'],
    dependencies: ['@radix-ui/react-select', 'lucide-react'],
    internalDeps: ['utils'],
  },
  {
    name: 'severity-timeline',
    description: 'Vertical timeline with severity-colored dots and expandable detail.',
    files: ['components/severity-timeline.tsx'],
    dependencies: ['framer-motion'],
    internalDeps: ['utils'],
  },
  {
    name: 'sheet',
    description: 'Slide-over panel from the right edge with backdrop and keyboard dismiss.',
    files: ['components/sheet.tsx'],
    dependencies: ['framer-motion', 'lucide-react'],
    internalDeps: ['utils'],
  },
  {
    name: 'skeleton',
    description: 'Shimmer skeleton loaders (block, text lines, card).',
    files: ['components/skeleton.tsx'],
    dependencies: [],
    internalDeps: ['utils'],
  },
  {
    name: 'sparkline',
    description: 'Minimal SVG sparkline chart for inline metric trends.',
    files: ['components/sparkline.tsx'],
    dependencies: [],
    internalDeps: ['utils'],
  },
  {
    name: 'status-badge',
    description: 'Status indicator with colored dot, label, and configurable status map.',
    files: ['components/status-badge.tsx'],
    dependencies: [],
    internalDeps: ['utils'],
  },
  {
    name: 'status-pulse',
    description: 'Animated pulsing status dot with configurable colors.',
    files: ['components/status-pulse.tsx'],
    dependencies: ['framer-motion'],
    internalDeps: ['utils'],
  },
  {
    name: 'success-checkmark',
    description: 'Animated SVG checkmark for success confirmations.',
    files: ['components/success-checkmark.tsx'],
    dependencies: ['framer-motion'],
    internalDeps: ['utils'],
  },
  {
    name: 'tabs',
    description: 'Animated tab bar with optional icons and keyboard navigation.',
    files: ['components/tabs.tsx'],
    dependencies: ['framer-motion', 'lucide-react'],
    internalDeps: ['utils'],
  },
  {
    name: 'threshold-gauge',
    description: 'SVG arc gauge with warning/critical threshold coloring.',
    files: ['components/threshold-gauge.tsx'],
    dependencies: ['framer-motion'],
    internalDeps: ['utils'],
  },
  {
    name: 'toast',
    description: 'Themed toast notifications powered by Sonner.',
    files: ['components/toast.tsx'],
    dependencies: ['sonner'],
    internalDeps: [],
  },
  {
    name: 'toggle-switch',
    description: 'Toggle switch with on/off icons and themed styling.',
    files: ['components/toggle-switch.tsx'],
    dependencies: ['lucide-react'],
    internalDeps: ['utils'],
  },
  {
    name: 'truncated-text',
    description: 'Text that truncates with ellipsis and shows full content in a tooltip.',
    files: ['components/truncated-text.tsx'],
    dependencies: ['@radix-ui/react-tooltip', 'lucide-react'],
    internalDeps: [],
  },
  {
    name: 'utilization-bar',
    description: 'Horizontal bar showing utilization percentage with threshold coloring.',
    files: ['components/utilization-bar.tsx'],
    dependencies: ['framer-motion'],
    internalDeps: ['utils'],
  },
]

/** Pseudo-component representing the shared utils module. */
export const UTILS_ENTRY: ComponentInfo = {
  name: 'utils',
  description: 'Shared utility functions (cn, formatters, color helpers).',
  files: ['utils.ts'],
  dependencies: ['clsx', 'tailwind-merge'],
  internalDeps: [],
}

/** Look up a component by name, returns undefined if not found. */
export function findComponent(name: string): ComponentInfo | undefined {
  if (name === 'utils') return UTILS_ENTRY
  return registry.find((c) => c.name === name)
}
