import { writeFileSync, mkdirSync } from 'fs'
import { resolve, dirname } from 'path'
import { themes, lightThemes, type ThemeName } from '../../core/tokens/themes'
import { generateTheme, type ThemeMode } from '../../core/tokens/generator'
import { themeToFigmaVariables } from '../utils/figma-tokens'
import type { ThemeTokens } from '../../core/tokens/tokens'

function isThemeName(name: string): name is ThemeName {
  return name in themes
}

function isHexColor(str: string): boolean {
  return /^#?[0-9a-fA-F]{6}$/.test(str)
}

function resolveTheme(themeArg: string, mode: ThemeMode): ThemeTokens {
  if (isThemeName(themeArg)) {
    return mode === 'light' ? lightThemes[themeArg] : themes[themeArg]
  }
  const hex = themeArg.startsWith('#') ? themeArg : `#${themeArg}`
  if (isHexColor(hex)) {
    return generateTheme(hex, mode)
  }
  throw new Error(`"${themeArg}" is not a known theme name or valid hex color.`)
}

export function figmaExportCommand(options: { theme: string; output: string; mode?: string }): void {
  const mode = (options.mode === 'light' ? 'light' : 'dark') as ThemeMode
  const output = resolve(options.output)

  let tokens: ThemeTokens
  try {
    tokens = resolveTheme(options.theme, mode)
  } catch (err: any) {
    console.error(err.message)
    console.error(`Available themes: ${Object.keys(themes).join(', ')}`)
    process.exit(1)
  }

  const figmaJson = themeToFigmaVariables(tokens, options.theme, mode)

  mkdirSync(dirname(output), { recursive: true })
  writeFileSync(output, JSON.stringify(figmaJson, null, 2) + '\n', 'utf-8')
  console.log(`\u2713 Exported Figma variables to ${output}`)
  console.log(`  Theme: ${options.theme} | Mode: ${mode}`)
}
