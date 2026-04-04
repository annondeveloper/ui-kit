'use client'

import { useState, useMemo } from 'react'
import { css } from '@ui/core/styles/css-tag'
import { useStyles } from '@ui/core/styles/use-styles'
import { Icon } from '@ui/core/icons/icon'
import { iconPaths } from '@ui/core/icons/paths'
import { Button } from '@ui/components/button'
import { Card } from '@ui/components/card'
import { Badge } from '@ui/components/badge'
import { FormInput } from '@ui/components/form-input'
import { Select } from '@ui/components/select'
import { CopyBlock } from '@ui/domain/copy-block'
import { Tabs, TabPanel } from '@ui/components/tabs'
import { themes, type ThemeName } from '@ui/core/tokens/themes'
import { getComponentDatabase, searchComponents, type ComponentInfo } from '../utils/component-database'

// ─── Simulated MCP Data ────────────────────────────────────────────────────

const CATEGORIES = [
  { value: '', label: 'All Categories' },
  { value: 'primitives', label: 'Primitives' },
  { value: 'forms', label: 'Forms' },
  { value: 'navigation', label: 'Navigation' },
  { value: 'layout', label: 'Layout' },
  { value: 'overlays', label: 'Overlays' },
  { value: 'data-display', label: 'Data Display' },
  { value: 'monitoring', label: 'Monitoring' },
  { value: 'infrastructure', label: 'Infrastructure' },
  { value: 'visual-effects', label: 'Visual Effects' },
  { value: 'ai-realtime', label: 'AI & Realtime' },
]

const TIERS = [
  { value: '', label: 'All Tiers' },
  { value: 'standard', label: 'Standard' },
  { value: 'lite', label: 'Lite' },
  { value: 'premium', label: 'Premium' },
]

const THEME_NAMES: ThemeName[] = [
  'aurora', 'sunset', 'rose', 'amber', 'ocean', 'emerald',
  'cyan', 'violet', 'fuchsia', 'slate', 'corporate',
  'midnight', 'forest', 'wine', 'carbon',
]

const THEME_HEX: Record<ThemeName, string> = {
  aurora: '#6366f1', sunset: '#f97316', rose: '#f43f5e', amber: '#f59e0b',
  ocean: '#0ea5e9', emerald: '#10b981', cyan: '#06b6d4', violet: '#8b5cf6',
  fuchsia: '#d946ef', slate: '#64748b', corporate: '#1e40af', midnight: '#312e81',
  forest: '#065f46', wine: '#881337', carbon: '#27272a',
}

const SCENARIOS = [
  { value: 'basic', label: 'Basic Usage' },
  { value: 'form', label: 'Form Layout' },
  { value: 'dashboard', label: 'Dashboard Card' },
  { value: 'settings', label: 'Settings Panel' },
]

const ALL_ICONS = Object.keys(iconPaths)

// ─── Styles ──────────────────────────────────────────────────────────────────

const styles = css`
  @layer demo {
    .mcp-page {
      max-width: 1100px;
      margin: 0 auto;
    }

    /* ── Hero ─────────────────────────────────────────────────── */
    .mcp-hero {
      margin-block-end: 3rem;
    }

    .mcp-hero__badge {
      display: inline-flex;
      margin-block-end: 0.75rem;
    }

    .mcp-hero__title {
      font-size: clamp(1.75rem, 3.5vw, 2.5rem);
      font-weight: 800;
      letter-spacing: -0.025em;
      margin-block-end: 0.5rem;
      background: linear-gradient(135deg, var(--brand, oklch(65% 0.2 270)), var(--brand-light, oklch(75% 0.2 300)));
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      text-wrap: balance;
    }

    .mcp-hero__desc {
      font-size: var(--text-sm, 0.875rem);
      color: var(--text-secondary);
      max-width: 680px;
      line-height: 1.6;
    }

    /* ── Section ─────────────────────────────────────────────── */
    .mcp-section {
      margin-block-end: 3rem;
    }

    .mcp-section__header {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      margin-block-end: 1.25rem;
    }

    .mcp-section__title {
      font-size: var(--text-lg, 1.125rem);
      font-weight: 700;
      letter-spacing: -0.01em;
    }

    /* ── Tool Cards Grid ─────────────────────────────────────── */
    .mcp-tools {
      display: grid;
      grid-template-columns: 1fr;
      gap: 1.5rem;
    }

    .mcp-tool {
      padding: 1.25rem;
    }

    .mcp-tool__header {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      margin-block-end: 0.5rem;
    }

    .mcp-tool__icon {
      width: 2.25rem;
      height: 2.25rem;
      border-radius: var(--radius-md, 0.5rem);
      background: var(--brand-subtle, oklch(65% 0.2 270 / 0.08));
      display: grid;
      place-items: center;
      color: var(--brand, oklch(65% 0.2 270));
      flex-shrink: 0;
    }

    .mcp-tool__name {
      font-size: 0.9375rem;
      font-weight: 700;
      font-family: 'SF Mono', 'Fira Code', monospace;
      color: var(--text-primary);
    }

    .mcp-tool__desc {
      font-size: var(--text-sm, 0.875rem);
      color: var(--text-secondary);
      margin-block-end: 1rem;
      line-height: 1.5;
    }

    .mcp-tool__panel {
      border-radius: var(--radius-md, 0.5rem);
      background: var(--bg-base, oklch(8% 0.02 270));
      border: 1px solid var(--border-subtle);
      padding: 1rem;
    }

    .mcp-tool__controls {
      display: flex;
      gap: 0.75rem;
      flex-wrap: wrap;
      margin-block-end: 0.75rem;
      align-items: flex-end;
    }

    .mcp-tool__controls > * {
      flex: 1;
      min-width: 140px;
    }

    .mcp-tool__result {
      font-size: 0.8125rem;
      font-family: 'SF Mono', 'Fira Code', monospace;
      color: var(--text-secondary);
      background: var(--bg-surface, oklch(12% 0.015 270));
      border: 1px solid var(--border-subtle);
      border-radius: var(--radius-sm, 0.375rem);
      padding: 0.75rem;
      max-height: 300px;
      overflow-y: auto;
      white-space: pre-wrap;
      word-break: break-word;
      line-height: 1.5;
    }

    .mcp-tool__result-empty {
      color: var(--text-tertiary);
      font-style: italic;
    }

    /* ── Component List from tool ─────────────────────────────── */
    .mcp-comp-list {
      list-style: none;
      padding: 0;
      margin: 0;
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
      max-block-size: 400px;
      overflow-y: auto;
    }

    .mcp-comp-list__item {
      display: grid;
      grid-template-columns: 140px auto 1fr;
      align-items: center;
      gap: 0.5rem;
      padding: 0.375rem 0.75rem;
      border-radius: var(--radius-sm, 0.375rem);
      font-size: 0.8125rem;
      transition: background 0.15s;
      min-block-size: 0;
    }

    .mcp-comp-list__item:hover {
      background: var(--bg-hover);
    }

    .mcp-comp-list__name {
      font-weight: 600;
      color: var(--text-primary);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .mcp-comp-list__cat {
      color: var(--text-tertiary);
      font-size: 0.75rem;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    /* ── Icon Grid ──────────────────────────────────────────── */
    .mcp-icon-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(5rem, 1fr));
      gap: 0.5rem;
    }

    .mcp-icon-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.25rem;
      padding: 0.5rem;
      border-radius: var(--radius-sm, 0.375rem);
      transition: background 0.15s;
      cursor: default;
    }

    .mcp-icon-item:hover {
      background: var(--bg-elevated, oklch(16% 0.02 270));
    }

    .mcp-icon-item__label {
      font-size: 0.625rem;
      color: var(--text-tertiary);
      text-align: center;
      word-break: break-all;
    }

    /* ── Architecture Diagram ─────────────────────────────────── */
    .mcp-arch {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0;
      flex-wrap: wrap;
      padding: 2rem 1rem;
    }

    .mcp-arch__node {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.5rem;
      padding: 1rem 1.5rem;
      border-radius: var(--radius-md, 0.5rem);
      border: 1px solid var(--border-default);
      background: var(--bg-surface, oklch(12% 0.015 270));
      min-width: 120px;
      text-align: center;
    }

    .mcp-arch__node--active {
      border-color: var(--brand, oklch(65% 0.2 270));
      background: var(--brand-subtle, oklch(65% 0.2 270 / 0.08));
    }

    .mcp-arch__node-label {
      font-size: 0.8125rem;
      font-weight: 600;
      color: var(--text-primary);
    }

    .mcp-arch__node-desc {
      font-size: 0.6875rem;
      color: var(--text-tertiary);
    }

    .mcp-arch__arrow {
      font-size: 1.5rem;
      color: var(--text-tertiary);
      padding: 0 0.75rem;
      user-select: none;
    }

    /* ── Setup Guide ──────────────────────────────────────────── */
    .mcp-setup {
      display: flex;
      flex-direction: column;
      gap: 1.25rem;
    }

    .mcp-setup__step {
      display: flex;
      gap: 0.75rem;
    }

    .mcp-setup__num {
      width: 1.75rem;
      height: 1.75rem;
      border-radius: 50%;
      background: var(--brand-subtle, oklch(65% 0.2 270 / 0.08));
      color: var(--brand, oklch(65% 0.2 270));
      display: grid;
      place-items: center;
      font-size: 0.75rem;
      font-weight: 700;
      flex-shrink: 0;
    }

    .mcp-setup__content {
      flex: 1;
      min-width: 0;
    }

    .mcp-setup__label {
      font-size: 0.875rem;
      font-weight: 600;
      color: var(--text-primary);
      margin-block-end: 0.375rem;
    }

    .mcp-setup__detail {
      font-size: 0.8125rem;
      color: var(--text-secondary);
      margin-block-end: 0.5rem;
    }

    /* ── Token Preview ─────────────────────────────────────────── */
    .mcp-token-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
      gap: 0.5rem;
    }

    .mcp-token-item {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.5rem;
      border-radius: var(--radius-sm, 0.375rem);
      background: var(--bg-base, oklch(8% 0.02 270));
      border: 1px solid var(--border-subtle);
    }

    .mcp-token-swatch {
      width: 1.5rem;
      height: 1.5rem;
      border-radius: var(--radius-xs, 0.25rem);
      border: 1px solid var(--border-default);
      flex-shrink: 0;
    }

    .mcp-token-info {
      min-width: 0;
    }

    .mcp-token-name {
      font-size: 0.6875rem;
      font-weight: 600;
      color: var(--text-primary);
      font-family: 'SF Mono', 'Fira Code', monospace;
    }

    .mcp-token-value {
      font-size: 0.625rem;
      color: var(--text-tertiary);
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    /* ── AI Assistant Setup Cards ─────────────────────────────── */
    .mcp-assistant-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
      gap: 1rem;
    }

    .mcp-assistant-card {
      position: relative;
      overflow: hidden;
    }

    .mcp-assistant-card::before {
      content: '';
      position: absolute;
      inset: 0;
      border-radius: inherit;
      background: linear-gradient(135deg, oklch(65% 0.15 270 / 0.04), oklch(70% 0.15 300 / 0.02));
      pointer-events: none;
    }

    .mcp-assistant__header {
      display: flex;
      align-items: center;
      gap: 0.625rem;
      margin-block-end: 0.75rem;
    }

    .mcp-assistant__logo {
      width: 2.5rem;
      height: 2.5rem;
      border-radius: var(--radius-md, 0.5rem);
      display: grid;
      place-items: center;
      flex-shrink: 0;
      font-size: 1.125rem;
      font-weight: 800;
      color: oklch(95% 0 0);
    }

    .mcp-assistant__logo--claude { background: linear-gradient(135deg, oklch(60% 0.2 30), oklch(65% 0.22 15)); }
    .mcp-assistant__logo--claude-desktop { background: linear-gradient(135deg, oklch(55% 0.18 25), oklch(60% 0.2 40)); }
    .mcp-assistant__logo--cursor { background: linear-gradient(135deg, oklch(45% 0.02 270), oklch(55% 0.03 270)); }
    .mcp-assistant__logo--vscode { background: linear-gradient(135deg, oklch(55% 0.18 250), oklch(60% 0.2 230)); }
    .mcp-assistant__logo--windsurf { background: linear-gradient(135deg, oklch(60% 0.18 170), oklch(65% 0.2 155)); }
    .mcp-assistant__logo--codex { background: linear-gradient(135deg, oklch(50% 0.15 145), oklch(60% 0.17 130)); }

    .mcp-assistant__name {
      font-size: 0.9375rem;
      font-weight: 700;
      color: var(--text-primary);
    }

    .mcp-assistant__steps {
      list-style: none;
      padding: 0;
      margin: 0 0 0.75rem 0;
      display: flex;
      flex-direction: column;
      gap: 0.375rem;
    }

    .mcp-assistant__step {
      display: flex;
      align-items: flex-start;
      gap: 0.5rem;
      font-size: 0.8125rem;
      color: var(--text-secondary);
      line-height: 1.45;
    }

    .mcp-assistant__step-num {
      color: var(--brand, oklch(65% 0.2 270));
      font-weight: 700;
      font-size: 0.6875rem;
      flex-shrink: 0;
      margin-top: 0.1rem;
    }

    /* ── Plugin Skills in Action ─────────────────────────────── */
    .mcp-skills-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 1rem;
    }

    .mcp-skill-card {
      position: relative;
      overflow: hidden;
    }

    .mcp-skill-card::before {
      content: '';
      position: absolute;
      inset: 0;
      border-radius: inherit;
      background: linear-gradient(160deg, oklch(65% 0.12 270 / 0.06), transparent 60%);
      pointer-events: none;
    }

    .mcp-skill__cmd {
      font-family: 'SF Mono', 'Fira Code', monospace;
      font-size: 0.6875rem;
      color: var(--brand, oklch(65% 0.2 270));
      background: var(--brand-subtle, oklch(65% 0.2 270 / 0.08));
      padding: 0.125rem 0.5rem;
      border-radius: var(--radius-xs, 0.25rem);
      display: inline-block;
      margin-block-end: 0.5rem;
    }

    .mcp-skill__title {
      font-size: 0.9375rem;
      font-weight: 700;
      color: var(--text-primary);
      margin-block-end: 0.25rem;
    }

    .mcp-skill__desc {
      font-size: 0.8125rem;
      color: var(--text-secondary);
      margin-block-end: 0.75rem;
      line-height: 1.45;
    }

    .mcp-skill__demo {
      border-radius: var(--radius-md, 0.5rem);
      background: var(--bg-base, oklch(8% 0.02 270));
      border: 1px solid var(--border-subtle);
      padding: 0.75rem;
      font-size: 0.8125rem;
    }

    .mcp-skill__search-results {
      list-style: none;
      padding: 0;
      margin: 0.5rem 0 0;
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }

    .mcp-skill__search-item {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.25rem 0.5rem;
      border-radius: var(--radius-xs, 0.25rem);
      background: var(--bg-surface, oklch(12% 0.015 270));
    }

    .mcp-skill__search-name {
      font-weight: 600;
      color: var(--text-primary);
      font-size: 0.75rem;
    }

    .mcp-skill__search-cat {
      font-size: 0.6875rem;
      color: var(--text-tertiary);
    }

    .mcp-motion-levels {
      display: flex;
      gap: 0.5rem;
      flex-wrap: wrap;
    }

    .mcp-motion-chip {
      display: flex;
      align-items: center;
      gap: 0.375rem;
      padding: 0.375rem 0.625rem;
      border-radius: var(--radius-sm, 0.375rem);
      background: var(--bg-surface, oklch(12% 0.015 270));
      border: 1px solid var(--border-subtle);
      font-size: 0.75rem;
      color: var(--text-primary);
    }

    .mcp-motion-chip--active {
      border-color: var(--brand, oklch(65% 0.2 270));
      background: var(--brand-subtle, oklch(65% 0.2 270 / 0.08));
    }

    .mcp-motion-dot {
      width: 0.5rem;
      height: 0.5rem;
      border-radius: 50%;
      background: var(--brand, oklch(65% 0.2 270));
    }

    .mcp-motion-dot--animate {
      animation: mcp-pulse 1.5s ease-in-out infinite;
    }

    @keyframes mcp-pulse {
      0%, 100% { transform: scale(1); opacity: 0.6; }
      50% { transform: scale(1.5); opacity: 1; }
    }

    .mcp-decision-tree {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .mcp-decision-node {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.375rem 0.625rem;
      border-radius: var(--radius-sm, 0.375rem);
      font-size: 0.75rem;
      color: var(--text-primary);
    }

    .mcp-decision-node--q {
      background: var(--brand-subtle, oklch(65% 0.2 270 / 0.08));
      font-weight: 600;
    }

    .mcp-decision-node--a {
      margin-inline-start: 1.5rem;
      background: var(--bg-surface, oklch(12% 0.015 270));
      border: 1px solid var(--border-subtle);
    }

    .mcp-audit-list {
      list-style: none;
      padding: 0;
      margin: 0;
      display: flex;
      flex-direction: column;
      gap: 0.375rem;
    }

    .mcp-audit-item {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.25rem 0.5rem;
      border-radius: var(--radius-xs, 0.25rem);
      font-size: 0.75rem;
      background: var(--bg-surface, oklch(12% 0.015 270));
    }

    .mcp-audit-dot {
      width: 0.5rem;
      height: 0.5rem;
      border-radius: 50%;
      flex-shrink: 0;
    }

    .mcp-audit-dot--pass { background: oklch(72% 0.19 155); }
    .mcp-audit-dot--warn { background: oklch(75% 0.18 85); }
    .mcp-audit-dot--fail { background: oklch(65% 0.22 25); }

    /* ── Use Case Gallery ─────────────────────────────────────── */
    .mcp-usecase-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(480px, 1fr));
      gap: 1rem;
    }

    .mcp-usecase-card {
      position: relative;
      overflow: hidden;
    }

    .mcp-usecase-card::before {
      content: '';
      position: absolute;
      inset: 0;
      border-radius: inherit;
      background: linear-gradient(145deg, oklch(60% 0.12 270 / 0.05), oklch(70% 0.1 300 / 0.03));
      pointer-events: none;
    }

    .mcp-usecase__label {
      font-size: 0.6875rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: var(--brand, oklch(65% 0.2 270));
      margin-block-end: 0.5rem;
    }

    .mcp-usecase__prompt {
      font-family: 'SF Mono', 'Fira Code', monospace;
      font-size: 0.8125rem;
      color: oklch(85% 0 0);
      background: oklch(0% 0 0 / 0.35);
      border: 1px solid oklch(100% 0 0 / 0.06);
      border-radius: var(--radius-sm, 0.375rem);
      padding: 0.625rem 0.75rem;
      margin-block-end: 0.75rem;
      backdrop-filter: blur(4px);
    }

    .mcp-usecase__result-label {
      font-size: 0.6875rem;
      font-weight: 600;
      color: oklch(72% 0.19 155);
      text-transform: uppercase;
      letter-spacing: 0.05em;
      margin-block-end: 0.375rem;
      display: flex;
      align-items: center;
      gap: 0.375rem;
    }

    .mcp-usecase__result-label::before {
      content: '';
      width: 0.375rem;
      height: 0.375rem;
      border-radius: 50%;
      background: oklch(72% 0.19 155);
    }

    @media (max-width: 640px) {
      .mcp-arch {
        flex-direction: column;
      }
      .mcp-arch__arrow {
        transform: rotate(90deg);
        padding: 0.25rem 0;
      }
      .mcp-assistant-grid {
        grid-template-columns: 1fr;
      }
      .mcp-skills-grid {
        grid-template-columns: 1fr;
      }
      .mcp-usecase-grid {
        grid-template-columns: 1fr;
      }
    }
  }
`

// ─── Tool Definitions ────────────────────────────────────────────────────────

interface ToolDef {
  id: string
  name: string
  icon: string
  description: string
}

const TOOLS: ToolDef[] = [
  {
    id: 'list_components',
    name: 'list_components',
    icon: 'menu',
    description: 'List all UI Kit components, optionally filtered by category or tier. Returns names, categories, descriptions, and import paths.',
  },
  {
    id: 'get_component',
    name: 'get_component',
    icon: 'file',
    description: 'Get full API documentation for a specific component -- every prop, type, default, example, accessibility notes, and related components.',
  },
  {
    id: 'search_components',
    name: 'search_components',
    icon: 'search',
    description: 'Search components by natural language use-case or keyword. Returns ranked results with relevance scores.',
  },
  {
    id: 'generate_snippet',
    name: 'generate_snippet',
    icon: 'code',
    description: 'Generate working TSX code using UI Kit components. Builds correct imports, props, and composition from the actual API.',
  },
  {
    id: 'get_theme',
    name: 'get_theme',
    icon: 'settings',
    description: 'Get theme tokens and ready-to-paste CSS for any of the 15 named themes. Supports dark and light modes.',
  },
  {
    id: 'get_icons',
    name: 'get_icons',
    icon: 'image',
    description: 'Browse all 50+ built-in SVG icons. Search by name or keyword to find the right icon.',
  },
]

// ─── AI Assistant Configs ────────────────────────────────────────────────────

interface AssistantConfig {
  id: string
  name: string
  logoChar: string
  connectionType: string
  badgeVariant: string
  steps: string[]
  config: string
  configLang: string
}

const ASSISTANT_CONFIGS: AssistantConfig[] = [
  {
    id: 'claude',
    name: 'Claude Code',
    logoChar: 'C',
    connectionType: 'Full Plugin',
    badgeVariant: 'success',
    steps: [
      'Install: npm i -g @anthropic-ai/claude-code',
      'Run: npx @annondeveloper/ui-kit mcp',
      'Plugin auto-detected -- 5 skills + 2 agents available',
    ],
    config: `// ~/.claude/plugins/ui-kit/plugin.json
{
  "name": "ui-kit",
  "mcpServers": {
    "ui-kit": {
      "command": "node",
      "args": ["./dist/mcp/index.js"]
    }
  },
  "skills": [
    "component-finder",
    "generate-component",
    "design-system",
    "tier-guide",
    "audit-accessibility"
  ]
}`,
    configLang: 'json',
  },
  {
    id: 'claude-desktop',
    name: 'Claude Desktop',
    logoChar: 'D',
    connectionType: 'MCP Config',
    badgeVariant: 'info',
    steps: [
      'Open Claude Desktop settings',
      'Add MCP server config below',
      'Restart Claude Desktop',
    ],
    config: `// ~/Library/Application Support/Claude/claude_desktop_config.json
{
  "mcpServers": {
    "ui-kit": {
      "command": "npx",
      "args": ["-y", "@annondeveloper/ui-kit", "mcp", "--stdio"]
    }
  }
}`,
    configLang: 'json',
  },
  {
    id: 'cursor',
    name: 'Cursor',
    logoChar: '{',
    connectionType: '.cursor/mcp.json',
    badgeVariant: 'info',
    steps: [
      'Create .cursor/mcp.json in your project root',
      'Paste the config below',
      'Restart Cursor -- tools appear in Composer',
    ],
    config: `// .cursor/mcp.json
{
  "mcpServers": {
    "ui-kit": {
      "command": "npx",
      "args": ["-y", "@annondeveloper/ui-kit", "mcp", "--stdio"]
    }
  }
}`,
    configLang: 'json',
  },
  {
    id: 'vscode',
    name: 'VS Code / Copilot',
    logoChar: 'V',
    connectionType: '.vscode/mcp.json',
    badgeVariant: 'info',
    steps: [
      'Create .vscode/mcp.json in your project',
      'Paste the config below',
      'Open Copilot Chat -- MCP tools auto-discovered',
    ],
    config: `// .vscode/mcp.json
{
  "servers": {
    "ui-kit": {
      "type": "stdio",
      "command": "npx",
      "args": ["-y", "@annondeveloper/ui-kit", "mcp", "--stdio"]
    }
  }
}`,
    configLang: 'json',
  },
  {
    id: 'windsurf',
    name: 'Windsurf',
    logoChar: 'W',
    connectionType: 'MCP Settings',
    badgeVariant: 'info',
    steps: [
      'Open Windsurf > Settings > MCP',
      'Add a new server with the config below',
      'Cascade will discover all 6 tools',
    ],
    config: `// Windsurf MCP Settings
{
  "mcpServers": {
    "ui-kit": {
      "command": "npx",
      "args": ["-y", "@annondeveloper/ui-kit", "mcp", "--stdio"]
    }
  }
}`,
    configLang: 'json',
  },
  {
    id: 'codex',
    name: 'Codex CLI',
    logoChar: 'X',
    connectionType: '~/.codex/config.json',
    badgeVariant: 'info',
    steps: [
      'Create or edit ~/.codex/config.json',
      'Add the MCP server entry below',
      'Run codex -- it picks up the server automatically',
    ],
    config: `// ~/.codex/config.json
{
  "mcpServers": {
    "ui-kit": {
      "command": "npx",
      "args": ["-y", "@annondeveloper/ui-kit", "mcp", "--stdio"]
    }
  }
}`,
    configLang: 'json',
  },
]

// ─── Generated Code Samples ─────────────────────────────────────────────────

const GENERATED_LOGIN_CODE = `import { Card } from '@annondeveloper/ui-kit'
import { FormInput } from '@annondeveloper/ui-kit'
import { Button } from '@annondeveloper/ui-kit'
import { PasswordInput } from '@annondeveloper/ui-kit'

export function LoginForm() {
  return (
    <Card padding="lg" style={{ maxWidth: 400 }}>
      <h2>Sign In</h2>
      <FormInput name="email" label="Email" type="email"
        placeholder="you@company.com" />
      <PasswordInput name="password" label="Password" />
      <Button variant="primary" fullWidth>
        Sign In
      </Button>
    </Card>
  )
}`

// ─── Use Cases ──────────────────────────────────────────────────────────────

const USE_CASES = [
  {
    prompt: '"Build me a dashboard with key metrics"',
    lang: 'typescript',
    result: `import { MetricCard } from '@annondeveloper/ui-kit'
import { TimeSeriesChart } from '@annondeveloper/ui-kit'

export function Dashboard() {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
      <MetricCard label="Revenue" value="$48.2K" trend={12.5} icon="bar-chart" />
      <MetricCard label="Users" value="2,847" trend={-3.1} icon="users" />
      <MetricCard label="Uptime" value="99.97%" trend={0.02} icon="activity" />
      <div style={{ gridColumn: 'span 3' }}>
        <TimeSeriesChart data={revenueData} height={280} />
      </div>
    </div>
  )
}`,
  },
  {
    prompt: '"Find a date picker component"',
    lang: 'json',
    result: `[
  { "name": "DatePicker", "tier": "premium", "score": 0.98,
    "description": "Full-featured date picker with calendar dropdown, range selection, presets" },
  { "name": "DateRangePicker", "tier": "premium", "score": 0.91,
    "description": "Select date ranges with start/end, presets, comparison mode" },
  { "name": "Calendar", "tier": "premium", "score": 0.85,
    "description": "Inline calendar with single/range/multi selection, events" },
  { "name": "TimePicker", "tier": "standard", "score": 0.62,
    "description": "Time selection with hour/minute/AM-PM, 12 and 24h modes" }
]`,
  },
  {
    prompt: '"Audit my form for accessibility"',
    lang: 'text',
    result: `Accessibility Audit -- LoginForm
================================
PASS  [contrast]    Text contrast 7.2:1 exceeds AA (4.5:1)
PASS  [keyboard]    Tab order: email -> password -> submit (correct)
PASS  [labels]      All inputs have associated <label> elements
WARN  [target]      Submit button 38px tall -- recommend 44px minimum
FAIL  [live-region] No aria-live for form validation errors
PASS  [focus]       Focus ring visible on all interactive elements
PASS  [semantics]   Using <form> with role="form"

Score: 5/7 passing | 1 warning | 1 failure
Fix: Add aria-live="polite" to validation message container`,
  },
  {
    prompt: '"Which tier for a mobile-first app?"',
    lang: 'text',
    result: `Tier Recommendation: Lite
=========================
Rationale:
- Mobile-first = bundle size critical (< 2KB per component)
- Lite tier: ~20 lines each, zero motion overhead
- No spring physics or aurora glow needed on mobile
- CSS-only animations via @starting-style fallback
- Tree-shakes to ~0.5KB per component gzipped

If you later need animations on tablet/desktop:
  -> Import Standard tier for those breakpoints
  -> Use <ContainerQuery> to swap tiers dynamically

Example:
  import { Button } from '@annondeveloper/ui-kit/lite'  // 0.4KB
  vs
  import { Button } from '@annondeveloper/ui-kit'        // 1.8KB`,
  },
]

// ─── Simulated Tool Responses ────────────────────────────────────────────────

function simulateListComponents(category: string, tier: string): ComponentInfo[] {
  let db = getComponentDatabase()
  if (category) db = db.filter(c => c.category === category)
  // Tier filter - since the demo database doesn't have tier info, show all for any tier
  return db
}

function simulateGetComponent(name: string): string {
  const db = getComponentDatabase()
  const comp = db.find(c => c.name.toLowerCase() === name.toLowerCase())
  if (!comp) return `Component "${name}" not found. Try: ${db.slice(0, 5).map(c => c.name).join(', ')}...`

  return `# ${comp.name}

${comp.description}

## Import
\`\`\`tsx
import { ${comp.name} } from '${comp.importPath}'
\`\`\`

## Props
${comp.props.map(p => `- \`${p}\``).join('\n')}

## Example
\`\`\`tsx
${comp.example}
\`\`\`

**Category:** ${comp.category}`
}

function simulateSearchComponents(query: string): ComponentInfo[] {
  return searchComponents(query)
}

function simulateGenerateSnippet(compName: string, scenario: string): string {
  const db = getComponentDatabase()
  const comp = db.find(c => c.name.toLowerCase() === compName.toLowerCase())
  if (!comp) return '// Component not found'

  const wrapperName = scenario === 'form' ? 'FormExample' :
    scenario === 'dashboard' ? 'DashboardCard' :
    scenario === 'settings' ? 'SettingsPanel' : 'Example'

  return `import { ${comp.name} } from '${comp.importPath}'

export function ${wrapperName}() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      ${comp.example}
    </div>
  )
}`
}

function simulateGetTheme(name: ThemeName): Record<string, string> {
  const t = themes[name]
  return t as unknown as Record<string, string>
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function McpPage() {
  useStyles('mcp-page', styles)

  // Tool 1: list_components state
  const [listCategory, setListCategory] = useState('')
  const [listTier, setListTier] = useState('')
  const [listResult, setListResult] = useState<ComponentInfo[] | null>(null)

  // Tool 2: get_component state
  const [getCompName, setGetCompName] = useState('')
  const [getCompResult, setGetCompResult] = useState('')

  // Tool 3: search_components state
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResult, setSearchResult] = useState<ComponentInfo[] | null>(null)

  // Tool 4: generate_snippet state
  const [snippetComp, setSnippetComp] = useState('')
  const [snippetScenario, setSnippetScenario] = useState('basic')
  const [snippetResult, setSnippetResult] = useState('')

  // Tool 5: get_theme state
  const [themeName, setThemeName] = useState<ThemeName>('aurora')
  const [themeResult, setThemeResult] = useState<Record<string, string> | null>(null)

  // Tool 6: get_icons state
  const [iconSearch, setIconSearch] = useState('')
  const filteredIcons = useMemo(() => {
    if (!iconSearch.trim()) return ALL_ICONS
    const q = iconSearch.toLowerCase()
    return ALL_ICONS.filter(name => name.includes(q))
  }, [iconSearch])

  // Skill demos state
  const [skillSearch, setSkillSearch] = useState('')
  const skillSearchResults = useMemo(() => {
    if (!skillSearch.trim() || skillSearch.trim().length < 2) return []
    return searchComponents(skillSearch).slice(0, 6)
  }, [skillSearch])

  const [skillGenPrompt, setSkillGenPrompt] = useState('')

  // Setup tabs
  const [setupTab, setSetupTab] = useState('claude')

  const setupTabs = [
    { id: 'claude', label: 'Claude Code' },
    { id: 'cursor', label: 'Cursor' },
    { id: 'vscode', label: 'VS Code' },
    { id: 'npx', label: 'npx' },
  ]

  const claudeConfig = `{
  "mcpServers": {
    "ui-kit": {
      "command": "node",
      "args": ["/path/to/ui-kit/dist/mcp/index.js"]
    }
  }
}`

  const cursorConfig = `// .cursor/mcp.json
{
  "mcpServers": {
    "ui-kit": {
      "command": "node",
      "args": ["/path/to/ui-kit/dist/mcp/index.js"]
    }
  }
}`

  const vscodeConfig = `// .vscode/settings.json
{
  "mcp.servers": {
    "ui-kit": {
      "command": "node",
      "args": ["/path/to/ui-kit/dist/mcp/index.js"]
    }
  }
}`

  const npxConfig = `# After npm publish, use npx:
npx @annondeveloper/ui-kit-mcp

# Or for SSE (team-shared) mode:
npx @annondeveloper/ui-kit-mcp --sse --port 3100`

  return (
    <div className="mcp-page">
      {/* ── Hero ──────────────────────────────────────────────── */}
      <section className="mcp-hero">
        <div className="mcp-hero__badge">
          <Badge variant="info" color="blue">MCP Server</Badge>
        </div>
        <h1 className="mcp-hero__title">AI Integrations</h1>
        <p className="mcp-hero__desc">
          The first React component library your AI can use natively. Connect Claude, Cursor, Copilot,
          Windsurf, or Codex to 178 components via MCP — the AI reads ground truth (every prop, type,
          default, example, theme token) and generates correct, working code.
        </p>

        {/* Hosted MCP quick connect */}
        <div style={{
          background: 'oklch(0% 0 0 / 0.3)',
          border: '1px solid oklch(100% 0 0 / 0.08)',
          borderRadius: '0.75rem',
          padding: '1rem 1.25rem',
          maxWidth: '560px',
          margin: '1.5rem auto 0',
          backdropFilter: 'blur(8px)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <span style={{ color: 'oklch(72% 0.19 155)', fontSize: '0.75rem' }}>{'●'}</span>
            <span style={{ fontSize: '0.75rem', color: 'oklch(70% 0 0)', fontWeight: 600, textTransform: 'uppercase' as const, letterSpacing: '0.05em' }}>Hosted MCP — connect in 10 seconds</span>
          </div>
          <code style={{
            display: 'block',
            fontFamily: "'SF Mono', 'Fira Code', monospace",
            fontSize: '0.8125rem',
            color: 'oklch(85% 0 0)',
            lineHeight: 1.5,
            wordBreak: 'break-all' as const,
          }}>https://ui-kit-mcp.annondeveloper.workers.dev/sse</code>
          <p style={{ margin: '0.5rem 0 0', fontSize: '0.75rem', color: 'oklch(55% 0 0)' }}>
            Add this URL to any MCP client config. No npm install needed. Works with Claude Code, Cursor, VS Code, Windsurf, Codex.
          </p>
        </div>

        {/* Plugin badges */}
        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center', marginTop: '1rem', flexWrap: 'wrap' as const }}>
          <Badge variant="primary" size="sm">Claude Code Plugin</Badge>
          <Badge variant="info" size="sm">Cursor</Badge>
          <Badge variant="info" size="sm">VS Code</Badge>
          <Badge variant="info" size="sm">Windsurf</Badge>
          <Badge variant="info" size="sm">Codex CLI</Badge>
        </div>
      </section>

      {/* ── Claude Code Plugin Features ──────────────────────────── */}
      <section className="mcp-section">
        <div className="mcp-section__header">
          <Icon name="zap" size="sm" />
          <h2 className="mcp-section__title">Claude Code Plugin</h2>
          <Badge variant="success" size="sm">5 Skills + 2 Agents</Badge>
        </div>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '1rem' }}>
          The Claude Code plugin goes beyond MCP with skills Claude can invoke automatically, specialized agents, and session hooks.
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.75rem' }}>
          {[
            { cmd: '/ui-kit:component-finder', desc: 'Search 178 components by name or use case' },
            { cmd: '/ui-kit:generate-component', desc: 'Produce working TSX with correct imports' },
            { cmd: '/ui-kit:design-system', desc: 'Learn OKLCH, motion levels, Aurora Fluid' },
            { cmd: '/ui-kit:tier-guide', desc: 'Choose Lite / Standard / Premium' },
            { cmd: '/ui-kit:audit-accessibility', desc: 'Check WCAG AA compliance' },
            { cmd: 'component-architect', desc: 'Agent: designs multi-component layouts' },
            { cmd: 'accessibility-reviewer', desc: 'Agent: deep a11y review' },
          ].map(s => (
            <Card key={s.cmd} padding="sm" style={{ background: 'var(--bg-surface)' }}>
              <code style={{ fontSize: '0.75rem', color: 'var(--brand)', display: 'block', marginBottom: '0.25rem' }}>{s.cmd}</code>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{s.desc}</span>
            </Card>
          ))}
        </div>
      </section>

      {/* ── AI Assistant Setup ──────────────────────────────────── */}
      <section className="mcp-section">
        <div className="mcp-section__header">
          <Icon name="settings" size="sm" />
          <h2 className="mcp-section__title">AI Assistant Setup</h2>
          <Badge variant="info" size="sm">6 assistants</Badge>
        </div>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '1rem', lineHeight: 1.6 }}>
          One-click configuration for every major AI coding assistant. Each card shows the exact config
          you need -- copy it and you are connected to 178 components in seconds.
        </p>
        <div className="mcp-assistant-grid">
          {ASSISTANT_CONFIGS.map(a => (
            <Card key={a.id} className="mcp-assistant-card" padding="md" style={{ background: 'var(--bg-surface)' }}>
              <div className="mcp-assistant__header">
                <div className={`mcp-assistant__logo mcp-assistant__logo--${a.id}`}>
                  {a.logoChar}
                </div>
                <div>
                  <div className="mcp-assistant__name">{a.name}</div>
                  <Badge variant={a.badgeVariant as any} size="sm" style={{ marginTop: '0.125rem' }}>{a.connectionType}</Badge>
                </div>
              </div>
              <ol className="mcp-assistant__steps">
                {a.steps.map((step, i) => (
                  <li key={i} className="mcp-assistant__step">
                    <span className="mcp-assistant__step-num">{i + 1}.</span>
                    <span>{step}</span>
                  </li>
                ))}
              </ol>
              <CopyBlock code={a.config} language={a.configLang as any} />
            </Card>
          ))}
        </div>
      </section>

      {/* ── Plugin Skills in Action ──────────────────────────────── */}
      <section className="mcp-section">
        <div className="mcp-section__header">
          <Icon name="zap" size="sm" />
          <h2 className="mcp-section__title">Plugin Skills in Action</h2>
          <Badge variant="success" size="sm">5 skills</Badge>
        </div>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '1rem', lineHeight: 1.6 }}>
          Each skill is a specialized capability your AI can invoke. Try the interactive demos below.
        </p>
        <div className="mcp-skills-grid">
          {/* Skill 1: Component Finder */}
          <Card className="mcp-skill-card" padding="md" style={{ background: 'var(--bg-surface)' }}>
            <div className="mcp-skill__cmd">/ui-kit:component-finder</div>
            <div className="mcp-skill__title">Component Finder</div>
            <div className="mcp-skill__desc">
              Search 178 components by name or natural language use case. Try typing a query.
            </div>
            <div className="mcp-skill__demo">
              <FormInput
                name="skill-search"
                label="Search"
                placeholder='Type "date picker" or "loading"...'
                value={skillSearch}
                onChange={(e) => setSkillSearch((e.target as HTMLInputElement).value)}
              />
              {skillSearchResults.length > 0 && (
                <ul className="mcp-skill__search-results">
                  {skillSearchResults.slice(0, 4).map(c => (
                    <li key={c.name} className="mcp-skill__search-item">
                      <span className="mcp-skill__search-name">{c.name}</span>
                      <Badge variant="info" size="sm">{c.category}</Badge>
                      <span className="mcp-skill__search-cat">{c.description.slice(0, 40)}...</span>
                    </li>
                  ))}
                </ul>
              )}
              {skillSearch.trim() && skillSearchResults.length === 0 && (
                <p style={{ margin: '0.5rem 0 0', fontSize: '0.75rem', color: 'var(--text-tertiary)', fontStyle: 'italic' }}>No results -- try a different query.</p>
              )}
            </div>
          </Card>

          {/* Skill 2: Code Generator */}
          <Card className="mcp-skill-card" padding="md" style={{ background: 'var(--bg-surface)' }}>
            <div className="mcp-skill__cmd">/ui-kit:generate-component</div>
            <div className="mcp-skill__title">Code Generator</div>
            <div className="mcp-skill__desc">
              Describe what you need and get working TSX with correct imports and props.
            </div>
            <div className="mcp-skill__demo">
              <FormInput
                name="skill-gen-prompt"
                label="Prompt"
                placeholder='"Build a login form"'
                value={skillGenPrompt}
                onChange={(e) => setSkillGenPrompt((e.target as HTMLInputElement).value)}
              />
              {skillGenPrompt.trim().length > 3 && (
                <div style={{ marginTop: '0.5rem' }}>
                  <CopyBlock code={GENERATED_LOGIN_CODE} language="typescript" />
                </div>
              )}
            </div>
          </Card>

          {/* Skill 3: Design System */}
          <Card className="mcp-skill-card" padding="md" style={{ background: 'var(--bg-surface)' }}>
            <div className="mcp-skill__cmd">/ui-kit:design-system</div>
            <div className="mcp-skill__title">Design System</div>
            <div className="mcp-skill__desc">
              OKLCH color system, Aurora Fluid identity, and motion levels 0-3 with live previews.
            </div>
            <div className="mcp-skill__demo">
              <div style={{ display: 'flex', gap: '0.375rem', flexWrap: 'wrap' as const, marginBottom: '0.75rem' }}>
                {['oklch(65% 0.2 270)', 'oklch(72% 0.19 155)', 'oklch(75% 0.18 85)', 'oklch(65% 0.22 25)', 'oklch(70% 0.17 200)'].map(c => (
                  <div key={c} style={{ display: 'flex', flexDirection: 'column' as const, alignItems: 'center', gap: '0.125rem' }}>
                    <div style={{ width: '2rem', height: '2rem', borderRadius: '0.375rem', background: c, border: '1px solid var(--border-subtle)' }} />
                    <span style={{ fontSize: '0.5625rem', color: 'var(--text-tertiary)', fontFamily: "'SF Mono', monospace" }}>{c.slice(5, -1)}</span>
                  </div>
                ))}
              </div>
              <div className="mcp-motion-levels">
                {[
                  { level: 0, label: 'None', active: false },
                  { level: 1, label: 'Subtle', active: false },
                  { level: 2, label: 'Expressive', active: true },
                  { level: 3, label: 'Cinematic', active: false },
                ].map(m => (
                  <div key={m.level} className={`mcp-motion-chip${m.active ? ' mcp-motion-chip--active' : ''}`}>
                    <div className={`mcp-motion-dot${m.level > 0 ? ' mcp-motion-dot--animate' : ''}`} style={{ animationDuration: `${2 - m.level * 0.4}s` }} />
                    <span>{m.level}: {m.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </Card>

          {/* Skill 4: Tier Guide */}
          <Card className="mcp-skill-card" padding="md" style={{ background: 'var(--bg-surface)' }}>
            <div className="mcp-skill__cmd">/ui-kit:tier-guide</div>
            <div className="mcp-skill__title">Tier Guide</div>
            <div className="mcp-skill__desc">
              Decision tree to pick the right weight tier for your use case.
            </div>
            <div className="mcp-skill__demo">
              <div className="mcp-decision-tree">
                <div className="mcp-decision-node mcp-decision-node--q">Need animations?</div>
                <div className="mcp-decision-node mcp-decision-node--a">Yes &rarr; <Badge variant="primary" size="sm">Standard</Badge> or <Badge variant="info" size="sm">Premium</Badge></div>
                <div className="mcp-decision-node mcp-decision-node--a">No &rarr; <Badge variant="info" size="sm">Lite</Badge> (minimal, ~20 lines each)</div>
                <div className="mcp-decision-node mcp-decision-node--q">Need aurora glow / spring physics?</div>
                <div className="mcp-decision-node mcp-decision-node--a">Yes &rarr; <Badge variant="info" size="sm">Premium</Badge></div>
                <div className="mcp-decision-node mcp-decision-node--a">No &rarr; <Badge variant="primary" size="sm">Standard</Badge></div>
                <div className="mcp-decision-node mcp-decision-node--q">Bundle critical (&lt; 2KB)?</div>
                <div className="mcp-decision-node mcp-decision-node--a">Yes &rarr; <Badge variant="info" size="sm">Lite</Badge> (zero motion overhead)</div>
              </div>
            </div>
          </Card>

          {/* Skill 5: Accessibility Audit */}
          <Card className="mcp-skill-card" padding="md" style={{ background: 'var(--bg-surface)' }}>
            <div className="mcp-skill__cmd">/ui-kit:audit-accessibility</div>
            <div className="mcp-skill__title">Accessibility Audit</div>
            <div className="mcp-skill__desc">
              WCAG AA compliance check with color-coded findings on any component.
            </div>
            <div className="mcp-skill__demo">
              <ul className="mcp-audit-list">
                {[
                  { status: 'pass', label: 'Contrast ratio 7.2:1 (AAA)', detail: 'Text on bg-surface' },
                  { status: 'pass', label: 'Keyboard navigation', detail: 'Tab, Enter, Escape handled' },
                  { status: 'warn', label: 'Touch target 40px', detail: 'Recommend 44px minimum' },
                  { status: 'pass', label: 'ARIA labels present', detail: 'role="dialog" + aria-labelledby' },
                  { status: 'fail', label: 'Missing aria-live region', detail: 'Toast notifications need assertive' },
                  { status: 'pass', label: 'Focus trap active', detail: 'Modal traps focus correctly' },
                ].map((item, i) => (
                  <li key={i} className="mcp-audit-item">
                    <span className={`mcp-audit-dot mcp-audit-dot--${item.status}`} />
                    <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{item.label}</span>
                    <span style={{ color: 'var(--text-tertiary)', marginInlineStart: 'auto' }}>{item.detail}</span>
                  </li>
                ))}
              </ul>
            </div>
          </Card>
        </div>
      </section>

      {/* ── Use Case Gallery ──────────────────────────────────── */}
      <section className="mcp-section">
        <div className="mcp-section__header">
          <Icon name="code" size="sm" />
          <h2 className="mcp-section__title">Use Case Gallery</h2>
          <Badge variant="info" size="sm">Real prompts</Badge>
        </div>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '1rem', lineHeight: 1.6 }}>
          Real prompts, real results. See what the AI plugin produces when you ask it naturally.
        </p>
        <div className="mcp-usecase-grid">
          {USE_CASES.map((uc, i) => (
            <Card key={i} className="mcp-usecase-card" padding="md" style={{ background: 'var(--bg-surface)' }}>
              <div className="mcp-usecase__label">Use Case {i + 1}</div>
              <div className="mcp-usecase__prompt">{uc.prompt}</div>
              <div className="mcp-usecase__result-label">AI Response</div>
              <CopyBlock code={uc.result} language={uc.lang as any} />
            </Card>
          ))}
        </div>
      </section>

      {/* ── Architecture Diagram ──────────────────────────────── */}
      <section className="mcp-section">
        <div className="mcp-section__header">
          <Icon name="activity" size="sm" />
          <h2 className="mcp-section__title">Architecture</h2>
        </div>
        <Card padding="md">
          <div className="mcp-arch">
            <div className="mcp-arch__node">
              <Icon name="terminal" size="md" />
              <span className="mcp-arch__node-label">AI Assistant</span>
              <span className="mcp-arch__node-desc">Claude, Cursor, Copilot</span>
            </div>
            <span className="mcp-arch__arrow">&rarr;</span>
            <div className="mcp-arch__node mcp-arch__node--active">
              <Icon name="zap" size="md" />
              <span className="mcp-arch__node-label">MCP Protocol</span>
              <span className="mcp-arch__node-desc">JSON-RPC over stdio/SSE</span>
            </div>
            <span className="mcp-arch__arrow">&rarr;</span>
            <div className="mcp-arch__node mcp-arch__node--active">
              <Icon name="code" size="md" />
              <span className="mcp-arch__node-label">UI Kit Server</span>
              <span className="mcp-arch__node-desc">6 tools + resources</span>
            </div>
            <span className="mcp-arch__arrow">&rarr;</span>
            <div className="mcp-arch__node">
              <Icon name="bar-chart" size="md" />
              <span className="mcp-arch__node-label">Component Registry</span>
              <span className="mcp-arch__node-desc">178 components, 15 themes</span>
            </div>
          </div>
        </Card>
      </section>

      {/* ── Tool Explorer ──────────────────────────────────────── */}
      <section className="mcp-section">
        <div className="mcp-section__header">
          <Icon name="search" size="sm" />
          <h2 className="mcp-section__title">Tool Explorer</h2>
          <Badge variant="info" size="sm">6 tools</Badge>
        </div>

        <div className="mcp-tools">
          {/* ─ Tool 1: list_components ─ */}
          <Card className="mcp-tool" padding="none">
            <div style={{ padding: '1.25rem' }}>
              <div className="mcp-tool__header">
                <div className="mcp-tool__icon"><Icon name="menu" size="sm" /></div>
                <span className="mcp-tool__name">list_components</span>
              </div>
              <p className="mcp-tool__desc">{TOOLS[0].description}</p>
              <div className="mcp-tool__panel">
                <div className="mcp-tool__controls">
                  <Select
                    name="mcp-category"
                    label="Category"
                    options={CATEGORIES}
                    value={listCategory}
                    onChange={(v) => setListCategory(v as string)}
                    placeholder="All Categories"
                  />
                  <Select
                    name="mcp-tier"
                    label="Tier"
                    options={TIERS}
                    value={listTier}
                    onChange={(v) => setListTier(v as string)}
                    placeholder="All Tiers"
                  />
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => setListResult(simulateListComponents(listCategory, listTier))}
                    style={{ alignSelf: 'flex-end' }}
                  >
                    Try it
                  </Button>
                </div>
                {listResult && (
                  <div className="mcp-tool__result">
                    <ul className="mcp-comp-list">
                      {listResult.map(c => (
                        <li key={c.name} className="mcp-comp-list__item">
                          <span className="mcp-comp-list__name">{c.name}</span>
                          <Badge variant="info" size="sm">{c.category}</Badge>
                          <span className="mcp-comp-list__cat">-- {c.description.slice(0, 60)}...</span>
                        </li>
                      ))}
                    </ul>
                    <div style={{ marginTop: '0.5rem', color: 'var(--text-tertiary)', fontSize: '0.75rem' }}>
                      {listResult.length} component{listResult.length !== 1 ? 's' : ''} found
                    </div>
                  </div>
                )}
                {!listResult && (
                  <div className="mcp-tool__result mcp-tool__result-empty">
                    Select filters and click "Try it" to see the response.
                  </div>
                )}
              </div>
            </div>
          </Card>

          {/* ─ Tool 2: get_component ─ */}
          <Card className="mcp-tool" padding="none">
            <div style={{ padding: '1.25rem' }}>
              <div className="mcp-tool__header">
                <div className="mcp-tool__icon"><Icon name="file" size="sm" /></div>
                <span className="mcp-tool__name">get_component</span>
              </div>
              <p className="mcp-tool__desc">{TOOLS[1].description}</p>
              <div className="mcp-tool__panel">
                <div className="mcp-tool__controls">
                  <FormInput
                    name="mcp-comp-name"
                    label="Component Name"
                    placeholder="e.g. Button, Card, DataTable"
                    value={getCompName}
                    onChange={(e) => setGetCompName((e.target as HTMLInputElement).value)}
                  />
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => setGetCompResult(simulateGetComponent(getCompName))}
                    style={{ alignSelf: 'flex-end' }}
                  >
                    Try it
                  </Button>
                </div>
                {getCompResult ? (
                  <div className="mcp-tool__result">{getCompResult}</div>
                ) : (
                  <div className="mcp-tool__result mcp-tool__result-empty">
                    Enter a component name and click "Try it" to see the full API docs.
                  </div>
                )}
              </div>
            </div>
          </Card>

          {/* ─ Tool 3: search_components ─ */}
          <Card className="mcp-tool" padding="none">
            <div style={{ padding: '1.25rem' }}>
              <div className="mcp-tool__header">
                <div className="mcp-tool__icon"><Icon name="search" size="sm" /></div>
                <span className="mcp-tool__name">search_components</span>
              </div>
              <p className="mcp-tool__desc">{TOOLS[2].description}</p>
              <div className="mcp-tool__panel">
                <div className="mcp-tool__controls">
                  <FormInput
                    name="mcp-search"
                    label="Search Query"
                    placeholder='e.g. "date selection", "loading state", "chart data"'
                    value={searchQuery}
                    onChange={(e) => setSearchQuery((e.target as HTMLInputElement).value)}
                  />
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => setSearchResult(simulateSearchComponents(searchQuery))}
                    style={{ alignSelf: 'flex-end' }}
                  >
                    Try it
                  </Button>
                </div>
                {searchResult ? (
                  <div className="mcp-tool__result">
                    {searchResult.length === 0 ? (
                      <span>No results found for "{searchQuery}"</span>
                    ) : (
                      <ul className="mcp-comp-list">
                        {searchResult.map((c, i) => (
                          <li key={c.name} className="mcp-comp-list__item">
                            <Badge variant="info" size="sm">{i + 1}</Badge>
                            <span className="mcp-comp-list__name">{c.name}</span>
                            <span className="mcp-comp-list__cat">-- {c.description.slice(0, 80)}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                ) : (
                  <div className="mcp-tool__result mcp-tool__result-empty">
                    Enter a natural language search and click "Try it".
                  </div>
                )}
              </div>
            </div>
          </Card>

          {/* ─ Tool 4: generate_snippet ─ */}
          <Card className="mcp-tool" padding="none">
            <div style={{ padding: '1.25rem' }}>
              <div className="mcp-tool__header">
                <div className="mcp-tool__icon"><Icon name="code" size="sm" /></div>
                <span className="mcp-tool__name">generate_snippet</span>
              </div>
              <p className="mcp-tool__desc">{TOOLS[3].description}</p>
              <div className="mcp-tool__panel">
                <div className="mcp-tool__controls">
                  <FormInput
                    name="mcp-snippet-comp"
                    label="Component"
                    placeholder="e.g. Button, Card, MetricCard"
                    value={snippetComp}
                    onChange={(e) => setSnippetComp((e.target as HTMLInputElement).value)}
                  />
                  <Select
                    name="mcp-scenario"
                    label="Scenario"
                    options={SCENARIOS}
                    value={snippetScenario}
                    onChange={(v) => setSnippetScenario(v as string)}
                  />
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => setSnippetResult(simulateGenerateSnippet(snippetComp, snippetScenario))}
                    style={{ alignSelf: 'flex-end' }}
                  >
                    Try it
                  </Button>
                </div>
                {snippetResult ? (
                  <CopyBlock code={snippetResult} language="typescript" />
                ) : (
                  <div className="mcp-tool__result mcp-tool__result-empty">
                    Enter a component name, choose a scenario, and click "Try it".
                  </div>
                )}
              </div>
            </div>
          </Card>

          {/* ─ Tool 5: get_theme ─ */}
          <Card className="mcp-tool" padding="none">
            <div style={{ padding: '1.25rem' }}>
              <div className="mcp-tool__header">
                <div className="mcp-tool__icon"><Icon name="settings" size="sm" /></div>
                <span className="mcp-tool__name">get_theme</span>
              </div>
              <p className="mcp-tool__desc">{TOOLS[4].description}</p>
              <div className="mcp-tool__panel">
                <div className="mcp-tool__controls">
                  <Select
                    name="mcp-theme"
                    label="Theme"
                    options={THEME_NAMES.map(n => ({ value: n, label: n.charAt(0).toUpperCase() + n.slice(1) }))}
                    value={themeName}
                    onChange={(v) => setThemeName(v as ThemeName)}
                  />
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => setThemeResult(simulateGetTheme(themeName))}
                    style={{ alignSelf: 'flex-end' }}
                  >
                    Try it
                  </Button>
                </div>
                {themeResult ? (
                  <div>
                    <div style={{ marginBlockEnd: '0.5rem', fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
                      Theme: {themeName} | Hex: {THEME_HEX[themeName]}
                    </div>
                    <div className="mcp-token-grid">
                      {Object.entries(themeResult).map(([key, value]) => (
                        <div key={key} className="mcp-token-item">
                          <div
                            className="mcp-token-swatch"
                            style={{ background: value }}
                          />
                          <div className="mcp-token-info">
                            <div className="mcp-token-name">{key.replace(/([A-Z])/g, '-$1').toLowerCase()}</div>
                            <div className="mcp-token-value">{value}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="mcp-tool__result mcp-tool__result-empty">
                    Select a theme and click "Try it" to see its tokens.
                  </div>
                )}
              </div>
            </div>
          </Card>

          {/* ─ Tool 6: get_icons ─ */}
          <Card className="mcp-tool" padding="none">
            <div style={{ padding: '1.25rem' }}>
              <div className="mcp-tool__header">
                <div className="mcp-tool__icon"><Icon name="image" size="sm" /></div>
                <span className="mcp-tool__name">get_icons</span>
              </div>
              <p className="mcp-tool__desc">{TOOLS[5].description}</p>
              <div className="mcp-tool__panel">
                <div className="mcp-tool__controls">
                  <FormInput
                    name="mcp-icon-search"
                    label="Search Icons"
                    placeholder="e.g. arrow, check, alert"
                    value={iconSearch}
                    onChange={(e) => setIconSearch((e.target as HTMLInputElement).value)}
                  />
                </div>
                <div className="mcp-icon-grid">
                  {filteredIcons.slice(0, 48).map(name => (
                    <div key={name} className="mcp-icon-item">
                      <Icon name={name as any} size="md" />
                      <span className="mcp-icon-item__label">{name}</span>
                    </div>
                  ))}
                </div>
                {filteredIcons.length > 48 && (
                  <div style={{ marginTop: '0.5rem', fontSize: '0.75rem', color: 'var(--text-tertiary)', textAlign: 'center' }}>
                    ...and {filteredIcons.length - 48} more
                  </div>
                )}
                {filteredIcons.length === 0 && (
                  <div className="mcp-tool__result mcp-tool__result-empty">
                    No icons match "{iconSearch}".
                  </div>
                )}
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* ── Setup Guide ────────────────────────────────────────── */}
      <section className="mcp-section">
        <div className="mcp-section__header">
          <Icon name="settings" size="sm" />
          <h2 className="mcp-section__title">Setup Guide</h2>
        </div>

        <Card padding="lg">
          <div className="mcp-setup">
            <div className="mcp-setup__step">
              <div className="mcp-setup__num">1</div>
              <div className="mcp-setup__content">
                <div className="mcp-setup__label">Install the MCP Server</div>
                <div className="mcp-setup__detail">
                  The MCP server ships with the ui-kit package. Run the setup command:
                </div>
                <CopyBlock code="npx @annondeveloper/ui-kit mcp" language="bash" />
              </div>
            </div>

            <div className="mcp-setup__step">
              <div className="mcp-setup__num">2</div>
              <div className="mcp-setup__content">
                <div className="mcp-setup__label">Configure Your AI Tool</div>
                <div className="mcp-setup__detail">
                  Add the MCP server configuration to your AI assistant. Choose your tool:
                </div>
                <Tabs
                  tabs={setupTabs}
                  activeTab={setupTab}
                  onChange={setSetupTab}
                  variant="pills"
                  size="sm"
                >
                  <TabPanel tabId="claude">
                    <div style={{ marginTop: '0.75rem' }}>
                      <div className="mcp-setup__detail">
                        Add to <code>~/.claude/settings.json</code>:
                      </div>
                      <CopyBlock code={claudeConfig} language="json" />
                    </div>
                  </TabPanel>
                  <TabPanel tabId="cursor">
                    <div style={{ marginTop: '0.75rem' }}>
                      <div className="mcp-setup__detail">
                        Add to <code>.cursor/mcp.json</code> in your project:
                      </div>
                      <CopyBlock code={cursorConfig} language="json" />
                    </div>
                  </TabPanel>
                  <TabPanel tabId="vscode">
                    <div style={{ marginTop: '0.75rem' }}>
                      <div className="mcp-setup__detail">
                        Add to your VS Code settings:
                      </div>
                      <CopyBlock code={vscodeConfig} language="json" />
                    </div>
                  </TabPanel>
                  <TabPanel tabId="npx">
                    <div style={{ marginTop: '0.75rem' }}>
                      <div className="mcp-setup__detail">
                        After the package is published to npm, use npx directly:
                      </div>
                      <CopyBlock code={npxConfig} language="bash" />
                    </div>
                  </TabPanel>
                </Tabs>
              </div>
            </div>

            <div className="mcp-setup__step">
              <div className="mcp-setup__num">3</div>
              <div className="mcp-setup__content">
                <div className="mcp-setup__label">Start Using</div>
                <div className="mcp-setup__detail">
                  Restart your AI tool. The 6 tools appear automatically. Ask your AI:
                </div>
                <CopyBlock
                  code={`"Search for a date component using ui-kit"
"Generate a dashboard with MetricCard and TimeSeriesChart"
"What props does the DataTable component accept?"
"Show me the aurora theme CSS tokens"`}
                  language="text"
                />
              </div>
            </div>
          </div>
        </Card>
      </section>

      {/* ── Remote / SSE Mode ──────────────────────────────────── */}
      <section className="mcp-section">
        <div className="mcp-section__header">
          <Icon name="link" size="sm" />
          <h2 className="mcp-section__title">Team Mode (SSE)</h2>
          <Badge variant="info" size="sm">Optional</Badge>
        </div>
        <Card padding="lg">
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBlockEnd: '1rem', lineHeight: 1.6 }}>
            Run the MCP server as an HTTP service for team-shared access. Multiple team members
            can point to the same URL. Useful for teams that want a shared, always-up-to-date MCP endpoint.
          </p>
          <CopyBlock
            code={`# Start SSE server
node dist/mcp/index.js --sse --port 3100

# Connect from any MCP client
{
  "mcpServers": {
    "ui-kit": {
      "url": "http://your-server:3100/sse"
    }
  }
}

# Health check
curl http://localhost:3100/health
# Returns: {"status":"ok","sessions":0}`}
            language="bash"
          />
        </Card>
      </section>
    </div>
  )
}
