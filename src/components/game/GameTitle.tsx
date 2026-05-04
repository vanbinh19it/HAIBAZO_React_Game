import type { ReactNode } from 'react'

type GameTitleProps = {
  children: ReactNode
  /** Mở rộng: GAME OVER / ALL CLEARED — đổi màu qua className */
  className?: string
}

export function GameTitle({ children, className = '' }: GameTitleProps) {
  return (
    <h1
      className={`text-xl font-bold uppercase tracking-wide ${className}`.trim()}
    >
      {children}
    </h1>
  )
}
