import { useState } from 'react'
import { Tabs, TabPanel } from '@ui/components/tabs'
import { Badge } from '@ui/components/badge'
import { Icon, type IconName } from '@ui/core/icons/icon'
import { css } from '@ui/core/styles/css-tag'
import { useStyles } from '@ui/core/styles/use-styles'
import { MarkdownPage } from '../components/MarkdownPage'

// Import docs as raw strings
import migrationMd from '../../../docs/migration-v2.md?raw'
import themingMd from '../../../docs/theming.md?raw'
import formsMd from '../../../docs/forms.md?raw'
import animationMd from '../../../docs/animation.md?raw'
import choreographyMd from '../../../docs/choreography.md?raw'
import containerQueriesMd from '../../../docs/container-queries.md?raw'
import viewTransitionsMd from '../../../docs/view-transitions.md?raw'
import themeEditorMd from '../../../docs/theme-editor.md?raw'
import aiGeneratorMd from '../../../docs/ai-generator.md?raw'
import cliScaffoldingMd from '../../../docs/cli-scaffolding.md?raw'
import figmaPluginMd from '../../../docs/figma-plugin.md?raw'
import performanceMd from '../../../docs/performance-dashboard.md?raw'

const styles = css`
  @layer demo {
    .docs-hero {
      margin-block-end: 2rem;
    }

    .docs-hero-row {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      margin-block-end: 0.5rem;
    }

    .docs-hero-title {
      font-size: clamp(1.5rem, 3vw, 2rem);
      font-weight: 800;
      color: var(--text-primary);
      line-height: 1.2;
    }

    .docs-hero-desc {
      color: var(--text-secondary);
      font-size: 0.875rem;
      line-height: 1.5;
      max-width: 60ch;
      overflow-wrap: break-word;
    }

    .docs-quick-links {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 0.75rem;
      margin-block-end: 2rem;
    }

    @media (max-width: 768px) {
      .docs-quick-links {
        grid-template-columns: repeat(2, 1fr);
      }
    }

    @media (max-width: 500px) {
      .docs-quick-links {
        grid-template-columns: 1fr;
      }
    }

    .docs-quick-link {
      display: flex;
      align-items: flex-start;
      gap: 0.75rem;
      padding: 1rem;
      border-radius: var(--radius-md);
      border: 1px solid var(--border-subtle);
      background: var(--bg-surface);
      cursor: pointer;
      transition: all 0.15s;
      text-decoration: none;
      color: inherit;
    }
    .docs-quick-link:hover {
      border-color: var(--brand);
      background: var(--bg-elevated);
    }

    .docs-quick-link-icon {
      flex-shrink: 0;
      width: 2rem;
      height: 2rem;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: var(--radius-sm);
      background: var(--brand-subtle);
      color: var(--brand);
    }

    .docs-quick-link-text {
      display: flex;
      flex-direction: column;
      gap: 0.125rem;
      min-width: 0;
    }

    .docs-quick-link-title {
      font-size: 0.8125rem;
      font-weight: 700;
      color: var(--text-primary);
    }

    .docs-quick-link-desc {
      font-size: 0.6875rem;
      color: var(--text-tertiary);
      line-height: 1.4;
    }

    .docs-new-section {
      margin-block-end: 2rem;
    }

    .docs-new-title {
      font-size: 0.875rem;
      font-weight: 700;
      color: var(--text-primary);
      margin-block-end: 0.75rem;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      flex-wrap: wrap;
    }

    .docs-new-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 0.5rem;
    }

    @media (max-width: 500px) {
      .docs-new-grid {
        grid-template-columns: 1fr;
      }
    }

    .docs-new-item {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.625rem 0.75rem;
      border-radius: var(--radius-sm);
      border: 1px solid var(--border-subtle);
      background: var(--bg-surface);
      font-size: 0.75rem;
      color: var(--text-secondary);
    }

    .docs-new-item-icon {
      color: var(--brand);
      flex-shrink: 0;
    }
  }
`

const quickLinks: { id: string; icon: IconName; title: string; desc: string }[] = [
  { id: 'overview', icon: 'zap', title: 'Getting Started', desc: 'Migration guide and quick setup for v2' },
  { id: 'theming', icon: 'settings', title: 'Theming', desc: 'OKLCH color system and Aurora Fluid tokens' },
  { id: 'forms', icon: 'edit', title: 'Forms', desc: 'Zero-dependency form engine with validation' },
  { id: 'animation', icon: 'activity', title: 'Animation', desc: 'Physics-based spring animations and WAAPI' },
  { id: 'cli', icon: 'terminal', title: 'MCP Server', desc: 'CLI scaffolding and MCP integration' },
  { id: 'choreography', icon: 'refresh', title: 'Choreography', desc: 'Motion choreography presets and scroll' },
]

const newFeatures: { icon: IconName; label: string }[] = [
  { icon: 'bar-chart', label: 'AI DataTable suggestions' },
  { icon: 'terminal', label: 'MCP server integration' },
  { icon: 'code', label: 'RSC support' },
  { icon: 'link', label: 'Web Components wrapper' },
]

const docTabs = [
  { id: 'overview', label: 'Overview' },
  { id: 'theming', label: 'Theming' },
  { id: 'forms', label: 'Forms' },
  { id: 'animation', label: 'Animation' },
  { id: 'choreography', label: 'Choreography' },
  { id: 'container-queries', label: 'Container Queries' },
  { id: 'view-transitions', label: 'View Transitions' },
  { id: 'theme-editor', label: 'Theme Editor' },
  { id: 'ai-generator', label: 'AI Generator' },
  { id: 'cli', label: 'CLI' },
  { id: 'figma', label: 'Figma' },
  { id: 'performance', label: 'Performance' },
]

const docs: Record<string, string> = {
  overview: migrationMd,
  theming: themingMd,
  forms: formsMd,
  animation: animationMd,
  choreography: choreographyMd,
  'container-queries': containerQueriesMd,
  'view-transitions': viewTransitionsMd,
  'theme-editor': themeEditorMd,
  'ai-generator': aiGeneratorMd,
  cli: cliScaffoldingMd,
  figma: figmaPluginMd,
  performance: performanceMd,
}

export default function DocsPage() {
  const [activeTab, setActiveTab] = useState('overview')
  useStyles('docs-page', styles)

  const jumpToTab = (id: string) => {
    setActiveTab(id)
  }

  return (
    <div>
      {/* Hero */}
      <div className="docs-hero">
        <div className="docs-hero-row">
          <h1 className="docs-hero-title">Documentation</h1>
          <Badge variant="info" size="sm">v2.7</Badge>
        </div>
        <p className="docs-hero-desc">
          Guides, API references, and tutorials for every feature in the UI Kit.
        </p>
      </div>

      {/* Quick Links */}
      <div className="docs-quick-links">
        {quickLinks.map(link => (
          <button
            key={link.id}
            className="docs-quick-link"
            onClick={() => jumpToTab(link.id)}
          >
            <span className="docs-quick-link-icon">
              <Icon name={link.icon} size={16} />
            </span>
            <span className="docs-quick-link-text">
              <span className="docs-quick-link-title">{link.title}</span>
              <span className="docs-quick-link-desc">{link.desc}</span>
            </span>
          </button>
        ))}
      </div>

      {/* New in v2.7 */}
      <div className="docs-new-section">
        <div className="docs-new-title">
          <Icon name="zap" size={14} />
          New in v2.7
        </div>
        <div className="docs-new-grid">
          {newFeatures.map(f => (
            <div key={f.label} className="docs-new-item">
              <span className="docs-new-item-icon">
                <Icon name={f.icon} size={14} />
              </span>
              {f.label}
            </div>
          ))}
        </div>
      </div>

      {/* Tabbed docs */}
      <Tabs tabs={docTabs} activeTab={activeTab} onChange={setActiveTab} variant="underline">
        {docTabs.map(tab => (
          <TabPanel key={tab.id} tabId={tab.id}>
            <div style={{ paddingTop: '1.5rem' }}>
              <MarkdownPage content={docs[tab.id]} />
            </div>
          </TabPanel>
        ))}
      </Tabs>
    </div>
  )
}
