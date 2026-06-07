import { chromium } from 'playwright'
import fs from 'fs'

// Builds contact-sheet PNGs from the per-component screenshots in /tmp/sweep,
// so the full tier sweep can be reviewed in a handful of images.
const SWEEP = '/tmp/sweep'
const OUT = '/tmp/sweep/contact'
fs.mkdirSync(OUT, { recursive: true })

const components = JSON.parse(fs.readFileSync(`${SWEEP}/_components.json`, 'utf-8'))
const PER_SHEET = 20
const sheets = []
for (let i = 0; i < components.length; i += PER_SHEET) {
  sheets.push(components.slice(i, i + PER_SHEET))
}

const browser = await chromium.launch({
  executablePath: process.env.CHROME_BIN || '/usr/bin/google-chrome',
  args: ['--no-sandbox', '--disable-gpu'],
})
const page = await browser.newPage({ viewport: { width: 1400, height: 1000 } })

let n = 0
for (const sheet of sheets) {
  n++
  const cards = sheet
    .map(name => {
      const file = `${SWEEP}/${name}.png`
      if (!fs.existsSync(file)) return ''
      const b64 = fs.readFileSync(file).toString('base64')
      return `<figure><figcaption>${name}</figcaption><img src="data:image/png;base64,${b64}"/></figure>`
    })
    .join('\n')
  const html = `<!doctype html><html><head><meta charset="utf-8"><style>
    body{margin:0;background:#0a0a0f;font-family:system-ui;padding:12px}
    .grid{display:grid;grid-template-columns:repeat(2,1fr);gap:14px}
    figure{margin:0;background:#13131a;border:1px solid #222;border-radius:8px;overflow:hidden}
    figcaption{color:#9aa;font-size:13px;padding:6px 10px;border-bottom:1px solid #222}
    img{width:100%;display:block;background:#0d0d12}
  </style></head><body><div class="grid">${cards}</div></body></html>`
  const htmlPath = `${OUT}/sheet-${n}.html`
  fs.writeFileSync(htmlPath, html)
  await page.goto('file://' + htmlPath, { waitUntil: 'load' })
  await page.waitForTimeout(200)
  await page.screenshot({ path: `${OUT}/sheet-${String(n).padStart(2, '0')}.png`, fullPage: true })
}
await browser.close()
console.log(`built ${n} contact sheets in ${OUT}`)
