import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import {
  emptyCanvasHistory,
  pushCanvasHistory,
  redoCanvasHistory,
  undoCanvasHistory,
  type CanvasHistorySnapshot,
} from "@/lib/canvas/history"
import { resetCanvasHistoryCoalesce, useProjectStore } from "@/lib/projects/store"
import { makeCommittedProject } from "./canvas-fixtures"

function snapshot(label: string): CanvasHistorySnapshot {
  return {
    canvasInstances: [],
    canvasSlots: {},
    selectedInstanceId: label,
    selectedSlotId: null,
  }
}

describe("canvas history stack", () => {
  it("undo 후 redo로 되돌린다", () => {
    const first = snapshot("a")
    const current = snapshot("b")
    const pushed = pushCanvasHistory({}, "p1", first)
    const undone = undoCanvasHistory(pushed, "p1", current)
    expect(undone?.snapshot.selectedInstanceId).toBe("a")
    expect(undone?.histories.p1.past).toEqual([])
    expect(undone?.histories.p1.future).toHaveLength(1)

    const redone = redoCanvasHistory(undone!.histories, "p1", undone!.snapshot)
    expect(redone?.snapshot.selectedInstanceId).toBe("b")
    expect(redone?.histories.p1.future).toEqual([])
  })

  it("새 기록이 있으면 future를 비운다", () => {
    const stack = pushCanvasHistory(
      {
        p1: { past: [snapshot("a")], future: [snapshot("b")] },
      },
      "p1",
      snapshot("c")
    )
    expect(stack.p1.future).toEqual([])
    expect(stack.p1.past).toHaveLength(2)
  })

  it("past가 비면 undo가 null이다", () => {
    expect(undoCanvasHistory({ p1: emptyCanvasHistory() }, "p1", snapshot("x"))).toBeNull()
  })
})

describe("canvas store undo/redo", () => {
  beforeEach(() => {
    resetCanvasHistoryCoalesce()
    useProjectStore.setState({
      projects: [makeCommittedProject()],
      onboardingCompleted: false,
      selectedInstanceId: null,
      selectedSlotId: null,
      canvasHistories: {},
    })
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it("추가를 취소하면 빈 캔버스로 돌아간다", () => {
    const added = useProjectStore.getState().addInstance("p-canvas", {
      type: "button",
      x: 10,
      y: 20,
      canvasWidth: 800,
      canvasHeight: 600,
    })
    expect(added).toBeTruthy()
    expect(useProjectStore.getState().undoCanvas("p-canvas")).toBe(true)
    expect(useProjectStore.getState().projects[0].canvasInstances).toEqual([])
    expect(useProjectStore.getState().selectedInstanceId).toBeNull()
  })

  it("undo 후 redo로 추가를 복원한다", () => {
    const added = useProjectStore.getState().addInstance("p-canvas", {
      type: "button",
      x: 10,
      y: 20,
      canvasWidth: 800,
      canvasHeight: 600,
    })
    useProjectStore.getState().undoCanvas("p-canvas")
    expect(useProjectStore.getState().redoCanvas("p-canvas")).toBe(true)
    const restored = useProjectStore.getState().projects[0].canvasInstances
    expect(restored).toHaveLength(1)
    expect(restored[0].id).toBe(added?.id)
    expect(useProjectStore.getState().selectedInstanceId).toBe(added?.id)
  })

  it("undo 이후 새 추가는 future를 지운다", () => {
    useProjectStore.getState().addInstance("p-canvas", {
      type: "button",
      x: 10,
      y: 20,
      canvasWidth: 800,
      canvasHeight: 600,
    })
    useProjectStore.getState().undoCanvas("p-canvas")
    useProjectStore.getState().addInstance("p-canvas", {
      type: "badge",
      x: 4,
      y: 4,
      canvasWidth: 800,
      canvasHeight: 600,
    })
    expect(useProjectStore.getState().redoCanvas("p-canvas")).toBe(false)
    expect(useProjectStore.getState().projects[0].canvasInstances[0].type).toBe("badge")
  })

  it("이동·삭제·비우기를 취소한다", () => {
    const added = useProjectStore.getState().addInstance("p-canvas", {
      type: "button",
      x: 10,
      y: 20,
      canvasWidth: 800,
      canvasHeight: 600,
    })
    useProjectStore.getState().moveInstance("p-canvas", added!.id, 80, 90, 800, 600)
    expect(useProjectStore.getState().projects[0].canvasInstances[0].x).toBe(80)

    useProjectStore.getState().undoCanvas("p-canvas")
    expect(useProjectStore.getState().projects[0].canvasInstances[0].x).toBe(10)

    useProjectStore.getState().deleteInstance("p-canvas", added!.id)
    expect(useProjectStore.getState().projects[0].canvasInstances).toHaveLength(0)
    useProjectStore.getState().undoCanvas("p-canvas")
    expect(useProjectStore.getState().projects[0].canvasInstances).toHaveLength(1)

    useProjectStore.getState().clearCanvas("p-canvas")
    expect(useProjectStore.getState().projects[0].canvasInstances).toHaveLength(0)
    useProjectStore.getState().undoCanvas("p-canvas")
    expect(useProjectStore.getState().projects[0].canvasInstances).toHaveLength(1)
  })

  it("짧은 속성 수정은 한 번의 undo로 묶인다", () => {
    const added = useProjectStore.getState().addInstance("p-canvas", {
      type: "button",
      x: 10,
      y: 20,
      canvasWidth: 800,
      canvasHeight: 600,
    })
    const original = (useProjectStore.getState().projects[0].canvasInstances[0].props as { label: string })
      .label
    useProjectStore.getState().updateInstanceProps("p-canvas", added!.id, { label: "가" })
    useProjectStore.getState().updateInstanceProps("p-canvas", added!.id, { label: "가입" })
    expect(
      (useProjectStore.getState().projects[0].canvasInstances[0].props as { label: string }).label
    ).toBe("가입")

    expect(useProjectStore.getState().undoCanvas("p-canvas")).toBe(true)
    expect(
      (useProjectStore.getState().projects[0].canvasInstances[0].props as { label: string }).label
    ).toBe(original)
    expect(useProjectStore.getState().projects[0].canvasInstances).toHaveLength(1)
  })

  it("슬롯 배치를 취소한다", () => {
    useProjectStore.getState().updateSlot("p-canvas", "header", {
      x: 4,
      y: 8,
      width: 360,
      height: 56,
    })
    expect(useProjectStore.getState().projects[0].canvasSlots.header?.x).toBe(4)
    useProjectStore.getState().undoCanvas("p-canvas")
    expect(useProjectStore.getState().projects[0].canvasSlots.header).toBeUndefined()
  })

  it("같은 위치 이동은 히스토리에 넣지 않는다", () => {
    const added = useProjectStore.getState().addInstance("p-canvas", {
      type: "button",
      x: 10,
      y: 20,
      canvasWidth: 800,
      canvasHeight: 600,
    })
    const placed = useProjectStore.getState().projects[0].canvasInstances[0]
    useProjectStore.getState().moveInstance(
      "p-canvas",
      added!.id,
      placed.x,
      placed.y,
      800,
      600
    )
    expect(useProjectStore.getState().canvasHistories["p-canvas"].past).toHaveLength(1)
  })

  it("간격이 길면 속성 수정을 따로 기록한다", () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date("2026-08-26T00:00:00.000Z"))
    const added = useProjectStore.getState().addInstance("p-canvas", {
      type: "button",
      x: 10,
      y: 20,
      canvasWidth: 800,
      canvasHeight: 600,
    })
    useProjectStore.getState().updateInstanceProps("p-canvas", added!.id, { label: "가" })
    vi.setSystemTime(new Date("2026-08-26T00:00:00.600Z"))
    useProjectStore.getState().updateInstanceProps("p-canvas", added!.id, { label: "가입" })

    useProjectStore.getState().undoCanvas("p-canvas")
    expect(
      (useProjectStore.getState().projects[0].canvasInstances[0].props as { label: string }).label
    ).toBe("가")
    useProjectStore.getState().undoCanvas("p-canvas")
    const original = (
      useProjectStore.getState().projects[0].canvasInstances[0].props as { label: string }
    ).label
    expect(original).not.toBe("가")
  })
})
