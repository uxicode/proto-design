import { describe, expect, it } from "vitest"
import { generateNestedInstanceJsx, generateSlotJsx } from "@/lib/canvas/codegen"
import { sanitizeCanvasInstance } from "@/lib/canvas/migrate"
import { sanitizeCanvasSlots, slotHasExplicitSize, slotOverrideStyle } from "@/lib/canvas/slots"
import type { CanvasInstance } from "@/types/domain"

const button: CanvasInstance = {
  id: "i1",
  type: "button",
  x: 8,
  y: 8,
  width: 136,
  height: 40,
  zIndex: 1,
  parentSlotId: "header",
  props: {
    label: "가입",
    variant: "default",
    size: "sm",
    disabled: false,
  },
}

describe("canvas slots", () => {
  it("parentSlotId를 보존한다", () => {
    const next = sanitizeCanvasInstance({
      ...button,
      props: button.props,
    })
    expect(next?.parentSlotId).toBe("header")
  })

  it("슬롯 좌표를 살린다", () => {
    const slots = sanitizeCanvasSlots({
      header: { x: 10, y: 4, width: 320, height: 56 },
      bad: { x: "no" },
    })
    expect(slots.header).toEqual({ x: 10, y: 4, width: 320, height: 56 })
  })

  it("영역에 중첩된 JSX를 만든다", () => {
    const jsx = generateNestedInstanceJsx(button, "header", "헤더")
    expect(jsx).toContain('data-slot="header"')
    expect(jsx).toContain('aria-label="헤더"')
    expect(jsx).toContain("가입")
    expect(jsx).toContain('from "@/components/ui/button"')
  })

  it("빈 영역은 주석 자리를 둔다", () => {
    const jsx = generateSlotJsx("hero", "히어로", [])
    expect(jsx).toContain("이 영역에 컴포넌트를 드롭하세요")
  })

  it("작은 개별 컴포넌트 크기도 살린다", () => {
    const slots = sanitizeCanvasSlots({
      "header-cta": { x: 2, y: 0, width: 16, height: 16 },
    })
    expect(slots["header-cta"]).toEqual({ x: 2, y: 0, width: 16, height: 16 })
  })

  it("슬롯 크기 오버라이드는 min/max로 고정한다", () => {
    const style = slotOverrideStyle({ x: 8, y: 4, width: 240, height: 180 })
    expect(style.width).toBe(240)
    expect(style.minWidth).toBe(240)
    expect(style.maxWidth).toBe(240)
    expect(style.height).toBe(180)
    expect(style.minHeight).toBe(180)
    expect(style.maxHeight).toBe(180)
    expect(style.justifySelf).toBe("start")
    expect(style.alignSelf).toBe("start")
    expect(slotHasExplicitSize({ width: 240, height: 180 })).toBe(true)
    expect(slotHasExplicitSize({ width: null, height: null })).toBe(false)
  })
})
