// Cinematic chapter markers. These are atmospheric titles, not factual
// claims — each one cross-fades in place while the camera flies its beat.
// Positions are authored against the measured scroll timeline (see
// `npm run verify:layout`), not guessed.
//
// Beats are spaced at least 0.044 apart so their cross-fade windows never
// overlap; at 0.030 spacing two titles were legible at once.
export const chapters = [
  { t: 0.052, kicker: 'Approach', line: 'The morning begins on the apron.' },
  { t: 0.112, kicker: 'Roll', line: 'Down the runway, into the sunrise.' },
  { t: 0.160, kicker: 'Takeoff', line: 'Rotate.' },
  { t: 0.210, kicker: 'Climb', line: 'The valley opens beneath the wing.' },
  { t: 0.258, kicker: 'Cloud Deck', line: 'Up through the weather.' },
  { t: 0.305, kicker: 'The Himalaya', line: 'The roof of the world.' },
  { t: 0.352, kicker: 'Nepal', line: 'Fifteen destinations. One network.' }
]

// The runway is the transparent scroll distance that carries the camera
// from the hero to the destination index. The chapter layer is only
// allowed on screen inside this range.
export const RUNWAY_RANGE = [0.028, 0.378]

// Half-width of a chapter's visibility window.
export const CHAPTER_WINDOW = 0.020
