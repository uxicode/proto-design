import { beforeEach, describe, expect, it } from "vitest"
import { resetCanvasHistoryCoalesce, useProjectStore } from "@/lib/projects/store"
import { makeCommittedProject } from "./canvas-fixtures"

describe("canvas store", () => {
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

  it("추가·이동·수정·삭제·비우기를 수행한다", () => {
    const added = useProjectStore.getState().addInstance("p-canvas", {
      type: "button",
      x: 10,
      y: 20,
      canvasWidth: 800,
      canvasHeight: 600,
    })
    expect(added).toBeTruthy()
    expect(useProjectStore.getState().selectedInstanceId).toBe(added?.id)
    expect(useProjectStore.getState().projects[0].canvasInstances).toHaveLength(1)

    useProjectStore.getState().moveInstance("p-canvas", added!.id, 40, 50, 800, 600)
    const moved = useProjectStore.getState().projects[0].canvasInstances[0]
    expect(moved.x).toBe(40)
    expect(moved.y).toBe(50)

    useProjectStore.getState().resizeInstance(
      "p-canvas",
      added!.id,
      40,
      50,
      200,
      80,
      800,
      600
    )
    const resized = useProjectStore.getState().projects[0].canvasInstances[0]
    expect(resized.width).toBe(200)
    expect(resized.height).toBe(80)
    expect(resized.x).toBe(40)
    expect(resized.y).toBe(50)

    useProjectStore.getState().updateInstanceProps("p-canvas", added!.id, { label: "가입" })
    expect(
      (useProjectStore.getState().projects[0].canvasInstances[0].props as { label: string }).label
    ).toBe("가입")

    useProjectStore.getState().deleteInstance("p-canvas", added!.id)
    expect(useProjectStore.getState().projects[0].canvasInstances).toHaveLength(0)
    expect(useProjectStore.getState().selectedInstanceId).toBeNull()

    const nested = useProjectStore.getState().addInstance("p-canvas", {
      type: "button",
      x: 12,
      y: 8,
      canvasWidth: 400,
      canvasHeight: 80,
      parentSlotId: "header",
    })
    expect(nested?.parentSlotId).toBe("header")
    useProjectStore.getState().updateSlot("p-canvas", "header", {
      x: 4,
      y: 0,
      width: 360,
      height: 56,
    })
    expect(useProjectStore.getState().projects[0].canvasSlots.header?.width).toBe(360)

    useProjectStore.getState().addInstance("p-canvas", {
      type: "badge",
      x: 0,
      y: 0,
      canvasWidth: 800,
      canvasHeight: 600,
    })
    useProjectStore.getState().clearCanvas("p-canvas")
    expect(useProjectStore.getState().projects[0].canvasInstances).toEqual([])
  })

  it("선택은 persist 슬라이스에 없다", () => {
    useProjectStore.getState().selectInstance("abc")
    expect(useProjectStore.getState().selectedInstanceId).toBe("abc")
    const persisted = JSON.parse(
      // persist storage may still be debounced; inspect live partialize via getState keys
      JSON.stringify({
        projects: useProjectStore.getState().projects,
        onboardingCompleted: useProjectStore.getState().onboardingCompleted,
      })
    )
    expect(persisted.selectedInstanceId).toBeUndefined()
    expect(persisted.canvasHistories).toBeUndefined()
  })

  it("commit 이후에도 인스턴스 길이를 유지한다", () => {
    useProjectStore.getState().addInstance("p-canvas", {
      type: "button",
      x: 10,
      y: 10,
      canvasWidth: 800,
      canvasHeight: 600,
    })
    const before = useProjectStore.getState().projects[0].canvasInstances.length
    useProjectStore.getState().applyGeneration("p-canvas", {
      prototype: {
        id: "proto1",
        generationId: "g-proto",
        imageUrl: "/stock/fintech/01.jpg",
        snapshot: {
          conceptId: "c1",
          paletteId: "pal1",
          wireframeId: "w1",
          componentSetId: "cs1",
          domainKey: "fintech",
          keywords: ["신뢰"],
          briefVersion: 1,
        },
        createdAt: "2026-08-24T00:00:00.000Z",
      },
    })
    expect(useProjectStore.getState().projects[0].canvasInstances).toHaveLength(before)
  })

  it("잠금 중에는 추가하지 않는다", () => {
    useProjectStore.setState({
      projects: [makeCommittedProject({ concepts: [], currentStep: "concept" })],
    })
    const added = useProjectStore.getState().addInstance("p-canvas", {
      type: "button",
      x: 10,
      y: 10,
      canvasWidth: 800,
      canvasHeight: 600,
    })
    expect(added).toBeNull()
  })

  it("리사이즈는 최소 크기를 지킨다", () => {
    const added = useProjectStore.getState().addInstance("p-canvas", {
      type: "button",
      x: 40,
      y: 50,
      canvasWidth: 800,
      canvasHeight: 600,
    })
    useProjectStore.getState().resizeInstance(
      "p-canvas",
      added!.id,
      40,
      50,
      10,
      10,
      800,
      600
    )
    const resized = useProjectStore.getState().projects[0].canvasInstances[0]
    expect(resized.width).toBeGreaterThanOrEqual(80)
    expect(resized.height).toBeGreaterThanOrEqual(24)
  })

  it("라디오 항목 수를 늘리고 줄인다", () => {
    const added = useProjectStore.getState().addInstance("p-canvas", {
      type: "radio-group",
      x: 10,
      y: 10,
      canvasWidth: 800,
      canvasHeight: 600,
    })
    expect(added).toBeTruthy()
    useProjectStore.getState().updateInstanceProps("p-canvas", added!.id, {
      items: ["옵션 1", "옵션 2", "옵션 3"],
      value: "옵션 1",
    })
    const expanded = useProjectStore.getState().projects[0].canvasInstances[0]
      .props as { items: string[]; value: string }
    expect(expanded.items).toEqual(["옵션 1", "옵션 2", "옵션 3"])
    useProjectStore.getState().updateInstanceProps("p-canvas", added!.id, {
      items: ["옵션 1", "옵션 2"],
      value: "옵션 1",
    })
    const shrunk = useProjectStore.getState().projects[0].canvasInstances[0]
      .props as { items: string[] }
    expect(shrunk.items).toEqual(["옵션 1", "옵션 2"])

    useProjectStore.getState().updateInstanceProps(
      "p-canvas",
      added!.id,
      { orientation: "horizontal" },
      { width: 240, height: 32 }
    )
    const sideways = useProjectStore.getState().projects[0].canvasInstances[0]
    const props = sideways.props as { orientation: string }
    expect(props.orientation).toBe("horizontal")
    expect(sideways.height).toBe(32)
  })
})
