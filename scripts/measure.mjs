import puppeteer from 'puppeteer-core'

const chromePath = 'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe'

const browser = await puppeteer.launch({
  executablePath: chromePath,
  headless: 'new',
  args: ['--no-sandbox', '--disable-gpu', '--use-gl=swiftshader', '--enable-unsafe-swiftshader']
})

const page = await browser.newPage()
await page.setViewport({ width: 1440, height: 900 })
await page.goto('http://localhost:5173', { waitUntil: 'networkidle2', timeout: 60000 })
await new Promise((r) => setTimeout(r, 3500))

const data = await page.evaluate(() => {
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
  return { totalHeight: document.documentElement.scrollHeight, viewport: window.innerHeight, max, rows }
})

console.log(JSON.stringify(data, null, 2))
await browser.close()
