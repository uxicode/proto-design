"use client"

import type { DragEvent } from "react"
import { Button } from "@/components/ui/button"
import { CanvasInstancePreview } from "@/components/workbench/canvas/instance-renderers"
import { defaultPropsForType } from "@/lib/canvas/defaults"
import { CANVAS_DND_MIME } from "@/lib/canvas/shadcn-catalog"
import type { CanvasComponentType } from "@/types/domain"

interface PaletteItemProps {
  type: CanvasComponentType
  label: string
  disabled: boolean
  onApply: (type: CanvasComponentType) => void
}

export function PaletteItem({ type, label, disabled, onApply }: PaletteItemProps) {
  function handleDragStart(event: DragEvent<HTMLDivElement>): void {
    if (disabled) {
      event.preventDefault()
      return
    }
    event.dataTransfer.setData(CANVAS_DND_MIME, type)
    event.dataTransfer.setData("text/plain", type)
    event.dataTransfer.effectAllowed = "copy"
  }

  return (
    <div
      className="flex items-center gap-2 rounded-md border border-border bg-background p-2"
      draggable={!disabled}
      onDragStart={handleDragStart}
      data-palette-type={type}
    >
      <div className="min-w-0 flex-1 space-y-1">
        <p className="text-xs font-medium">{label}</p>
        <div className="pointer-events-none max-h-10 overflow-hidden opacity-90 [&>*]:origin-left [&>*]:scale-[0.72]">
          <CanvasInstancePreview instance={{ type, props: defaultPropsForType(type, "solid") }} />
        </div>
      </div>
      <Button
        type="button"
        size="sm"
        variant="secondary"
        disabled={disabled}
        onClick={() => onApply(type)}
      >
        적용
      </Button>
    </div>
  )
}
