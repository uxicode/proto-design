import type { CanvasSlotOverride } from "@/types/domain"

export const CANVAS_SLOT_ATTR = "data-canvas-slot"
export const CANVAS_SLOT_KIND_ATTR = "data-canvas-slot-kind"
export const CANVAS_SLOT_SIZE_FLOOR = 16
export const CANVAS_REGION_MIN_WIDTH = 40
export const CANVAS_REGION_MIN_HEIGHT = 24
export const CANVAS_PART_MIN_WIDTH = 16
export const CANVAS_PART_MIN_HEIGHT = 16

export type CanvasSlotKind = "region" | "part"

export interface CanvasSlotHit {
  id: string
  label: string
  element: HTMLElement
}

export function sanitizeCanvasSlots(raw: unknown): Record<string, CanvasSlotOverride> {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return {}
  const next: Record<string, CanvasSlotOverride> = {}
  for (const [id, value] of Object.entries(raw as Record<string, unknown>)) {
    const slot = sanitizeCanvasSlot(id, value)
    if (slot) next[id] = slot
  }
  return next
}

export function sanitizeCanvasSlot(id: string, raw: unknown): CanvasSlotOverride | null {
  if (!id.trim() || !raw || typeof raw !== "object") return null
  const record = raw as Record<string, unknown>
  const x = asFiniteNumber(record.x) ?? 0
  const y = asFiniteNumber(record.y) ?? 0
  const width = record.width === null ? null : asFiniteNumber(record.width)
  const height = record.height === null ? null : asFiniteNumber(record.height)
  return {
    x,
    y,
    width:
      width !== null && width !== undefined && width >= CANVAS_SLOT_SIZE_FLOOR ? width : null,
    height:
      height !== null && height !== undefined && height >= CANVAS_SLOT_SIZE_FLOOR ? height : null,
  }
}

export function slotHasExplicitSize(
  override: { width: number | null; height: number | null } | null | undefined
): boolean {
  return Boolean(override && (override.width != null || override.height != null))
}

export function slotOverrideStyle(
  override: CanvasSlotOverride | null | undefined
): SlotOverrideStyle {
  if (!override) return {}
  const width = override.width
  const height = override.height
  const hasSize = width != null || height != null
  return {
    transform: `translate(${override.x}px, ${override.y}px)`,
    boxSizing: "border-box",
    width: width ?? undefined,
    height: height ?? undefined,
    minWidth: width ?? undefined,
    maxWidth: width ?? undefined,
    minHeight: height ?? undefined,
    maxHeight: height ?? undefined,
    ...(hasSize
      ? {
          flexGrow: 0,
          flexShrink: 0,
          justifySelf: "start" as const,
          alignSelf: "start" as const,
        }
      : {}),
  }
}

export interface SlotOverrideStyle {
  transform?: string
  width?: number
  height?: number
  minWidth?: number
  maxWidth?: number
  minHeight?: number
  maxHeight?: number
  flexGrow?: number
  flexShrink?: number
  justifySelf?: "start"
  alignSelf?: "start"
  boxSizing?: "border-box"
}

export function findSlotAtPoint(clientX: number, clientY: number): CanvasSlotHit | null {
  if (typeof document === "undefined" || typeof document.elementsFromPoint !== "function") {
    return null
  }
  const stack = document.elementsFromPoint(clientX, clientY)
  let best: CanvasSlotHit | null = null
  let bestArea = Number.POSITIVE_INFINITY
  for (const node of stack) {
    if (!(node instanceof HTMLElement)) continue
    const id = node.getAttribute(CANVAS_SLOT_ATTR)
    if (!id) continue
    const rect = node.getBoundingClientRect()
    const area = Math.max(rect.width, 1) * Math.max(rect.height, 1)
    if (area >= bestArea) continue
    bestArea = area
    best = {
      id,
      label: node.getAttribute("data-canvas-slot-label") || id,
      element: node,
    }
  }
  return best
}

export function slotElementById(slotId: string): HTMLElement | null {
  if (typeof document === "undefined") return null
  return document.querySelector(`[${CANVAS_SLOT_ATTR}="${cssEscape(slotId)}"]`)
}

function cssEscape(value: string): string {
  if (typeof CSS !== "undefined" && typeof CSS.escape === "function") return CSS.escape(value)
  return value.replace(/"/g, '\\"')
}

function asFiniteNumber(value: unknown): number | null {
  return typeof value === "number" && Number.isFinite(value) ? value : null
}
