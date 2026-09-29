import { useState, useEffect } from 'react'

export function useResponsive3D() {
  const get = () => {
    if (typeof window === 'undefined') return { isMobile: false, isTablet: false, quality: 'high' }
    const w = window.innerWidth
    const isMobile = w < 768
    const isTablet = w >= 768 && w < 1100
    const quality = isMobile ? 'low' : isTablet ? 'medium' : 'high'
    return { isMobile, isTablet, quality }
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
