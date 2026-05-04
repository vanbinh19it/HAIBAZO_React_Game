/** Vị trí tâm vòng trên board (0–1 theo chiều ngang/dọc). */
export type CircleItem = {
  value: number
  cx: number
  cy: number
  /** Đường kính so với cạnh board (0–1); mặc định theo layout khi sinh. */
  diameter?: number
}

/** Trạng thái hiển thị / tương tác một vòng trên board (Bước 3). */
export type CirclePhase = 'active' | 'success' | 'fading' | 'removed'

/** Kết quả vòng chơi — `LOST` khi click sai thứ tự. */
export type GameRoundOutcome = 'LOST' | null
