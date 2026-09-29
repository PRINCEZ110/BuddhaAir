import React from 'react'
import { fleet } from '../../data/aircraft'

function AircraftSilhouette() {
  return (
    <svg width="220" height="90" viewBox="0 0 220 90" fill="none" aria-hidden="true">
      <path d="M14 52 L60 44 L120 30 L196 22 L204 26 L196 32 L128 40 L70 50 L30 56 Z" fill="rgba(255,255,255,0.14)" />
      <path d="M100 40 L118 12 L126 10 L122 40 Z" fill="rgba(212,43,43,0.7)" />
      <path d="M96 46 L104 66 L112 66 L110 46 Z" fill="rgba(255,255,255,0.1)" />
      <circle cx="150" cy="36" r="7" fill="rgba(255,255,255,0.12)" />
      <circle cx="166" cy="34" r="7" fill="rgba(255,255,255,0.12)" />
    </svg>
  )
}

export default function AircraftShowcase() {
  return (
    <section className="ba-section ba-section--transparent" id="fleet" aria-label="Our aircraft">
      <div className="ba-container">
        <div className="ba-section__head ba-reveal">
          <span className="ba-label">The Fleet</span>
          <h2 className="ba-section__title">
            Built for <em>Nepal's Skies</em>
          </h2>
          <p className="ba-section__desc">
            A modern turboprop fleet of 16 aircraft, chosen for reliability on
            short runways and high-altitude airfields across the Himalayas.
          </p>
        </div>

        <div className="ba-fleet">
          {fleet.map((a, i) => (
            <article key={a.id} className="ba-aircraft-card ba-reveal" style={{ transitionDelay: `${i * 0.1}s` }}>
              <div className="ba-aircraft-card__visual">
                <AircraftSilhouette />
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
