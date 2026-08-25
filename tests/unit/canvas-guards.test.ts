import { describe, expect, it } from "vitest"
import {
  canvasLockMessage,
  isCanvasEditable,
  isSafeHttpUrl,
} from "@/lib/canvas/guards"
import { makeCommittedProject } from "./canvas-fixtures"

describe("canvas guards", () => {
  it("4단계 미확정이면 편집할 수 없다", () => {
    const project = makeCommittedProject({
      concepts: [],
      palettes: [],
      wireframes: [],
      componentSets: [],
      currentStep: "concept",
    })
    expect(isCanvasEditable(project)).toBe(false)
    expect(canvasLockMessage(project)).toContain("컨셉")
  })

  it("stale이면 편집이 잠긴다", () => {
    const project = makeCommittedProject({
      concepts: [
        {
          id: "c1",
          generationId: "g1",
          title: "신뢰 대시보드",
          summary: "열 글자가 넘는 컨셉 요약입니다.",
          visualHints: ["대비"],
          status: "stale",
        },
      ],
    })
    expect(isCanvasEditable(project)).toBe(false)
    expect(canvasLockMessage(project)).toContain("오래")
  })

  it("4단계 확정이면 편집할 수 있다", () => {
    expect(isCanvasEditable(makeCommittedProject())).toBe(true)
    expect(canvasLockMessage(makeCommittedProject())).toBe("")
  })

  it("http(s)만 허용한다", () => {
    expect(isSafeHttpUrl("https://example.com/a.png")).toBe(true)
    expect(isSafeHttpUrl("http://example.com/a.png")).toBe(true)
    expect(isSafeHttpUrl("javascript:alert(1)")).toBe(false)
    expect(isSafeHttpUrl("data:image/png;base64,abc")).toBe(false)
    expect(isSafeHttpUrl("blob:https://example.com/1")).toBe(false)
  })
})
