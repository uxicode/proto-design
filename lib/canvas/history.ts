import type { CanvasInstance, CanvasSlotOverride, Project } from "@/types/domain"

export const CANVAS_HISTORY_LIMIT = 50
export const CANVAS_HISTORY_COALESCE_MS = 500

export interface CanvasHistorySnapshot {
  canvasInstances: CanvasInstance[]
  canvasSlots: Record<string, CanvasSlotOverride>
  selectedInstanceId: string | null
  selectedSlotId: string | null
}

export interface CanvasHistoryStack {
  past: CanvasHistorySnapshot[]
  future: CanvasHistorySnapshot[]
}

export type CanvasHistories = Record<string, CanvasHistoryStack>

export function emptyCanvasHistory(): CanvasHistoryStack {
  return { past: [], future: [] }
}

export function captureCanvasSnapshot(
  project: Project,
  selectedInstanceId: string | null,
  selectedSlotId: string | null
): CanvasHistorySnapshot {
  return {
    canvasInstances: cloneJson(project.canvasInstances ?? []),
    canvasSlots: cloneJson(project.canvasSlots ?? {}),
    selectedInstanceId,
    selectedSlotId,
  }
}

export function applyCanvasSnapshot(
  project: Project,
  snapshot: CanvasHistorySnapshot
): Project {
  return {
    ...project,
    canvasInstances: cloneJson(snapshot.canvasInstances),
    canvasSlots: cloneJson(snapshot.canvasSlots),
    updatedAt: new Date().toISOString(),
  }
}

export function pushCanvasHistory(
  histories: CanvasHistories,
  projectId: string,
  snapshot: CanvasHistorySnapshot
): CanvasHistories {
  const stack = histories[projectId] ?? emptyCanvasHistory()
  return {
    ...histories,
    [projectId]: {
      past: [...stack.past, snapshot].slice(-CANVAS_HISTORY_LIMIT),
      future: [],
    },
  }
}

export function undoCanvasHistory(
  histories: CanvasHistories,
  projectId: string,
  current: CanvasHistorySnapshot
): { histories: CanvasHistories; snapshot: CanvasHistorySnapshot } | null {
  const stack = histories[projectId] ?? emptyCanvasHistory()
  if (stack.past.length === 0) return null
  const snapshot = stack.past[stack.past.length - 1]
  return {
    snapshot,
    histories: {
      ...histories,
      [projectId]: {
        past: stack.past.slice(0, -1),
        future: [...stack.future, current].slice(-CANVAS_HISTORY_LIMIT),
      },
    },
  }
}

export function redoCanvasHistory(
  histories: CanvasHistories,
  projectId: string,
  current: CanvasHistorySnapshot
): { histories: CanvasHistories; snapshot: CanvasHistorySnapshot } | null {
  const stack = histories[projectId] ?? emptyCanvasHistory()
  if (stack.future.length === 0) return null
  const snapshot = stack.future[stack.future.length - 1]
  return {
    snapshot,
    histories: {
      ...histories,
      [projectId]: {
        past: [...stack.past, current].slice(-CANVAS_HISTORY_LIMIT),
        future: stack.future.slice(0, -1),
      },
    },
  }
}

function cloneJson<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T
}
