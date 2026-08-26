"use client"

import { useCallback, useMemo, useState, type DragEvent } from "react"
import { PrototypeScreen } from "@/components/workbench/prototype-screen"
import { CanvasOverlay } from "@/components/workbench/canvas/canvas-overlay"
import { CanvasEditProvider } from "@/components/workbench/canvas/canvas-edit-context"
import { canvasThemeStyle } from "@/lib/canvas/theme"
import {
  centerOrigin,
  clientToLogical,
  isPointInsideCanvas,
  originFromDropCenter,
} from "@/lib/canvas/geometry"
import { defaultBoxForType, defaultPropsForType } from "@/lib/canvas/defaults"
import { isCanvasComponentType, CANVAS_DND_MIME } from "@/lib/canvas/shadcn-catalog"
import { findSlotAtPoint } from "@/lib/canvas/slots"
import { resolveKitKind, kitRadius, paletteFromSwatches } from "@/lib/ai/preview-theme"
import { getDisplayArtifact } from "@/lib/canvas/guards"
import { useProjectStore } from "@/lib/projects/store"
import type { CanvasComponentType, CanvasInstance, Project } from "@/types/domain"

interface CanvasStageProps {
  project: Project
  instances: CanvasInstance[]
  selectedInstanceId: string | null
  isEditable: boolean
  onSelect: (id: string | null) => void
  onDropType: (
    type: CanvasComponentType,
    x: number,
    y: number,
    parentSlotId: string | null,
    frameWidth: number,
    frameHeight: number
  ) => void
  onMoveEnd: (
    id: string,
    x: number,
    y: number,
    frameWidth: number,
    frameHeight: number,
    parentSlotId?: string | null
  ) => void
  onResizeEnd: (
    id: string,
    x: number,
    y: number,
    width: number,
    height: number,
    frameWidth: number,
    frameHeight: number
  ) => void
  onStageReady?: (element: HTMLDivElement | null) => void
}

export function CanvasStage({
  project,
  instances,
  selectedInstanceId,
  isEditable,
  onSelect,
  onDropType,
  onMoveEnd,
  onResizeEnd,
  onStageReady,
}: CanvasStageProps) {
  const [stageElement, setStageElement] = useState<HTMLDivElement | null>(null)
  const [highlightedSlotId, setHighlightedSlotId] = useState<string | null>(null)
  const selectedSlotId = useProjectStore((state) => state.selectedSlotId)
  const selectSlot = useProjectStore((state) => state.selectSlot)
  const updateSlot = useProjectStore((state) => state.updateSlot)
  const palette = getDisplayArtifact(project.palettes)
  const componentSet = getDisplayArtifact(project.componentSets)
  const colors = paletteFromSwatches(palette?.swatches)
  const kit = resolveKitKind({
    title: componentSet?.title,
    items: componentSet?.items,
  })
  const theme = canvasThemeStyle(colors, kitRadius(kit))

  const setStageRef = useCallback(
    (node: HTMLDivElement | null) => {
      setStageElement(node)
      onStageReady?.(node)
    },
    [onStageReady]
  )

  const editValue = useMemo(
    () => ({
      instances,
      selectedInstanceId,
      selectedSlotId,
      highlightedSlotId,
      isEditable,
      slotOverrides: project.canvasSlots ?? {},
      onSelectInstance: onSelect,
      onSelectSlot: selectSlot,
      onMoveInstance: (
        id: string,
        x: number,
        y: number,
        frame: HTMLElement,
        clientX: number,
        clientY: number
      ) => {
        const hit = findSlotAtPoint(clientX, clientY)
        if (hit && hit.element !== frame) {
          const logical = clientToLogical(
            clientX,
            clientY,
            hit.element.getBoundingClientRect(),
            hit.element.clientWidth,
            hit.element.clientHeight
          )
          if (!logical) return
          const instance = instances.find((item) => item.id === id)
          if (!instance) return
          const origin = originFromDropCenter(logical.x, logical.y, instance.width, instance.height)
          onMoveEnd(
            id,
            origin.x,
            origin.y,
            hit.element.clientWidth,
            hit.element.clientHeight,
            hit.id
          )
          return
        }
        onMoveEnd(id, x, y, frame.clientWidth, frame.clientHeight)
      },
      onResizeInstance: (
        id: string,
        x: number,
        y: number,
        width: number,
        height: number,
        frame: HTMLElement
      ) => {
        onResizeEnd(id, x, y, width, height, frame.clientWidth, frame.clientHeight)
      },
      onMoveSlot: (id: string, x: number, y: number) => {
        const current = project.canvasSlots?.[id]
        updateSlot(project.id, id, {
          x,
          y,
          width: current?.width ?? null,
          height: current?.height ?? null,
        })
      },
      onResizeSlot: (id: string, x: number, y: number, width: number, height: number) => {
        updateSlot(project.id, id, { x, y, width, height })
      },
    }),
    [
      highlightedSlotId,
      instances,
      isEditable,
      onMoveEnd,
      onResizeEnd,
      onSelect,
      project.canvasSlots,
      project.id,
      selectSlot,
      selectedInstanceId,
      selectedSlotId,
      updateSlot,
    ]
  )

  function handleDragOver(event: DragEvent<HTMLDivElement>): void {
    if (!isEditable) return
    event.preventDefault()
    event.dataTransfer.dropEffect = "copy"
    const hit = findSlotAtPoint(event.clientX, event.clientY)
    setHighlightedSlotId(hit?.id ?? null)
  }

  function handleDrop(event: DragEvent<HTMLDivElement>): void {
    if (!isEditable || !stageElement) return
    event.preventDefault()
    setHighlightedSlotId(null)
    const raw =
      event.dataTransfer.getData(CANVAS_DND_MIME) || event.dataTransfer.getData("text/plain")
    if (!isCanvasComponentType(raw)) return
    const hit = findSlotAtPoint(event.clientX, event.clientY)
    const frame = hit?.element ?? stageElement
    const rect = frame.getBoundingClientRect()
    const logical = clientToLogical(
      event.clientX,
      event.clientY,
      rect,
      frame.clientWidth,
      frame.clientHeight
    )
    if (!logical) return
    if (
      !hit &&
      !isPointInsideCanvas(logical, stageElement.clientWidth, stageElement.clientHeight)
    ) {
      return
    }
    const props = defaultPropsForType(raw, kit)
    const box = defaultBoxForType(raw, kit, props)
    const origin = originFromDropCenter(logical.x, logical.y, box.width, box.height)
    onDropType(
      raw,
      origin.x,
      origin.y,
      hit?.id ?? null,
      frame.clientWidth,
      frame.clientHeight
    )
  }

  return (
    <CanvasEditProvider value={editValue}>
      <div
        ref={setStageRef}
        data-canvas-stage
        className="relative h-full min-h-0 w-full overflow-hidden"
        style={theme}
        onDragOver={handleDragOver}
        onDragLeave={() => setHighlightedSlotId(null)}
        onDrop={handleDrop}
      >
        <div className="absolute inset-0 h-full overflow-auto">
          <PrototypeScreen project={project} />
        </div>
        <CanvasOverlay
          instances={instances}
          selectedInstanceId={selectedInstanceId}
          isEditable={isEditable}
          stageElement={stageElement}
          onSelect={onSelect}
          onMoveEnd={(id, x, y, clientX, clientY) => {
            if (!stageElement) return
            editValue.onMoveInstance(id, x, y, stageElement, clientX, clientY)
          }}
          onResizeEnd={(id, x, y, width, height) => {
            if (!stageElement) return
            onResizeEnd(id, x, y, width, height, stageElement.clientWidth, stageElement.clientHeight)
          }}
        />
      </div>
    </CanvasEditProvider>
  )
}

export function stageCenterOrigin(
  stage: HTMLElement,
  type: CanvasComponentType,
  kit: ReturnType<typeof resolveKitKind>
): { x: number; y: number } {
  const props = defaultPropsForType(type, kit)
  const box = defaultBoxForType(type, kit, props)
  return centerOrigin(stage.clientWidth, stage.clientHeight, box.width, box.height)
}
