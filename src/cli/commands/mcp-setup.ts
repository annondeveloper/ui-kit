import { existsSync, readFileSync, writeFileSync, mkdirSync } from 'fs'
import { join, dirname } from 'path'
import { homedir, platform } from 'os'
import { createInterface } from 'readline'

const SERVER_ENTRY = {
  command: 'npx',
  args: ['-y', '@annondeveloper/ui-kit-mcp'],
}

const SERVER_NAME = 'ui-kit'

interface ConfigTarget {
  name: string
  path: string
  key: string
}

function getConfigTargets(): ConfigTarget[] {
  const home = homedir()
  const os = platform()
  const targets: ConfigTarget[] = []

  // Claude Desktop
  let desktopPath: string
  if (os === 'darwin') {
    desktopPath = join(home, 'Library', 'Application Support', 'Claude', 'claude_desktop_config.json')
  } else if (os === 'win32') {
    desktopPath = join(process.env.APPDATA || join(home, 'AppData', 'Roaming'), 'Claude', 'claude_desktop_config.json')
  } else {
    desktopPath = join(home, '.config', 'Claude', 'claude_desktop_config.json')
  }
  targets.push({ name: 'Claude Desktop', path: desktopPath, key: 'mcpServers' })

  // Claude Code — check both locations, prefer settings.json
  const claudeSettings = join(home, '.claude', 'settings.json')
  const claudeJson = join(home, '.claude.json')
  if (existsSync(claudeSettings)) {
    targets.push({ name: 'Claude Code', path: claudeSettings, key: 'mcpServers' })
  } else if (existsSync(claudeJson)) {
    targets.push({ name: 'Claude Code', path: claudeJson, key: 'mcpServers' })
  }

  // Cursor
  const cursorPath = join(home, '.cursor', 'mcp.json')
  targets.push({ name: 'Cursor', path: cursorPath, key: 'mcpServers' })

  return targets
}

function readJsonSafe(filePath: string): Record<string, unknown> {
  if (!existsSync(filePath)) return {}
  try {
    return JSON.parse(readFileSync(filePath, 'utf-8'))
  } catch {
    return {}
  }
}

function mergeServerEntry(config: Record<string, unknown>, key: string): Record<string, unknown> {
  const servers = (config[key] as Record<string, unknown>) || {}
  return {
    ...config,
    [key]: {
      ...servers,
      [SERVER_NAME]: SERVER_ENTRY,
    },
  }
}

function prompt(question: string): Promise<string> {
  const rl = createInterface({ input: process.stdin, output: process.stdout })
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close()
      resolve(answer.trim().toLowerCase())
    })
  })
}

export async function mcpSetupCommand(): Promise<void> {
  const os = platform()
  console.log(`\nDetected OS: ${os === 'darwin' ? 'macOS' : os === 'win32' ? 'Windows' : 'Linux'}`)

  const targets = getConfigTargets()
  const writes: { target: ConfigTarget; merged: Record<string, unknown> }[] = []

  for (const target of targets) {
    const existing = readJsonSafe(target.path)
    const merged = mergeServerEntry(existing, target.key)
    writes.push({ target, merged })
  }

  // Show the user what will be written
  console.log('\nThe following config files will be updated:\n')
  for (const { target, merged } of writes) {
    const exists = existsSync(target.path)
    console.log(`  ${target.name}: ${target.path}${exists ? '' : ' (new file)'}`)
    console.log(`  ${JSON.stringify(merged, null, 2).split('\n').join('\n  ')}\n`)
  }

  const answer = await prompt('Proceed? [y/N] ')

  if (answer !== 'y' && answer !== 'yes') {
    console.log('\nNo files were modified. Add this manually to your MCP config:\n')
    console.log(JSON.stringify({ [SERVER_NAME]: SERVER_ENTRY }, null, 2))
    console.log()
    return
  }

  // Write each config
  for (const { target, merged } of writes) {
    const dir = dirname(target.path)
    if (!existsSync(dir)) mkdirSync(dir, { recursive: true })
    writeFileSync(target.path, JSON.stringify(merged, null, 2) + '\n', 'utf-8')
    console.log(`\u2713 Updated ${target.name}: ${target.path}`)
  }

  console.log('\nNext steps: Restart Claude/Cursor to use the MCP server.\n')
}
