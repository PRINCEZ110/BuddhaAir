import React, { useEffect, useRef } from 'react'
import { chapters, RUNWAY_RANGE, CHAPTER_WINDOW } from '../../data/chapters'

/**
 * The cinematic runway: a tall, fully transparent stretch of scroll that
 * gives the camera room to travel from the hero to the destination index.
 *
 * It carries no visible layout of its own. Its only job is scroll distance.
 * The chapter titles live in a fixed overlay and are driven straight off
 * the same `progressRef` the camera reads, so text and camera can never
 * drift apart. Opacity/transform are written to the DOM directly inside a
 * single rAF loop — no React state, so no per-frame re-renders.
 */
export default function CinematicRunway({ progressRef, reducedMotion }) {
  const layerRef = useRef(null)
  const itemRefs = useRef([])

  useEffect(() => {
    if (reducedMotion) {
      if (layerRef.current) layerRef.current.style.opacity = '0'
      return
    }

    let raf
    const WINDOW = CHAPTER_WINDOW

    const tick = () => {
      const t = progressRef.current
      const layer = layerRef.current

      if (layer) {
        const inRange = t > RUNWAY_RANGE[0] && t < RUNWAY_RANGE[1]
        layer.style.opacity = inRange ? '1' : '0'
      }

      for (let i = 0; i < chapters.length; i++) {
        const el = itemRefs.current[i]
        if (!el) continue
        const d = t - chapters[i].t
        const dist = Math.abs(d)
        let o = dist >= WINDOW ? 0 : 1 - dist / WINDOW
        o = Math.pow(o, 1.5)
        el.style.opacity = o.toFixed(3)
        // Rises as the beat passes, like a title card leaving the frame.
        el.style.transform = `translate3d(0, ${(d * 760).toFixed(1)}px, 0)`
      }

      raf = requestAnimationFrame(tick)
    }

    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [progressRef, reducedMotion])

  return (
    <section className="ba-cinematic" id="cinematic" aria-label="Journey over Nepal">
      <h2 className="ba-sr-only">The journey: from the apron to the Himalaya</h2>

      <div className="ba-chapters" ref={layerRef} aria-hidden="true">
        {chapters.map((c, i) => (
          <p className="ba-chapter" key={c.kicker} ref={(el) => { itemRefs.current[i] = el }}>
            <span className="ba-chapter__kicker">{c.kicker}</span>
            <span className="ba-chapter__line">{c.line}</span>
          </p>
        ))}
      </div>
    </section>
  )
}
