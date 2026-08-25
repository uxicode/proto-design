import { describe, expect, it } from "vitest"
import { renderComponentPreview } from "@/lib/ai/component-preview"

describe("renderComponentPreview", () => {
  it("컨셉 사진 경로가 아니라 UI 키트 SVG를 반환한다", () => {
    const preview = renderComponentPreview({
      title: "솔리드 키트",
      prompt: "UI kit preview of solid buttons",
      slot: 0,
      items: [
        { role: "button", variant: "filled", notes: "단색 채움" },
        { role: "input", variant: "underline", notes: "하단 보더" },
        { role: "card", variant: "elevated", notes: "카드" },
        { role: "navigation", variant: "horizontal", notes: "내비" },
      ],
    })
    expect(preview.dataUrl.startsWith("data:image/svg+xml")).toBe(true)
    expect(preview.dataUrl.includes("/stock/")).toBe(false)
    const svg = decodeURIComponent(preview.dataUrl)
    expect(svg).toContain("BUTTON")
    expect(svg).toContain("INPUT")
    expect(svg).toContain("CARD")
  })

  it("소프트 키트는 필 형태를 쓴다", () => {
    const preview = renderComponentPreview({
      title: "소프트",
      prompt: "pill buttons",
      slot: 1,
    })
    const svg = decodeURIComponent(preview.dataUrl)
    expect(svg).toContain("소프트")
  })
})
