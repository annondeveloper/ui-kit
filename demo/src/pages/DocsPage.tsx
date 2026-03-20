import { useState } from 'react'
import { Tabs, TabPanel } from '@ui/components/tabs'
import { MarkdownPage } from '../components/MarkdownPage'

// Import docs as raw strings
import migrationMd from '../../../docs/migration-v2.md?raw'
import themingMd from '../../../docs/theming.md?raw'
import formsMd from '../../../docs/forms.md?raw'
import animationMd from '../../../docs/animation.md?raw'

const docTabs = [
  { id: 'migration', label: 'Migration Guide' },
  { id: 'theming', label: 'Theming' },
  { id: 'forms', label: 'Form Engine' },
  { id: 'animation', label: 'Animation' },
]

const docs: Record<string, string> = {
  migration: migrationMd,
  theming: themingMd,
  forms: formsMd,
  animation: animationMd,
}

export default function DocsPage() {
  const [activeTab, setActiveTab] = useState('migration')

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
