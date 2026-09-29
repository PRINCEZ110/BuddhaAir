import React from 'react'

export default function Logo({ compact = false }) {
  return (
    <>
      <span className="ba-nav__logo-mark" aria-hidden="true">
        <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
          <circle cx="20" cy="20" r="18.5" stroke="#d42b2b" strokeWidth="2" />
          <path
            d="M20 8 L23 17 L32 17 L24.5 22.5 L27.5 31.5 L20 26 L12.5 31.5 L15.5 22.5 L8 17 L17 17 Z"
            fill="#d42b2b"
          />
          <circle cx="20" cy="20" r="3.2" fill="#fff" />
        </svg>
      </span>
      {!compact && (
        <span className="ba-nav__logo-text">
          <span className="ba-nav__logo-name">BUDDHA AIR</span>
          <span className="ba-nav__logo-tag">Connecting Nepal</span>
        </span>
      )}
    </>
  )
}
