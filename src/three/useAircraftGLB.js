import { useEffect, useState } from 'react'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js'

const MODEL_URL = '/models/atr72.glb'

let pending = null

function load() {
  if (!pending) {
    pending = new Promise((resolve, reject) => {
      const draco = new DRACOLoader()
      draco.setDecoderPath('/draco/')
      const loader = new GLTFLoader()
      loader.setDRACOLoader(draco)
      loader.load(
        MODEL_URL,
        (gltf) => {
          draco.dispose()
          resolve(gltf.scene)
        },
        undefined,
        (err) => {
          draco.dispose()
          // allow a later attempt rather than caching the failure forever
          pending = null
          reject(err)
        }
      )
    })
  }
  return pending
}

/**
 * Loads the Blender-built GLB once for the whole session, but only for the
 * tiers that will actually mount it — the low tier keeps the procedural
 * airframe, so it must never pay for the download.
 *
 * Deliberately NOT suspense: <Aircraft> renders inside a plain group with no
 * Suspense boundary, and a suspended subtree would blank the entire 3D world
 * for the duration of the fetch. Returning `null` lets the caller fall back
 * to the procedural airframe until the model arrives, and stay on it if the
 * file ever fails to load.
 */
export function useAircraftGLB(enabled) {
  const [scene, setScene] = useState(null)

  useEffect(() => {
    if (!enabled) return undefined
    let alive = true
    load()
      .then((s) => {
        if (alive) setScene(s)
      })
      .catch(() => {})
    return () => {
      alive = false
    }
  }, [enabled])

  return scene
}
