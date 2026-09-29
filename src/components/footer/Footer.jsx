import React from 'react'
import Logo from '../navigation/Logo'
import { footerColumns } from '../../data/navigation'

export default function Footer({ onNavigate }) {
  return (
    <footer className="ba-footer" id="footer" role="contentinfo">
      <div className="ba-container">
        <div className="ba-footer__grid">
          <div>
            <div className="ba-footer__brand">
              <Logo />
            </div>
            <p className="ba-footer__desc">
              Nepal&rsquo;s domestic airline — connecting thirteen destinations
              across the Himalayas and the Terai, with links into northern
              India.
            </p>
            <p className="ba-footer__disclaimer">
              Concept experience. Not affiliated with Buddha Air. Flights,
              times and services are reproduced from public information for
              demonstration.
            </p>
          </div>

          {footerColumns.map((col) => (
            <nav key={col.title} aria-label={col.title}>
              <h2 className="ba-footer__col-title">{col.title}</h2>
              {col.links.map((l) => (
                <a
                  key={l.label}
                  href={l.target.startsWith('modal') ? col.href : l.target}
                  className="ba-footer__link"
                  onClick={(e) => { e.preventDefault(); onNavigate(l.target) }}
                >
                  {l.label}
                </a>
              ))}
            </nav>
          ))}
        </div>

        <div className="ba-footer__bottom">
          <span className="ba-footer__copy">
            &copy; {new Date().getFullYear()} — design concept. Built with React,
            Three.js and GSAP.
          </span>
          <a
            className="ba-footer__legal-link"
            href="https://www.buddhaair.com/"
            target="_blank"
            rel="noopener noreferrer"
          >
            Official buddhaair.com &rarr;
          </a>
        </div>
      </div>
    </footer>
  )
}
