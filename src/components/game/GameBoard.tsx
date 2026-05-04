import { Fragment } from 'react'
import type { ReactNode } from 'react'
import type { CircleItem } from '../../game/types'
import { BoardCircle } from './BoardCircle'

type GameBoardProps = {
  circles: CircleItem[]
  /** Cho phép thay renderer từng ô (mở rộng animation / interaction). */
  renderCircle?: (item: CircleItem) => ReactNode
}

export function GameBoard({ circles, renderCircle }: GameBoardProps) {
  return (
    <div
      className="relative mt-2 aspect-square w-full max-w-[500px] shrink-0 border-2 border-black bg-white"
      aria-label="Game board"
    >
      {circles.map((item) => (
        <Fragment key={item.value}>
          {renderCircle ? renderCircle(item) : <BoardCircle item={item} />}
        </Fragment>
      ))}
    </div>
  )
}
