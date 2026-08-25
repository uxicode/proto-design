"use client"

import type { ReactNode } from "react"
import { useStoreHydration } from "@/lib/projects/use-store-hydration"
import { useProjectStore } from "@/lib/projects/store"

interface WorkbenchGateProps {
  projectId: string
  children: ReactNode
}

export function WorkbenchGate({ projectId, children }: WorkbenchGateProps) {
  const hydrated = useStoreHydration()
  const exists = useProjectStore((state) =>
    state.projects.some((item) => item.id === projectId)
  )

  if (!hydrated) {
    return <p className="text-sm text-muted-foreground">프로젝트를 불러오는 중…</p>
  }
  if (!exists) {
    return <p className="text-sm text-muted-foreground">프로젝트를 찾을 수 없습니다.</p>
  }
  return children
}
