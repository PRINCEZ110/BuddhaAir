import puppeteer from 'puppeteer-core'
import { TIMELINE_ANCHORS } from '../src/data/timelineAnchors.js'
import { buildAnchorPoints, mapScrollToT } from '../src/utils/scrollMap.js'

const chromePath = process.env.CHROME_PATH || 'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe'
const url = process.env.SITE_URL || 'http://localhost:5173'

const browser = await puppeteer.launch({
  executablePath: chromePath,
  headless: 'new',
  args: ['--no-sandbox', '--disable-gpu', '--use-gl=swiftshader', '--enable-unsafe-swiftshader']
})

const page = await browser.newPage()
await page.setViewport({ width: 1440, height: 900 })
await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 })
await new Promise((r) => setTimeout(r, 3500))

const anchors = TIMELINE_ANCHORS.map((a) => ({ id: a.id || null, q: a.q || null, t: a.t }))

const data = await page.evaluate((anchorList) => {
  const max = document.documentElement.scrollHeight - window.innerHeight
  const sections = [...document.querySelectorAll('main > section, main > div > section, footer')]
  const rows = sections.map((el) => {
    const r = el.getBoundingClientRect()
    const top = r.top + window.scrollY
    return {
      id: el.id || el.className.split(' ').slice(0, 2).join(' '),
      top: Math.round(top),
      height: Math.round(r.height),
      progressStart: +(top / max).toFixed(3),
      progressEnd: +((top + r.height) / max).toFixed(3)
    }
  })
  const tops = anchorList.map((a) => {
    const el = a.id ? document.getElementById(a.id) : document.querySelector(a.q)
    return el ? Math.round(el.getBoundingClientRect().top + window.scrollY) : null
  })
  return {
    totalHeight: document.documentElement.scrollHeight,
    viewport: window.innerHeight,
    max,
    rows,
    tops
  }
}, anchors)

const pts = buildAnchorPoints(anchors, data.tops, data.max)
const missing = anchors.filter((_, i) => data.tops[i] == null).map((a) => a.id || a.q)
const rows = data.rows.map((r) => ({
  ...r,
  tStart: +mapScrollToT(r.top, pts).toFixed(3),
  tEnd: +mapScrollToT(r.top + r.height, pts).toFixed(3)
}))

console.log(JSON.stringify({ totalHeight: data.totalHeight, viewport: data.viewport, max: data.max, missingAnchors: missing, anchors: pts, rows }, null, 2))

if (missing.length) {
  console.error(`\nLAYOUT GUARD FAILED: ${missing.length} timeline anchor section(s) not in the DOM: ${missing.join(', ')}`)
  await browser.close()
  process.exit(1)
}

await browser.close()
