import { useEffect, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { SKY_STATES } from './SkyDome'

/**
 * Supplies `scene.environment` from the same palette the SkyDome draws.
 *
 * Without this every material falls back to direct light only, so metal and
 * paint have nothing to reflect and the airframe reads as flat plastic.
 *
 * The equirect map is rebuilt from the live sky, but only when the palette has
 * actually moved — each rebuild costs a PMREM pass, so it is throttled hard.
 * Rebuilding must allocate a NEW texture: three caches the PMREM per texture
 * object, so mutating one in place would leave a stale, frozen reflection.
 */

const W = 128
const H = 64
// Matches SkyDome's uSunDir so the specular highlight lands where the visible
// sun does.
const SUN_DIR = new THREE.Vector3(0.4, 0.35, -0.6).normalize()

const MIN_STEP_MS = 900
const COLOR_EPS = 0.012

const clamp01 = (v) => (v < 0 ? 0 : v > 1 ? 1 : v)
const pow = Math.pow

// GLSL smoothstep(edge0, edge1, x) with edge0 > edge1, as written in the sky
// fragment shader — MathUtils.smoothstep assumes min < max and would invert.
function smoothstepFall(x, edge0, edge1) {
  const t = clamp01((x - edge0) / (edge1 - edge0))
  return t * t * (3 - 2 * t)
}

function linearToSrgb(c) {
  return c <= 0.0031308 ? c * 12.92 : 1.055 * pow(c, 1 / 2.4) - 0.055
}

function skyStateAt(t) {
  let i = 0
  while (i < SKY_STATES.length - 1 && SKY_STATES[i + 1].t < t) i++
  const a = SKY_STATES[i]
  const b = SKY_STATES[Math.min(i + 1, SKY_STATES.length - 1)]
  const span = b.t - a.t
  const local = span > 0 ? clamp01((t - a.t) / span) : 0
  const e = local * local * (3 - 2 * local)
  return {
    zenith: new THREE.Color(a.zenith).lerp(new THREE.Color(b.zenith), e),
    horizon: new THREE.Color(a.horizon).lerp(new THREE.Color(b.horizon), e),
    sun: new THREE.Color(a.sun).lerp(new THREE.Color(b.sun), e)
  }
}

function buildEquirect(sky) {
  const data = new Uint8Array(W * H * 4)
  const col = new THREE.Color()
  const ground = new THREE.Color()
  const lum = 0.299 * sky.horizon.r + 0.587 * sky.horizon.g + 0.114 * sky.horizon.b
  ground.setRGB(lum * 0.30, lum * 0.34, lum * 0.42)

  let p = 0
  for (let y = 0; y < H; y++) {
    const v = (y + 0.5) / H
    const elev = Math.PI * (0.5 - v)
    const dirY = Math.sin(elev)
    const cosEl = Math.cos(elev)
    for (let x = 0; x < W; x++) {
      const az = Math.PI * 2 * ((x + 0.5) / W)
      const dirX = Math.cos(az) * cosEl
      const dirZ = Math.sin(az) * cosEl

      // mirror of the SkyDome fragment shader
      const h = clamp01(dirY)
      const grad = pow(h, 0.55)
      col.copy(sky.horizon).lerp(sky.zenith, grad)

      const d = Math.max(dirX * SUN_DIR.x + dirY * SUN_DIR.y + dirZ * SUN_DIR.z, 0)
      const sunAmt = pow(d, 220)
      const glow = pow(d, 8)
      col.r += sky.sun.r * sunAmt * 1.6 + sky.sun.r * glow * 0.22
      col.g += sky.sun.g * sunAmt * 1.6 + sky.sun.g * glow * 0.22
      col.b += sky.sun.b * sunAmt * 1.6 + sky.sun.b * glow * 0.22

      if (dirY < 0) col.lerp(ground, smoothstepFall(dirY, 0, -0.55))

      data[p++] = linearToSrgb(clamp01(col.r)) * 255
      data[p++] = linearToSrgb(clamp01(col.g)) * 255
      data[p++] = linearToSrgb(clamp01(col.b)) * 255
      data[p++] = 255
    }
  }

  const tex = new THREE.DataTexture(data, W, H, THREE.RGBAFormat, THREE.UnsignedByteType)
  tex.mapping = THREE.EquirectangularReflectionMapping
  tex.colorSpace = THREE.SRGBColorSpace
  tex.magFilter = THREE.LinearFilter
  tex.minFilter = THREE.LinearFilter
  tex.generateMipmaps = false
  tex.needsUpdate = true
  return tex
}

export default function EnvironmentMap({ progressRef, reducedMotion, intensity = 1 }) {
  const scene = useThree((s) => s.scene)
  const state = useRef({ tex: null, last: -1, at: 0 })

  useFrame(() => {
    const now = performance.now()
    if (now - state.current.at < MIN_STEP_MS) return
    state.current.at = now

    const t = reducedMotion ? 0 : progressRef.current
    const sky = skyStateAt(t)
    const key = sky.zenith.r + sky.horizon.g + sky.sun.b

    if (state.current.last >= 0 && Math.abs(key - state.current.last) < COLOR_EPS) return
    state.current.last = key

    const next = buildEquirect(sky)
    scene.environment = next
    scene.environmentIntensity = intensity
    if (state.current.tex) state.current.tex.dispose()
    state.current.tex = next
    // DEV-only readback: proves the map was actually installed, which no
    // screenshot can distinguish from a slightly brighter sun.
    if (import.meta.env.DEV) window.__baEnv = { w: W, h: H, intensity }
  })

  useEffect(() => () => {
    if (state.current.tex) state.current.tex.dispose()
    if (scene.environment === state.current.tex) scene.environment = null
  }, [scene])

  return null
}
