"use client"

import { useRef, useState, type PointerEvent } from "react"
import { CanvasInstancePreview } from "@/components/workbench/canvas/instance-renderers"
import { CanvasResizeHandles } from "@/components/workbench/canvas/canvas-resize-handles"
import { MIN_BOX } from "@/lib/canvas/defaults"
import {
  clampToFrame,
  clientToLogical,
  resizeRect,
  type Box,
  type ResizeHandle,
} from "@/lib/canvas/geometry"
import { cn } from "@/lib/utils"
import type { CanvasInstance } from "@/types/domain"

interface CanvasInstanceViewProps {
  instance: CanvasInstance
  isSelected: boolean
  isEditable: boolean
  stageElement: HTMLElement | null
  onSelect: (id: string) => void
  onMoveEnd: (id: string, x: number, y: number, clientX: number, clientY: number) => void
  onResizeEnd: (id: string, x: number, y: number, width: number, height: number) => void
}

type Gesture =
  | { kind: "move"; pointerX: number; pointerY: number; x: number; y: number }
  | { kind: "resize"; handle: ResizeHandle; pointerX: number; pointerY: number; box: Box }

export function CanvasInstanceView({
  instance,
  isSelected,
  isEditable,
  stageElement,
  onSelect,
  onMoveEnd,
  onResizeEnd,
}: CanvasInstanceViewProps) {
  const wrapperRef = useRef<HTMLDivElement>(null)
  const gestureRef = useRef<Gesture | null>(null)
  const liveRef = useRef<Box | null>(null)
  const [live, setLive] = useState<Box | null>(null)

  const box: Box = live ?? {
    x: instance.x,
    y: instance.y,
    width: instance.width,
    height: instance.height,
  }

  function commitLive(next: Box | null): void {
    liveRef.current = next
    setLive(next)
  }

  function stageSize(): { width: number; height: number; rect: DOMRect } | null {
    if (!stageElement) return null
    return {
      width: stageElement.clientWidth,
      height: stageElement.clientHeight,
      rect: stageElement.getBoundingClientRect(),
    }
  }

  function logicalPoint(event: PointerEvent<HTMLElement>) {
    const stage = stageSize()
    if (!stage) return null
    return clientToLogical(event.clientX, event.clientY, stage.rect, stage.width, stage.height)
  }

  function beginGesture(event: PointerEvent<HTMLElement>, next: Gesture): void {
    gestureRef.current = next
    commitLive({
      x: instance.x,
      y: instance.y,
      width: instance.width,
      height: instance.height,
    })
    wrapperRef.current?.setPointerCapture(event.pointerId)
  }

  function handlePointerDown(event: PointerEvent<HTMLDivElement>): void {
    if ((event.target as HTMLElement).closest("[data-resize-handle]")) return
    event.stopPropagation()
    onSelect(instance.id)
    if (!isEditable) return
    const logical = logicalPoint(event)
    if (!logical) return
    beginGesture(event, {
      kind: "move",
      pointerX: logical.x,
      pointerY: logical.y,
      x: instance.x,
      y: instance.y,
    })
  }

  function handleResizeStart(event: PointerEvent<HTMLDivElement>, handle: ResizeHandle): void {
    onSelect(instance.id)
    if (!isEditable) return
    const logical = logicalPoint(event)
    if (!logical) return
    beginGesture(event, {
      kind: "resize",
      handle,
      pointerX: logical.x,
      pointerY: logical.y,
      box: {
        x: instance.x,
        y: instance.y,
        width: instance.width,
        height: instance.height,
      },
    })
  }

  function handlePointerMove(event: PointerEvent<HTMLDivElement>): void {
    const gesture = gestureRef.current
    if (!gesture) return
    const stage = stageSize()
    const logical = logicalPoint(event)
    if (!stage || !logical) return
    if (gesture.kind === "move") {
      const next = clampToFrame(
        gesture.x + (logical.x - gesture.pointerX),
        gesture.y + (logical.y - gesture.pointerY),
        instance.width,
        instance.height,
        stage.width,
        stage.height
      )
      commitLive({
        x: next.x,
        y: next.y,
        width: instance.width,
        height: instance.height,
      })
      return
    }
    const min = MIN_BOX[instance.type]
    commitLive(
      resizeRect(
        gesture.box,
        gesture.handle,
        logical.x - gesture.pointerX,
        logical.y - gesture.pointerY,
        min.width,
        min.height,
        stage.width,
        stage.height
      )
    )
  }

  function handlePointerUp(event: PointerEvent<HTMLDivElement>): void {
    const gesture = gestureRef.current
    if (!gesture) return
    const next = liveRef.current ?? {
      x: instance.x,
      y: instance.y,
      width: instance.width,
      height: instance.height,
    }
    gestureRef.current = null
    commitLive(null)
    if (wrapperRef.current?.hasPointerCapture(event.pointerId)) {
      wrapperRef.current.releasePointerCapture(event.pointerId)
    }
    if (gesture.kind === "move") {
      onMoveEnd(instance.id, next.x, next.y, event.clientX, event.clientY)
      return
    }
    onResizeEnd(instance.id, next.x, next.y, next.width, next.height)
  }

  return (
    <div
      ref={wrapperRef}
      role="button"
      tabIndex={0}
      aria-selected={isSelected}
      data-canvas-instance={instance.id}
      className={cn(
        "pointer-events-auto absolute cursor-grab touch-none rounded-sm",
        isSelected && "ring-2 ring-primary ring-offset-2",
        !isEditable && "cursor-default"
      )}
      style={{
        left: box.x,
        top: box.y,
        width: box.width,
        height: box.height,
        zIndex: instance.zIndex,
      }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault()
          onSelect(instance.id)
        }
      }}
    >
      <div className="pointer-events-none flex h-full w-full overflow-hidden [&>*]:!h-full [&>*]:!w-full">
        <CanvasInstancePreview instance={instance} />
      </div>
      {isSelected && isEditable ? (
        <CanvasResizeHandles onResizeStart={handleResizeStart} />
      ) : null}
      <span className="sr-only">{isSelected ? "선택됨" : "선택되지 않음"}</span>
    </div>
  )
}
