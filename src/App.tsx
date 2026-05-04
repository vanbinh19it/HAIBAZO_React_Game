import {
  GameBoard,
  GameLayout,
  GameTitle,
  NextHint,
  PlayControls,
  PointsField,
  ResetGame,
  TimerDisplay,
} from './components/game'
import { useGameRound } from './hooks/useGameRound'

function App() {
  const {
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
  } = useGameRound()

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

  const boardInteractive = !isLost && !allCleared

  return (
    <GameLayout>
      <GameTitle className={titleClassName}>{titleText}</GameTitle>

      <PointsField
        value={state.points}
        onChange={setPoints}
        disabled={state.playing}
      />

      <TimerDisplay seconds={state.displayTime} />

      <PlayControls
        playing={state.playing}
        onlyRestart={allCleared || isLost}
        autoPlay={state.autoPlay}
        onPlay={beginRound}
        onRestart={beginRound}
        onToggleAutoPlay={toggleAutoPlay}
      />

      <ResetGame onReset={resetSessionFull} />

      <GameBoard
        circles={visibleCircles}
        circlePhase={state.circlePhase}
        highlightStartedAtMsByCircle={state.highlightStartedAtMsByCircle}
        interactive={boardInteractive}
        freezeVisual={isLost}
        onCircleClick={handleCircleClick}
      />

      <NextHint next={state.nextExpected} visible={showNext} />
    </GameLayout>
  )
}

export default App
