import React, { useState } from 'react'
import Logo from './Logo'
import { navLinks } from '../../data/navigation'

export default function Navbar({ solid, onBook }) {
  const [open, setOpen] = useState(false)

  const handleNav = (e, href) => {
    setOpen(false)
    if (href === '#book') {
      e.preventDefault()
      onBook()
      return
    }
    const el = document.querySelector(href)
    if (el) el.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <>
      <header className={`ba-nav ${solid ? 'ba-nav--solid' : ''}`} role="banner">
        <div className="ba-nav__inner">
          <a
            href="#top"
            className="ba-nav__logo"
            aria-label="Buddha Air home"
            onClick={(e) => {
              e.preventDefault()
              window.scrollTo({ top: 0, behavior: 'smooth' })
            }}
          >
            <Logo />
          </a>

          <nav className="ba-nav__links" aria-label="Primary">
            {navLinks.map((l) => (
              <a
                key={l.id}
                href={l.href}
                className="ba-nav__link"
                onClick={(e) => handleNav(e, l.href)}
              >
                {l.label}
              </a>
            ))}
          </nav>

          <div className="ba-nav__actions">
            <a href="#login" className="ba-nav__login" onClick={(e) => e.preventDefault()}>
              Login
            </a>
            <button className="ba-btn ba-btn--primary ba-nav__cta" onClick={onBook}>
              Book a Flight
            </button>
            <button
              className={`ba-nav__burger ${open ? 'ba-nav__burger--open' : ''}`}
              aria-label={open ? 'Close menu' : 'Open menu'}
              aria-expanded={open}
              onClick={() => setOpen(!open)}
            >
              <span /><span /><span />
            </button>
          </div>
        </div>
      </header>

      <div className={`ba-mobile-menu ${open ? 'ba-mobile-menu--open' : ''}`} aria-hidden={!open}>
        {navLinks.map((l, i) => (
          <a
            key={l.id}
            href={l.href}
            className="ba-mobile-menu__link"
            style={{ transitionDelay: open ? `${0.08 + i * 0.06}s` : '0s' }}
            onClick={(e) => handleNav(e, l.href)}
          >
            {l.label}
          </a>
        ))}
        <div className="ba-mobile-menu__cta">
          <button className="ba-btn ba-btn--primary" style={{ width: '100%' }} onClick={() => { setOpen(false); onBook() }}>
            Book a Flight
          </button>
        </div>
      </div>
    </>
  )
}
