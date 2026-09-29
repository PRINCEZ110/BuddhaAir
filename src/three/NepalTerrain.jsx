import React, { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { createNoise2D, fbm } from '../utils/noise'
import { destinations, flightRoutes } from '../data/destinations'

function buildTerrain() {
  const noise = createNoise2D(777)
  const W = 340
  const D = 200
  const seg = 90
  const geo = new THREE.PlaneGeometry(W, D, seg, seg)
  geo.rotateX(-Math.PI / 2)

  const pos = geo.attributes.position
  const colors = new Float32Array(pos.count * 3)
  const low = new THREE.Color('#1d3a2f')
  const mid = new THREE.Color('#2d5a44')
  const high = new THREE.Color('#6b7f8f')
  const snow = new THREE.Color('#e9eff6')

  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i)
    const z = pos.getZ(i)
    const n = fbm(noise, x * 0.02, z * 0.02, 4, 2, 0.5)
    const ridge = Math.abs(noise(x * 0.012 + 40, z * 0.012))
    let h = Math.max(0, n) * 26 + ridge * 40 - 8
    const edge = Math.min(1, (W / 2 - Math.abs(x)) / 30, (D / 2 - Math.abs(z)) / 22)
    h *= THREE.MathUtils.clamp(edge, 0, 1)
    pos.setY(i, h)

    const t = THREE.MathUtils.clamp((h + 8) / 60, 0, 1)
    const c = new THREE.Color().lerpColors(low, mid, Math.min(1, t * 2))
    c.lerp(high, THREE.MathUtils.clamp((t - 0.45) * 2.2, 0, 1))
    c.lerp(snow, THREE.MathUtils.smoothstep(t, 0.78, 0.95))
    colors[i * 3] = c.r
    colors[i * 3 + 1] = c.g
    colors[i * 3 + 2] = c.b
  }

  geo.setAttribute('color', new THREE.BufferAttribute(colors, 3))
  geo.computeVertexNormals()
  return geo
}

function DestinationPoint({ dest, active, onSelect, index }) {
  const ringRef = useRef()
  const dotRef = useRef()

  useFrame((state) => {
    const t = state.clock.elapsedTime
    if (ringRef.current) {
      const s = 1 + Math.sin(t * 2 + index) * 0.18
      ringRef.current.scale.setScalar(active ? s * 1.5 : s)
      ringRef.current.material.opacity = active ? 0.95 : 0.45
    }
    if (dotRef.current) {
      dotRef.current.material.emissiveIntensity = active ? 3.2 : 1.4 + Math.sin(t * 2 + index) * 0.4
    }
  })

  return (
    <group position={[dest.x, 2, dest.z]}>
      <mesh ref={dotRef}>
        <sphereGeometry args={[active ? 2.2 : 1.4, 12, 12]} />
        <meshStandardMaterial
          color={active ? '#ff5a5a' : '#d42b2b'}
          emissive={active ? '#ff3b3b' : '#d42b2b'}
          emissiveIntensity={1.4}
          toneMapped={false}
        />
      </mesh>
      <mesh ref={ringRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.2, 0]}>
        <ringGeometry args={[2.6, 3.1, 32]} />
        <meshBasicMaterial color="#ff6b6b" transparent opacity={0.45} side={THREE.DoubleSide} depthWrite={false} />
      </mesh>
      <mesh
        position={[0, 0, 0]}
        onClick={(e) => { e.stopPropagation(); onSelect(dest) }}
        onPointerOver={(e) => { e.stopPropagation(); document.body.style.cursor = 'pointer' }}
        onPointerOut={() => { document.body.style.cursor = 'auto' }}
      >
        <sphereGeometry args={[6, 8, 8]} />
        <meshBasicMaterial visible={false} />
      </mesh>
    </group>
  )
}

function FlightRoute({ from, to, index }) {
  const lineRef = useRef()
  const dotRef = useRef()

  const { curve, length } = useMemo(() => {
    const a = destinations.find((d) => d.id === from)
    const b = destinations.find((d) => d.id === to)
    if (!a || !b) return { curve: null, length: 0 }
    const mid = new THREE.Vector3(
      (a.x + b.x) / 2,
      26 + Math.hypot(b.x - a.x, b.z - a.z) * 0.28,
      (a.z + b.z) / 2
    )
    const curve = new THREE.QuadraticBezierCurve3(
      new THREE.Vector3(a.x, 2, a.z),
      mid,
      new THREE.Vector3(b.x, 2, b.z)
    )
    return { curve, length: curve.getLength() }
  }, [from, to])

  const dashCount = Math.max(8, Math.floor(length / 6))

  useFrame((state) => {
    const t = state.clock.elapsedTime
    if (dotRef.current && curve) {
      const p = (t * 0.06 + index * 0.13) % 1
      const pos = curve.getPointAt(p)
      dotRef.current.position.copy(pos)
      dotRef.current.material.opacity = 0.65 + Math.sin(t * 3 + index) * 0.3
    }
  })

  if (!curve) return null

  const points = curve.getPoints(48)
  const geo = new THREE.BufferGeometry().setFromPoints(points)

  return (
    <group>
      <line ref={lineRef} geometry={geo}>
        <lineBasicMaterial color="#e8b4b4" transparent opacity={0.34} />
      </line>
      {Array.from({ length: dashCount }).map((_, i) => {
        const p = curve.getPointAt(i / dashCount)
        return (
          <mesh key={i} position={p}>
            <sphereGeometry args={[0.28, 6, 6]} />
            <meshBasicMaterial color="#f0c8c8" transparent opacity={0.5} />
          </mesh>
        )
      })}
      <mesh ref={dotRef}>
        <sphereGeometry args={[0.9, 10, 10]} />
        <meshBasicMaterial color="#ff4d4d" transparent opacity={0.9} toneMapped={false} />
      </mesh>
    </group>
  )
}

export default function NepalTerrain({ quality = 'high', activeDestination, onSelectDestination }) {
  const terrainGeo = useMemo(() => buildTerrain(), [])
  const groupRef = useRef()

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.3) * 0.6
    }
  })

  return (
    <group ref={groupRef}>
      <mesh geometry={terrainGeo}>
        <meshStandardMaterial vertexColors metalness={0.05} roughness={0.95} />
      </mesh>

      {flightRoutes.map((r, i) => (
        <FlightRoute key={`${r.from}-${r.to}`} from={r.from} to={r.to} index={i} />
      ))}

      {destinations.map((d, i) => (
        <DestinationPoint
          key={d.id}
          dest={d}
          index={i}
          active={activeDestination === d.id}
          onSelect={onSelectDestination}
        />
      ))}
    </group>
  )
}
