import type { CircleItem, CirclePhase } from './types'

export function createInitialPhases(
  items: CircleItem[],
): Record<number, CirclePhase> {
  const map: Record<number, CirclePhase> = {}
  for (const c of items) {
    map[c.value] = 'active'
  }
  return map
}
