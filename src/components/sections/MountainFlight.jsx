import React from 'react'

export default function MountainFlight({ onDiscover }) {
  return (
    <section className="ba-section ba-section--transparent" id="mountain-flight" aria-label="Mountain flight experience">
      <div className="ba-container">
        <div className="ba-split ba-mountain">
          <div className="ba-reveal">
            <span className="ba-label">Mountain Flight</span>
            <h2 className="ba-section__title" style={{ marginTop: 18 }}>
              Experience the Mountains <em>From Above</em>
            </h2>
            <p className="ba-section__desc" style={{ marginTop: 20, fontSize: 16, lineHeight: 1.7, color: 'rgba(255,255,255,0.65)', fontWeight: 300 }}>
              Depart Kathmandu at dawn. Watch the first light of day trace the
              highest peaks on Earth as you glide past a horizon of snow and ice —
              an hour that stays with you for a lifetime.
            </p>
            <div style={{ display: 'flex', gap: 16, marginTop: 36, flexWrap: 'wrap' }}>
              <button className="ba-btn ba-btn--primary" onClick={onDiscover}>
                Discover Mountain Flights
              </button>
            </div>
          </div>

          <div className="ba-reveal" style={{ position: 'relative' }}>
            <div style={{
              position: 'relative',
              borderRadius: 12,
              overflow: 'hidden',
              border: '1px solid rgba(255,255,255,0.12)',
              aspectRatio: '4/3',
              background: 'linear-gradient(180deg, #f0b878 0%, #d89858 22%, #7a94b8 45%, #3a5a80 70%, #1a2c47 100%)'
            }}>
              <svg width="100%" height="100%" viewBox="0 0 400 300" preserveAspectRatio="xMidYMax slice" aria-hidden="true">
                <circle cx="290" cy="62" r="30" fill="#fff4e0" opacity="0.95" />
                <path d="M0 210 L70 120 L120 175 L185 70 L250 165 L310 95 L400 190 L400 300 L0 300 Z" fill="#dfe8f2" opacity="0.95" />
                <path d="M0 240 L90 170 L160 225 L240 140 L330 220 L400 180 L400 300 L0 300 Z" fill="#b8c8dc" opacity="0.85" />
                <path d="M0 270 L120 210 L220 255 L320 200 L400 240 L400 300 L0 300 Z" fill="#8aa0bc" opacity="0.8" />
                <path d="M0 300 L0 285 L150 240 L280 275 L400 250 L400 300 Z" fill="#5a708c" opacity="0.7" />
              </svg>
              <div style={{
                position: 'absolute',
                inset: 0,
                background: 'linear-gradient(105deg, transparent 55%, rgba(10,22,40,0.55) 78%, rgba(10,22,40,0.9) 100%)'
              }} />
              <div style={{
                position: 'absolute',
                top: 0, bottom: 0, right: 0,
                width: '14%',
                background: 'linear-gradient(90deg, transparent, rgba(20,32,50,0.85))',
                borderLeft: '1px solid rgba(255,255,255,0.1)'
              }} />
              <span style={{
                position: 'absolute',
                bottom: 18,
                left: 18,
                fontSize: 10.5,
                fontWeight: 600,
                letterSpacing: '0.22em',
                textTransform: 'uppercase',
                color: '#fff',
                background: 'rgba(10,22,40,0.55)',
                border: '1px solid rgba(255,255,255,0.18)',
                padding: '7px 13px',
                borderRadius: 4,
                backdropFilter: 'blur(6px)'
              }}>
                Cabin Window View
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
