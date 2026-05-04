/** Vị trí tâm vòng trên board (0–1 theo chiều ngang/dọc). */
export type CircleItem = {
  value: number
  cx: number
  cy: number
}

/** Trạng thái hiển thị / tương tác một vòng trên board (Bước 3). */
export type CirclePhase = 'active' | 'success' | 'fading' | 'removed'
