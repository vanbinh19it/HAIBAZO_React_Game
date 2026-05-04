/** Đường kính vòng so với cạnh board (logic placement). */
export const CIRCLE_FRACTION = 0.14

/** Khoảng cách tối thiểu giữa các tâm (so với đường kính). */
export const PLACE_GAP = 0.012

/** Tổng thời gian thực từ lúc click đúng đến khi vòng biến mất (đếm trên vòng + hai phase). */
export const CIRCLE_LIFECYCLE_MS = 3000

/** Giai đoạn đầu: nền cam + đếm real-time trước khi bắt đầu mờ dần. */
export const CLICK_DISPLAY_MS = 1500

/** Giai đoạn mờ — phải khớp: CLICK_DISPLAY_MS + FADE_OUT_MS === CIRCLE_LIFECYCLE_MS. */
export const FADE_OUT_MS = CIRCLE_LIFECYCLE_MS - CLICK_DISPLAY_MS

/** Auto Play: trễ ngẫu nhiên giữa mỗi lần mô phỏng click (ms). */
export const AUTO_PLAY_DELAY_MIN_MS = 500
export const AUTO_PLAY_DELAY_MAX_MS = 1000
