import * as THREE from 'three'

/**
 * Single source of truth for where the aircraft is at a given scroll
 * progress. Both <AircraftRig> and <CameraController> read this, so the
 * camera can never drift away from the aeroplane it is meant to be
 * following.
 *
 * Coordinate convention: the nose points +X and the runway is laid along
 * X (see Runway.jsx). Pitch is a rotation about Z; positive lifts the nose.
 */

const PATH = [
  { t: 0.000, x: 0,   y: 1.6,  z: 0, pitch: 0.00, spin: 0,  ease: 'linear' },
  { t: 0.042, x: 0,   y: 1.6,  z: 0, pitch: 0.00, spin: 0,  ease: 'out1' },
  // Roll: ease-in so it reads as acceleration, not a slide.
  { t: 0.150, x: 58,  y: 1.6,  z: 0, pitch: 0.05, spin: 30, ease: 'in2' },
  // Rotate and climb through the valley.
  { t: 0.230, x: 132, y: 96,   z: 0, pitch: 0.30, spin: 34, ease: 'in1' },
  // Into the cloud deck, then level off above it.
  { t: 0.292, x: 182, y: 161,  z: 0, pitch: 0.12, spin: 34, ease: 'out2' },
  { t: 0.400, x: 216, y: 172,  z: 0, pitch: 0.05, spin: 34, ease: 'linear' },
  { t: 0.560, x: 252, y: 172,  z: 0, pitch: 0.05, spin: 34, ease: 'linear' },
  { t: 0.632, x: 302, y: 118,  z: 0, pitch: 0.16, spin: 34, ease: 'in1' },
  { t: 1.000, x: 330, y: 30,   z: 0, pitch: 0.22, spin: 0,  ease: 'in1' }
]

const EASE = {
  linear: (u) => u,
  in1: (u) => u * u,
  in2: (u) => u * u * u,
  out1: (u) => 1 - Math.pow(1 - u, 2),
  out2: (u) => 1 - Math.pow(1 - u, 3),
  smooth: (u) => u * u * (3 - 2 * u)
}

const _state = { x: 0, y: 0, z: 0, pitch: 0, spin: 0 }

export function getAircraftState(t) {
  const time = THREE.MathUtils.clamp(t, 0, 1)
  let i = 0
  while (i < PATH.length - 2 && PATH[i + 1].t < time) i++
  const a = PATH[i]
  const b = PATH[i + 1]
  const span = b.t - a.t
  const local = span > 0 ? THREE.MathUtils.clamp((time - a.t) / span, 0, 1) : 0
  const u = (EASE[b.ease] || EASE.smooth)(local)

  _state.x = THREE.MathUtils.lerp(a.x, b.x, u)
  _state.y = THREE.MathUtils.lerp(a.y, b.y, u)
  _state.z = THREE.MathUtils.lerp(a.z, b.z, u)
  _state.pitch = THREE.MathUtils.lerp(a.pitch, b.pitch, u)
  _state.spin = THREE.MathUtils.lerp(a.spin, b.spin, u)
  return _state
}

/**
 * True while the external airframe should be rendered. It stops before the
 * cabin beat: from inside the aircraft you cannot see its own exterior, so
 * drawing the model out there produced a second aeroplane visible through
 * the window.
 */
export function isAircraftActive(t) {
  return t < 0.632
}
