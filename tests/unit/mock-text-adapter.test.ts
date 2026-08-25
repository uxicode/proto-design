import { describe, expect, it } from "vitest"
import { MockTextAdapter } from "@/lib/ai/adapters/mock-text-adapter"
import type { InputSnapshot } from "@/types/domain"

function snapshot(overrides: Partial<InputSnapshot> = {}): InputSnapshot {
  return {
    projectId: "p1",
    briefVersion: 1,
    domainKey: "fintech",
    domainLabel: "핀테크",
    keywords: ["신뢰"],
    ...overrides,
  }
}

describe("MockTextAdapter.generateWireframeSet", () => {
  it("서로 다른 레이아웃 후보를 20개 반환한다", async () => {
    const adapter = new MockTextAdapter()
    const result = await adapter.generateWireframeSet(snapshot())
    expect(result.candidates).toHaveLength(20)
    const titles = result.candidates.map((item) => item.title)
    expect(new Set(titles).size).toBe(20)
  })

  it("확정 컨셉에 가까운 레이아웃을 앞에 둔다", async () => {
    const adapter = new MockTextAdapter()
    const result = await adapter.generateWireframeSet(
      snapshot({
        committedConcept: {
          id: "c1",
          title: "핀테크 나이트 커맨드",
          summary: "어두운 캔버스와 네온 액센트로 핀테크 전문가 화면을 만듭니다.",
          visualHints: ["다크 배경", "네온 액센트", "조밀한 그리드"],
          status: "committed",
        },
      })
    )
    const top = result.candidates.slice(0, 3).map((item) => item.title).join(" ")
    expect(top).toMatch(/대시보드|사이드바|칸반/)
  })
})

describe("MockTextAdapter.generateConceptSet", () => {
  it("고정된 선명/온기/밀도 세트를 반복하지 않는다", async () => {
    const adapter = new MockTextAdapter()
    const result = await adapter.generateConceptSet(snapshot({ entropy: "seed-a" }))
    const titles = result.candidates.map((item) => item.title)
    expect(titles).toHaveLength(3)
    expect(titles).not.toEqual(["핀테크 선명", "핀테크 온기", "핀테크 밀도"])
  })

  it("엔트로피가 다르면 다른 제목 조합을 고른다", async () => {
    const adapter = new MockTextAdapter()
    const first = await adapter.generateConceptSet(snapshot({ entropy: "seed-a" }))
    const second = await adapter.generateConceptSet(snapshot({ entropy: "seed-b" }))
    expect(first.candidates.map((item) => item.title)).not.toEqual(
      second.candidates.map((item) => item.title)
    )
  })

  it("이미 나온 제목은 피한다", async () => {
    const adapter = new MockTextAdapter()
    const first = await adapter.generateConceptSet(snapshot({ entropy: "seed-a" }))
    const avoided = first.candidates.map((item) => item.title)
    const second = await adapter.generateConceptSet(
      snapshot({ entropy: "seed-a", avoidTitles: avoided })
    )
    const overlap = second.candidates.filter((item) => avoided.includes(item.title))
    expect(overlap).toHaveLength(0)
  })
})
