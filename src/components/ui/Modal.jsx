import React, { useEffect, useRef } from 'react'

/**
 * Accessible dialog. Escape closes, focus moves in on open and returns to
 * the trigger on close, and Tab is trapped inside. Every interactive
 * element on the site that needs a panel uses this rather than a bespoke
 * overlay, so the keyboard contract is defined once.
 */
export default function Modal({ open, onClose, title, kicker, children, wide = false }) {
  const panelRef = useRef(null)
  const closeRef = useRef(null)
  const restoreRef = useRef(null)

  useEffect(() => {
    if (!open) return
    restoreRef.current = document.activeElement

    const onKey = (e) => {
      if (e.key === 'Escape') {
        e.stopPropagation()
        onClose()
        return
      }
      if (e.key !== 'Tab') return
      const panel = panelRef.current
      if (!panel) return
      const items = [...panel.querySelectorAll(
        'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])'
      )].filter((el) => el.offsetParent !== null)
      if (!items.length) return
      const first = items[0]
      const last = items[items.length - 1]
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault()
        first.focus()
      }
    }

    document.addEventListener('keydown', onKey, true)
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const id = requestAnimationFrame(() => closeRef.current?.focus())

    return () => {
      document.removeEventListener('keydown', onKey, true)
      document.body.style.overflow = prevOverflow
      cancelAnimationFrame(id)
      if (restoreRef.current instanceof HTMLElement) restoreRef.current.focus()
    }
  }, [open, onClose])

  return (
    <div
      className={`ba-modal ${open ? 'ba-modal--open' : ''}`}
      role="dialog"
      aria-modal="true"
      aria-label={title}
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className={`ba-modal__panel ${wide ? 'ba-modal__panel--wide' : ''}`} ref={panelRef}>
        <button className="ba-modal__close" onClick={onClose} ref={closeRef} aria-label="Close dialog">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M2 2l12 12M14 2L2 14" stroke="currentColor" strokeWidth="1.8" />
          </svg>
        </button>
        {kicker && <span className="ba-label">{kicker}</span>}
        <h2 className="ba-modal__title">{title}</h2>
        <div className="ba-modal__body">{children}</div>
      </div>
    </div>
  )
}
