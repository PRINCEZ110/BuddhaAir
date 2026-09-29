import React, { useRef } from 'react'

const benefits = [
  {
    title: 'Discounts & Early Offers',
    desc: 'Members receive preferential fares and early access to promotions before they are released to the public.',
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <path d="M10 1l2.4 5.4 5.9.6-4.4 4 1.2 5.8L10 13.9 4.9 16.8 6.1 11 1.7 7l5.9-.6L10 1z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
      </svg>
    )
  },
  {
    title: 'Royal Club Points',
    desc: 'Earn points on every flight and turn your journeys into rewards that bring you closer to your next destination.',
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <circle cx="10" cy="10" r="8" stroke="currentColor" strokeWidth="1.4" />
        <path d="M10 5v10M7 7.5c0-1 1.3-2 3-2s3 1 3 2-1 1.8-3 2.2-3 1.2-3 2.3 1.3 2 3 2 3-1 3-2" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
      </svg>
    )
  },
  {
    title: 'Flight History & Schedule',
    desc: 'Access your complete travel history and manage your schedule from a single, personal dashboard.',
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <rect x="2.5" y="4" width="15" height="13" rx="2" stroke="currentColor" strokeWidth="1.4" />
        <path d="M2.5 8h15M6 2v4M14 2v4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
        <path d="M6 11h4M6 14h6" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
      </svg>
    )
  },
  {
    title: 'A Community of Travellers',
    desc: 'Join a growing community of explorers who experience Nepal — and beyond — with Buddha Air.',
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <circle cx="7" cy="7" r="3" stroke="currentColor" strokeWidth="1.4" />
        <circle cx="14" cy="8" r="2.4" stroke="currentColor" strokeWidth="1.4" />
        <path d="M2 17c0-2.8 2.2-5 5-5s5 2.2 5 5M12.5 12.6c2.4.3 4 2.2 4 4.4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      </svg>
    )
  }
]

export default function RoyalClub({ onOpen }) {
  const cardRef = useRef(null)

  const handleMove = (e) => {
    const el = cardRef.current
    if (!el || e.pointerType === 'touch') return
    const r = el.getBoundingClientRect()
    const x = (e.clientX - r.left) / r.width - 0.5
    const y = (e.clientY - r.top) / r.height - 0.5
    el.style.transform = `perspective(900px) rotateY(${x * 10}deg) rotateX(${-y * 8}deg)`
  }

  const handleLeave = () => {
    if (cardRef.current) cardRef.current.style.transform = 'perspective(900px) rotateY(0deg) rotateX(0deg)'
  }

  return (
    <section className="ba-section ba-section--darker ba-royal" id="royal-club" aria-label="Royal Club">
      <div className="ba-container">
        <div className="ba-split ba-royal__grid">
          <div className="ba-reveal">
            <span className="ba-label">Royal Club</span>
            <h2 className="ba-section__title" style={{ marginTop: 18 }}>
              Loyalty, <em>Elevated</em>
            </h2>
            <p className="ba-section__desc" style={{ marginTop: 20 }}>
              Royal Club membership turns every flight into something more.
              Earn points, unlock offers, and travel on your terms.
            </p>

            <div
              ref={cardRef}
              className="ba-royal__card"
              onMouseMove={handleMove}
              onMouseLeave={handleLeave}
              role="img"
              aria-label="Buddha Air Royal Club membership card"
            >
              <div className="ba-royal__card-shine" />
              <div className="ba-royal__card-top">
                <span className="ba-royal__card-brand">BUDDHA AIR</span>
                <span className="ba-royal__card-tier">Royal Club</span>
              </div>
              <div className="ba-royal__card-number">9N •••• •••• 2716</div>
              <div className="ba-royal__card-bottom">
                <div>
                  <div className="ba-royal__card-holder-label">Member</div>
                  <div className="ba-royal__card-holder">Nepal Explorer</div>
                </div>
                <div className="ba-royal__card-points">
                  <div className="ba-royal__card-holder-label">Points</div>
                  <div className="ba-royal__card-points-num">12,480</div>
                </div>
              </div>
            </div>
          </div>

          <div className="ba-royal__benefits">
            {benefits.map((b, i) => (
              <div key={b.title} className="ba-royal__benefit ba-reveal" style={{ transitionDelay: `${i * 0.08}s` }}>
                <span className="ba-royal__benefit-icon">{b.icon}</span>
                <div>
                  <div className="ba-royal__benefit-title">{b.title}</div>
                  <div className="ba-royal__benefit-desc">{b.desc}</div>
                </div>
              </div>
            ))}
            <div className="ba-reveal" style={{ transitionDelay: '0.35s' }}>
              <button className="ba-btn ba-btn--primary" style={{ width: '100%' }} onClick={() => onOpen?.('royal-club')}>
                Join Royal Club
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
