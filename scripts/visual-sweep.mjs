import { chromium } from 'playwright'
import fs from 'fs'

const BASE = 'http://localhost:5173/ui-kit'
const OUT = '/tmp/sweep'
fs.rmSync(OUT, { recursive: true, force: true })
fs.mkdirSync(OUT, { recursive: true })

const browser = await chromium.launch({
  executablePath: process.env.CHROME_BIN || '/usr/bin/google-chrome',
  args: ['--no-sandbox', '--disable-gpu'],
})
const page = await browser.newPage({ viewport: { width: 1280, height: 820 } })

const errorsByComponent = {}
let current = '_init'
page.on('console', m => {
  if (m.type() !== 'error') return
  const t = m.text()
  if (t.includes('favicon') || t.includes('404')) return
  ;(errorsByComponent[current] = errorsByComponent[current] || []).push(t)
})
page.on('pageerror', e => {
  ;(errorsByComponent[current] = errorsByComponent[current] || []).push('PAGEERROR: ' + e.message)
})

await page.goto(`${BASE}/comparison`, { waitUntil: 'networkidle' })

const optionEls = await page.$$('.comp__select option')
const values = []
for (const o of optionEls) {
  const v = await o.getAttribute('value')
  if (v && !/select a component/i.test(v)) values.push(v)
}
console.log('components to sweep:', values.length)

const grid = '.comp__grid'
for (const v of values) {
  current = v
  await page.selectOption('.comp__select', v)
  await page.waitForTimeout(450)
  try {
    const el = await page.$(grid)
    if (el) await el.screenshot({ path: `${OUT}/${v}.png` })
    else await page.screenshot({ path: `${OUT}/${v}.png` })
  } catch (e) {
    errorsByComponent[v] = errorsByComponent[v] || []
    errorsByComponent[v].push('SCREENSHOT_FAIL: ' + e.message)
  }
}

fs.writeFileSync(`${OUT}/_errors.json`, JSON.stringify(errorsByComponent, null, 2))
fs.writeFileSync(`${OUT}/_components.json`, JSON.stringify(values, null, 2))
await browser.close()

const withErrors = Object.keys(errorsByComponent).filter(k => k !== '_init')
console.log('done. components with console errors:', withErrors.length)
for (const k of withErrors) console.log('  -', k, '->', errorsByComponent[k].length, 'error(s)')
