import { useEffect, useLayoutEffect, useState } from 'react'
import {
  CLICK_DISPLAY_MS,
  CIRCLE_LIFECYCLE_MS,
  FADE_OUT_MS,
} from '../../game/constants'
import type { CircleItem, CirclePhase } from '../../game/types'

export type { CirclePhase } from '../../game/types'

type BoardCircleProps = {
  item: CircleItem
  /** Mặc định `active` khi dùng BoardCircle độc lập (chưa Bước 3). */
  phase?: CirclePhase
  /** `Date.now()` tại lúc click đúng — đếm ngược 3.0→0.0 theo wall-clock. */
  highlightStartedAtMs?: number
  onClick?: () => void
  /** Cho phép click (tắt khi GAME OVER hoặc không phải lượt). */
  interactive?: boolean
  /** GAME OVER: dừng đếm ngược & giữ opacity/số tại thời điểm khóa. */
  freezeVisual?: boolean
  className?: string
}

export function BoardCircle({
  item,
  phase = 'active',
  highlightStartedAtMs,
  onClick,
  interactive = true,
  freezeVisual = false,
  className = '',
}: BoardCircleProps) {
  const { cx, cy, value } = item

  const [, setTick] = useState(0)
  const [frozenRemainingSec, setFrozenRemainingSec] = useState<number | null>(
    null,
  )

  const totalSec = CIRCLE_LIFECYCLE_MS / 1000

  const showLiveDuration =
    (phase === 'success' || phase === 'fading') &&
    highlightStartedAtMs != null

  useLayoutEffect(() => {
    if (!freezeVisual) {
      setFrozenRemainingSec(null)
      return
    }
    if (!showLiveDuration || highlightStartedAtMs == null) return

    setFrozenRemainingSec((prev) => {
      if (prev !== null) return prev
      return Math.max(
        0,
        totalSec - (Date.now() - highlightStartedAtMs) / 1000,
      )
    })
  }, [freezeVisual, showLiveDuration, highlightStartedAtMs, totalSec])

  useEffect(() => {
    if (freezeVisual) return
    if (
      highlightStartedAtMs == null ||
      phase === 'active' ||
      phase === 'removed'
    ) {
      return
    }

    const id = window.setInterval(() => {
      setTick((t) => t + 1)
    }, 50)
    return () => window.clearInterval(id)
  }, [freezeVisual, highlightStartedAtMs, phase])

  const remainingSec =
    showLiveDuration && highlightStartedAtMs != null
      ? Math.max(
          0,
          totalSec - (Date.now() - highlightStartedAtMs) / 1000,
        )
      : 0

  const displayRemainingSec =
    freezeVisual && frozenRemainingSec !== null
      ? frozenRemainingSec
      : remainingSec

  const palette =
    phase === 'active'
      ? 'border-red-300 bg-white'
      : 'border-orange-600 bg-orange-500'

  const freezeDimBelowSec = CLICK_DISPLAY_MS / 1000

  /**
   * Đang fading thì mờ cả nút. Khi GAME OVER (freeze): vẫn thấy đếm; còn < 1.5s
   * (nửa sau chu kỳ, đồng bộ CLICK_DISPLAY_MS) thì opacity-50, trước đó opacity-100.
   */
  const opacityClass = freezeVisual
    ? displayRemainingSec < freezeDimBelowSec
      ? 'opacity-50'
      : 'opacity-100'
    : phase === 'fading'
      ? 'opacity-0'
      : 'opacity-100'

  const useFadeMotion =
    !freezeVisual && (phase === 'success' || phase === 'fading')

  const canClick = interactive && phase === 'active'

  return (
    <button
      type="button"
      onClick={canClick ? onClick : undefined}
      className={`absolute flex aspect-square w-[14%] -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center rounded-full border py-1 text-lg font-medium text-black outline-none transition-opacity focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2 ${palette} ${opacityClass} ${useFadeMotion ? 'ease-in-out' : ''} ${canClick ? 'cursor-pointer hover:brightness-95' : 'pointer-events-none cursor-default'} ${className}`.trim()}
      style={{
        left: `${cx * 100}%`,
        top: `${cy * 100}%`,
        transitionDuration: useFadeMotion ? `${FADE_OUT_MS}ms` : undefined,
      }}
    >
      <span className="leading-none">{value}</span>
      {showLiveDuration && (
        <span className="mt-0.5 text-[0.65rem] leading-none tabular-nums text-white">
          {displayRemainingSec.toFixed(1)}
          s
        </span>
      )}
    </button>
  )
}
