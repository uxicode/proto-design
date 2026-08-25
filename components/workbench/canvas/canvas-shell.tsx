"use client"

import { useEffect, useState, type ReactNode } from "react"
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
  const addInstance = useProjectStore((state) => state.addInstance)
  const moveInstance = useProjectStore((state) => state.moveInstance)
  const resizeInstance = useProjectStore((state) => state.resizeInstance)
  const updateInstanceProps = useProjectStore((state) => state.updateInstanceProps)
  const deleteInstance = useProjectStore((state) => state.deleteInstance)
  const clearCanvas = useProjectStore((state) => state.clearCanvas)
  const selectInstance = useProjectStore((state) => state.selectInstance)

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
      if (!isEditable || !selectedInstanceId) return
      const target = event.target as HTMLElement | null
      if (target && /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName)) return
      if (event.key !== "Backspace" && event.key !== "Delete") return
      event.preventDefault()
      deleteInstance(project.id, selectedInstanceId)
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [deleteInstance, isEditable, project.id, selectedInstanceId])

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

  function handleDrop(type: CanvasComponentType, x: number, y: number): void {
    const size = stageSize()
    if (!size) return
    addInstance(project.id, {
      type,
      x,
      y,
      canvasWidth: size.width,
      canvasHeight: size.height,
    })
  }

  function handleMoveEnd(id: string, x: number, y: number): void {
    const size = stageSize()
    if (!size) return
    moveInstance(project.id, id, x, y, size.width, size.height)
  }

  function handleResizeEnd(
    id: string,
    x: number,
    y: number,
    width: number,
    height: number
  ): void {
    const size = stageSize()
    if (!size) return
    resizeInstance(project.id, id, x, y, width, height, size.width, size.height)
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
          <ClearCanvasButton
            disabled={!isEditable || instances.length === 0}
            onConfirm={() => clearCanvas(project.id)}
          />
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
          isEditable={isEditable}
          onChange={(patch, box) => {
            if (!selected) return
            updateInstanceProps(project.id, selected.id, patch, box)
          }}
          onMove={(x, y) => {
            if (!selected) return
            const size = stageSize()
            if (!size) return
            moveInstance(project.id, selected.id, x, y, size.width, size.height)
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
