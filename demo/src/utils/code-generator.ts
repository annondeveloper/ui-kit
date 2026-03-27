// ─── Code Generator Engine ──────────────────────────────────────────────────
// Generates multi-framework code from templates and component selections.

import type { ComponentInfo } from './component-database'

export interface GeneratedCode {
  react: string
  vue: string
  angular: string
  svelte: string
  html: string
}

export type LayoutTemplate = 'dashboard' | 'form' | 'marketing' | 'data-table' | 'custom'

// ─── Import Path Helpers ────────────────────────────────────────────────────

function importPath(tier: string): string {
  if (tier === 'lite') return '@annondeveloper/ui-kit/lite'
  if (tier === 'premium') return '@annondeveloper/ui-kit/premium'
  return '@annondeveloper/ui-kit'
}

function litePrefix(name: string): string {
  return `Lite${name}`
}

function premiumPrefix(name: string): string {
  return `Premium${name}`
}

function tierName(name: string, tier: string): string {
  if (tier === 'lite') return litePrefix(name)
  if (tier === 'premium') return premiumPrefix(name)
  return name
}

// ─── Template Generators ────────────────────────────────────────────────────

function dashboardTemplate(tier: string): string {
  const ip = importPath(tier)
  const mc = tierName('MetricCard', tier)
  const dt = tierName('DataTable', tier)
  const card = tierName('Card', tier)
  const badge = tierName('Badge', tier)

  return `import { ${mc}, ${dt}, ${card}, ${badge} } from '${ip}'
import { useState } from 'react'

const metrics = [
  { title: 'Total Revenue', value: '$48,230', change: 12.5, trend: 'up' as const },
  { title: 'Active Users', value: '2,847', change: 8.2, trend: 'up' as const },
  { title: 'Conversion', value: '3.24%', change: -1.8, trend: 'down' as const },
  { title: 'Avg. Response', value: '142ms', change: -5.3, trend: 'up' as const },
]

const columns = [
  { key: 'name', header: 'Name' },
  { key: 'status', header: 'Status' },
  { key: 'revenue', header: 'Revenue' },
  { key: 'date', header: 'Date' },
]

const data = [
  { name: 'Widget Pro', status: 'Active', revenue: '$12,400', date: '2026-03-15' },
  { name: 'Dashboard X', status: 'Active', revenue: '$8,200', date: '2026-03-14' },
  { name: 'Analytics+', status: 'Paused', revenue: '$4,100', date: '2026-03-13' },
  { name: 'Cloud Sync', status: 'Active', revenue: '$6,800', date: '2026-03-12' },
  { name: 'API Gateway', status: 'Active', revenue: '$15,300', date: '2026-03-11' },
]

export default function Dashboard() {
  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <h1 style={{ marginBottom: '1.5rem' }}>Dashboard</h1>

      {/* Metric Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
        gap: '1rem',
        marginBottom: '2rem',
      }}>
        {metrics.map((m) => (
          <${mc} key={m.title} title={m.title} value={m.value} change={m.change} trend={m.trend} />
        ))}
      </div>

      {/* Data Table */}
      <${card} padding="lg">
        <h2 style={{ marginBottom: '1rem' }}>Recent Activity</h2>
        <${dt}
          columns={columns}
          data={data}
          sortable
          pagination={{ pageSize: 10 }}
        />
      </${card}>
    </div>
  )
}`
}

function formTemplate(tier: string): string {
  const ip = importPath(tier)
  const fi = tierName('FormInput', tier)
  const sel = tierName('Select', tier)
  const cb = tierName('Checkbox', tier)
  const btn = tierName('Button', tier)
  const card = tierName('Card', tier)

  return `import { ${fi}, ${sel}, ${cb}, ${btn}, ${card} } from '${ip}'
import { useState } from 'react'

export default function ContactForm() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [category, setCategory] = useState('')
  const [agree, setAgree] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log({ name, email, category, agree })
  }

  return (
    <div style={{ maxWidth: '600px', margin: '2rem auto', padding: '0 1rem' }}>
      <${card} padding="xl">
        <h2 style={{ marginBottom: '1.5rem' }}>Contact Us</h2>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <${fi}
            label="Full Name"
            placeholder="Jane Doe"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <${fi}
            label="Email"
            placeholder="jane@example.com"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <${sel}
            label="Category"
            placeholder="Select a category"
            value={category}
            onChange={setCategory}
            options={[
              { value: 'general', label: 'General Inquiry' },
              { value: 'support', label: 'Technical Support' },
              { value: 'sales', label: 'Sales' },
              { value: 'feedback', label: 'Feedback' },
            ]}
          />
          <${cb}
            label="I agree to the privacy policy"
            checked={agree}
            onChange={(checked) => setAgree(checked)}
          />
          <${btn} type="submit" variant="primary" size="lg" disabled={!agree}>
            Send Message
          </${btn}>
        </form>
      </${card}>
    </div>
  )
}`
}

function marketingTemplate(tier: string): string {
  const ip = importPath(tier)
  const btn = tierName('Button', tier)
  const badge = tierName('Badge', tier)
  const card = tierName('Card', tier)

  const shimmer = tier === 'premium' ? 'PremiumShimmerButton' : tier === 'lite' ? 'LiteShimmerButton' : 'ShimmerButton'

  return `import { ${btn}, ${badge}, ${card} } from '${ip}'
import { ${shimmer} } from '${ip}'

const features = [
  { title: 'Zero Dependencies', description: 'Only React as a peer dependency. No bloated node_modules.' },
  { title: 'Physics Animations', description: 'Real spring solver with differential equations, not bezier hacks.' },
  { title: 'OKLCH Colors', description: 'Perceptually uniform color system with automatic theme generation.' },
  { title: 'Three Weight Tiers', description: 'Lite, Standard, and Premium versions of every component.' },
]

export default function LandingPage() {
  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '4rem 1rem', textAlign: 'center' }}>
      {/* Hero */}
      <${badge} variant="solid" color="blue" style={{ marginBottom: '1rem' }}>
        New in v2.3
      </${badge}>
      <h1 style={{ fontSize: '3rem', fontWeight: 800, letterSpacing: '-0.03em', marginBottom: '1rem' }}>
        Build beautiful interfaces<br />with Aurora Fluid
      </h1>
      <p style={{ fontSize: '1.25rem', color: 'var(--text-secondary)', maxWidth: '600px', margin: '0 auto 2rem' }}>
        A revolutionary component library with physics-based animations,
        perceptually uniform colors, and zero external dependencies.
      </p>
      <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginBottom: '4rem' }}>
        <${shimmer} size="lg">Get Started</${shimmer}>
        <${btn} variant="outline" size="lg">Documentation</${btn}>
      </div>

      {/* Features Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '1.5rem',
        textAlign: 'left',
      }}>
        {features.map((f) => (
          <${card} key={f.title} padding="lg" hoverable>
            <h3 style={{ marginBottom: '0.5rem' }}>{f.title}</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>{f.description}</p>
          </${card}>
        ))}
      </div>
    </div>
  )
}`
}

function dataTableTemplate(tier: string): string {
  const ip = importPath(tier)
  const dt = tierName('DataTable', tier)
  const si = tierName('SearchInput', tier)
  const badge = tierName('Badge', tier)
  const btn = tierName('Button', tier)
  const card = tierName('Card', tier)

  return `import { ${dt}, ${si}, ${badge}, ${btn}, ${card} } from '${ip}'
import { useState, useMemo } from 'react'

const allData = [
  { id: 1, name: 'Alice Johnson', role: 'Engineer', status: 'Active', email: 'alice@example.com' },
  { id: 2, name: 'Bob Smith', role: 'Designer', status: 'Active', email: 'bob@example.com' },
  { id: 3, name: 'Carol Williams', role: 'PM', status: 'Away', email: 'carol@example.com' },
  { id: 4, name: 'Dave Brown', role: 'Engineer', status: 'Active', email: 'dave@example.com' },
  { id: 5, name: 'Eve Davis', role: 'QA', status: 'Offline', email: 'eve@example.com' },
  { id: 6, name: 'Frank Miller', role: 'DevOps', status: 'Active', email: 'frank@example.com' },
  { id: 7, name: 'Grace Lee', role: 'Engineer', status: 'Active', email: 'grace@example.com' },
  { id: 8, name: 'Hank Wilson', role: 'Designer', status: 'Away', email: 'hank@example.com' },
]

const columns = [
  { key: 'name', header: 'Name' },
  { key: 'role', header: 'Role' },
  { key: 'status', header: 'Status', render: (row: any) => (
    <${badge}
      variant="soft"
      color={row.status === 'Active' ? 'green' : row.status === 'Away' ? 'yellow' : 'gray'}
    >
      {row.status}
    </${badge}>
  )},
  { key: 'email', header: 'Email' },
]

export default function TeamTable() {
  const [search, setSearch] = useState('')

  const filtered = useMemo(() => {
    if (!search) return allData
    const q = search.toLowerCase()
    return allData.filter((row) =>
      row.name.toLowerCase().includes(q) ||
      row.role.toLowerCase().includes(q) ||
      row.email.toLowerCase().includes(q)
    )
  }, [search])

  return (
    <div style={{ maxWidth: '900px', margin: '2rem auto', padding: '0 1rem' }}>
      <${card} padding="lg">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h2>Team Members</h2>
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
            <${si} placeholder="Search..." value={search} onChange={setSearch} />
            <${btn} variant="primary" size="sm">Add Member</${btn}>
          </div>
        </div>
        <${dt}
          columns={columns}
          data={filtered}
          sortable
          selectable
          pagination={{ pageSize: 5 }}
        />
      </${card}>
    </div>
  )
}`
}

// ─── Framework Adapters ─────────────────────────────────────────────────────

function reactToVue(react: string): string {
  // Extract import names and build Vue script setup
  const importMatch = react.match(/import \{([^}]+)\} from '([^']+)'/)
  const components = importMatch ? importMatch[1].trim() : ''
  const pkg = importMatch ? importMatch[2] : '@annondeveloper/ui-kit'

  // Simple JSX to Vue template transform
  let template = react
    // Remove React-specific imports
    .replace(/import .* from 'react'\n?/g, '')
    // className -> class
    .replace(/className=/g, 'class=')
    // onChange handlers
    .replace(/onChange=\{([^}]+)\}/g, '@change="$1"')
    // onClick handlers
    .replace(/onClick=\{([^}]+)\}/g, '@click="$1"')
    // {variable} -> {{ variable }}
    .replace(/\{(\w+(?:\.\w+)*)\}/g, '{{ $1 }}')

  return `<script setup lang="ts">
import { ref } from 'vue'
import { ${components} } from '${pkg}'

// Adapt state from React useState to Vue ref()
// Example: const name = ref('')
</script>

<template>
  <!-- Adapt the React JSX below to Vue template syntax -->
  <!-- Key changes: className -> class, onClick -> @click, {var} -> {{ var }} -->
  <!--
${template.split('\n').map(l => '    ' + l).join('\n')}
  -->
</template>

<style scoped>
/* Add component styles here */
</style>`
}

function reactToAngular(react: string): string {
  const importMatch = react.match(/import \{([^}]+)\} from '([^']+)'/)
  const components = importMatch ? importMatch[1].trim() : ''

  return `// ${components.split(',').map((c: string) => c.trim()).join(', ')} Component
// Angular adapter — install: npm i @annondeveloper/ui-kit

import { Component } from '@angular/core';

@Component({
  selector: 'app-generated',
  template: \`
    <!-- Adapt the React JSX to Angular template syntax -->
    <!-- Key changes: className -> class, onClick -> (click), {var} -> {{ var }} -->
    <!-- Conditional: {cond && <X>} -> <X *ngIf="cond"> -->
    <!-- Loop: {arr.map(i => <X>)} -> <X *ngFor="let i of arr"> -->

    <div class="container">
      <p>Adapt the React code to Angular template syntax.</p>
      <p>Components used: ${components}</p>
    </div>
  \`,
  styles: [\`
    .container { max-width: 1200px; margin: 0 auto; padding: 2rem; }
  \`]
})
export class GeneratedComponent {
  // Adapt React state to class properties
  // Example: name = '';
}

/*
  Original React code for reference:

${react.split('\n').map(l => '  ' + l).join('\n')}
*/`
}

function reactToSvelte(react: string): string {
  const importMatch = react.match(/import \{([^}]+)\} from '([^']+)'/)
  const components = importMatch ? importMatch[1].trim() : ''
  const pkg = importMatch ? importMatch[2] : '@annondeveloper/ui-kit'

  return `<script lang="ts">
  import { ${components} } from '${pkg}'

  // Adapt React useState to Svelte $state
  // Example: let name = $state('')
</script>

<!-- Adapt the React JSX to Svelte template syntax -->
<!-- Key changes: className -> class, onClick -> on:click, {var} -> {var} (same!) -->
<!-- Conditional: {cond && <X>} -> {#if cond}<X>{/if} -->
<!-- Loop: {arr.map(i => <X>)} -> {#each arr as i}<X>{/each} -->

<div class="container">
  <p>Adapt the React code to Svelte template syntax.</p>
  <p>Components used: ${components}</p>
</div>

<!--
  Original React code for reference:

${react.split('\n').map(l => '  ' + l).join('\n')}
-->

<style>
  .container { max-width: 1200px; margin: 0 auto; padding: 2rem; }
</style>`
}

function reactToHtml(react: string): string {
  // Extract a simple static HTML version
  const importMatch = react.match(/import \{([^}]+)\} from '([^']+)'/)
  const pkg = importMatch ? importMatch[2] : '@annondeveloper/ui-kit'

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Generated UI</title>
  <!-- UI Kit standalone CSS -->
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/${pkg}/css/all.css" />
  <style>
    :root { color-scheme: dark; }
    body {
      font-family: system-ui, -apple-system, sans-serif;
      background: oklch(15% 0.02 270);
      color: oklch(90% 0.01 270);
      margin: 0;
      padding: 2rem;
    }
    .container { max-width: 1200px; margin: 0 auto; }
    .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 1rem; }
    .card { background: oklch(20% 0.02 270); border-radius: 12px; padding: 1.5rem; }
    .btn { padding: 0.75rem 1.5rem; border-radius: 8px; border: none; cursor: pointer; font-weight: 600; }
    .btn-primary { background: oklch(65% 0.25 270); color: white; }
    .input { width: 100%; padding: 0.625rem; border-radius: 8px; border: 1px solid oklch(30% 0.02 270); background: oklch(18% 0.02 270); color: inherit; }
  </style>
</head>
<body>
  <div class="container">
    <h1>Generated Layout</h1>
    <p>This is a static HTML version. For full interactivity, use the React/Vue/Svelte/Angular versions.</p>

    <div class="grid" style="margin-top: 2rem;">
      <div class="card">
        <h3>Component 1</h3>
        <p>Replace with your content.</p>
      </div>
      <div class="card">
        <h3>Component 2</h3>
        <p>Replace with your content.</p>
      </div>
      <div class="card">
        <h3>Component 3</h3>
        <p>Replace with your content.</p>
      </div>
      <div class="card">
        <h3>Component 4</h3>
        <p>Replace with your content.</p>
      </div>
    </div>

    <div class="card" style="margin-top: 2rem;">
      <h2>Data Section</h2>
      <p>Use the standalone CSS classes (ui-button, ui-card, etc.) for styling without React.</p>
      <button class="btn btn-primary" style="margin-top: 1rem;">Action</button>
    </div>
  </div>

  <!--
    Original React code for reference:

${react.split('\n').map(l => '    ' + l).join('\n')}
  -->
</body>
</html>`
}

// ─── Public API ─────────────────────────────────────────────────────────────

/**
 * Generate code from a predefined layout template.
 */
export function generateFromTemplate(template: LayoutTemplate, tier = 'standard'): GeneratedCode {
  let react: string

  switch (template) {
    case 'dashboard':
      react = dashboardTemplate(tier)
      break
    case 'form':
      react = formTemplate(tier)
      break
    case 'marketing':
      react = marketingTemplate(tier)
      break
    case 'data-table':
      react = dataTableTemplate(tier)
      break
    default:
      react = '// Select a template or add components to generate code.'
  }

  return {
    react,
    vue: reactToVue(react),
    angular: reactToAngular(react),
    svelte: reactToSvelte(react),
    html: reactToHtml(react),
  }
}

/**
 * Generate code from a custom selection of components with a layout.
 */
export function generateFromComponents(
  components: ComponentInfo[],
  layout: 'stack' | 'grid' | 'sidebar',
  tier = 'standard',
): GeneratedCode {
  if (components.length === 0) {
    const empty = '// Add components from the list to generate code.'
    return { react: empty, vue: empty, angular: empty, svelte: empty, html: empty }
  }

  const ip = importPath(tier)
  const names = components.map(c => tierName(c.name, tier))
  const uniqueNames = [...new Set(names)]
  const imports = `import { ${uniqueNames.join(', ')} } from '${ip}'`

  const layoutStyle = layout === 'grid'
    ? `display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem'`
    : layout === 'sidebar'
    ? `display: 'grid', gridTemplateColumns: '280px 1fr', gap: '1.5rem'`
    : `display: 'flex', flexDirection: 'column', gap: '1.5rem'`

  const componentJsx = components.map(c => {
    const name = tierName(c.name, tier)
    return `        {/* ${c.name}: ${c.description.slice(0, 60)} */}\n        ${c.example.replace(new RegExp(`<${c.name}`, 'g'), `<${name}`).replace(new RegExp(`</${c.name}>`, 'g'), `</${name}>`)}`
  }).join('\n\n')

  const react = `${imports}

export default function CustomLayout() {
  return (
    <div style={{ maxWidth: '1200px', margin: '2rem auto', padding: '0 1rem' }}>
      <h1 style={{ marginBottom: '1.5rem' }}>Custom Layout</h1>
      <div style={{ ${layoutStyle} }}>
${componentJsx}
      </div>
    </div>
  )
}`

  return {
    react,
    vue: reactToVue(react),
    angular: reactToAngular(react),
    svelte: reactToSvelte(react),
    html: reactToHtml(react),
  }
}
