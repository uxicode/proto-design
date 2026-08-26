"use client"

import { createContext, useContext } from "react"
import type { CanvasInstance, CanvasSlotOverride } from "@/types/domain"

export interface CanvasEditContextValue {
  instances: CanvasInstance[]
  selectedInstanceId: string | null
  selectedSlotId: string | null
  highlightedSlotId: string | null
  isEditable: boolean
  slotOverrides: Record<string, CanvasSlotOverride>
  onSelectInstance: (id: string | null) => void
  onSelectSlot: (id: string | null) => void
  onMoveInstance: (
    id: string,
    x: number,
    y: number,
    frame: HTMLElement,
    clientX: number,
    clientY: number
  ) => void
  onResizeInstance: (
    id: string,
    x: number,
    y: number,
    width: number,
    height: number,
    frame: HTMLElement
  ) => void
  onMoveSlot: (id: string, x: number, y: number) => void
  onResizeSlot: (id: string, x: number, y: number, width: number, height: number) => void
}

const CanvasEditContext = createContext<CanvasEditContextValue | null>(null)

export const CanvasEditProvider = CanvasEditContext.Provider

export function useCanvasEdit(): CanvasEditContextValue | null {
  return useContext(CanvasEditContext)
}
