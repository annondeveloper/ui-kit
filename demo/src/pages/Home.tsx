import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '@ui/components/button'
import { Card } from '@ui/components/card'
import { Badge } from '@ui/components/badge'
import { Progress } from '@ui/components/progress'
import { Tooltip } from '@ui/components/tooltip'
import { Icon, type IconName } from '@ui/core/icons/icon'
import { AnimatedCounter } from '@ui/components/animated-counter'
import { MetricCard } from '@ui/domain/metric-card'
import { Sparkline } from '@ui/domain/sparkline'
import { StatusBadge } from '@ui/components/status-badge'
import { StatusPulse } from '@ui/components/status-pulse'
import { CopyBlock } from '@ui/domain/copy-block'
import { css } from '@ui/core/styles/css-tag'
import { useStyles } from '@ui/core/styles/use-styles'

// ─── Scroll Reveal Hook ─────────────────────────────────────────────────────

function useScrollReveal() {
  const ref = useRef<HTMLElement>(null)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add('home-revealed')
          observer.unobserve(el)
        }
      },
      { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])
  return ref
}

function RevealSection({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  const ref = useScrollReveal()
  return (
    <section ref={ref} className={`home-reveal ${className}`}>
      {children}
    </section>
  )
}

// ─── Styles ─────────────────────────────────────────────────────────────────

const homeStyles = css`
  @layer demo {
    .home {
      --section-gap: clamp(4rem, 8vw, 7rem);
      --glow-violet: oklch(55% 0.2 270);
      --glow-magenta: oklch(60% 0.18 310);
      --glow-cyan: oklch(65% 0.14 200);
      --glow-emerald: oklch(70% 0.15 160);
    }

    /* ─── Scroll Reveal ─── */
    .home-reveal {
      opacity: 0;
      transform: translateY(24px);
      transition: opacity 0.6s ease-out, transform 0.6s ease-out;
    }
    .home-revealed {
      opacity: 1;
      transform: translateY(0);
    }

    /* ─── Hero ─── */
    .home-hero {
      position: relative;
      text-align: center;
      padding-block: clamp(4rem, 10vw, 8rem) clamp(2rem, 5vw, 4rem);
      max-width: 900px;
      margin-inline: auto;
      overflow: visible;
    }

    .home-hero-aurora {
      position: absolute;
      inset: -60% -40%;
      z-index: -1;
      pointer-events: none;
      background:
        radial-gradient(ellipse 50% 40% at 25% 35%, oklch(50% 0.22 270 / 0.18), transparent 70%),
        radial-gradient(ellipse 45% 50% at 75% 45%, oklch(55% 0.2 310 / 0.14), transparent 70%),
        radial-gradient(ellipse 60% 35% at 50% 70%, oklch(60% 0.16 200 / 0.10), transparent 70%),
        radial-gradient(ellipse 35% 45% at 15% 65%, oklch(65% 0.14 160 / 0.08), transparent 70%);
      filter: blur(50px);
      animation: aurora-drift 16s ease-in-out infinite alternate;
    }

    .home-hero-orb {
      position: absolute;
      border-radius: 50%;
      pointer-events: none;
      z-index: -1;
      filter: blur(60px);
      animation: orb-float 10s ease-in-out infinite alternate;
    }
    .home-hero-orb--1 {
      width: 300px;
      height: 300px;
      top: -10%;
      left: -5%;
      background: oklch(50% 0.25 270 / 0.12);
      animation-duration: 14s;
    }
    .home-hero-orb--2 {
      width: 250px;
      height: 250px;
      top: 10%;
      right: -8%;
      background: oklch(55% 0.22 310 / 0.10);
      animation-duration: 18s;
      animation-delay: -4s;
    }
    .home-hero-orb--3 {
      width: 200px;
      height: 200px;
      bottom: 5%;
      left: 20%;
      background: oklch(60% 0.18 200 / 0.08);
      animation-duration: 12s;
      animation-delay: -7s;
    }
    .home-hero-orb--4 {
      width: 180px;
      height: 180px;
      bottom: -5%;
      right: 15%;
      background: oklch(65% 0.15 160 / 0.07);
      animation-duration: 16s;
      animation-delay: -2s;
    }

    @keyframes aurora-drift {
      0% { transform: translate(0, 0) scale(1) rotate(0deg); opacity: 0.7; }
      50% { transform: translate(15px, -12px) scale(1.04) rotate(1deg); opacity: 0.9; }
      100% { transform: translate(-10px, 8px) scale(1.08) rotate(-1deg); opacity: 1; }
    }

    @keyframes orb-float {
      0% { transform: translate(0, 0) scale(1); }
      33% { transform: translate(20px, -15px) scale(1.1); }
      66% { transform: translate(-10px, 10px) scale(0.95); }
      100% { transform: translate(15px, -5px) scale(1.05); }
    }

    @media (prefers-reduced-motion: reduce) {
      .home-hero-aurora,
      .home-hero-orb { animation: none; }
    }

    .home-hero-badge {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.375rem 0.875rem;
      border-radius: 999px;
      background: oklch(50% 0.2 270 / 0.12);
      border: 1px solid oklch(60% 0.18 270 / 0.2);
      font-size: 0.8125rem;
      font-weight: 600;
      color: oklch(75% 0.15 270);
      margin-block-end: 1.5rem;
    }
    .home-hero-badge-dot {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: oklch(70% 0.2 160);
      animation: pulse-dot 2s ease-in-out infinite;
    }
    @keyframes pulse-dot {
      0%, 100% { opacity: 1; transform: scale(1); }
      50% { opacity: 0.5; transform: scale(0.8); }
    }

    .home-hero h1 {
      font-size: clamp(2.5rem, 6vw, 4rem);
      font-weight: 800;
      letter-spacing: -0.04em;
      line-height: 1.05;
      margin-block-end: 1.5rem;
      text-wrap: balance;
      background: linear-gradient(
        135deg,
        var(--text-primary) 0%,
        oklch(75% 0.15 270) 40%,
        oklch(72% 0.18 310) 70%,
        var(--text-primary) 100%
      );
      background-size: 200% 100%;
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      animation: shimmer-text 8s ease-in-out infinite alternate;
    }

    @keyframes shimmer-text {
      0% { background-position: 0% 50%; }
      100% { background-position: 100% 50%; }
    }

    .home-hero-sub {
      font-size: clamp(1.0625rem, 2.4vw, 1.3rem);
      color: var(--text-secondary);
      line-height: 1.65;
      max-width: 580px;
      margin-inline: auto;
      margin-block-end: 2.25rem;
      text-wrap: pretty;
    }

    .home-hero-actions {
      display: flex;
      gap: 0.75rem;
      justify-content: center;
      flex-wrap: wrap;
    }

    /* Live Preview Strip */
    .home-preview-strip {
      display: flex;
      gap: 0.75rem;
      justify-content: center;
      align-items: center;
      flex-wrap: wrap;
      margin-block-start: 2.5rem;
      padding: 1.25rem 1.5rem;
      border-radius: var(--radius-lg, 0.75rem);
      background: oklch(100% 0 0 / 0.02);
      border: 1px solid oklch(100% 0 0 / 0.06);
      position: relative;
      overflow: hidden;
    }
    .home-preview-strip::before {
      content: '';
      position: absolute;
      inset: 0;
      background-image: radial-gradient(oklch(100% 0 0 / 0.04) 1px, transparent 1px);
      background-size: 16px 16px;
      pointer-events: none;
    }

    /* ─── Stats Bar ─── */
    .home-stats {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 1px;
      margin-block-start: clamp(2.5rem, 5vw, 4rem);
      border-radius: var(--radius-lg, 0.75rem);
      overflow: hidden;
      background: var(--border-subtle, oklch(100% 0 0 / 0.08));
    }

    @media (max-width: 640px) {
      .home-stats {
        grid-template-columns: repeat(2, 1fr);
      }
    }

    .home-stat {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.25rem;
      padding: 1.5rem 1rem;
      background: var(--bg-surface, oklch(20% 0 0));
      transition: background 0.2s;
    }
    .home-stat:hover {
      background: oklch(100% 0 0 / 0.04);
    }

    .home-stat-value {
      font-size: clamp(1.5rem, 3vw, 2rem);
      font-weight: 800;
      color: var(--text-primary);
      font-variant-numeric: tabular-nums;
    }

    .home-stat-label {
      font-size: 0.75rem;
      color: var(--text-tertiary);
      text-transform: uppercase;
      letter-spacing: 0.06em;
      font-weight: 500;
    }

    /* ─── Section Headers ─── */
    .home-section {
      margin-block-end: var(--section-gap);
    }

    .home-section-header {
      text-align: center;
      margin-block-end: 2.5rem;
    }

    .home-section-header h2 {
      font-size: clamp(1.75rem, 3.5vw, 2.5rem);
      font-weight: 800;
      letter-spacing: -0.03em;
      color: var(--text-primary);
      margin-block-end: 0.625rem;
      text-wrap: balance;
    }

    .home-section-header p {
      font-size: clamp(0.9375rem, 2vw, 1.0625rem);
      color: var(--text-secondary);
      max-width: 540px;
      margin-inline: auto;
      line-height: 1.65;
      text-wrap: pretty;
    }

    /* ─── Component Gallery ─── */
    .home-gallery-group {
      margin-block-end: 2.25rem;
    }

    .home-gallery-group-header {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      margin-block-end: 0.875rem;
      padding-block-end: 0.5rem;
      border-block-end: 1px solid oklch(100% 0 0 / 0.06);
    }

    .home-gallery-group-icon {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 1.75rem;
      height: 1.75rem;
      border-radius: var(--radius-sm, 0.25rem);
      background: oklch(55% 0.15 270 / 0.1);
      color: oklch(70% 0.18 270);
    }

    .home-gallery-group-title {
      font-size: 1rem;
      font-weight: 700;
      color: var(--text-primary);
    }

    .home-gallery-group-count {
      margin-inline-start: auto;
      font-size: 0.75rem;
      color: var(--text-tertiary);
      font-variant-numeric: tabular-nums;
    }

    .home-gallery-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
      gap: 0.625rem;
    }

    .home-gallery-card {
      display: flex;
      flex-direction: column;
      gap: 0.375rem;
      padding: 0.875rem 1rem;
      text-decoration: none;
      color: inherit;
      border-radius: var(--radius-md, 0.5rem);
      background: var(--bg-surface, oklch(20% 0 0));
      border: 1px solid oklch(100% 0 0 / 0.06);
      transition: border-color 0.25s, box-shadow 0.25s, transform 0.2s;
      position: relative;
      overflow: hidden;
    }
    .home-gallery-card::after {
      content: '';
      position: absolute;
      inset: 0;
      border-radius: inherit;
      opacity: 0;
      transition: opacity 0.3s;
      background: radial-gradient(
        300px circle at var(--mouse-x, 50%) var(--mouse-y, 50%),
        oklch(60% 0.15 270 / 0.06),
        transparent 60%
      );
      pointer-events: none;
    }
    .home-gallery-card:hover {
      border-color: oklch(60% 0.15 270 / 0.3);
      box-shadow: 0 0 20px oklch(55% 0.18 270 / 0.08);
      transform: translateY(-2px);
    }
    .home-gallery-card:hover::after {
      opacity: 1;
    }

    .home-gallery-card-top {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .home-gallery-card-name {
      font-size: 0.8125rem;
      font-weight: 600;
      color: var(--text-primary);
    }

    .home-gallery-card-tiers {
      display: flex;
      gap: 0.1875rem;
      margin-inline-start: auto;
    }

    .home-gallery-tier {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 1.125rem;
      height: 1.125rem;
      border-radius: 3px;
      font-size: 0.5rem;
      font-weight: 700;
      line-height: 1;
    }
    .home-gallery-tier--L {
      background: oklch(70% 0.12 150 / 0.15);
      color: oklch(75% 0.15 150);
    }
    .home-gallery-tier--S {
      background: oklch(65% 0.12 250 / 0.15);
      color: oklch(70% 0.15 250);
    }
    .home-gallery-tier--P {
      background: oklch(65% 0.15 310 / 0.15);
      color: oklch(72% 0.18 310);
    }

    .home-gallery-card-desc {
      font-size: 0.6875rem;
      color: var(--text-tertiary);
      line-height: 1.45;
    }

    /* ─── Feature Grid ─── */
    .home-features {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 1rem;
    }

    .home-feature-card {
      position: relative;
      padding: 1.5rem;
      border-radius: var(--radius-md, 0.5rem);
      background: var(--bg-surface, oklch(20% 0 0));
      border: 1px solid oklch(100% 0 0 / 0.06);
      transition: border-color 0.25s, box-shadow 0.25s;
    }
    .home-feature-card:hover {
      border-color: oklch(60% 0.15 270 / 0.25);
      box-shadow: 0 0 24px oklch(55% 0.18 270 / 0.06);
    }

    .home-feature-icon {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 2.75rem;
      height: 2.75rem;
      border-radius: var(--radius-md, 0.5rem);
      margin-block-end: 1rem;
    }
    .home-feature-icon--violet {
      background: oklch(55% 0.18 270 / 0.12);
      color: oklch(70% 0.2 270);
    }
    .home-feature-icon--cyan {
      background: oklch(60% 0.14 200 / 0.12);
      color: oklch(72% 0.16 200);
    }
    .home-feature-icon--magenta {
      background: oklch(55% 0.18 310 / 0.12);
      color: oklch(70% 0.2 310);
    }
    .home-feature-icon--emerald {
      background: oklch(60% 0.14 160 / 0.12);
      color: oklch(72% 0.16 160);
    }
    .home-feature-icon--amber {
      background: oklch(65% 0.14 80 / 0.12);
      color: oklch(75% 0.16 80);
    }
    .home-feature-icon--rose {
      background: oklch(60% 0.16 350 / 0.12);
      color: oklch(72% 0.18 350);
    }

    .home-feature-title {
      font-weight: 700;
      font-size: 1rem;
      margin-block-end: 0.375rem;
      color: var(--text-primary);
    }

    .home-feature-desc {
      font-size: 0.875rem;
      color: var(--text-secondary);
      line-height: 1.6;
    }

    /* ─── Getting Started Tiers ─── */
    .home-tiers {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 1rem;
    }

    .home-tier-card {
      padding: 1.75rem;
      border-radius: var(--radius-md, 0.5rem);
      background: var(--bg-surface, oklch(20% 0 0));
      border: 1px solid oklch(100% 0 0 / 0.06);
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
      transition: border-color 0.25s;
    }
    .home-tier-card:hover {
      border-color: oklch(100% 0 0 / 0.12);
    }
    .home-tier-card--premium {
      border-color: oklch(60% 0.15 310 / 0.2);
      background: linear-gradient(
        160deg,
        oklch(20% 0.01 310 / 0.4) 0%,
        var(--bg-surface, oklch(20% 0 0)) 40%
      );
    }

    .home-tier-header {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .home-tier-name {
      font-size: 1.125rem;
      font-weight: 700;
      color: var(--text-primary);
    }

    .home-tier-count {
      font-size: 0.8125rem;
      color: var(--text-secondary);
    }

    .home-tier-desc {
      font-size: 0.875rem;
      color: var(--text-secondary);
      line-height: 1.55;
    }

    .home-tier-features {
      display: flex;
      flex-direction: column;
      gap: 0.375rem;
      margin-block: 0.25rem;
    }

    .home-tier-feature {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.8125rem;
      color: var(--text-secondary);
    }

    .home-tier-check {
      flex-shrink: 0;
      width: 16px;
      height: 16px;
      border-radius: 50%;
      display: grid;
      place-items: center;
    }
    .home-tier-check--green {
      background: oklch(65% 0.14 160 / 0.15);
      color: oklch(72% 0.16 160);
    }

    /* ─── Dashboard Preview ─── */
    .home-dashboard-wrap {
      position: relative;
      padding: 1.5rem;
      border-radius: var(--radius-lg, 0.75rem);
      background: var(--bg-surface, oklch(20% 0 0));
      border: 1px solid oklch(100% 0 0 / 0.06);
      overflow: hidden;
    }
    .home-dashboard-wrap::before {
      content: '';
      position: absolute;
      inset: 0;
      background-image: radial-gradient(oklch(100% 0 0 / 0.03) 1px, transparent 1px);
      background-size: 20px 20px;
      pointer-events: none;
    }

    .home-dashboard-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1rem;
      position: relative;
    }

    .home-dashboard-bar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 1rem;
      margin-block-start: 1rem;
      padding-block-start: 1rem;
      border-block-start: 1px solid oklch(100% 0 0 / 0.06);
      flex-wrap: wrap;
      position: relative;
    }

    .home-dashboard-statuses {
      display: flex;
      gap: 0.75rem;
      align-items: center;
      flex-wrap: wrap;
    }

    .home-dashboard-sparkline-wrap {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .home-dashboard-sparkline-label {
      font-size: 0.75rem;
      color: var(--text-tertiary);
      white-space: nowrap;
    }

    /* ─── Footer ─── */
    .home-footer {
      display: flex;
      align-items: center;
      justify-content: center;
      flex-wrap: wrap;
      gap: 1.25rem;
      padding-block: 2.5rem;
      border-block-start: 1px solid oklch(100% 0 0 / 0.06);
    }

    .home-footer a {
      font-size: 0.875rem;
      color: var(--text-secondary);
      text-decoration: none;
      transition: color 0.15s;
    }
    .home-footer a:hover {
      color: var(--text-primary);
    }

    .home-footer-sep {
      width: 1px;
      height: 1rem;
      background: oklch(100% 0 0 / 0.08);
    }

    .home-footer-built {
      width: 100%;
      text-align: center;
      font-size: 0.75rem;
      color: var(--text-tertiary);
      margin-block-start: 0.5rem;
    }
  }
`

// ─── Gallery Data ───────────────────────────────────────────────────────────

type TierBadge = 'L' | 'S' | 'P'

interface GalleryItem {
  name: string
  desc: string
  path: string
  tiers: TierBadge[]
}

interface GalleryGroup {
  label: string
  icon: IconName
  items: GalleryItem[]
}

const galleryGroups: GalleryGroup[] = [
  {
    label: 'Primitives',
    icon: 'code',
    items: [
      { name: 'Button', desc: 'Actions with variants, sizes, icons, loading', path: '/components/button', tiers: ['L', 'S', 'P'] },
      { name: 'Badge', desc: 'Status indicators, counts, labels', path: '/components/badge', tiers: ['L', 'S', 'P'] },
      { name: 'Card', desc: 'Container with header, body, footer', path: '/components/card', tiers: ['L', 'S', 'P'] },
      { name: 'Avatar', desc: 'User images with fallback initials', path: '/components/avatar', tiers: ['L', 'S'] },
      { name: 'Divider', desc: 'Visual separation between content', path: '/components/divider', tiers: ['L'] },
      { name: 'Skeleton', desc: 'Animated loading placeholders', path: '/components/skeleton', tiers: ['L', 'S'] },
      { name: 'StatusBadge', desc: 'Operational status with pulse', path: '/components/status-badge', tiers: ['L', 'S', 'P'] },
      { name: 'StatusPulse', desc: 'Animated status dot indicator', path: '/components/status-pulse', tiers: ['L', 'S'] },
      { name: 'FilterPill', desc: 'Dismissible filter tokens', path: '/components/filter-pill', tiers: ['L', 'S'] },
      { name: 'EmptyState', desc: 'Zero-data placeholder with CTA', path: '/components/empty-state', tiers: ['L', 'S'] },
      { name: 'TruncatedText', desc: 'Overflow text with expand toggle', path: '/components/truncated-text', tiers: ['L', 'S'] },
    ],
  },
  {
    label: 'Forms',
    icon: 'edit',
    items: [
      { name: 'FormInput', desc: 'Text input with label, validation, icons', path: '/components/form-input', tiers: ['L', 'S', 'P'] },
      { name: 'Select', desc: 'Dropdown with search, multi-select', path: '/components/select', tiers: ['L', 'S', 'P'] },
      { name: 'Checkbox', desc: 'Binary toggle with indeterminate', path: '/components/checkbox', tiers: ['L', 'S', 'P'] },
      { name: 'ToggleSwitch', desc: 'On/off switch with animated thumb', path: '/components/toggle-switch', tiers: ['L', 'S', 'P'] },
      { name: 'Slider', desc: 'Range input with marks, tooltips', path: '/components/slider', tiers: ['L', 'S', 'P'] },
      { name: 'RadioGroup', desc: 'Single selection from a set', path: '/components/radio-group', tiers: ['L', 'S'] },
      { name: 'ComboBox', desc: 'Filterable dropdown autocomplete', path: '/components/combobox', tiers: ['S', 'P'] },
      { name: 'DatePicker', desc: 'Calendar-based date selection', path: '/components/date-picker', tiers: ['S', 'P'] },
      { name: 'TagInput', desc: 'Multi-value input with tag chips', path: '/components/tag-input', tiers: ['S', 'P'] },
      { name: 'OtpInput', desc: 'One-time password code entry', path: '/components/otp-input', tiers: ['S', 'P'] },
      { name: 'FileUpload', desc: 'Drag-and-drop file uploader', path: '/components/file-upload', tiers: ['S', 'P'] },
      { name: 'ColorInput', desc: 'Color picker with OKLCH support', path: '/components/color-input', tiers: ['S', 'P'] },
      { name: 'SearchInput', desc: 'Search with debounce and clear', path: '/components/search-input', tiers: ['L', 'S'] },
      { name: 'Rating', desc: 'Star or custom icon rating input', path: '/components/rating', tiers: ['L', 'S'] },
      { name: 'InlineEdit', desc: 'Click-to-edit text fields', path: '/components/inline-edit', tiers: ['S', 'P'] },
    ],
  },
  {
    label: 'Overlays',
    icon: 'menu',
    items: [
      { name: 'Dialog', desc: 'Modal dialogs with focus trapping', path: '/components/dialog', tiers: ['L', 'S', 'P'] },
      { name: 'Drawer', desc: 'Slide-out panel from any edge', path: '/components/drawer', tiers: ['L', 'S', 'P'] },
      { name: 'Tooltip', desc: 'Contextual info on hover/focus', path: '/components/tooltip', tiers: ['L', 'S', 'P'] },
      { name: 'Alert', desc: 'Inline status messages and banners', path: '/components/alert', tiers: ['L', 'S', 'P'] },
      { name: 'Toast', desc: 'Ephemeral notification popups', path: '/components/toast', tiers: ['S', 'P'] },
      { name: 'Sheet', desc: 'Bottom sheet for mobile UIs', path: '/components/sheet', tiers: ['S', 'P'] },
      { name: 'Popover', desc: 'Anchored floating content panels', path: '/components/popover', tiers: ['S', 'P'] },
      { name: 'DropdownMenu', desc: 'Contextual action menus', path: '/components/dropdown-menu', tiers: ['S', 'P'] },
      { name: 'NotificationStack', desc: 'Stacked notification queue', path: '/components/notification-stack', tiers: ['P'] },
      { name: 'CommandBar', desc: 'Cmd+K command palette', path: '/components/command-bar', tiers: ['P'] },
    ],
  },
  {
    label: 'Navigation',
    icon: 'arrow-right',
    items: [
      { name: 'Tabs', desc: 'Tabbed content with keyboard nav', path: '/components/tabs', tiers: ['L', 'S', 'P'] },
      { name: 'Accordion', desc: 'Collapsible content sections', path: '/components/accordion', tiers: ['L', 'S', 'P'] },
      { name: 'Breadcrumbs', desc: 'Hierarchical navigation trail', path: '/components/breadcrumbs', tiers: ['L', 'S'] },
      { name: 'Pagination', desc: 'Page navigation controls', path: '/components/pagination', tiers: ['L', 'S'] },
      { name: 'Navbar', desc: 'Top-level app navigation', path: '/components/navbar', tiers: ['S', 'P'] },
      { name: 'Sidebar', desc: 'Collapsible side navigation', path: '/components/sidebar', tiers: ['S', 'P'] },
      { name: 'AppShell', desc: 'Full app layout scaffold', path: '/components/app-shell', tiers: ['S', 'P'] },
      { name: 'StepWizard', desc: 'Multi-step guided flows', path: '/components/step-wizard', tiers: ['S', 'P'] },
    ],
  },
  {
    label: 'Data Display',
    icon: 'bar-chart',
    items: [
      { name: 'DataTable', desc: 'Sortable, filterable data grids', path: '/components/data-table', tiers: ['L', 'S', 'P'] },
      { name: 'SmartTable', desc: 'Auto-configured table from schema', path: '/components/smart-table', tiers: ['S', 'P'] },
      { name: 'MetricCard', desc: 'KPI display with sparklines', path: '/components/metric-card', tiers: ['L', 'S', 'P'] },
      { name: 'Progress', desc: 'Linear and circular indicators', path: '/components/progress', tiers: ['L', 'S', 'P'] },
      { name: 'Sparkline', desc: 'Inline trend line charts', path: '/components/sparkline', tiers: ['L', 'S', 'P'] },
      { name: 'AnimatedCounter', desc: 'Animated number transitions', path: '/components/animated-counter', tiers: ['L', 'S'] },
      { name: 'NumberTicker', desc: 'Rolling digit counter', path: '/components/number-ticker', tiers: ['S', 'P'] },
      { name: 'ConfidenceBar', desc: 'Multi-segment confidence display', path: '/components/confidence-bar', tiers: ['S', 'P'] },
      { name: 'ThresholdGauge', desc: 'Gauge with colored thresholds', path: '/components/threshold-gauge', tiers: ['S', 'P'] },
      { name: 'UtilizationBar', desc: 'Resource usage visualization', path: '/components/utilization-bar', tiers: ['S', 'P'] },
      { name: 'HeatmapCalendar', desc: 'GitHub-style contribution grid', path: '/components/heatmap-calendar', tiers: ['S', 'P'] },
      { name: 'CopyBlock', desc: 'Syntax-highlighted code block', path: '/components/copy-block', tiers: ['L', 'S', 'P'] },
      { name: 'DiffViewer', desc: 'Side-by-side code diff', path: '/components/diff-viewer', tiers: ['S', 'P'] },
      { name: 'TreeView', desc: 'Collapsible tree structure', path: '/components/tree-view', tiers: ['S', 'P'] },
      { name: 'UpstreamDashboard', desc: 'Service monitoring layout', path: '/components/upstream-dashboard', tiers: ['P'] },
    ],
  },
  {
    label: 'Monitoring',
    icon: 'activity',
    items: [
      { name: 'LogViewer', desc: 'Streaming log display', path: '/components/log-viewer', tiers: ['S', 'P'] },
      { name: 'LiveFeed', desc: 'Real-time event stream', path: '/components/live-feed', tiers: ['S', 'P'] },
      { name: 'PipelineStage', desc: 'CI/CD pipeline visualization', path: '/components/pipeline-stage', tiers: ['S', 'P'] },
      { name: 'UptimeTracker', desc: 'Service uptime bars', path: '/components/uptime-tracker', tiers: ['S', 'P'] },
      { name: 'PortStatusGrid', desc: 'Port availability matrix', path: '/components/port-status-grid', tiers: ['S', 'P'] },
      { name: 'NetworkTrafficCard', desc: 'Network throughput display', path: '/components/network-traffic-card', tiers: ['P'] },
      { name: 'SeverityTimeline', desc: 'Incident severity over time', path: '/components/severity-timeline', tiers: ['S', 'P'] },
      { name: 'RealtimeValue', desc: 'Live-updating metric display', path: '/components/realtime-value', tiers: ['S', 'P'] },
      { name: 'GeoMap', desc: 'Geographic data visualization', path: '/components/geo-map', tiers: ['P'] },
      { name: 'DashboardGrid', desc: 'Draggable dashboard layout', path: '/components/dashboard-grid', tiers: ['P'] },
    ],
  },
  {
    label: 'AI & Realtime',
    icon: 'terminal',
    items: [
      { name: 'StreamingText', desc: 'LLM token-by-token rendering', path: '/components/streaming-text', tiers: ['S', 'P'] },
      { name: 'TypingIndicator', desc: 'Chat typing animation dots', path: '/components/typing-indicator', tiers: ['S', 'P'] },
      { name: 'EncryptedText', desc: 'Matrix-style decrypt animation', path: '/components/encrypted-text', tiers: ['S', 'P'] },
      { name: 'FlipWords', desc: 'Rotating word animations', path: '/components/flip-words', tiers: ['S', 'P'] },
      { name: 'TextReveal', desc: 'Scroll-triggered text unveil', path: '/components/text-reveal', tiers: ['S', 'P'] },
      { name: 'InfiniteScroll', desc: 'Virtualized infinite loading', path: '/components/infinite-scroll', tiers: ['S', 'P'] },
      { name: 'SortableList', desc: 'Drag-to-reorder list', path: '/components/sortable-list', tiers: ['S', 'P'] },
      { name: 'KanbanColumn', desc: 'Kanban board columns', path: '/components/kanban-column', tiers: ['S', 'P'] },
    ],
  },
  {
    label: 'Visual Effects',
    icon: 'zap',
    items: [
      { name: 'BackgroundBeams', desc: 'Animated beam light rays', path: '/components/background-beams', tiers: ['P'] },
      { name: 'BackgroundBoxes', desc: 'Floating animated grid boxes', path: '/components/background-boxes', tiers: ['P'] },
      { name: 'BorderBeam', desc: 'Animated gradient border', path: '/components/border-beam', tiers: ['P'] },
      { name: 'GlowCard', desc: 'Mouse-tracking glow card', path: '/components/glow-card', tiers: ['P'] },
      { name: 'SpotlightCard', desc: 'Spotlight hover effect card', path: '/components/spotlight-card', tiers: ['P'] },
      { name: 'Card3D', desc: '3D perspective tilt card', path: '/components/card-3d', tiers: ['P'] },
      { name: 'EvervaultCard', desc: 'Matrix-style encrypted card', path: '/components/evervault-card', tiers: ['P'] },
      { name: 'HeroHighlight', desc: 'Gradient text highlight effect', path: '/components/hero-highlight', tiers: ['P'] },
      { name: 'MeteorShower', desc: 'Falling meteor animation', path: '/components/meteor-shower', tiers: ['P'] },
      { name: 'WavyBackground', desc: 'Animated wavy background', path: '/components/wavy-background', tiers: ['P'] },
      { name: 'OrbitingCircles', desc: 'Orbiting icon animation', path: '/components/orbiting-circles', tiers: ['P'] },
      { name: 'Ripple', desc: 'Click ripple effect', path: '/components/ripple', tiers: ['P'] },
      { name: 'ShimmerButton', desc: 'Shimmering gradient button', path: '/components/shimmer-button', tiers: ['P'] },
      { name: 'TracingBeam', desc: 'Scroll-tracing side beam', path: '/components/tracing-beam', tiers: ['P'] },
      { name: 'ResponsiveCard', desc: 'Container-query adaptive card', path: '/components/responsive-card', tiers: ['S', 'P'] },
      { name: 'TimeRangeSelector', desc: 'Drag-to-select time range', path: '/components/time-range-selector', tiers: ['S', 'P'] },
      { name: 'ViewTransitionLink', desc: 'View Transition API links', path: '/components/view-transition-link', tiers: ['S'] },
    ],
  },
]

const totalComponents = galleryGroups.reduce((sum, g) => sum + g.items.length, 0)
const premiumCount = galleryGroups.reduce(
  (sum, g) => sum + g.items.filter(i => i.tiers.includes('P') && i.tiers.length === 1).length,
  0
)

// ─── Feature Data ───────────────────────────────────────────────────────────

interface Feature {
  icon: IconName
  color: string
  title: string
  desc: string
}

const features: Feature[] = [
  {
    icon: 'zap',
    color: 'violet',
    title: 'Zero Dependencies',
    desc: 'Only React 19 as a peer dep. Every utility, animation, and style system built from scratch.',
  },
  {
    icon: 'eye',
    color: 'cyan',
    title: 'OKLCH Color System',
    desc: 'Perceptually uniform colors with relative color syntax. Generate entire themes from one brand hue.',
  },
  {
    icon: 'activity',
    color: 'magenta',
    title: 'Physics-Based Motion',
    desc: 'Real spring solver using RK4 integration. Not CSS approximations -- actual differential equations.',
  },
  {
    icon: 'grip-vertical',
    color: 'emerald',
    title: '3 Weight Tiers',
    desc: 'Lite for minimal bundles. Standard for most apps. Premium for cinematic experiences.',
  },
  {
    icon: 'code',
    color: 'amber',
    title: 'Container-First Responsive',
    desc: 'Components adapt to their container, not the viewport. Works anywhere you drop them.',
  },
  {
    icon: 'edit',
    color: 'rose',
    title: 'Built-in Form Engine',
    desc: 'createForm(), useForm(), validators, FieldArray. Full form solution, zero extra packages.',
  },
]

// ─── Code Example ───────────────────────────────────────────────────────────

const codeExample = `import { UIProvider, Button, MetricCard } from '@annondeveloper/ui-kit'

function App() {
  return (
    <UIProvider motion={3}>
      <MetricCard
        title="CPU Usage"
        value="87.4%"
        trend="up"
        status="warning"
        sparkline={[45, 52, 49, 63, 72, 68, 75, 82, 87]}
      />
      <Button variant="primary" size="lg">
        Deploy
      </Button>
    </UIProvider>
  )
}`

// ─── Gallery Card with Mouse Glow ───────────────────────────────────────────

function GalleryCard({ item }: { item: GalleryItem }) {
  const ref = useRef<HTMLAnchorElement>(null)

  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = ref.current?.getBoundingClientRect()
    if (!rect) return
    const x = ((e.clientX - rect.left) / rect.width) * 100
    const y = ((e.clientY - rect.top) / rect.height) * 100
    ref.current?.style.setProperty('--mouse-x', `${x}%`)
    ref.current?.style.setProperty('--mouse-y', `${y}%`)
  }

  return (
    <Link
      ref={ref}
      to={item.path}
      className="home-gallery-card"
      onMouseMove={handleMouseMove}
    >
      <div className="home-gallery-card-top">
        <span className="home-gallery-card-name">{item.name}</span>
        <span className="home-gallery-card-tiers">
          {item.tiers.map(t => (
            <span key={t} className={`home-gallery-tier home-gallery-tier--${t}`}>{t}</span>
          ))}
        </span>
      </div>
      <span className="home-gallery-card-desc">{item.desc}</span>
    </Link>
  )
}

// ─── Component ──────────────────────────────────────────────────────────────

export default function Home() {
  useStyles('home', homeStyles)
  const [galleryFilter, setGalleryFilter] = useState<string | null>(null)

  const filteredGroups = galleryFilter
    ? galleryGroups.filter(g => g.label === galleryFilter)
    : galleryGroups

  return (
    <div className="home">

      {/* ── Hero ── */}
      <section className="home-hero">
        {/* Aurora background */}
        <div className="home-hero-aurora" aria-hidden="true" />
        <div className="home-hero-orb home-hero-orb--1" aria-hidden="true" />
        <div className="home-hero-orb home-hero-orb--2" aria-hidden="true" />
        <div className="home-hero-orb home-hero-orb--3" aria-hidden="true" />
        <div className="home-hero-orb home-hero-orb--4" aria-hidden="true" />

        <div className="home-hero-badge">
          <span className="home-hero-badge-dot" />
          v2.0 -- Aurora Fluid Design System
        </div>

        <h1>
          The component library<br />
          that needs nothing else
        </h1>

        <p className="home-hero-sub">
          {totalComponents} components. Physics-based animations. OKLCH color system.
          Aurora Fluid design language. 3 weight tiers. Zero dependencies.
        </p>

        <div className="home-hero-actions">
          <Link to="/components/button" style={{ textDecoration: 'none' }}>
            <Button variant="primary" size="lg" icon={<Icon name="zap" size="sm" />}>
              Explore Components
            </Button>
          </Link>
          <Button
            variant="secondary"
            size="lg"
            icon={<Icon name="code" size="sm" />}
            onClick={() => window.open('https://github.com/annondeveloper/ui-kit', '_blank')}
          >
            GitHub
          </Button>
        </div>

        {/* Live component preview strip */}
        <div className="home-preview-strip">
          <Button variant="primary" size="sm">Primary</Button>
          <Button variant="secondary" size="sm">Ghost</Button>
          <Badge variant="primary" size="md">New</Badge>
          <Badge variant="default" size="sm">v2.0</Badge>
          <Tooltip content="All systems operational" position="top">
            <StatusBadge status="ok" label="Healthy" pulse />
          </Tooltip>
          <StatusBadge status="warning" label="Degraded" />
          <StatusPulse status="ok" size="sm" />
          <Progress value={72} size="sm" style={{ width: 80 }} />
        </div>

        {/* Stats */}
        <div className="home-stats">
          <div className="home-stat">
            <span className="home-stat-value">
              <AnimatedCounter value={totalComponents} />
            </span>
            <span className="home-stat-label">Components</span>
          </div>
          <div className="home-stat">
            <span className="home-stat-value">
              <AnimatedCounter value={premiumCount} />
            </span>
            <span className="home-stat-label">Premium</span>
          </div>
          <div className="home-stat">
            <span className="home-stat-value">3</span>
            <span className="home-stat-label">Weight Tiers</span>
          </div>
          <div className="home-stat">
            <span className="home-stat-value">0</span>
            <span className="home-stat-label">Dependencies</span>
          </div>
        </div>
      </section>

      {/* ── Component Gallery ── */}
      <RevealSection className="home-section">
        <div className="home-section-header">
          <h2>All {totalComponents} Components</h2>
          <p>
            Every component has an interactive demo page. Click any card to explore
            variants, sizes, tiers, and accessibility features.
          </p>
        </div>

        {/* Category filter pills */}
        <div style={{ display: 'flex', gap: '0.375rem', flexWrap: 'wrap', justifyContent: 'center', marginBlockEnd: '2rem' }}>
          <Button
            variant={galleryFilter === null ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => setGalleryFilter(null)}
          >
            All ({totalComponents})
          </Button>
          {galleryGroups.map(g => (
            <Button
              key={g.label}
              variant={galleryFilter === g.label ? 'primary' : 'secondary'}
              size="sm"
              onClick={() => setGalleryFilter(galleryFilter === g.label ? null : g.label)}
            >
              {g.label} ({g.items.length})
            </Button>
          ))}
        </div>

        {filteredGroups.map(group => (
          <div key={group.label} className="home-gallery-group">
            <div className="home-gallery-group-header">
              <span className="home-gallery-group-icon">
                <Icon name={group.icon} size={14} />
              </span>
              <span className="home-gallery-group-title">{group.label}</span>
              <span className="home-gallery-group-count">{group.items.length} components</span>
            </div>
            <div className="home-gallery-grid">
              {group.items.map(item => (
                <GalleryCard key={item.name} item={item} />
              ))}
            </div>
          </div>
        ))}
      </RevealSection>

      {/* ── Feature Highlights ── */}
      <RevealSection className="home-section">
        <div className="home-section-header">
          <h2>What makes this different</h2>
          <p>
            Every feature designed to eliminate the need for additional packages.
          </p>
        </div>

        <div className="home-features">
          {features.map(f => (
            <div key={f.title} className="home-feature-card">
              <div className={`home-feature-icon home-feature-icon--${f.color}`}>
                <Icon name={f.icon} size="md" />
              </div>
              <div className="home-feature-title">{f.title}</div>
              <div className="home-feature-desc">{f.desc}</div>
            </div>
          ))}
        </div>
      </RevealSection>

      {/* ── Getting Started ── */}
      <RevealSection className="home-section">
        <div className="home-section-header">
          <h2>Getting Started</h2>
          <p>
            Choose the weight tier that fits your project. Lite ships the smallest bundle.
            Premium unlocks every feature.
          </p>
        </div>

        <div className="home-tiers">
          <div className="home-tier-card">
            <div className="home-tier-header">
              <Badge variant="default" size="sm" style={{ background: 'oklch(70% 0.12 150 / 0.15)', color: 'oklch(75% 0.15 150)' }}>Lite</Badge>
              <span className="home-tier-name">Lite</span>
            </div>
            <span className="home-tier-count">Core primitives, forms, basic data display</span>
            <div className="home-tier-features">
              <span className="home-tier-feature">
                <span className="home-tier-check home-tier-check--green"><Icon name="check" size={10} /></span>
                All primitive components
              </span>
              <span className="home-tier-feature">
                <span className="home-tier-check home-tier-check--green"><Icon name="check" size={10} /></span>
                Basic form controls
              </span>
              <span className="home-tier-feature">
                <span className="home-tier-check home-tier-check--green"><Icon name="check" size={10} /></span>
                Smallest bundle size
              </span>
            </div>
            <CopyBlock code="import { Button } from '@annondeveloper/ui-kit/lite'" language="typescript" />
          </div>

          <div className="home-tier-card">
            <div className="home-tier-header">
              <Badge variant="primary" size="sm">Standard</Badge>
              <span className="home-tier-name">Standard</span>
            </div>
            <span className="home-tier-count">Everything in Lite plus overlays, navigation, advanced forms</span>
            <div className="home-tier-features">
              <span className="home-tier-feature">
                <span className="home-tier-check home-tier-check--green"><Icon name="check" size={10} /></span>
                All Lite components
              </span>
              <span className="home-tier-feature">
                <span className="home-tier-check home-tier-check--green"><Icon name="check" size={10} /></span>
                Overlays, navigation, AI components
              </span>
              <span className="home-tier-feature">
                <span className="home-tier-check home-tier-check--green"><Icon name="check" size={10} /></span>
                Physics-based animations
              </span>
            </div>
            <CopyBlock code="import { Button } from '@annondeveloper/ui-kit'" language="typescript" />
          </div>

          <div className="home-tier-card home-tier-card--premium">
            <div className="home-tier-header">
              <Badge variant="primary" size="sm" style={{ background: 'oklch(65% 0.18 310)' }}>Premium</Badge>
              <span className="home-tier-name">Premium</span>
            </div>
            <span className="home-tier-count">Full library with monitoring, visual effects, cinematic motion</span>
            <div className="home-tier-features">
              <span className="home-tier-feature">
                <span className="home-tier-check home-tier-check--green"><Icon name="check" size={10} /></span>
                All Standard components
              </span>
              <span className="home-tier-feature">
                <span className="home-tier-check home-tier-check--green"><Icon name="check" size={10} /></span>
                Visual effects, dashboards, geo map
              </span>
              <span className="home-tier-feature">
                <span className="home-tier-check home-tier-check--green"><Icon name="check" size={10} /></span>
                Cinematic spring physics
              </span>
            </div>
            <CopyBlock code="import { Button } from '@annondeveloper/ui-kit/premium'" language="typescript" />
          </div>
        </div>
      </RevealSection>

      {/* ── Live Dashboard Preview ── */}
      <RevealSection className="home-section">
        <div className="home-section-header">
          <h2>Built for real interfaces</h2>
          <p>
            Not toy demos. Production-grade monitoring components rendering live data.
          </p>
        </div>

        <div className="home-dashboard-wrap">
          <div className="home-dashboard-grid">
            <MetricCard
              title="CPU Usage"
              value="87.4%"
              trend="up"
              status="warning"
              sparkline={[45, 52, 49, 63, 72, 68, 75, 82, 87]}
            />
            <MetricCard
              title="Memory"
              value="62.1%"
              trend="flat"
              status="ok"
              sparkline={[58, 60, 59, 61, 62, 61, 63, 62, 62]}
            />
            <MetricCard
              title="Network I/O"
              value="1,247 req/s"
              trend="up"
              status="ok"
              sparkline={[800, 920, 1050, 1100, 1180, 1200, 1247]}
            />
            <MetricCard
              title="Error Rate"
              value="0.03%"
              trend="down"
              status="ok"
              sparkline={[0.12, 0.08, 0.06, 0.05, 0.04, 0.03]}
            />
          </div>

          <div className="home-dashboard-bar">
            <div className="home-dashboard-statuses">
              <StatusBadge status="ok" label="API Gateway" pulse />
              <StatusBadge status="ok" label="Database" />
              <StatusBadge status="warning" label="Worker Pool" />
              <StatusPulse status="ok" size="sm" label="All systems operational" />
            </div>
            <div className="home-dashboard-sparkline-wrap">
              <span className="home-dashboard-sparkline-label">24h throughput</span>
              <Sparkline
                data={[120, 135, 142, 128, 156, 178, 195, 210, 198, 225, 240, 232]}
                width={120}
                height={32}
                gradient
              />
            </div>
          </div>
        </div>
      </RevealSection>

      {/* ── Code Example ── */}
      <RevealSection className="home-section">
        <div className="home-section-header">
          <h2>Simple to use</h2>
          <p>Import what you need. Wrap in UIProvider. Ship.</p>
        </div>

        <div style={{ maxWidth: 640, marginInline: 'auto' }}>
          <CopyBlock
            code={codeExample}
            language="typescript"
            showLineNumbers
            title="App.tsx"
          />
        </div>
      </RevealSection>

      {/* ── Footer ── */}
      <footer className="home-footer">
        <a href="https://github.com/annondeveloper/ui-kit" target="_blank" rel="noopener noreferrer">
          GitHub
        </a>
        <div className="home-footer-sep" />
        <a href="https://www.npmjs.com/package/@annondeveloper/ui-kit" target="_blank" rel="noopener noreferrer">
          npm
        </a>
        <div className="home-footer-sep" />
        <a href="https://jsr.io/@annondeveloper/ui-kit" target="_blank" rel="noopener noreferrer">
          JSR
        </a>
        <div className="home-footer-sep" />
        <Link to="/docs">Documentation</Link>
        <div className="home-footer-sep" />
        <Badge variant="default" size="sm">v2.0.1</Badge>
        <div className="home-footer-built">
          Built with zero dependencies. Powered by Aurora Fluid design.
        </div>
      </footer>
    </div>
  )
}
