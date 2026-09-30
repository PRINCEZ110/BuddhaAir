import { useState, useEffect } from 'react'
import { getTier } from '../config/quality'

export function useResponsive3D() {
  const get = () => {
    if (typeof window === 'undefined') return { isMobile: false, isTablet: false, quality: 'high', config: null, tierSource: 'ssr' }
    const w = window.innerWidth
    const isMobile = w < 768
    const isTablet = w >= 768 && w < 1100
    const { tier, config, source } = getTier()
    if (typeof window !== 'undefined') window.__baTier = { tier, source }
    return { isMobile, isTablet, quality: tier, config, tierSource: source }
  }

  const [state, setState] = useState(get)

  useEffect(() => {
    let raf
    const onResize = () => {
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(() => setState(get()))
    }
    window.addEventListener('resize', onResize)
    return () => {
      window.removeEventListener('resize', onResize)
      cancelAnimationFrame(raf)
    }
  }, [])

  return state
}
