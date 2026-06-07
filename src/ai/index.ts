// ─── AI Component Generator ─────────────────────────────────────────────────
// Tree-shakeable subpath entry: `@annondeveloper/ui-kit/ai`.
// Discover components from an in-bundle database and generate multi-framework
// code compositions from templates or custom selections.

export {
  getComponentDatabase,
  searchComponents,
  type ComponentInfo,
} from './component-database'

export {
  generateFromTemplate,
  generateFromComponents,
  type GeneratedCode,
  type GeneratorOptions,
  type Framework,
} from './code-generator'
