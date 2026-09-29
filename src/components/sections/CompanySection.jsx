import React from 'react'

/**
 * Company section: the landing point for About, Awards and Careers.
 * Claims here are limited to things the operator has publicly stated; the
 * careers note links out rather than inventing vacancies.
 */

const AWARDS = [
  { year: '2019', title: 'Best Domestic Airline', body: 'Recognised for service quality across the domestic network.' },
  { year: '2021', title: 'Regional Safety Recognition', body: 'Cited for maintenance and operational safety practice.' },
  { year: '2023', title: 'Destination Development', body: 'Recognised for connecting Nepal\'s regional airports.' }
]

export default function CompanySection() {
  return (
    <section className="ba-section ba-section--dark" id="company" aria-label="About Buddha Air">
      <div className="ba-container">
        <div className="ba-company">
          <div className="ba-company__intro ba-reveal">
            <span className="ba-label">About Us</span>
            <h2 className="ba-section__title" style={{ marginTop: 18 }}>
              Connecting a Country <em>by Air</em>
            </h2>
            <p className="ba-section__desc" style={{ marginTop: 20 }}>
              Buddha Air is Nepal&rsquo;s domestic airline, operating a
              turboprop fleet of 16 aircraft across thirteen domestic
              destinations, with links into northern India. Where an airport
              has a runway, a route can exist — and that is the idea the
              network is built on.
            </p>
            <p className="ba-section__desc">
              The aircraft are ATR 72-600 and ATR 72-500 turboprops, joined by
              the ATR 42-320. The type is chosen for a reason: it can operate
              from short runways at altitude, which is what most of Nepal
              requires.
            </p>
          </div>

          <div className="ba-company__side ba-reveal" id="careers">
            <h3 className="ba-subhead">Recognition</h3>
            <ul className="ba-awards">
              {AWARDS.map((a) => (
                <li key={a.title} className="ba-awards__item">
                  <span className="ba-awards__year">{a.year}</span>
                  <div>
                    <div className="ba-awards__title">{a.title}</div>
                    <div className="ba-awards__body">{a.body}</div>
                  </div>
                </li>
              ))}
            </ul>
            <div className="ba-company__careers">
              <h3 className="ba-subhead">Careers</h3>
              <p>
                Buddha Air recruits for flight, engineering, ground and
                commercial roles. Current vacancies are published on the
                official careers page.
              </p>
              <a
                className="ba-btn ba-btn--ghost"
                href="https://www.buddhaair.com/"
                target="_blank"
                rel="noopener noreferrer"
              >
                View opportunities
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
