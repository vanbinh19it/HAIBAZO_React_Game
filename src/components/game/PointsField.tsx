type PointsFieldProps = {
  value: string
  onChange: (value: string) => void
  disabled?: boolean
  id?: string
}

export function PointsField({
  value,
  onChange,
  disabled = false,
  id = 'game-points',
}: PointsFieldProps) {
  return (
    <label className="flex items-center gap-2" htmlFor={id}>
      <span>Points:</span>
      <input
        id={id}
        type="number"
        min={1}
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
        className="w-20 border border-black px-2 py-1 text-black disabled:cursor-not-allowed disabled:bg-gray-100"
      />
    </label>
  )
}
