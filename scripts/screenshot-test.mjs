import puppeteer from 'puppeteer-core'
import { mkdirSync } from 'node:fs'
import { TIMELINE_ANCHORS } from '../src/data/timelineAnchors.js'

const chromePath = process.env.CHROME_PATH || 'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe'
const url = process.env.SITE_URL || 'http://localhost:5173'
const outDir = '.screenshots'
mkdirSync(outDir, { recursive: true })

// Stops are addressed by SECTION, not by a raw document fraction: the
// camera timeline is anchored to sections, so a stop must be too. Each
// assertion below checks the runtime `t` landed inside the section's own
// anchored range — that is the guard for scroll→t wiring, which
// verify:layout (static measurement) cannot see.
const stops = [
  { name: '01_hero', section: 'top', at: 0.5 },
  { name: '02_takeoff', section: 'cinematic', at: 0.10 },
  { name: '03_climb', section: 'cinematic', at: 0.45 },
  { name: '04_clouds', section: 'cinematic', at: 0.62 },
  { name: '05_himalaya', section: 'cinematic', at: 0.82 },
  { name: '06_nepal_map', section: 'destinations', at: 0.45 },
  { name: '07_book', section: 'book', at: 0.5 },
  { name: '08_fleet', section: 'fleet', at: 0.66 },
  { name: '09_cabin', section: 'mountain-flight', at: 0.5 },
  { name: '10_stats', section: 'stats', at: 0.5 },
  { name: '11_safety', section: 'safety', at: 0.5 },
  { name: '12_company', section: 'company', at: 0.5 },
  { name: '13_royal', section: 'royal-club', at: 0.5 },
  { name: '14_assist', section: 'assistance', at: 0.5 },
  { name: '15_holidays', section: 'holidays', at: 0.5 },
  { name: '16_status', section: 'status', at: 0.5 },
  { name: '17_footer', section: 'footer', at: 0.5 }
]

const anchorIndex = (id) => TIMELINE_ANCHORS.findIndex((a) => a.id === id)

const expectedT = (section, at) => {
  const i = anchorIndex(section)
  if (i < 0) return null
  const start = TIMELINE_ANCHORS[i].t
  const end = i + 1 < TIMELINE_ANCHORS.length ? TIMELINE_ANCHORS[i + 1].t : 1
  return start + (end - start) * at
}

const TOL = 0.012
const failures = []

const browser = await puppeteer.launch({
  executablePath: chromePath,
  headless: 'new',
  args: ['--no-sandbox', '--disable-gpu', '--use-gl=swiftshader', '--enable-unsafe-swiftshader']
})

const page = await browser.newPage()
await page.setViewport({ width: 1440, height: 900 })

page.on('console', (msg) => {
  if (msg.type() === 'error') console.log(`[CONSOLE ERROR] ${msg.text()}`)
})
page.on('pageerror', (err) => console.log(`[PAGE ERROR] ${err.message}`))

await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 })
await new Promise((r) => setTimeout(r, 4000))

for (const stop of stops) {
  await page.evaluate((s) => {
    const el = document.getElementById(s.section)
    if (!el) return
    const top = el.getBoundingClientRect().top + window.scrollY
    const max = document.documentElement.scrollHeight - window.innerHeight
    window.scrollTo(0, Math.min(max, Math.max(0, top + el.offsetHeight * s.at)))
  }, stop)
  await new Promise((r) => setTimeout(r, 2500))
  const actual = await page.evaluate(() => {
    const sec = [...document.querySelectorAll('main > section, main > div > section, footer')].find(
      (e) => {
        const r = e.getBoundingClientRect()
        return r.top <= 200 && r.bottom > 200
      }
    )
    return {
      t: typeof window.__baProgress === 'number' ? window.__baProgress : null,
      scrollY: Math.round(window.scrollY),
      inView: sec ? sec.id || sec.className.split(' ')[0] : null
    }
  })
  // SwiftShader needs seconds per frame. `t` above is already current (GSAP
  // writes it at rAF start), but the compositor may still hold the previous
  // completed frame — so force real frames to be produced before capturing.
  await page.evaluate(
    () =>
      new Promise((res) => {
        let n = 0
        const step = () => (++n >= 4 ? res() : requestAnimationFrame(step))
        requestAnimationFrame(step)
      })
  )
  await new Promise((r) => setTimeout(r, 400))
  await page.screenshot({ path: `${outDir}\\${stop.name}.png` })

  const want = expectedT(stop.section, stop.at)
  const status =
    actual.t === null
      ? 'no __baProgress (dev readback missing)'
      : want === null
        ? 'no anchor for section'
        : Math.abs(actual.t - want) <= TOL
          ? 'ok'
          : `expected ~${want.toFixed(3)}, got ${actual.t.toFixed(3)}`

  if (status !== 'ok') failures.push(`${stop.name}: ${status}`)
  console.log(
    `${status === 'ok' ? 'Captured' : 'FAIL'} ${stop.name} y=${actual.scrollY} inView=${actual.inView} t=${actual.t === null ? 'n/a' : actual.t.toFixed(3)} (want ${want === null ? '?' : want.toFixed(3)})`
  )
}

await browser.close()

if (failures.length) {
  console.error(`\nSCROLL GUARD FAILED: ${failures.length} stop(s) outside their section's anchored range`)
  for (const f of failures) console.error(`  ${f}`)
  process.exit(1)
}
console.log('Done')
