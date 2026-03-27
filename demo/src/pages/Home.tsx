import { lazy, Suspense, useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
// Above-the-fold: load eagerly (hero section)
import { Button } from '@ui/components/button'
import { Badge } from '@ui/components/badge'
import { Progress } from '@ui/components/progress'
import { StatusBadge } from '@ui/components/status-badge'
import { StatusPulse } from '@ui/components/status-pulse'
import { Icon, type IconName } from '@ui/core/icons/icon'
import { css } from '@ui/core/styles/css-tag'
import { useStyles } from '@ui/core/styles/use-styles'

// Below-the-fold: lazy-loaded (gallery, dashboard, getting started)
const Card = lazy(() => import('@ui/components/card').then(m => ({ default: m.Card })))
// AnimatedCounter removed — stats use plain numbers for instant render
const MetricCard = lazy(() => import('@ui/domain/metric-card').then(m => ({ default: m.MetricCard })))
const Sparkline = lazy(() => import('@ui/domain/sparkline').then(m => ({ default: m.Sparkline })))
const CopyBlock = lazy(() => import('@ui/domain/copy-block').then(m => ({ default: m.CopyBlock })))
const GlowCard = lazy(() => import('@ui/domain/glow-card').then(m => ({ default: m.GlowCard })))
const ShimmerButton = lazy(() => import('@ui/domain/shimmer-button').then(m => ({ default: m.ShimmerButton })))
const BorderBeam = lazy(() => import('@ui/domain/border-beam').then(m => ({ default: m.BorderBeam })))
const Divider = lazy(() => import('@ui/components/divider').then(m => ({ default: m.Divider })))
const FilterPill = lazy(() => import('@ui/components/filter-pill').then(m => ({ default: m.FilterPill })))

// ─── Lazy Section: Only renders when near viewport ──────────────────────────

function LazySection({ children, height = 400, className = '' }: { children: React.ReactNode; height?: number; className?: string }) {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); observer.unobserve(el) } },
      { rootMargin: '500px 0px' } // 500px buffer ahead
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])
  return (
    <div ref={ref} className={className} style={visible ? undefined : { minHeight: height }}>
      {visible ? (
        <Suspense fallback={<div style={{ minHeight: height }} />}>
          {children}
        </Suspense>
      ) : null}
    </div>
  )
}

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

function RevealSection({ children, className = '', delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const ref = useScrollReveal()
  return (
    <section
      ref={ref}
      className={`home-reveal ${className}`}
      style={delay > 0 ? { transitionDelay: `${delay}ms` } : undefined}
    >
      {children}
    </section>
  )
}

// ─── Stagger Item ────────────────────────────────────────────────────────────

function StaggerItem({ children, index, className = '' }: { children: React.ReactNode; index: number; className?: string }) {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add('home-stagger-visible')
          observer.unobserve(el)
        }
      },
      { threshold: 0.05 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return (
    <div
      ref={ref}
      className={`home-stagger-item ${className}`}
      style={{ transitionDelay: `${index * 60}ms` }}
    >
      {children}
    </div>
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
      --spring: cubic-bezier(0.34, 1.56, 0.64, 1);
      --ease: cubic-bezier(0.16, 1, 0.3, 1);
    }

    /* ─── Scroll Reveal ─── */
    .home-reveal {
      opacity: 0;
      transform: translateY(24px);
      transition: opacity 0.6s var(--ease), transform 0.6s var(--ease);
    }
    .home-revealed {
      opacity: 1;
      transform: translateY(0);
    }

    /* ─── Stagger Items ─── */
    .home-stagger-item {
      opacity: 0;
      transform: translateY(16px) scale(0.97);
      transition: opacity 0.4s var(--ease), transform 0.5s var(--spring);
    }
    .home-stagger-visible {
      opacity: 1;
      transform: translateY(0) scale(1);
    }

    /* ─── Hero ─── */
    .home-hero {
      position: relative;
      text-align: center;
      padding-block: clamp(4rem, 10vw, 8rem) clamp(2rem, 5vw, 4rem);
      max-width: 920px;
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

    /* Floating component thumbnails grid behind hero */
    .home-hero-grid {
      position: absolute;
      inset: 0;
      z-index: -1;
      pointer-events: none;
      display: grid;
      grid-template-columns: repeat(8, 1fr);
      grid-template-rows: repeat(6, 1fr);
      gap: 1rem;
      opacity: 0.035;
      padding: 2rem;
    }
    .home-hero-grid-cell {
      border-radius: var(--radius-sm, 0.375rem);
      border: 1px solid oklch(100% 0 0 / 0.3);
      animation: grid-pulse 4s ease-in-out infinite;
    }
    .home-hero-grid-cell:nth-child(odd) { animation-delay: -1s; }
    .home-hero-grid-cell:nth-child(3n) { animation-delay: -2.5s; }
    .home-hero-grid-cell:nth-child(5n) { animation-delay: -0.5s; }

    @keyframes grid-pulse {
      0%, 100% { opacity: 0.3; transform: scale(1); }
      50% { opacity: 1; transform: scale(1.02); }
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
      .home-hero-orb,
      .home-hero-grid-cell { animation: none; }
      .home-stagger-item { transition: none; opacity: 1; transform: none; }
      .home-reveal { transition: none; opacity: 1; transform: none; }
    }

    /* Hero text stagger entrance */
    .home-hero-entrance {
      opacity: 0;
      transform: translateY(20px);
      animation: hero-enter 0.7s var(--ease) forwards;
    }
    .home-hero-entrance:nth-child(1) { animation-delay: 0.1s; }
    .home-hero-entrance:nth-child(2) { animation-delay: 0.25s; }
    .home-hero-entrance:nth-child(3) { animation-delay: 0.4s; }
    .home-hero-entrance:nth-child(4) { animation-delay: 0.55s; }
    .home-hero-entrance:nth-child(5) { animation-delay: 0.7s; }
    .home-hero-entrance:nth-child(6) { animation-delay: 0.85s; }

    @keyframes hero-enter {
      to { opacity: 1; transform: translateY(0); }
    }

    .home-hero h1 {
      font-size: clamp(2.5rem, 6vw, 4rem);
      font-weight: 800;
      letter-spacing: -0.04em;
      line-height: 1.05;
      margin-block-end: 1.5rem;
      text-wrap: balance;
      color: var(--text-primary);
    }

    .home-hero-sub {
      font-size: clamp(1.0625rem, 2.4vw, 1.3rem);
      color: var(--text-secondary);
      line-height: 1.65;
      max-width: 680px;
      margin-inline: auto;
      margin-block-end: 2.25rem;
      text-align: center;
      text-wrap: balance;
    }

    .home-hero-actions {
      display: flex;
      gap: 0.75rem;
      justify-content: center;
      flex-wrap: wrap;
      align-items: center;
    }

    /* Live Preview Strip */
    .home-preview-strip-inner {
      display: flex;
      gap: 1.25rem;
      justify-content: center;
      align-items: center;
      flex-wrap: wrap;
      padding: 1.75rem 2.5rem;
      border-radius: var(--radius-lg, 0.75rem);
      background: var(--bg-elevated);
      border: 1px solid var(--border-default);
      box-shadow: var(--shadow-md);
    }

    /* ─── Stats Bar ─── */
    .home-stats {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 1rem;
      margin-block-start: clamp(2.5rem, 5vw, 4rem);
    }

    .home-stat-cell {
      background: var(--bg-elevated);
      border: 1px solid var(--border-default);
      border-radius: var(--radius-md, 0.5rem);
      transition: border-color 0.2s, box-shadow 0.2s;
    }
    .home-stat-cell:hover {
      border-color: var(--border-strong);
      box-shadow: var(--shadow-sm);
    }

    @media (max-width: 640px) {
      .home-stats {
        grid-template-columns: repeat(2, 1fr);
      }
    }

    .home-stat-inner {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.25rem;
      padding: 1.25rem 1rem;
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
      max-width: 640px;
      margin-inline: auto;
      line-height: 1.65;
      text-wrap: balance;
    }

    /* ─── Component Gallery ─── */
    .home-gallery-filters {
      display: flex;
      gap: 0.375rem;
      flex-wrap: wrap;
      justify-content: center;
      margin-block-end: 2rem;
    }

    .home-gallery-group {
      margin-block-end: 2.25rem;
    }

    .home-gallery-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
      gap: 0.75rem;
    }

    /* GlowCard gallery overrides */
    .home-glow-card-link {
      text-decoration: none;
      color: inherit;
      display: block;
    }

    .home-gallery-card-inner {
      display: flex;
      flex-direction: column;
      gap: 0.375rem;
      padding: 0.25rem 0;
    }

    .home-gallery-card-top {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .home-gallery-card-name {
      font-size: 0.875rem;
      font-weight: 600;
      color: var(--text-primary);
    }

    .home-gallery-card-tiers {
      display: flex;
      gap: 0.25rem;
      margin-inline-start: auto;
    }

    .home-gallery-card-arrow {
      opacity: 0;
      transform: translateX(-4px);
      transition: opacity 0.2s, transform 0.3s var(--spring);
      color: var(--text-tertiary);
      flex-shrink: 0;
    }

    .home-glow-card-link:hover .home-gallery-card-arrow {
      opacity: 1;
      transform: translateX(0);
    }

    .home-gallery-card-desc {
      font-size: 0.75rem;
      color: var(--text-tertiary);
      line-height: 1.45;
      text-wrap: pretty;
    }

    .home-gallery-view-all {
      display: inline-flex;
      align-items: center;
      gap: 0.375rem;
      margin-block-start: 0.75rem;
      font-size: 0.8125rem;
      font-weight: 500;
      color: oklch(70% 0.15 270);
      text-decoration: none;
      transition: color 0.15s, gap 0.2s var(--spring);
    }
    .home-gallery-view-all:hover {
      color: oklch(80% 0.18 270);
      gap: 0.625rem;
    }

    /* ─── Feature Grid ─── */
    .home-features {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 1rem;
    }

    .home-feature-inner {
      display: flex;
      flex-direction: column;
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
      text-wrap: balance;
    }

    .home-feature-desc {
      font-size: 0.875rem;
      color: var(--text-secondary);
      line-height: 1.6;
      text-wrap: pretty;
    }

    /* ─── Getting Started Tiers ─── */
    .home-tiers {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 1rem;
      align-items: stretch;
    }

    .home-tier-inner {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
      height: 100%;
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
      text-wrap: pretty;
    }

    .home-tier-features {
      display: flex;
      flex-direction: column;
      gap: 0.375rem;
      margin-block: 0.25rem;
      flex: 1;
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
      background: oklch(65% 0.14 160 / 0.15);
      color: oklch(72% 0.16 160);
    }

    /* ─── Dashboard Preview ─── */
    .home-dashboard-inner {
      padding: 1.5rem;
    }
    .home-dashboard-inner::before {
      content: '';
      position: absolute;
      inset: 0;
      background-image: radial-gradient(oklch(50% 0 0 / 0.06) 1px, transparent 1px);
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
      border-block-start: 1px solid var(--border-subtle, oklch(100% 0 0 / 0.06));
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

    /* ─── Code Example ─── */
    .home-code-wrap {
      max-width: 640px;
      margin-inline: auto;
    }

    /* ─── Footer ─── */
    .home-footer {
      display: flex;
      align-items: center;
      justify-content: center;
      flex-wrap: wrap;
      gap: 1.25rem;
      padding-block: 2.5rem;
    }

    .home-footer a {
      font-size: 0.875rem;
      color: var(--text-secondary);
      text-decoration: none;
      transition: color 0.2s var(--spring), transform 0.2s var(--spring);
      display: inline-block;
    }
    .home-footer a:hover {
      color: var(--text-primary);
      transform: translateY(-1px);
    }

    .home-footer-built {
      width: 100%;
      text-align: center;
      font-size: 0.75rem;
      color: var(--text-tertiary);
      margin-block-start: 0.5rem;
    }
  }

  /* ─── Light Mode Overrides ────────────────────────────────── */
  @layer demo {
    html.light .home {
      .home-hero-aurora {
        opacity: 0.15;
        filter: blur(80px);
      }
      .home-hero-orb {
        opacity: 0.2;
      }
      .home-preview-strip-inner {
        background: var(--bg-elevated);
        border-color: var(--border-default);
        box-shadow: var(--shadow-lg);
      }
      .home-stats-bar > div {
        background: var(--bg-surface, oklch(100% 0 0));
        border-color: var(--border-default, oklch(0% 0 0 / 0.08));
        box-shadow: var(--shadow-sm, 0 1px 2px oklch(0% 0 0 / 0.06));
      }
      .home-gallery-card {
        background: var(--bg-surface, oklch(100% 0 0));
        border-color: var(--border-default, oklch(0% 0 0 / 0.08));
        box-shadow: var(--shadow-sm);
      }
      .home-feature-card {
        background: var(--bg-surface, oklch(100% 0 0));
        border-color: var(--border-default, oklch(0% 0 0 / 0.08));
        box-shadow: var(--shadow-sm);
      }
      .home-tier-card {
        background: var(--bg-surface, oklch(100% 0 0));
        border-color: var(--border-default, oklch(0% 0 0 / 0.08));
        box-shadow: var(--shadow-sm);
      }
      .home-dashboard-wrap {
        background: var(--bg-surface, oklch(100% 0 0));
        border-color: var(--border-default, oklch(0% 0 0 / 0.08));
        box-shadow: var(--shadow-md, 0 4px 12px oklch(0% 0 0 / 0.08));
      }
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
      { name: 'Avatar', desc: 'User images with fallback initials', path: '/components/avatar', tiers: ['L', 'S', 'P'] },
      { name: 'Divider', desc: 'Visual separation between content', path: '/components/divider', tiers: ['L', 'S', 'P'] },
      { name: 'Skeleton', desc: 'Animated loading placeholders', path: '/components/skeleton', tiers: ['L', 'S', 'P'] },
      { name: 'StatusBadge', desc: 'Operational status with pulse', path: '/components/status-badge', tiers: ['L', 'S', 'P'] },
      { name: 'StatusPulse', desc: 'Animated status dot indicator', path: '/components/status-pulse', tiers: ['L', 'S', 'P'] },
      { name: 'FilterPill', desc: 'Dismissible filter tokens', path: '/components/filter-pill', tiers: ['L', 'S', 'P'] },
      { name: 'EmptyState', desc: 'Zero-data placeholder with CTA', path: '/components/empty-state', tiers: ['L', 'S', 'P'] },
      { name: 'TruncatedText', desc: 'Overflow text with expand toggle', path: '/components/truncated-text', tiers: ['L', 'S', 'P'] },
      { name: 'Typography', desc: 'Semantic text with 11 variants and fluid sizing', path: '/components/typography', tiers: ['L', 'S', 'P'] },
      { name: 'Kbd', desc: 'Keyboard shortcut display', path: '/components/kbd', tiers: ['L', 'S', 'P'] },
      { name: 'Link', desc: 'Styled anchor with hover animations', path: '/components/link', tiers: ['L', 'S', 'P'] },
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
      { name: 'RadioGroup', desc: 'Single selection from a set', path: '/components/radio-group', tiers: ['L', 'S', 'P'] },
      { name: 'ComboBox', desc: 'Filterable dropdown autocomplete', path: '/components/combobox', tiers: ['S', 'P'] },
      { name: 'DatePicker', desc: 'Calendar-based date selection', path: '/components/date-picker', tiers: ['S', 'P'] },
      { name: 'TagInput', desc: 'Multi-value input with tag chips', path: '/components/tag-input', tiers: ['S', 'P'] },
      { name: 'OtpInput', desc: 'One-time password code entry', path: '/components/otp-input', tiers: ['S', 'P'] },
      { name: 'FileUpload', desc: 'Drag-and-drop file uploader', path: '/components/file-upload', tiers: ['S', 'P'] },
      { name: 'ColorInput', desc: 'Color picker with OKLCH support', path: '/components/color-input', tiers: ['S', 'P'] },
      { name: 'SearchInput', desc: 'Search with debounce and clear', path: '/components/search-input', tiers: ['L', 'S', 'P'] },
      { name: 'Rating', desc: 'Star or custom icon rating input', path: '/components/rating', tiers: ['L', 'S', 'P'] },
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
      { name: 'Breadcrumbs', desc: 'Hierarchical navigation trail', path: '/components/breadcrumbs', tiers: ['L', 'S', 'P'] },
      { name: 'Pagination', desc: 'Page navigation controls', path: '/components/pagination', tiers: ['L', 'S', 'P'] },
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
      { name: 'AnimatedCounter', desc: 'Animated number transitions', path: '/components/animated-counter', tiers: ['L', 'S', 'P'] },
      { name: 'NumberTicker', desc: 'Rolling digit counter', path: '/components/number-ticker', tiers: ['S', 'P'] },
      { name: 'ConfidenceBar', desc: 'Multi-segment confidence display', path: '/components/confidence-bar', tiers: ['S', 'P'] },
      { name: 'ThresholdGauge', desc: 'Gauge with colored thresholds', path: '/components/threshold-gauge', tiers: ['S', 'P'] },
      { name: 'UtilizationBar', desc: 'Resource usage visualization', path: '/components/utilization-bar', tiers: ['S', 'P'] },
      { name: 'HeatmapCalendar', desc: 'GitHub-style contribution grid', path: '/components/heatmap-calendar', tiers: ['S', 'P'] },
      { name: 'CopyBlock', desc: 'Syntax-highlighted code block', path: '/components/copy-block', tiers: ['L', 'S', 'P'] },
      { name: 'DiffViewer', desc: 'Side-by-side code diff', path: '/components/diff-viewer', tiers: ['S', 'P'] },
      { name: 'TreeView', desc: 'Collapsible tree structure', path: '/components/tree-view', tiers: ['S', 'P'] },
      { name: 'UpstreamDashboard', desc: 'Service monitoring layout', path: '/components/upstream-dashboard', tiers: ['P'] },
      { name: 'TimeSeriesChart', desc: 'SVG line chart with multi-series and crosshair', path: '/components/time-series-chart', tiers: ['L', 'S', 'P'] },
      { name: 'RingChart', desc: 'Donut chart for resource utilization', path: '/components/ring-chart', tiers: ['L', 'S', 'P'] },
      { name: 'CoreChart', desc: 'CPU core utilization grid', path: '/components/core-chart', tiers: ['L', 'S', 'P'] },
      { name: 'StorageBar', desc: 'Segmented storage usage bar', path: '/components/storage-bar', tiers: ['L', 'S', 'P'] },
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
      { name: 'RackDiagram', desc: 'Data center rack visualization', path: '/components/rack-diagram', tiers: ['L', 'S', 'P'] },
      { name: 'SwitchFaceplate', desc: 'Network switch port grid', path: '/components/switch-faceplate', tiers: ['L', 'S', 'P'] },
      { name: 'DensitySelector', desc: 'Table density toggle control', path: '/components/density-selector', tiers: ['L', 'S', 'P'] },
      { name: 'ColumnVisibilityToggle', desc: 'Column show/hide dropdown', path: '/components/column-visibility-toggle', tiers: ['L', 'S', 'P'] },
      { name: 'CSVExportButton', desc: 'One-click CSV download', path: '/components/csv-export', tiers: ['L', 'S', 'P'] },
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
      { name: 'ViewTransitionLink', desc: 'View Transition API links', path: '/components/view-transition-link', tiers: ['S', 'P'] },
    ],
  },
]

const totalComponents = galleryGroups.reduce((sum, g) => sum + g.items.length, 0)
const premiumCount = galleryGroups.reduce(
  (sum, g) => sum + g.items.filter(i => i.tiers.includes('P')).length,
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

// ─── Tier Badge Variant Map ─────────────────────────────────────────────────

const tierVariant: Record<TierBadge, 'success' | 'info' | 'primary'> = {
  L: 'success',
  S: 'info',
  P: 'primary',
}

const tierStyle: Record<TierBadge, React.CSSProperties> = {
  L: {},
  S: {},
  P: { background: 'oklch(65% 0.18 310 / 0.12)', color: 'oklch(72% 0.18 310)', borderColor: 'oklch(65% 0.18 310 / 0.2)' },
}

// ─── Gallery Card ────────────────────────────────────────────────────────────

function GalleryCard({ item }: { item: GalleryItem }) {
  return (
    <Link to={item.path} className="home-glow-card-link">
      <GlowCard glowColor="oklch(60% 0.15 270 / 0.2)">
        <div className="home-gallery-card-inner">
          <div className="home-gallery-card-top">
            <span className="home-gallery-card-name">{item.name}</span>
            <span className="home-gallery-card-tiers">
              {item.tiers.map(t => (
                <Badge key={t} variant={tierVariant[t]} size="xs" style={tierStyle[t]}>
                  {t}
                </Badge>
              ))}
            </span>
            <span className="home-gallery-card-arrow">
              <Icon name="arrow-right" size={14} />
            </span>
          </div>
          <span className="home-gallery-card-desc">{item.desc}</span>
        </div>
      </GlowCard>
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

        {/* Floating decorative grid behind text */}
        <div className="home-hero-grid" aria-hidden="true">
          {Array.from({ length: 48 }, (_, i) => (
            <div key={i} className="home-hero-grid-cell" />
          ))}
        </div>

        {/* Staggered hero entrance */}
        <div className="home-hero-entrance">
          <Badge variant="primary" size="sm" dot pulse>
            v2.0 -- Aurora Fluid Design System
          </Badge>
        </div>

        <div className="home-hero-entrance" style={{ marginBlockStart: '1.5rem' }}>
          <h1>
            The component library<br />
            that needs nothing else
          </h1>
        </div>

        <div className="home-hero-entrance">
          <p className="home-hero-sub">
            111 components. Physics-based animations. OKLCH color system.
            Aurora Fluid design language. 3 weight tiers. Zero dependencies.
          </p>
        </div>

        <div className="home-hero-entrance">
          <div className="home-hero-actions">
            <Link to="/components/button" style={{ textDecoration: 'none' }}>
              <ShimmerButton size="lg" shimmerColor="oklch(70% 0.2 270)">
                <Icon name="zap" size="sm" />
                Explore Components
              </ShimmerButton>
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
        </div>

        {/* Live component preview strip — eagerly loaded components only */}
        <div className="home-hero-entrance" style={{ marginBlockStart: '2.5rem' }}>
          <div className="home-preview-strip-inner">
            <Button variant="primary" size="md">Primary</Button>
            <Button variant="secondary" size="md">Secondary</Button>
            <Button variant="ghost" size="md">Ghost</Button>
            <Badge variant="success" size="md">Online</Badge>
            <Badge variant="primary" size="md" dot pulse>New</Badge>
            <StatusBadge status="ok" label="Healthy" pulse />
            <StatusBadge status="warning" label="Degraded" />
            <StatusPulse status="ok" size="md" />
            <Progress value={72} size="md" style={{ width: 120 }} />
          </div>
        </div>

        {/* Stats — plain HTML for instant render */}
        <div className="home-hero-entrance">
          <div className="home-stats">
            <div className="home-stat-cell">
              <div className="home-stat-inner">
                <span className="home-stat-value">111</span>
                <span className="home-stat-label">Components</span>
              </div>
            </div>
            <div className="home-stat-cell">
              <div className="home-stat-inner">
                <span className="home-stat-value">109</span>
                <span className="home-stat-label">Premium</span>
              </div>
            </div>
            <div className="home-stat-cell">
              <div className="home-stat-inner">
                <span className="home-stat-value">3</span>
                <span className="home-stat-label">Weight Tiers</span>
              </div>
            </div>
            <div className="home-stat-cell">
              <div className="home-stat-inner">
                <span className="home-stat-value">0</span>
                <span className="home-stat-label">Dependencies</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Component Gallery ── */}
      <Suspense fallback={null}><RevealSection className="home-section">
        <div className="home-section-header">
          <h2>All {totalComponents} Components</h2>
          <p>
            Every component has an interactive demo page. Click any card to explore
            variants, sizes, tiers, and accessibility features.
          </p>
        </div>

        {/* Category filter pills using FilterPill */}
        <div className="home-gallery-filters">
          <FilterPill
            label={`All (${totalComponents})`}
            active={galleryFilter === null}
            onClick={() => setGalleryFilter(null)}
          />
          {galleryGroups.map(g => (
            <FilterPill
              key={g.label}
              label={`${g.label} (${g.items.length})`}
              active={galleryFilter === g.label}
              onClick={() => setGalleryFilter(galleryFilter === g.label ? null : g.label)}
            />
          ))}
        </div>

        {filteredGroups.map(group => (
          <div key={group.label} className="home-gallery-group">
            <Divider label={
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
                <Icon name={group.icon} size={14} />
                {group.label}
                <Badge variant="default" size="xs">{group.items.length}</Badge>
              </span>
            } spacing="lg" />
            <div className="home-gallery-grid" style={{ marginBlockStart: '1rem' }}>
              {group.items.map((item, i) => (
                <StaggerItem key={item.name} index={i}>
                  <GalleryCard item={item} />
                </StaggerItem>
              ))}
            </div>
            <Link to={group.items[0].path} className="home-gallery-view-all">
              View all {group.items.length} {group.label.toLowerCase()} components
              <Icon name="arrow-right" size={14} />
            </Link>
          </div>
        ))}
      </RevealSection></Suspense>

      {/* ── Feature Highlights ── */}
      <Suspense fallback={null}><RevealSection className="home-section">
        <div className="home-section-header">
          <h2>What makes this different</h2>
          <p>
            Every feature designed to eliminate the need for additional packages.
          </p>
        </div>

        <div className="home-features">
          {features.map((f, i) => (
            <StaggerItem key={f.title} index={i}>
              <Card variant="elevated" interactive padding="lg">
                <div className="home-feature-inner">
                  <div className={`home-feature-icon home-feature-icon--${f.color}`}>
                    <Icon name={f.icon} size="md" />
                  </div>
                  <div className="home-feature-title">{f.title}</div>
                  <div className="home-feature-desc">{f.desc}</div>
                </div>
              </Card>
            </StaggerItem>
          ))}
        </div>
      </RevealSection></Suspense>

      {/* ── Getting Started ── */}
      <Suspense fallback={null}><RevealSection className="home-section">
        <div className="home-section-header">
          <h2>Getting Started</h2>
          <p>
            Choose the weight tier that fits your project. Lite ships the smallest bundle.
            Premium unlocks every feature.
          </p>
        </div>

        <div className="home-tiers">
          <StaggerItem index={0}>
            <Card variant="default" padding="lg">
              <div className="home-tier-inner">
                <div className="home-tier-header">
                  <Badge variant="success" size="sm">Lite</Badge>
                  <span className="home-tier-name">Lite</span>
                </div>
                <span className="home-tier-count">Core primitives, forms, basic data display</span>
                <div className="home-tier-features">
                  <span className="home-tier-feature">
                    <span className="home-tier-check"><Icon name="check" size={10} /></span>
                    All primitive components
                  </span>
                  <span className="home-tier-feature">
                    <span className="home-tier-check"><Icon name="check" size={10} /></span>
                    Basic form controls
                  </span>
                  <span className="home-tier-feature">
                    <span className="home-tier-check"><Icon name="check" size={10} /></span>
                    Smallest bundle size
                  </span>
                </div>
                <CopyBlock code="import { Button } from '@annondeveloper/ui-kit/lite'" language="typescript" />
              </div>
            </Card>
          </StaggerItem>

          <StaggerItem index={1}>
            <Card variant="elevated" padding="lg">
              <div className="home-tier-inner">
                <div className="home-tier-header">
                  <Badge variant="info" size="sm">Standard</Badge>
                  <span className="home-tier-name">Standard</span>
                </div>
                <span className="home-tier-count">Everything in Lite plus overlays, navigation, advanced forms</span>
                <div className="home-tier-features">
                  <span className="home-tier-feature">
                    <span className="home-tier-check"><Icon name="check" size={10} /></span>
                    All Lite components
                  </span>
                  <span className="home-tier-feature">
                    <span className="home-tier-check"><Icon name="check" size={10} /></span>
                    Overlays, navigation, AI components
                  </span>
                  <span className="home-tier-feature">
                    <span className="home-tier-check"><Icon name="check" size={10} /></span>
                    Physics-based animations
                  </span>
                </div>
                <CopyBlock code="import { Button } from '@annondeveloper/ui-kit'" language="typescript" />
              </div>
            </Card>
          </StaggerItem>

          <StaggerItem index={2}>
            <BorderBeam duration={6} color="oklch(68% 0.18 310)">
              <div className="home-tier-inner" style={{ padding: '1.75rem' }}>
                <div className="home-tier-header">
                  <Badge variant="primary" size="sm" style={{ background: 'oklch(65% 0.18 310)', color: 'oklch(100% 0 0)' }}>Premium</Badge>
                  <span className="home-tier-name">Premium</span>
                </div>
                <span className="home-tier-count">Full library with monitoring, visual effects, cinematic motion</span>
                <div className="home-tier-features">
                  <span className="home-tier-feature">
                    <span className="home-tier-check"><Icon name="check" size={10} /></span>
                    All Standard components
                  </span>
                  <span className="home-tier-feature">
                    <span className="home-tier-check"><Icon name="check" size={10} /></span>
                    Visual effects, dashboards, geo map
                  </span>
                  <span className="home-tier-feature">
                    <span className="home-tier-check"><Icon name="check" size={10} /></span>
                    Cinematic spring physics
                  </span>
                </div>
                <CopyBlock code="import { Button } from '@annondeveloper/ui-kit/premium'" language="typescript" />
              </div>
            </BorderBeam>
          </StaggerItem>
        </div>
      </RevealSection></Suspense>

      {/* ── Live Dashboard Preview ── */}
      <Suspense fallback={null}><RevealSection className="home-section">
        <div className="home-section-header">
          <h2>Built for real interfaces</h2>
          <p>
            Not toy demos. Production-grade monitoring components rendering live data.
          </p>
        </div>

        <BorderBeam duration={8} color="oklch(65% 0.14 200)">
          <Card variant="default" padding="lg">
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
          </Card>
        </BorderBeam>
      </RevealSection></Suspense>

      {/* ── Code Example ── */}
      <Suspense fallback={null}><RevealSection className="home-section">
        <div className="home-section-header">
          <h2>Simple to use</h2>
          <p>Import what you need. Wrap in UIProvider. Ship.</p>
        </div>

        <div className="home-code-wrap">
          <Card variant="ghost" padding="none">
            <CopyBlock
              code={codeExample}
              language="typescript"
              showLineNumbers
              title="App.tsx"
            />
          </Card>
        </div>
      </RevealSection></Suspense>

      {/* ── Footer ── */}
      <Suspense fallback={null}><Divider spacing="lg" />
      <footer className="home-footer">
        <a href="https://github.com/annondeveloper/ui-kit" target="_blank" rel="noopener noreferrer">
          GitHub
        </a>
        <Divider orientation="vertical" />
        <a href="https://www.npmjs.com/package/@annondeveloper/ui-kit" target="_blank" rel="noopener noreferrer">
          npm
        </a>
        <Divider orientation="vertical" />
        <a href="https://jsr.io/@annondeveloper/ui-kit" target="_blank" rel="noopener noreferrer">
          JSR
        </a>
        <Divider orientation="vertical" />
        <Link to="/docs">Documentation</Link>
        <Divider orientation="vertical" />
        <Badge variant="default" size="sm">v2.0.1</Badge>
        <div className="home-footer-built">
          Built with zero dependencies. Powered by Aurora Fluid design.
        </div>
      </footer></Suspense>
    </div>
  )
}
