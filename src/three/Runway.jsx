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
  const postRef = React.useRef(null)
  const lampRef = React.useRef(null)

  React.useEffect(() => () => tex.dispose(), [tex])

  // Edge lights and gantry posts are instanced. As individual meshes they
  // were ~124 separate draw calls in the hero alone — the busiest frame in
  // the whole experience, for objects that never move.
  const { postGeo, lampGeo, postMesh, lampMesh, setMatrices } = useMemo(() => {
    const rows = 26
    const m = new THREE.Matrix4()
    const posts = []
    const lamps = []
    for (let i = 0; i < rows; i++) {
      const z = -length / 2 + (i / (rows - 1)) * length
      for (const sx of [-1, 1]) {
        const x = sx * (width / 2 + 2.5)
        posts.push(m.clone().setPosition(x, 0.3, z))
        lamps.push(m.clone().setPosition(x, 0.66, z))
      }
    }
    for (const sx of [-1, 1]) {
      for (let i = 0; i < 9; i++) {
        posts.push(m.clone().setPosition(sx * width * 2.2, 5, -length / 2 + 30 + i * 48))
      }
    }
    return {
      postGeo: new THREE.CylinderGeometry(0.1, 0.13, 0.6, 6),
      lampGeo: new THREE.SphereGeometry(0.14, 8, 8),
      postMesh: new THREE.MeshStandardMaterial({ color: '#5a6068', metalness: 0.8, roughness: 0.4 }),
      lampMesh: new THREE.MeshStandardMaterial({
        color: '#ffd9a0', emissive: '#ffb85c', emissiveIntensity: 1.8, toneMapped: false
      }),
      setMatrices: { posts, lamps }
    }
  }, [length, width])

  React.useEffect(() => {
    const post = postRef.current
    const lamp = lampRef.current
    if (post) {
      setMatrices.posts.forEach((m, i) => post.setMatrixAt(i, m))
      post.instanceMatrix.needsUpdate = true
    }
    if (lamp) {
      setMatrices.lamps.forEach((m, i) => lamp.setMatrixAt(i, m))
      lamp.instanceMatrix.needsUpdate = true
    }
  }, [setMatrices])

  React.useEffect(() => {
    return () => {
      postGeo.dispose(); lampGeo.dispose(); postMesh.dispose(); lampMesh.dispose()
    }
  }, [postGeo, lampGeo, postMesh, lampMesh])

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

      <instancedMesh
        ref={postRef}
        args={[postGeo, postMesh, setMatrices.posts.length]}
      />
      <instancedMesh
        ref={lampRef}
        args={[lampGeo, lampMesh, setMatrices.lamps.length]}
      />

      {[-1, 1].map((side) => (
        <mesh key={side} position={[side * (width * 2.2), 10.4, 0]}>
          <boxGeometry args={[1.6, 0.8, length * 0.9]} />
          <meshStandardMaterial color="#2e3440" metalness={0.4} roughness={0.6} />
        </mesh>
      ))}
    </group>
  )
}
