import { CIRCLE_FRACTION, PLACE_GAP } from './constants'
import type { CircleItem } from './types'

export function parsePoints(raw: string): number {
  const n = Number.parseInt(raw, 10)
  if (!Number.isFinite(n) || n < 1) return 1
  return Math.min(n, 99)
}

export function generateNonOverlappingPositions(count: number): CircleItem[] {
  const d = CIRCLE_FRACTION
  const minDist = d + PLACE_GAP
  const lo = d / 2
  const hi = 1 - d / 2
  const span = hi - lo
  const items: CircleItem[] = []

  for (let value = 1; value <= count; value++) {
    let placed = false
    for (let attempt = 0; attempt < 500; attempt++) {
      const cx = lo + Math.random() * span
      const cy = lo + Math.random() * span
      const ok = items.every(
        (p) => Math.hypot(p.cx - cx, p.cy - cy) >= minDist,
      )
      if (ok) {
        items.push({ value, cx, cy })
        placed = true
        break
      }
    }
    if (!placed) {
      const angle = (value / count) * Math.PI * 2
      const r = 0.35 * (hi - lo)
      items.push({
        value,
        cx: 0.5 + Math.cos(angle) * r * 0.4,
        cy: 0.5 + Math.sin(angle) * r * 0.4,
      })
    }
  }

  return items
}
