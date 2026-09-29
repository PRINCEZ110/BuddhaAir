import React, { useState } from 'react'
import { destinations } from '../../data/destinations'

const nationalities = ['Nepali', 'Indian', 'Other']

export default function BookingPanel({ onSearch, compact = false }) {
  const [tripType, setTripType] = useState('round')
  const [form, setForm] = useState({
    from: 'KTM',
    to: 'PKR',
    nationality: 'Nepali',
    passengers: '1',
    depart: '',
    return: '',
    promo: ''
  })

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value })

  const handleSubmit = (e) => {
    e.preventDefault()
    if (form.from === form.to) return
    onSearch?.(form)
  }

  return (
    <form className="ba-booking__panel" onSubmit={handleSubmit} aria-label="Flight booking">
      <div className="ba-booking__tabs" role="tablist">
        {['round', 'oneway'].map((t) => (
          <button
            key={t}
            type="button"
            role="tab"
            aria-selected={tripType === t}
            className={`ba-booking__tab ${tripType === t ? 'ba-booking__tab--active' : ''}`}
            onClick={() => setTripType(t)}
          >
            {t === 'round' ? 'Round Trip' : 'One Way'}
          </button>
        ))}
      </div>

      <div className="ba-booking__grid" key={`${form.from}-${form.to}`}>
        <div className="ba-field ba-field--span2">
          <label className="ba-field__label" htmlFor={`${compact ? 'm' : 'd'}-from`}>From</label>
          <div className="ba-field__control">
            <select id={`${compact ? 'm' : 'd'}-from`} className="ba-field__select" value={form.from} onChange={set('from')}>
              {destinations.map((d) => (
                <option key={d.id} value={d.code}>{d.name} ({d.code})</option>
              ))}
            </select>
          </div>
        </div>

        <div className="ba-field ba-field--span2">
          <label className="ba-field__label" htmlFor={`${compact ? 'm' : 'd'}-to`}>To</label>
          <div className="ba-field__control">
            <select id={`${compact ? 'm' : 'd'}-to`} className="ba-field__select" value={form.to} onChange={set('to')}>
              {destinations
                .filter((d) => d.code !== form.from)
                .map((d) => (
                  <option key={d.id} value={d.code}>{d.name} ({d.code})</option>
                ))}
            </select>
          </div>
        </div>

        <div className="ba-field">
          <label className="ba-field__label" htmlFor={`${compact ? 'm' : 'd'}-nat`}>Nationality</label>
          <div className="ba-field__control">
            <select id={`${compact ? 'm' : 'd'}-nat`} className="ba-field__select" value={form.nationality} onChange={set('nationality')}>
              {nationalities.map((n) => <option key={n}>{n}</option>)}
            </select>
          </div>
        </div>

        <div className="ba-field">
          <label className="ba-field__label" htmlFor={`${compact ? 'm' : 'd'}-pax`}>Passengers</label>
          <div className="ba-field__control">
            <select id={`${compact ? 'm' : 'd'}-pax`} className="ba-field__select" value={form.passengers} onChange={set('passengers')}>
              {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((n) => <option key={n}>{n}</option>)}
            </select>
          </div>
        </div>

        <div className="ba-field ba-field--span2">
          <label className="ba-field__label" htmlFor={`${compact ? 'm' : 'd'}-dep`}>Departure Date</label>
          <div className="ba-field__control">
            <input id={`${compact ? 'm' : 'd'}-dep`} type="date" className="ba-field__input" value={form.depart} onChange={set('depart')} required />
          </div>
        </div>

        {tripType === 'round' && (
          <div className="ba-field ba-field--span2">
            <label className="ba-field__label" htmlFor={`${compact ? 'm' : 'd'}-ret`}>Return Date</label>
            <div className="ba-field__control">
              <input id={`${compact ? 'm' : 'd'}-ret`} type="date" className="ba-field__input" value={form.return} onChange={set('return')} />
            </div>
          </div>
        )}

        <div className="ba-field ba-field--span2">
          <label className="ba-field__label" htmlFor={`${compact ? 'm' : 'd'}-promo`}>Promo Code</label>
          <div className="ba-field__control">
            <input id={`${compact ? 'm' : 'd'}-promo`} type="text" className="ba-field__input" placeholder="Optional" value={form.promo} onChange={set('promo')} />
          </div>
        </div>

        <button
          type="submit"
          className="ba-btn ba-btn--primary ba-booking__submit"
          disabled={form.from === form.to}
        >
          {form.from === form.to ? 'Choose a different destination' : 'Search Flights'}
        </button>

        {form.from === form.to && (
          <p className="ba-booking__hint" role="status">
            Origin and destination are the same.
          </p>
        )}
      </div>
    </form>
  )
}
