// Scroll timeline anchors.
//
// `progressRef` is NOT the raw fraction of the document. It is derived from
// these anchors so that every authored constant in CameraController,
// aircraftPath, chapters and the Visibility gates keeps pointing at the
// section it was written for — even when a section above or below them
// changes height (which is exactly what a CSS/typography pass does).
//
// Each entry pins a section's TOP to a fixed `t`. Between anchors the value
// interpolates linearly in pixels. The old calibration these t values come
// from is the measured layout the camera keyframes were authored against:
//
//   CameraController.jsx   KEYFRAMES + LIGHT_STATES
//   timeline/aircraftPath  PATH
//   data/chapters          chapters + RUNWAY_RANGE
//   Experience.jsx         Visibility ranges
//
// If a section here is missing from the DOM the anchor is skipped, so
// `npm run verify:layout` asserts every one of them exists.
//
// `id` matches `document.getElementById`; `q` is a selector for sections
// that have no id.
export const TIMELINE_ANCHORS = [
  { id: 'top', t: 0.000 },
  { id: 'cinematic', t: 0.050 },
  { id: 'destinations', t: 0.388 },
  { id: 'book', t: 0.537 },
  { id: 'fleet', t: 0.575 },
  { id: 'mountain-flight', t: 0.628 },
  { id: 'stats', t: 0.669 },
  { id: 'safety', t: 0.700 },
  { id: 'company', t: 0.746 },
  { id: 'royal-club', t: 0.788 },
  { id: 'assistance', t: 0.834 },
  { id: 'holidays', t: 0.872 },
  { id: 'stories', t: 0.924 },
  { id: 'support', t: 0.955 },
  { id: 'status', t: 0.975 },
  { q: 'section.ba-cta', t: 0.990 },
  { id: 'footer', t: 0.997 }
]
