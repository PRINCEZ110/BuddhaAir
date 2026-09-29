import React from 'react'
import { destinations } from '../../data/destinations'

// Per-destination art. Each city gets its own terrain silhouette, skyline
// and atmosphere so the grid does not read as one card repeated fifteen
// times. `terrain` picks a ridge profile, `sky` the vertical gradient.
const ART = {
  ktm:  { sky: ['#2a4a7a', '#16263f'], terrain: 'valley',  skyline: 'stupa',    note: 'Himalayan valley capital' },
  pkr:  { sky: ['#3a6a9a', '#1a2c47'], terrain: 'lake',    skyline: 'peak',     note: 'Lakes below the Annapurna wall' },
  bir:  { sky: ['#2a5a6a', '#14233c'], terrain: 'flat',    skyline: 'tower',    note: 'Eastern industrial plain' },
  bdp:  { sky: ['#2f6a52', '#16263f'], terrain: 'terrace', skyline: 'tea',      note: 'Tea gardens of the Terai' },
  bwa:  { sky: ['#7a5a2a', '#2a2030'], terrain: 'flat',    skyline: 'stupa',    note: 'Terai plain, ancient capital' },
  bhr:  { sky: ['#2a6a4a', '#14233c'], terrain: 'jungle',  skyline: 'jungle',   note: 'Chitwan jungle gateway' },
  rjb:  { sky: ['#5a4a6a', '#1a2030'], terrain: 'flat',    skyline: 'temple',   note: 'Temple town on the plain' },
  dhi:  { sky: ['#2a4a5a', '#101c2e'], terrain: 'flat',    skyline: 'tower',    note: 'Far-western border city' },
  nep:  { sky: ['#3a5a7a', '#16263f'], terrain: 'jungle',  skyline: 'tower',    note: 'Mid-western Terai hub' },
  jkr:  { sky: ['#6a3a4a', '#241a2e'], terrain: 'flat',    skyline: 'temple',   note: 'Janaki Mandir and history' },
  sif:  { sky: ['#2a5a7a', '#14233c'], terrain: 'terrace', skyline: 'jungle',   note: 'Central Terai plain' },
  skh:  { sky: ['#4a3a6a', '#1a1a2e'], terrain: 'peak',    skyline: 'peak',     note: 'Karnali region gateway' },
  tmi:  { sky: ['#2a6a7a', '#12294d'], terrain: 'peak',    skyline: 'peak',     note: 'Kanchenjunga region' },
  vns:  { sky: ['#7a4a2a', '#2a1a14'], terrain: 'flat',    skyline: 'ghat',     note: 'Ganga plains, India' },
  ccu:  { sky: ['#5a3a5a', '#1e1428'], terrain: 'flat',    skyline: 'tower',    note: 'Eastern India' }
}

const FALLBACK = { sky: ['#2a4a7a', '#16263f'], terrain: 'peak', skyline: 'peak', note: '' }

const RIDGE = {
  peak:   'M0 100 L14 44 L26 70 L40 26 L54 58 L68 34 L82 66 L96 40 L100 100 Z',
  valley: 'M0 100 L12 62 L24 78 L38 48 L52 72 L66 54 L80 76 L92 58 L100 100 Z',
  lake:   'M0 100 L10 56 L22 74 L36 40 L50 68 L64 46 L78 72 L90 56 L100 100 Z',
  flat:   'M0 100 L16 76 L32 82 L50 72 L66 80 L82 74 L100 84 L100 100 Z',
  jungle: 'M0 100 L8 70 Q16 44 24 70 Q32 50 40 72 Q48 46 56 68 Q64 52 72 74 Q80 58 88 76 Q94 64 100 78 L100 100 Z',
  terrace:'M0 100 L14 72 L30 78 L46 68 L62 76 L78 70 L100 80 L100 100 Z'
}

function SKYLINE({ kind }) {
  switch (kind) {
    case 'stupa':
      return <g fill="rgba(255,255,255,0.2)">
        <path d="M100 74 L104 62 L110 56 L116 62 L120 74 Z" />
        <rect x="107" y="40" width="6" height="16" />
        <circle cx="110" cy="38" r="4" />
      </g>
    case 'temple':
      return <g fill="rgba(255,255,255,0.2)">
        <path d="M96 76 L104 48 L112 40 L120 48 L128 76 Z" />
        <rect x="110" y="26" width="4" height="14" />
        <path d="M94 76 L130 76 L124 82 L100 82 Z" />
      </g>
    case 'tower':
      return <g fill="rgba(255,255,255,0.2)">
        <rect x="106" y="30" width="10" height="48" />
        <path d="M102 30 L111 14 L120 30 Z" />
        <rect x="109" y="10" width="4" height="8" />
      </g>
    case 'ghat':
      return <g fill="rgba(255,255,255,0.2)">
        <path d="M86 78 L86 62 L94 52 L102 62 L102 78 Z" />
        <path d="M104 78 L104 50 L116 38 L128 50 L128 78 Z" />
        <rect x="112" y="26" width="4" height="12" />
        <path d="M104 78 L128 78 L128 82 L104 82 Z" />
      </g>
    case 'tea':
      return <g fill="rgba(255,255,255,0.16)">
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <path key={i} d={`M${20 + i * 22} 76 Q${26 + i * 22} 62 ${32 + i * 22} 76 Z`} />
        ))}
      </g>
    case 'jungle':
      return <g fill="rgba(255,255,255,0.14)">
        {[0, 1, 2, 3, 4].map((i) => (
          <path key={i} d={`M${16 + i * 24} 78 L${26 + i * 24} 44 L${36 + i * 24} 78 Z`} />
        ))}
      </g>
    default:
      return null
  }
}

function DestinationArt({ id }) {
  const a = ART[id] || FALLBACK
  return (
    <svg width="100%" height="100%" viewBox="0 0 200 100" preserveAspectRatio="xMidYMax slice" aria-hidden="true">
      <rect width="200" height="100" fill={`url(#sky-${id})`} />
      <defs>
        <linearGradient id={`sky-${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={a.sky[0]} />
          <stop offset="100%" stopColor={a.sky[1]} />
        </linearGradient>
      </defs>
      {/* sun/moon disc, position varies with the gradient hue */}
      <circle cx={34 + (id.charCodeAt(0) % 5) * 26} cy="26" r="9" fill="rgba(255,240,220,0.32)" />
      {/* far ridge */}
      <path d={RIDGE[a.terrain]} fill="rgba(255,255,255,0.09)" transform="translate(0,-10) scale(1,0.8)" />
      {/* skyline */}
      <SKYLINE kind={a.skyline} />
      {/* near ridge */}
      <path d={RIDGE[a.terrain]} fill="rgba(0,0,0,0.3)" />
    </svg>
  )
}

export default function Destinations({ onSelect, activeId, onClose }) {
  const active = destinations.find((d) => d.id === activeId)
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

        {active && (
          <div className="ba-focus" role="dialog" aria-label={`${active.name} details`}>
            <div className="ba-focus__card ba-reveal ba-reveal--visible">
              <button className="ba-focus__back" onClick={onClose}>
                <svg width="14" height="12" viewBox="0 0 16 12" fill="none">
                  <path d="M15 6H2M7 1L2 6l5 5" stroke="currentColor" strokeWidth="1.6" />
                </svg>
                Back to Nepal
              </button>
              <span className="ba-focus__code">{active.code}</span>
              <h3 className="ba-focus__name">{active.name}</h3>
              <p className="ba-focus__desc">{active.desc}</p>
              <dl className="ba-focus__meta">
                <div>
                  <dt>Airport</dt>
                  <dd>{active.code}</dd>
                </div>
                <div>
                  <dt>From Kathmandu</dt>
                  <dd>{active.duration === 'Hub' ? 'Domestic hub' : active.duration}</dd>
                </div>
                <div>
                  <dt>Region</dt>
                  <dd>{active.international ? 'International' : 'Domestic'}</dd>
                </div>
              </dl>
              <p className="ba-focus__note">
                Route and duration shown for concept demonstration. Confirm
                schedules on the official Buddha Air site.
              </p>
            </div>
          </div>
        )}

        <div className="ba-dest-grid">
          {destinations.map((d, i) => (
            <article
              key={d.id}
              data-id={d.id}
              className={`ba-dest-card ba-reveal ${activeId === d.id ? 'ba-dest-card--active' : ''}`}
              style={{ transitionDelay: `${(i % 3) * 0.08}s` }}
              onClick={() => onSelect?.(d)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ' || e.key === 'Spacebar') {
                  e.preventDefault()
                  onSelect?.(d)
                }
              }}
              aria-pressed={activeId === d.id}
              aria-label={`Explore ${d.name}${d.international ? ', international' : ''}`}
            >
              <div className="ba-dest-card__visual" style={{ background: (ART[d.id] || FALLBACK).sky[1] }}>
                <DestinationArt id={d.id} />
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
