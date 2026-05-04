type NextHintProps = {
  next: number
  visible?: boolean
}

export function NextHint({ next, visible = true }: NextHintProps) {
  if (!visible) return null
  return (
    <p className="m-0 mt-1">
      Next:
      {' '}
      {next}
    </p>
  )
}
