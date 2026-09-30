const VALID = ['low', 'medium', 'high']

export const TIERS = {
  low: {
    dpr: 1,
    antialias: false,
    shadows: false,
    shadowMapSize: 0,
    shadowType: null,
    envMapSize: 64,
    envMapBlur: 0,
    textureMax: 1024,
    aircraftDetail: 'low',
    cloudLayers: 3,
    terrainSeg: 40,
    mountainSeg: 40,
    post: { bloom: false, vignette: false, dof: false, grain: false, smaa: false },
    postDpr: 1
  },
  medium: {
    dpr: 1.5,
    antialias: true,
    shadows: true,
    shadowMapSize: 1024,
    shadowType: 'PCF',
    envMapSize: 128,
    envMapBlur: 0,
    textureMax: 2048,
    aircraftDetail: 'high',
    cloudLayers: 4,
    terrainSeg: 64,
    mountainSeg: 60,
    post: { bloom: true, vignette: true, dof: false, grain: false, smaa: false },
    postDpr: 1.5
  },
  high: {
    dpr: 2,
    antialias: true,
    shadows: true,
    shadowMapSize: 2048,
    shadowType: 'PCFSoft',
    envMapSize: 256,
    envMapBlur: 0,
    textureMax: 4096,
    aircraftDetail: 'high',
    cloudLayers: 5,
    terrainSeg: 88,
    mountainSeg: 88,
    post: { bloom: true, vignette: true, dof: true, grain: true, smaa: true },
    postDpr: 2
  }
}

function readOverride() {
  if (typeof window === 'undefined') return null
  try {
    const v = new URLSearchParams(window.location.search).get('q')
    return VALID.includes(v) ? v : null
  } catch {
    return null
  }
}

function readGpu() {
  if (typeof document === 'undefined') return ''
  try {
    const c = document.createElement('canvas')
    const gl = c.getContext('webgl2') || c.getContext('webgl')
    if (!gl) return ''
    const dbg = gl.getExtension('WEBGL_debug_renderer_info')
    const name = dbg ? String(gl.getParameter(dbg.UNMASKED_RENDERER_WEBGL)) : String(gl.getParameter(gl.RENDERER))
    gl.getExtension('WEBGL_lose_context')?.loseContext()
    return name.toLowerCase()
  } catch {
    return ''
  }
}

const SOFTWARE_HINTS = ['swiftshader', 'llvmpipe', 'software rasterizer', 'softwarerenderer', 'mesa offscreen', 'basic render']

function lowerOf(base) {
  if (base === 'high') return 'medium'
  return 'low'
}

export function detectTier() {
  const override = readOverride()
  if (override) return { tier: override, source: 'override' }

  if (typeof window === 'undefined') return { tier: 'high', source: 'ssr' }

  const gpu = readGpu()
  if (SOFTWARE_HINTS.some((h) => gpu.includes(h))) return { tier: 'low', source: 'software-gpu' }

  const coarse = window.matchMedia?.('(pointer: coarse)')?.matches
  const uaMobile = /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent || '')
  const cores = navigator.hardwareConcurrency || 8
  const memory = navigator.deviceMemory || 8
  const wide = Math.max(window.innerWidth, window.innerHeight) >= 1600

  let tier = 'high'
  if (coarse || uaMobile) tier = 'low'
  else if (cores <= 4 || memory <= 4) tier = 'medium'
  else if (!wide && window.innerWidth < 1440) tier = 'medium'
  else if (window.devicePixelRatio >= 3 && window.innerWidth >= 2000) tier = 'high'

  return { tier, source: `heuristic(cores=${cores},mem=${memory},dpr=${window.devicePixelRatio})${gpu ? ',gpu=' + gpu.slice(0, 40) : ''}` }
}

export function getTier() {
  const { tier, source } = detectTier()
  return { tier, config: TIERS[tier], source }
}
