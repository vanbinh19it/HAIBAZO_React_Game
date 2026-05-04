type PlayControlsProps = {
  playing: boolean
  /** Khi đã xóa hết đúng thứ tự: chỉ hiện Restart (Bước 4). */
  allCleared?: boolean
  autoPlay: boolean
  onPlay: () => void
  onRestart: () => void
  onToggleAutoPlay: () => void
}

const btnClass =
  'rounded-sm border border-black bg-gray-200 px-4 py-1 text-black hover:bg-gray-300'

export function PlayControls({
  playing,
  allCleared = false,
  autoPlay,
  onPlay,
  onRestart,
  onToggleAutoPlay,
}: PlayControlsProps) {
  if (!playing) {
    return (
      <button type="button" onClick={onPlay} className={btnClass}>
        Play
      </button>
    )
  }

  if (allCleared) {
    return (
      <button type="button" onClick={onRestart} className={btnClass}>
        Restart
      </button>
    )
  }

  return (
    <div className="flex flex-wrap gap-2">
      <button type="button" onClick={onRestart} className={btnClass}>
        Restart
      </button>
      <button type="button" onClick={onToggleAutoPlay} className={btnClass}>
        {autoPlay ? 'Auto Play ON' : 'Auto Play OFF'}
      </button>
    </div>
  )
}
