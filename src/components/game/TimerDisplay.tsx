type TimerDisplayProps = {
  seconds: number
}

export function TimerDisplay({ seconds }: TimerDisplayProps) {
  return (
    <p className="m-0">Time: {seconds.toFixed(1)}s</p>
  )
}
