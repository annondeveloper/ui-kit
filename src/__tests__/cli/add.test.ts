import { describe, it, expect } from 'vitest'
import { rewriteImports } from '../../cli/commands/add'

describe('addCommand', () => {
  describe('rewriteImports', () => {
    it('rewrites core style imports to main package', () => {
      const input = `import { useStyles } from '../core/styles'`
      expect(rewriteImports(input)).toBe(
        `import { useStyles } from '@annondeveloper/ui-kit'`
      )
    })

    it('rewrites core motion imports to main package', () => {
      const input = `import { animate } from '../core/motion/animate'`
      expect(rewriteImports(input)).toBe(
        `import { animate } from '@annondeveloper/ui-kit'`
      )
    })

    it('rewrites core tokens imports to theme entry', () => {
      const input = `import { generateTheme } from '../core/tokens/generator'`
      expect(rewriteImports(input)).toBe(
        `import { generateTheme } from '@annondeveloper/ui-kit/theme'`
      )
    })

    it('rewrites core forms imports to form entry', () => {
      const input = `import { useForm } from '../core/forms/use-form'`
      expect(rewriteImports(input)).toBe(
        `import { useForm } from '@annondeveloper/ui-kit/form'`
      )
    })

    it('rewrites component relative imports to main package', () => {
      const input = `import { Button } from '../components/Button'`
      expect(rewriteImports(input)).toBe(
        `import { Button } from '@annondeveloper/ui-kit'`
      )
    })

    it('rewrites domain relative imports to main package', () => {
      const input = `import { MetricCard } from '../domain/MetricCard'`
      expect(rewriteImports(input)).toBe(
        `import { MetricCard } from '@annondeveloper/ui-kit'`
      )
    })

    it('handles multiple imports in one file', () => {
      const input = [
        `import { useStyles } from '../core/styles'`,
        `import { generateTheme } from '../core/tokens/generator'`,
        `import { Button } from '../components/Button'`,
      ].join('\n')
      const output = rewriteImports(input)
      expect(output).toContain(`from '@annondeveloper/ui-kit'`)
      expect(output).toContain(`from '@annondeveloper/ui-kit/theme'`)
      // All three lines should be rewritten
      expect(output).not.toContain('../core/')
      expect(output).not.toContain('../components/')
    })

    it('does not modify external package imports', () => {
      const input = `import React from 'react'`
      expect(rewriteImports(input)).toBe(`import React from 'react'`)
    })
  })
})
