"use client"

import type { PointerEvent } from "react"
import { cn } from "@/lib/utils"
import type { ResizeHandle } from "@/lib/canvas/geometry"

interface HandleSpec {
  handle: ResizeHandle
  label: string
  className: string
  cursor: string
}

const HANDLES: HandleSpec[] = [
  {
    handle: "nw",
    label: "왼쪽 위 크기 조절",
    className: "left-0 top-0 -translate-x-1/2 -translate-y-1/2",
    cursor: "nwse-resize",
  },
  {
    handle: "n",
    label: "위쪽 높이 조절",
    className: "left-1/2 top-0 -translate-x-1/2 -translate-y-1/2",
    cursor: "ns-resize",
  },
  {
    handle: "ne",
    label: "오른쪽 위 크기 조절",
    className: "right-0 top-0 translate-x-1/2 -translate-y-1/2",
    cursor: "nesw-resize",
  },
  {
    handle: "e",
    label: "오른쪽 너비 조절",
    className: "right-0 top-1/2 translate-x-1/2 -translate-y-1/2",
    cursor: "ew-resize",
  },
  {
    handle: "se",
    label: "오른쪽 아래 크기 조절",
    className: "right-0 bottom-0 translate-x-1/2 translate-y-1/2",
    cursor: "nwse-resize",
  },
  {
    handle: "s",
    label: "아래쪽 높이 조절",
    className: "left-1/2 bottom-0 -translate-x-1/2 translate-y-1/2",
    cursor: "ns-resize",
  },
  {
    handle: "sw",
    label: "왼쪽 아래 크기 조절",
    className: "left-0 bottom-0 -translate-x-1/2 translate-y-1/2",
    cursor: "nesw-resize",
  },
  {
    handle: "w",
    label: "왼쪽 너비 조절",
    className: "left-0 top-1/2 -translate-x-1/2 -translate-y-1/2",
    cursor: "ew-resize",
  },
]

interface CanvasResizeHandlesProps {
  onResizeStart: (event: PointerEvent<HTMLDivElement>, handle: ResizeHandle) => void
}

export function CanvasResizeHandles({ onResizeStart }: CanvasResizeHandlesProps) {
  return (
    <>
      {HANDLES.map((item) => (
        <div
          key={item.handle}
          data-resize-handle={item.handle}
          className={cn(
            "absolute z-20 flex h-4 w-4 touch-none items-center justify-center",
            item.className
          )}
          style={{ cursor: item.cursor }}
          title={item.label}
          onPointerDown={(event) => {
            event.stopPropagation()
            event.preventDefault()
            onResizeStart(event, item.handle)
          }}
        >
          <span className="h-2.5 w-2.5 rounded-[2px] border-2 border-primary bg-background shadow-sm" />
        </div>
      ))}
    </>
  )
}
