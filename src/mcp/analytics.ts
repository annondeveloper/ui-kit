import { existsSync, appendFileSync, readFileSync, mkdirSync } from 'fs'
import { join } from 'path'
import { homedir } from 'os'

const ANALYTICS_DIR = join(homedir(), '.ui-kit')
const ANALYTICS_FILE = join(ANALYTICS_DIR, 'analytics.jsonl')

interface ToolEvent {
  tool: string
  timestamp: string
  components?: string[]
  query?: string
}

function isEnabled(): boolean {
  return process.env.UI_KIT_TELEMETRY === '1'
}

export function logToolCall(tool: string, extra?: { components?: string[]; query?: string }): void {
  if (!isEnabled()) return
  try {
    if (!existsSync(ANALYTICS_DIR)) mkdirSync(ANALYTICS_DIR, { recursive: true })
    const event: ToolEvent = {
      tool,
      timestamp: new Date().toISOString(),
      ...extra,
    }
    appendFileSync(ANALYTICS_FILE, JSON.stringify(event) + '\n')
  } catch {
    // Silent fail — analytics should never break the server
  }
}

export function getStats(): { total: number; byTool: Record<string, number>; topComponents: [string, number][] } {
  const byTool: Record<string, number> = {}
  const componentCounts: Record<string, number> = {}
  let total = 0

  if (!existsSync(ANALYTICS_FILE)) return { total: 0, byTool: {}, topComponents: [] }

  try {
    const lines = readFileSync(ANALYTICS_FILE, 'utf-8').trim().split('\n').filter(Boolean)
    for (const line of lines) {
      const event = JSON.parse(line) as ToolEvent
      total++
      byTool[event.tool] = (byTool[event.tool] || 0) + 1
      if (event.components) {
        for (const c of event.components) {
          componentCounts[c] = (componentCounts[c] || 0) + 1
        }
      }
    }
  } catch {
    // Corrupted file, return what we have
  }

  const topComponents = Object.entries(componentCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)

  return { total, byTool, topComponents }
}
