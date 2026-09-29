import React, { useEffect, useRef } from 'react'
import gsap from 'gsap'

export default function Hero({ started, onBook }) {
  const rootRef = useRef(null)

  useEffect(() => {
    if (!started) return
    const ctx = gsap.context(() => {
      gsap.to('.ba-hero__sub', { opacity: 1, duration: 1.1, ease: 'power3.out', delay: 1.0 })
      gsap.to('.ba-hero__actions', { opacity: 1, duration: 1.1, ease: 'power3.out', delay: 1.25 })
      gsap.to('.ba-hero__scroll', { opacity: 1, duration: 1, delay: 1.6 })
    }, rootRef)
    return () => ctx.revert()
  }, [started])

  return (
    <section className="ba-hero" ref={rootRef} id="top" aria-label="Welcome">
      <div className="ba-hero__content">
        <span className="ba-label">Connecting Nepal</span>
        <h1 className="ba-hero__title">
          <span className="ba-line"><span>Fly Into the</span></span>
          <span className="ba-line"><span>Heart of Nepal</span></span>
        </h1>
        <p className="ba-hero__sub">
          Through the skies, across the mountains. One flight at a time —
          explore the country from above.
        </p>
        <div className="ba-hero__actions">
          <button className="ba-btn ba-btn--primary" onClick={onBook}>
            Book a Flight
            <svg className="ba-btn__arrow" width="16" height="12" viewBox="0 0 16 12" fill="none">
              <path d="M1 6h13M10 1l5 5-5 5" stroke="currentColor" strokeWidth="1.6" />
            </svg>
          </button>
          <a
            href="#destinations"
            className="ba-btn ba-btn--ghost"
            onClick={(e) => {
              e.preventDefault()
              document.querySelector('#destinations')?.scrollIntoView({ behavior: 'smooth' })
            }}
          >
            Explore Nepal
          </a>
        </div>
      </div>
      <div className="ba-hero__scroll">
        <span>Scroll</span>
        <span className="ba-hero__scroll-line" />
      </div>
    </section>
  )
}
