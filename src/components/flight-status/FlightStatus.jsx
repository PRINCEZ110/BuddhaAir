import React, { useState } from 'react'

const sampleFlights = {
  'BA 101': { from: 'KTM', to: 'PKR', city: 'Pokhara', time: '09:25', status: 'ON TIME', badge: 'ontime' },
  'BA 205': { from: 'KTM', to: 'BIR', city: 'Biratnagar', time: '11:10', status: 'BOARDING', badge: 'boarding' },
  'BA 318': { from: 'KTM', to: 'BWA', city: 'Bhairahawa', time: '13:40', status: 'DELAYED', badge: 'delayed' }
}

export default function FlightStatus() {
  const [flightNo, setFlightNo] = useState('')
  const [date, setDate] = useState('')
  const [result, setResult] = useState(null)
  const [searched, setSearched] = useState(false)

  const handleSearch = (e) => {
    e.preventDefault()
    const key = flightNo.trim().toUpperCase()
    const found = sampleFlights[key]
    setResult(found || null)
    setSearched(true)
  }

  return (
    <section className="ba-section ba-section--dark" id="status" aria-label="Flight status">
      <div className="ba-container">
        <div className="ba-section__head ba-reveal">
          <span className="ba-label">Flight Status</span>
          <h2 className="ba-section__title">
            Where Is <em>Your Flight?</em>
          </h2>
          <p className="ba-section__desc">
            Check the current status of your Buddha Air flight. Sample data shown
            for demonstration — live status available on the official website.
          </p>
        </div>

        <form className="ba-status__form ba-reveal" onSubmit={handleSearch}>
          <div className="ba-field">
            <label className="ba-field__label" htmlFor="fs-no">Flight Number</label>
            <div className="ba-field__control">
              <input
                id="fs-no"
                className="ba-field__input"
                placeholder="e.g. BA 101"
                value={flightNo}
                onChange={(e) => setFlightNo(e.target.value)}
                required
              />
            </div>
          </div>
          <div className="ba-field">
            <label className="ba-field__label" htmlFor="fs-date">Date</label>
            <div className="ba-field__control">
              <input
                id="fs-date"
                type="date"
                className="ba-field__input"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
              />
            </div>
          </div>
          <button type="submit" className="ba-btn ba-btn--primary">Search Flight</button>
        </form>

        {searched && result && (
          <div className="ba-status__result ba-status__result--visible" role="status">
            <div className="ba-status__result-head">
              <span className="ba-status__flight-no">{flightNo.toUpperCase()}</span>
              <span className={`ba-status__badge ba-status__badge--${result.badge}`}>{result.status}</span>
            </div>
            <div className="ba-status__route">
              <div className="ba-status__airport">
                <div className="ba-status__airport-code">{result.from}</div>
                <div className="ba-status__airport-city">Kathmandu</div>
                <div className="ba-status__airport-time">08:55</div>
              </div>
              <div className="ba-status__path">
                <svg className="ba-status__path-plane" width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <path d="M2 12l20-7-7 20-3-8-10-5z" fill="currentColor" />
                </svg>
              </div>
              <div className="ba-status__airport">
                <div className="ba-status__airport-code">{result.to}</div>
                <div className="ba-status__airport-city">{result.city}</div>
                <div className="ba-status__airport-time">{result.time}</div>
              </div>
            </div>
            <div className="ba-status__note">
              Sample data for demonstration purposes only. Please verify on the official Buddha Air website.
            </div>
          </div>
        )}

        {searched && !result && (
          <div className="ba-status__result ba-status__result--visible" role="status">
            <div className="ba-status__note" style={{ borderTop: 'none', background: 'rgba(212,43,43,0.06)' }}>
              Flight not found. Try sample flights: BA 101, BA 205, or BA 318.
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
