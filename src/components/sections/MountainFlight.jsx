import React from 'react'

/**
 * The visual for this section is the 3D cabin itself — the camera sits at
 * the window seat and the real scene renders behind this text. There is
 * deliberately no illustration card here; an SVG "cabin window view" would
 * duplicate the actual window sitting a few hundred pixels away.
 */
export default function MountainFlight({ onDiscover }) {
  return (
    <section className="ba-section ba-section--transparent ba-mf" id="mountain-flight" aria-label="Mountain flight experience">
      <div className="ba-container">
        <div className="ba-mf__copy ba-reveal">
          <span className="ba-label">Mountain Flight</span>
          <h2 className="ba-section__title" style={{ marginTop: 18 }}>
            Experience the Mountains <em>From Above</em>
          </h2>
          <p className="ba-section__desc" style={{ marginTop: 20, fontSize: 16, lineHeight: 1.7, color: 'rgba(255,255,255,0.72)', fontWeight: 300 }}>
            Depart Kathmandu at dawn. Watch the first light of day trace the
            highest peaks on Earth as you glide past a horizon of snow and ice —
            an hour that stays with you for a lifetime.
          </p>
          <div style={{ display: 'flex', gap: 16, marginTop: 32, flexWrap: 'wrap' }}>
            <button className="ba-btn ba-btn--primary" onClick={onDiscover}>
              Discover Mountain Flights
            </button>
          </div>
          <p className="ba-mf__note">
            Mountain flight is a promotional experience offered on selected
            routes. Availability and pricing are confirmed on the official
            Buddha Air site.
          </p>
        </div>
      </div>
    </section>
  )
}
