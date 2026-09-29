import React, { useEffect, useRef, useState, useCallback, lazy, Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import * as THREE from 'three'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Loader from './components/loader/Loader'
import Navbar from './components/navigation/Navbar'
import Hero from './components/sections/Hero'
import Destinations from './components/destinations/Destinations'
import AircraftShowcase from './components/sections/AircraftShowcase'
import MountainFlight from './components/sections/MountainFlight'
import Stats from './components/sections/Stats'
import Safety from './components/sections/Safety'
import RoyalClub from './components/royal-club/RoyalClub'
import SpecialAssistance from './components/assistance/SpecialAssistance'
import Holidays from './components/holidays/Holidays'
import Stories from './components/stories/Stories'
import FlightStatus from './components/flight-status/FlightStatus'
import Footer from './components/footer/Footer'
import BookingPanel from './components/booking/BookingPanel'
import BookingModal from './components/booking/BookingModal'
import { useReducedMotion } from './hooks/useReducedMotion'
import { useResponsive3D } from './hooks/useResponsive3D'
import { useReveal } from './hooks/useReveal'
import { detectWebGL } from './utils/performance'

gsap.registerPlugin(ScrollTrigger)

// The 3D world is split out of the initial bundle: procedural geometry,
// shaders and terrain generation are only fetched once the loading
// screen has played, so first paint is not blocked by WebGL.
const Experience = lazy(() => import('./three/Experience'))

export default function App() {
  const [loading, setLoading] = useState(true)
  const [loadProgress, setLoadProgress] = useState(0)
  const [loadDone, setLoadDone] = useState(false)
  const [navSolid, setNavSolid] = useState(false)
  const [bookingOpen, setBookingOpen] = useState(false)
  const [activeDestination, setActiveDestination] = useState(null)
  const [webglOk] = useState(detectWebGL)

  const progressRef = useRef(0)
  const reducedMotion = useReducedMotion()
  const { quality } = useResponsive3D()
  const revealRef = useReveal()

  useEffect(() => {
    let progress = 0
    const targets = [12, 32, 58, 82, 100]
    let i = 0
    const timer = setInterval(() => {
      if (i < targets.length) {
        progress = targets[i]
        setLoadProgress(progress)
        i++
      } else {
        clearInterval(timer)
        setTimeout(() => {
          setLoadDone(true)
          setTimeout(() => setLoading(false), 900)
        }, 500)
      }
    }, 320)
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    if (loading) return

    const ctx = gsap.context(() => {
      gsap.to(progressRef, {
        current: 1,
        ease: 'none',
        scrollTrigger: {
          trigger: document.documentElement,
          start: 'top top',
          end: 'bottom bottom',
          scrub: reducedMotion ? true : 0.8,
          invalidateOnRefresh: true
        }
      })

      ScrollTrigger.create({
        trigger: '#top',
        start: 'top top',
        end: '80px top',
        onUpdate: (self) => setNavSolid(self.progress > 0.02)
      })
    })

    return () => ctx.revert()
  }, [loading, reducedMotion])

  const openBooking = useCallback(() => setBookingOpen(true), [])
  const closeBooking = useCallback(() => setBookingOpen(false), [])

  const handleDestinationSelect = useCallback((dest) => {
    setActiveDestination(dest.id)
    setTimeout(() => setActiveDestination(null), 2600)
  }, [])

  const handleSearch = useCallback(() => {
    closeBooking()
    document.querySelector('#status')?.scrollIntoView({ behavior: 'smooth' })
  }, [closeBooking])

  return (
    <div ref={revealRef}>
      <Loader progress={loadProgress} done={loadDone} />

      {!webglOk && (
        <div className="ba-fallback" aria-hidden="true">
          <div className="ba-fallback__mountains" />
        </div>
      )}

      {webglOk && !loading && (
        <div className="ba-canvas-wrap" aria-hidden="true">
          <Canvas
            shadows={quality === 'high'}
            dpr={quality === 'low' ? 1 : quality === 'medium' ? 1.5 : 2}
            camera={{ position: [20, 2.4, 30], fov: 42, near: 0.5, far: 6000 }}
            gl={{ antialias: quality !== 'low', powerPreference: 'high-performance' }}
            onCreated={({ gl }) => {
              gl.toneMapping = THREE.ACESFilmicToneMapping
              gl.toneMappingExposure = 1.25
              gl.outputColorSpace = THREE.SRGBColorSpace
            }}
            frameloop="always"
          >
            <Suspense fallback={null}>
              <Experience
                progressRef={progressRef}
                quality={quality}
                reducedMotion={reducedMotion}
                activeDestination={activeDestination}
                onSelectDestination={handleDestinationSelect}
              />
            </Suspense>
          </Canvas>
        </div>
      )}

      <Navbar solid={navSolid} onBook={openBooking} />

      <main>
        <Hero started={!loading} onBook={openBooking} />

        <section className="ba-section ba-section--transparent ba-booking" id="book" aria-label="Book a flight" style={{ paddingTop: 40, paddingBottom: 100 }}>
          <div className="ba-container">
            <div className="ba-section__head ba-reveal" style={{ textAlign: 'center', margin: '0 auto 48px' }}>
              <span className="ba-label" style={{ justifyContent: 'center' }}>Book a Flight</span>
              <h2 className="ba-section__title" style={{ marginTop: 18 }}>
                Where Will You <em>Fly?</em>
              </h2>
            </div>
            <div className="ba-reveal" style={{ maxWidth: 980, margin: '0 auto' }}>
              <BookingPanel onSearch={handleSearch} />
            </div>
          </div>
        </section>

        <Destinations onSelect={handleDestinationSelect} activeId={activeDestination} />
        <AircraftShowcase />
        <MountainFlight onDiscover={openBooking} />
        <Stats />
        <Safety />
        <RoyalClub />
        <SpecialAssistance />
        <Holidays />
        <Stories />
        <FlightStatus />

        <section className="ba-cta ba-section--transparent" aria-label="Call to action">
          <div className="ba-reveal">
            <span className="ba-label" style={{ justifyContent: 'center' }}>Take Flight</span>
            <h2 className="ba-cta__title">
              The Mountains<br />Are Calling
            </h2>
            <p className="ba-cta__sub">
              Book your next journey with Buddha Air and see Nepal from
              a perspective few ever forget.
            </p>
            <div className="ba-cta__actions">
              <button className="ba-btn ba-btn--primary" onClick={openBooking}>
                Book a Flight
                <svg className="ba-btn__arrow" width="16" height="12" viewBox="0 0 16 12" fill="none">
                  <path d="M1 6h13M10 1l5 5-5 5" stroke="currentColor" strokeWidth="1.6" />
                </svg>
              </button>
              <a
                href="#mountain-flight"
                className="ba-btn ba-btn--ghost"
                onClick={(e) => {
                  e.preventDefault()
                  document.querySelector('#mountain-flight')?.scrollIntoView({ behavior: 'smooth' })
                }}
              >
                Mountain Flights
              </a>
            </div>
          </div>
        </section>
      </main>

      <Footer />

      <BookingModal open={bookingOpen} onClose={closeBooking} onSearch={handleSearch} />
    </div>
  )
}
