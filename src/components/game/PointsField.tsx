import { POINTS_INPUT_MAX } from '../../game/constants'

type PointsFieldProps = {
  value: string
  onChange: (value: string) => void
  disabled?: boolean
  max?: number
  id?: string
}

export function PointsField({
  value,
  onChange,
  disabled = false,
  max = POINTS_INPUT_MAX,
  id = 'game-points',
}: PointsFieldProps) {
  return (
    <label className="flex items-center gap-2" htmlFor={id}>
      <span>Points:</span>
      <input
        id={id}
        type="number"
        min={1}
        max={max}
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
        className="w-28 min-w-0 border border-black px-2 py-1 text-black disabled:cursor-not-allowed disabled:bg-gray-100"
      />
    </label>
  )
}
