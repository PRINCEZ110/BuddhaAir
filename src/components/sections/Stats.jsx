import React, { useEffect, useRef, useState } from 'react'

const stats = [
  { value: 721, suffix: 'K+', label: 'Total Flights' },
  { value: 27, suffix: 'M+', label: 'Happy Passengers' },
  { value: 60, suffix: '%', label: 'Market Share' },
  { value: 16, suffix: '', label: 'Aircraft' }
]

function Counter({ value, suffix, start }) {
  const [display, setDisplay] = useState(0)

  useEffect(() => {
    if (!start) return
    let raf
    const t0 = performance.now()
    const dur = 1800
    const tick = (now) => {
      // Clamp both ends: a rAF timestamp can land before t0 under throttling,
      // which produced negative easing and counters rendering as -27M.
      const p = Math.max(0, Math.min(1, (now - t0) / dur))
      const e = 1 - Math.pow(1 - p, 3)
      setDisplay(Math.round(value * e))
      if (p < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [start, value])

  return (
    <span className="ba-stat__num">
      {display}
      {suffix && <sup>{suffix}</sup>}
    </span>
  )
}

export default function Stats() {
  const ref = useRef(null)
  const [started, setStarted] = useState(false)

  useEffect(() => {
    const io = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setStarted(true); io.disconnect() } },
      { threshold: 0.3 }
    )
    if (ref.current) io.observe(ref.current)
    return () => io.disconnect()
  }, [])

  return (
    <section className="ba-section ba-section--darker" id="stats" aria-label="By the numbers" style={{ paddingTop: 100 }}>
      <div className="ba-container">
        <div className="ba-reveal">
          <span className="ba-label">By the Numbers</span>
          <h2 className="ba-section__title" style={{ marginTop: 18, fontSize: 'clamp(28px, 4vw, 44px)' }}>
            A Legacy Written <em>in the Sky</em>
          </h2>
        </div>
        <div className="ba-stats ba-reveal" ref={ref}>
          {stats.map((s) => (
            <div key={s.label} className="ba-stat">
              <Counter value={s.value} suffix={s.suffix} start={started} />
              <div className="ba-stat__label">{s.label}</div>
            </div>
          ))}
        </div>
        <p className="ba-stats__note ba-reveal">
          Figures reflect data published on the official Buddha Air website and are
          intended as historical reference, not live counters.
        </p>
      </div>
    </section>
  )
}
