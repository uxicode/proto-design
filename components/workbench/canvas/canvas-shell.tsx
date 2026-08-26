"use client"

import { useEffect, useState, type ReactNode } from "react"
import { CanvasHistoryButtons } from "@/components/workbench/canvas/canvas-history-buttons"
import { CanvasInspector } from "@/components/workbench/canvas/canvas-inspector"
import { CanvasLockHint } from "@/components/workbench/canvas/canvas-lock-hint"
import { CanvasStage, stageCenterOrigin } from "@/components/workbench/canvas/canvas-stage"
import { ClearCanvasButton } from "@/components/workbench/canvas/clear-canvas-button"
import { ComponentPalette } from "@/components/workbench/canvas/component-palette"
import { canvasLockMessage, getDisplayArtifact, isCanvasEditable } from "@/lib/canvas/guards"
import { resolveKitKind } from "@/lib/ai/preview-theme"
import { useProjectStore } from "@/lib/projects/store"
import type { CanvasComponentType, Project } from "@/types/domain"

interface CanvasShellProps {
  project: Project
  chrome?: ReactNode
  stage?: ReactNode
}

export function CanvasShell({ project, chrome, stage }: CanvasShellProps) {
  const [stageElement, setStageElement] = useState<HTMLDivElement | null>(null)
  const selectedInstanceId = useProjectStore((state) => state.selectedInstanceId)
  const selectedSlotId = useProjectStore((state) => state.selectedSlotId)
  const addInstance = useProjectStore((state) => state.addInstance)
  const moveInstance = useProjectStore((state) => state.moveInstance)
  const resizeInstance = useProjectStore((state) => state.resizeInstance)
  const updateInstanceProps = useProjectStore((state) => state.updateInstanceProps)
  const deleteInstance = useProjectStore((state) => state.deleteInstance)
  const clearCanvas = useProjectStore((state) => state.clearCanvas)
  const selectInstance = useProjectStore((state) => state.selectInstance)
  const updateSlot = useProjectStore((state) => state.updateSlot)
  const resetSlot = useProjectStore((state) => state.resetSlot)
  const undoCanvas = useProjectStore((state) => state.undoCanvas)
  const redoCanvas = useProjectStore((state) => state.redoCanvas)
  const canUndo = useProjectStore(
    (state) => (state.canvasHistories?.[project.id]?.past.length ?? 0) > 0
  )
  const canRedo = useProjectStore(
    (state) => (state.canvasHistories?.[project.id]?.future.length ?? 0) > 0
  )

  const instances = project.canvasInstances ?? []
  const isEditable = isCanvasEditable(project)
  const lockMessage = isEditable ? "" : canvasLockMessage(project)
  const selected = instances.find((item) => item.id === selectedInstanceId) ?? null
  const componentSet = getDisplayArtifact(project.componentSets)
  const kit = resolveKitKind({
    title: componentSet?.title,
    items: componentSet?.items,
  })

  useEffect(() => {
    const html = document.documentElement
    const previousHtmlOverflow = html.style.overflow
    const previousBodyOverflow = document.body.style.overflow
    html.style.overflow = "hidden"
    document.body.style.overflow = "hidden"
    return () => {
      html.style.overflow = previousHtmlOverflow
      document.body.style.overflow = previousBodyOverflow
    }
  }, [])

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent): void {
      if (!isEditable) return
      const isMeta = event.metaKey || event.ctrlKey
      const key = event.key.toLowerCase()
      if (isMeta && key === "z") {
        event.preventDefault()
        if (event.shiftKey) redoCanvas(project.id)
        else undoCanvas(project.id)
        return
      }
      if (isMeta && key === "y") {
        event.preventDefault()
        redoCanvas(project.id)
        return
      }
      if (!selectedInstanceId) return
      const target = event.target as HTMLElement | null
      if (target && /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName)) return
      if (event.key !== "Backspace" && event.key !== "Delete") return
      event.preventDefault()
      deleteInstance(project.id, selectedInstanceId)
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [deleteInstance, isEditable, project.id, redoCanvas, selectedInstanceId, undoCanvas])

  function stageSize(): { width: number; height: number } | null {
    if (!stageElement) return null
    return { width: stageElement.clientWidth, height: stageElement.clientHeight }
  }

  function handleApply(type: CanvasComponentType): void {
    if (!stageElement) return
    const origin = stageCenterOrigin(stageElement, type, kit)
    addInstance(project.id, {
      type,
      x: origin.x,
      y: origin.y,
      canvasWidth: stageElement.clientWidth,
      canvasHeight: stageElement.clientHeight,
    })
  }

  function handleDrop(
    type: CanvasComponentType,
    x: number,
    y: number,
    parentSlotId: string | null,
    frameWidth: number,
    frameHeight: number
  ): void {
    addInstance(project.id, {
      type,
      x,
      y,
      canvasWidth: frameWidth,
      canvasHeight: frameHeight,
      parentSlotId,
    })
  }

  function handleMoveEnd(
    id: string,
    x: number,
    y: number,
    frameWidth: number,
    frameHeight: number,
    parentSlotId?: string | null
  ): void {
    moveInstance(project.id, id, x, y, frameWidth, frameHeight, parentSlotId)
  }

  function handleResizeEnd(
    id: string,
    x: number,
    y: number,
    width: number,
    height: number,
    frameWidth: number,
    frameHeight: number
  ): void {
    resizeInstance(project.id, id, x, y, width, height, frameWidth, frameHeight)
  }

  return (
    <div className="fixed inset-x-0 bottom-0 top-14 z-10 grid grid-cols-1 bg-background xl:grid-cols-[240px_minmax(0,1fr)_280px]">
      <ComponentPalette
        className="max-h-[40vh] border-b border-border xl:max-h-none xl:h-full xl:border-b-0 xl:border-r"
        disabled={!isEditable}
        instanceCount={instances.length}
        onApply={handleApply}
      />
      <div className="flex min-h-0 min-w-0 flex-col overflow-hidden">
        {chrome ? (
          <div className="mx-auto w-full max-w-6xl shrink-0 space-y-3 px-4 pt-4">
            {chrome}
          </div>
        ) : null}
        <div className="mx-auto flex w-full max-w-6xl shrink-0 flex-wrap items-center justify-between gap-2 px-4 py-3">
          <CanvasLockHint message={lockMessage} />
          <div className="flex items-center gap-2">
            <CanvasHistoryButtons
              canUndo={canUndo}
              canRedo={canRedo}
              disabled={!isEditable}
              onUndo={() => undoCanvas(project.id)}
              onRedo={() => redoCanvas(project.id)}
            />
            <ClearCanvasButton
              disabled={!isEditable || instances.length === 0}
              onConfirm={() => clearCanvas(project.id)}
            />
          </div>
        </div>
        <div className="min-h-0 flex-1 px-4 pb-4">
          {stage ?? (
            <section
              className="flex h-full min-h-0 flex-col overflow-hidden rounded-xl border border-border bg-neutral-200 shadow-sm"
              aria-label="최종 프로토타입"
            >
              <div className="flex shrink-0 items-center gap-2 border-b border-black/10 bg-neutral-300 px-3 py-2">
                <span className="h-2.5 w-2.5 rounded-full bg-red-400" />
                <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
                <span className="ml-3 flex-1 truncate rounded-full bg-white/80 px-3 py-1 text-xs text-muted-foreground">
                  {project.name} · {getDisplayArtifact(project.wireframes)?.title ?? "프로토타입"}
                </span>
              </div>
              <div className="min-h-0 flex-1">
                <CanvasStage
                  project={project}
                  instances={instances}
                  selectedInstanceId={selectedInstanceId}
                  isEditable={isEditable}
                  onSelect={selectInstance}
                  onDropType={handleDrop}
                  onMoveEnd={handleMoveEnd}
                  onResizeEnd={handleResizeEnd}
                  onStageReady={setStageElement}
                />
              </div>
            </section>
          )}
        </div>
      </div>
      <aside
        className="flex h-full min-h-0 flex-col overflow-y-auto border-t border-border bg-background p-4 xl:border-l xl:border-t-0"
        aria-label="인스펙터"
      >
        <CanvasInspector
          instance={selected}
          slotId={selectedSlotId}
          nestedInstances={
            selectedSlotId
              ? instances.filter((item) => item.parentSlotId === selectedSlotId)
              : selected?.parentSlotId
                ? instances.filter((item) => item.parentSlotId === selected.parentSlotId)
                : []
          }
          slotBox={selectedSlotId ? project.canvasSlots?.[selectedSlotId] ?? null : null}
          isEditable={isEditable}
          onChange={(patch, box) => {
            if (!selected) return
            updateInstanceProps(project.id, selected.id, patch, box)
          }}
          onMove={(x, y) => {
            if (!selected) return
            if (selected.parentSlotId) {
              const frame = document.querySelector(
                `[data-canvas-slot="${CSS.escape(selected.parentSlotId)}"]`
              ) as HTMLElement | null
              if (frame) {
                moveInstance(project.id, selected.id, x, y, frame.clientWidth, frame.clientHeight)
                return
              }
            }
            const size = stageSize()
            if (!size) return
            moveInstance(project.id, selected.id, x, y, size.width, size.height)
          }}
          onSlotChange={(box) => {
            if (!selectedSlotId) return
            updateSlot(project.id, selectedSlotId, box)
          }}
          onSlotReset={() => {
            if (!selectedSlotId) return
            resetSlot(project.id, selectedSlotId)
          }}
          onDelete={() => {
            if (!selected) return
            deleteInstance(project.id, selected.id)
          }}
        />
      </aside>
    </div>
  )
}
