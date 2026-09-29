import React from 'react'

export default function Loader({ progress, done }) {
  return (
    <div className={`ba-loader ${done ? 'ba-loader--done' : ''}`} aria-hidden={done}>
      <div className="ba-loader__brand">
        BUDDHA <em>AIR</em>
      </div>
      <div className="ba-loader__bar">
        <div className="ba-loader__bar-fill" style={{ width: `${progress}%` }} />
      </div>
      <div className="ba-loader__status">
        {progress < 100 ? 'Initializing Experience' : 'Ready for Takeoff'}
      </div>
      <div className="ba-loader__pct">{progress}%</div>
      <div className={`ba-loader__ready ${progress >= 100 ? 'ba-loader__ready--show' : ''}`}>
        Ready for Takeoff
      </div>
    </div>
  )
}
