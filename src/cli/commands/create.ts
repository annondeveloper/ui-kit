import { writeFileSync, mkdirSync } from 'fs'
import { join, resolve } from 'path'

type FileTree = Record<string, string>

function dashboardTemplate(name: string, theme: string, tier: string): FileTree {
  const tierSuffix = tier !== 'standard' ? `/${tier}` : ''
  return {
    'package.json': JSON.stringify({
      name,
      private: true,
      type: 'module',
      scripts: { dev: 'vite', build: 'vite build', preview: 'vite preview' },
      dependencies: {
        'react': '^19.0.0',
        'react-dom': '^19.0.0',
        '@annondeveloper/ui-kit': '^2.0.0',
      },
      devDependencies: {
        'vite': '^6.0.0',
        '@vitejs/plugin-react': '^4.0.0',
        'typescript': '^5.7.0',
      },
    }, null, 2),
    'vite.config.ts': `import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
})
`,
    'index.html': `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${name}</title>
</head>
<body>
  <div id="root"></div>
  <script type="module" src="/src/main.tsx"></script>
</body>
</html>
`,
    'src/main.tsx': `import React from 'react'
import ReactDOM from 'react-dom/client'
import { UIProvider } from '@annondeveloper/ui-kit'
import App from './App'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <UIProvider theme="${theme}">
      <App />
    </UIProvider>
  </React.StrictMode>
)
`,
    'src/App.tsx': `import { MetricCard, DataTable } from '@annondeveloper/ui-kit'

export default function App() {
  return (
    <div style={{ padding: '2rem', display: 'grid', gap: '1.5rem' }}>
      <h1>Dashboard</h1>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
        <MetricCard label="Revenue" value="$12,450" trend={12.5} />
        <MetricCard label="Users" value="1,234" trend={-3.2} />
        <MetricCard label="Uptime" value="99.9%" trend={0.1} />
      </div>
      <DataTable
        columns={[
          { key: 'name', header: 'Name' },
          { key: 'status', header: 'Status' },
          { key: 'value', header: 'Value' },
        ]}
        data={[
          { name: 'Service A', status: 'Healthy', value: '98%' },
          { name: 'Service B', status: 'Warning', value: '87%' },
        ]}
      />
    </div>
  )
}
`,
  }
}

function formTemplate(name: string, theme: string, tier: string): FileTree {
  return {
    ...baseFiles(name, theme),
    'src/App.tsx': `import { Card, FormInput, Select, Button } from '@annondeveloper/ui-kit'

export default function App() {
  return (
    <div style={{ padding: '2rem', maxWidth: '640px', margin: '0 auto' }}>
      <Card>
        <h1>Contact Form</h1>
        <form style={{ display: 'grid', gap: '1rem', padding: '1.5rem' }}>
          <FormInput label="Full Name" placeholder="Jane Doe" required />
          <FormInput label="Email" type="email" placeholder="jane@example.com" required />
          <Select label="Subject" options={['General', 'Support', 'Sales', 'Billing']} />
          <FormInput label="Message" multiline rows={4} placeholder="How can we help?" />
          <Button type="submit">Send Message</Button>
        </form>
      </Card>
    </div>
  )
}
`,
  }
}

function marketingTemplate(name: string, theme: string, tier: string): FileTree {
  return {
    ...baseFiles(name, theme),
    'src/App.tsx': `import { Button, Badge, Card } from '@annondeveloper/ui-kit'

export default function App() {
  return (
    <div style={{ padding: '2rem', textAlign: 'center' }}>
      <Badge variant="brand">New Release</Badge>
      <h1 style={{ fontSize: '3rem', marginBlock: '1rem' }}>Build faster with Aurora</h1>
      <p style={{ fontSize: '1.25rem', opacity: 0.7, maxWidth: '600px', margin: '0 auto 2rem' }}>
        A zero-dependency component library with physics-based animations and OKLCH color system.
      </p>
      <Button size="lg">Get Started</Button>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', marginTop: '3rem' }}>
        <Card><h3>Zero Dependencies</h3><p>Only React 19 peer dependency</p></Card>
        <Card><h3>Physics Animations</h3><p>Real spring solver, not approximations</p></Card>
        <Card><h3>OKLCH Colors</h3><p>Perceptually uniform color system</p></Card>
      </div>
    </div>
  )
}
`,
  }
}

function saasTemplate(name: string, theme: string, tier: string): FileTree {
  return {
    ...baseFiles(name, theme),
    'src/App.tsx': `import { Tabs, DataTable } from '@annondeveloper/ui-kit'

export default function App() {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '240px 1fr', minHeight: '100vh' }}>
      <nav style={{ padding: '1.5rem', borderRight: '1px solid var(--border-subtle)' }}>
        <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem' }}>AppName</h2>
        <ul style={{ listStyle: 'none', padding: 0, display: 'grid', gap: '0.5rem' }}>
          <li>Dashboard</li>
          <li>Users</li>
          <li>Settings</li>
        </ul>
      </nav>
      <main style={{ padding: '2rem' }}>
        <h1>Dashboard</h1>
        <Tabs
          items={[
            { label: 'Overview', content: <p>Overview content</p> },
            { label: 'Analytics', content: <p>Analytics content</p> },
            { label: 'Reports', content: <p>Reports content</p> },
          ]}
        />
        <DataTable
          columns={[
            { key: 'name', header: 'Name' },
            { key: 'email', header: 'Email' },
            { key: 'role', header: 'Role' },
          ]}
          data={[
            { name: 'Alice', email: 'alice@example.com', role: 'Admin' },
            { name: 'Bob', email: 'bob@example.com', role: 'User' },
          ]}
        />
      </main>
    </div>
  )
}
`,
  }
}

function docsTemplate(name: string, theme: string, tier: string): FileTree {
  return {
    ...baseFiles(name, theme),
    'src/App.tsx': `import { CopyBlock } from '@annondeveloper/ui-kit'

export default function App() {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '200px 1fr', minHeight: '100vh' }}>
      <nav style={{ padding: '1.5rem', borderRight: '1px solid var(--border-subtle)' }}>
        <h2 style={{ fontSize: '1rem', marginBottom: '1rem' }}>Docs</h2>
        <ul style={{ listStyle: 'none', padding: 0, display: 'grid', gap: '0.5rem', fontSize: '0.875rem' }}>
          <li>Getting Started</li>
          <li>Components</li>
          <li>Theming</li>
          <li>API Reference</li>
        </ul>
      </nav>
      <main style={{ padding: '2rem', maxWidth: '800px' }}>
        <h1>Getting Started</h1>
        <p>Install the package:</p>
        <CopyBlock code="npm install @annondeveloper/ui-kit" language="bash" />
        <h2 style={{ marginTop: '2rem' }}>Quick Example</h2>
        <CopyBlock
          code={\`import { Button } from '@annondeveloper/ui-kit'

function App() {
  return <Button>Click me</Button>
}\`}
          language="tsx"
        />
      </main>
    </div>
  )
}
`,
  }
}

function baseFiles(name: string, theme: string): FileTree {
  return {
    'package.json': JSON.stringify({
      name,
      private: true,
      type: 'module',
      scripts: { dev: 'vite', build: 'vite build', preview: 'vite preview' },
      dependencies: {
        'react': '^19.0.0',
        'react-dom': '^19.0.0',
        '@annondeveloper/ui-kit': '^2.0.0',
      },
      devDependencies: {
        'vite': '^6.0.0',
        '@vitejs/plugin-react': '^4.0.0',
        'typescript': '^5.7.0',
      },
    }, null, 2),
    'vite.config.ts': `import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
})
`,
    'index.html': `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${name}</title>
</head>
<body>
  <div id="root"></div>
  <script type="module" src="/src/main.tsx"></script>
</body>
</html>
`,
    'src/main.tsx': `import React from 'react'
import ReactDOM from 'react-dom/client'
import { UIProvider } from '@annondeveloper/ui-kit'
import App from './App'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <UIProvider theme="${theme}">
      <App />
    </UIProvider>
  </React.StrictMode>
)
`,
  }
}

const TEMPLATES: Record<string, (name: string, theme: string, tier: string) => FileTree> = {
  dashboard: dashboardTemplate,
  form: formTemplate,
  marketing: marketingTemplate,
  saas: saasTemplate,
  docs: docsTemplate,
}

export const TEMPLATE_NAMES = Object.keys(TEMPLATES)

export function generateProjectFiles(
  name: string,
  template: string,
  theme: string,
  tier: string
): FileTree {
  const gen = TEMPLATES[template]
  if (!gen) {
    throw new Error(`Unknown template "${template}". Available: ${TEMPLATE_NAMES.join(', ')}`)
  }
  return gen(name, theme, tier)
}

export function createCommand(name: string, options: { template: string; tier?: string; theme?: string }): void {
  const template = options.template
  const tier = options.tier || 'standard'
  const theme = options.theme || 'aurora'

  if (!TEMPLATES[template]) {
    console.error(`Unknown template "${template}".`)
    console.error(`Available templates: ${TEMPLATE_NAMES.join(', ')}`)
    process.exit(1)
  }

  const projectDir = resolve(name)
  const files = generateProjectFiles(name, template, theme, tier)

  for (const [filePath, content] of Object.entries(files)) {
    const fullPath = join(projectDir, filePath)
    mkdirSync(join(fullPath, '..'), { recursive: true })
    writeFileSync(fullPath, content, 'utf-8')
  }

  console.log(`\u2713 Created project "${name}" with ${template} template`)
  console.log(`  Theme: ${theme} | Tier: ${tier}`)
  console.log(`\nNext steps:`)
  console.log(`  cd ${name}`)
  console.log(`  npm install`)
  console.log(`  npm run dev`)
}
