"use client"

import { CanvasInstanceView } from "@/components/workbench/canvas/canvas-instance"
import type { CanvasInstance } from "@/types/domain"

interface CanvasOverlayProps {
  instances: CanvasInstance[]
  selectedInstanceId: string | null
  isEditable: boolean
  stageElement: HTMLElement | null
  onSelect: (id: string | null) => void
  onMoveEnd: (id: string, x: number, y: number) => void
  onResizeEnd: (id: string, x: number, y: number, width: number, height: number) => void
}

export function CanvasOverlay({
  instances,
  selectedInstanceId,
  isEditable,
  stageElement,
  onSelect,
  onMoveEnd,
  onResizeEnd,
}: CanvasOverlayProps) {
  const sorted = [...instances].sort((a, b) => a.zIndex - b.zIndex)

  return (
    <div
      className="absolute inset-0 h-full w-full"
      onPointerDown={(event) => {
        if (event.target === event.currentTarget) onSelect(null)
      }}
    >
      {sorted.map((instance) => (
        <CanvasInstanceView
          key={instance.id}
          instance={instance}
          isSelected={instance.id === selectedInstanceId}
          isEditable={isEditable}
          stageElement={stageElement}
          onSelect={onSelect}
          onMoveEnd={onMoveEnd}
          onResizeEnd={onResizeEnd}
        />
      ))}
    </div>
  )
}
