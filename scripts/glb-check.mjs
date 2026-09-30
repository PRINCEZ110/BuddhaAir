import puppeteer from 'puppeteer-core'
import { mkdirSync } from 'node:fs'

const chromePath = process.env.CHROME_PATH || 'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe'
const url = process.env.SITE_URL || 'http://127.0.0.1:5173'
// SwiftShader always reports `low`, and low tier intentionally keeps the
// procedural airframe, so force a tier that actually mounts the GLB.
const target = `${url}${url.includes('?') ? '&' : '?'}q=${process.env.Q || 'high'}`
const outDir = '.screenshots'
mkdirSync(outDir, { recursive: true })

const browser = await puppeteer.launch({
  executablePath: chromePath,
  headless: 'new',
  args: ['--no-sandbox', '--disable-gpu', '--use-gl=swiftshader', '--enable-unsafe-swiftshader']
})
const page = await browser.newPage()
await page.setViewport({ width: 1440, height: 900 })

const fetched = []
page.on('response', (res) => {
  const u = res.url()
  if (u.includes('/models/') || u.includes('/draco/')) fetched.push(`${res.status()} ${u.replace(url, '')}`)
})
const errors = []
page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()) })
page.on('pageerror', (e) => errors.push(`PAGE: ${e.message}`))

await page.goto(target, { waitUntil: 'domcontentloaded', timeout: 60000 })

let model = null
for (let i = 0; i < 60; i++) {
  model = await page.evaluate(() => window.__baAircraftModel || null)
  if (model === 'glb') break
  await new Promise((r) => setTimeout(r, 250))
}
const tier = await page.evaluate(() => window.__baTier?.tier ?? '?')
console.log(`tier: ${tier}   airframe: ${model}`)
console.log(`assets fetched:\n  ${fetched.length ? fetched.join('\n  ') : '(none)'}`)

const failures = []
const beats = [
  { name: 'glb_runway', t: 0.10 },
  { name: 'glb_climb', t: 0.45 },
  { name: 'glb_fleet', t: 0.61 }
]

if (tier !== 'high') failures.push(`tier was "${tier}", expected "high"`)
if (model !== 'glb') failures.push(`airframe was "${model}", expected "glb"`)
if (!fetched.length) failures.push('GLB was never fetched')
if (fetched.some((f) => !f.startsWith('200'))) failures.push(`bad asset status: ${fetched.join(', ')}`)

for (const b of beats) {
  await page.evaluate((t) => window.scrollTo(0, window.__baScrollForT(t)), b.t)
  await page.evaluate(() => new Promise((r) => {
    let n = 0
    const step = () => { if (++n >= 4) r(); else requestAnimationFrame(step) }
    requestAnimationFrame(step)
  }))
  await new Promise((r) => setTimeout(r, 400))
  const t = await page.evaluate(() => window.__baProgress)
  await page.screenshot({ path: `${outDir}/${b.name}.png` })
  if (Math.abs(t - b.t) > 0.012) failures.push(`${b.name}: t=${t.toFixed(4)} want=${b.t}`)
}

if (errors.length) failures.push(`${errors.length} console error(s)`)
console.log(`console errors: ${errors.length ? `\n  ${errors.join('\n  ')}` : 'none'}`)

await browser.close()

if (failures.length) {
  console.error(`FAIL: ${failures.join('; ')}`)
  process.exit(1)
}
console.log('ALL CHECKS PASSED')
