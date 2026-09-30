import { TIMELINE_ANCHORS } from '../data/timelineAnchors.js'

export function buildAnchorPoints(anchors, tops, maxScroll) {
  const pts = []
  for (let i = 0; i < anchors.length; i++) {
    const top = tops[i]
    if (typeof top !== 'number' || top > maxScroll) continue
    pts.push({ px: Math.round(top), t: anchors[i].t })
  }
  pts.sort((p, r) => p.px - r.px)
  for (let i = 1; i < pts.length; i++) {
    if (pts[i].t < pts[i - 1].t) pts[i].t = pts[i - 1].t
  }
  if (!pts.length || pts[0].px > 0) pts.unshift({ px: 0, t: 0 })
  const last = pts[pts.length - 1]
  if (last.px < maxScroll) pts.push({ px: maxScroll, t: 1 })
  else if (last.t < 1) last.t = 1
  return pts
}

export function mapTToScroll(t, pts) {
  if (!pts || !pts.length) return 0
  if (t <= pts[0].t) return pts[0].px
  const last = pts[pts.length - 1]
  if (t >= last.t) return last.px
  let i = 1
  while (i < pts.length - 1 && pts[i].t < t) i++
  const a = pts[i - 1]
  const b = pts[i]
  const span = b.t - a.t
  if (span <= 0) return b.px
  return a.px + ((b.px - a.px) * (t - a.t)) / span
}

export function mapScrollToT(y, pts) {  if (!pts || !pts.length) return 0
  if (y <= pts[0].px) return pts[0].t
  const last = pts[pts.length - 1]
  if (y >= last.px) return last.t
  let lo = 0
  let hi = pts.length - 1
  while (lo + 1 < hi) {
    const mid = (lo + hi) >> 1
    if (pts[mid].px <= y) lo = mid
    else hi = mid
  }
  const a = pts[lo]
  const b = pts[hi]
  const span = b.px - a.px
  if (span <= 0) return b.t
  return a.t + ((b.t - a.t) * (y - a.px)) / span
}

function anchorEl(a) {
  if (a.id) return document.getElementById(a.id)
  if (a.q) return document.querySelector(a.q)
  return null
}

export function anchorTops(anchors = TIMELINE_ANCHORS) {
  return anchors.map((a) => {
    const el = anchorEl(a)
    return el ? Math.round(el.getBoundingClientRect().top + window.scrollY) : null
  })
}

export function measureAnchors(anchors = TIMELINE_ANCHORS) {
  if (typeof document === 'undefined') return [{ px: 0, t: 0 }]
  const maxScroll = Math.max(
    1,
    document.documentElement.scrollHeight - window.innerHeight
  )
  return buildAnchorPoints(anchors, anchorTops(anchors), maxScroll)
}
