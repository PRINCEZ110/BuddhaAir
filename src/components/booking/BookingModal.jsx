import React, { useEffect } from 'react'
import BookingPanel from './BookingPanel'

export default function BookingModal({ open, onClose, onSearch }) {
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose() }
    if (open) {
      document.addEventListener('keydown', onKey)
      document.body.style.overflow = 'hidden'
    }
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [open, onClose])

  return (
    <div
      className={`ba-booking-modal ${open ? 'ba-booking-modal--open' : ''}`}
      role="dialog"
      aria-modal="true"
      aria-label="Book a flight"
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="ba-booking-modal__panel ba-booking__panel" style={{ position: 'relative' }}>
        <button className="ba-booking-modal__close" onClick={onClose} aria-label="Close booking">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M2 2l12 12M14 2L2 14" stroke="currentColor" strokeWidth="1.8" />
          </svg>
        </button>
        <BookingPanel compact onSearch={onSearch} />
      </div>
    </div>
  )
}
