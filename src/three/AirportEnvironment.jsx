import React, { useMemo, useRef } from 'react'
import * as THREE from 'three'

/**
 * Airport environment for the ground-level beats.
 *
 * The runway alone read as a strip of tarmac in an empty world. This adds
 * just enough built form to give the aeroplane a sense of scale and place:
 * a terminal with a lit window band, a control tower, a distant hangar, the
 * apron, light masts and a little ground traffic.
 *
 * Deliberately low-poly and mostly instanced. It is only mounted while the
 * camera is on the ground, so it never competes with the aircraft for
 * budget, and it is silhouetted against the dawn rather than detailed.
 */

const CONCRETE = '#6d7480'
const CONCRETE_DARK = '#4e545e'
const GLASS = '#1d2c40'
const STEEL = '#8b939e'
const ROOF = '#5a6069'

function LightMast({ count = 6 }) {
  const { geo, mat, mastRef, headRef, matrices, heads } = useMemo(() => {
    const m = new THREE.Matrix4()
    const mats = []
    const hs = []
    for (let i = 0; i < count; i++) {
      mats.push(m.clone().setPosition(-215 + i * 86, 7, -58))
      hs.push(m.clone().setPosition(-215 + i * 86, 14.4, -58))
    }
    return {
      geo: new THREE.CylinderGeometry(0.28, 0.42, 14, 6),
      mat: new THREE.MeshStandardMaterial({ color: STEEL, metalness: 0.5, roughness: 0.6 }),
      mastRef: React.createRef(),
      headRef: React.createRef(),
      matrices: mats,
      heads: hs
    }
  }, [count])

  React.useEffect(() => {
    const a = mastRef.current
    const b = headRef.current
    matrices.forEach((m, i) => a?.setMatrixAt(i, m))
    heads.forEach((m, i) => b?.setMatrixAt(i, m))
    if (a) a.instanceMatrix.needsUpdate = true
    if (b) b.instanceMatrix.needsUpdate = true
  }, [matrices, heads])

  React.useEffect(() => () => { geo.dispose(); mat.dispose() }, [geo, mat])

  return (
    <group>
      <instancedMesh ref={mastRef} args={[geo, mat, matrices.length]} />
      <instancedMesh ref={headRef} args={[undefined, undefined, heads.length]}>
        <boxGeometry args={[2.6, 0.5, 0.9]} />
        <meshStandardMaterial
          color="#ffe6b8"
          emissive="#ffca7a"
          emissiveIntensity={1.5}
          toneMapped={false}
        />
      </instancedMesh>
    </group>
  )
}

function GroundTraffic() {
  const items = useMemo(() => {
    const out = []
    // Baggage tractors with a train of carts, parked on the apron.
    for (let i = 0; i < 3; i++) {
      const x = -70 + i * 46
      out.push({ x, z: -46, rot: 0 })
    }
    return out
  }, [])

  const tractor = useMemo(() => new THREE.BoxGeometry(2.4, 1.5, 1.5), [])
  const cart = useMemo(() => new THREE.BoxGeometry(2.0, 1.2, 1.6), [])
  const tMat = useMemo(() => new THREE.MeshStandardMaterial({ color: '#c8ccd2', roughness: 0.6, metalness: 0.2 }), [])
  const cMat = useMemo(() => new THREE.MeshStandardMaterial({ color: '#3f6ea8', roughness: 0.7 }), [])
  const tRef = useRef()
  const cRef = useRef()

  React.useEffect(() => {
    const m = new THREE.Matrix4()
    const t = tRef.current
    const c = cRef.current
    let ci = 0
    items.forEach((it) => {
      m.makeRotationY(it.rot)
      m.setPosition(it.x, 0.9, it.z)
      t?.setMatrixAt(t?.count ? t.children.length || items.length : 0, m)
    })
    // Place tractors, then a short cart train behind each.
    items.forEach((it, i) => {
      m.identity().setPosition(it.x, 0.9, it.z)
      t?.setMatrixAt(i, m)
      for (let k = 0; k < 2; k++) {
        m.identity().setPosition(it.x + 3.4 + k * 2.6, 0.7, it.z)
        c?.setMatrixAt(ci++, m)
      }
    })
    if (t) { t.count = items.length; t.instanceMatrix.needsUpdate = true }
    if (c) { c.count = ci; c.instanceMatrix.needsUpdate = true }
  }, [items])

  React.useEffect(() => () => { tractor.dispose(); cart.dispose(); tMat.dispose(); cMat.dispose() }, [tractor, cart, tMat, cMat])

  return (
    <group>
      <instancedMesh ref={tRef} args={[tractor, tMat, Math.max(1, items.length)]} />
      <instancedMesh ref={cRef} args={[cart, cMat, Math.max(1, items.length * 2)]} />
    </group>
  )
}

export default function AirportEnvironment() {
  const disposables = useRef([])

  React.useEffect(() => () => {
    disposables.current.forEach((d) => d.dispose?.())
  }, [])

  return (
    <group>
      {/* Apron either side of the runway. */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.04, -46]}>
        <planeGeometry args={[620, 88]} />
        <meshStandardMaterial color={CONCRETE_DARK} roughness={0.95} />
      </mesh>
      {/* Stand markings */}
      {Array.from({ length: 7 }).map((_, i) => (
        <mesh key={i} rotation={[-Math.PI / 2, 0, 0]} position={[-180 + i * 60, -0.02, -42]}>
          <planeGeometry args={[0.5, 20]} />
          <meshStandardMaterial color="#d8dbe0" roughness={0.9} />
        </mesh>
      ))}

      {/* Terminal: main block, glazed band, curved roof. */}
      <group position={[0, 0, -132]}>
        <mesh position={[0, 6, 0]}>
          <boxGeometry args={[250, 12, 24]} />
          <meshStandardMaterial color={CONCRETE} roughness={0.85} />
        </mesh>
        {/* Glazed concourse band, lit for the dawn departure. */}
        <mesh position={[0, 9.2, 0.4]}>
          <boxGeometry args={[250, 5.5, 24.6]} />
          <meshStandardMaterial
            color={GLASS}
            roughness={0.15}
            metalness={0.4}
            emissive="#ffb865"
            emissiveIntensity={0.55}
          />
        </mesh>
        {/* Barrel roof. The cylinder's native axis is Y; rotating about Z
            lays the span along the terminal (X). Rotating about X instead
            sent the whole tube toward the camera. */}
        <mesh position={[0, 13, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[9, 9, 250, 14, 1, false, 0, Math.PI]} />
          <meshStandardMaterial color={ROOF} roughness={0.7} metalness={0.3} side={THREE.DoubleSide} />
        </mesh>
        {/* Jet bridges reaching toward the stands. */}
        {[-84, -28, 28, 84].map((x) => (
          <mesh key={x} position={[x, 5, 26]}>
            <boxGeometry args={[3.4, 3.4, 20]} />
            <meshStandardMaterial color={STEEL} roughness={0.6} metalness={0.4} />
          </mesh>
        ))}
      </group>

      {/* Control tower. */}
      <group position={[-268, 0, -150]}>
        <mesh position={[0, 17, 0]}>
          <cylinderGeometry args={[2.2, 3.8, 34, 10]} />
          <meshStandardMaterial color={CONCRETE} roughness={0.85} />
        </mesh>
        <mesh position={[0, 36, 0]}>
          <cylinderGeometry args={[5.8, 4.8, 7.4, 12]} />
          <meshStandardMaterial
            color={GLASS}
            roughness={0.1}
            metalness={0.5}
            emissive="#ffc478"
            emissiveIntensity={0.8}
          />
        </mesh>
        <mesh position={[0, 40.6, 0]}>
          <cylinderGeometry args={[6.2, 6.2, 1.1, 12]} />
          <meshStandardMaterial color={ROOF} roughness={0.7} metalness={0.4} />
        </mesh>
      </group>

      {/* Distant hangar. */}
      <group position={[290, 0, -210]}>
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[88, 20, 54]} />
          <meshStandardMaterial color={CONCRETE_DARK} roughness={0.9} />
        </mesh>
        <mesh position={[0, 0, 27.4]}>
          <boxGeometry args={[64, 15, 1]} />
          <meshStandardMaterial color="#2a3038" roughness={0.8} />
        </mesh>
      </group>

      <LightMast />
      <GroundTraffic />
    </group>
  )
}
