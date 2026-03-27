import { readFileSync, writeFileSync, existsSync } from 'fs'
import { join, resolve } from 'path'

export interface UIKitConfig {
  tier: string
  theme: string
  outDir: string
}

const CONFIG_FILE = 'ui-kit.config.json'

const defaults: UIKitConfig = {
  tier: 'standard',
  theme: 'aurora',
  outDir: './src/components',
}

export function loadConfig(dir?: string): UIKitConfig | null {
  const configPath = join(resolve(dir || '.'), CONFIG_FILE)
  if (!existsSync(configPath)) return null
  try {
    const raw = readFileSync(configPath, 'utf-8')
    const parsed = JSON.parse(raw)
    return { ...defaults, ...parsed }
  } catch {
    return null
  }
}

export function saveConfig(config: UIKitConfig, dir?: string): void {
  const configPath = join(resolve(dir || '.'), CONFIG_FILE)
  writeFileSync(configPath, JSON.stringify(config, null, 2) + '\n', 'utf-8')
}
