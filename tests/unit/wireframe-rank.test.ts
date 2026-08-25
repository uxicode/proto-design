import { describe, expect, it } from "vitest"
import {
  rankWireframesByConceptFit,
  WIREFRAME_LAYOUT_IDS,
  type WireframeLayoutId,
} from "@/lib/generation/wireframe-rank"
import type { InputSnapshot } from "@/types/domain"

function snapshot(overrides: Partial<InputSnapshot> = {}): InputSnapshot {
  return {
    projectId: "p1",
    briefVersion: 1,
    domainKey: "fintech",
    domainLabel: "핀테크",
    keywords: ["신뢰"],
    entropy: "stable-seed",
    ...overrides,
  }
}

function rankIds(input: InputSnapshot): WireframeLayoutId[] {
  return rankWireframesByConceptFit(
    WIREFRAME_LAYOUT_IDS.map((layoutId) => ({ layoutId })),
    input,
    (item) => item.layoutId
  ).map((item) => item.layoutId)
}

describe("rankWireframesByConceptFit", () => {
  it("나이트 커맨드 컨셉은 대시보드·앱 레이아웃을 앞에 둔다", () => {
    const ids = rankIds(
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
    expect(ids.slice(0, 3)).toEqual(expect.arrayContaining(["dashboard", "app"]))
    expect(ids.indexOf("dashboard")).toBeLessThan(ids.indexOf("gallery"))
  })

  it("리테일 팝 + 이커머스는 갤러리·체크아웃을 앞에 둔다", () => {
    const ids = rankIds(
      snapshot({
        domainKey: "ecommerce",
        domainLabel: "이커머스",
        keywords: ["상품"],
        committedConcept: {
          id: "c1",
          title: "이커머스 리테일 팝",
          summary: "큰 상품 컷과 배지로 이커머스를 매장처럼 구성합니다.",
          visualHints: ["히어로 컷", "세일 배지", "그리드 상품"],
          status: "committed",
        },
      })
    )
    expect(ids.slice(0, 4)).toEqual(expect.arrayContaining(["gallery", "checkout"]))
    expect(ids.indexOf("gallery")).toBeLessThan(ids.indexOf("inbox"))
  })

  it("예약 키워드는 캘린더를 위로 올린다", () => {
    const ids = rankIds(
      snapshot({
        domainKey: "healthcare",
        domainLabel: "헬스케어",
        keywords: ["예약"],
      })
    )
    expect(ids[0]).toBe("calendar")
  })
})
