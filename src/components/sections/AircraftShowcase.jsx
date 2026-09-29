import React from 'react'
import { fleet } from '../../data/aircraft'

// Each variant gets its own planform and engine layout so the three cards
// do not read as the same drawing three times. ATR 42 is visibly shorter
// and narrower than the -500/-600 pair.
const VARIANTS = {
  'atr72-600': { len: 226, span: 150, tail: 26, engines: 2, propR: 8, nose: 16 },
  'atr72-500': { len: 214, span: 142, tail: 24, engines: 2, propR: 7, nose: 15 },
  'atr42-320': { len: 176, span: 116, tail: 22, engines: 2, propR: 6, nose: 13 }
}

function AircraftSilhouette({ variant = 'atr72-600' }) {
  const v = VARIANTS[variant] || VARIANTS['atr72-600']
  const cx = 8
  const cy = 48

  return (
    <svg width="240" height="96" viewBox="0 0 240 96" fill="none" aria-hidden="true">
      {/* fuselage */}
      <path
        d={`M${cx} ${cy}
            C${cx + v.nose} ${cy - 7} ${cx + v.len * 0.5} ${cy - 9} ${cx + v.len - v.tail} ${cy - 8}
            L${cx + v.len} ${cy - 3} L${cx + v.len} ${cy + 4} L${cx + v.len - v.tail} ${cy + 8}
            C${cx + v.len * 0.5} ${cy + 9} ${cx + v.nose} ${cy + 6} ${cx} ${cy}
            Z`}
        fill="rgba(255,255,255,0.16)"
      />
      {/* cockpit glazing */}
      <path
        d={`M${cx + 4} ${cy - 4} L${cx + v.nose + 4} ${cy - 6} L${cx + v.nose + 1} ${cy - 2} L${cx + 4} ${cy - 1} Z`}
        fill="rgba(10,22,40,0.55)"
      />
      {/* high wing */}
      <path
        d={`M${cx + v.len * 0.34} ${cy - 8} L${cx + v.len * 0.62} ${cy - 8} L${cx + v.len * 0.66} ${cy - 12} L${cx + v.len * 0.3} ${cy - 12} Z`}
        fill="rgba(255,255,255,0.22)"
      />
      <path d={`M${cx + v.len * 0.12} ${cy + 8} L${cx + v.len * 0.42} ${cy + 7} L${cx + v.len * 0.44} ${cy + 11} L${cx + v.len * 0.13} ${cy + 12} Z`} fill="rgba(255,255,255,0.18)" />
      {/* fin */}
      <path
        d={`M${cx + v.len - v.tail - 3} ${cy - 7} L${cx + v.len - 2} ${cy - 8} L${cx + v.len - 2} ${cy - 30} L${cx + v.len - 9} ${cy - 28} Z`}
        fill="rgba(212,43,43,0.75)"
      />
      {/* cabin window band */}
      {Array.from({ length: Math.round(v.len / 13) }).map((_, i) => (
        <rect
          key={i}
          x={cx + v.nose + 8 + i * 13}
          y={cy - 4}
          width="5"
          height="4"
          rx="1.6"
          fill="rgba(16,28,46,0.6)"
        />
      ))}
      {/* nacelles + prop discs */}
      {[0.42, 0.6].map((f) => (
        <g key={f}>
          <circle cx={cx + v.len * f} cy={cy - 15} r={v.propR} fill="rgba(255,255,255,0.1)" />
          <rect x={cx + v.len * f - 3} y={cy - 13} width="22" height="7" rx="3" fill="rgba(255,255,255,0.24)" />
        </g>
      ))}
      {/* undercarriage */}
      <path d={`M${cx + v.nose + 6} ${cy + 8} L${cx + v.nose + 8} ${cy + 18}`} stroke="rgba(255,255,255,0.3)" strokeWidth="2" />
      <circle cx={cx + v.nose + 8} cy={cy + 20} r="3.4" fill="rgba(255,255,255,0.28)" />
      <path d={`M${cx + v.len * 0.46} ${cy + 9} L${cx + v.len * 0.44} ${cy + 19}`} stroke="rgba(255,255,255,0.28)" strokeWidth="2" />
      <circle cx={cx + v.len * 0.44} cy={cy + 21} r="4" fill="rgba(255,255,255,0.26)" />
      <circle cx={cx + v.len * 0.48} cy={cy + 21} r="4" fill="rgba(255,255,255,0.26)" />
    </svg>
  )
}

export default function AircraftShowcase({ interactiveRef }) {
  const hintRef = React.useRef(null)

  // Drag / wheel are bound to a transparent overlay over the canvas rather
  // than to the page, so the interaction never swallows normal scrolling.
  const startDrag = (e) => {
    if (!interactiveRef) return
    const st = interactiveRef.current
    st.active = true
    st.lastX = e.clientX
    st.lastY = e.clientY
    e.currentTarget.setPointerCapture?.(e.pointerId)
    if (hintRef.current) hintRef.current.style.opacity = '0'
  }
  const onDrag = (e) => {
    if (!interactiveRef || !interactiveRef.current.active) return
    const st = interactiveRef.current
    st.yaw += (e.clientX - st.lastX) * 0.006
    st.pitch = Math.max(-0.4, Math.min(0.5, st.pitch + (e.clientY - st.lastY) * 0.004))
    st.lastX = e.clientX
    st.lastY = e.clientY
  }
  const endDrag = (e) => {
    if (!interactiveRef) return
    interactiveRef.current.active = false
    e.currentTarget.releasePointerCapture?.(e.pointerId)
  }
  const onWheel = (e) => {
    if (!interactiveRef) return
    e.preventDefault()
    const st = interactiveRef.current
    st.zoom = Math.max(0.55, Math.min(1.8, st.zoom + e.deltaY * 0.0012))
  }
  const reset = () => {
    if (!interactiveRef) return
    interactiveRef.current.yaw = 0
    interactiveRef.current.pitch = 0
    interactiveRef.current.zoom = 1
  }

  return (
    <section className="ba-section ba-section--cinema" id="fleet" aria-label="Our aircraft">
      <div className="ba-showcase" aria-hidden="true">
        <div
          className="ba-showcase__hit"
          onPointerDown={startDrag}
          onPointerMove={onDrag}
          onPointerUp={endDrag}
          onPointerCancel={endDrag}
          onWheel={onWheel}
        />
        <p className="ba-showcase__hint" ref={hintRef}>
          Drag to rotate · scroll to zoom
        </p>
        <button className="ba-showcase__reset" onClick={reset} tabIndex={-1}>
          Reset view
        </button>
      </div>

      <div className="ba-container">
        <div className="ba-section__head ba-reveal">
          <span className="ba-label">The Fleet</span>
          <h2 className="ba-section__title">
            Built for <em>Nepal's Skies</em>
          </h2>
          <p className="ba-section__desc">
            A turboprop fleet of 16 aircraft, chosen for reliability on
            short runways and high-altitude airfields across the Himalayas.
          </p>
        </div>

        <div className="ba-fleet">
          {fleet.map((a, i) => (
            <article key={a.id} className="ba-aircraft-card ba-reveal" style={{ transitionDelay: `${i * 0.1}s` }}>
              <div className="ba-aircraft-card__visual">
                <AircraftSilhouette variant={a.id} />
              </div>
              <h3 className="ba-aircraft-card__name">{a.name}</h3>
              <p className="ba-aircraft-card__role">{a.role}</p>
              <div className="ba-aircraft-card__specs">
                <div>
                  <div className="ba-aircraft-card__spec-label">Capacity</div>
                  <div className="ba-aircraft-card__spec-value">{a.capacity}</div>
                </div>
                <div>
                  <div className="ba-aircraft-card__spec-label">Range</div>
                  <div className="ba-aircraft-card__spec-value">{a.range}</div>
                </div>
              </div>
              <p style={{ marginTop: 18, fontSize: 13, lineHeight: 1.6, color: 'rgba(255,255,255,0.5)' }}>
                {a.note}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
