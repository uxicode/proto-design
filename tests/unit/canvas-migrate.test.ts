import { describe, expect, it } from "vitest"
import { migratePersistedState, sanitizeCanvasInstances } from "@/lib/canvas/migrate"

describe("canvas migrate", () => {
  it("필드가 없으면 빈 배열이다", () => {
    const next = migratePersistedState({
      projects: [{ id: "p1", name: "구 프로젝트" }],
      onboardingCompleted: true,
    })
    expect(next.projects[0]).toMatchObject({
      id: "p1",
      canvasInstances: [],
    })
    expect(next.onboardingCompleted).toBe(true)
  })

  it("손상된 인스턴스는 버리고 나머지는 살린다", () => {
    const instances = sanitizeCanvasInstances([
      {
        id: "ok",
        type: "button",
        x: 1,
        y: 2,
        width: 136,
        height: 40,
        zIndex: 1,
        props: { label: "버튼", variant: "default", size: "default", disabled: false },
      },
      { id: "bad" },
      null,
    ])
    expect(instances).toHaveLength(1)
    expect(instances[0].id).toBe("ok")
  })

  it("배열이 아니면 빈 배열이다", () => {
    expect(sanitizeCanvasInstances({ foo: 1 })).toEqual([])
  })
})
