import React, { useMemo } from 'react'
import * as THREE from 'three'

function createRunwayTexture() {
  const W = 512
  const H = 2048
  const canvas = document.createElement('canvas')
  canvas.width = W
  canvas.height = H
  const ctx = canvas.getContext('2d')

  ctx.fillStyle = '#3d4148'
  ctx.fillRect(0, 0, W, H)

  for (let i = 0; i < 9000; i++) {
    const x = Math.random() * W
    const y = Math.random() * H
    const v = 55 + Math.random() * 25
    ctx.fillStyle = `rgba(${v},${v},${v + 6},${0.25 + Math.random() * 0.3})`
    ctx.fillRect(x, y, 2, 2)
  }

  ctx.fillStyle = '#e8e9eb'
  ctx.fillRect(W * 0.06, 0, 5, H)
  ctx.fillRect(W * 0.94 - 5, 0, 5, H)

  ctx.fillStyle = '#f2f3f5'
  const dashH = 46
  const gap = 60
  for (let y = 40; y < H; y += dashH + gap) {
    ctx.fillRect(W / 2 - 5, y, 10, dashH)
  }

  ctx.font = `700 ${W * 0.16}px Inter, Arial, sans-serif`
  ctx.textAlign = 'center'
  ctx.save()
  ctx.translate(W / 2, H * 0.18)
  ctx.fillText('27', 0, 0)
  ctx.restore()
  ctx.save()
  ctx.translate(W / 2, H * 0.86)
  ctx.rotate(Math.PI)
  ctx.fillText('09', 0, 0)
  ctx.restore()

  const tex = new THREE.CanvasTexture(canvas)
  tex.wrapS = THREE.RepeatWrapping
  tex.wrapT = THREE.RepeatWrapping
  tex.repeat.set(1, 6)
  tex.anisotropy = 8
  tex.colorSpace = THREE.SRGBColorSpace
  return tex
}

export default function Runway({ length = 420, width = 30 }) {
  const tex = useMemo(() => createRunwayTexture(), [])

  const lights = useMemo(() => {
    const arr = []
    const rows = 26
    for (let i = 0; i < rows; i++) {
      const z = -length / 2 + (i / (rows - 1)) * length
      arr.push({ pos: [width / 2 + 2.5, 0.3, z], key: `l${i}` })
      arr.push({ pos: [-width / 2 - 2.5, 0.3, z], key: `r${i}` })
    }
    return arr
  }, [length, width])

  return (
    // Rotated so the runway centreline runs along X, matching the
    // aircraft's nose direction (+X) built in Aircraft.jsx.
    <group rotation={[0, Math.PI / 2, 0]}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[width, length]} />
        <meshStandardMaterial map={tex} metalness={0.05} roughness={0.92} />
      </mesh>

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.05, 0]}>
        <planeGeometry args={[width * 6, length * 1.4]} />
        <meshStandardMaterial color="#4a5d43" metalness={0} roughness={1} />
      </mesh>

      {lights.map((l) => (
        <group key={l.key} position={l.pos}>
          <mesh>
            <cylinderGeometry args={[0.09, 0.12, 0.6, 6]} />
            <meshStandardMaterial color="#5a6068" metalness={0.8} roughness={0.4} />
          </mesh>
          <mesh position={[0, 0.36, 0]}>
            <sphereGeometry args={[0.14, 8, 8]} />
            <meshStandardMaterial
              color="#ffd9a0"
              emissive="#ffb85c"
              emissiveIntensity={1.6}
              toneMapped={false}
            />
          </mesh>
        </group>
      ))}

      {[-1, 1].map((side) => (
        <group key={side} position={[side * (width * 2.2), 0, 0]}>
          {Array.from({ length: 9 }).map((_, i) => (
            <mesh key={i} position={[0, 5, -length / 2 + 30 + i * 48]}>
              <boxGeometry args={[1.2, 10, 1.2]} />
              <meshStandardMaterial color="#7d8590" metalness={0.6} roughness={0.5} />
            </mesh>
          ))}
          <mesh position={[0, 10.4, 0]}>
            <boxGeometry args={[1.6, 0.8, length * 0.9]} />
            <meshStandardMaterial color="#2e3440" metalness={0.4} roughness={0.6} />
          </mesh>
        </group>
      ))}
    </group>
  )
}
