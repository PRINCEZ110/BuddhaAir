import React, { useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import Aircraft from './Aircraft'
import Runway from './Runway'
import Mountains from './Mountains'
import Clouds from './Clouds'
import Cabin from './Cabin'
import NepalTerrain from './NepalTerrain'
import SkyDome from './SkyDome'
import { HimalayaPeaks } from './Mountains'
import CameraController from './CameraController'
import { getAircraftState, isAircraftActive } from './timeline/aircraftPath'

/**
 * One aeroplane for the whole film. Position, pitch and propeller speed all
 * come from the shared path so the camera and the aircraft can never
 * disagree — this replaces the previous pair of rigs that hid one model and
 * materialised a second one, duplicating geometry and a 2048x1024 texture.
 */
function AircraftRig({ progressRef, quality, reducedMotion, interactiveRef }) {
  const group = useRef()
  const spin = useRef(0)
  const altitude = useRef(0)

  useFrame((_, delta) => {
    const g = group.current
    if (!g) return
    const t = reducedMotion ? 0 : progressRef.current
    const s = getAircraftState(t)

    g.position.set(s.x, s.y, s.z)
    g.rotation.set(0, 0, s.pitch)
    g.visible = isAircraftActive(t)
    altitude.current = s.y

    // Propeller spin lags the target so spool-up reads as mechanical.
    spin.current = THREE.MathUtils.damp(spin.current, s.spin, 1.4, delta)
  })

  return (
    <group ref={group}>
      <Aircraft
        detail={quality === 'low' ? 'low' : 'high'}
        spinRef={spin}
        interactiveRef={interactiveRef}
        altitudeRef={altitude}
      />
    </group>
  )
}

/**
 * Visibility gate. `range` toggles visibility for light groups; heavy
 * groups additionally UNMOUNT outside their range so they cost nothing at
 * all when the camera is nowhere near them.
 *
 * The state check must run BEFORE the group ref check. Returning null
 * clears group.current, so an early return on that ref meant an unmounted
 * group could never be re-mounted — the cabin and cloud sea were silently
 * dead for the whole session.
 */
function Visibility({ progressRef, range, reducedMotion, unmount = false, children }) {
  const group = useRef()
  const [on, setOn] = useState(true)
  const onRef = useRef(on)
  onRef.current = on

  useFrame(() => {
    const t = reducedMotion ? 0 : progressRef.current
    const should = t >= range[0] && t <= range[1]

    if (group.current) group.current.visible = should
    if (unmount && should !== onRef.current) setOn(should)
  })

  if (unmount && !on) return null
  return <group ref={group}>{children}</group>
}

export default function Experience({
  progressRef,
  quality,
  reducedMotion,
  activeDestination,
  onSelectDestination,
  focusRef,
  interactiveRef
}) {
  return (
    <>
      <fogExp2 attach="fog" args={['#c8d4e4', 0.00024]} />
      <CameraController progressRef={progressRef} reducedMotion={reducedMotion} focusRef={focusRef} />
      <SkyDome progressRef={progressRef} reducedMotion={reducedMotion} />

      <directionalLight
        name="ba-sun"
        position={[180, 140, -220]}
        intensity={2.6}
        color="#ffb36b"
        castShadow={quality === 'high'}
        shadow-mapSize={[1024, 1024]}
        shadow-camera-left={-90}
        shadow-camera-right={90}
        shadow-camera-top={90}
        shadow-camera-bottom={-90}
        shadow-camera-far={600}
      />
      <ambientLight name="ba-amb" intensity={0.5} color="#8fa8c8" />
      <hemisphereLight args={['#cfe0f5', '#4a5a44', 0.85]} />

      {/* Mountains unmount entirely once the camera leaves the Nepal
          corridor, so the page tail costs zero terrain. */}
      <Visibility progressRef={progressRef} range={[-0.02, 0.66]} reducedMotion={reducedMotion} unmount>
        <Mountains quality={quality} reducedMotion={reducedMotion} />
      </Visibility>

      <Visibility progressRef={progressRef} range={[-0.02, 0.16]} reducedMotion={reducedMotion} unmount>
        <Runway />
      </Visibility>

      <AircraftRig
        progressRef={progressRef}
        quality={quality}
        reducedMotion={reducedMotion}
        interactiveRef={interactiveRef}
      />

      <Visibility progressRef={progressRef} range={[0.17, 0.40]} reducedMotion={reducedMotion} unmount>
        <Clouds quality={quality} mode="layers" />
      </Visibility>

      <Visibility progressRef={progressRef} range={[0.30, 0.552]} reducedMotion={reducedMotion} unmount>
        <NepalTerrain
          quality={quality}
          reducedMotion={reducedMotion}
          activeDestination={activeDestination}
          focusedDestination={activeDestination}
          onSelectDestination={onSelectDestination}
        />
      </Visibility>

      {/* Mountain flight: cabin first, then the cloud sea below it. */}
      <Visibility progressRef={progressRef} range={[0.615, 0.672]} reducedMotion={reducedMotion} unmount>
        <Cabin progressRef={progressRef} reducedMotion={reducedMotion} />
      </Visibility>

      <Visibility progressRef={progressRef} range={[0.60, 0.70]} reducedMotion={reducedMotion} unmount>
        <Clouds quality={quality} mode="sea" />
      </Visibility>

      {/* Dedicated peak silhouettes for the reveal, angled to the window. */}
      <Visibility progressRef={progressRef} range={[0.60, 0.70]} reducedMotion={reducedMotion} unmount>
        <HimalayaPeaks quality={quality} reducedMotion={reducedMotion} />
      </Visibility>
    </>
  )
}
