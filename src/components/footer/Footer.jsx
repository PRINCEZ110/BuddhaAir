import React from 'react'
import Logo from '../navigation/Logo'
import { footerColumns, contactInfo } from '../../data/navigation'

export default function Footer() {
  return (
    <footer className="ba-footer" role="contentinfo">
      <div className="ba-container">
        <div className="ba-footer__grid">
          <div>
            <div className="ba-footer__brand">
              <Logo />
            </div>
            <p className="ba-footer__desc">
              Nepal's premier domestic airline — connecting the mountains, valleys
              and plains of the Himalayas since 1997.
            </p>
          </div>

          {footerColumns.map((col) => (
            <nav key={col.title} aria-label={col.title}>
              <h3 className="ba-footer__col-title">{col.title}</h3>
              {col.links.map((l) => (
                <a key={l} href="#top" className="ba-footer__link" onClick={(e) => e.preventDefault()}>
                  {l}
                </a>
              ))}
            </nav>
          ))}

          <div>
            <h3 className="ba-footer__col-title">Contact</h3>
            <div className="ba-footer__contact-item">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
                <path d="M5 4h4l2 5-2.5 1.5a11 11 0 005 5L15 13l5 2v4a2 2 0 01-2 2A16 16 0 013 6a2 2 0 012-2z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
              </svg>
              <span>{contactInfo.phone}</span>
            </div>
            <div className="ba-footer__contact-item">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
                <rect x="3" y="5" width="18" height="14" rx="2" stroke="currentColor" strokeWidth="1.6" />
                <path d="M3 7l9 6 9-6" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
              </svg>
              <span>{contactInfo.email}</span>
            </div>
            <div className="ba-footer__contact-item">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
                <path d="M12 21s7-5.5 7-11a7 7 0 10-14 0c0 5.5 7 11 7 11z" stroke="currentColor" strokeWidth="1.6" />
                <circle cx="12" cy="10" r="2.5" stroke="currentColor" strokeWidth="1.6" />
              </svg>
              <span>{contactInfo.address}</span>
            </div>
          </div>
        </div>

        <div className="ba-footer__bottom">
          <span className="ba-footer__copy">
            © {new Date().getFullYear()} Buddha Air. Concept experience — not affiliated with the official airline.
          </span>
          <div className="ba-footer__legal">
            <a href="#top" className="ba-footer__legal-link" onClick={(e) => e.preventDefault()}>Privacy</a>
            <a href="#top" className="ba-footer__legal-link" onClick={(e) => e.preventDefault()}>Terms</a>
            <a href="#top" className="ba-footer__legal-link" onClick={(e) => e.preventDefault()}>Accessibility</a>
          </div>
        </div>
      </div>
    </footer>
  )
}
