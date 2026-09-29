import puppeteer from 'puppeteer-core'
import { mkdirSync } from 'node:fs'

const chromePath = process.env.CHROME_PATH || 'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe'
const url = process.env.SITE_URL || 'http://localhost:5173'
const outDir = '.screenshots'
mkdirSync(outDir, { recursive: true })

const stops = [
  { name: '01_hero', scroll: 0.0 },
  { name: '02_booking', scroll: 0.10 },
  { name: '03_takeoff', scroll: 0.16 },
  { name: '04_clouds', scroll: 0.24 },
  { name: '05_himalaya', scroll: 0.30 },
  { name: '06_nepal_map', scroll: 0.34 },
  { name: '07_fleet', scroll: 0.44 },
  { name: '08_mountain', scroll: 0.56 },
  { name: '09_royal', scroll: 0.66 },
  { name: '10_assist', scroll: 0.74 },
  { name: '11_holidays', scroll: 0.82 },
  { name: '12_status', scroll: 0.95 },
  { name: '13_footer', scroll: 1.0 }
]

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
    const max = document.documentElement.scrollHeight - window.innerHeight
    window.scrollTo(0, max * s)
  }, stop.scroll)
  await new Promise((r) => setTimeout(r, 2500))
  await page.screenshot({ path: `${outDir}\\${stop.name}.png` })
  console.log(`Captured ${stop.name}`)
}

await browser.close()
console.log('Done')
