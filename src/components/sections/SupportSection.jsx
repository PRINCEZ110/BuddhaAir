import React, { useState } from 'react'

/**
 * Real destinations for the support and company links that previously
 * pointed nowhere. Content is deliberately general: nothing here states a
 * baggage allowance, fare rule or cargo limit we cannot verify. Where a
 * figure belongs to the operator, the copy says so and points at the
 * official site rather than inventing a number.
 */

const FAQ = [
  {
    q: 'How early should I arrive at the airport?',
    a: 'Domestic departures generally require arriving well ahead of the published check-in cut-off. The exact times depend on the airport and the flight, so confirm against your booking on the official Buddha Air site or at the check-in desk.'
  },
  {
    q: 'What documents do I need to travel?',
    a: 'A valid government-issued photo ID, and for international travel a valid passport with sufficient validity for your destination. Requirements vary by nationality and destination — check before you travel.'
  },
  {
    q: 'Can I change or cancel my booking?',
    a: 'Change and cancellation conditions depend on the fare type you purchased. Your booking confirmation states the conditions that apply to your ticket.'
  },
  {
    q: 'How is cargo carried?',
    a: 'Buddha Air accepts cargo subject to capacity and security screening. Rates, weight limits and restricted items are confirmed directly with the airline.'
  },
  {
    q: 'Is the mountain flight a regular scheduled service?',
    a: 'Mountain flight is a promotional experience rather than a scheduled service, and depends on weather and route availability on the day.'
  }
]

const SUPPORT = [
  {
    id: 'fare-rules',
    title: 'Fare Rules',
    body: (
      <>
        <p>
          Every ticket is issued against a fare type, and that fare type
          carries its own conditions on changes, cancellation and refunds.
          The conditions applying to your ticket are printed on your booking
          confirmation.
        </p>
        <p>
          This concept site cannot quote live fares, so it does not display
          prices. Current fares and their conditions are published by the
          airline on buddhaair.com.
        </p>
      </>
    )
  },
  {
    id: 'baggage',
    title: 'Baggage',
    body: (
      <>
        <p>
          Cabin and checked allowance depends on the fare type and the route
          you are flying, and a single bag has size and weight limits that
          are checked at the counter.
        </p>
        <p>
          We have deliberately not published allowance figures here, because
          a wrong number at the counter is a real cost to a passenger. The
          allowance on your booking is shown on your ticket and confirmed on
          buddhaair.com.
        </p>
      </>
    )
  },
  {
    id: 'cargo',
    title: 'Cargo',
    body: (
      <>
        <p>
          Freight is accepted subject to available capacity and successful
          security screening, with limits on size, weight and the nature of
          the goods carried.
        </p>
        <p>
          Rates and accepted items are confirmed directly with the airline.
          Dangerous goods are prohibited in line with international aviation
          regulations.
        </p>
      </>
    )
  },
  {
    id: 'contact',
    title: 'Contact',
    body: (
      <>
        <p>
          This is a concept experience, not the airline's own website, so we
          have not reproduced a phone number or address that might be
          mistaken for a way to reach the real operations desk.
        </p>
        <p>
          For bookings, flight status, refunds and cargo enquiries, use the
          contact channels published on{' '}
          <a className="ba-inline-link" href="https://www.buddhaair.com/" target="_blank" rel="noopener noreferrer">
            buddhaair.com
          </a>.
        </p>
      </>
    )
  }
]

export default function SupportSection() {
  const [open, setOpen] = useState('faq')

  return (
    <section className="ba-section ba-section--dark" id="support" aria-label="Support and information">
      <div className="ba-container">
        <div className="ba-section__head ba-reveal">
          <span className="ba-label">Support</span>
          <h2 className="ba-section__title">Before you <em>Fly</em></h2>
          <p className="ba-section__desc">
            Practical information for planning your journey. Where a figure
            belongs to the operator we point you to the official source rather
            than quote something we cannot verify.
          </p>
        </div>

        <div className="ba-accordion ba-reveal">
          {SUPPORT.map((s) => {
            const isOpen = open === s.id
            return (
              <div key={s.id} id={s.id} className={`ba-accordion__item ${isOpen ? 'is-open' : ''}`}>
                <h3>
                  <button
                    className="ba-accordion__trigger"
                    aria-expanded={isOpen}
                    aria-controls={`${s.id}-panel`}
                    onClick={() => setOpen(isOpen ? null : s.id)}
                  >
                    {s.title}
                    <span className="ba-accordion__icon" aria-hidden="true" />
                  </button>
                </h3>
                <div className="ba-accordion__panel" id={`${s.id}-panel`} hidden={!isOpen}>
                  <div className="ba-accordion__content">{s.body}</div>
                </div>
              </div>
            )
          })}

          <div className={`ba-accordion__item ${open === 'faq' ? 'is-open' : ''}`} id="faq">
            <h3>
              <button
                className="ba-accordion__trigger"
                aria-expanded={open === 'faq'}
                aria-controls="faq-panel"
                onClick={() => setOpen(open === 'faq' ? null : 'faq')}
              >
                Frequently Asked Questions
                <span className="ba-accordion__icon" aria-hidden="true" />
              </button>
            </h3>
            <div className="ba-accordion__panel" id="faq-panel" hidden={open !== 'faq'}>
              <div className="ba-accordion__content">
                <dl className="ba-faq">
                  {FAQ.map((f) => (
                    <div key={f.q} className="ba-faq__row">
                      <dt>{f.q}</dt>
                      <dd>{f.a}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
