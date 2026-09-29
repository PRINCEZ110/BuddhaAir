import puppeteer from 'puppeteer-core'
import { mkdirSync } from 'node:fs'

const chromePath = process.env.CHROME_PATH || 'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe'
const url = process.env.SITE_URL || 'http://localhost:5173'
const outDir = '.screenshots'
mkdirSync(outDir, { recursive: true })

const browser = await puppeteer.launch({
  executablePath: chromePath,
  headless: 'new',
  args: ['--no-sandbox', '--disable-gpu', '--use-gl=swiftshader', '--enable-unsafe-swiftshader']
})

const page = await browser.newPage()
const errors = []
page.on('pageerror', (e) => errors.push('pageerror: ' + e.message))
page.on('console', (m) => { if (m.type() === 'error' && !m.text().includes('404')) errors.push(m.text()) })

await page.setViewport({ width: 1440, height: 900 })
await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 })
await new Promise((r) => setTimeout(r, 4000))

const results = []
const check = (name, pass, detail = '') => {
  results.push({ name, pass, detail })
  console.log(`${pass ? 'PASS' : 'FAIL'}  ${name}${detail ? '  ' + detail : ''}`)
}

// 1. Booking modal opens from hero CTA
await page.evaluate(() => {
  const btns = [...document.querySelectorAll('.ba-hero__actions .ba-btn')]
  btns[0]?.click()
})
await new Promise((r) => setTimeout(r, 1200))
let modalOpen = await page.evaluate(() =>
  document.querySelector('.ba-booking-modal')?.classList.contains('ba-booking-modal--open')
)
check('booking modal opens from hero CTA', !!modalOpen)
await page.screenshot({ path: `${outDir}\\x_booking_modal.png` })

// 2. Escape closes it
await page.keyboard.press('Escape')
await new Promise((r) => setTimeout(r, 900))
modalOpen = await page.evaluate(() =>
  document.querySelector('.ba-booking-modal')?.classList.contains('ba-booking-modal--open')
)
check('Escape closes booking modal', !modalOpen)

// 3. Booking form validation: fields present and labelled
const formInfo = await page.evaluate(() => {
  const panel = document.querySelector('#book form')
  if (!panel) return null
  const controls = [...panel.querySelectorAll('input, select, button')]
  const labelled = controls.filter((c) => {
    if (c.tagName === 'BUTTON') return true
    return c.id && document.querySelector(`label[for="${c.id}"]`)
  })
  return { total: controls.length, labelled: labelled.length }
})
check('booking fields are labelled', formInfo && formInfo.total === formInfo.labelled,
  formInfo ? `${formInfo.labelled}/${formInfo.total}` : 'no form')

// 4. Nav "Book a Flight" CTA also opens the modal
await page.evaluate(() => document.querySelector('.ba-nav__cta')?.click())
await new Promise((r) => setTimeout(r, 1000))
const navModal = await page.evaluate(() =>
  document.querySelector('.ba-booking-modal')?.classList.contains('ba-booking-modal--open')
)
check('nav CTA opens booking modal', !!navModal)
await page.keyboard.press('Escape')
await new Promise((r) => setTimeout(r, 700))

// 5. Flight status: search a known sample flight
await page.evaluate(() => document.querySelector('#status')?.scrollIntoView())
await new Promise((r) => setTimeout(r, 1800))
await page.type('#fs-no', 'BA 101')
// Set the date through the native value setter so React's onChange fires;
// assigning .value directly leaves component state empty and the required
// attribute then blocks the second submit.
await page.evaluate(() => {
  const d = document.querySelector('#fs-date')
  const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set
  setter.call(d, '2026-09-30')
  d.dispatchEvent(new Event('input', { bubbles: true }))
})
await page.evaluate(() => document.querySelector('.ba-status__form button[type="submit"]')?.click())
await new Promise((r) => setTimeout(r, 1400))
const status = await page.evaluate(() => {
  const r = document.querySelector('.ba-status__result')
  if (!r) return null
  return { visible: r.classList.contains('ba-status__result--visible'), text: r.textContent.replace(/\s+/g, ' ').trim().slice(0, 90) }
})
check('flight status returns a result', !!(status && status.visible), status?.text || 'no result')
await page.screenshot({ path: `${outDir}\\x_flight_status.png` })

// 6. Unknown flight shows the not-found state.
// React owns this input, so clear it via real key events rather than
// assigning .value (which would not update component state).
await page.focus('#fs-no')
await page.keyboard.down('Control')
await page.keyboard.press('KeyA')
await page.keyboard.up('Control')
await page.keyboard.press('Backspace')
await page.type('#fs-no', 'BA 999')
const typed = await page.evaluate(() => document.querySelector('#fs-no').value)
await page.evaluate(() => document.querySelector('.ba-status__form button[type="submit"]')?.click())
await new Promise((r) => setTimeout(r, 1000))
const nf = await page.evaluate(() => {
  const r = document.querySelector('.ba-status__result')
  return { exists: !!r, text: r ? r.textContent.replace(/\s+/g, ' ').trim().slice(0, 80) : null }
})
const notFound = !!nf.text && nf.text.toLowerCase().includes('not found')
check('unknown flight shows not-found', notFound, `input="${typed}" result="${nf.text}"`)

// 7. Destination card is keyboard-activatable
const destFocusable = await page.evaluate(() => {
  const c = document.querySelector('.ba-dest-card')
  return c?.getAttribute('tabindex') === '0' && c?.getAttribute('role') === 'button'
})
check('destination cards are keyboard operable', !!destFocusable)

// 8. Mobile menu
const m = await browser.newPage()
m.on('pageerror', (e) => errors.push('mobile pageerror: ' + e.message))
await m.setViewport({ width: 390, height: 844 })
await m.goto(url, { waitUntil: 'networkidle2', timeout: 60000 })
await new Promise((r) => setTimeout(r, 4000))
await m.click('.ba-nav__burger')
await new Promise((r) => setTimeout(r, 1100))
const menuOpen = await m.evaluate(() =>
  document.querySelector('.ba-mobile-menu')?.classList.contains('ba-mobile-menu--open')
)
check('mobile hamburger opens full-screen menu', !!menuOpen)
await m.screenshot({ path: `${outDir}\\x_mobile_menu.png` })

// 9. Mobile menu closes on link click
await m.evaluate(() => document.querySelectorAll('.ba-mobile-menu__link')[0]?.click())
await new Promise((r) => setTimeout(r, 1100))
const menuClosed = await m.evaluate(() =>
  !document.querySelector('.ba-mobile-menu')?.classList.contains('ba-mobile-menu--open')
)
check('mobile menu closes on nav click', !!menuClosed)

console.log(`\nconsole/page errors: ${errors.length}`)
if (errors.length) console.log(errors.slice(0, 5).join('\n'))
const failed = results.filter((r) => !r.pass).length
console.log(`\n${failed === 0 && errors.length === 0 ? 'ALL INTERACTION CHECKS PASSED' : failed + ' FAILED, ' + errors.length + ' errors'}`)

await browser.close()
