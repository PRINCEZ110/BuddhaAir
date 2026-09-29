import React from 'react'

const items = [
  {
    title: 'Special Needs',
    desc: 'Assistance for passengers with reduced mobility or specific requirements.',
    icon: (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
        <circle cx="11" cy="5" r="2.4" stroke="currentColor" strokeWidth="1.5" />
        <path d="M11 8v5M11 13l-3.5 6M11 13l3.5 6M7 10.5h8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    )
  },
  {
    title: 'Traveling With Pets',
    desc: 'Guidance for bringing your companion along safely and comfortably.',
    icon: (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
        <circle cx="6.5" cy="8" r="1.8" stroke="currentColor" strokeWidth="1.5" />
        <circle cx="15.5" cy="8" r="1.8" stroke="currentColor" strokeWidth="1.5" />
        <circle cx="4" cy="13" r="1.6" stroke="currentColor" strokeWidth="1.5" />
        <circle cx="18" cy="13" r="1.6" stroke="currentColor" strokeWidth="1.5" />
        <path d="M11 12c-2.8 0-5 2-5 4.2 0 1.4 1.1 2.3 2.5 2.3 1 0 1.7-.5 2.5-.5s1.5.5 2.5.5c1.4 0 2.5-.9 2.5-2.3 0-2.2-2.2-4.2-5-4.2z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      </svg>
    )
  },
  {
    title: 'Medical Information',
    desc: 'What to know if you are travelling with a medical condition.',
    icon: (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
        <rect x="3" y="4" width="16" height="15" rx="2" stroke="currentColor" strokeWidth="1.5" />
        <path d="M11 8v6M8 11h6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M8 4V2.5h6V4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    )
  },
  {
    title: 'Pregnant Women',
    desc: 'Travel guidance for expectant mothers at every stage of pregnancy.',
    icon: (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
        <path d="M11 20c-4 0-7-2.6-7-6.5C4 9 7 5.5 11 5.5s7 3.5 7 8c0 3.9-3 6.5-7 6.5z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
        <path d="M11 17c-1.8 0-3-1.2-3-3 0-2 1.4-3.5 3-3.5s3 1.5 3 3.5c0 1.8-1.2 3-3 3z" stroke="currentColor" strokeWidth="1.4" />
      </svg>
    )
  },
  {
    title: 'Traveling With Children',
    desc: 'Making family travel smooth, from infants to young travellers.',
    icon: (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
        <circle cx="8" cy="6.5" r="2.2" stroke="currentColor" strokeWidth="1.5" />
        <circle cx="15.5" cy="7.5" r="1.8" stroke="currentColor" strokeWidth="1.5" />
        <path d="M4 19c0-3 1.8-5 4-5s4 2 4 5M12.5 19c.2-2.4 1.4-4 3-4 1.4 0 2.5 1.6 2.5 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    )
  },
  {
    title: 'Unaccompanied Minors',
    desc: 'Dedicated support for children travelling without a guardian.',
    icon: (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
        <circle cx="11" cy="6" r="2.6" stroke="currentColor" strokeWidth="1.5" />
        <path d="M11 9v6M11 15l-4 5M11 15l4 5M6.5 11.5h9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    )
  }
]

export default function SpecialAssistance() {
  return (
    <section className="ba-section ba-section--light" id="assistance" aria-label="Special assistance">
      <div className="ba-container">
        <div className="ba-section__head ba-reveal">
          <span className="ba-label ba-label--light">Special Assistance</span>
          <h2 className="ba-section__title">
            Every Passenger, <em>Every Need</em>
          </h2>
          <p className="ba-section__desc">
            We are here to make your journey comfortable. Explore the support
            available for your specific travel situation.
          </p>
        </div>

        <div className="ba-assist-grid">
          {items.map((item, i) => (
            <button key={item.title} className="ba-assist-card ba-reveal" style={{ transitionDelay: `${(i % 3) * 0.08}s` }}>
              <span className="ba-assist-card__icon">{item.icon}</span>
              <span>
                <span className="ba-assist-card__title">{item.title}</span>
                <span className="ba-assist-card__desc" style={{ display: 'block' }}>{item.desc}</span>
              </span>
            </button>
          ))}
        </div>
      </div>
    </section>
  )
}
