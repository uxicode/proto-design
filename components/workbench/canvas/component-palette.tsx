"use client"

import { Alert, AlertDescription } from "@/components/ui/alert"
import { PaletteItem } from "@/components/workbench/canvas/palette-item"
import { CANVAS_SOFT_WARN_COUNT, SHADCN_CATALOG } from "@/lib/canvas/shadcn-catalog"
import { cn } from "@/lib/utils"
import type { CanvasComponentType } from "@/types/domain"

interface ComponentPaletteProps {
  disabled: boolean
  instanceCount: number
  onApply: (type: CanvasComponentType) => void
  className?: string
}

export function ComponentPalette({
  disabled,
  instanceCount,
  onApply,
  className,
}: ComponentPaletteProps) {
  return (
    <aside
      className={cn("flex h-full min-h-0 flex-col gap-3 bg-background px-3 py-4", className)}
      aria-label="컴포넌트 라이브러리"
    >
      <div>
        <h3 className="text-sm font-semibold">shadcn/ui</h3>
        <p className="text-xs text-muted-foreground">적용하거나 캔버스로 드래그하세요.</p>
      </div>
      {instanceCount >= CANVAS_SOFT_WARN_COUNT ? (
        <Alert>
          <AlertDescription>
            인스턴스가 {instanceCount}개입니다. 50개를 넘으면 드래그가 느려질 수 있습니다.
          </AlertDescription>
        </Alert>
      ) : null}
      <div className="flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto pr-1">
        {SHADCN_CATALOG.map((item) => (
          <PaletteItem
            key={item.type}
            type={item.type}
            label={item.label}
            disabled={disabled}
            onApply={onApply}
          />
        ))}
      </div>
    </aside>
  )
}
