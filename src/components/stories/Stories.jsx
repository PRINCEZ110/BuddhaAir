import React from 'react'

const stories = [
  { cat: 'Travel', title: 'A Morning Above the Annapurna Circuit', date: 'Sep 2026', bg: 'linear-gradient(150deg, #4a6a9a 0%, #1a2c47 100%)' },
  { cat: 'Culture', title: 'Festivals of the Kathmandu Valley', date: 'Aug 2026', bg: 'linear-gradient(150deg, #8a4a3a 0%, #2e1a14 100%)' },
  { cat: 'Mountain', title: 'Life at 3,000 Metres: Nepal\'s Airfields', date: 'Jul 2026', bg: 'linear-gradient(150deg, #3a5a6a 0%, #14202a 100%)' },
  { cat: 'Aviation', title: 'The Pilots Who Know Every Ridge', date: 'Jun 2026', bg: 'linear-gradient(150deg, #2a4a5a 0%, #0e1a22 100%)' },
  { cat: 'Destination', title: 'Pokhara: Where the Lakes Meet the Peaks', date: 'May 2026', bg: 'linear-gradient(150deg, #3a6a5a 0%, #12241e 100%)' }
]

export default function Stories() {
  return (
    <section className="ba-section ba-section--darker" id="stories" aria-label="Stories from Nepal" style={{ paddingBottom: 100 }}>
      <div className="ba-container">
        <div className="ba-section__head ba-reveal" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', maxWidth: '100%', gap: 24, flexWrap: 'wrap' }}>
          <div>
            <span className="ba-label">Stories</span>
            <h2 className="ba-section__title" style={{ marginTop: 18 }}>
              Stories from <em>Nepal</em>
            </h2>
          </div>
          <p className="ba-section__desc" style={{ maxWidth: 380, marginTop: 0 }}>
            Dispatches from the mountains, the valleys and the sky between them.
          </p>
        </div>
      </div>

      <div className="ba-stories__track ba-reveal">
        {stories.map((s) => (
          <article key={s.title} className="ba-story-card">
            <div className="ba-story-card__img">
              <div className="ba-story-card__img-bg" style={{ background: s.bg }} />
              <span className="ba-story-card__cat">{s.cat}</span>
            </div>
            <div className="ba-story-card__body">
              <h3 className="ba-story-card__title">{s.title}</h3>
              <div className="ba-story-card__date">
                <span>{s.date}</span>
                <svg className="ba-story-card__arrow" width="18" height="12" viewBox="0 0 16 12" fill="none">
                  <path d="M1 6h13M10 1l5 5-5 5" stroke="currentColor" strokeWidth="1.6" />
                </svg>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}
