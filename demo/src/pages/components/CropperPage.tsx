'use client'

import { useState, useEffect } from 'react'
import { css } from '@ui/core/styles/css-tag'
import { useStyles } from '@ui/core/styles/use-styles'
import { Cropper, type CropResult } from '@ui/domain/cropper'
import { Button } from '@ui/components/button'
import { CopyBlock } from '@ui/domain/copy-block'
import { PropsTable, type PropDef } from '../../components/PropsTable'

// ─── Props ───────────────────────────────────────────────────────────────────

const PROPS: PropDef[] = [
  { name: 'src', type: 'string', required: true, description: 'URL or data URI of the image to crop.' },
  { name: 'aspectRatio', type: 'number', description: 'Fixed aspect ratio (width/height). Omit for free-form cropping.' },
  { name: 'minWidth', type: 'number', description: 'Minimum crop width in pixels.' },
  { name: 'minHeight', type: 'number', description: 'Minimum crop height in pixels.' },
  { name: 'maxWidth', type: 'number', description: 'Maximum crop width in pixels.' },
  { name: 'maxHeight', type: 'number', description: 'Maximum crop height in pixels.' },
  { name: 'onCrop', type: '(result: CropResult) => void', description: 'Called when the crop area changes. Receives { x, y, width, height, rotation, zoom }.' },
  { name: 'showGrid', type: 'boolean', default: 'true', description: 'Show rule-of-thirds grid overlay inside the crop area.' },
  { name: 'showZoom', type: 'boolean', default: 'true', description: 'Show the zoom slider control.' },
  { name: 'showRotate', type: 'boolean', default: 'true', description: 'Show the rotation slider control.' },
  { name: 'rounded', type: 'boolean', default: 'false', description: 'Clip the crop preview as a circle (for avatars).' },
  { name: 'motion', type: '0 | 1 | 2 | 3', description: 'Animation intensity for transitions and handle interactions.' },
]

// ─── Page Styles ─────────────────────────────────────────────────────────────

const pageStyles = css`
  @layer demo {
    @scope (.cropper-page) {
      :scope {
        max-inline-size: min(960px, 100%);
        margin-inline: auto;
        container-type: inline-size;
        display: flex;
        flex-direction: column;
        gap: 2rem;
      }

      .cropper-page__hero {
        position: relative;
        padding: 3rem 2rem;
        border-radius: var(--radius-lg);
        background: var(--bg-elevated);
        border: 1px solid var(--border-default);
        overflow: hidden;
      }

      .cropper-page__hero::before {
        content: '';
        position: absolute;
        inset: -50%;
        background: conic-gradient(
          from 0deg at 50% 50%,
          oklch(60% 0.15 250 / 0.06) 0deg,
          transparent 60deg,
          oklch(55% 0.18 300 / 0.04) 120deg,
          transparent 180deg,
          oklch(60% 0.15 250 / 0.06) 240deg,
          transparent 300deg,
          oklch(55% 0.18 300 / 0.04) 360deg
        );
        animation: aurora-spin 20s linear infinite;
        pointer-events: none;
      }

      @keyframes aurora-spin { to { transform: rotate(360deg); } }
      @media (prefers-reduced-motion: reduce) { .cropper-page__hero::before { animation: none; } }

      .cropper-page__title {
        position: relative;
        font-size: clamp(2rem, 5vw, 3rem);
        font-weight: 800;
        letter-spacing: -0.03em;
        background: linear-gradient(135deg, var(--text-primary) 0%, var(--brand, oklch(65% 0.2 270)) 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
        margin: 0 0 0.5rem;
        line-height: 1.1;
      }

      .cropper-page__desc {
        position: relative;
        color: var(--text-secondary);
        font-size: var(--text-base, 1rem);
        line-height: 1.6;
        margin: 0 0 1.25rem;
        max-inline-size: 60ch;
        text-wrap: pretty;
      }

      .cropper-page__import-row {
        position: relative;
        display: flex;
        align-items: center;
        gap: 0.75rem;
        flex-wrap: wrap;
      }

      .cropper-page__import-code {
        font-family: 'SF Mono', 'Fira Code', 'JetBrains Mono', monospace;
        font-size: var(--text-sm, 0.875rem);
        background: oklch(0% 0 0 / 0.2);
        border: 1px solid var(--border-subtle);
        border-radius: var(--radius-md);
        padding: 0.5rem 0.875rem;
        color: var(--text-primary);
        flex: 1;
        min-inline-size: 0;
        overflow-x: auto;
        white-space: nowrap;
      }

      .cropper-page__section {
        background: oklch(from var(--bg-elevated) calc(l + 0.02) c h);
        border: 1px solid var(--border-default);
        border-radius: var(--radius-lg);
        padding: 2rem;
        overflow: visible;
        position: relative;
        box-shadow: inset 0 1px 0 oklch(100% 0 0 / 0.04), 0 2px 8px oklch(0% 0 0 / 0.15);
        opacity: 0;
        transform: translateY(32px) scale(0.98);
        filter: blur(4px);
        animation: section-reveal 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        animation-timeline: view();
        animation-range: entry 0% entry 40%;
      }

      @keyframes section-reveal {
        from { opacity: 0; transform: translateY(32px) scale(0.98); filter: blur(4px); }
        to   { opacity: 1; transform: translateY(0) scale(1); filter: blur(0); }
      }

      @supports not (animation-timeline: view()) {
        .cropper-page__section { opacity: 1; transform: none; filter: none; animation: none; }
      }

      .cropper-page__section-title {
        font-size: 1.125rem;
        font-weight: 700;
        color: var(--text-primary);
        margin: 0 0 0.375rem;
        padding-inline-start: 0.625rem;
        border-inline-start: 3px solid var(--brand, oklch(65% 0.2 270));
        line-height: 1.3;
      }
      .cropper-page__section-title a { color: inherit; text-decoration: none; }
      .cropper-page__section-title a:hover { text-decoration: underline; text-underline-offset: 0.2em; }

      .cropper-page__section-desc {
        color: var(--text-secondary);
        font-size: var(--text-sm, 0.875rem);
        line-height: 1.6;
        margin: 0 0 1.5rem;
        text-wrap: pretty;
      }

      .cropper-page__preview {
        padding: 1.5rem;
        border-radius: var(--radius-md);
        background: var(--bg-base);
        position: relative;
        overflow: visible;
        z-index: 1;
      }

      .cropper-page__preview::before {
        content: '';
        position: absolute;
        inset: 0;
        background-image: radial-gradient(oklch(100% 0 0 / 0.03) 1px, transparent 1px);
        background-size: 24px 24px;
        pointer-events: none;
      }

      .cropper-page__result {
        margin-block-start: 1rem;
        padding: 0.75rem 1rem;
        border-radius: var(--radius-sm);
        background: oklch(0% 0 0 / 0.15);
        font-family: 'SF Mono', 'Fira Code', 'JetBrains Mono', monospace;
        font-size: var(--text-xs, 0.75rem);
        color: var(--text-secondary);
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
        gap: 0.5rem;
      }

      .cropper-page__result-item {
        display: flex;
        flex-direction: column;
        gap: 0.125rem;
      }

      .cropper-page__result-label {
        font-size: 0.625rem;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        color: var(--text-tertiary);
        font-weight: 600;
      }

      .cropper-page__ratio-btns {
        display: flex;
        gap: 0.5rem;
        flex-wrap: wrap;
        margin-block-end: 1rem;
      }
    }
  }
`

const IMPORT_STR = "import { Cropper, type CropResult } from '@ui/domain/cropper'"

// A placeholder SVG image encoded as a data URI
const SAMPLE_IMAGE = 'data:image/svg+xml,' + encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600" viewBox="0 0 800 600">
    <rect width="800" height="600" fill="#1a1a2e"/>
    <circle cx="200" cy="180" r="80" fill="#e94560" opacity="0.8"/>
    <circle cx="400" cy="300" r="120" fill="#0f3460" opacity="0.7"/>
    <circle cx="600" cy="200" r="60" fill="#533483" opacity="0.6"/>
    <rect x="100" y="400" width="600" height="120" rx="12" fill="#16213e" opacity="0.5"/>
    <text x="400" y="470" text-anchor="middle" fill="#e0e0e0" font-size="24" font-family="system-ui">Sample Image</text>
  </svg>`
)

// ─── Component ───────────────────────────────────────────────────────────────

export default function CropperPage() {
  useStyles('cropper-page', pageStyles)

  const [cropResult, setCropResult] = useState<CropResult | null>(null)
  const [aspectRatio, setAspectRatio] = useState<number | undefined>(undefined)

  const RATIOS: { label: string; value: number | undefined }[] = [
    { label: 'Free', value: undefined },
    { label: '1:1', value: 1 },
    { label: '16:9', value: 16 / 9 },
    { label: '4:3', value: 4 / 3 },
    { label: '3:2', value: 3 / 2 },
  ]

  useEffect(() => {
    const sections = document.querySelectorAll('.cropper-page__section')
    if (!sections.length) return
    if (CSS.supports?.('animation-timeline', 'view()')) return
    const observer = new IntersectionObserver(
      (entries) => entries.forEach(e => {
        if (e.isIntersecting) {
          const el = e.target as HTMLElement
          el.style.opacity = '1'; el.style.transform = 'translateY(0) scale(1)'; el.style.filter = 'blur(0)'
          observer.unobserve(el)
        }
      }),
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    )
    sections.forEach(s => {
      const el = s as HTMLElement
      el.style.opacity = '0'; el.style.transform = 'translateY(32px) scale(0.98)'; el.style.filter = 'blur(4px)'
      el.style.transition = 'opacity 0.6s cubic-bezier(0.16,1,0.3,1), transform 0.6s cubic-bezier(0.16,1,0.3,1), filter 0.6s cubic-bezier(0.16,1,0.3,1)'
      observer.observe(el)
    })
    return () => observer.disconnect()
  }, [])

  return (
    <div className="cropper-page">
      {/* ── Hero ──────────────────────────────────────── */}
      <div className="cropper-page__hero">
        <h1 className="cropper-page__title">Cropper</h1>
        <p className="cropper-page__desc">
          Interactive image cropper with drag-to-select, resize handles, zoom and rotation controls,
          and optional aspect ratio locking. Ideal for avatar uploads and media editing.
        </p>
        <div className="cropper-page__import-row">
          <code className="cropper-page__import-code">{IMPORT_STR}</code>
          <CopyBlock code={IMPORT_STR} language="typescript" />
        </div>
      </div>

      {/* ── 1. Free Crop with Aspect Ratio ────────────── */}
      <section className="cropper-page__section" id="basic">
        <h2 className="cropper-page__section-title"><a href="#basic">Crop with Aspect Ratio</a></h2>
        <p className="cropper-page__section-desc">
          Drag the handles to adjust the crop area. Toggle between free-form and fixed aspect ratios.
          The zoom and rotation sliders provide fine-grained control.
        </p>
        <div className="cropper-page__ratio-btns">
          {RATIOS.map(r => (
            <Button
              key={r.label}
              size="sm"
              variant={aspectRatio === r.value ? 'primary' : 'outline'}
              onClick={() => setAspectRatio(r.value)}
            >
              {r.label}
            </Button>
          ))}
        </div>
        <div className="cropper-page__preview">
          <Cropper
            src={SAMPLE_IMAGE}
            aspectRatio={aspectRatio}
            onCrop={setCropResult}
            showGrid
            showZoom
            showRotate
          />
          {cropResult && (
            <div className="cropper-page__result">
              <div className="cropper-page__result-item">
                <span className="cropper-page__result-label">X</span>
                <span>{Math.round(cropResult.x)}px</span>
              </div>
              <div className="cropper-page__result-item">
                <span className="cropper-page__result-label">Y</span>
                <span>{Math.round(cropResult.y)}px</span>
              </div>
              <div className="cropper-page__result-item">
                <span className="cropper-page__result-label">Width</span>
                <span>{Math.round(cropResult.width)}px</span>
              </div>
              <div className="cropper-page__result-item">
                <span className="cropper-page__result-label">Height</span>
                <span>{Math.round(cropResult.height)}px</span>
              </div>
              <div className="cropper-page__result-item">
                <span className="cropper-page__result-label">Rotation</span>
                <span>{Math.round(cropResult.rotation)}&deg;</span>
              </div>
              <div className="cropper-page__result-item">
                <span className="cropper-page__result-label">Zoom</span>
                <span>{cropResult.zoom.toFixed(2)}x</span>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ── 2. Avatar (Rounded) ───────────────────────── */}
      <section className="cropper-page__section" id="avatar">
        <h2 className="cropper-page__section-title"><a href="#avatar">Avatar Mode</a></h2>
        <p className="cropper-page__section-desc">
          Enable <code>rounded</code> for a circular crop preview, perfect for profile picture uploads.
          Combined with a 1:1 aspect ratio for consistent output.
        </p>
        <div className="cropper-page__preview">
          <Cropper
            src={SAMPLE_IMAGE}
            aspectRatio={1}
            rounded
            showZoom
            showRotate={false}
            showGrid={false}
          />
        </div>
      </section>

      {/* ── Props ─────────────────────────────────────── */}
      <section className="cropper-page__section" id="props">
        <h2 className="cropper-page__section-title"><a href="#props">Props</a></h2>
        <PropsTable props={PROPS} />
      </section>
    </div>
  )
}
