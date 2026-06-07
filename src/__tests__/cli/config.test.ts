import { describe, it, expect, afterEach } from 'vitest'
import { mkdtempSync, writeFileSync, rmSync } from 'fs'
import { join } from 'path'
import { tmpdir } from 'os'
import { loadConfig, saveConfig } from '../../cli/config'

describe('CLI config', () => {
  const dirs: string[] = []
  function tempDir(): string {
    const d = mkdtempSync(join(tmpdir(), 'uikit-cfg-'))
    dirs.push(d)
    return d
  }
  afterEach(() => {
    for (const d of dirs.splice(0)) rmSync(d, { recursive: true, force: true })
  })

  it('returns null when no config file exists', () => {
    expect(loadConfig(tempDir())).toBeNull()
  })

  it('merges a partial config over defaults', () => {
    const dir = tempDir()
    writeFileSync(join(dir, 'ui-kit.config.json'), JSON.stringify({ tier: 'lite' }))
    const config = loadConfig(dir)
    expect(config).not.toBeNull()
    expect(config!.tier).toBe('lite')
    // defaults fill the rest
    expect(config!.theme).toBe('aurora')
    expect(config!.outDir).toBe('./src/components')
    expect(config!.typescript).toBe(true)
  })

  it('round-trips via saveConfig/loadConfig', () => {
    const dir = tempDir()
    saveConfig({ tier: 'premium', theme: 'midnight', outDir: './ui', typescript: false }, dir)
    expect(loadConfig(dir)).toEqual({
      tier: 'premium',
      theme: 'midnight',
      outDir: './ui',
      typescript: false,
    })
  })

  it('returns null on malformed JSON', () => {
    const dir = tempDir()
    writeFileSync(join(dir, 'ui-kit.config.json'), '{ not valid json')
    expect(loadConfig(dir)).toBeNull()
  })
})
