import React, { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

const cloudVertex = /* glsl */ `
  varying vec2 vUv;
  varying float vElev;
  void main() {
    vUv = uv;
    vElev = position.y;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`

const cloudFragment = /* glsl */ `
  uniform float uTime;
  uniform float uOpacity;
  uniform vec3 uColor;
  uniform vec3 uSunDir;
  varying vec2 vUv;

  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
  }

  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    float a = hash(i);
    float b = hash(i + vec2(1.0, 0.0));
    float c = hash(i + vec2(0.0, 1.0));
    float d = hash(i + vec2(1.0, 1.0));
    return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
  }

  float fbm(vec2 p) {
    float v = 0.0;
    float a = 0.5;
    for (int i = 0; i < 5; i++) {
      v += a * noise(p);
      p *= 2.03;
      a *= 0.5;
    }
    return v;
  }

  void main() {
    vec2 uv = vUv * 3.0;
    float n = fbm(uv + vec2(uTime * 0.008, uTime * 0.003));
    n += fbm(uv * 2.1 - vec2(uTime * 0.005, 0.0)) * 0.35;
    n /= 1.35;

    float edge = smoothstep(0.0, 0.22, vUv.x) * smoothstep(1.0, 0.78, vUv.x)
               * smoothstep(0.0, 0.25, vUv.y) * smoothstep(1.0, 0.75, vUv.y);

    float density = smoothstep(0.38, 0.75, n) * edge;
    if (density < 0.01) discard;

    float lit = clamp(dot(vec3(0.0, 1.0, 0.0), normalize(uSunDir)) * 0.5 + 0.62, 0.0, 1.0);
    vec3 col = uColor * lit;
    col += vec3(1.0, 0.85, 0.65) * pow(lit, 3.0) * 0.25;

    gl_FragColor = vec4(col, density * uOpacity);
  }
`

function CloudLayer({ position, scale, opacity, speed, color, sunDir }) {
  const matRef = useRef()

  const uniforms = useMemo(() => ({
    uTime: { value: 0 },
    uOpacity: { value: opacity },
    uColor: { value: new THREE.Color(color) },
    uSunDir: { value: new THREE.Vector3(...sunDir) }
  }), [])

  useFrame((state) => {
    if (matRef.current) {
      matRef.current.uniforms.uTime.value = state.clock.elapsedTime * speed
    }
  })

  return (
    <mesh position={position} scale={scale}>
      <planeGeometry args={[1, 1, 1, 1]} />
      <shaderMaterial
        ref={matRef}
        vertexShader={cloudVertex}
        fragmentShader={cloudFragment}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        side={THREE.DoubleSide}
      />
    </mesh>
  )
}

export default function Clouds({ quality = 'high', mode = 'layers' }) {
  const layers = useMemo(() => {
    if (mode === 'sea') {
      return Array.from({ length: quality === 'low' ? 4 : 7 }).map((_, i) => ({
        key: i,
        position: [(i % 2 ? -1 : 1) * (140 + i * 55), -30 - (i % 3) * 22, -180 - i * 90],
        scale: [420 + i * 60, 130 + i * 18, 1],
        opacity: 0.5 + (i % 3) * 0.14,
        speed: 0.5 + (i % 4) * 0.22,
        color: i % 2 ? '#f4f8fd' : '#e6eef8'
      }))
    }
    return Array.from({ length: quality === 'low' ? 3 : 5 }).map((_, i) => ({
      key: i,
      position: [(i % 2 ? -1 : 1) * (180 + i * 70), 60 + i * 42, -260 - i * 110],
      scale: [520 + i * 70, 150 + i * 20, 1],
      opacity: 0.42 + (i % 3) * 0.13,
      speed: 0.4 + (i % 4) * 0.2,
      color: i % 2 ? '#f6fafe' : '#e9f1fa'
    }))
  }, [quality, mode])

  const sunDir = [0.5, 0.6, 0.4]

  return (
    <group>
      {layers.map((l) => (
        <CloudLayer
          key={l.key}
          position={l.position}
          scale={l.scale}
          opacity={l.opacity}
          speed={l.speed}
          color={l.color}
          sunDir={sunDir}
        />
      ))}
    </group>
  )
}
