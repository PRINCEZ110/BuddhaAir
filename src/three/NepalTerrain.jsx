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

function DestinationPoint({ dest, active, focused, onSelect, index, reducedMotion }) {
  const ringRef = useRef()
  const dotRef = useRef()
  const beamRef = useRef()
  const [hover, setHover] = React.useState(false)

  useFrame((state) => {
    const t = reducedMotion ? 0 : state.clock.elapsedTime
    if (ringRef.current) {
      const s = 1 + Math.sin(t * 2 + index) * 0.18
      ringRef.current.scale.setScalar(active || focused ? s * 1.6 : s)
      ringRef.current.material.opacity = focused ? 1 : active ? 0.9 : 0.45
    }
    if (dotRef.current) {
      dotRef.current.material.emissiveIntensity = focused ? 4.2 : active ? 3.2 : 1.4 + Math.sin(t * 2 + index) * 0.4
    }
    if (beamRef.current) {
      // Vertical light column marks the focused city from any angle.
      const target = focused ? 1 : 0
      const cur = beamRef.current.userData.v ?? 0
      const v = cur + (target - cur) * 0.14
      beamRef.current.userData.v = v
      beamRef.current.material.opacity = v * 0.4
      beamRef.current.scale.y = 0.4 + v * 0.6
    }
  })

  const on = active || focused

  return (
    <group position={[dest.x, 2, dest.z]}>
      <mesh ref={dotRef}>
        <sphereGeometry args={[on ? 2.2 : 1.4, 12, 12]} />
        <meshStandardMaterial
          color={on ? '#ff5a5a' : '#d42b2b'}
          emissive={on ? '#ff3b3b' : '#d42b2b'}
          emissiveIntensity={1.4}
          toneMapped={false}
        />
      </mesh>
      <mesh ref={ringRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.2, 0]}>
        <ringGeometry args={[2.6, 3.1, 32]} />
        <meshBasicMaterial color="#ff6b6b" transparent opacity={0.45} side={THREE.DoubleSide} depthWrite={false} />
      </mesh>
      <mesh ref={beamRef} position={[0, 22, 0]} visible={false}>
        <cylinderGeometry args={[1.5, 3.4, 44, 10, 1, true]} />
        <meshBasicMaterial color="#ff7a7a" transparent opacity={0} side={THREE.DoubleSide} depthWrite={false} toneMapped={false} />
        <primitive object={new THREE.Object3D()} attach="userData-marker" />
      </mesh>

      <mesh
        onClick={(e) => { e.stopPropagation(); onSelect(dest) }}
        onPointerOver={(e) => { e.stopPropagation(); setHover(true); document.body.style.cursor = 'pointer' }}
        onPointerOut={() => { setHover(false); document.body.style.cursor = 'auto' }}
      >
        <sphereGeometry args={[hover || on ? 9 : 6, 8, 8]} />
        <meshBasicMaterial visible={false} />
      </mesh>
    </group>
  )
}

/**
 * All 14 routes drawn as a single line-segment batch, all dashes as one
 * InstancedMesh, and all moving aircraft as a second InstancedMesh.
 *
 * Previously each route owned its own <line> plus 8-22 individual dash
 * meshes plus a moving sphere, which measured at 234 draw calls at the
 * Nepal map. This is 3.
 */
function Routes({ reducedMotion }) {
  const dashRef = useRef()
  const planeRef = useRef()
  const { lineGeo, dashGeo, dashCount, curves, planeGeo, dashMatrices } = useMemo(() => {
    const positions = []
    const dashMatrices = []
    const curves = []
    let n = 0

    for (const r of flightRoutes) {
      const a = destinations.find((d) => d.id === r.from)
      const b = destinations.find((d) => d.id === r.to)
      if (!a || !b) continue

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
      curves.push(curve)

      const pts = curve.getPoints(48)
      for (let i = 0; i < pts.length - 1; i++) {
        positions.push(pts[i].x, pts[i].y, pts[i].z, pts[i + 1].x, pts[i + 1].y, pts[i + 1].z)
      }

      const steps = Math.max(8, Math.floor(curve.getLength() / 6))
      const m = new THREE.Matrix4()
      for (let i = 0; i < steps; i++) {
        const p = curve.getPointAt(i / steps)
        m.makeTranslation(p.x, p.y, p.z)
        dashMatrices.push(m.clone())
        n++
      }
    }

    const lineGeo = new THREE.BufferGeometry()
    lineGeo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))

    const dashGeo = new THREE.SphereGeometry(0.3, 6, 6)
    const planeGeo = new THREE.ConeGeometry(0.8, 2.6, 5)
    planeGeo.rotateX(Math.PI / 2)

    return { lineGeo, dashGeo, dashCount: n, curves, planeGeo, dashMatrices }
  }, [])

  React.useEffect(() => {
    const inst = dashRef.current
    if (inst && dashMatrices) {
      dashMatrices.forEach((m, i) => inst.setMatrixAt(i, m))
      inst.instanceMatrix.needsUpdate = true
    }
    return () => {
      lineGeo.dispose()
      dashGeo.dispose()
      planeGeo.dispose()
    }
  }, [lineGeo, dashGeo, planeGeo, dashMatrices])

  useFrame((state) => {
    if (reducedMotion) return
    const t = state.clock.elapsedTime
    const inst = planeRef.current
    if (!inst) return
    const m = new THREE.Matrix4()
    const q = new THREE.Quaternion()
    const up = new THREE.Vector3(0, 1, 0)
    curves.forEach((curve, i) => {
      const p = (t * 0.06 + i * 0.13) % 1
      const pos = curve.getPointAt(p)
      const tan = curve.getTangentAt(p)
      q.setFromUnitVectors(new THREE.Vector3(0, 0, 1), tan.clone().normalize())
      m.compose(pos, q, new THREE.Vector3(1, 1, 1))
      inst.setMatrixAt(i, m)
    })
    inst.instanceMatrix.needsUpdate = true
  })

  return (
    <group>
      <lineSegments geometry={lineGeo}>
        <lineBasicMaterial color="#e8b4b4" transparent opacity={0.4} />
      </lineSegments>
      <instancedMesh ref={dashRef} args={[dashGeo, undefined, dashCount]}>
        <meshBasicMaterial color="#f0c8c8" transparent opacity={0.5} />
      </instancedMesh>
      <instancedMesh ref={planeRef} args={[planeGeo, undefined, curves.length]}>
        <meshBasicMaterial color="#ff5a5a" toneMapped={false} />
      </instancedMesh>
    </group>
  )
}

export default function NepalTerrain({ quality = 'high', reducedMotion, activeDestination, focusedDestination, onSelectDestination }) {
  const terrainGeo = useMemo(() => buildTerrain(), [])
  const groupRef = useRef()

  useFrame((state) => {
    if (groupRef.current && !reducedMotion) {
      groupRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.3) * 0.6
    }
  })

  React.useEffect(() => () => terrainGeo.dispose(), [terrainGeo])

  return (
    <group ref={groupRef}>
      <mesh geometry={terrainGeo}>
        <meshStandardMaterial vertexColors metalness={0.05} roughness={0.95} />
      </mesh>

      <Routes reducedMotion={reducedMotion} />

      {destinations.map((d, i) => (
        <DestinationPoint
          key={d.id}
          dest={d}
          index={i}
          reducedMotion={reducedMotion}
          active={activeDestination === d.id}
          focused={focusedDestination === d.id}
          onSelect={onSelectDestination}
        />
      ))}
    </group>
  )
}
