"use client"

import { useEffect, useState } from "react"
import { useProjectStore } from "@/lib/projects/store"

export function useStoreHydration(): boolean {
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    const unsub = useProjectStore.persist.onFinishHydration(() => {
      setHydrated(true)
    })
    setHydrated(useProjectStore.persist.hasHydrated())
    return unsub
  }, [])

  return hydrated
}
