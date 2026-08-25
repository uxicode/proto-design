import { describe, expect, it } from "vitest"
import { renderPrototypePreview } from "@/lib/ai/prototype-preview"
import type { InputSnapshot } from "@/types/domain"

function snapshot(overrides: Partial<InputSnapshot> = {}): InputSnapshot {
  return {
    projectId: "p1",
    briefVersion: 1,
    domainKey: "fintech",
    domainLabel: "핀테크",
    keywords: ["신뢰", "대시보드"],
    committedConcept: {
      id: "c1",
      title: "나이트 커맨드",
      summary: "어두운 캔버스와 네온 액센트로 전문가 화면을 만듭니다.",
      visualHints: ["다크 배경", "네온 액센트"],
      status: "committed",
    },
    committedPalette: {
      id: "pal1",
      name: "미드나잇 라임",
      swatches: [
        { role: "primary", hex: "#121826" },
        { role: "secondary", hex: "#3A4660" },
        { role: "background", hex: "#0B0F18" },
        { role: "text", hex: "#E8EDF7" },
        { role: "accent", hex: "#B8F272" },
      ],
      status: "committed",
    },
    committedWireframe: {
      id: "w1",
      title: "홈 사이드바 앱",
      structureNotes: "좌측 내비와 본문 리스트.",
      blocks: [
        { id: "nav", role: "nav", notes: "상단" },
        { id: "sidebar", role: "sidebar", notes: "섹션" },
        { id: "list", role: "list", notes: "리스트" },
        { id: "content", role: "content", notes: "상세" },
      ],
      status: "committed",
    },
    committedComponentSet: {
      id: "cs1",
      title: "나이트 커맨드 컴팩트",
      items: [
        { role: "button", variant: "compact", notes: "툴바" },
        { role: "input", variant: "dense", notes: "밀도" },
        { role: "card", variant: "table-row", notes: "행" },
        { role: "navigation", variant: "icon-rail", notes: "레일" },
      ],
      status: "committed",
    },
    ...overrides,
  }
}

describe("renderPrototypePreview", () => {
  it("스톡 사진 경로가 아니라 합성 UI SVG를 반환한다", () => {
    const preview = renderPrototypePreview(snapshot())
    expect(preview.dataUrl.startsWith("data:image/svg+xml")).toBe(true)
    expect(preview.dataUrl.startsWith("/stock/")).toBe(false)
    const svg = decodeURIComponent(preview.dataUrl)
    expect(svg).toContain("나이트 커맨드")
    expect(svg).toContain("#121826")
    expect(svg).toContain("#B8F272")
    expect(svg).toContain("신뢰")
  })

  it("사이드바 와이어면 앱 셸을 그린다", () => {
    const svg = decodeURIComponent(renderPrototypePreview(snapshot()).dataUrl)
    expect(svg).toContain("활성")
    expect(svg).toContain("상세")
  })
})
