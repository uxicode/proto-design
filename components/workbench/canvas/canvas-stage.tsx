"use client"

import { useCallback, useState, type DragEvent } from "react"
import { PrototypeScreen } from "@/components/workbench/prototype-screen"
import { CanvasOverlay } from "@/components/workbench/canvas/canvas-overlay"
import { canvasThemeStyle } from "@/lib/canvas/theme"
import {
  centerOrigin,
  clientToLogical,
  isPointInsideCanvas,
  originFromDropCenter,
} from "@/lib/canvas/geometry"
import { defaultBoxForType, defaultPropsForType } from "@/lib/canvas/defaults"
import { isCanvasComponentType, CANVAS_DND_MIME } from "@/lib/canvas/shadcn-catalog"
import { resolveKitKind, kitRadius, paletteFromSwatches } from "@/lib/ai/preview-theme"
import { getDisplayArtifact } from "@/lib/canvas/guards"
import type { CanvasComponentType, CanvasInstance, Project } from "@/types/domain"

interface CanvasStageProps {
  project: Project
  instances: CanvasInstance[]
  selectedInstanceId: string | null
  isEditable: boolean
  onSelect: (id: string | null) => void
  onDropType: (type: CanvasComponentType, x: number, y: number) => void
  onMoveEnd: (id: string, x: number, y: number) => void
  onResizeEnd: (id: string, x: number, y: number, width: number, height: number) => void
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

  function handleDragOver(event: DragEvent<HTMLDivElement>): void {
    if (!isEditable) return
    event.preventDefault()
    event.dataTransfer.dropEffect = "copy"
  }

  function handleDrop(event: DragEvent<HTMLDivElement>): void {
    if (!isEditable || !stageElement) return
    event.preventDefault()
    const raw =
      event.dataTransfer.getData(CANVAS_DND_MIME) || event.dataTransfer.getData("text/plain")
    if (!isCanvasComponentType(raw)) return
    const rect = stageElement.getBoundingClientRect()
    const logical = clientToLogical(
      event.clientX,
      event.clientY,
      rect,
      stageElement.clientWidth,
      stageElement.clientHeight
    )
    if (!logical) return
    if (!isPointInsideCanvas(logical, stageElement.clientWidth, stageElement.clientHeight)) return
    const props = defaultPropsForType(raw, kit)
    const box = defaultBoxForType(raw, kit, props)
    const origin = originFromDropCenter(logical.x, logical.y, box.width, box.height)
    onDropType(raw, origin.x, origin.y)
  }

  return (
    <div
      ref={setStageRef}
      data-canvas-stage
      className="relative h-full min-h-0 w-full overflow-hidden"
      style={theme}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      <div className="pointer-events-none absolute inset-0 h-full overflow-auto">
        <PrototypeScreen project={project} />
      </div>
      <CanvasOverlay
        instances={instances}
        selectedInstanceId={selectedInstanceId}
        isEditable={isEditable}
        stageElement={stageElement}
        onSelect={onSelect}
        onMoveEnd={onMoveEnd}
        onResizeEnd={onResizeEnd}
      />
    </div>
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
