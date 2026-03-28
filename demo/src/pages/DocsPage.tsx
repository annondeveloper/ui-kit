import { useState } from 'react'
import { Tabs, TabPanel } from '@ui/components/tabs'
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

  return (
    <div>
      <h1 style={{ fontSize: 'var(--text-2xl)', fontWeight: 800, marginBottom: '1.5rem' }}>Documentation</h1>
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
