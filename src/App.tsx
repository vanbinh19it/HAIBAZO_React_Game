import { useEffect, useRef, useState } from 'react'
import {
  BoardCircle,
  GameBoard,
  GameLayout,
  GameTitle,
  NextHint,
  PlayControls,
  PointsField,
  TimerDisplay,
} from './components/game'
import {
  AUTO_PLAY_DELAY_MAX_MS,
  AUTO_PLAY_DELAY_MIN_MS,
  CLICK_DISPLAY_MS,
  FADE_OUT_MS,
  generateCirclePositions,
  parsePoints,
  type CircleItem,
  type CirclePhase,
  type GameRoundOutcome,
} from './game'

function createInitialPhases(items: CircleItem[]): Record<number, CirclePhase> {
  const map: Record<number, CirclePhase> = {}
  for (const c of items) {
    map[c.value] = 'active'
  }
  return map
}

function App() {
  const [points, setPoints] = useState('5')
  const [playing, setPlaying] = useState(false)
  const [autoPlay, setAutoPlay] = useState(false)
  const [circles, setCircles] = useState<CircleItem[]>([])
  const [circlePhase, setCirclePhase] = useState<
    Record<number, CirclePhase>
  >({})
  const [highlightStartedAtMsByCircle, setHighlightStartedAtMsByCircle] =
    useState<Record<number, number>>({})
  const [nextExpected, setNextExpected] = useState(1)
  const [roundOutcome, setRoundOutcome] = useState<GameRoundOutcome>(null)

  const [displayTime, setDisplayTime] = useState(0)
  const startTimeRef = useRef<number | null>(null)
  const nextExpectedRef = useRef(1)
  const circlePhaseRef = useRef<Record<number, CirclePhase>>({})
  /** Timeout fade/remove sau click đúng — không trộn với Auto Play. */
  const timeoutIdsRef = useRef<number[]>([])
  /** Chỉ lịch click tự động; tách để OFF không hủy animation vòng đã bấm. */
  const autoPlayTimeoutIdsRef = useRef<number[]>([])
  const autoPlayActiveRef = useRef(false)
  const handleCircleClickRef = useRef<(targetNumber: number) => void>(() => {})

  circlePhaseRef.current = circlePhase
  autoPlayActiveRef.current = autoPlay

  const isLost = roundOutcome === 'LOST'

  const clearAutoPlaySchedulers = () => {
    autoPlayTimeoutIdsRef.current.forEach((id) => window.clearTimeout(id))
    autoPlayTimeoutIdsRef.current = []
  }

  const clearSchedulers = () => {
    timeoutIdsRef.current.forEach((id) => window.clearTimeout(id))
    timeoutIdsRef.current = []
  }

  const scheduleAfter = (ms: number, fn: () => void) => {
    const id = window.setTimeout(fn, ms)
    timeoutIdsRef.current.push(id)
  }

  const visibleCircles = circles.filter((c) => circlePhase[c.value] !== 'removed')
  const totalCount = circles.length
  const allCleared =
    playing &&
    !isLost &&
    totalCount > 0 &&
    circles.every((c) => circlePhase[c.value] === 'removed')

  const showNext =
    playing &&
    !isLost &&
    !allCleared &&
    totalCount > 0 &&
    nextExpected <= totalCount

  useEffect(() => {
    nextExpectedRef.current = nextExpected
  }, [nextExpected])

  useEffect(() => {
    return () => {
      clearSchedulers()
      clearAutoPlaySchedulers()
    }
  }, [])

  useEffect(() => {
    if (!playing || startTimeRef.current === null || isLost || allCleared) return

    const tick = () => {
      setDisplayTime((Date.now() - startTimeRef.current!) / 1000)
    }

    tick()
    const id = window.setInterval(tick, 100)
    return () => window.clearInterval(id)
  }, [playing, isLost, allCleared])

  useEffect(() => {
    if (!autoPlay || !playing || isLost || allCleared) return

    const total = circles.length
    if (total === 0) return

    const valueToClick = nextExpectedRef.current
    if (valueToClick < 1 || valueToClick > total) return

    const span = AUTO_PLAY_DELAY_MAX_MS - AUTO_PLAY_DELAY_MIN_MS
    const delay = AUTO_PLAY_DELAY_MIN_MS + Math.random() * span

    const id = window.setTimeout(() => {
      if (!autoPlayActiveRef.current) return
      handleCircleClickRef.current(valueToClick)
    }, delay)

    autoPlayTimeoutIdsRef.current.push(id)

    return () => {
      window.clearTimeout(id)
      autoPlayTimeoutIdsRef.current = autoPlayTimeoutIdsRef.current.filter(
        (x) => x !== id,
      )
    }
  }, [autoPlay, playing, isLost, allCleared, nextExpected, circles.length])

  const startRound = () => {
    clearSchedulers()
    clearAutoPlaySchedulers()
    const n = parsePoints(points)
    const items = generateCirclePositions(n)
    const phases = createInitialPhases(items)

    setCircles(items)
    setCirclePhase(phases)
    setHighlightStartedAtMsByCircle({})
    setNextExpected(1)
    nextExpectedRef.current = 1
    setRoundOutcome(null)
    startTimeRef.current = Date.now()
    setDisplayTime(0)
    setPlaying(true)
  }

  /**
   * Đúng: highlight + lịch fade/remove.
   * Sai thứ tự: LOST, hủy mọi timeout (giữ phase success/fading hiện tại), tắt Auto Play, khóa board.
   */
  const handleCircleClick = (targetNumber: number) => {
    if (isLost || allCleared) return

    if (circlePhaseRef.current[targetNumber] !== 'active') return

    if (targetNumber !== nextExpectedRef.current) {
      clearSchedulers()
      clearAutoPlaySchedulers()
      setAutoPlay(false)
      setRoundOutcome('LOST')

      const now = Date.now()
      setHighlightStartedAtMsByCircle((prev) => ({
        ...prev,
        [targetNumber]: now,
      }))
      setCirclePhase((p) => ({ ...p, [targetNumber]: 'success' }))
      return
    }

    const now = Date.now()
    setHighlightStartedAtMsByCircle((prev) => ({ ...prev, [targetNumber]: now }))
    setNextExpected((n) => {
      const next = n + 1
      nextExpectedRef.current = next
      return next
    })
    setCirclePhase((p) => ({ ...p, [targetNumber]: 'success' }))

    scheduleAfter(CLICK_DISPLAY_MS, () => {
      setCirclePhase((p) =>
        p[targetNumber] === 'success' ? { ...p, [targetNumber]: 'fading' } : p,
      )
      scheduleAfter(FADE_OUT_MS, () => {
        setCirclePhase((p) => ({ ...p, [targetNumber]: 'removed' }))
      })
    })
  }

  handleCircleClickRef.current = handleCircleClick

  const titleText = isLost
    ? 'GAME OVER'
    : allCleared
      ? 'ALL CLEARED'
      : "LET'S PLAY"

  const titleClassName = isLost
    ? 'text-red-600'
    : allCleared
      ? 'text-green-600'
      : ''

  return (
    <GameLayout>
      <GameTitle className={titleClassName}>{titleText}</GameTitle>

      <PointsField
        value={points}
        onChange={setPoints}
        disabled={playing}
      />

      <TimerDisplay seconds={displayTime} />

      <PlayControls
        playing={playing}
        onlyRestart={allCleared || isLost}
        autoPlay={autoPlay}
        onPlay={startRound}
        onRestart={startRound}
        onToggleAutoPlay={() => {
          setAutoPlay((prev) => {
            if (prev) {
              clearAutoPlaySchedulers()
              autoPlayActiveRef.current = false
              return false
            }
            return true
          })
        }}
      />

      <GameBoard
        circles={visibleCircles}
        renderCircle={(item) => (
          <BoardCircle
            item={item}
            phase={circlePhase[item.value] ?? 'active'}
            highlightStartedAtMs={highlightStartedAtMsByCircle[item.value]}
            interactive={!isLost && !allCleared}
            freezeVisual={isLost}
            onClick={() => handleCircleClick(item.value)}
          />
        )}
      />

      <NextHint next={nextExpected} visible={showNext} />
    </GameLayout>
  )
}

export default App
