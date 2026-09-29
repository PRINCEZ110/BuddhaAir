import React from 'react'
import Modal from '../ui/Modal'
import { royalClub, assistance, legal } from '../../data/info'

/**
 * One modal host for every dialog on the site, keyed by a string target
 * of the form `modal:<key>`. This is what the footer, nav and assistance
 * cards dispatch to, so there is exactly one focus-trap, one Escape
 * handler and one scroll lock in the codebase.
 */
export default function InfoModals({ openKey, onClose }) {
  const isAssistance = assistance[openKey]
  const isLegal = legal[openKey]
  const isRoyal = openKey === 'royal-club'

  return (
    <>
      <Modal
        open={isRoyal}
        onClose={onClose}
        kicker={royalClub.kicker}
        title={royalClub.title}
        wide
      >
        <p className="ba-modal__lead">{royalClub.intro}</p>
        <ul className="ba-modal__list">
          {royalClub.benefits.map((b) => (
            <li key={b.title}>
              <strong>{b.title}</strong>
              <span>{b.body}</span>
            </li>
          ))}
        </ul>
        <p className="ba-modal__foot">{royalClub.footnote}</p>
        <div className="ba-modal__actions">
          <a
            className="ba-btn ba-btn--primary"
            href="https://www.buddhaair.com/"
            target="_blank"
            rel="noopener noreferrer"
          >
            Join on buddhaair.com
          </a>
          <button className="ba-btn ba-btn--ghost" onClick={onClose}>Close</button>
        </div>
      </Modal>

      <Modal
        open={!!isAssistance}
        onClose={onClose}
        kicker={isAssistance?.kicker}
        title={isAssistance?.title}
      >
        <p className="ba-modal__lead">{isAssistance?.intro}</p>
        <ul className="ba-modal__list">
          {isAssistance?.points.map((p) => <li key={p}><span>{p}</span></li>)}
        </ul>
        <p className="ba-modal__foot">{isAssistance?.footnote}</p>
        <div className="ba-modal__actions">
          <a
            className="ba-btn ba-btn--primary"
            href="https://www.buddhaair.com/"
            target="_blank"
            rel="noopener noreferrer"
          >
            Confirm with the airline
          </a>
          <button className="ba-btn ba-btn--ghost" onClick={onClose}>Close</button>
        </div>
      </Modal>

      <Modal
        open={!!isLegal}
        onClose={onClose}
        kicker={isLegal?.kicker}
        title={isLegal?.title}
      >
        <div className="ba-modal__prose">
          {isLegal?.body.map((p) => <p key={p}>{p}</p>)}
        </div>
        <div className="ba-modal__actions">
          <button className="ba-btn ba-btn--ghost" onClick={onClose}>Close</button>
        </div>
      </Modal>
    </>
  )
}
