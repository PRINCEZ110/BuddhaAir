import { useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'

const KEYFRAMES = [
  { t: 0.0, pos: [46, 6.5, 46], look: [0, 5, 0], fov: 40 },
  { t: 0.05, pos: [34, 6.2, 33], look: [0, 5, 0], fov: 40 },
  { t: 0.11, pos: [34, 11, 52], look: [70, 13, 0], fov: 46 },
  { t: 0.17, pos: [70, 54, 90], look: [180, 70, 0], fov: 50 },
  { t: 0.23, pos: [120, 156, 210], look: [340, 110, 0], fov: 52 },
  { t: 0.29, pos: [80, 182, 280], look: [420, 130, 0], fov: 55 },
  { t: 0.36, pos: [0, 120, 152], look: [0, 6, 0], fov: 50 },
  { t: 0.4, pos: [26, 18, 30], look: [0, 4, 0], fov: 46 },
  { t: 0.46, pos: [50, 30, 52], look: [0, 4, 0], fov: 44 },
  { t: 0.52, pos: [-40, 24, 44], look: [0, 4, 0], fov: 44 },
  { t: 0.56, pos: [0, 10, 17], look: [0, 15, -330], fov: 58 },
  { t: 0.62, pos: [0, 32, 92], look: [0, 16, 0], fov: 50 },
  { t: 0.72, pos: [0, 17, 52], look: [0, 8, 0], fov: 46 },
  { t: 0.85, pos: [0, 25, 82], look: [0, 10, 0], fov: 48 },
  { t: 1.0, pos: [0, 28, 88], look: [0, 12, 0], fov: 48 }
]

const LIGHT_STATES = [
  { t: 0.0, sun: '#ffb36b', sunI: 2.6, amb: '#8fa8c8', ambI: 0.5, fog: '#c8d4e4', fogD: 0.0016, sky: '#a8c4e0' },
  { t: 0.11, sun: '#ffd9a8', sunI: 3.0, amb: '#a8bdd8', ambI: 0.55, fog: '#d4e0ee', fogD: 0.0013, sky: '#bcd4ec' },
  { t: 0.23, sun: '#e8f0ff', sunI: 2.8, amb: '#b8cce4', ambI: 0.6, fog: '#dce8f4', fogD: 0.0011, sky: '#c4dcf2' },
  { t: 0.32, sun: '#ffc98a', sunI: 2.4, amb: '#9ab4d4', ambI: 0.5, fog: '#e8ddc8', fogD: 0.0014, sky: '#c8d4e8' },
  { t: 0.44, sun: '#fff2dc', sunI: 3.0, amb: '#b0c4dc', ambI: 0.55, fog: '#d8e4f0', fogD: 0.0012, sky: '#c0d8ee' },
  { t: 0.56, sun: '#ffd9a0', sunI: 2.2, amb: '#8aa4c4', ambI: 0.45, fog: '#d0dae8', fogD: 0.0015, sky: '#b4cce4' },
  { t: 0.7, sun: '#e8b8a0', sunI: 1.4, amb: '#5a708c', ambI: 0.35, fog: '#2a3a55', fogD: 0.0028, sky: '#1a2a45' },
  { t: 1.0, sun: '#d4a080', sunI: 1.0, amb: '#4a5f7c', ambI: 0.3, fog: '#141f35', fogD: 0.0035, sky: '#0e1a2e' }
]

function sampleKeyframes(t, frames, key) {
  let i = 0
  while (i < frames.length - 1 && frames[i + 1].t < t) i++
  const a = frames[i]
  const b = frames[Math.min(i + 1, frames.length - 1)]
  const span = b.t - a.t
  const local = span > 0 ? THREE.MathUtils.clamp((t - a.t) / span, 0, 1) : 0
  const eased = local * local * (3 - 2 * local)
  return { a, b, eased }
}

const _pos = new THREE.Vector3()
const _look = new THREE.Vector3()
const _sunColor = new THREE.Color()
const _ambColor = new THREE.Color()
const _fogColor = new THREE.Color()
const _skyColor = new THREE.Color()

export default function CameraController({ progressRef, reducedMotion }) {
  const { camera, scene } = useThree()
  const smooth = useRef(0)
  const lookTarget = useRef(new THREE.Vector3(0, 3.5, 0))

  useFrame((_, delta) => {
    const target = reducedMotion ? 0 : progressRef.current
    smooth.current = THREE.MathUtils.damp(smooth.current, target, reducedMotion ? 10 : 3.2, delta)
    const t = smooth.current

    const { a, b, eased } = sampleKeyframes(t, KEYFRAMES)
    _pos.set(
      THREE.MathUtils.lerp(a.pos[0], b.pos[0], eased),
      THREE.MathUtils.lerp(a.pos[1], b.pos[1], eased),
      THREE.MathUtils.lerp(a.pos[2], b.pos[2], eased)
    )
    _look.set(
      THREE.MathUtils.lerp(a.look[0], b.look[0], eased),
      THREE.MathUtils.lerp(a.look[1], b.look[1], eased),
      THREE.MathUtils.lerp(a.look[2], b.look[2], eased)
    )

    camera.position.copy(_pos)
    lookTarget.current.lerp(_look, 1 - Math.exp(-4 * delta))
    camera.lookAt(lookTarget.current)

    const targetFov = THREE.MathUtils.lerp(a.fov, b.fov, eased)
    if (Math.abs(camera.fov - targetFov) > 0.01) {
      camera.fov = targetFov
      camera.updateProjectionMatrix()
    }

    const ls = sampleKeyframes(t, LIGHT_STATES)
    _sunColor.set(ls.a.sun).lerp(_skyColor.set(ls.b.sun), ls.eased)
    _ambColor.set(ls.a.amb).lerp(new THREE.Color(ls.b.amb), ls.eased)
    _fogColor.set(ls.a.fog).lerp(new THREE.Color(ls.b.fog), ls.eased)

    const sun = scene.getObjectByName('ba-sun')
    if (sun) {
      sun.color.copy(_sunColor)
      sun.intensity = THREE.MathUtils.lerp(ls.a.sunI, ls.b.sunI, ls.eased)
    }
    const amb = scene.getObjectByName('ba-amb')
    if (amb) {
      amb.color.copy(_ambColor)
      amb.intensity = THREE.MathUtils.lerp(ls.a.ambI, ls.b.ambI, ls.eased)
    }
    if (scene.fog) {
      scene.fog.color.copy(_fogColor)
      scene.fog.density = THREE.MathUtils.lerp(ls.a.fogD, ls.b.fogD, ls.eased)
    }
    if (scene.background) {
      scene.background.copy(_skyColor.set(ls.a.sky).lerp(new THREE.Color(ls.b.sky), ls.eased))
    }
  })

  return null
}
