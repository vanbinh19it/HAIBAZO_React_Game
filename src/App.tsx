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
  generateNonOverlappingPositions,
  parsePoints,
  type CircleItem,
  type CirclePhase,
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
  /** Mốc `Date.now()` khi click đúng từng vòng — để đếm real-time trên BoardCircle. */
  const [highlightStartedAtMsByCircle, setHighlightStartedAtMsByCircle] =
    useState<Record<number, number>>({})
  const [nextExpected, setNextExpected] = useState(1)
  const [gameOver, setGameOver] = useState(false)

  const [displayTime, setDisplayTime] = useState(0)
  const startTimeRef = useRef<number | null>(null)
  const nextExpectedRef = useRef(1)
  const circlePhaseRef = useRef<Record<number, CirclePhase>>({})
  const timeoutIdsRef = useRef<number[]>([])
  const handleCircleClickRef = useRef<(value: number) => void>(() => {})

  circlePhaseRef.current = circlePhase

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
    !gameOver &&
    totalCount > 0 &&
    circles.every((c) => circlePhase[c.value] === 'removed')

  const showNext =
    playing &&
    !gameOver &&
    !allCleared &&
    totalCount > 0 &&
    nextExpected <= totalCount

  useEffect(() => {
    nextExpectedRef.current = nextExpected
  }, [nextExpected])

  useEffect(() => {
    return () => clearSchedulers()
  }, [])

  useEffect(() => {
    if (!playing || startTimeRef.current === null || gameOver || allCleared) return

    const tick = () => {
      setDisplayTime((Date.now() - startTimeRef.current!) / 1000)
    }

    tick()
    const id = window.setInterval(tick, 100)
    return () => window.clearInterval(id)
  }, [playing, gameOver, allCleared])

  useEffect(() => {
    if (!autoPlay || !playing || gameOver || allCleared) return

    const total = circles.length
    if (total === 0) return

    const valueToClick = nextExpectedRef.current
    if (valueToClick < 1 || valueToClick > total) return

    const span = AUTO_PLAY_DELAY_MAX_MS - AUTO_PLAY_DELAY_MIN_MS
    const delay = AUTO_PLAY_DELAY_MIN_MS + Math.random() * span

    const id = window.setTimeout(() => {
      handleCircleClickRef.current(valueToClick)
    }, delay)
    timeoutIdsRef.current.push(id)

    return () => {
      window.clearTimeout(id)
      timeoutIdsRef.current = timeoutIdsRef.current.filter((x) => x !== id)
    }
  }, [autoPlay, playing, gameOver, allCleared, nextExpected, circles.length])

  const startRound = () => {
    clearSchedulers()
    const n = parsePoints(points)
    const items = generateNonOverlappingPositions(n)
    const phases = createInitialPhases(items)

    setCircles(items)
    setCirclePhase(phases)
    setHighlightStartedAtMsByCircle({})
    setNextExpected(1)
    nextExpectedRef.current = 1
    setGameOver(false)
    startTimeRef.current = Date.now()
    setDisplayTime(0)
    setPlaying(true)
  }

  const handleCircleClick = (value: number) => {
    if (gameOver || allCleared) return
    if (circlePhaseRef.current[value] !== 'active') return

    if (value !== nextExpectedRef.current) {
      setGameOver(true)
      return
    }

    const now = Date.now()
    setHighlightStartedAtMsByCircle((prev) => ({ ...prev, [value]: now }))
    setNextExpected((n) => {
      const next = n + 1
      nextExpectedRef.current = next
      return next
    })
    setCirclePhase((p) => ({ ...p, [value]: 'success' }))

    scheduleAfter(CLICK_DISPLAY_MS, () => {
      setCirclePhase((p) =>
        p[value] === 'success' ? { ...p, [value]: 'fading' } : p,
      )
      scheduleAfter(FADE_OUT_MS, () => {
        setCirclePhase((p) => ({ ...p, [value]: 'removed' }))
      })
    })
  }

  handleCircleClickRef.current = handleCircleClick

  const titleText = gameOver
    ? 'GAME OVER'
    : allCleared
      ? 'ALL CLEARED'
      : "LET'S PLAY"

  const titleClassName = gameOver
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
        allCleared={allCleared}
        autoPlay={autoPlay}
        onPlay={startRound}
        onRestart={startRound}
        onToggleAutoPlay={() => setAutoPlay((v) => !v)}
      />

      <GameBoard
        circles={visibleCircles}
        renderCircle={(item) => (
          <BoardCircle
            item={item}
            phase={circlePhase[item.value] ?? 'active'}
            highlightStartedAtMs={highlightStartedAtMsByCircle[item.value]}
            interactive={!gameOver && !allCleared}
            onClick={() => handleCircleClick(item.value)}
          />
        )}
      />

      <NextHint next={nextExpected} visible={showNext} />
    </GameLayout>
  )
}

export default App
