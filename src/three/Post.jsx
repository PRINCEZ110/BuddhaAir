import { useEffect, useMemo, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js'
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js'
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js'
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js'
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js'
import { FXAAShader } from 'three/addons/shaders/FXAAShader.js'

/**
 * Grade: vignette plus film grain, applied AFTER OutputPass so both work in
 * display space. Doing this in linear space would let the tone mapper crush
 * the grain to nothing and tint the vignette.
 *
 * `vignette` is a falloff coefficient, not a strength: 0 is off, 0.5 darkens
 * the corners by a quarter.
 */
const GradeShader = {
  uniforms: {
    tDiffuse: { value: null },
    vignette: { value: 0.0 },
    grain: { value: 0.0 },
    time: { value: 0.0 }
  },
  vertexShader: /* glsl */ `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: /* glsl */ `
    uniform sampler2D tDiffuse;
    uniform float vignette;
    uniform float grain;
    uniform float time;
    varying vec2 vUv;

    float hash(vec2 p) {
      return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
    }

    void main() {
      vec4 c = texture2D(tDiffuse, vUv);

      if (vignette > 0.0) {
        vec2 d = vUv - 0.5;
        c.rgb *= clamp(1.0 - dot(d, d) * vignette, 0.0, 1.0);
      }

      if (grain > 0.0) {
        float n = hash(vUv * 1024.0 + fract(time) * 91.7) - 0.5;
        c.rgb += n * grain;
      }

      gl_FragColor = c;
    }
  `
}

/**
 * Tier-gated post chain. `tierConfig.post` already describes what each tier
 * is allowed, so nothing here decides on its own.
 *
 * The low tier returns null and lets the default frameloop render: adding a
 * composer there would buy two extra full-screen passes for nothing.
 */
export default function Post({ tierConfig, quality }) {
  const gl = useThree((s) => s.gl)
  const scene = useThree((s) => s.scene)
  const camera = useThree((s) => s.camera)
  const size = useThree((s) => s.size)
  const dpr = useThree((s) => s.viewport.dpr)
  const gradeRef = useRef(null)
  const fxaaRef = useRef(null)

  const post = (tierConfig && tierConfig.post) || {}
  // DEV A/B hooks for the measure -> fix -> re-measure loop:
  //   ?post=off   default render path, no composer at all
  //   ?post=bare  composer with only RenderPass + OutputPass, no effects
  // Comparing the three attributes a brightness change to the pipeline or to
  // the effects instead of assuming.
  const q = import.meta.env.DEV ? new URLSearchParams(window.location.search).get('post') : null
  const bare = q === 'bare'
  const off = q === 'off'
  const enabled = !off && quality !== 'low' && (bare || post.bloom || post.vignette || post.grain)

  const composer = useMemo(() => {
    if (!enabled) return null
    const c = new EffectComposer(gl)
    c.addPass(new RenderPass(scene, camera))

    if (!bare && post.bloom) {
      // Threshold sits well above 1.0 because this pass runs in LINEAR space
      // before tone mapping, and a white fuselage under a 2.6-intensity sun
      // reaches ~2.2 on its own. Anything at or below that is ordinary
      // diffuse daylight: a threshold of 1.2 bloomed the whole airframe and
      // lifted the fleet beat's mean by 62. Only genuine HDR highlights --
      // nav lights, hard speculars, the sun disc -- are meant to glow.
      const bloom = new UnrealBloomPass(
        new THREE.Vector2(1, 1),
        0.22,
        0.45,
        2.1
      )
      c.addPass(bloom)
    }

    // Tone map and encode before the grade so both passes see display values.
    c.addPass(new OutputPass())

    if (!bare && (post.vignette || post.grain)) {
      const grade = new ShaderPass(GradeShader)
      grade.material.uniforms.vignette.value = post.vignette ? 0.5 : 0.0
      grade.material.uniforms.grain.value = post.grain ? 0.035 : 0.0
      gradeRef.current = grade
      c.addPass(grade)
    }

    // The composer renders into non-multisampled targets, so the renderer's
    // own antialias flag stops applying the moment it takes over.
    if (!bare && tierConfig.antialias) {
      const fxaa = new ShaderPass(FXAAShader)
      fxaaRef.current = fxaa
      c.addPass(fxaa)
    }

    return c
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, gl, scene, camera, post.bloom, post.vignette, post.grain, tierConfig, bare])

  // Hand the frameloop over: a priority > 0 callback disables r3f's own
  // render, so the composer has to run unconditionally.
  useFrame((state) => {
    if (!composer) return
    if (gradeRef.current) gradeRef.current.material.uniforms.time.value = state.clock.elapsedTime
    composer.render()
  }, enabled ? 1 : 0)

  useEffect(() => {
    if (!composer) return undefined
    composer.setPixelRatio(dpr)
    composer.setSize(size.width, size.height)
    if (fxaaRef.current) {
      const u = fxaaRef.current.material.uniforms
      u.resolution.value.set(1 / (size.width * dpr), 1 / (size.height * dpr))
    }
    return undefined
  }, [composer, dpr, size.width, size.height])

  useEffect(() => () => {
    if (composer) composer.dispose()
    if (gradeRef.current) gradeRef.current.dispose()
    if (fxaaRef.current) fxaaRef.current.dispose()
  }, [composer])

  // The composer is imperative state rather than scene graph content, so it
  // is never mounted into the tree -- it lives in the memo above for as long
  // as this component does.
  return null
}
