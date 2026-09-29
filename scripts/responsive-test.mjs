import puppeteer from 'puppeteer-core'
import { mkdirSync } from 'node:fs'

const chromePath = process.env.CHROME_PATH || 'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe'
const url = process.env.SITE_URL || 'http://localhost:5173'
const outDir = '.screenshots'
mkdirSync(outDir, { recursive: true })

const viewports = [
  { name: '360', width: 360, height: 740 },
  { name: '390', width: 390, height: 844 },
  { name: '430', width: 430, height: 932 },
  { name: '768', width: 768, height: 1024 },
  { name: '1024', width: 1024, height: 768 },
  { name: '1280', width: 1280, height: 800 },
  { name: '1920', width: 1920, height: 1080 }
]

const browser = await puppeteer.launch({
  executablePath: chromePath,
  headless: 'new',
  args: ['--no-sandbox', '--disable-gpu', '--use-gl=swiftshader', '--enable-unsafe-swiftshader']
})

let failures = 0

for (const vp of viewports) {
  const page = await browser.newPage()
  const errors = []
  page.on('pageerror', (e) => errors.push(e.message))
  page.on('console', (m) => { if (m.type() === 'error' && !m.text().includes('404')) errors.push(m.text()) })

  await page.setViewport({ width: vp.width, height: vp.height })
  await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 })
  await new Promise((r) => setTimeout(r, 3500))

  // horizontal overflow check (ignores subtrees clipped by an ancestor)
  const overflow = await page.evaluate(() => {
    const de = document.documentElement
    const offenders = []
    const isClipped = (el) => {
      let p = el.parentElement
      while (p) {
        const cs = getComputedStyle(p)
        if (cs.overflowX !== 'visible' || cs.overflowY !== 'visible') return true
        p = p.parentElement
      }
      return false
    }
    if (de.scrollWidth > de.clientWidth + 1) {
      document.querySelectorAll('body *').forEach((el) => {
        const r = el.getBoundingClientRect()
        if (r.width === 0) return
        if (r.right > de.clientWidth + 2 && !isClipped(el)) {
          offenders.push(`${el.tagName}.${String(el.className).split(' ')[0]} right=${Math.round(r.right)}`)
        }
      })
    }
    return { scrollW: de.scrollWidth, clientW: de.clientWidth, offenders: offenders.slice(0, 5) }
  })

  await page.screenshot({ path: `${outDir}\\m_${vp.name}_hero.png` })

  // scroll to booking area
  await page.evaluate(() => {
    const max = document.documentElement.scrollHeight - window.innerHeight
    window.scrollTo(0, max * 0.1)
  })
  await new Promise((r) => setTimeout(r, 2000))
  await page.screenshot({ path: `${outDir}\\m_${vp.name}_book.png` })

  const ok = overflow.scrollW <= overflow.clientW + 1 && errors.length === 0
  if (!ok) failures++
  console.log(`${ok ? 'PASS' : 'FAIL'} ${vp.width}x${vp.height}  overflow=${overflow.scrollW - overflow.clientW}  errors=${errors.length}`)
  if (overflow.offenders.length) console.log('   offenders: ' + overflow.offenders.join(' | '))
  if (errors.length) console.log('   errors: ' + errors.slice(0, 3).join(' | '))

  await page.close()
}

// Reduced motion check
const page = await browser.newPage()
const rmErrors = []
page.on('pageerror', (e) => rmErrors.push(e.message))
await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }])
await page.setViewport({ width: 1440, height: 900 })
await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 })
await new Promise((r) => setTimeout(r, 3500))
const rmOk = await page.evaluate(() => {
  const hero = document.querySelector('.ba-hero__title')
  return hero ? getComputedStyle(hero).opacity !== '0' : true
})
await page.screenshot({ path: `${outDir}\\reduced_motion.png` })
console.log(`${rmOk && rmErrors.length === 0 ? 'PASS' : 'FAIL'} reduced-motion  heroVisible=${rmOk}  errors=${rmErrors.length}`)
if (!rmOk || rmErrors.length) failures++

// FPS measurement on desktop viewport
const fpsPage = await browser.newPage()
await fpsPage.setViewport({ width: 1440, height: 900 })
await fpsPage.goto(url, { waitUntil: 'networkidle2', timeout: 60000 })
await new Promise((r) => setTimeout(r, 4000))
const fps = await fpsPage.evaluate(async () => {
  let frames = 0
  const start = performance.now()
  await new Promise((resolve) => {
    const tick = () => {
      frames++
      if (performance.now() - start < 3000) requestAnimationFrame(tick)
      else resolve()
    }
    requestAnimationFrame(tick)
  })
  return Math.round((frames / (performance.now() - start)) * 1000)
})
console.log(`FPS (swiftshader software renderer): ${fps}`)
console.log(`\n${failures === 0 ? 'ALL CHECKS PASSED' : failures + ' CHECK(S) FAILED'}`)

await browser.close()
