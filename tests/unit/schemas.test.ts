import { describe, expect, it } from "vitest"
import {
  componentSetSchema,
  conceptSetSchema,
  paletteSetSchema,
  wireframeSetSchema,
} from "@/lib/generation/schemas"

describe("generation schemas", () => {
  it("후보가 3개 미만이면 실패한다", () => {
    const result = conceptSetSchema.safeParse({
      candidates: [
        {
          title: "짧음",
          summary: "열 글자가 넘는 설명입니다.",
          visualHints: ["a"],
          moodPrompt: "mood",
        },
      ],
    })
    expect(result.success).toBe(false)
  })

  it("잘못된 hex는 팔레트를 거절한다", () => {
    const result = paletteSetSchema.safeParse({
      candidates: Array.from({ length: 3 }, (_, index) => ({
        name: `p${index}`,
        swatches: [
          { role: "primary", hex: "blue" },
          { role: "secondary", hex: "#123456" },
          { role: "background", hex: "#123456" },
          { role: "text", hex: "#123456" },
          { role: "accent", hex: "#123456" },
        ],
      })),
    })
    expect(result.success).toBe(false)
  })

  it("와이어프레임 후보가 20개가 아니면 실패한다", () => {
    const result = wireframeSetSchema.safeParse({
      candidates: Array.from({ length: 3 }, (_, index) => ({
        title: `w${index}`,
        structureNotes: "구조 설명입니다.",
        layoutPrompt: "layout",
        blocks: [
          { id: "nav", role: "nav", notes: "내비" },
          { id: "hero", role: "hero", notes: "히어로" },
          { id: "footer", role: "footer", notes: "푸터" },
        ],
      })),
    })
    expect(result.success).toBe(false)
  })

  it("필수 컴포넌트 역할이 없으면 실패한다", () => {
    const result = componentSetSchema.safeParse({
      candidates: Array.from({ length: 3 }, (_, index) => ({
        title: `c${index}`,
        previewPrompt: "preview",
        items: [
          { role: "button", variant: "a", notes: "n" },
          { role: "input", variant: "a", notes: "n" },
          { role: "card", variant: "a", notes: "n" },
          { role: "badge", variant: "a", notes: "n" },
        ],
      })),
    })
    expect(result.success).toBe(false)
  })
})
