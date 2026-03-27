'use client'

import { useState, useMemo, useCallback, useRef, useEffect } from 'react'
import { css } from '@ui/core/styles/css-tag'
import { useStyles } from '@ui/core/styles/use-styles'
import { FileUpload } from '@ui/components/file-upload'
import { FileUpload as LiteFileUpload } from '@ui/lite/file-upload'
import { Button } from '@ui/components/button'
import { Card } from '@ui/components/card'
import { CopyBlock } from '@ui/domain/copy-block'
import { Tabs, TabPanel } from '@ui/components/tabs'
import { Icon } from '@ui/core/icons/icon'
import { PropsTable, type PropDef } from '../../components/PropsTable'
import { useTier, type Tier } from '../../App'

// ─── Page Styles ──────────────────────────────────────────────────────────────

const pageStyles = css`
  @layer demo {
    @scope (.file-upload-page) {
      :scope {
        max-inline-size: min(960px, 100%);
        margin-inline: auto;
        container-type: inline-size;
        container-name: file-upload-page;
        display: flex;
        flex-direction: column;
        gap: 2rem;
      }

      /* ── Hero header ────────────────────────────────── */

      .file-upload-page__hero {
        position: relative;
        padding: 3rem 2rem;
        border-radius: var(--radius-lg);
        background: var(--bg-elevated);
        border: 1px solid var(--border-default);
        overflow: hidden;
      }

      .file-upload-page__hero::before {
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
        animation: file-upload-aurora-spin 20s linear infinite;
        pointer-events: none;
      }

      @keyframes file-upload-aurora-spin {
        to { transform: rotate(360deg); }
      }

      @media (prefers-reduced-motion: reduce) {
        .file-upload-page__hero::before { animation: none; }
      }

      .file-upload-page__title {
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

      .file-upload-page__desc {
        position: relative;
        color: var(--text-secondary);
        font-size: var(--text-base, 1rem);
        line-height: 1.6;
        margin: 0 0 1.25rem;
        max-inline-size: 60ch;
        text-wrap: pretty;
      }

      .file-upload-page__import-row {
        position: relative;
        display: flex;
        align-items: center;
        gap: 0.75rem;
        flex-wrap: wrap;
      }

      .file-upload-page__import-code {
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
        backdrop-filter: blur(8px);
        box-shadow: inset 0 1px 0 oklch(100% 0 0 / 0.03);
      }

      .file-upload-page__copy-btn {
        font-size: var(--text-xs, 0.75rem);
        flex-shrink: 0;
      }

      /* ── Sections ───────────────────────────────────── */

      .file-upload-page__section {
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
        animation: file-upload-section-reveal 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        animation-timeline: view();
        animation-range: entry 0% entry 40%;
      }

      @keyframes file-upload-section-reveal {
        from {
          opacity: 0;
          transform: translateY(32px) scale(0.98);
          filter: blur(4px);
        }
        to {
          opacity: 1;
          transform: translateY(0) scale(1);
          filter: blur(0);
        }
      }

      @supports not (animation-timeline: view()) {
        .file-upload-page__section {
          opacity: 0;
          transform: translateY(32px) scale(0.98);
          filter: blur(4px);
          animation: none;
        }
      }

      .file-upload-page__section-title {
        font-size: 1.125rem;
        font-weight: 700;
        color: var(--text-primary);
        margin: 0 0 0.375rem;
        padding-inline-start: 0.625rem;
        border-inline-start: 3px solid var(--brand, oklch(65% 0.2 270));
        line-height: 1.3;
        scroll-margin-block-start: 2rem;
      }

      .file-upload-page__section-title a {
        color: inherit;
        text-decoration: none;
      }
      .file-upload-page__section-title a:hover {
        text-decoration: underline;
        text-underline-offset: 0.2em;
      }

      .file-upload-page__section-desc {
        color: var(--text-secondary);
        font-size: var(--text-sm, 0.875rem);
        line-height: 1.6;
        margin: 0 0 1.5rem;
        text-wrap: pretty;
      }

      /* ── Preview box ────────────────────────────────── */

      .file-upload-page__preview {
        padding: 2.5rem;
        border-radius: var(--radius-md);
        background: var(--bg-base);
        position: relative;
        overflow: hidden;
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        justify-content: center;
        gap: 1.25rem;
        min-block-size: 80px;
      }

      .file-upload-page__preview::before {
        content: '';
        position: absolute;
        inset: 0;
        background-image: radial-gradient(oklch(100% 0 0 / 0.03) 1px, transparent 1px);
        background-size: 24px 24px;
        pointer-events: none;
      }

      .file-upload-page__preview--col {
        flex-direction: column;
        align-items: stretch;
      }

      /* ── Playground ─────────────────────────────────── */

      .file-upload-page__playground {
        display: grid;
        grid-template-columns: 1fr 320px;
        gap: 1.5rem;
        align-items: start;
      }

      @media (max-width: 768px) {
        .file-upload-page__playground {
          grid-template-columns: 1fr;
        }
        .file-upload-page__playground-controls {
          position: static !important;
        }
      }

      @container file-upload-page (max-width: 680px) {
        .file-upload-page__playground {
          grid-template-columns: 1fr;
        }
        .file-upload-page__playground-controls {
          position: static !important;
        }
      }

      .file-upload-page__playground-preview {
        min-inline-size: 0;
        display: flex;
        flex-direction: column;
        gap: 1.5rem;
      }

      .file-upload-page__playground-result {
        overflow-x: auto;
        min-block-size: 200px;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 2rem;
        background: var(--bg-base);
        border-radius: var(--radius-md);
        position: relative;
        overflow: hidden;
      }

      .file-upload-page__playground-result::before {
        content: '';
        position: absolute;
        inset: 0;
        background-image: radial-gradient(oklch(100% 0 0 / 0.03) 1px, transparent 1px);
        background-size: 24px 24px;
        pointer-events: none;
      }

      .file-upload-page__playground-result::after {
        content: '';
        position: absolute;
        inset: 0;
        background: radial-gradient(ellipse at center, var(--aurora-1, oklch(60% 0.15 250 / 0.04)) 0%, transparent 70%);
        pointer-events: none;
      }

      .file-upload-page__playground-controls {
        background: var(--bg-surface);
        border: 1px solid var(--border-subtle);
        border-radius: var(--radius-md);
        padding: 1.25rem;
        display: flex;
        flex-direction: column;
        gap: 1rem;
        position: sticky;
        top: 1rem;
      }

      .file-upload-page__control-group {
        display: flex;
        flex-direction: column;
        gap: 0.375rem;
      }

      .file-upload-page__control-label {
        font-size: var(--text-xs, 0.75rem);
        font-weight: 600;
        color: var(--text-tertiary);
        text-transform: uppercase;
        letter-spacing: 0.05em;
      }

      .file-upload-page__control-options {
        display: flex;
        flex-wrap: wrap;
        gap: 0.375rem;
      }

      .file-upload-page__option-btn {
        font-size: var(--text-xs, 0.75rem);
        padding: 0.25rem 0.625rem;
        border: 1px solid var(--border-default);
        border-radius: var(--radius-sm);
        background: transparent;
        color: var(--text-secondary);
        cursor: pointer;
        font-family: inherit;
        font-weight: 500;
        transition: all 0.12s;
        line-height: 1.4;
      }
      .file-upload-page__option-btn:hover {
        border-color: var(--border-strong);
        color: var(--text-primary);
      }
      .file-upload-page__option-btn--active {
        background: var(--brand);
        color: oklch(100% 0 0);
        border-color: var(--brand);
        box-shadow: 0 0 0 3px var(--brand-subtle);
      }

      .file-upload-page__toggle-label {
        font-size: var(--text-sm, 0.875rem);
        color: var(--text-secondary);
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 0.375rem;
      }

      .file-upload-page__text-input {
        font-size: var(--text-sm, 0.875rem);
        padding: 0.375rem 0.625rem;
        border: 1px solid var(--border-default);
        border-radius: var(--radius-sm);
        background: transparent;
        color: var(--text-primary);
        font-family: inherit;
        inline-size: 100%;
      }
      .file-upload-page__text-input:focus {
        outline: 2px solid var(--brand);
        outline-offset: 1px;
        border-color: transparent;
        box-shadow: 0 0 0 4px var(--brand-subtle);
      }

      /* ── Labeled row ────────────────────────────────── */

      .file-upload-page__labeled-row {
        display: flex;
        flex-wrap: wrap;
        gap: 1.5rem;
        align-items: flex-start;
      }

      .file-upload-page__labeled-item {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 0.75rem;
        flex: 1;
        min-inline-size: 240px;
      }

      .file-upload-page__item-label {
        font-size: 0.6875rem;
        color: var(--text-tertiary);
        font-family: 'SF Mono', 'Fira Code', 'JetBrains Mono', monospace;
        text-transform: lowercase;
        letter-spacing: 0.03em;
      }

      /* ── File log ──────────────────────────────────── */

      .file-upload-page__file-log {
        margin-block-start: 1rem;
        padding: 0.75rem 1rem;
        background: oklch(0% 0 0 / 0.15);
        border-radius: var(--radius-md);
        font-family: 'SF Mono', 'Fira Code', 'JetBrains Mono', monospace;
        font-size: var(--text-xs, 0.75rem);
        color: var(--text-tertiary);
        line-height: 1.5;
        max-block-size: 120px;
        overflow-y: auto;
      }

      /* ── Weight Tier Cards ──────────────────────────── */

      .file-upload-page__tiers {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 1rem;
      }

      .file-upload-page__tier-card {
        background: var(--bg-surface);
        border: 1px solid var(--border-subtle);
        border-radius: var(--radius-md);
        padding: 1.5rem;
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
        cursor: pointer;
        transition: border-color 0.2s, box-shadow 0.2s, transform 0.2s;
        min-width: 0;
        overflow: hidden;
      }

      .file-upload-page__tier-card:hover {
        border-color: var(--border-strong);
        transform: translateY(-2px);
        box-shadow: 0 4px 16px oklch(0% 0 0 / 0.2);
      }

      .file-upload-page__tier-card--active {
        border-color: var(--brand);
        box-shadow: 0 0 0 1px var(--brand), 0 0 20px oklch(from var(--brand) l c h / 0.12);
        background: oklch(from var(--bg-surface) calc(l + 0.02) c h);
      }

      .file-upload-page__tier-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
      }

      .file-upload-page__tier-name {
        font-size: var(--text-sm, 0.875rem);
        font-weight: 700;
        color: var(--text-primary);
      }

      .file-upload-page__tier-size {
        font-size: var(--text-xs, 0.75rem);
        color: var(--text-tertiary);
        font-family: 'SF Mono', 'Fira Code', 'JetBrains Mono', monospace;
      }

      .file-upload-page__tier-desc {
        font-size: var(--text-xs, 0.75rem);
        color: var(--text-secondary);
        line-height: 1.5;
        text-align: start;
      }

      .file-upload-page__tier-import {
        font-family: 'SF Mono', 'Fira Code', 'JetBrains Mono', monospace;
        font-size: 0.625rem;
        color: oklch(from var(--brand) calc(l + 0.1) c h);
        background: var(--border-subtle);
        padding: 0.375rem 0.5rem;
        border-radius: var(--radius-sm);
        overflow-wrap: break-word;
        word-break: break-all;
        text-align: start;
        line-height: 1.4;
      }

      .file-upload-page__tier-preview {
        display: flex;
        justify-content: center;
        padding-block-start: 0.5rem;
      }

      .file-upload-page__size-breakdown {
        display: flex;
        flex-direction: column;
        gap: 0.25rem;
        font-size: 0.75rem;
        color: var(--text-tertiary);
      }

      .file-upload-page__size-row {
        display: flex;
        align-items: center;
        gap: 0.5rem;
      }

      /* ── Code tabs ─────────────────────────────────── */

      .file-upload-page__code-tabs {
        margin-block-start: 1rem;
      }

      .file-upload-page__export-row {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        margin-block-start: 0.75rem;
      }

      .file-upload-page__export-status {
        font-size: var(--text-xs, 0.75rem);
        color: var(--text-tertiary);
        font-style: italic;
      }

      /* ── A11y list ──────────────────────────────────── */

      .file-upload-page__a11y-list {
        list-style: none;
        margin: 0;
        padding: 0;
        display: flex;
        flex-direction: column;
        gap: 0.625rem;
      }

      .file-upload-page__a11y-item {
        display: flex;
        align-items: flex-start;
        gap: 0.5rem;
        font-size: var(--text-sm, 0.875rem);
        color: var(--text-secondary);
        line-height: 1.5;
      }

      .file-upload-page__a11y-icon {
        color: var(--brand);
        flex-shrink: 0;
        margin-block-start: 0.125rem;
      }

      .file-upload-page__a11y-key {
        font-family: 'SF Mono', 'Fira Code', 'JetBrains Mono', monospace;
        font-size: var(--text-xs, 0.75rem);
        background: var(--border-subtle);
        padding: 0.125rem 0.375rem;
        border-radius: var(--radius-sm);
        border: 1px solid var(--border-subtle);
        color: var(--text-primary);
      }

      /* ── Responsive ──────────────────────────────── */

      @media (max-width: 768px) {
        .file-upload-page__hero {
          padding: 2rem 1.25rem;
        }

        .file-upload-page__title {
          font-size: 1.75rem;
        }

        .file-upload-page__preview {
          padding: 1.75rem;
        }

        .file-upload-page__playground {
          grid-template-columns: 1fr;
        }

        .file-upload-page__playground-result {
          padding: 1.5rem;
          min-block-size: 150px;
        }

        .file-upload-page__tiers {
          grid-template-columns: 1fr;
        }

        .file-upload-page__section {
          padding: 1.25rem;
        }
      }

      @media (max-width: 400px) {
        .file-upload-page__hero {
          padding: 1.5rem 1rem;
        }

        .file-upload-page__title {
          font-size: 1.5rem;
        }

        .file-upload-page__preview {
          padding: 1rem;
        }
      }

      @media (min-width: 3000px) {
        :scope {
          max-inline-size: 1400px;
        }

        .file-upload-page__title {
          font-size: 4rem;
        }

        .file-upload-page__preview {
          padding: 3.5rem;
        }
      }

      .file-upload-page__import-code,
      .file-upload-page code,
      pre {
        overflow-x: auto;
        scrollbar-width: thin;
        scrollbar-color: var(--border-default) transparent;
        max-inline-size: 100%;
      }

      :scope ::-webkit-scrollbar {
        width: 4px;
        height: 4px;
      }
      :scope ::-webkit-scrollbar-track {
        background: transparent;
      }
      :scope ::-webkit-scrollbar-thumb {
        background: var(--border-default);
        border-radius: 2px;
      }
      :scope ::-webkit-scrollbar-thumb:hover {
        background: var(--border-strong);
      }
    }
  }
`

// ─── Props Data ───────────────────────────────────────────────────────────────

const fileUploadProps: PropDef[] = [
  { name: 'name', type: 'string', required: true, description: 'The name attribute for the hidden file input.' },
  { name: 'accept', type: 'string', description: 'Comma-separated list of accepted file types (e.g., "image/*,.pdf").' },
  { name: 'multiple', type: 'boolean', default: 'false', description: 'When true, allows selecting multiple files at once.' },
  { name: 'maxSize', type: 'number', description: 'Maximum file size in bytes. Files exceeding this trigger onError.' },
  { name: 'maxFiles', type: 'number', description: 'Maximum number of files allowed when multiple is true.' },
  { name: 'onChange', type: '(files: File[]) => void', description: 'Callback fired with the selected files after validation.' },
  { name: 'onError', type: '(error: string) => void', description: 'Callback fired when validation fails (wrong type, too large, etc.).' },
  { name: 'label', type: 'ReactNode', description: 'Label text displayed above the dropzone.' },
  { name: 'description', type: 'string', description: 'Custom description text inside the dropzone area.' },
  { name: 'error', type: 'string', description: 'External error message displayed below the dropzone.' },
  { name: 'disabled', type: 'boolean', default: 'false', description: 'Disables the entire file upload component.' },
  { name: 'showPreview', type: 'boolean', default: 'true', description: 'When true, shows image thumbnails and file icons for selected files.' },
  { name: 'motion', type: '0 | 1 | 2 | 3', description: 'Animation intensity override. Cascades from OS > prop > CSS --motion > UIProvider.' },
  { name: 'className', type: 'string', description: 'Additional CSS class name for the root wrapper.' },
]

// ─── Helpers ──────────────────────────────────────────────────────────────────

type AcceptType = 'any' | 'images' | 'documents' | 'media'
type MaxSizeOption = 'none' | '1mb' | '5mb' | '10mb'

const ACCEPT_TYPES: AcceptType[] = ['any', 'images', 'documents', 'media']
const MAX_SIZE_OPTIONS: MaxSizeOption[] = ['none', '1mb', '5mb', '10mb']

const ACCEPT_MAP: Record<AcceptType, string | undefined> = {
  any: undefined,
  images: 'image/*',
  documents: '.pdf,.doc,.docx,.txt,.md',
  media: 'image/*,video/*,audio/*',
}

const MAX_SIZE_MAP: Record<MaxSizeOption, number | undefined> = {
  none: undefined,
  '1mb': 1024 * 1024,
  '5mb': 5 * 1024 * 1024,
  '10mb': 10 * 1024 * 1024,
}

const IMPORT_STRINGS: Record<Tier, string> = {
  lite: "import { FileUpload } from '@annondeveloper/ui-kit/lite'",
  standard: "import { FileUpload } from '@annondeveloper/ui-kit'",
  premium: "import { FileUpload } from '@annondeveloper/ui-kit/premium'",
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)
  return (
    <Button
      size="sm"
      variant="secondary"
      className="file-upload-page__copy-btn"
      onClick={() => {
        navigator.clipboard.writeText(text).then(() => {
          setCopied(true)
          setTimeout(() => setCopied(false), 1500)
        })
      }}
      icon={<Icon name={copied ? 'check' : 'copy'} size="sm" />}
    >
      {copied ? 'Copied' : 'Copy'}
    </Button>
  )
}

function OptionGroup<T extends string>({
  label,
  options,
  value,
  onChange,
}: {
  label: string
  options: readonly T[]
  value: T
  onChange: (v: T) => void
}) {
  return (
    <div className="file-upload-page__control-group">
      <span className="file-upload-page__control-label">{label}</span>
      <div className="file-upload-page__control-options">
        {options.map(opt => (
          <button
            key={opt}
            type="button"
            className={`file-upload-page__option-btn${opt === value ? ' file-upload-page__option-btn--active' : ''}`}
            onClick={() => onChange(opt)}
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  )
}

function Toggle({
  label,
  checked,
  onChange,
}: {
  label: string
  checked: boolean
  onChange: (v: boolean) => void
}) {
  return (
    <label className="file-upload-page__toggle-label">
      <input
        type="checkbox"
        checked={checked}
        onChange={e => onChange(e.target.checked)}
        style={{ accentColor: 'var(--brand)' }}
      />
      {label}
    </label>
  )
}

// ─── Code Generation ──────────────────────────────────────────────────────────

function generateReactCode(
  tier: Tier,
  acceptType: AcceptType,
  multiple: boolean,
  maxSizeOpt: MaxSizeOption,
  maxFiles: number,
  disabled: boolean,
  showPreview: boolean,
  motion: number,
): string {
  const importStr = IMPORT_STRINGS[tier]

  if (tier === 'lite') {
    const attrs: string[] = []
    if (ACCEPT_MAP[acceptType]) attrs.push(`  accept="${ACCEPT_MAP[acceptType]}"`)
    if (multiple) attrs.push('  multiple')
    if (disabled) attrs.push('  disabled')

    return `${importStr}

<FileUpload
  label="Upload files"${attrs.length > 0 ? '\n' + attrs.join('\n') : ''}
  hint="Select one or more files"
/>`
  }

  const props: string[] = []
  props.push('  name="files"')
  if (ACCEPT_MAP[acceptType]) props.push(`  accept="${ACCEPT_MAP[acceptType]}"`)
  if (multiple) props.push('  multiple')
  if (MAX_SIZE_MAP[maxSizeOpt]) props.push(`  maxSize={${MAX_SIZE_MAP[maxSizeOpt]}}`)
  if (multiple && maxFiles > 0) props.push(`  maxFiles={${maxFiles}}`)
  if (disabled) props.push('  disabled')
  if (!showPreview) props.push('  showPreview={false}')
  if (motion !== 3) props.push(`  motion={${motion}}`)
  props.push('  label="Upload files"')
  props.push('  onChange={(files) => console.log(files)}')
  props.push('  onError={(error) => console.error(error)}')

  return `${importStr}

<FileUpload
${props.join('\n')}
/>`
}

function generateHtmlCode(tier: Tier, acceptType: AcceptType): string {
  if (tier === 'lite') {
    return `<!-- FileUpload — Lite tier (native input) -->
<div class="ui-lite-file-upload">
  <label>
    Upload files
    <input type="file"${ACCEPT_MAP[acceptType] ? ` accept="${ACCEPT_MAP[acceptType]}"` : ''} />
  </label>
  <span class="ui-lite-file-upload__hint">Select files to upload</span>
</div>

<style>
@import '@annondeveloper/ui-kit/lite/styles.css';
</style>`
  }

  return `<!-- FileUpload — Standard tier -->
<link rel="stylesheet" href="https://unpkg.com/@annondeveloper/ui-kit/css/components/file-upload.css">

<div class="ui-file-upload">
  <span class="ui-file-upload__label">Upload files</span>
  <input type="file" class="ui-file-upload__input"${ACCEPT_MAP[acceptType] ? ` accept="${ACCEPT_MAP[acceptType]}"` : ''} />
  <div class="ui-file-upload__dropzone" role="button" tabindex="0">
    <span class="ui-file-upload__dropzone-icon"><!-- upload icon --></span>
    <span class="ui-file-upload__dropzone-text">
      Drag files here or <span class="ui-file-upload__dropzone-browse">browse</span>
    </span>
  </div>
</div>`
}

function generateVueCode(tier: Tier, acceptType: AcceptType, multiple: boolean): string {
  if (tier === 'lite') {
    return `<template>
  <FileUpload
    label="Upload files"${ACCEPT_MAP[acceptType] ? `\n    accept="${ACCEPT_MAP[acceptType]}"` : ''}${multiple ? '\n    multiple' : ''}
    hint="Select files to upload"
  />
</template>

<script setup>
import { FileUpload } from '@annondeveloper/ui-kit/lite'
</script>`
  }

  const attrs: string[] = []
  attrs.push('    name="files"')
  if (ACCEPT_MAP[acceptType]) attrs.push(`    accept="${ACCEPT_MAP[acceptType]}"`)
  if (multiple) attrs.push('    multiple')
  attrs.push('    label="Upload files"')
  attrs.push('    @change="handleFiles"')

  return `<template>
  <FileUpload
${attrs.join('\n')}
  />
</template>

<script setup>
import { FileUpload } from '@annondeveloper/ui-kit'

function handleFiles(files) {
  console.log('Selected:', files)
}
</script>`
}

function generateAngularCode(tier: Tier, acceptType: AcceptType): string {
  if (tier === 'lite') {
    return `<!-- Angular — Lite tier -->
<div class="ui-lite-file-upload">
  <label>
    Upload files
    <input type="file"${ACCEPT_MAP[acceptType] ? ` accept="${ACCEPT_MAP[acceptType]}"` : ''} (change)="onFileChange($event)" />
  </label>
</div>

/* In styles.css */
@import '@annondeveloper/ui-kit/lite/styles.css';`
  }

  return `<!-- Angular — Standard tier (CSS-only approach) -->
<div class="ui-file-upload">
  <span class="ui-file-upload__label">Upload files</span>
  <input
    type="file"
    class="ui-file-upload__input"${ACCEPT_MAP[acceptType] ? `\n    accept="${ACCEPT_MAP[acceptType]}"` : ''}
    (change)="onFileChange($event)"
  />
  <div
    class="ui-file-upload__dropzone"
    role="button"
    tabindex="0"
    (click)="triggerUpload()"
    (dragover)="onDragOver($event)"
    (drop)="onDrop($event)"
  >
    <span class="ui-file-upload__dropzone-text">
      Drag files here or <span class="ui-file-upload__dropzone-browse">browse</span>
    </span>
  </div>
</div>

/* Import component CSS */
@import '@annondeveloper/ui-kit/css/components/file-upload.css';`
}

function generateSvelteCode(tier: Tier, acceptType: AcceptType, multiple: boolean): string {
  if (tier === 'lite') {
    return `<script>
  import { FileUpload } from '@annondeveloper/ui-kit/lite';
</script>

<FileUpload
  label="Upload files"${ACCEPT_MAP[acceptType] ? `\n  accept="${ACCEPT_MAP[acceptType]}"` : ''}${multiple ? '\n  multiple' : ''}
  hint="Select files to upload"
/>`
  }

  return `<script>
  import { FileUpload } from '@annondeveloper/ui-kit';

  function handleFiles(files) {
    console.log('Selected:', files);
  }
</script>

<FileUpload
  name="files"${ACCEPT_MAP[acceptType] ? `\n  accept="${ACCEPT_MAP[acceptType]}"` : ''}${multiple ? '\n  multiple' : ''}
  label="Upload files"
  onChange={handleFiles}
/>`
}

// ─── Playground Section ──────────────────────────────────────────────────────

function PlaygroundSection({ tier: tierProp }: { tier: Tier }) {
  const { tier: contextTier } = useTier()
  const tier = tierProp ?? contextTier
  const [acceptType, setAcceptType] = useState<AcceptType>('any')
  const [multiple, setMultiple] = useState(false)
  const [maxSizeOpt, setMaxSizeOpt] = useState<MaxSizeOption>('none')
  const [maxFiles, setMaxFiles] = useState(5)
  const [disabled, setDisabled] = useState(false)
  const [showPreview, setShowPreview] = useState(true)
  const [motion, setMotion] = useState<0 | 1 | 2 | 3>(3)
  const [fileLog, setFileLog] = useState<string[]>([])
  const [errorMsg, setErrorMsg] = useState<string | undefined>()
  const [copyStatus, setCopyStatus] = useState('')

  const handleFilesChange = useCallback((files: File[]) => {
    setErrorMsg(undefined)
    setFileLog(prev => [
      ...prev,
      `Selected ${files.length} file(s): ${files.map(f => f.name).join(', ')}`,
    ])
  }, [])

  const handleError = useCallback((error: string) => {
    setErrorMsg(error)
    setFileLog(prev => [...prev, `Error: ${error}`])
  }, [])

  const reactCode = useMemo(
    () => generateReactCode(tier, acceptType, multiple, maxSizeOpt, maxFiles, disabled, showPreview, motion),
    [tier, acceptType, multiple, maxSizeOpt, maxFiles, disabled, showPreview, motion],
  )

  const htmlCode = useMemo(
    () => generateHtmlCode(tier, acceptType),
    [tier, acceptType],
  )

  const vueCode = useMemo(
    () => generateVueCode(tier, acceptType, multiple),
    [tier, acceptType, multiple],
  )

  const angularCode = useMemo(
    () => generateAngularCode(tier, acceptType),
    [tier, acceptType],
  )

  const svelteCode = useMemo(
    () => generateSvelteCode(tier, acceptType, multiple),
    [tier, acceptType, multiple],
  )

  const [activeCodeTab, setActiveCodeTab] = useState('react')

  const codeTabs = [
    { id: 'react', label: 'React' },
    { id: 'html', label: 'HTML+CSS' },
    { id: 'vue', label: 'Vue' },
    { id: 'angular', label: 'Angular' },
    { id: 'svelte', label: 'Svelte' },
  ]

  const activeCode = useMemo(() => {
    switch (activeCodeTab) {
      case 'react': return reactCode
      case 'html': return htmlCode
      case 'vue': return vueCode
      case 'angular': return angularCode
      case 'svelte': return svelteCode
      default: return reactCode
    }
  }, [activeCodeTab, reactCode, htmlCode, vueCode, angularCode, svelteCode])

  return (
    <section className="file-upload-page__section" id="playground">
      <h2 className="file-upload-page__section-title">
        <a href="#playground">Live Playground</a>
      </h2>
      <p className="file-upload-page__section-desc">
        Configure accepted types, size limits, and preview settings. Drop files onto the zone or click to browse.
      </p>

      <div className="file-upload-page__playground">
        <div className="file-upload-page__playground-preview">
          <div className="file-upload-page__playground-result">
            {tier === 'lite' ? (
              <LiteFileUpload
                label="Upload files"
                accept={ACCEPT_MAP[acceptType]}
                multiple={multiple}
                disabled={disabled}
                hint={ACCEPT_MAP[acceptType] ? `Accepts: ${ACCEPT_MAP[acceptType]}` : 'All file types accepted'}
              />
            ) : (
              <FileUpload
                name="playground-upload"
                accept={ACCEPT_MAP[acceptType]}
                multiple={multiple}
                maxSize={MAX_SIZE_MAP[maxSizeOpt]}
                maxFiles={multiple ? maxFiles : undefined}
                disabled={disabled}
                showPreview={showPreview}
                motion={motion}
                label="Upload files"
                error={errorMsg}
                onChange={handleFilesChange}
                onError={handleError}
              />
            )}
          </div>

          {fileLog.length > 0 && (
            <div className="file-upload-page__file-log">
              {fileLog.map((log, i) => (
                <div key={i}>{log}</div>
              ))}
            </div>
          )}

          <div className="file-upload-page__code-tabs">
            <div className="file-upload-page__export-row">
              <Button
                size="xs"
                variant="secondary"
                icon={<Icon name="copy" size="sm" />}
                onClick={() => {
                  navigator.clipboard?.writeText(activeCode).then(() => {
                    setCopyStatus(`Copied ${codeTabs.find(t => t.id === activeCodeTab)?.label}!`)
                    setTimeout(() => setCopyStatus(''), 2000)
                  })
                }}
              >
                Copy {codeTabs.find(t => t.id === activeCodeTab)?.label}
              </Button>
              {copyStatus && <span className="file-upload-page__export-status">{copyStatus}</span>}
            </div>
            <Tabs tabs={codeTabs} activeTab={activeCodeTab} onChange={setActiveCodeTab} size="sm" variant="pills">
              <TabPanel tabId="react">
                <CopyBlock code={reactCode} language="typescript" showLineNumbers />
              </TabPanel>
              <TabPanel tabId="html">
                <CopyBlock code={htmlCode} language="html" showLineNumbers />
              </TabPanel>
              <TabPanel tabId="vue">
                <CopyBlock code={vueCode} language="html" showLineNumbers />
              </TabPanel>
              <TabPanel tabId="angular">
                <CopyBlock code={angularCode} language="html" showLineNumbers />
              </TabPanel>
              <TabPanel tabId="svelte">
                <CopyBlock code={svelteCode} language="html" showLineNumbers />
              </TabPanel>
            </Tabs>
          </div>
        </div>

        <div className="file-upload-page__playground-controls">
          <OptionGroup label="Accept Type" options={ACCEPT_TYPES} value={acceptType} onChange={setAcceptType} />

          {tier !== 'lite' && (
            <OptionGroup label="Max Size" options={MAX_SIZE_OPTIONS} value={maxSizeOpt} onChange={setMaxSizeOpt} />
          )}

          {tier !== 'lite' && (
            <OptionGroup
              label="Motion"
              options={['0', '1', '2', '3'] as const}
              value={String(motion) as '0' | '1' | '2' | '3'}
              onChange={v => setMotion(Number(v) as 0 | 1 | 2 | 3)}
            />
          )}

          <div className="file-upload-page__control-group">
            <span className="file-upload-page__control-label">Toggles</span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
              <Toggle label="Multiple files" checked={multiple} onChange={setMultiple} />
              <Toggle label="Disabled" checked={disabled} onChange={setDisabled} />
              {tier !== 'lite' && <Toggle label="Show preview" checked={showPreview} onChange={setShowPreview} />}
            </div>
          </div>

          {tier !== 'lite' && multiple && (
            <div className="file-upload-page__control-group">
              <span className="file-upload-page__control-label">Max Files</span>
              <input
                type="number"
                min={1}
                max={20}
                value={maxFiles}
                onChange={e => setMaxFiles(Number(e.target.value))}
                className="file-upload-page__text-input"
              />
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function FileUploadPage() {
  useStyles('file-upload-page', pageStyles)

  const { tier, setTier } = useTier()

  // Scroll reveal — JS fallback
  useEffect(() => {
    const sections = document.querySelectorAll('.file-upload-page__section')
    if (!sections.length) return

    if (CSS.supports?.('animation-timeline', 'view()')) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            ;(entry.target as HTMLElement).style.opacity = '1'
            ;(entry.target as HTMLElement).style.transform = 'translateY(0) scale(1)'
            ;(entry.target as HTMLElement).style.filter = 'blur(0)'
            observer.unobserve(entry.target)
          }
        })
      },
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    )

    sections.forEach(section => {
      ;(section as HTMLElement).style.opacity = '0'
      ;(section as HTMLElement).style.transform = 'translateY(32px) scale(0.98)'
      ;(section as HTMLElement).style.filter = 'blur(4px)'
      ;(section as HTMLElement).style.transition = 'opacity 0.6s cubic-bezier(0.16, 1, 0.3, 1), transform 0.6s cubic-bezier(0.16, 1, 0.3, 1), filter 0.6s cubic-bezier(0.16, 1, 0.3, 1)'
      observer.observe(section)
    })

    return () => observer.disconnect()
  }, [])

  return (
    <div className="file-upload-page">
      {/* ── 1. Hero Header ──────────────────────────────── */}
      <div className="file-upload-page__hero">
        <h1 className="file-upload-page__title">FileUpload</h1>
        <p className="file-upload-page__desc">
          Drag-and-drop file upload with type validation, size limits, image previews,
          and accessible keyboard interaction. Ships in two weight tiers.
        </p>
        <div className="file-upload-page__import-row">
          <code className="file-upload-page__import-code">{IMPORT_STRINGS[tier]}</code>
          <CopyButton text={IMPORT_STRINGS[tier]} />
        </div>
      </div>

      {/* ── 2. Live Playground ──────────────────────────── */}
      <PlaygroundSection tier={tier} />

      {/* ── 3. Accept Types ────────────────────────────── */}
      <section className="file-upload-page__section" id="accept">
        <h2 className="file-upload-page__section-title">
          <a href="#accept">Accept Types</a>
        </h2>
        <p className="file-upload-page__section-desc">
          Restrict which file types can be uploaded using MIME types, extensions, or wildcards.
          The component validates both on file select and drag-and-drop.
        </p>
        {tier !== 'lite' ? (
          <div className="file-upload-page__preview file-upload-page__preview--col">
            <div className="file-upload-page__labeled-row">
              <div className="file-upload-page__labeled-item">
                <FileUpload name="images-only" accept="image/*" label="Images only" onChange={() => {}} />
                <span className="file-upload-page__item-label">accept="image/*"</span>
              </div>
              <div className="file-upload-page__labeled-item">
                <FileUpload name="docs-only" accept=".pdf,.doc,.docx" label="Documents only" onChange={() => {}} />
                <span className="file-upload-page__item-label">accept=".pdf,.doc,.docx"</span>
              </div>
            </div>
          </div>
        ) : (
          <div style={{ marginBlockStart: '1rem' }}>
            <CopyBlock
              code={`<FileUpload label="Images only" accept="image/*" />\n<FileUpload label="Docs only" accept=".pdf,.doc,.docx" />`}
              language="typescript"
            />
          </div>
        )}
      </section>

      {/* ── 4. Multiple Files ──────────────────────────── */}
      <section className="file-upload-page__section" id="multiple">
        <h2 className="file-upload-page__section-title">
          <a href="#multiple">Multiple Files</a>
        </h2>
        <p className="file-upload-page__section-desc">
          Enable multi-file selection with the <code>multiple</code> prop. Combine with
          <code> maxFiles</code> to limit the total count.
        </p>
        <div style={{ marginBlockStart: '1rem' }}>
          <CopyBlock
            code={`<FileUpload
  name="attachments"
  multiple
  maxFiles={5}
  label="Upload attachments"
  description="Up to 5 files, 10MB each"
  maxSize={10 * 1024 * 1024}
  onChange={handleFiles}
  onError={handleError}
/>`}
            language="typescript"
          />
        </div>
      </section>

      {/* ── 5. Size Validation ─────────────────────────── */}
      {tier !== 'lite' && (
        <section className="file-upload-page__section" id="validation">
          <h2 className="file-upload-page__section-title">
            <a href="#validation">Size Validation</a>
          </h2>
          <p className="file-upload-page__section-desc">
            Set maximum file size in bytes with <code>maxSize</code>. The component calls
            <code> onError</code> with a human-readable message if a file exceeds the limit.
          </p>
          <div className="file-upload-page__preview file-upload-page__preview--col">
            <FileUpload
              name="size-validation"
              maxSize={1024 * 1024}
              label="Max 1 MB"
              description="Files larger than 1 MB will be rejected"
              onChange={() => {}}
              onError={(err) => {}}
            />
          </div>
        </section>
      )}

      {/* ── 6. Drag and Drop ───────────────────────────── */}
      {tier !== 'lite' && (
        <section className="file-upload-page__section" id="drag-drop">
          <h2 className="file-upload-page__section-title">
            <a href="#drag-drop">Drag and Drop</a>
          </h2>
          <p className="file-upload-page__section-desc">
            The dropzone highlights with a brand-color border when files are dragged over it.
            All drag events are handled internally with proper prevent-default behavior.
            No external library required.
          </p>
          <div style={{ marginBlockStart: '1rem' }}>
            <CopyBlock
              code={`// Drag-and-drop is built-in. No additional props needed.
// The dropzone shows visual feedback on dragover:
// - Border changes from dashed to solid
// - Background gets a subtle brand tint

<FileUpload
  name="drag-demo"
  label="Drop files here"
  onChange={handleFiles}
/>`}
              language="typescript"
            />
          </div>
        </section>
      )}

      {/* ── 7. Image Previews ──────────────────────────── */}
      {tier !== 'lite' && (
        <section className="file-upload-page__section" id="preview">
          <h2 className="file-upload-page__section-title">
            <a href="#preview">Image Previews</a>
          </h2>
          <p className="file-upload-page__section-desc">
            When <code>showPreview</code> is true (default), image files display a thumbnail.
            Non-image files show a generic file icon. Each file has a remove button.
          </p>
          <div style={{ marginBlockStart: '1rem' }}>
            <CopyBlock
              code={`// With previews (default)
<FileUpload name="with-preview" showPreview label="With previews" />

// Without previews
<FileUpload name="no-preview" showPreview={false} label="Without previews" />`}
              language="typescript"
            />
          </div>
        </section>
      )}

      {/* ── 8. Error States ────────────────────────────── */}
      {tier !== 'lite' && (
        <section className="file-upload-page__section" id="errors">
          <h2 className="file-upload-page__section-title">
            <a href="#errors">Error States</a>
          </h2>
          <p className="file-upload-page__section-desc">
            Display validation errors with the <code>error</code> prop. The dropzone border
            turns red and the error message is announced to screen readers via <code>role="alert"</code>.
          </p>
          <div className="file-upload-page__preview file-upload-page__preview--col">
            <FileUpload
              name="error-demo"
              label="Upload avatar"
              error="File too large. Maximum size is 2 MB."
              onChange={() => {}}
            />
          </div>
        </section>
      )}

      {/* ── 9. Disabled State ──────────────────────────── */}
      <section className="file-upload-page__section" id="disabled">
        <h2 className="file-upload-page__section-title">
          <a href="#disabled">Disabled State</a>
        </h2>
        <p className="file-upload-page__section-desc">
          When disabled, the component reduces opacity and blocks all pointer events.
        </p>
        {tier !== 'lite' ? (
          <div className="file-upload-page__preview file-upload-page__preview--col">
            <FileUpload
              name="disabled-demo"
              label="Upload (disabled)"
              disabled
              onChange={() => {}}
            />
          </div>
        ) : (
          <div style={{ marginBlockStart: '1rem' }}>
            <CopyBlock
              code={`<FileUpload label="Upload (disabled)" disabled />`}
              language="typescript"
            />
          </div>
        )}
      </section>

      {/* ── 10. Weight Tiers ───────────────────────────── */}
      <section className="file-upload-page__section" id="tiers">
        <h2 className="file-upload-page__section-title">
          <a href="#tiers">Weight Tiers</a>
        </h2>
        <p className="file-upload-page__section-desc">
          Lite uses the native file input. Standard adds drag-drop, previews, validation, and animation.
        </p>

        <div className="file-upload-page__tiers">
          {/* Lite */}
          <div
            className={`file-upload-page__tier-card${tier === 'lite' ? ' file-upload-page__tier-card--active' : ''}`}
            onClick={() => setTier('lite')}
            role="button"
            tabIndex={0}
            onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setTier('lite') } }}
          >
            <div className="file-upload-page__tier-header">
              <span className="file-upload-page__tier-name">Lite</span>
              <span className="file-upload-page__tier-size">~0.2 KB</span>
            </div>
            <p className="file-upload-page__tier-desc">
              Native file input wrapper. No drag-drop, no previews,
              no validation, no animation.
            </p>
            <div className="file-upload-page__tier-import">
              import {'{'} FileUpload {'}'} from '@annondeveloper/ui-kit/lite'
            </div>
            <div className="file-upload-page__tier-preview">
              <Button variant="secondary" size="sm">Lite Upload</Button>
            </div>
            <div className="file-upload-page__size-breakdown">
              <div className="file-upload-page__size-row">
                <span>Component: <strong style={{ color: 'var(--text-primary)' }}>0.2 KB</strong></span>
                <span>+ Shared: <strong style={{ color: 'var(--text-primary)' }}>3.7 KB</strong></span>
                <span>= <strong style={{ color: 'var(--brand)' }}>3.9 KB</strong> gzip</span>
              </div>
            </div>
          </div>

          {/* Standard */}
          <div
            className={`file-upload-page__tier-card${tier === 'standard' ? ' file-upload-page__tier-card--active' : ''}`}
            onClick={() => setTier('standard')}
            role="button"
            tabIndex={0}
            onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setTier('standard') } }}
          >
            <div className="file-upload-page__tier-header">
              <span className="file-upload-page__tier-name">Standard</span>
              <span className="file-upload-page__tier-size">~3.5 KB</span>
            </div>
            <p className="file-upload-page__tier-desc">
              Full-featured file upload with drag-and-drop, type/size validation,
              image thumbnails, file list, remove buttons, and motion.
            </p>
            <div className="file-upload-page__tier-import">
              import {'{'} FileUpload {'}'} from '@annondeveloper/ui-kit'
            </div>
            <div className="file-upload-page__tier-preview">
              <Button variant="primary" size="sm">Standard Upload</Button>
            </div>
            <div className="file-upload-page__size-breakdown">
              <div className="file-upload-page__size-row">
                <span>Component: <strong style={{ color: 'var(--text-primary)' }}>3.5 KB</strong></span>
                <span>+ Shared: <strong style={{ color: 'var(--text-primary)' }}>0.9 KB</strong></span>
                <span>= <strong style={{ color: 'var(--brand)' }}>4.4 KB</strong> gzip</span>
              </div>
            </div>
          </div>

          {/* Premium */}
          <div
            className={`file-upload-page__tier-card${tier === 'premium' ? ' file-upload-page__tier-card--active' : ''}`}
            onClick={() => setTier('premium')}
            role="button"
            tabIndex={0}
            onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setTier('premium') } }}
          >
            <div className="file-upload-page__tier-header">
              <span className="file-upload-page__tier-name">Premium</span>
              <span className="file-upload-page__tier-size">~3-5 KB</span>
            </div>
            <p className="file-upload-page__tier-desc">
              Aurora glow on drag-over, spring-bounce on file add, and shimmer sweep across the dropzone.
            </p>
            <div className="file-upload-page__tier-import">
              import {'{'} FileUpload {'}'} from '@annondeveloper/ui-kit/premium'
            </div>
            <div className="file-upload-page__tier-preview">
              <Button variant="primary" size="sm">Premium Upload</Button>
            </div>
            <div className="file-upload-page__size-breakdown">
              <div className="file-upload-page__size-row">
                <span>Component: <strong style={{ color: 'var(--text-primary)' }}>3.5 KB</strong></span>
                <span>+ Shared: <strong style={{ color: 'var(--text-primary)' }}>0.9 KB</strong></span>
                <span>= <strong style={{ color: 'var(--brand)' }}>4.4 KB</strong> gzip</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 11. Props API ──────────────────────────────── */}
      <section className="file-upload-page__section" id="props">
        <h2 className="file-upload-page__section-title">
          <a href="#props">Props API</a>
        </h2>
        <p className="file-upload-page__section-desc">
          All props accepted by FileUpload. It also spreads native div HTML attributes
          onto the root element.
        </p>
        <Card variant="default" padding="md">
          <PropsTable props={fileUploadProps} />
        </Card>
      </section>

      {/* ── 12. Accessibility ──────────────────────────── */}
      <section className="file-upload-page__section" id="accessibility">
        <h2 className="file-upload-page__section-title">
          <a href="#accessibility">Accessibility</a>
        </h2>
        <p className="file-upload-page__section-desc">
          Accessible file upload with keyboard interaction and screen reader support.
        </p>
        <Card variant="default" padding="md">
          <ul className="file-upload-page__a11y-list">
            <li className="file-upload-page__a11y-item">
              <span className="file-upload-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Keyboard:</strong> Dropzone activates on <code className="file-upload-page__a11y-key">Enter</code> and <code className="file-upload-page__a11y-key">Space</code> to open the file dialog.
              </span>
            </li>
            <li className="file-upload-page__a11y-item">
              <span className="file-upload-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Focus:</strong> Visible focus ring on the dropzone via <code className="file-upload-page__a11y-key">:focus-visible</code> with brand glow.
              </span>
            </li>
            <li className="file-upload-page__a11y-item">
              <span className="file-upload-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Errors:</strong> Validation errors are announced via <code className="file-upload-page__a11y-key">role="alert"</code>.
              </span>
            </li>
            <li className="file-upload-page__a11y-item">
              <span className="file-upload-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>File list:</strong> Uses <code className="file-upload-page__a11y-key">role="list"</code> with <code className="file-upload-page__a11y-key">aria-label="Selected files"</code>.
              </span>
            </li>
            <li className="file-upload-page__a11y-item">
              <span className="file-upload-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Remove buttons:</strong> Each has <code className="file-upload-page__a11y-key">aria-label="Remove [filename]"</code>.
              </span>
            </li>
            <li className="file-upload-page__a11y-item">
              <span className="file-upload-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Image alt:</strong> Thumbnails include <code className="file-upload-page__a11y-key">alt="Preview of [filename]"</code>.
              </span>
            </li>
            <li className="file-upload-page__a11y-item">
              <span className="file-upload-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>Touch targets:</strong> Remove buttons meet 44px minimum on coarse pointer devices.
              </span>
            </li>
            <li className="file-upload-page__a11y-item">
              <span className="file-upload-page__a11y-icon"><Icon name="check-circle" size="sm" /></span>
              <span>
                <strong>High contrast:</strong> Supports <code className="file-upload-page__a11y-key">forced-colors: active</code> with visible borders.
              </span>
            </li>
          </ul>
        </Card>
      </section>
    </div>
  )
}
