export function detectWebGL() {
  try {
    const canvas = document.createElement('canvas')
    return !!(window.WebGLRenderingContext && (canvas.getContext('webgl2') || canvas.getContext('webgl')))
  } catch {
    return false
  }
}

export function getPixelRatioCap(quality) {
  const dpr = window.devicePixelRatio || 1
  if (quality === 'low') return Math.min(dpr, 1)
  if (quality === 'medium') return Math.min(dpr, 1.5)
  return Math.min(dpr, 2)
}
