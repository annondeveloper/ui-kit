import { readFileSync, writeFileSync, mkdirSync, readdirSync, existsSync, copyFileSync } from 'fs'
import { join, basename } from 'path'

const SRC_COMPONENTS = 'src/components'
const SRC_DOMAIN = 'src/domain'
const DIST_CSS = 'dist/css'
const DIST_COMPONENTS = 'dist/css/components'
const THEME_SRC = 'src/core/tokens/theme.css'

// Ensure output dirs exist
mkdirSync(DIST_CSS, { recursive: true })
mkdirSync(DIST_COMPONENTS, { recursive: true })

// Extract CSS from css`...` tagged template literals in source files
function extractCSS(filePath) {
  const content = readFileSync(filePath, 'utf-8')
  // Match css`...` tagged template literals
  // Uses a non-greedy match between css` and the next unescaped backtick
  const cssRegex = /css`([\s\S]*?)`/g
  const matches = []
  let match
  while ((match = cssRegex.exec(content)) !== null) {
    const css = match[1].trim()
    if (css) {
      matches.push(css)
    }
  }
  return matches.join('\n\n')
}

// Process component directories
const allCSS = []
let componentCount = 0

for (const dir of [SRC_COMPONENTS, SRC_DOMAIN]) {
  if (!existsSync(dir)) continue
  const files = readdirSync(dir)
    .filter(f => f.endsWith('.tsx') && !f.endsWith('.test.tsx') && !f.endsWith('.stories.tsx'))
    .sort()

  for (const file of files) {
    const filePath = join(dir, file)
    const css = extractCSS(filePath)
    if (css) {
      const name = basename(file, '.tsx')
      writeFileSync(join(DIST_COMPONENTS, `${name}.css`), css + '\n')
      allCSS.push(`/* ${name} */\n${css}`)
      componentCount++
    }
  }
}

// Write bundled all.css
if (allCSS.length > 0) {
  writeFileSync(join(DIST_CSS, 'all.css'), allCSS.join('\n\n') + '\n')
}

// Copy theme CSS
if (existsSync(THEME_SRC)) {
  copyFileSync(THEME_SRC, join(DIST_CSS, 'theme.css'))
  console.log(`CSS extraction: copied theme.css`)
}

console.log(`CSS extraction: ${componentCount} components extracted to ${DIST_CSS}`)
