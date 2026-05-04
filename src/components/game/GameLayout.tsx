import type { ReactNode } from 'react'

type GameLayoutProps = {
  children: ReactNode
  className?: string
}

/**
 * Khung căn giữa màn hình cho toàn bộ game — có thể bọc thêm theme/layout sau.
 */
export function GameLayout({ children, className = '' }: GameLayoutProps) {
  return (
    <div
      className={`flex min-h-[100svh] flex-col items-center justify-center bg-white px-4 py-8 font-sans text-black ${className}`}
    >
      <div className="flex w-full max-w-[520px] flex-col items-start gap-3">
        {children}
      </div>
    </div>
  )
}
