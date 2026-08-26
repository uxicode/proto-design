"use client"

import { Button } from "@/components/ui/button"
import { CodePanel } from "@/components/workbench/canvas/code-panel"
import { InspectorFields } from "@/components/workbench/canvas/inspector-fields"
import { generateInstanceJsx, generateNestedInstanceJsx, generateSlotJsx } from "@/lib/canvas/codegen"
import { catalogItem } from "@/lib/canvas/shadcn-catalog"
import { CANVAS_SLOT_ATTR, CANVAS_SLOT_KIND_ATTR } from "@/lib/canvas/slots"
import type { CanvasInstance, CanvasInstanceProps, CanvasSlotOverride } from "@/types/domain"

interface CanvasInspectorProps {
  instance: CanvasInstance | null
  slotId: string | null
  nestedInstances: CanvasInstance[]
  slotBox: CanvasSlotOverride | null
  isEditable: boolean
  onChange: (patch: Partial<CanvasInstanceProps>, box?: { width?: number; height?: number }) => void
  onMove: (x: number, y: number) => void
  onSlotChange: (box: CanvasSlotOverride) => void
  onSlotReset: () => void
  onDelete: () => void
}

export function CanvasInspector({
  instance,
  slotId,
  nestedInstances,
  slotBox,
  isEditable,
  onChange,
  onMove,
  onSlotChange,
  onSlotReset,
  onDelete,
}: CanvasInspectorProps) {
  if (slotId) {
    const label = slotLabel(slotId)
    const code = generateSlotJsx(slotId, label, nestedInstances)
    return (
      <div className="space-y-4">
        <div>
          <h3 className="text-sm font-semibold">{label}</h3>
          <p className="text-xs text-muted-foreground">
            {slotKindHint(slotId)} · data-slot={slotId}
          </p>
        </div>
        <SlotBoxFields box={slotBox} disabled={!isEditable} onChange={onSlotChange} />
        <CodePanel value={code} />
        <Button type="button" variant="outline" disabled={!isEditable || !slotBox} onClick={onSlotReset}>
          위치·크기 초기화
        </Button>
      </div>
    )
  }

  if (!instance) {
    return (
      <div className="h-full text-sm text-muted-foreground">
        캔버스나 프로토타입 영역을 선택하면 속성과 코드를 볼 수 있습니다.
      </div>
    )
  }

  const parentLabel = instance.parentSlotId ? slotLabel(instance.parentSlotId) : null
  const code = instance.parentSlotId
    ? generateNestedInstanceJsx(instance, instance.parentSlotId, parentLabel ?? instance.parentSlotId)
    : generateInstanceJsx(instance)

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-semibold">{catalogItem(instance.type).label}</h3>
        <p className="text-xs text-muted-foreground">
          {parentLabel
            ? `${parentLabel} 안에 배치됨 · ${catalogItem(instance.type).importPath}`
            : catalogItem(instance.type).importPath}
        </p>
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

function slotLabel(slotId: string): string {
  if (typeof document === "undefined") return slotId
  const node = document.querySelector(`[${CANVAS_SLOT_ATTR}="${cssEscape(slotId)}"]`)
  return node?.getAttribute("data-canvas-slot-label") || slotId
}

function slotKindHint(slotId: string): string {
  if (typeof document === "undefined") return "프로토타입 HTML 영역"
  const node = document.querySelector(`[${CANVAS_SLOT_ATTR}="${cssEscape(slotId)}"]`)
  if (node?.getAttribute(CANVAS_SLOT_KIND_ATTR) === "part") return "개별 컴포넌트"
  return "프로토타입 HTML 영역"
}

function cssEscape(value: string): string {
  if (typeof CSS !== "undefined" && typeof CSS.escape === "function") return CSS.escape(value)
  return value.replace(/"/g, '\\"')
}

function SlotBoxFields({
  box,
  disabled,
  onChange,
}: {
  box: CanvasSlotOverride | null
  disabled: boolean
  onChange: (box: CanvasSlotOverride) => void
}) {
  const current = box ?? { x: 0, y: 0, width: null, height: null }

  function patch(next: Partial<CanvasSlotOverride>): void {
    onChange({
      x: next.x ?? current.x,
      y: next.y ?? current.y,
      width: next.width === undefined ? current.width : next.width,
      height: next.height === undefined ? current.height : next.height,
    })
  }

  return (
    <div className="space-y-3">
      <NumberField label="X" value={Math.round(current.x)} disabled={disabled} onChange={(x) => patch({ x })} />
      <NumberField label="Y" value={Math.round(current.y)} disabled={disabled} onChange={(y) => patch({ y })} />
      <NumberField
        label="너비"
        value={Math.round(current.width ?? 0)}
        disabled={disabled}
        onChange={(width) => patch({ width })}
      />
      <NumberField
        label="높이"
        value={Math.round(current.height ?? 0)}
        disabled={disabled}
        onChange={(height) => patch({ height })}
      />
    </div>
  )
}

function NumberField({
  label,
  value,
  disabled,
  onChange,
}: {
  label: string
  value: number
  disabled: boolean
  onChange: (value: number) => void
}) {
  const id = `slot-${label}`
  return (
    <div className="space-y-1">
      <label className="text-sm font-medium" htmlFor={id}>
        {label}
      </label>
      <input
        id={id}
        type="number"
        className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm shadow-sm disabled:opacity-50"
        value={Number.isFinite(value) ? value : 0}
        disabled={disabled}
        onChange={(event) => onChange(Number(event.target.value))}
      />
    </div>
  )
}
