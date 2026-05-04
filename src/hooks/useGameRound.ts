import {
  useCallback,
  useEffect,
  useMemo,
  useReducer,
  useRef,
} from 'react'
import {
  AUTO_PLAY_DELAY_MAX_MS,
  AUTO_PLAY_DELAY_MIN_MS,
  CLICK_DISPLAY_MS,
  FADE_OUT_MS,
  createInitialPhases,
  generateCirclePositions,
  parsePoints,
  type CircleItem,
  type CirclePhase,
  type GameRoundOutcome,
} from '../game'

export type GameRoundState = {
  points: string
  playing: boolean
  autoPlay: boolean
  circles: CircleItem[]
  circlePhase: Record<number, CirclePhase>
  highlightStartedAtMsByCircle: Record<number, number>
  nextExpected: number
  roundOutcome: GameRoundOutcome
  displayTime: number
}

export type GameRoundAction =
  | { type: 'SET_POINTS'; value: string }
  | { type: 'SESSION_FULL_RESET' }
  | {
      type: 'ROUND_BEGIN'
      items: CircleItem[]
      phases: Record<number, CirclePhase>
    }
  | { type: 'SET_AUTO_PLAY'; value: boolean }
  | { type: 'WRONG_CLICK_LOST'; target: number }
  | { type: 'CORRECT_CLICK'; target: number }
  | { type: 'CIRCLE_PHASE_FADING_IF_SUCCESS'; target: number }
  | { type: 'CIRCLE_PHASE_REMOVED'; target: number }
  | { type: 'DISPLAY_TIME_TICK'; seconds: number }

function initialGameRoundState(): GameRoundState {
  return {
    points: '5',
    playing: false,
    autoPlay: false,
    circles: [],
    circlePhase: {},
    highlightStartedAtMsByCircle: {},
    nextExpected: 1,
    roundOutcome: null,
    displayTime: 0,
  }
}

export function gameRoundReducer(
  state: GameRoundState,
  action: GameRoundAction,
): GameRoundState {
  switch (action.type) {
    case 'SET_POINTS':
      return { ...state, points: action.value }
    case 'SESSION_FULL_RESET':
      return initialGameRoundState()
    case 'ROUND_BEGIN':
      return {
        ...state,
        playing: true,
        circles: action.items,
        circlePhase: action.phases,
        highlightStartedAtMsByCircle: {},
        nextExpected: 1,
        roundOutcome: null,
        displayTime: 0,
      }
    case 'SET_AUTO_PLAY':
      return { ...state, autoPlay: action.value }
    case 'WRONG_CLICK_LOST': {
      const { target } = action
      return {
        ...state,
        autoPlay: false,
        roundOutcome: 'LOST',
        highlightStartedAtMsByCircle: {
          ...state.highlightStartedAtMsByCircle,
          [target]: Date.now(),
        },
        circlePhase: { ...state.circlePhase, [target]: 'success' },
      }
    }
    case 'CORRECT_CLICK': {
      const { target } = action
      const next = state.nextExpected + 1
      return {
        ...state,
        nextExpected: next,
        highlightStartedAtMsByCircle: {
          ...state.highlightStartedAtMsByCircle,
          [target]: Date.now(),
        },
        circlePhase: { ...state.circlePhase, [target]: 'success' },
      }
    }
    case 'CIRCLE_PHASE_FADING_IF_SUCCESS': {
      const { target } = action
      if (state.circlePhase[target] !== 'success') return state
      return {
        ...state,
        circlePhase: { ...state.circlePhase, [target]: 'fading' },
      }
    }
    case 'CIRCLE_PHASE_REMOVED':
      return {
        ...state,
        circlePhase: {
          ...state.circlePhase,
          [action.target]: 'removed',
        },
      }
    case 'DISPLAY_TIME_TICK':
      return { ...state, displayTime: action.seconds }
    default:
      return state
  }
}

function deriveAllCleared(state: GameRoundState): boolean {
  const totalCount = state.circles.length
  return (
    state.playing &&
    state.roundOutcome !== 'LOST' &&
    totalCount > 0 &&
    state.circles.every((c) => state.circlePhase[c.value] === 'removed')
  )
}

export function useGameRound() {
  const [state, dispatch] = useReducer(gameRoundReducer, undefined, initialGameRoundState)

  const stateRef = useRef(state)
  stateRef.current = state

  const startTimeRef = useRef<number | null>(null)
  const nextExpectedRef = useRef(1)

  /** Timeout fade/remove sau click đúng — không trộn với Auto Play. */
  const timeoutIdsRef = useRef<number[]>([])
  /** Chỉ lịch click tự động; tách để OFF không hủy animation vòng đã bấm. */
  const autoPlayTimeoutIdsRef = useRef<number[]>([])
  const autoPlayActiveRef = useRef(false)
  const handleCircleClickRef = useRef<(targetNumber: number) => void>(() => {})

  const clearAutoPlaySchedulers = useCallback(() => {
    autoPlayTimeoutIdsRef.current.forEach((id) => window.clearTimeout(id))
    autoPlayTimeoutIdsRef.current = []
  }, [])

  const clearSchedulers = useCallback(() => {
    timeoutIdsRef.current.forEach((id) => window.clearTimeout(id))
    timeoutIdsRef.current = []
  }, [])

  const clearAllRoundSchedulers = useCallback(() => {
    clearSchedulers()
    clearAutoPlaySchedulers()
  }, [clearSchedulers, clearAutoPlaySchedulers])

  const scheduleAfter = useCallback((ms: number, fn: () => void) => {
    const id = window.setTimeout(fn, ms)
    timeoutIdsRef.current.push(id)
  }, [])

  const resetSessionFull = useCallback(() => {
    clearAllRoundSchedulers()
    autoPlayActiveRef.current = false
    dispatch({ type: 'SESSION_FULL_RESET' })
    startTimeRef.current = null
    nextExpectedRef.current = 1
  }, [clearAllRoundSchedulers])

  const beginRound = useCallback(() => {
    clearAllRoundSchedulers()
    const points = stateRef.current.points
    const n = parsePoints(points)
    const items = generateCirclePositions(n)
    const phases = createInitialPhases(items)

    dispatch({ type: 'ROUND_BEGIN', items, phases })
    nextExpectedRef.current = 1
    startTimeRef.current = Date.now()
  }, [clearAllRoundSchedulers])

  const isLost = state.roundOutcome === 'LOST'
  const allCleared = deriveAllCleared(state)
  const totalCount = state.circles.length

  const visibleCircles = useMemo(
    () =>
      state.circles.filter((c) => state.circlePhase[c.value] !== 'removed'),
    [state.circles, state.circlePhase],
  )

  const showNext =
    state.playing &&
    !isLost &&
    !allCleared &&
    totalCount > 0 &&
    state.nextExpected <= totalCount

  autoPlayActiveRef.current = state.autoPlay

  useEffect(() => {
    nextExpectedRef.current = state.nextExpected
  }, [state.nextExpected])

  useEffect(() => {
    return () => {
      clearSchedulers()
      clearAutoPlaySchedulers()
    }
  }, [clearSchedulers, clearAutoPlaySchedulers])

  useEffect(() => {
    if (
      !state.playing ||
      startTimeRef.current === null ||
      isLost ||
      allCleared
    )
      return

    const tick = () => {
      dispatch({
        type: 'DISPLAY_TIME_TICK',
        seconds: (Date.now() - startTimeRef.current!) / 1000,
      })
    }

    tick()
    const id = window.setInterval(tick, 100)
    return () => window.clearInterval(id)
  }, [state.playing, isLost, allCleared])

  useEffect(() => {
    if (!state.autoPlay || !state.playing || isLost || allCleared) return

    const total = state.circles.length
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
  }, [
    state.autoPlay,
    state.playing,
    isLost,
    allCleared,
    state.nextExpected,
    state.circles.length,
  ])

  const setPoints = useCallback((value: string) => {
    if (stateRef.current.playing) return
    dispatch({ type: 'SET_POINTS', value })
  }, [])

  const toggleAutoPlay = useCallback(() => {
    if (stateRef.current.autoPlay) {
      clearAutoPlaySchedulers()
      autoPlayActiveRef.current = false
      dispatch({ type: 'SET_AUTO_PLAY', value: false })
      return
    }
    dispatch({ type: 'SET_AUTO_PLAY', value: true })
  }, [clearAutoPlaySchedulers])

  /**
   * Đúng: highlight + lịch fade/remove.
   * Sai thứ tự: LOST, hủy mọi timeout (giữ phase success/fading hiện tại), tắt Auto Play, khóa board.
   */
  const handleCircleClick = useCallback(
    (targetNumber: number) => {
      const s = stateRef.current
      if (s.roundOutcome === 'LOST' || deriveAllCleared(s)) return

      if (s.circlePhase[targetNumber] !== 'active') return

      if (targetNumber !== s.nextExpected) {
        clearAllRoundSchedulers()
        dispatch({ type: 'WRONG_CLICK_LOST', target: targetNumber })
        return
      }

      dispatch({ type: 'CORRECT_CLICK', target: targetNumber })

      scheduleAfter(CLICK_DISPLAY_MS, () => {
        dispatch({
          type: 'CIRCLE_PHASE_FADING_IF_SUCCESS',
          target: targetNumber,
        })
        scheduleAfter(FADE_OUT_MS, () => {
          dispatch({
            type: 'CIRCLE_PHASE_REMOVED',
            target: targetNumber,
          })
        })
      })
    },
    [clearAllRoundSchedulers, scheduleAfter],
  )

  handleCircleClickRef.current = handleCircleClick

  return {
    state,
    setPoints,
    beginRound,
    resetSessionFull,
    toggleAutoPlay,
    handleCircleClick,
    visibleCircles,
    isLost,
    allCleared,
    showNext,
  }
}
