import { describe, it, expect } from 'vitest'
import { generateProjectFiles, TEMPLATE_NAMES } from '../../cli/commands/create'

describe('createCommand', () => {
  it('exposes all 5 template names', () => {
    expect(TEMPLATE_NAMES).toEqual(['dashboard', 'form', 'marketing', 'saas', 'docs'])
  })

  describe('generateProjectFiles', () => {
    it('generates required files for dashboard template', () => {
      const files = generateProjectFiles('my-app', 'dashboard', 'aurora', 'standard')
      expect(files['package.json']).toBeDefined()
      expect(files['vite.config.ts']).toBeDefined()
      expect(files['index.html']).toBeDefined()
      expect(files['src/main.tsx']).toBeDefined()
      expect(files['src/App.tsx']).toBeDefined()
    })

    it('generates required files for form template', () => {
      const files = generateProjectFiles('my-form', 'form', 'aurora', 'standard')
      expect(Object.keys(files)).toHaveLength(5)
      expect(files['src/App.tsx']).toContain('FormInput')
    })

    it('generates required files for marketing template', () => {
      const files = generateProjectFiles('landing', 'marketing', 'ocean', 'standard')
      expect(files['src/App.tsx']).toContain('Badge')
      expect(files['src/App.tsx']).toContain('Button')
    })

    it('generates required files for saas template', () => {
      const files = generateProjectFiles('saas-app', 'saas', 'aurora', 'standard')
      expect(files['src/App.tsx']).toContain('Tabs')
      expect(files['src/App.tsx']).toContain('DataTable')
    })

    it('generates required files for docs template', () => {
      const files = generateProjectFiles('docs-site', 'docs', 'aurora', 'standard')
      expect(files['src/App.tsx']).toContain('CopyBlock')
    })

    it('includes theme name in main.tsx UIProvider', () => {
      const files = generateProjectFiles('test', 'dashboard', 'ocean', 'standard')
      expect(files['src/main.tsx']).toContain('theme="ocean"')
    })

    it('includes project name in package.json', () => {
      const files = generateProjectFiles('cool-project', 'dashboard', 'aurora', 'standard')
      const pkg = JSON.parse(files['package.json'])
      expect(pkg.name).toBe('cool-project')
    })

    it('package.json has correct dependencies', () => {
      const files = generateProjectFiles('test', 'dashboard', 'aurora', 'standard')
      const pkg = JSON.parse(files['package.json'])
      expect(pkg.dependencies['react']).toBeDefined()
      expect(pkg.dependencies['react-dom']).toBeDefined()
      expect(pkg.dependencies['@annondeveloper/ui-kit']).toBeDefined()
      expect(pkg.devDependencies['vite']).toBeDefined()
    })

    it('throws on unknown template', () => {
      expect(() => generateProjectFiles('test', 'unknown', 'aurora', 'standard'))
        .toThrow('Unknown template "unknown"')
    })
  })
})
