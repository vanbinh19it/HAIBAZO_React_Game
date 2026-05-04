
type ResetGameProps = {
  onReset: () => void
}

export function ResetGame({ onReset }: ResetGameProps) {
  return (
    <button
      type="button"
      onClick={onReset}
      className="rounded-md bg-red-500 px-4 py-2 text-white hover:bg-red-600"
    >
      Reset Game
    </button>
  )
}