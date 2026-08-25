import type { ReactNode } from "react"

interface CandidateGridProps {
  children: ReactNode
  columns?: 2 | 3
}

export function CandidateGrid({ children, columns = 3 }: CandidateGridProps) {
  return (
    <div
      className={
        columns === 2
          ? "grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
          : "grid gap-4 md:grid-cols-3"
      }
    >
      {children}
    </div>
  )
}
