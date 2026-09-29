import React, { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import Aircraft from './Aircraft'
import Runway from './Runway'
import Mountains from './Mountains'
import Clouds from './Clouds'
import NepalTerrain from './NepalTerrain'
import SkyDome from './SkyDome'
import CameraController from './CameraController'

function HeroAircraftRig({ progressRef, quality }) {
  const group = useRef()
  const propSpeed = useRef(0)

  useFrame((_, delta) => {
    const g = group.current
    if (!g) return
    const t = progressRef.current

    if (t < 0.05) {
      g.position.set(0, 1.6, 0)
      g.rotation.set(0, 0, 0)
      propSpeed.current = THREE.MathUtils.damp(propSpeed.current, 0, 2, delta)
    } else if (t < 0.2) {
      const lt = (t - 0.05) / 0.15
      const e = lt * lt
      // nose points +X, runway runs along X: accelerate and rotate up
      g.position.set(e * 470, 1.6 + e * e * 200, 0)
      g.rotation.set(0, 0, e * 0.22)
      propSpeed.current = THREE.MathUtils.damp(propSpeed.current, 28, 1.2, delta)
    } else {
      g.position.set(0, 900, -3600)
      propSpeed.current = 0
    }
  })

  return (
    <group ref={group}>
      <Aircraft detail={quality === 'low' ? 'low' : 'high'} propSpeed={propSpeed.current} />
    </group>
  )
}

function ShowcaseAircraftRig({ progressRef, quality }) {
  const group = useRef()
  const inner = useRef()

  useFrame((state, delta) => {
    const g = group.current
    if (!g) return
    const t = progressRef.current

    if (t < 0.36) {
      g.position.set(0, -400, 0)
      return
    }
    if (t < 0.42) {
      const lt = (t - 0.36) / 0.06
      const e = 1 - Math.pow(1 - lt, 3)
      g.position.set(0, THREE.MathUtils.lerp(-400, 1.6, e), 0)
      g.rotation.set(0, 0, 0)
    } else if (t < 0.52) {
      g.position.set(0, 1.6, 0)
      g.rotation.set(0, 0, 0)
    } else if (t < 0.58) {
      const lt = (t - 0.52) / 0.06
      g.position.set(THREE.MathUtils.lerp(0, -190, lt), THREE.MathUtils.lerp(1.6, 46, lt), THREE.MathUtils.lerp(0, -150, lt))
      g.rotation.set(0, THREE.MathUtils.lerp(0, 0.55, lt), 0)
    } else {
      g.position.set(0, -400, 0)
    }

    if (inner.current && t > 0.36 && t < 0.52) {
      inner.current.rotation.y += delta * 0.13
    }
  })

  return (
    <group ref={group}>
      <group ref={inner}>
        <Aircraft detail={quality === 'low' ? 'low' : 'high'} propSpeed={0} />
      </group>
    </group>
  )
}

function Visibility({ progressRef, range, children }) {
  const group = useRef()
  useFrame(() => {
    if (!group.current) return
    const t = progressRef.current
    group.current.visible = t >= range[0] && t <= range[1]
  })
  return <group ref={group}>{children}</group>
}

export default function Experience({ progressRef, quality, reducedMotion, activeDestination, onSelectDestination }) {
  return (
    <>
      <fogExp2 attach="fog" args={['#c8d4e4', 0.0016]} />
      <CameraController progressRef={progressRef} reducedMotion={reducedMotion} />
      <SkyDome progressRef={progressRef} />

      <directionalLight
        name="ba-sun"
        position={[180, 140, -220]}
        intensity={2.6}
        color="#ffb36b"
        castShadow={quality === 'high'}
        shadow-mapSize={[1024, 1024]}
        shadow-camera-left={-60}
        shadow-camera-right={60}
        shadow-camera-top={60}
        shadow-camera-bottom={-60}
      />
      <ambientLight name="ba-amb" intensity={0.5} color="#8fa8c8" />
      <hemisphereLight args={['#cfe0f5', '#4a5a44', 0.85]} />
      <ambientLight intensity={0.22} color="#b8cce4" />

      <Mountains quality={quality} />

      <Visibility progressRef={progressRef} range={[-0.01, 0.13]}>
        <Runway />
      </Visibility>

      <Visibility progressRef={progressRef} range={[-0.01, 0.21]}>
        <HeroAircraftRig progressRef={progressRef} quality={quality} />
      </Visibility>

      <Visibility progressRef={progressRef} range={[0.09, 0.3]}>
        <Clouds quality={quality} mode="layers" />
      </Visibility>

      <Visibility progressRef={progressRef} range={[0.24, 0.4]}>
        <NepalTerrain
          quality={quality}
          activeDestination={activeDestination}
          onSelectDestination={onSelectDestination}
        />
      </Visibility>

      <Visibility progressRef={progressRef} range={[0.35, 0.6]}>
        <ShowcaseAircraftRig progressRef={progressRef} quality={quality} />
      </Visibility>
      <Visibility progressRef={progressRef} range={[0.5, 0.6]}>
        <Clouds quality={quality} mode="sea" />
      </Visibility>
    </>
  )
}
