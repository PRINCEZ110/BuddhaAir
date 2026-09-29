import React, { useMemo } from 'react'
import * as THREE from 'three'
import { createNoise2D, ridged, fbm } from '../utils/noise'

const snowMaterial = new THREE.MeshStandardMaterial({
  color: '#e8eef5',
  metalness: 0.05,
  roughness: 0.75,
  flatShading: true
})

// Smooth-shaded: faceted low-poly terrain was reading as a shattered
// crystal mass rather than a believable Himalayan range.
const rockMaterial = new THREE.MeshStandardMaterial({
  color: '#5a6a80',
  metalness: 0.05,
  roughness: 0.95,
  flatShading: false
})

function buildMountainLayer({ width, depth, segments, height, seed, snowLine = 0.45, offset = [0, 0, 0] }) {
  const noise = createNoise2D(seed)
  const geo = new THREE.PlaneGeometry(width, depth, segments, segments)
  geo.rotateX(-Math.PI / 2)
  // Translate into place; the noise is sampled in local space so each
  // range keeps its own seed pattern.
  geo.translate(offset[0], 0, offset[2])

  const pos = geo.attributes.position
  const colors = new Float32Array(pos.count * 3)
  const snowColor = new THREE.Color('#eef3f9')
  const rockColor = new THREE.Color('#4d5c72')
  const deepColor = new THREE.Color('#33415a')

  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i)
    const z = pos.getZ(i) - offset[2]
    const n = ridged(noise, x * 0.0013, z * 0.0013, 4, 2.1, 0.5)
    const detail = fbm(noise, x * 0.005, z * 0.005, 4, 2, 0.5)
    // Low exponent keeps the range broad and readable rather than spiky;
    // the fbm term breaks up the silhouette so it does not read as a wall.
    let h = Math.pow(Math.max(0, n), 1.15) * height + detail * height * 0.22
    const edge = Math.min(1, (width / 2 - Math.abs(x)) / (width * 0.16))
    h *= THREE.MathUtils.clamp(edge, 0, 1)
    pos.setY(i, h)

    const snow = THREE.MathUtils.smoothstep(h / height, snowLine, snowLine + 0.22)
    const c = new THREE.Color().lerpColors(deepColor, rockColor, THREE.MathUtils.clamp(h / height + 0.25, 0, 1))
    c.lerp(snowColor, snow)
    colors[i * 3] = c.r
    colors[i * 3 + 1] = c.g
    colors[i * 3 + 2] = c.b
  }

  geo.setAttribute('color', new THREE.BufferAttribute(colors, 3))
  geo.computeVertexNormals()
  return geo
}

export default function Mountains({ quality = 'high' }) {
  const layers = useMemo(() => {
    const seg = quality === 'low' ? 56 : quality === 'medium' ? 100 : 160
    // Ranges are wide enough to still fill the horizon as the camera
    // yaws, and all sit inside the 6000 far plane.
    return [
      { geo: buildMountainLayer({ width: 9000, depth: 1800, segments: seg, height: 780, seed: 11, snowLine: 0.3, offset: [0, 0, -4300] }), key: 'far' },
      { geo: buildMountainLayer({ width: 6500, depth: 1400, segments: seg, height: 500, seed: 47, snowLine: 0.4, offset: [0, 0, -3100] }), key: 'mid' },
      { geo: buildMountainLayer({ width: 4500, depth: 1100, segments: seg, height: 290, seed: 83, snowLine: 0.52, offset: [0, 0, -2200] }), key: 'near' }
    ]
  }, [quality])

  return (
    <group>
      {layers.map((l) => (
        <mesh key={l.key} geometry={l.geo} material={rockMaterial} />
      ))}
    </group>
  )
}

export function HimalayaPeaks({ quality = 'high', count = 7 }) {
  const peaks = useMemo(() => {
    const noise = createNoise2D(2024)
    const arr = []
    for (let i = 0; i < count; i++) {
      const x = -900 + (i / (count - 1)) * 1800 + noise(i * 3.1, 0) * 120
      const z = -700 - Math.abs(noise(i * 1.7, 5)) * 300
      const h = 380 + Math.abs(noise(i * 2.3, 9)) * 420
      const r = 130 + Math.abs(noise(i * 0.9, 3)) * 110
      arr.push({ x, z, h, r, key: i })
    }
    return arr
  }, [count])

  const seg = quality === 'low' ? 24 : 48

  return (
    <group>
      {peaks.map((p) => (
        <mesh key={p.key} position={[p.x, p.h / 2 - 40, p.z]}>
          <coneGeometry args={[p.r, p.h, seg, 4]} />
          <meshStandardMaterial
            color="#dfe8f2"
            metalness={0.05}
            roughness={0.8}
            flatShading
          />
        </mesh>
      ))}
    </group>
  )
}
