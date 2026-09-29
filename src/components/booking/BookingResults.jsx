import React from 'react'
import { destinations } from '../../data/destinations'

const byCode = Object.fromEntries(destinations.map((d) => [d.code, d]))

// Indicative block times, clearly labelled as preview data.
function previewFlights(form) {
  const from = byCode[form.from] || destinations[0]
  const to = byCode[form.to] || destinations[1]
  const pax = Number(form.pax || 1) || 1

  const base = [
    { n: '1', dep: '06:40', arr: from.duration === 'Hub' ? '07:15' : addMin(from.duration), dur: from.duration === 'Hub' ? '35 min' : from.duration, avail: pax <= 6 ? 'Available' : 'Call to confirm' },
    { n: '2', dep: '09:25', arr: from.duration === 'Hub' ? '10:00' : addMin(from.duration), dur: from.duration === 'Hub' ? '35 min' : from.duration, avail: 'Available' },
    { n: '3', dep: '13:10', arr: from.duration === 'Hub' ? '13:45' : addMin(from.duration), dur: from.duration === 'Hub' ? '35 min' : from.duration, avail: pax <= 4 ? 'Available' : 'Limited' }
  ]
  return { from, to, pax, base }
}

function addMin(dur) {
  const m = /(\d+)\s*min/.exec(dur || '')
  if (!m) return '—'
  const mins = Number(m[1])
  const [h, mm] = [9, 25]
  const total = h * 60 + mm + mins
  return `${String(Math.floor(total / 60) % 24).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`
}

export default function BookingResults({ form, onReset }) {
  const { from, to, pax, base } = previewFlights(form)

  return (
    <div className="ba-results" role="status" aria-live="polite">
      <div className="ba-results__head">
        <div>
          <span className="ba-label">Flight search preview</span>
          <h3 className="ba-results__title">
            {from.name} <em>&rarr;</em> {to.name}
          </h3>
          <p className="ba-results__meta">
            {pax} passenger{pax > 1 ? 's' : ''}
            {form.depart ? ` · departing ${form.depart}` : ''}
            {form.return ? ` · returning ${form.return}` : ''}
          </p>
        </div>
        <button className="ba-results__reset" onClick={onReset}>
          Clear search
        </button>
      </div>

      <p className="ba-results__notice">
        <strong>Demo results.</strong> Live availability, fares and booking are not
        connected. Use buddhaair.com to search and purchase a real ticket.
      </p>

      <div className="ba-results__list">
        {base.map((f) => (
          <div key={f.n} className="ba-results__row">
            <span className="ba-results__no">BA {f.n}</span>
            <span className="ba-results__time">{f.dep}</span>
            <span className="ba-results__dur">{f.dur}</span>
            <span className="ba-results__arr">{f.arr}</span>
            <span className={`ba-results__avail ${f.avail === 'Available' ? 'is-ok' : 'is-limited'}`}>
              {f.avail}
            </span>
            <span className="ba-results__cta">Select</span>
          </div>
        ))}
      </div>
    </div>
  )
}
