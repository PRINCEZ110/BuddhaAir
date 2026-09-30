import puppeteer from 'puppeteer-core'
import { mkdirSync, writeFileSync, readFileSync, existsSync } from 'node:fs'

const chromePath = process.env.CHROME_PATH || 'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe'
const url = process.env.SITE_URL || 'http://localhost:5173'
const outDir = '.perf'
mkdirSync(outDir, { recursive: true })

const argTiers = process.argv.slice(2).filter((a) => a.startsWith('--q=')).map((a) => a.slice(4))
const tiers = argTiers.length ? argTiers : ['default']
const saveAs = (process.argv.slice(2).find((a) => a.startsWith('--save=')) || '').slice(7)
const beats = [0, 0.05, 0.11, 0.16, 0.22, 0.29, 0.34, 0.4, 0.47, 0.54, 0.6, 0.65, 0.7, 0.78, 0.9, 1]

const browser = await puppeteer.launch({
  executablePath: chromePath,
  headless: 'new',
  args: ['--no-sandbox', '--disable-gpu', '--use-gl=swiftshader', '--enable-unsafe-swiftshader']
})

async function instrument(page) {
  await page.evaluateOnNewDocument(() => {
    window.__p = { draws: 0, tris: 0, lines: 0, frames: 0, tex: 0, prog: 0, shaders: 0 }
    for (const P of [window.WebGLRenderingContext?.prototype, window.WebGL2RenderingContext?.prototype]) {
      if (!P) continue
      const de = P.drawElements
      const da = P.drawArrays
      const dei = P.drawElementsInstanced
      const dai = P.drawArraysInstanced
      P.drawElements = function (m, c, ...a) { window.__p.draws++; if (m === 4) window.__p.tris += c / 3; else if (m === 1) window.__p.lines += c / 2; return de.call(this, m, c, ...a) }
      P.drawArrays = function (m, f, c) { window.__p.draws++; if (m === 4) window.__p.tris += c / 3; else if (m === 1) window.__p.lines += c / 2; return da.call(this, m, f, c) }
      if (dei) P.drawElementsInstanced = function (m, c, t, o, i) { window.__p.draws++; if (m === 4) window.__p.tris += (c / 3) * i; return dei.call(this, m, c, t, o, i) }
      if (dai) P.drawArraysInstanced = function (m, f, c, i) { window.__p.draws++; if (m === 4) window.__p.tris += (c / 3) * i; return dai.call(this, m, f, c, i) }
      const ct = P.createTexture
      P.createTexture = function () { window.__p.tex++; return ct.call(this) }
      const cs = P.createShader
      P.createShader = function (t) { window.__p.shaders++; return cs.call(this, t) }
      const lp = P.linkProgram
      P.linkProgram = function (p) { window.__p.prog++; return lp.call(this, p) }
    }
    const tick = () => { window.__p.frames++; requestAnimationFrame(tick) }
    requestAnimationFrame(tick)
  })
}

async function sample(page, windowMs) {
  const a = await page.evaluate(() => ({ ...window.__p }))
  const t0 = Date.now()
  await new Promise((r) => setTimeout(r, windowMs))
  const b = await page.evaluate(() => ({ ...window.__p }))
  const dt = (Date.now() - t0) / 1000
  const frames = b.frames - a.frames
  return {
    fps: +(frames / dt).toFixed(1),
    draws: frames ? +((b.draws - a.draws) / frames).toFixed(1) : 0,
    tris: frames ? Math.round((b.tris - a.tris) / frames) : 0,
    lines: frames ? Math.round((b.lines - a.lines) / frames) : 0,
    textures: b.tex,
    programs: b.prog,
    shaders: b.shaders
  }
}

const results = {}

for (const tier of tiers) {
  const page = await browser.newPage()
  const errors = []
  page.on('pageerror', (e) => errors.push(e.message))
  page.on('console', (m) => { if (m.type() === 'error' && !m.text().includes('404')) errors.push(m.text()) })
  await page.setViewport({ width: 1440, height: 900 })
  await instrument(page)
  const target = tier === 'default' ? url : url + (url.includes('?') ? '&' : '?') + 'q=' + tier
  await page.goto(target, { waitUntil: 'networkidle2', timeout: 60000 })
  await new Promise((r) => setTimeout(r, 6000))

  const rows = []
  for (const s of beats) {
    // Beats are `t` on the timeline, not raw document fractions: raw
    // fractions drift whenever a section changes height, which would sample
    // different content and make the baseline incomparable.
    await page.evaluate((v) => {
      const max = document.documentElement.scrollHeight - window.innerHeight
      const y = typeof window.__baScrollForT === 'function' ? window.__baScrollForT(v) : max * v
      window.scrollTo(0, Math.round(y))
    }, s)
    const deadline = Date.now() + 5000
    while (Date.now() < deadline) {
      const settled = await page.evaluate(
        (v) => Math.abs((typeof window.__baProgress === 'number' ? window.__baProgress : 0) - v) < 0.012,
        s
      )
      if (settled) break
      await new Promise((r) => setTimeout(r, 200))
    }
    const m = await sample(page, 2000)
    rows.push({ t: s, ...m })
    console.log(
      `tier=${tier.padEnd(7)} t=${s.toFixed(2)}  draws/f=${String(m.draws).padStart(5)}  tris/f=${String(m.tris).padStart(7)}  tex=${String(m.textures).padStart(3)}  fps(sw)=${String(m.fps).padStart(5)}`
    )
  }

  const peak = {
    draws: Math.max(...rows.map((r) => r.draws)),
    tris: Math.max(...rows.map((r) => r.tris)),
    lines: Math.max(...rows.map((r) => r.lines)),
    textures: Math.max(...rows.map((r) => r.textures)),
    programs: Math.max(...rows.map((r) => r.programs)),
    shaders: Math.max(...rows.map((r) => r.shaders))
  }
  // `default` means "auto-detect"; store under the tier that was actually
  // detected so the baseline lookup can find it.
  const key =
    tier === 'default'
      ? (await page.evaluate(() => (window.__baTier && window.__baTier.tier) || null)) || 'default'
      : tier
  results[key] = { peak, rows, errors }
  console.log(
    `PEAK tier=${key}  draws=${peak.draws}  tris=${peak.tris}  tex=${peak.textures}  programs=${peak.programs}  errors=${errors.length}\n`
  )
  await page.close()
}

const stamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19)
writeFileSync(`${outDir}/perf-${stamp}.json`, JSON.stringify(results, null, 2))

let perfFailed = 0
if (existsSync(`${outDir}/baseline.json`)) {
  const base = JSON.parse(readFileSync(`${outDir}/baseline.json`, 'utf8'))
  console.log('--- delta vs baseline.json ---')
  for (const tier of Object.keys(results)) {
    const b = base[tier] || base.default
    const n = results[tier]
    if (!b || !n) {
      console.log(`tier=${tier}  no baseline entry — run with --save=baseline`)
      continue
    }
    const d = (k) => {
      const delta = n.peak[k] - b.peak[k]
      return `${k}: ${b.peak[k]} -> ${n.peak[k]} (${delta >= 0 ? '+' : ''}${delta})`
    }
    console.log(`tier=${tier}  ${d('draws')}  |  ${d('tris')}  |  ${d('textures')}`)
    const over = (k, limit) => n.peak[k] > b.peak[k] * (1 + limit)
    if (over('draws', 0.1)) { console.log(`  FAIL ${tier} draws +${Math.round((n.peak.draws / b.peak.draws - 1) * 100)}% > 10% budget`); perfFailed++ }
    if (over('tris', 0.15)) { console.log(`  FAIL ${tier} tris +${Math.round((n.peak.tris / b.peak.tris - 1) * 100)}% > 15% budget`); perfFailed++ }
    if (n.peak.textures > b.peak.textures) { console.log(`  FAIL ${tier} textures ${b.peak.textures} -> ${n.peak.textures}`); perfFailed++ }
  }
}

if (saveAs) {
  writeFileSync(`${outDir}/${saveAs}.json`, JSON.stringify(results, null, 2))
  console.log(`saved baseline: ${outDir}/${saveAs}.json`)
}

console.log('\nNOTE: fps is SwiftShader software rendering and is NOT representative of real GPU performance.')
console.log(`report: ${outDir}/perf-${stamp}.json`)
await browser.close()

if (perfFailed) {
  if (saveAs === 'baseline') {
    console.log(`\nre-baselining (${perfFailed} prior budget breach(es) accepted)`)
  } else {
    console.error(`\nPERF GUARD FAILED: ${perfFailed} budget breach(es)`)
    process.exit(1)
  }
}
