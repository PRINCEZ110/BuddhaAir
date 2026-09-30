import React, { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

const skyVertex = /* glsl */ `
  varying vec3 vWorldPos;
  void main() {
    vWorldPos = (modelMatrix * vec4(position, 1.0)).xyz;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`

const skyFragment = /* glsl */ `
  uniform vec3 uZenith;
  uniform vec3 uHorizon;
  uniform vec3 uSunDir;
  uniform vec3 uSunColor;
  varying vec3 vWorldPos;

  void main() {
    vec3 dir = normalize(vWorldPos);
    float h = clamp(dir.y, 0.0, 1.0);
    float grad = pow(h, 0.55);
    vec3 col = mix(uHorizon, uZenith, grad);

    float sunAmt = pow(max(dot(dir, normalize(uSunDir)), 0.0), 220.0);
    float glow = pow(max(dot(dir, normalize(uSunDir)), 0.0), 8.0);
    col += uSunColor * sunAmt * 1.6;
    col += uSunColor * glow * 0.22;

    // Reached full darkness by only -8.6 degrees below the horizon, so any
    // camera pitched down a handful of degrees at a beat where no terrain is
    // mounted (the fleet showcase) dropped straight into a void. Widened so
    // looking down reads as atmospheric haze; the ground beats still have
    // terrain sitting in front of it.
    float below = smoothstep(0.0, -0.55, dir.y);
    // Desaturate toward a neutral dark ground tone; reusing the warm
    // horizon colour here produced a muddy olive cast.
    float lum = dot(uHorizon, vec3(0.299, 0.587, 0.114));
    col = mix(col, vec3(lum * 0.30, lum * 0.34, lum * 0.42), below);

    gl_FragColor = vec4(col, 1.0);

    // A custom ShaderMaterial gets no tone mapping or colour-space transfer
    // from three automatically — those arrive through chunks that must be
    // included by hand. Without them the dome was written straight to the
    // framebuffer as raw linear, so the default render path showed a darker
    // sky than the post-processed one, where OutputPass applies both to every
    // pixel including this one. Including them keeps the two paths in
    // agreement; three compiles them out when rendering into an intermediate
    // target, so nothing is applied twice.
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
  }
`

// Shared with EnvironmentMap so reflections sample the same palette the
// visible sky is drawn from — otherwise the airframe reflects a sky that
// is not on screen.
export const SKY_STATES = [
  { t: 0.0, zenith: '#5a8ac4', horizon: '#e8c9a0', sun: '#ffb36b' },
  { t: 0.11, zenith: '#4a8ad4', horizon: '#f0d8b0', sun: '#ffd9a8' },
  { t: 0.23, zenith: '#3a7ad0', horizon: '#d8e4f0', sun: '#e8f0ff' },
  { t: 0.32, zenith: '#4a7ab8', horizon: '#e8d0a8', sun: '#ffc98a' },
  { t: 0.44, zenith: '#4a88cc', horizon: '#e0d8c0', sun: '#fff2dc' },
  { t: 0.56, zenith: '#3a6aa8', horizon: '#d8c0a0', sun: '#ffd9a0' },
  { t: 0.7, zenith: '#16263f', horizon: '#4a3a4a', sun: '#e8b8a0' },
  { t: 1.0, zenith: '#0a1424', horizon: '#2a2030', sun: '#d4a080' }
]

export default function SkyDome({ progressRef, reducedMotion }) {
  const matRef = useRef()

  const uniforms = useMemo(() => ({
    uZenith: { value: new THREE.Color('#5a8ac4') },
    uHorizon: { value: new THREE.Color('#e8c9a0') },
    uSunDir: { value: new THREE.Vector3(0.4, 0.35, -0.6) },
    uSunColor: { value: new THREE.Color('#ffb36b') }
  }), [])

  useFrame(() => {
    const t = reducedMotion ? 0 : progressRef.current
    let i = 0
    while (i < SKY_STATES.length - 1 && SKY_STATES[i + 1].t < t) i++
    const a = SKY_STATES[i]
    const b = SKY_STATES[Math.min(i + 1, SKY_STATES.length - 1)]
    const span = b.t - a.t
    const local = span > 0 ? THREE.MathUtils.clamp((t - a.t) / span, 0, 1) : 0
    const e = local * local * (3 - 2 * local)

    uniforms.uZenith.value.set(a.zenith).lerp(new THREE.Color(b.zenith), e)
    uniforms.uHorizon.value.set(a.horizon).lerp(new THREE.Color(b.horizon), e)
    uniforms.uSunColor.value.set(a.sun).lerp(new THREE.Color(b.sun), e)
  })

  return (
    <mesh scale={[1, 1, 1]}>
      <sphereGeometry args={[3000, 32, 20]} />
      <shaderMaterial
        ref={matRef}
        vertexShader={skyVertex}
        fragmentShader={skyFragment}
        uniforms={uniforms}
        side={THREE.BackSide}
        depthWrite={false}
        fog={false}
      />
    </mesh>
  )
}
