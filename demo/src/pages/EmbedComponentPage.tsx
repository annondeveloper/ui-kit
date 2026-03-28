'use client'

import { useParams, useSearchParams } from 'react-router-dom'
import { useEffect } from 'react'
import { UIProvider } from '@ui/components/ui-provider'
import { css } from '@ui/core/styles/css-tag'
import { useStyles } from '@ui/core/styles/use-styles'
import { renderComponentPreview } from '../utils/component-previews'

const embedStyles = css`
  @layer demo {
    .embed-root {
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      padding: 1rem;
      background: var(--bg-base);
    }
  }
`

export default function EmbedComponentPage() {
  useStyles('embed-component', embedStyles)
  const { component } = useParams<{ component: string }>()
  const [searchParams] = useSearchParams()
  const theme = searchParams.get('theme') || 'dark'

  useEffect(() => {
    document.documentElement.setAttribute('data-mode', theme)
  }, [theme])

  // Normalize the component name: try exact match, then PascalCase conversion
  const raw = component || ''
  const name = normalizeName(raw)
  const preview = renderComponentPreview(name)

  return (
    <UIProvider>
      <div className="embed-root">
        {preview}
      </div>
    </UIProvider>
  )
}

/**
 * Converts URL-style names (kebab-case, lowercase) to PascalCase component names.
 * e.g. "button" -> "Button", "data-table" -> "DataTable", "toggle-switch" -> "ToggleSwitch"
 */
function normalizeName(raw: string): string {
  // Map of known kebab-to-PascalCase overrides for components whose names
  // don't follow simple kebab-to-pascal conversion
  const overrides: Record<string, string> = {
    'combobox': 'ComboBox',
    'csv-export': 'CSVExport',
    'csv-export-button': 'CSVExportButton',
    'otp-input': 'OtpInput',
    'ui-provider': 'UIProvider',
    'copy-block': 'CopyBlock',
    'copy-button': 'CopyButton',
    'card-3d': 'Card3D',
    'json-viewer': 'JsonViewer',
    'geo-map': 'GeoMap',
    'rich-text-editor': 'RichTextEditor',
    'text-highlight': 'TextHighlight',
    'toast': 'Toast',
    'toast-provider': 'ToastProvider',
  }

  const lower = raw.toLowerCase()
  if (overrides[lower]) return overrides[lower]

  // Convert kebab-case to PascalCase
  return lower
    .split('-')
    .map(part => part.charAt(0).toUpperCase() + part.slice(1))
    .join('')
}
