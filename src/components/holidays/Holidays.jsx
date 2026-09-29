import React from 'react'

const categories = [
  { name: 'Luxury', desc: 'Premium stays and curated comfort across Nepal.', tag: 'Luxury', bg: 'linear-gradient(150deg, #3a2a4a 0%, #1a1428 100%)' },
  { name: 'Adventure & Sports', desc: 'Trekking, rafting, paragliding and more.', tag: 'Adventure', bg: 'linear-gradient(150deg, #1a4a3a 0%, #0e2018 100%)' },
  { name: 'Local Experience', desc: 'Live Nepal through its people and traditions.', tag: 'Culture', bg: 'linear-gradient(150deg, #4a3a1a 0%, #241c0e 100%)' },
  { name: 'Family', desc: 'Journeys designed for every generation together.', tag: 'Family', bg: 'linear-gradient(150deg, #1a3a4a 0%, #0e1c24 100%)' },
  { name: 'Weekend Escape', desc: 'Short breaks that recharge the spirit.', tag: 'Weekend', bg: 'linear-gradient(150deg, #4a1a2a 0%, #240e16 100%)' },
  { name: 'Cultural Experience', desc: 'Temples, festivals and living heritage.', tag: 'Heritage', bg: 'linear-gradient(150deg, #2a2a4a 0%, #141424 100%)' }
]

export default function Holidays() {
  return (
    <section className="ba-section ba-section--dark" id="holidays" aria-label="Buddha Holidays">
      <div className="ba-container">
        <div className="ba-section__head ba-reveal">
          <span className="ba-label">Buddha Holidays</span>
          <h2 className="ba-section__title">
            Beyond the <em>Flight</em>
          </h2>
          <p className="ba-section__desc">
            Your journey does not end at the airport. Discover handcrafted
            holiday experiences across Nepal.
          </p>
        </div>

        <div className="ba-holiday-grid">
          {categories.map((c, i) => (
            <article key={c.name} className="ba-holiday-card ba-reveal" style={{ transitionDelay: `${(i % 3) * 0.08}s` }}>
              <div className="ba-holiday-card__bg" style={{ background: c.bg }} />
              <div className="ba-holiday-card__overlay" />
              <div className="ba-holiday-card__body">
                <span className="ba-holiday-card__tag">{c.tag}</span>
                <h3 className="ba-holiday-card__name">{c.name}</h3>
                <p className="ba-holiday-card__desc">{c.desc}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
