import { Fragment } from 'react'
import type { ReactNode } from 'react'
import type { CircleItem, CirclePhase } from '../../game/types'
import { BoardCircle } from './BoardCircle'

export type GameBoardCustomProps = {
  circles: CircleItem[]
  renderCircle: (item: CircleItem) => ReactNode
}

export type GameBoardDomProps = {
  circles: CircleItem[]
  circlePhase: Record<number, CirclePhase>
  highlightStartedAtMsByCircle: Record<number, number>
  interactive: boolean
  freezeVisual: boolean
  onCircleClick: (value: number) => void
}

export type GameBoardProps = GameBoardCustomProps | GameBoardDomProps

function isDomBoardProps(p: GameBoardProps): p is GameBoardDomProps {
  return 'onCircleClick' in p && !('renderCircle' in p)
}

export function GameBoard(props: GameBoardProps) {
  const { circles } = props

  return (
    <div
      className="relative mt-2 aspect-square w-full max-w-[500px] shrink-0 border-2 border-black bg-white"
      aria-label="Game board"
    >
      {isDomBoardProps(props)
        ? circles.map((item) => (
            <BoardCircle
              key={item.value}
              item={item}
              phase={props.circlePhase[item.value] ?? 'active'}
              highlightStartedAtMs={
                props.highlightStartedAtMsByCircle[item.value]
              }
              interactive={props.interactive}
              freezeVisual={props.freezeVisual}
              onCircleClick={props.onCircleClick}
            />
          ))
        : circles.map((item) => (
            <Fragment key={item.value}>{props.renderCircle(item)}</Fragment>
          ))}
    </div>
  )
}
