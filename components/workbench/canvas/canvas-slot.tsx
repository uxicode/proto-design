"use client"

import { useEffect, useRef, useState, type PointerEvent, type ReactNode } from "react"
import { CanvasInstanceView } from "@/components/workbench/canvas/canvas-instance"
import { CanvasResizeHandles } from "@/components/workbench/canvas/canvas-resize-handles"
import { useCanvasEdit } from "@/components/workbench/canvas/canvas-edit-context"
import {
  CANVAS_PART_MIN_HEIGHT,
  CANVAS_PART_MIN_WIDTH,
  CANVAS_REGION_MIN_HEIGHT,
  CANVAS_REGION_MIN_WIDTH,
  CANVAS_SLOT_ATTR,
  CANVAS_SLOT_KIND_ATTR,
  slotHasExplicitSize,
  slotOverrideStyle,
} from "@/lib/canvas/slots"
import { resizeRect, type Box, type ResizeHandle } from "@/lib/canvas/geometry"
import { cn } from "@/lib/utils"

interface CanvasSlotProps {
  id: string
  label: string
  className?: string
  interactive?: boolean
  kind?: "region" | "part"
  children: ReactNode
}

type Gesture =
  | { kind: "move"; pointerId: number; pointerX: number; pointerY: number; x: number; y: number }
  | { kind: "resize"; pointerId: number; handle: ResizeHandle; pointerX: number; pointerY: number; box: Box }

export function CanvasSlot({
  id,
  label,
  className,
  interactive = true,
  kind = "region",
  children,
}: CanvasSlotProps) {
  const edit = useCanvasEdit()
  const wrapperRef = useRef<HTMLDivElement | null>(null)
  const [slotElement, setSlotElement] = useState<HTMLDivElement | null>(null)
  const gestureRef = useRef<Gesture | null>(null)
  const liveRef = useRef<{ x: number; y: number; width: number | null; height: number | null } | null>(
    null
  )
  const [live, setLive] = useState<{
    x: number
    y: number
    width: number | null
    height: number | null
  } | null>(null)

  const override = live ?? edit?.slotOverrides[id] ?? null
  const isSelected = edit?.selectedSlotId === id
  const isHighlighted = edit?.highlightedSlotId === id
  const hasSize = slotHasExplicitSize(override)
  const nested = (edit?.instances ?? []).filter((item) => item.parentSlotId === id)

  const minWidth = kind === "part" ? CANVAS_PART_MIN_WIDTH : CANVAS_REGION_MIN_WIDTH
  const minHeight = kind === "part" ? CANVAS_PART_MIN_HEIGHT : CANVAS_REGION_MIN_HEIGHT

  function commitLive(
    next: { x: number; y: number; width: number | null; height: number | null } | null
  ): void {
    liveRef.current = next
    setLive(next)
  }

  function measuredBox(): Box {
    const node = wrapperRef.current
    const current = override
    return {
      x: current?.x ?? 0,
      y: current?.y ?? 0,
      width: current?.width ?? node?.offsetWidth ?? 120,
      height: current?.height ?? node?.offsetHeight ?? 48,
    }
  }

  function isResizeHandle(target: EventTarget | null): boolean {
    return target instanceof Element && Boolean(target.closest("[data-resize-handle]"))
  }

  function beginMove(event: PointerEvent<HTMLDivElement>): void {
    if (!edit?.isEditable) return
    const box = measuredBox()
    gestureRef.current = {
      kind: "move",
      pointerId: event.pointerId,
      pointerX: event.clientX,
      pointerY: event.clientY,
      x: box.x,
      y: box.y,
    }
    commitLive({
      x: box.x,
      y: box.y,
      width: override?.width ?? null,
      height: override?.height ?? null,
    })
    wrapperRef.current?.setPointerCapture(event.pointerId)
  }

  function handlePointerDown(event: PointerEvent<HTMLDivElement>): void {
    if (!edit?.isEditable || !interactive) return
    if ((event.target as HTMLElement).closest("[data-canvas-instance]")) return
    if (isResizeHandle(event.target)) return
    const nestedSlot = (event.target as HTMLElement).closest(`[${CANVAS_SLOT_ATTR}]`)
    if (nestedSlot && nestedSlot !== event.currentTarget) return
    event.stopPropagation()
    edit.onSelectSlot(id)
    beginMove(event)
  }

  function handleResizeStart(event: PointerEvent<HTMLDivElement>, handle: ResizeHandle): void {
    if (!edit?.isEditable) return
    event.stopPropagation()
    event.preventDefault()
    edit.onSelectSlot(id)
    const box = measuredBox()
    gestureRef.current = {
      kind: "resize",
      pointerId: event.pointerId,
      handle,
      pointerX: event.clientX,
      pointerY: event.clientY,
      box,
    }
    commitLive({ x: box.x, y: box.y, width: box.width, height: box.height })
    wrapperRef.current?.setPointerCapture(event.pointerId)
  }

  function applyPointerMove(event: { pointerId: number; clientX: number; clientY: number }): void {
    const gesture = gestureRef.current
    if (!gesture || gesture.pointerId !== event.pointerId) return
    if (gesture.kind === "move") {
      commitLive({
        x: gesture.x + (event.clientX - gesture.pointerX),
        y: gesture.y + (event.clientY - gesture.pointerY),
        width: liveRef.current?.width ?? override?.width ?? null,
        height: liveRef.current?.height ?? override?.height ?? null,
      })
      return
    }
    const next = resizeRect(
      gesture.box,
      gesture.handle,
      event.clientX - gesture.pointerX,
      event.clientY - gesture.pointerY,
      minWidth,
      minHeight,
      4000,
      4000
    )
    commitLive({ x: next.x, y: next.y, width: next.width, height: next.height })
  }

  function finishPointer(event: { pointerId: number }): void {
    const gesture = gestureRef.current
    if (!gesture || !edit || gesture.pointerId !== event.pointerId) return
    const next = liveRef.current ?? measuredBox()
    gestureRef.current = null
    commitLive(null)
    if (wrapperRef.current?.hasPointerCapture(gesture.pointerId)) {
      wrapperRef.current.releasePointerCapture(gesture.pointerId)
    }
    if (gesture.kind === "move") {
      edit.onMoveSlot(id, next.x, next.y)
      return
    }
    edit.onResizeSlot(id, next.x, next.y, next.width ?? minWidth, next.height ?? minHeight)
  }

  const applyPointerMoveRef = useRef(applyPointerMove)
  const finishPointerRef = useRef(finishPointer)
  applyPointerMoveRef.current = applyPointerMove
  finishPointerRef.current = finishPointer

  useEffect(() => {
    function handleWindowMove(event: globalThis.PointerEvent): void {
      applyPointerMoveRef.current(event)
    }
    function handleWindowUp(event: globalThis.PointerEvent): void {
      finishPointerRef.current(event)
    }
    window.addEventListener("pointermove", handleWindowMove)
    window.addEventListener("pointerup", handleWindowUp)
    window.addEventListener("pointercancel", handleWindowUp)
    return () => {
      window.removeEventListener("pointermove", handleWindowMove)
      window.removeEventListener("pointerup", handleWindowUp)
      window.removeEventListener("pointercancel", handleWindowUp)
    }
  }, [])

  return (
    <div
      ref={(node) => {
        wrapperRef.current = node
        setSlotElement(node)
      }}
      {...{ [CANVAS_SLOT_ATTR]: id, [CANVAS_SLOT_KIND_ATTR]: kind }}
      data-canvas-slot-label={label}
      className={cn(
        "relative min-h-0 min-w-0 touch-none",
        isSelected && "z-20 ring-2 ring-primary ring-offset-2",
        isHighlighted && !isSelected && "ring-2 ring-primary/50",
        hasSize &&
          "[&>:not([data-slot-chrome]):not([data-canvas-instance])]:h-full [&>:not([data-slot-chrome]):not([data-canvas-instance])]:min-h-0 [&>:not([data-slot-chrome]):not([data-canvas-instance])]:min-w-0 [&>:not([data-slot-chrome]):not([data-canvas-instance])]:overflow-hidden [&>:not([data-slot-chrome]):not([data-canvas-instance])]:w-full",
        className
      )}
      style={slotOverrideStyle(override)}
      onPointerDown={handlePointerDown}
    >
      {children}
      {nested.map((instance) => (
        <CanvasInstanceView
          key={instance.id}
          instance={instance}
          isSelected={instance.id === edit?.selectedInstanceId}
          isEditable={Boolean(edit?.isEditable)}
          stageElement={slotElement}
          onSelect={(instanceId) => edit?.onSelectInstance(instanceId)}
          onMoveEnd={(instanceId, x, y, clientX, clientY) => {
            if (!wrapperRef.current) return
            edit?.onMoveInstance(instanceId, x, y, wrapperRef.current, clientX, clientY)
          }}
          onResizeEnd={(instanceId, x, y, width, height) => {
            if (!wrapperRef.current) return
            edit?.onResizeInstance(instanceId, x, y, width, height, wrapperRef.current)
          }}
        />
      ))}
      {isSelected && interactive && edit?.isEditable ? (
        <div data-slot-chrome className="contents">
          <CanvasResizeHandles onResizeStart={handleResizeStart} />
        </div>
      ) : null}
    </div>
  )
}
