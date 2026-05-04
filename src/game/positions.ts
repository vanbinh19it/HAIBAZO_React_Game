import {
  CIRCLE_FRACTION,
  OVERLAP_LAYOUT_MIN_COUNT,
  PLACE_GAP,
  POINTS_MAX,
} from './constants'
import type { CircleItem } from './types'

export function parsePoints(raw: string): number {
  const n = Number.parseInt(raw, 10)
  if (!Number.isFinite(n) || n < 1) return 1
  return Math.min(n, POINTS_MAX)
}

function generateUniformRandomPositions(
  count: number,
  d: number,
): CircleItem[] {
  const lo = d / 2
  const hi = 1 - d / 2
  const span = Math.max(0, hi - lo)
  const items: CircleItem[] = []
  for (let value = 1; value <= count; value++) {
    items.push({
      value,
      cx: lo + Math.random() * span,
      cy: lo + Math.random() * span,
      diameter: d,
    })
  }
  return items
}

function generateNonOverlappingWithD(count: number, d: number): CircleItem[] {
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
        items.push({ value, cx, cy, diameter: d })
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
        diameter: d,
      })
    }
  }

  return items
}

/**
 * Sinh n vòng: đường kính cố định (`CIRCLE_FRACTION`).
 * n nhỏ: cố không chồng; n lớn (≥ OVERLAP_LAYOUT_MIN_COUNT): ngẫu nhiên, cho phép chồng.
 */
export function generateCirclePositions(count: number): CircleItem[] {
  const d = CIRCLE_FRACTION
  if (count >= OVERLAP_LAYOUT_MIN_COUNT) {
    return generateUniformRandomPositions(count, d)
  }
  return generateNonOverlappingWithD(count, d)
}

/** @deprecated Dùng `generateCirclePositions`. */
export function generateNonOverlappingPositions(count: number): CircleItem[] {
  return generateCirclePositions(count)
}
