import React, { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

const RED = '#d42b2b'
const WHITE = '#f4f5f7'

function buildFuselageGeometry() {
  const profile = [
    [0.02, 13.7], [0.35, 13.3], [0.7, 12.4], [1.0, 11.0], [1.22, 9.0],
    [1.33, 6.5], [1.37, 3.5], [1.37, 0.0], [1.35, -3.0], [1.28, -6.0],
    [1.12, -8.8], [0.88, -11.0], [0.55, -12.6], [0.2, -13.5], [0.02, -13.9]
  ].map(([r, y]) => new THREE.Vector2(r, y))

  const geo = new THREE.LatheGeometry(profile, 40)
  geo.rotateZ(-Math.PI / 2)
  geo.scale(1, 1, 1.04)
  return geo
}

function createLiveryTexture() {
  const W = 2048
  const H = 1024
  const canvas = document.createElement('canvas')
  canvas.width = W
  canvas.height = H
  const ctx = canvas.getContext('2d')

  ctx.fillStyle = WHITE
  ctx.fillRect(0, 0, W, H)

  const vToY = (v) => v * H
  const uToX = (u) => u * W

  const tailStart = 0.86
  const grad = ctx.createLinearGradient(0, vToY(tailStart), 0, H)
  grad.addColorStop(0, 'rgba(212,43,43,0)')
  grad.addColorStop(0.25, RED)
  grad.addColorStop(1, RED)
  ctx.fillStyle = grad
  ctx.fillRect(0, vToY(tailStart), W, H - vToY(tailStart))

  ctx.fillStyle = RED
  ctx.fillRect(0, vToY(0.62), W, vToY(0.045))
  ctx.fillStyle = 'rgba(212,43,43,0.85)'
  ctx.fillRect(0, vToY(0.665), W, vToY(0.012))

  const winV = 0.30
  const winH = 0.052
  ctx.fillStyle = '#101c2e'
  const winW = 0.016
  const gap = 0.011
  for (let u = 0.055; u < 0.94; u += winW + gap) {
    const x = uToX(u)
    const y = vToY(winV)
    const w = uToX(winW)
    const h = vToY(winH)
    ctx.beginPath()
    ctx.roundRect(x, y, w, h, h * 0.45)
    ctx.fill()
  }

  ctx.strokeStyle = 'rgba(120,130,145,0.5)'
  ctx.lineWidth = 2
  const doorV = [0.13, 0.55]
  doorV.forEach((dv) => {
    ;[0.06, 0.5].forEach((du) => {
      ctx.strokeRect(uToX(du), vToY(dv), uToX(0.035), vToY(0.11))
    })
  })

  ctx.fillStyle = RED
  ctx.font = `700 ${H * 0.052}px Inter, Arial, sans-serif`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  const drawBrand = (u) => {
    const x = uToX(u)
    if (x > W * 0.9 || x < W * 0.1) {
      ctx.fillText('BUDDHA AIR', x - W, vToY(0.42))
      ctx.fillText('BUDDHA AIR', x + W, vToY(0.42))
    }
    ctx.fillText('BUDDHA AIR', x, vToY(0.42))
  }
  drawBrand(0.5)

  ctx.fillStyle = 'rgba(255,255,255,0.92)'
  ctx.font = `600 ${H * 0.02}px Inter, Arial, sans-serif`
  ctx.fillText('9N-A', uToX(0.93), vToY(0.42))

  const tex = new THREE.CanvasTexture(canvas)
  tex.colorSpace = THREE.SRGBColorSpace
  tex.anisotropy = 4
  return tex
}

function buildWingGeometry(span, rootChord, tipChord, rootThick, tipThick, sweep, dihedral, stations = 10) {
  const positions = []
  const indices = []
  const section = [
    [0, 0.5], [0.22, 0.44], [0.55, 0.4], [0.92, 0.16], [1, 0.05],
    [1, -0.05], [0.92, -0.16], [0.55, -0.4], [0.22, -0.44], [0, -0.5]
  ]

  for (let i = 0; i <= stations; i++) {
    const t = i / stations
    const chord = THREE.MathUtils.lerp(rootChord, tipChord, t)
    const thick = THREE.MathUtils.lerp(rootThick, tipThick, t)
    const x = -sweep * t * span
    const z = t * span
    const y = dihedral * t * span
    for (const [cx, cy] of section) {
      positions.push(x + cx * chord - chord * 0.35, y + cy * thick, z)
    }
  }

  const n = section.length
  for (let i = 0; i < stations; i++) {
    for (let j = 0; j < n; j++) {
      const a = i * n + j
      const b = i * n + ((j + 1) % n)
      const c = (i + 1) * n + j
      const d = (i + 1) * n + ((j + 1) % n)
      indices.push(a, c, b, b, c, d)
    }
  }

  const tipStart = stations * n
  for (let j = 1; j < n - 1; j++) {
    indices.push(tipStart, tipStart + j, tipStart + j + 1)
  }

  const geo = new THREE.BufferGeometry()
  geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
  geo.setIndex(indices)
  geo.computeVertexNormals()
  return geo
}

function buildTailFinGeometry() {
  const shape = new THREE.Shape()
  shape.moveTo(0, 0)
  shape.lineTo(0.4, 0.1)
  shape.lineTo(1.1, 4.6)
  shape.lineTo(2.6, 5.4)
  shape.lineTo(2.75, 5.1)
  shape.lineTo(1.9, 0.1)
  shape.lineTo(1.6, 0)
  shape.closePath()
  const geo = new THREE.ExtrudeGeometry(shape, { depth: 0.22, bevelEnabled: true, bevelThickness: 0.04, bevelSize: 0.04, bevelSegments: 2 })
  geo.translate(0, 0, -0.11)
  return geo
}

function Propeller({ position, mirror = false, propsRef, index }) {
  const blades = useMemo(() => {
    const arr = []
    for (let i = 0; i < 6; i++) {
      arr.push((i / 6) * Math.PI * 2)
    }
    return arr
  }, [])

  return (
    <group position={position} rotation={[0, 0, mirror ? Math.PI : 0]}>
      <mesh>
        <cylinderGeometry args={[0.32, 0.38, 0.7, 16]} />
        <meshStandardMaterial color="#2a2f38" metalness={0.85} roughness={0.3} />
      </mesh>
      <group ref={(el) => { if (el && propsRef) propsRef.current[index] = el }}>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <sphereGeometry args={[0.22, 12, 12]} />
          <meshStandardMaterial color="#1a1e26" metalness={0.9} roughness={0.25} />
        </mesh>
        {blades.map((angle, i) => (
          <group key={i} rotation={[0, 0, angle]}>
            <mesh position={[0, 1.05, 0]} rotation={[0.35, 0, 0.12]}>
              <boxGeometry args={[0.16, 1.9, 0.05]} />
              <meshStandardMaterial color="#15181f" metalness={0.7} roughness={0.35} />
            </mesh>
          </group>
        ))}
      </group>
    </group>
  )
}

export default function Aircraft({ detail = 'high', propSpeed = 0, ...props }) {
  const propsRef = useRef([])
  const gearRef = useRef()

  const livery = useMemo(() => createLiveryTexture(), [])
  const fuselageGeo = useMemo(() => buildFuselageGeometry(), [])
  const wingGeo = useMemo(() => buildWingGeometry(13.4, 3.4, 1.7, 0.42, 0.2, 1.6, 0.55), [])
  const tailWingGeo = useMemo(() => buildWingGeometry(4.6, 1.9, 1.1, 0.2, 0.12, 0.5, 0.12, 6), [])
  const finGeo = useMemo(() => buildTailFinGeometry(), [])

  const paintMat = useMemo(() => new THREE.MeshStandardMaterial({
    map: livery, metalness: 0.18, roughness: 0.32
  }), [livery])

  const wingMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#eef0f3', metalness: 0.2, roughness: 0.38
  }), [])

  const metalMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#c8ccd4', metalness: 0.9, roughness: 0.28
  }), [])

  const darkMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#141a26', metalness: 0.85, roughness: 0.18
  }), [])

  const redMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: RED, metalness: 0.25, roughness: 0.35
  }), [])

  const tireMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#1c1f24', metalness: 0.1, roughness: 0.9
  }), [])

  useFrame((_, delta) => {
    if (propSpeed > 0 && propsRef.current) {
      propsRef.current.forEach((p) => {
        if (p) p.rotation.y += delta * propSpeed
      })
    }
  })

  const seg = detail === 'low' ? 12 : 40

  return (
    <group {...props}>
      <mesh geometry={fuselageGeo} material={paintMat} castShadow />

      <mesh geometry={wingGeo} material={wingMat} position={[0.4, 1.15, 0.9]} castShadow />
      <mesh geometry={wingGeo} material={wingMat} position={[0.4, 1.15, -0.9]} rotation={[0, Math.PI, 0]} castShadow />

      <mesh geometry={tailWingGeo} material={wingMat} position={[-11.6, 0.4, 0.5]} />
      <mesh geometry={tailWingGeo} material={wingMat} position={[-11.6, 0.4, -0.5]} rotation={[0, Math.PI, 0]} />

      <group position={[-12.2, 0.6, 0]}>
        <mesh geometry={finGeo} material={redMat} castShadow />
        <mesh position={[1.5, 3.4, 0.13]}>
          <circleGeometry args={[0.55, 24]} />
          <meshStandardMaterial color="#ffffff" metalness={0.3} roughness={0.4} />
        </mesh>
        <mesh position={[1.5, 3.4, 0.14]}>
          <ringGeometry args={[0.34, 0.5, 24]} />
          <meshStandardMaterial color={RED} metalness={0.3} roughness={0.4} />
        </mesh>
      </group>

      {[-1, 1].map((side) => (
        <group key={side} position={[1.6, 1.35, side * 4.6]}>
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.62, 0.55, 2.6, 20]} />
            <meshStandardMaterial color="#dfe3e8" metalness={0.75} roughness={0.3} />
          </mesh>
          <mesh position={[1.35, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.58, 0.58, 0.3, 20]} />
            <meshStandardMaterial color="#3a4048" metalness={0.85} roughness={0.3} />
          </mesh>
          <Propeller position={[1.6, 0, 0]} mirror={side < 0} propsRef={propsRef} index={side < 0 ? 0 : 1} />
        </group>
      ))}

      {detail !== 'low' && (
        <group ref={gearRef}>
          <group position={[4.6, -1.5, 0]}>
            <mesh position={[0, -0.5, 0]}>
              <cylinderGeometry args={[0.09, 0.09, 1.1, 8]} />
              <meshStandardMaterial color="#9aa2ac" metalness={0.9} roughness={0.3} />
            </mesh>
            <mesh position={[0, -1.15, 0]} rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.42, 0.42, 0.3, 16]} />
              <meshStandardMaterial color="#1c1f24" metalness={0.1} roughness={0.9} />
            </mesh>
          </group>
          {[-1, 1].map((side) => (
            <group key={side} position={[-1.2, -1.5, side * 1.9]}>
              <mesh position={[0, -0.55, 0]}>
                <cylinderGeometry args={[0.1, 0.1, 1.2, 8]} />
                <meshStandardMaterial color="#9aa2ac" metalness={0.9} roughness={0.3} />
              </mesh>
              {[-0.18, 0.18].map((off) => (
                <mesh key={off} position={[off, -1.3, 0]} rotation={[0, 0, Math.PI / 2]}>
                  <cylinderGeometry args={[0.46, 0.46, 0.24, 16]} />
                  <meshStandardMaterial color="#1c1f24" metalness={0.1} roughness={0.9} />
                </mesh>
              ))}
            </group>
          ))}
        </group>
      )}

      <mesh position={[11.9, 0.35, 0]} rotation={[0, 0, -0.1]}>
        <boxGeometry args={[1.6, 0.5, 1.7]} />
        <meshStandardMaterial color="#0d1626" metalness={0.95} roughness={0.08} />
      </mesh>
    </group>
  )
}
