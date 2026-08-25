"use client"

import { Button } from "@/components/ui/button"
import { CodePanel } from "@/components/workbench/canvas/code-panel"
import { InspectorFields } from "@/components/workbench/canvas/inspector-fields"
import { generateInstanceJsx } from "@/lib/canvas/codegen"
import { catalogItem } from "@/lib/canvas/shadcn-catalog"
import type { CanvasInstance, CanvasInstanceProps } from "@/types/domain"

interface CanvasInspectorProps {
  instance: CanvasInstance | null
  isEditable: boolean
  onChange: (patch: Partial<CanvasInstanceProps>, box?: { width?: number; height?: number }) => void
  onMove: (x: number, y: number) => void
  onDelete: () => void
}

export function CanvasInspector({
  instance,
  isEditable,
  onChange,
  onMove,
  onDelete,
}: CanvasInspectorProps) {
  if (!instance) {
    return (
      <div className="h-full text-sm text-muted-foreground">
        캔버스에서 컴포넌트를 선택하면 속성과 코드를 볼 수 있습니다.
      </div>
    )
  }

  const code = generateInstanceJsx(instance)

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-semibold">{catalogItem(instance.type).label}</h3>
        <p className="text-xs text-muted-foreground">{catalogItem(instance.type).importPath}</p>
      </div>
      <InspectorFields
        instance={instance}
        disabled={!isEditable}
        onChange={onChange}
        onMove={onMove}
      />
      <CodePanel value={code} />
      <Button
        type="button"
        variant="destructive"
        disabled={!isEditable}
        onClick={onDelete}
      >
        삭제
      </Button>
    </div>
  )
}
