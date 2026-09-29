import React, { useState } from 'react'
import Logo from './Logo'
import { navLinks, moreLinks } from '../../data/navigation'

export default function Navbar({ solid, onBook, onNavigate }) {
  const [open, setOpen] = useState(false)
  const [more, setMore] = useState(false)

  const go = (target) => {
    setOpen(false)
    setMore(false)
    onNavigate(target)
  }

  return (
    <>
      <header className={`ba-nav ${solid ? 'ba-nav--solid' : ''}`} role="banner">
        <div className="ba-nav__inner">
          <a
            href="#top"
            className="ba-nav__logo"
            aria-label="Buddha Air home"
            onClick={(e) => { e.preventDefault(); go('#top') }}
          >
            <Logo />
          </a>

          <nav className="ba-nav__links" aria-label="Primary">
            {navLinks.map((l) => (
              <a
                key={l.id}
                href={l.target}
                className="ba-nav__link"
                onClick={(e) => { e.preventDefault(); go(l.target) }}
              >
                {l.label}
              </a>
            ))}
            <div
              className="ba-nav__more"
              onMouseEnter={() => setMore(true)}
              onMouseLeave={() => setMore(false)}
            >
              <button
                className="ba-nav__link ba-nav__more-btn"
                aria-expanded={more}
                aria-haspopup="true"
                onClick={() => setMore((v) => !v)}
              >
                More
                <span className="ba-caret" aria-hidden="true" />
              </button>
              {more && (
                <div className="ba-nav__menu" role="menu">
                  {moreLinks.map((l) => (
                    <a
                      key={l.label}
                      href={l.target.startsWith('modal') ? '#assistance' : l.target}
                      role="menuitem"
                      onClick={(e) => { e.preventDefault(); go(l.target) }}
                    >
                      {l.label}
                    </a>
                  ))}
                </div>
              )}
            </div>
          </nav>

          <div className="ba-nav__actions">
            <a
              href="https://www.buddhaair.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="ba-nav__login"
            >
              Official site
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

      <div
        className={`ba-mobile-menu ${open ? 'ba-mobile-menu--open' : ''}`}
        id="mobile-menu"
        hidden={!open}
      >
        <div className="ba-mobile-menu__inner">
          {navLinks.map((l, i) => (
            <a
              key={l.id}
              href={l.target.startsWith('modal') ? '#assistance' : l.target}
              className="ba-mobile-menu__link"
              style={{ transitionDelay: open ? `${0.06 + i * 0.05}s` : '0s' }}
              onClick={(e) => { e.preventDefault(); go(l.target) }}
            >
              {l.label}
            </a>
          ))}
          <div className="ba-mobile-menu__more">
            {moreLinks.map((l) => (
              <a
                key={l.label}
                href={l.target.startsWith('modal') ? '#assistance' : l.target}
                onClick={(e) => { e.preventDefault(); go(l.target) }}
              >
                {l.label}
              </a>
            ))}
          </div>
          <div className="ba-mobile-menu__cta">
            <button className="ba-btn ba-btn--primary" style={{ width: '100%' }} onClick={() => { setOpen(false); onBook() }}>
              Book a Flight
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
