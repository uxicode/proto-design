import { clampBox, sanitizeProps } from "@/lib/canvas/defaults"
import { isCanvasComponentType } from "@/lib/canvas/shadcn-catalog"
import type { CanvasInstance } from "@/types/domain"

function asFiniteNumber(value: unknown): number | null {
  return typeof value === "number" && Number.isFinite(value) ? value : null
}

export function sanitizeCanvasInstances(raw: unknown): CanvasInstance[] {
  if (!Array.isArray(raw)) return []
  const instances: CanvasInstance[] = []
  for (const item of raw) {
    const instance = sanitizeCanvasInstance(item)
    if (instance) instances.push(instance)
  }
  return instances
}

export function sanitizeCanvasInstance(raw: unknown): CanvasInstance | null {
  if (!raw || typeof raw !== "object") return null
  const record = raw as Record<string, unknown>
  if (!isCanvasComponentType(record.type)) return null
  const id = typeof record.id === "string" && record.id.trim() ? record.id : null
  const x = asFiniteNumber(record.x)
  const y = asFiniteNumber(record.y)
  const width = asFiniteNumber(record.width)
  const height = asFiniteNumber(record.height)
  const zIndex = asFiniteNumber(record.zIndex)
  if (!id || x === null || y === null || width === null || height === null || zIndex === null) {
    return null
  }
  const props = sanitizeProps(record.type, record.props)
  const box = clampBox(record.type, width, height)
  return {
    id,
    type: record.type,
    x,
    y,
    width: box.width,
    height: box.height,
    props,
    zIndex,
  }
}

export function migratePersistedState(persisted: unknown): {
  projects: unknown[]
  onboardingCompleted: boolean
} {
  try {
    if (!persisted || typeof persisted !== "object") {
      return { projects: [], onboardingCompleted: false }
    }
    const raw = persisted as {
      projects?: unknown
      onboardingCompleted?: unknown
    }
    const projectsIn = Array.isArray(raw.projects) ? raw.projects : []
    const projects = projectsIn.map((item) => {
      if (!item || typeof item !== "object") return item
      const record = item as { canvasInstances?: unknown }
      return {
        ...record,
        canvasInstances: sanitizeCanvasInstances(record.canvasInstances),
      }
    })
    return {
      projects,
      onboardingCompleted: Boolean(raw.onboardingCompleted),
    }
  } catch {
    if (!persisted || typeof persisted !== "object") {
      return { projects: [], onboardingCompleted: false }
    }
    const raw = persisted as { projects?: unknown; onboardingCompleted?: unknown }
    const projectsIn = Array.isArray(raw.projects) ? raw.projects : []
    const projects = projectsIn.map((item) => {
      if (!item || typeof item !== "object") return item
      return { ...(item as object), canvasInstances: [] }
    })
    return {
      projects,
      onboardingCompleted: Boolean(raw.onboardingCompleted),
    }
  }
}
