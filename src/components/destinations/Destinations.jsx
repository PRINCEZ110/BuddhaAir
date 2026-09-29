import React from 'react'
import { destinations } from '../../data/destinations'

const gradients = {
  ktm: 'linear-gradient(150deg, #2a4a7a 0%, #16263f 100%)',
  pkr: 'linear-gradient(150deg, #3a6a9a 0%, #1a2c47 100%)',
  bir: 'linear-gradient(150deg, #2a5a6a 0%, #14233c 100%)',
  bhp: 'linear-gradient(150deg, #3a7a5a 0%, #16263f 100%)',
  bhr: 'linear-gradient(150deg, #6a5a2a 0%, #2a2030 100%)',
  bhp2: 'linear-gradient(150deg, #2a6a4a 0%, #14233c 100%)',
  raj: 'linear-gradient(150deg, #5a4a6a 0%, #1a2030 100%)',
  dhi: 'linear-gradient(150deg, #2a4a5a 0%, #101c2e 100%)',
  nep: 'linear-gradient(150deg, #3a5a7a 0%, #16263f 100%)',
  jkr: 'linear-gradient(150deg, #6a3a4a 0%, #241a2e 100%)',
  sim: 'linear-gradient(150deg, #2a5a7a 0%, #14233c 100%)',
  sur: 'linear-gradient(150deg, #4a3a6a 0%, #1a1a2e 100%)',
  tum: 'linear-gradient(150deg, #2a6a7a 0%, #12294d 100%)',
  vns: 'linear-gradient(150deg, #7a4a2a 0%, #2a1a14 100%)',
  ccu: 'linear-gradient(150deg, #5a3a5a 0%, #1e1428 100%)'
}

export default function Destinations({ onSelect, activeId }) {
  return (
    <section className="ba-section ba-section--cinema" id="destinations" aria-label="Destinations">
      <div className="ba-container">
        <div className="ba-section__head ba-reveal">
          <span className="ba-label">Destinations</span>
          <h2 className="ba-section__title">
            A Nation Connected <em>by Air</em>
          </h2>
          <p className="ba-section__desc">
            From the Kathmandu Valley to the Terai plains and the Himalayan north —
            Buddha Air links 13 domestic destinations across Nepal, plus international
            connections to India.
          </p>
        </div>

        <div className="ba-dest-grid">
          {destinations.map((d, i) => (
            <article
              key={d.id}
              className={`ba-dest-card ba-reveal ${activeId === d.id ? 'ba-dest-card--active' : ''}`}
              style={{ transitionDelay: `${(i % 3) * 0.08}s` }}
              onClick={() => onSelect?.(d)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => { if (e.key === 'Enter') onSelect?.(d) }}
              aria-label={`Explore ${d.name}`}
            >
              <div className="ba-dest-card__visual" style={{ background: gradients[d.id] || gradients.ktm }}>
                <svg width="100%" height="100%" viewBox="0 0 400 220" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
                  <path d="M0 190 L60 120 L110 160 L170 80 L230 150 L290 100 L350 160 L400 130 L400 220 L0 220 Z" fill="rgba(255,255,255,0.07)" />
                  <path d="M0 200 L80 150 L150 185 L220 130 L300 180 L400 150 L400 220 L0 220 Z" fill="rgba(0,0,0,0.25)" />
                </svg>
                <span className="ba-dest-card__code">{d.code}</span>
              </div>
              <div className="ba-dest-card__body">
                <h3 className="ba-dest-card__name">{d.name}</h3>
                <p className="ba-dest-card__desc">{d.desc}</p>
                <div className="ba-dest-card__meta">
                  <span className="ba-dest-card__duration">
                    {d.duration === 'Hub' ? 'Domestic Hub' : `From KTM · ${d.duration}`}
                  </span>
                  <span className="ba-dest-card__explore">
                    Explore
                    <svg width="14" height="10" viewBox="0 0 16 12" fill="none">
                      <path d="M1 6h13M10 1l5 5-5 5" stroke="currentColor" strokeWidth="1.6" />
                    </svg>
                  </span>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
