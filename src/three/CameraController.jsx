import { useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { getAircraftState } from './timeline/aircraftPath'

/**
 * Camera keyframes are authored against the MEASURED scroll timeline, not
 * guessed. Re-run `npm run verify:layout` after any section height change
 * and re-check these numbers.
 *
 * `orbit` keyframes are resolved against the shared aircraft path so the
 * camera can never frame a point the aeroplane is not at. `look` keyframes
 * are absolute. The Himalaya ridge geometry sits at -Z, so the 0.292 beat
 * deliberately looks -Z.
 */
const KEYFRAMES = [
  { t: 0.000, pos: [46, 6.5, 46], look: [0, 5, 0], fov: 40 },
  { t: 0.052, pos: [31, 5.2, 30], look: [0, 4.5, 0], fov: 40 },
  { t: 0.112, pos: [34, 8, 54], look: [30, 5, 0], fov: 44 },
  { t: 0.160, pos: [40, 13, 62], look: [58, 6, 0], fov: 48 },
  { t: 0.210, pos: [48, 58, 96], look: [118, 62, 0], fov: 52 },
  { t: 0.258, pos: [30, 128, 150], look: [150, 122, -80], fov: 54 },
  // Himalayas: look -Z at the ridge, aircraft held in frame.
  { t: 0.305, pos: [104, 168, 236], look: [186, 150, -760], fov: 58 },
  { t: 0.342, pos: [120, 205, 205], look: [55, 15, -20], fov: 55 },
  // Destination index runs 0.388 - 0.537: hold a high map view so the
  // terrain, nodes and routes stay readable behind the cards.
  { t: 0.400, pos: [30, 195, 185], look: [10, 0, 0], fov: 50 },
  { t: 0.470, pos: [10, 165, 155], look: [0, 0, 0], fov: 48 },
  { t: 0.537, pos: [30, 150, 150], look: [10, 0, 0], fov: 48 },
  // Fleet showcase runs 0.575 - 0.628: orbit the aircraft itself. Elevation
  // is deliberately shallow — at +20/+22 the camera pitched ~19 degrees down,
  // and with no terrain mounted at this beat the lower two thirds of the
  // frame was bare ground tone. Most of the frame is sky now.
  { t: 0.580, orbit: [42, 11, 48], fov: 46 },
  { t: 0.610, orbit: [-40, 11, 52], fov: 44 },
  { t: 0.628, orbit: [-26, 8, 38], fov: 46 },
  // Mountain flight 0.628 - 0.669. The camera sits at the window seat and
  // looks out over the ridge, which lives at -Z.
  { t: 0.648, pos: [268, 132, 24], look: [352, 128, -520], fov: 60 },
  { t: 0.672, pos: [40, 175, 235], look: [10, 30, 0], fov: 48 },
  { t: 0.750, pos: [90, 150, 300], look: [0, 20, 0], fov: 46 },
  { t: 0.900, pos: [120, 160, 330], look: [0, 25, 0], fov: 47 },
  { t: 1.000, pos: [130, 165, 345], look: [0, 25, 0], fov: 48 }
]

// Fog density is deliberately low. At the previous values (0.0013-0.0016)
// the 2.2-4.5 km mountain ranges evaluated to ~100% fog, so they rendered
// as flat paper-white cut-outs with no rock, no depth and no shading. These
// values leave real atmospheric perspective without erasing the terrain.
const LIGHT_STATES = [
  { t: 0.0, sun: '#ffb36b', sunI: 2.4, amb: '#8fa8c8', ambI: 0.42, fog: '#c8d4e4', fogD: 0.00024, sky: '#a8c4e0' },
  { t: 0.11, sun: '#ffd9a8', sunI: 2.7, amb: '#a8bdd8', ambI: 0.45, fog: '#d4e0ee', fogD: 0.00021, sky: '#bcd4ec' },
  { t: 0.21, sun: '#e8f0ff', sunI: 2.5, amb: '#b8cce4', ambI: 0.48, fog: '#dce8f4', fogD: 0.00018, sky: '#c4dcf2' },
  { t: 0.30, sun: '#ffc98a', sunI: 2.2, amb: '#9ab4d4', ambI: 0.42, fog: '#e0d8c8', fogD: 0.00017, sky: '#c8d4e8' },
  { t: 0.40, sun: '#fff2dc', sunI: 2.6, amb: '#b0c4dc', ambI: 0.45, fog: '#d8e4f0', fogD: 0.00022, sky: '#c0d8ee' },
  { t: 0.56, sun: '#ffd9a0', sunI: 2.1, amb: '#8aa4c4', ambI: 0.4, fog: '#d0dae8', fogD: 0.00028, sky: '#b4cce4' },
  { t: 0.66, sun: '#ffe0b0', sunI: 2.0, amb: '#93aac6', ambI: 0.44, fog: '#d8dcea', fogD: 0.0004, sky: '#bcd0e6' },
  { t: 0.78, sun: '#e8b8a0', sunI: 1.4, amb: '#5a708c', ambI: 0.35, fog: '#2a3a55', fogD: 0.0012, sky: '#1a2a45' },
  { t: 1.0, sun: '#d4a080', sunI: 1.0, amb: '#4a5f7c', ambI: 0.3, fog: '#141f35', fogD: 0.0016, sky: '#0e1a2e' }
]

const smoothstep = (u) => u * u * (3 - 2 * u)

function bracket(t, frames) {
  let i = 0
  while (i < frames.length - 1 && frames[i + 1].t < t) i++
  const a = frames[i]
  const b = frames[Math.min(i + 1, frames.length - 1)]
  const span = b.t - a.t
  const local = span > 0 ? THREE.MathUtils.clamp((t - a.t) / span, 0, 1) : 0
  return { a, b, e: smoothstep(local) }
}

const _pos = new THREE.Vector3()
const _look = new THREE.Vector3()
const _from = new THREE.Vector3()
const _to = new THREE.Vector3()
const _tmp = new THREE.Vector3()
const _c1 = new THREE.Color()
const _c2 = new THREE.Color()

export default function CameraController({ progressRef, reducedMotion, focusRef }) {
  const { camera, scene, size } = useThree()
  const smooth = useRef(0)
  const lookTarget = useRef(new THREE.Vector3(0, 5, 0))
  const focusMix = useRef(0)

  useFrame((_, delta) => {
    // Reduced motion pins the whole rig to the hero state; Experience
    // separately freezes scene visibility so nothing toggles underneath.
    const target = reducedMotion ? 0 : progressRef.current
    smooth.current = THREE.MathUtils.damp(smooth.current, target, reducedMotion ? 10 : 3.4, delta)
    const t = smooth.current

    // Portrait framing: pull back so a 27 m wingspan still fits a 360 px
    // viewport instead of being cropped by the narrow horizontal FOV.
    const aspect = size.width / Math.max(1, size.height)
    const dist = aspect < 1 ? THREE.MathUtils.clamp(1 / aspect, 1, 1.85) : 1
    const fovBoost = aspect < 1 ? 4 : 0

    const { a, b, e } = bracket(t, KEYFRAMES)
    const plane = getAircraftState(t)

    // Resolve endpoints: either an absolute pos/look or an aircraft orbit.
    const resolve = (k, outPos, outLook) => {
      if (k.orbit) {
        const ap = getAircraftState(k.t)
        outPos.set(ap.x + k.orbit[0], ap.y + k.orbit[1], ap.z + k.orbit[2])
        outLook.set(ap.x, ap.y, ap.z)
      } else {
        outPos.fromArray(k.pos)
        outLook.fromArray(k.look)
      }
    }
    resolve(a, _from, _to)
    const aPosX = _from.x, aPosY = _from.y, aPosZ = _from.z
    const aLookX = _to.x, aLookY = _to.y, aLookZ = _to.z
    resolve(b, _from, _to)
    _pos.set(THREE.MathUtils.lerp(aPosX, _from.x, e), THREE.MathUtils.lerp(aPosY, _from.y, e), THREE.MathUtils.lerp(aPosZ, _from.z, e))
    _look.set(THREE.MathUtils.lerp(aLookX, _to.x, e), THREE.MathUtils.lerp(aLookY, _to.y, e), THREE.MathUtils.lerp(aLookZ, _to.z, e))
    const fov = THREE.MathUtils.lerp(a.fov ?? 45, b.fov ?? 45, e) + fovBoost

    // Destination focus overrides the timeline and blends back out.
    const focus = focusRef?.current
    const wantFocus = !reducedMotion && focus && focus.active
    focusMix.current = THREE.MathUtils.damp(focusMix.current, wantFocus ? 1 : 0, 4.5, delta)
    if (focusMix.current > 0.001 && focus) {
      const target = new THREE.Vector3(focus.x, focus.y + 6, focus.z)
      const camTo = target.clone().add(new THREE.Vector3(74, 46, 86))
      _pos.lerp(camTo, focusMix.current)
      _look.lerp(target, focusMix.current)
    }

    // Push the whole rig back from its look target on portrait.
    if (dist !== 1) {
      _tmp.subVectors(_pos, _look).multiplyScalar(dist)
      _pos.copy(_look).add(_tmp)
    }

    camera.position.copy(_pos)
    lookTarget.current.lerp(_look, 1 - Math.exp(-4 * delta))
    camera.lookAt(lookTarget.current)

    const targetFov = wantFocus ? 42 + fovBoost : fov
    if (Math.abs(camera.fov - targetFov) > 0.01) {
      camera.fov = targetFov
      camera.updateProjectionMatrix()
    }

    // Lighting, fog and sky all sampled from the same value as the camera.
    const ls = bracket(t, LIGHT_STATES)
    const sun = scene.getObjectByName('ba-sun')
    if (sun) {
      sun.color.set(ls.a.sun).lerp(_c2.set(ls.b.sun), ls.e)
      sun.intensity = THREE.MathUtils.lerp(ls.a.sunI, ls.b.sunI, ls.e)
    }
    const amb = scene.getObjectByName('ba-amb')
    if (amb) {
      amb.color.set(ls.a.amb).lerp(_c2.set(ls.b.amb), ls.e)
      amb.intensity = THREE.MathUtils.lerp(ls.a.ambI, ls.b.ambI, ls.e)
    }
    if (scene.fog) {
      scene.fog.color.set(ls.a.fog).lerp(_c2.set(ls.b.fog), ls.e)
      scene.fog.density = THREE.MathUtils.lerp(ls.a.fogD, ls.b.fogD, ls.e)
    }
    if (scene.background) {
      scene.background.set(ls.a.sky).lerp(_c2.set(ls.b.sky), ls.e)
    }
    // DEV readback. The rig damps toward its keyframes (3.4/s on progress,
    // 4/s on the look target), so a screenshot taken too soon captures a
    // transitional frame rather than the beat being audited. The test
    // scripts poll this until it stops moving.
    if (import.meta.env.DEV) {
      window.__baCamera = [camera.position.x, camera.position.y, camera.position.z]
    }
    void plane
    void _c1
  })

  return null
}
