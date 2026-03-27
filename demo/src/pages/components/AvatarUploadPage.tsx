'use client'

import { useState, useEffect } from 'react'
import { css } from '@ui/core/styles/css-tag'
import { useStyles } from '@ui/core/styles/use-styles'
import { AvatarUpload } from '@ui/components/avatar-upload'
import { Card } from '@ui/components/card'
import { PropsTable, type PropDef } from '../../components/PropsTable'

// ─── Styles ──────────────────────────────────────────────────────────────────

const pageStyles = css`
  @layer demo {
    @scope (.avatar-upload-page) {
      :scope {
        max-inline-size: min(960px, 100%);
        margin-inline: auto;
        container-type: inline-size;
        container-name: avatar-upload-page;
        display: flex;
        flex-direction: column;
        gap: 2rem;
      }

      .avatar-upload-page__hero {
        position: relative;
        padding: 3rem 2rem;
        border-radius: var(--radius-lg);
        background: var(--bg-elevated);
        border: 1px solid var(--border-default);
        overflow: hidden;
      }

      .avatar-upload-page__hero::before {
        content: '';
        position: absolute;
        inset: -50%;
        background: conic-gradient(
          from 0deg at 50% 50%,
          var(--aurora-1, oklch(60% 0.15 250 / 0.06)) 0deg,
          transparent 60deg,
          var(--aurora-2, oklch(55% 0.18 300 / 0.04)) 120deg,
          transparent 180deg,
          var(--aurora-1, oklch(60% 0.15 250 / 0.06)) 240deg,
          transparent 300deg,
          var(--aurora-2, oklch(55% 0.18 300 / 0.04)) 360deg
        );
        animation: aurora-spin-au 20s linear infinite;
        pointer-events: none;
      }

      @keyframes aurora-spin-au {
        to { transform: rotate(360deg); }
      }

      @media (prefers-reduced-motion: reduce) {
        .avatar-upload-page__hero::before { animation: none; }
      }

      .avatar-upload-page__title {
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

      .avatar-upload-page__desc {
        position: relative;
        color: var(--text-secondary);
        font-size: var(--text-base, 1rem);
        line-height: 1.6;
        margin: 0 0 1.25rem;
        max-inline-size: 60ch;
        text-wrap: pretty;
      }

      .avatar-upload-page__import-row {
        position: relative;
        display: flex;
        align-items: center;
        gap: 0.75rem;
        flex-wrap: wrap;
      }

      .avatar-upload-page__import-code {
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

      .avatar-upload-page__section {
        background: oklch(from var(--bg-elevated) calc(l + 0.02) c h);
        border: 1px solid var(--border-default);
        border-radius: var(--radius-lg);
        padding: 2rem;
        overflow: visible;
        position: relative;
        opacity: 0;
        transform: translateY(32px) scale(0.98);
        filter: blur(4px);
        animation: section-reveal-au 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        animation-timeline: view();
        animation-range: entry 0% entry 40%;
      }

      @keyframes section-reveal-au {
        from { opacity: 0; transform: translateY(32px) scale(0.98); filter: blur(4px); }
        to { opacity: 1; transform: translateY(0) scale(1); filter: blur(0); }
      }

      @supports not (animation-timeline: view()) {
        .avatar-upload-page__section {
          opacity: 1;
          transform: none;
          filter: none;
          animation: none;
        }
      }

      .avatar-upload-page__section-title {
        font-size: 1.125rem;
        font-weight: 700;
        color: var(--text-primary);
        margin: 0 0 0.375rem;
        padding-inline-start: 0.625rem;
        border-inline-start: 3px solid var(--brand, oklch(65% 0.2 270));
        line-height: 1.3;
      }

      .avatar-upload-page__section-title a { color: inherit; text-decoration: none; }
      .avatar-upload-page__section-title a:hover { text-decoration: underline; text-underline-offset: 0.2em; }

      .avatar-upload-page__section-desc {
        color: var(--text-secondary);
        font-size: var(--text-sm, 0.875rem);
        line-height: 1.6;
        margin: 0 0 1.5rem;
        text-wrap: pretty;
      }

      .avatar-upload-page__preview {
        padding: 2.5rem;
        border-radius: var(--radius-md);
        background: var(--bg-base);
        position: relative;
        overflow: hidden;
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        justify-content: center;
        gap: 2rem;
        min-block-size: 80px;
      }

      .avatar-upload-page__preview::before {
        content: '';
        position: absolute;
        inset: 0;
        background-image: radial-gradient(oklch(100% 0 0 / 0.03) 1px, transparent 1px);
        background-size: 24px 24px;
        pointer-events: none;
      }

      .avatar-upload-page__labeled {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 0.75rem;
      }

      .avatar-upload-page__label {
        font-size: var(--text-xs, 0.75rem);
        color: var(--text-tertiary);
        font-family: 'SF Mono', 'Fira Code', 'JetBrains Mono', monospace;
      }
    }
  }
`

// ─── Data ────────────────────────────────────────────────────────────────────

const IMPORT_STR = "import { AvatarUpload } from '@ui/components/avatar-upload'"

const propsData: PropDef[] = [
  { name: 'value', type: 'string | null', description: 'Current image URL or data URI for the preview.' },
  { name: 'onChange', type: '(file: File | null) => void', description: 'Callback when a file is selected or cleared.' },
  { name: 'size', type: "'sm' | 'md' | 'lg' | 'xl'", default: "'lg'", description: 'Size of the upload area and preview.' },
  { name: 'shape', type: "'circle' | 'square'", default: "'circle'", description: 'Shape of the avatar preview.' },
  { name: 'accept', type: 'string', default: "'image/*'", description: 'Accepted file MIME types.' },
  { name: 'maxSize', type: 'number', default: '5242880', description: 'Maximum file size in bytes (default 5MB).' },
  { name: 'placeholder', type: 'ReactNode', description: 'Custom placeholder content when no image is set.' },
  { name: 'disabled', type: 'boolean', default: 'false', description: 'Disable the upload interaction.' },
  { name: 'onError', type: '(error: string) => void', description: 'Callback when a validation error occurs (file too large, wrong type).' },
  { name: 'className', type: 'string', description: 'Additional CSS class for the root element.' },
]

// ─── Component ───────────────────────────────────────────────────────────────

export default function AvatarUploadPage() {
  useStyles('avatar-upload-page', pageStyles)

  const [avatar1, setAvatar1] = useState<string | null>(null)
  const [avatar2, setAvatar2] = useState<string | null>(null)

  const handleFileChange = (setter: (v: string | null) => void) => (file: File | null) => {
    if (!file) { setter(null); return }
    const reader = new FileReader()
    reader.onload = () => setter(reader.result as string)
    reader.readAsDataURL(file)
  }

  useEffect(() => {
    const sections = document.querySelectorAll('.avatar-upload-page__section')
    if (!sections.length) return
    if (CSS.supports?.('animation-timeline', 'view()')) return
    const observer = new IntersectionObserver(
      (entries) => { entries.forEach(entry => { if (entry.isIntersecting) { ;(entry.target as HTMLElement).style.opacity = '1'; ;(entry.target as HTMLElement).style.transform = 'translateY(0) scale(1)'; ;(entry.target as HTMLElement).style.filter = 'blur(0)'; observer.unobserve(entry.target) } }) },
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    )
    sections.forEach(section => { ;(section as HTMLElement).style.opacity = '0'; ;(section as HTMLElement).style.transform = 'translateY(32px) scale(0.98)'; ;(section as HTMLElement).style.filter = 'blur(4px)'; ;(section as HTMLElement).style.transition = 'opacity 0.6s cubic-bezier(0.16, 1, 0.3, 1), transform 0.6s cubic-bezier(0.16, 1, 0.3, 1), filter 0.6s cubic-bezier(0.16, 1, 0.3, 1)'; observer.observe(section) })
    return () => observer.disconnect()
  }, [])

  return (
    <div className="avatar-upload-page">
      {/* ── Hero ──────────────────────────────────── */}
      <div className="avatar-upload-page__hero">
        <h1 className="avatar-upload-page__title">AvatarUpload</h1>
        <p className="avatar-upload-page__desc">
          Image upload component with circular or square preview, drag-and-drop support,
          file validation, and instant preview via FileReader.
        </p>
        <div className="avatar-upload-page__import-row">
          <code className="avatar-upload-page__import-code">{IMPORT_STR}</code>
        </div>
      </div>

      {/* ── Basic Upload ──────────────────────────── */}
      <section className="avatar-upload-page__section" id="basic">
        <h2 className="avatar-upload-page__section-title"><a href="#basic">Basic Upload</a></h2>
        <p className="avatar-upload-page__section-desc">
          Click to select an image or drag and drop a file. The preview updates instantly.
        </p>
        <div className="avatar-upload-page__preview">
          <AvatarUpload value={avatar1} onChange={handleFileChange(setAvatar1)} />
        </div>
      </section>

      {/* ── Sizes & Shapes ────────────────────────── */}
      <section className="avatar-upload-page__section" id="sizes-shapes">
        <h2 className="avatar-upload-page__section-title"><a href="#sizes-shapes">Sizes &amp; Shapes</a></h2>
        <p className="avatar-upload-page__section-desc">
          Available in four sizes and two shapes. Mix circle and square avatars for profile and branding use cases.
        </p>
        <div className="avatar-upload-page__preview">
          {(['sm', 'md', 'lg', 'xl'] as const).map(size => (
            <div key={size} className="avatar-upload-page__labeled">
              <AvatarUpload value={null} onChange={() => {}} size={size} />
              <span className="avatar-upload-page__label">{size}</span>
            </div>
          ))}
        </div>
        <div className="avatar-upload-page__preview" style={{ marginBlockStart: '1rem' }}>
          <div className="avatar-upload-page__labeled">
            <AvatarUpload value={avatar2} onChange={handleFileChange(setAvatar2)} shape="circle" />
            <span className="avatar-upload-page__label">circle</span>
          </div>
          <div className="avatar-upload-page__labeled">
            <AvatarUpload value={avatar2} onChange={handleFileChange(setAvatar2)} shape="square" />
            <span className="avatar-upload-page__label">square</span>
          </div>
        </div>
      </section>

      {/* ── Disabled ──────────────────────────────── */}
      <section className="avatar-upload-page__section" id="disabled">
        <h2 className="avatar-upload-page__section-title"><a href="#disabled">Disabled State</a></h2>
        <p className="avatar-upload-page__section-desc">
          When disabled, the upload area shows a muted appearance and does not accept interactions.
        </p>
        <div className="avatar-upload-page__preview">
          <AvatarUpload value={null} onChange={() => {}} disabled />
        </div>
      </section>

      {/* ── Props ─────────────────────────────────── */}
      <section className="avatar-upload-page__section" id="props">
        <h2 className="avatar-upload-page__section-title"><a href="#props">Props API</a></h2>
        <p className="avatar-upload-page__section-desc">
          All props accepted by the AvatarUpload component.
        </p>
        <Card variant="default" padding="md">
          <PropsTable props={propsData} />
        </Card>
      </section>
    </div>
  )
}
