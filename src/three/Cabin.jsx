import React, { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

/**
 * Cabin interior for the mountain flight beat.
 *
 * The camera sits at a real eye point looking out of a real window, so the
 * shot reads as "inside the aircraft" rather than "an external camera
 * pointed at mountains".
 *
 * Scale note: the world is 1 unit = 1 metre and the ATR fuselage is ~1.4 m
 * in radius, so the interior is built at human scale — a 0.62 x 0.46 m
 * window with the eye ~0.9 m back. The previous version was authored at
 * ~300 x 230 units, which at a 62 deg FOV filled the entire viewport with
 * unlit cabin wall and rendered the beat as a black rectangle.
 *
 * The group tracks the camera so the interior stays locked to the eye
 * wherever the timeline takes it.
 */

const WALL = '#39414b'
const FRAME = '#2a313a'
const SEAT = '#39434f'
const TRIM = '#454e59'

function WindowFrame() {
  const geo = React.useMemo(() => {
    // Rounded-rectangle aperture: a solid panel with a hole, so the wall
    // has real thickness at the reveal instead of reading as a cut-out.
    const w = 0.92
    const h = 0.7
    const r = 0.14
    const shape = new THREE.Shape()
    const round = (s, ww, hh, rr) => {
      s.moveTo(-ww / 2 + rr, -hh / 2)
      s.lineTo(ww / 2 - rr, -hh / 2)
      s.quadraticCurveTo(ww / 2, -hh / 2, ww / 2, -hh / 2 + rr)
      s.lineTo(ww / 2, hh / 2 - rr)
      s.quadraticCurveTo(ww / 2, hh / 2, ww / 2 - rr, hh / 2)
      s.lineTo(-ww / 2 + rr, hh / 2)
      s.quadraticCurveTo(-ww / 2, hh / 2, -ww / 2, hh / 2 - rr)
      s.lineTo(-ww / 2, -hh / 2 + rr)
      s.quadraticCurveTo(-ww / 2, -hh / 2, -ww / 2 + rr, -hh / 2)
    }
    round(shape, w, h, r)

    const hole = new THREE.Path()
    round(hole, w - 0.13, h - 0.13, r * 0.8)
    shape.holes.push(hole)
    return new THREE.ShapeGeometry(shape, 10)
  }, [])

  React.useEffect(() => () => geo.dispose(), [geo])

  return (
    <mesh geometry={geo}>
      <meshStandardMaterial
        color={FRAME}
        roughness={0.82}
        metalness={0.05}
        emissive="#141a22"
        emissiveIntensity={0.9}
        side={THREE.DoubleSide}
      />
    </mesh>
  )
}

export default function Cabin({ progressRef, reducedMotion }) {
  const group = useRef()

  useFrame(({ camera }) => {
    if (group.current) group.current.position.copy(camera.position)
  })

  React.useEffect(() => {
    const g = group.current
    return () => g?.traverse((o) => { if (o.isMesh) o.geometry?.dispose?.() })
  }, [])

  return (
    // Local space origin = the eye point. Looking -Z puts the window in the
    // right third of frame, the way a window seat actually frames a view.
    <group ref={group}>
      {/* Right sidewall, angled slightly inward toward the eye. Sized and
          placed so the aperture fills roughly the right third of frame. */}
      <group position={[0.66, -0.03, -1.0]} rotation={[0, 0.5, 0]}>
        <WindowFrame />
        <mesh position={[0, 0, -0.04]}>
          <planeGeometry args={[0.82, 0.6]} />
          <meshPhysicalMaterial
            color="#cfe2f4"
            transparent
            opacity={0.07}
            roughness={0.03}
            metalness={0}
            side={THREE.DoubleSide}
          />
        </mesh>
      </group>

      {/* Wall panels either side of the window, giving the aperture context. */}
      <mesh position={[1.05, 0, 0.2]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[2.6, 1.8]} />
        <meshStandardMaterial
          color={WALL}
          roughness={0.9}
          emissive="#1b222b"
          emissiveIntensity={1.1}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Overhead bin / trim catching the sunrise. */}
      <mesh position={[0.16, 0.78, -0.5]} rotation={[0.22, 0, 0]}>
        <boxGeometry args={[1.5, 0.16, 2.2]} />
        <meshStandardMaterial color={TRIM} roughness={0.75} emissive="#1a212a" emissiveIntensity={0.6} />
      </mesh>

      {/* Seatback in the near-left foreground; establishes "seated". */}
      <mesh position={[-0.78, -0.12, -0.62]} rotation={[0, -0.34, 0]}>
        <boxGeometry args={[0.62, 0.78, 0.1]} />
        <meshStandardMaterial color={SEAT} roughness={0.95} emissive="#151b23" emissiveIntensity={0.6} />
      </mesh>

      {/* Floor, low and dark. */}
      <mesh position={[0.1, -0.72, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[2, 2.6]} />
        <meshStandardMaterial color="#232a33" roughness={0.95} side={THREE.DoubleSide} />
      </mesh>
    </group>
  )
}
