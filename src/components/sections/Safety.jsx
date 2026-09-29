import React from 'react'

const points = [
  {
    title: 'International-standard hangar facility',
    desc: 'A closed-door hangar built to international specifications, protecting every aircraft from the elements during maintenance.'
  },
  {
    title: 'Rigorous maintenance protocol',
    desc: 'Every aircraft follows a strict, documented maintenance schedule that meets or exceeds manufacturer and regulatory requirements.'
  },
  {
    title: 'Experienced flight crews',
    desc: 'Pilots trained for the unique demands of Himalayan operations — high altitude, short runways, and rapidly changing mountain weather.'
  },
  {
    title: 'Continuous operational oversight',
    desc: 'Real-time monitoring of every flight, with safety management systems embedded in daily operations.'
  }
]

export default function Safety() {
  return (
    <section className="ba-section ba-section--dark" id="safety" aria-label="Safety">
      <div className="ba-container">
        <div className="ba-safety">
          <div className="ba-reveal">
            <span className="ba-label">Safety First</span>
            <h2 className="ba-section__title" style={{ marginTop: 18 }}>
              Built Around <em>Safety</em>
            </h2>
            <p className="ba-section__desc" style={{ marginTop: 20 }}>
              Safety is not a feature of our operation — it is the foundation
              everything else is built on.
            </p>
            <div className="ba-safety__points">
              {points.map((p) => (
                <div key={p.title} className="ba-safety__point">
                  <span className="ba-safety__point-dot" />
                  <div>
                    <div className="ba-safety__point-title">{p.title}</div>
                    <div className="ba-safety__point-desc">{p.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="ba-safety__visual ba-reveal">
            <svg width="100%" height="100%" viewBox="0 0 400 300" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
              <defs>
                <linearGradient id="hangar" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#1a2a45" />
                  <stop offset="100%" stopColor="#0a1628" />
                </linearGradient>
              </defs>
              <rect width="400" height="300" fill="url(#hangar)" />
              <path d="M40 220 L200 90 L360 220" fill="none" stroke="rgba(255,255,255,0.14)" strokeWidth="2" />
              <path d="M70 220 L200 110 L330 220" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="1.5" />
              <line x1="200" y1="90" x2="200" y2="220" stroke="rgba(255,255,255,0.08)" strokeWidth="1.5" />
              <ellipse cx="200" cy="238" rx="120" ry="14" fill="rgba(0,0,0,0.4)" />
              <path d="M110 232 L150 160 L250 160 L290 232 Z" fill="rgba(212,43,43,0.16)" />
              <path d="M150 160 L250 160 L262 178 L138 178 Z" fill="rgba(255,255,255,0.1)" />
              <circle cx="176" cy="200" r="10" fill="rgba(255,255,255,0.14)" />
              <circle cx="224" cy="200" r="10" fill="rgba(255,255,255,0.14)" />
              <rect x="188" y="120" width="24" height="40" rx="4" fill="rgba(212,43,43,0.5)" />
              <circle cx="120" cy="120" r="3" fill="#d9a441" opacity="0.8" />
              <circle cx="280" cy="120" r="3" fill="#d9a441" opacity="0.8" />
              <circle cx="120" cy="120" r="8" fill="none" stroke="#d9a441" opacity="0.3" />
              <circle cx="280" cy="120" r="8" fill="none" stroke="#d9a441" opacity="0.3" />
            </svg>
            <span className="ba-safety__visual-label">Closed-Door Hangar Facility</span>
          </div>
        </div>
      </div>
    </section>
  )
}
