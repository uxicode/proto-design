import { describe, expect, it } from "vitest"
import { resolveConceptMood } from "@/lib/ai/concept-mood"

describe("resolveConceptMood", () => {
  it("나이트 커맨드는 다크 네온 팔레트를 쓴다", () => {
    const mood = resolveConceptMood("핀테크 나이트 커맨드", ["다크 배경"])
    expect(mood.frame).toBe("night")
    expect(mood.colors.accent).toBe("#B8F272")
    expect(mood.colors.background).toBe("#0B0F18")
  })

  it("리테일 팝은 코랄 액센트를 쓴다", () => {
    const mood = resolveConceptMood("이커머스 리테일 팝")
    expect(mood.frame).toBe("retail")
    expect(mood.swatches[0]).toBe("#E36B5B")
  })

  it("제목이 없으면 힌트로 파스텔을 고른다", () => {
    const mood = resolveConceptMood("실험 안", ["파스텔 면", "둥근 코너"])
    expect(mood.frame).toBe("pastel")
  })
})
