import React, { useMemo } from 'react'
import * as THREE from 'three'
import { createNoise2D, ridged, fbm } from '../utils/noise'

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
  const snowColor = new THREE.Color('#c9d6e4')
  const rockColor = new THREE.Color('#46566d')
  const deepColor = new THREE.Color('#2b3850')

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

export default function Mountains({ quality = 'high', reducedMotion }) {
  // Two ranges instead of three, at half the previous segment count. The
  // third layer was never distinguishable through the fog but cost a third
  // of the terrain budget. Far/mid still gives the aerial depth read.
  const layers = useMemo(() => {
    const seg = quality === 'low' ? 40 : quality === 'medium' ? 60 : 88
    return [
      { geo: buildMountainLayer({ width: 9000, depth: 1800, segments: seg, height: 1500, seed: 11, snowLine: 0.66, offset: [0, 0, -4300] }), key: 'far' },
      { geo: buildMountainLayer({ width: 5200, depth: 1300, segments: seg, height: 520, seed: 83, snowLine: 0.74, offset: [0, 0, -2250] }), key: 'near' }
    ]
  }, [quality])

  // Release GPU memory when the range unmounts. R3F disposes JSX-owned
  // primitives for us, but these geometries are built by hand in useMemo.
  React.useEffect(() => () => layers.forEach((l) => l.geo.dispose()), [layers])

  return (
    <group>
      {layers.map((l) => (
        <mesh key={l.key} geometry={l.geo} material={rockMaterial} />
      ))}
    </group>
  )
}


export function HimalayaPeaks({ quality = 'high', reducedMotion }) {
  // Smooth-shaded now: the original flatShading cones read as crystals.
  const seg = quality === 'low' ? 10 : 16
  const peaks = [
    { x: -420, z: -1750, h: 760, r: 300 },
    { x: -140, z: -2050, h: 980, r: 340 },
    { x: 190, z: -1900, h: 860, r: 310 },
    { x: 470, z: -2250, h: 700, r: 280 }
  ]

  React.useEffect(() => () => peaks.forEach(() => {}), [peaks])

  return (
    <group>
      {peaks.map((p, i) => (
        <mesh key={i} position={[p.x, p.h / 2 - 60, p.z]}>
          <coneGeometry args={[p.r, p.h, seg, 1]} />n          <meshStandardMaterial
            color={i % 2 ? '#e4ecf5' : '#d3dfec'}
            metalness={0.02}
            roughness={0.9}
            flatShading={false}
          />n        </mesh>
      ))}
    </group>
  )
}
